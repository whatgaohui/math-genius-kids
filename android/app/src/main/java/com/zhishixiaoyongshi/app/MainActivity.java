package com.zhishixiaoyongshi.app;

import android.annotation.SuppressLint;
import android.content.Intent;
import android.content.pm.ActivityInfo;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import android.util.Log;
import android.view.KeyEvent;
import android.view.View;
import android.view.WindowManager;
import android.webkit.ConsoleMessage;
import android.webkit.JavascriptInterface;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;

import androidx.appcompat.app.AppCompatActivity;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import java.util.HashMap;
import java.util.List;
import java.util.Locale;

/**
 * Main Activity: WebView wrapper with native TTS bridge.
 *
 * Key design decisions:
 * - Uses plain WebView (not Capacitor) for minimal complexity
 * - Native TTS via addJavascriptInterface (WebView doesn't support speechSynthesis)
 * - mediaPlaybackRequiresUserGesture=false for sound effects
 * - No splash screen dependency (was causing crashes on Android 12+)
 */
public class MainActivity extends AppCompatActivity implements TextToSpeech.OnInitListener {

    private static final String TAG = "知识小勇士";

    private WebView webView;
    private TextToSpeech tts;
    private boolean ttsReady = false;

    // ── Lifecycle ───────────────────────────────────────────

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Full immersive experience
        setupImmersiveMode();

        // Lock to portrait
        try {
            setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);
        } catch (Exception e) {
            Log.w(TAG, "Cannot lock orientation", e);
        }

        // Initialize native TTS
        try {
            tts = new TextToSpeech(this, this);
        } catch (Exception e) {
            Log.e(TAG, "Failed to init TTS", e);
        }

        // Create WebView
        FrameLayout layout = new FrameLayout(this);
        webView = new WebView(this);
        layout.addView(webView, new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT));
        setContentView(layout);

        configureWebView();
    }

    private void setupImmersiveMode() {
        // Make the app draw behind system bars for full-screen experience
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);

        // Hide status bar and navigation bar
        WindowInsetsControllerCompat controller = WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        if (controller != null) {
            controller.hide(WindowInsetsCompat.Type.systemBars());
            controller.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
        }

        // Keep screen on
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
    }

    @SuppressLint("SetJavaScriptEnabled")
    private void configureWebView() {
        WebSettings settings = webView.getSettings();

        // ── JavaScript ──────────────────────────────────────
        settings.setJavaScriptEnabled(true);
        settings.setJavaScriptCanOpenWindowsAutomatically(false);

        // ── Media & Audio ───────────────────────────────────
        // CRITICAL: Allow media autoplay without user gesture
        settings.setMediaPlaybackRequiresUserGesture(false);

        // ── DOM Storage ─────────────────────────────────────
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);

        // ── File Access (for file:// URLs) ──────────────────
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setAllowFileAccessFromFileURLs(true);
        settings.setAllowUniversalAccessFromFileURLs(true);

        // ── Caching ─────────────────────────────────────────
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setDomStorageEnabled(true);

        // ── Display ─────────────────────────────────────────
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(true);
        settings.setSupportZoom(false);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);

        // ── Native TTS Bridge ───────────────────────────────
        webView.addJavascriptInterface(new TtsJsBridge(), "AndroidTTS");

        // ── WebViewClient ───────────────────────────────────
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                Log.i(TAG, "Page loaded: " + url);
                // Inject speechSynthesis polyfill AFTER page loads
                view.evaluateJavascript(SPEECH_POLYFILL, null);
                // Inject again after delay for dynamic content
                view.postDelayed(() -> {
                    if (view != null) {
                        view.evaluateJavascript(SPEECH_POLYFILL, null);
                    }
                }, 1000);
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                String url = request.getUrl().toString();
                // Only load local files in WebView; open everything else in browser
                if (url.startsWith("file://") || url.contains("androidplatform.net")) {
                    return false;
                }
                try {
                    startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url)));
                } catch (Exception e) {
                    Log.w(TAG, "Cannot open URL: " + url, e);
                }
                return true;
            }

            @Override
            public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
                Log.e(TAG, "WebView error " + errorCode + ": " + description + " at " + failingUrl);
            }
        });

        // ── WebChromeClient ─────────────────────────────────
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(PermissionRequest request) {
                runOnUiThread(() -> {
                    try {
                        request.grant(request.getResources());
                    } catch (Exception e) {
                        Log.w(TAG, "Permission grant failed", e);
                    }
                });
            }

            @Override
            public boolean onConsoleMessage(ConsoleMessage consoleMessage) {
                Log.d("WebView", consoleMessage.message() + " -- line "
                        + consoleMessage.lineNumber() + " of "
                        + consoleMessage.sourceId());
                return true;
            }
        });

        // ── Load web app ────────────────────────────────────
        String url = "file:///android_asset/public/index.html";
        Log.i(TAG, "Loading: " + url);
        webView.loadUrl(url);
    }

    // ── TTS Init Callback ───────────────────────────────────

    @Override
    public void onInit(int status) {
        if (status == TextToSpeech.SUCCESS && tts != null) {
            int result = tts.setLanguage(Locale.SIMPLIFIED_CHINESE);
            ttsReady = true;

            if (result == TextToSpeech.LANG_MISSING_DATA || result == TextToSpeech.LANG_NOT_SUPPORTED) {
                Log.w(TAG, "Chinese TTS not available, trying English");
                tts.setLanguage(Locale.US);
            }

            // Log available engines
            try {
                List<TextToSpeech.EngineInfo> engines = tts.getEngines();
                for (TextToSpeech.EngineInfo engine : engines) {
                    Log.i(TAG, "TTS Engine: " + engine.name + " - " + engine.label);
                }
            } catch (Exception e) {
                Log.w(TAG, "Cannot list TTS engines", e);
            }

            // Notify WebView
            if (webView != null) {
                webView.post(() -> {
                    try {
                        webView.evaluateJavascript(
                                "window._nativeTTSReady=true;if(window._onNativeTTSReady)window._onNativeTTSReady();",
                                null);
                    } catch (Exception e) {
                        Log.w(TAG, "Cannot notify WebView about TTS", e);
                    }
                });
            }

            Log.i(TAG, "TTS initialized successfully");
        } else {
            ttsReady = false;
            Log.e(TAG, "TTS initialization failed (status=" + status + ")");
        }
    }

    // ── Back button ─────────────────────────────────────────

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if (keyCode == KeyEvent.KEYCODE_BACK && webView != null && webView.canGoBack()) {
            webView.goBack();
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }

    // ── Lifecycle ───────────────────────────────────────────

    @Override
    protected void onDestroy() {
        if (webView != null) {
            webView.stopLoading();
            webView.setWebViewClient(null);
            webView.setWebChromeClient(null);
            webView.destroy();
            webView = null;
        }
        if (tts != null) {
            try {
                tts.stop();
                tts.shutdown();
            } catch (Exception e) {
                Log.w(TAG, "TTS shutdown error", e);
            }
            tts = null;
        }
        super.onDestroy();
    }

    @Override
    protected void onPause() {
        if (webView != null) webView.onPause();
        super.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (webView != null) webView.onResume();
    }

    // ── Native TTS Bridge ───────────────────────────────────

    private class TtsJsBridge {
        @JavascriptInterface
        public void speak(String text, String lang, float rate, float pitch, int callbackId) {
            if (!ttsReady || tts == null) {
                notifyJs(callbackId, "error", "TTS not ready");
                return;
            }

            try {
                // Set language
                Locale locale;
                if (lang != null && lang.startsWith("zh")) {
                    locale = Locale.SIMPLIFIED_CHINESE;
                } else if (lang != null && lang.startsWith("en")) {
                    locale = Locale.US;
                } else {
                    locale = Locale.SIMPLIFIED_CHINESE;
                }
                int langResult = tts.setLanguage(locale);
                if (langResult == TextToSpeech.LANG_MISSING_DATA || langResult == TextToSpeech.LANG_NOT_SUPPORTED) {
                    Log.w(TAG, "Language not supported: " + lang + ", falling back");
                    tts.setLanguage(Locale.getDefault());
                }

                // Set rate and pitch
                tts.setSpeechRate(Math.max(0.5f, Math.min(2.0f, rate)));
                tts.setPitch(Math.max(0.5f, Math.min(2.0f, pitch)));

                // Progress listener
                String utteranceId = "utt_" + callbackId;
                tts.setOnUtteranceProgressListener(new UtteranceProgressListener() {
                    @Override
                    public void onStart(String id) { /* speaking started */ }

                    @Override
                    public void onDone(String id) {
                        notifyJs(callbackId, "end", "");
                    }

                    @Override
                    public void onError(String id) {
                        notifyJs(callbackId, "error", "TTS playback error");
                    }
                });

                // Speak
                HashMap<String, String> params = new HashMap<>();
                params.put(TextToSpeech.Engine.KEY_PARAM_UTTERANCE_ID, utteranceId);
                int speakResult = tts.speak(text, TextToSpeech.QUEUE_FLUSH, params);

                if (speakResult == TextToSpeech.ERROR) {
                    notifyJs(callbackId, "error", "tts.speak() returned ERROR");
                }
            } catch (Exception e) {
                Log.e(TAG, "TTS speak exception", e);
                notifyJs(callbackId, "error", e.getMessage());
            }
        }

        @JavascriptInterface
        public void stop() {
            if (tts != null) {
                try { tts.stop(); } catch (Exception e) { Log.w(TAG, "TTS stop error", e); }
            }
        }

        @JavascriptInterface
        public boolean isAvailable() {
            return ttsReady;
        }

        @JavascriptInterface
        public String getEngines() {
            if (tts == null) return "[]";
            try {
                List<TextToSpeech.EngineInfo> engines = tts.getEngines();
                StringBuilder sb = new StringBuilder("[");
                for (int i = 0; i < engines.size(); i++) {
                    if (i > 0) sb.append(",");
                    sb.append("\"").append(engines.get(i).name).append("\"");
                }
                sb.append("]");
                return sb.toString();
            } catch (Exception e) {
                return "[]";
            }
        }
    }

    private void notifyJs(int callbackId, String type, String msg) {
        if (webView == null) return;
        String escapedMsg = (msg != null) ? msg.replace("'", "\\'") : "";
        webView.post(() -> {
            try {
                webView.evaluateJavascript(
                        "if(window._ttsCallbacks&&window._ttsCallbacks[" + callbackId + "])" +
                                "{window._ttsCallbacks[" + callbackId + "]('" + type + "','" + escapedMsg + "');" +
                                "delete window._ttsCallbacks[" + callbackId + "];}", null);
            } catch (Exception e) {
                Log.w(TAG, "notifyJs failed", e);
            }
        });
    }

    // ── speechSynthesis Polyfill ────────────────────────────
    // Injected into WebView to make window.speechSynthesis work via native bridge.
    // WebView does NOT support speechSynthesis natively (Chromium bug #40417848).

    private static final String SPEECH_POLYFILL =
            "(function(){" +
            "if(window._speechPolyfillInstalled)return;" +
            "window._speechPolyfillInstalled=true;" +
            "window._ttsCallbacks={};" +
            "window._ttsCallbackCounter=0;" +
            "window._nativeTTSReady=false;" +
            "var zv={voiceURI:'Android-TTS-zh-CN',name:'Android Chinese',lang:'zh-CN',localService:true,default:true};" +
            "var ev={voiceURI:'Android-TTS-en-US',name:'Android English',lang:'en-US',localService:true,default:false};" +
            "var vl=[zv,ev];" +
            "window.SpeechSynthesisUtterance=function(t){" +
            "this.text=t||'';this.lang='zh-CN';this.voice=null;" +
            "this.volume=1;this.rate=1;this.pitch=1;" +
            "this.onstart=null;this.onend=null;this.onerror=null;" +
            "};" +
            "window.speechSynthesis={" +
            "pending:false,speaking:false,paused:false," +
            "speak:function(u){" +
            "if(!u||!u.text)return;" +
            "this.cancel();" +
            "this.speaking=true;this.pending=false;" +
            "if(u.onstart)setTimeout(function(){u.onstart();},10);" +
            "var cb=++window._ttsCallbackCounter;" +
            "window._ttsCallbacks[cb]=function(t,m){" +
            "if(t==='end'){window.speechSynthesis.speaking=false;if(u.onend)u.onend();}" +
            "else if(t==='error'){window.speechSynthesis.speaking=false;if(u.onerror)u.onerror({error:m||'TTS error'});}" +
            "};" +
            "if(typeof AndroidTTS!=='undefined'){" +
            "try{AndroidTTS.speak(u.text,u.lang||'zh-CN',u.rate||1,u.pitch||1,cb);}" +
            "catch(e){window.speechSynthesis.speaking=false;if(u.onerror)u.onerror({error:e.message});delete window._ttsCallbacks[cb];}" +
            "}else{window.speechSynthesis.speaking=false;if(u.onerror)u.onerror({error:'TTS not available'});delete window._ttsCallbacks[cb];}" +
            "}," +
            "cancel:function(){" +
            "if(typeof AndroidTTS!=='undefined'){try{AndroidTTS.stop();}catch(e){}}" +
            "this.speaking=false;this.pending=false;this.paused=false;" +
            "}," +
            "pause:function(){this.paused=true;}," +
            "resume:function(){this.paused=false;}," +
            "getVoices:function(){return vl.slice();}," +
            "addEventListener:function(t,l){if(t==='voiceschanged'&&l)setTimeout(l,100);}," +
            "removeEventListener:function(){}" +
            "};" +
            "console.log('[Polyfill] speechSynthesis installed, native:'+(typeof AndroidTTS!=='undefined'?'YES':'NO'));" +
            "})();";
}
