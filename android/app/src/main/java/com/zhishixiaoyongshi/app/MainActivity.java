package com.zhishixiaoyongshi.app;

import android.annotation.SuppressLint;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import android.webkit.ConsoleMessage;
import android.webkit.JavascriptInterface;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;

/**
 * Main Activity that wraps the web app in a WebView with:
 * 1. Native TTS bridge (Android TextToSpeech) - because WebView doesn't support speechSynthesis
 * 2. Proper audio configuration - mediaPlaybackRequiresUserGesture = false
 * 3. Full WebView settings for modern web app compatibility
 * 4. speechSynthesis polyfill injected via JavaScript
 */
public class MainActivity extends AppCompatActivity implements TextToSpeech.OnInitListener {

    private WebView webView;
    private TextToSpeech tts;
    private boolean ttsReady = false;
    private int ttsCallbackId = 0;

    // Queue for TTS utterance callbacks
    private final HashMap<String, String> utteranceCallbacks = new HashMap<>();

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Initialize native TTS engine
        tts = new TextToSpeech(this, this);

        // Create WebView
        webView = new WebView(this);
        setContentView(webView);

        configureWebView();
    }

    @SuppressLint("SetJavaScriptEnabled")
    private void configureWebView() {
        WebSettings settings = webView.getSettings();

        // ── JavaScript ──────────────────────────────────────
        settings.setJavaScriptEnabled(true);

        // ── Media & Audio ───────────────────────────────────
        // CRITICAL: Allow media autoplay without user gesture
        // This makes AudioContext and HTML5 Audio work without requiring a tap first
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

        // ── Display ─────────────────────────────────────────
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(true);
        settings.setSupportZoom(false);

        // ── Native TTS Bridge ───────────────────────────────
        webView.addJavascriptInterface(new TtsJsBridge(), "AndroidTTS");

        // ── WebViewClient (page lifecycle) ──────────────────
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                // Inject speechSynthesis polyfill AFTER page loads
                // This makes window.speechSynthesis available to the web app
                view.evaluateJavascript(SPEECH_POLYFILL, null);
                // Inject a second time after a short delay (for dynamic content)
                view.postDelayed(() -> view.evaluateJavascript(SPEECH_POLYFILL, null), 500);
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                String url = request.getUrl().toString();
                // Open external URLs in browser
                if (!url.startsWith("file://") && !url.contains("androidplatform.net")) {
                    try {
                        startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url)));
                        return true;
                    } catch (Exception e) {
                        return false;
                    }
                }
                return false;
            }
        });

        // ── WebChromeClient (permissions, console, alerts) ──
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(PermissionRequest request) {
                // Auto-grant all permissions (audio, video, etc.)
                runOnUiThread(() -> request.grant(request.getResources()));
            }

            @Override
            public boolean onConsoleMessage(ConsoleMessage consoleMessage) {
                // Log WebView console messages for debugging
                android.util.Log.d("WebView", consoleMessage.message() + " -- From line "
                        + consoleMessage.lineNumber() + " of "
                        + consoleMessage.sourceId());
                return true;
            }
        });

        // Load the web app from assets
        webView.loadUrl("file:///android_asset/public/index.html");
    }

    // ── Native TTS Bridge class ─────────────────────────────
    private class TtsJsBridge {
        @JavascriptInterface
        public void speak(String text, String lang, float rate, float pitch, int callbackId) {
            if (!ttsReady || tts == null) {
                // TTS not ready, notify JS immediately
                webView.post(() -> {
                    webView.evaluateJavascript(
                            "if(window._ttsCallbacks && window._ttsCallbacks[" + callbackId + "])" +
                                    "{window._ttsCallbacks[" + callbackId + "]('error','TTS not ready');delete window._ttsCallbacks[" + callbackId + "];}", null);
                });
                return;
            }

            // Set language
            Locale locale;
            if (lang != null && lang.startsWith("zh")) {
                locale = Locale.SIMPLIFIED_CHINESE;
            } else if (lang != null && lang.startsWith("en")) {
                locale = Locale.US;
            } else {
                locale = Locale.SIMPLIFIED_CHINESE;
            }
            tts.setLanguage(locale);

            // Set speech rate (0.5 to 2.0, default 1.0)
            // Android TTS rate is different from Web Speech rate
            // Web Speech: 0.1-10, default 1.0
            // Android: 0.5-4.0, default 1.0
            float androidRate = Math.max(0.5f, Math.min(2.0f, rate));
            tts.setSpeechRate(androidRate);

            // Set pitch (0.5 to 2.0, default 1.0)
            float androidPitch = Math.max(0.5f, Math.min(2.0f, pitch));
            tts.setPitch(androidPitch);

            // Unique utterance ID for callback tracking
            String utteranceId = "tts_" + callbackId;

            // Set up progress listener for this utterance
            tts.setOnUtteranceProgressListener(new UtteranceProgressListener() {
                @Override
                public void onStart(String utteranceId) {
                    // Speech started
                }

                @Override
                public void onDone(String id) {
                    // Speech completed - notify JS
                    runOnUiThread(() -> {
                        webView.evaluateJavascript(
                                "if(window._ttsCallbacks && window._ttsCallbacks[" + callbackId + "])" +
                                        "{window._ttsCallbacks[" + callbackId + "]('end','');delete window._ttsCallbacks[" + callbackId + "];}", null);
                    });
                }

                @Override
                public void onError(String id) {
                    // Speech error - notify JS
                    runOnUiThread(() -> {
                        webView.evaluateJavascript(
                                "if(window._ttsCallbacks && window._ttsCallbacks[" + callbackId + "])" +
                                        "{window._ttsCallbacks[" + callbackId + "]('error','TTS playback error');delete window._ttsCallbacks[" + callbackId + "];}", null);
                    });
                }
            });

            // Speak the text
            HashMap<String, String> params = new HashMap<>();
            params.put(TextToSpeech.Engine.KEY_PARAM_UTTERANCE_ID, utteranceId);
            tts.speak(text, TextToSpeech.QUEUE_FLUSH, params);
        }

        @JavascriptInterface
        public void stop() {
            if (tts != null) {
                tts.stop();
            }
        }

        @JavascriptInterface
        public boolean isAvailable() {
            return ttsReady;
        }

        @JavascriptInterface
        public String getEngines() {
            if (tts == null) return "[]";
            List<android.speech.tts.TextToSpeech.EngineInfo> engines = tts.getEngines();
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < engines.size(); i++) {
                if (i > 0) sb.append(",");
                sb.append("\"").append(engines.get(i).name).append("\"");
            }
            sb.append("]");
            return sb.toString();
        }
    }

    // ── TTS Initialization callback ─────────────────────────
    @Override
    public void onInit(int status) {
        if (status == TextToSpeech.SUCCESS) {
            // Default to Chinese
            int result = tts.setLanguage(Locale.SIMPLIFIED_CHINESE);
            ttsReady = true;

            // Check if Chinese language is supported
            if (result == TextToSpeech.LANG_MISSING_DATA || result == TextToSpeech.LANG_NOT_SUPPORTED) {
                // Fall back to English if Chinese not available
                tts.setLanguage(Locale.US);
                runOnUiThread(() ->
                        Toast.makeText(this, "中文语音未安装，将使用英文语音。建议安装Google文字转语音引擎。", Toast.LENGTH_LONG).show()
                );
            }

            // Log available TTS engines for debugging
            List<android.speech.tts.TextToSpeech.EngineInfo> engines = tts.getEngines();
            for (android.speech.tts.TextToSpeech.EngineInfo engine : engines) {
                android.util.Log.d("TTS", "Engine: " + engine.name + " - " + engine.label);
            }

            // Notify the WebView that TTS is ready
            if (webView != null) {
                webView.post(() -> {
                    webView.evaluateJavascript(
                            "window._nativeTTSReady = true; if(window._onNativeTTSReady) window._onNativeTTSReady();", null);
                });
            }
        } else {
            ttsReady = false;
            runOnUiThread(() ->
                    Toast.makeText(this, "语音引擎初始化失败，听力功能不可用", Toast.LENGTH_LONG).show()
            );
        }
    }

    // ── Back button handling ────────────────────────────────
    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }

    // ── Lifecycle ───────────────────────────────────────────
    @Override
    protected void onDestroy() {
        if (webView != null) {
            webView.destroy();
        }
        if (tts != null) {
            tts.stop();
            tts.shutdown();
        }
        super.onDestroy();
    }

    @Override
    protected void onPause() {
        if (webView != null) {
            webView.onPause();
        }
        super.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (webView != null) {
            webView.onResume();
        }
    }

    // ── speechSynthesis Polyfill ────────────────────────────
    // This JavaScript is injected into the WebView to provide a speechSynthesis
    // API that routes to the native Android TTS engine via AndroidTTS JavascriptInterface.
    //
    // The polyfill creates:
    // - window.speechSynthesis with speak(), cancel(), getVoices()
    // - window.SpeechSynthesisUtterance constructor
    // - Callback handling via window._ttsCallbacks
    //
    private static final String SPEECH_POLYFILL = """
(function() {
    // Only install polyfill once
    if (window._speechPolyfillInstalled) return;
    window._speechPolyfillInstalled = true;

    // Callback storage
    window._ttsCallbacks = {};
    window._ttsCallbackCounter = 0;
    window._nativeTTSReady = false;

    // Voice list (simulated for API compatibility)
    var chineseVoice = {
        voiceURI: 'Android-TTS-zh-CN',
        name: 'Android Chinese (Simplified)',
        lang: 'zh-CN',
        localService: true,
        default: true
    };
    var englishVoice = {
        voiceURI: 'Android-TTS-en-US',
        name: 'Android English (US)',
        lang: 'en-US',
        localService: true,
        default: false
    };
    var _voices = [chineseVoice, englishVoice];

    // SpeechSynthesisUtterance constructor
    window.SpeechSynthesisUtterance = function(text) {
        this.text = text || '';
        this.lang = 'zh-CN';
        this.voice = null;
        this.volume = 1;
        this.rate = 1;
        this.pitch = 1;
        this.onstart = null;
        this.onend = null;
        this.onerror = null;
        this.onpause = null;
        this.onresume = null;
        this.onmark = null;
        this.onboundary = null;
    };

    // SpeechSynthesisVoice constructor (for completeness)
    window.SpeechSynthesisVoice = function() {
        this.voiceURI = '';
        this.name = '';
        this.lang = '';
        this.localService = true;
        this.default = false;
    };

    // speechSynthesis object
    window.speechSynthesis = {
        pending: false,
        speaking: false,
        paused: false,

        speak: function(utterance) {
            if (!utterance || !utterance.text) return;

            // Cancel any current speech
            this.cancel();

            this.speaking = true;
            this.pending = false;

            // Fire onstart
            if (utterance.onstart) {
                setTimeout(function() { utterance.onstart(); }, 10);
            }

            // Register callback
            var callbackId = ++window._ttsCallbackCounter;
            window._ttsCallbacks[callbackId] = function(type, msg) {
                if (type === 'end') {
                    window.speechSynthesis.speaking = false;
                    if (utterance.onend) utterance.onend();
                } else if (type === 'error') {
                    window.speechSynthesis.speaking = false;
                    if (utterance.onerror) utterance.onerror({error: msg || 'TTS error'});
                }
            };

            // Call native TTS bridge
            var lang = utterance.lang || 'zh-CN';
            var rate = utterance.rate || 1.0;
            var pitch = utterance.pitch || 1.0;

            if (typeof AndroidTTS !== 'undefined') {
                try {
                    AndroidTTS.speak(utterance.text, lang, rate, pitch, callbackId);
                } catch(e) {
                    window.speechSynthesis.speaking = false;
                    if (utterance.onerror) utterance.onerror({error: e.message});
                    delete window._ttsCallbacks[callbackId];
                }
            } else {
                // No native bridge available
                window.speechSynthesis.speaking = false;
                if (utterance.onerror) utterance.onerror({error: 'TTS not available'});
                delete window._ttsCallbacks[callbackId];
            }
        },

        cancel: function() {
            if (typeof AndroidTTS !== 'undefined') {
                try { AndroidTTS.stop(); } catch(e) {}
            }
            this.speaking = false;
            this.pending = false;
            this.paused = false;
        },

        pause: function() {
            // Not supported by Android TTS, just mark as paused
            this.paused = true;
        },

        resume: function() {
            this.paused = false;
        },

        getVoices: function() {
            return _voices.slice();
        },

        addEventListener: function(type, listener) {
            // Minimal event support for voiceschanged
            if (type === 'voiceschanged') {
                // Fire immediately since voices are static
                setTimeout(function() { if (listener) listener(); }, 100);
            }
        },

        removeEventListener: function() {}
    };

    console.log('[TTS Polyfill] speechSynthesis polyfill installed, native bridge: ' + (typeof AndroidTTS !== 'undefined' ? 'available' : 'NOT available'));
})();
""";
}
