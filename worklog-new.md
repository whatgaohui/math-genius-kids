# Math Genius Kids - Worklog

---
Task ID: 9
Agent: Main Agent
Task: 修复荣耀手机TTS不播放声音问题 + 编译APK + 推送代码

Work Log:
- **搜索和分析问题**：
  - 搜索了多个技术文章和Stack Overflow讨论
  - 关键发现：Web Speech API在Android WebView中完全不支持（Chromium bug #40417848）
  - 核心问题：speakWithBackend()中先fetch('/api/tts')获取音频（异步操作），然后new Audio().play()播放
  - 移动浏览器autoplay策略要求play()必须在用户手势的同一调用栈中执行
  - fetch()是异步的，等它完成后用户手势上下文已丢失，浏览器阻止播放（NotAllowedError）

- **修复TTS播放**：
  - 重写/src/lib/tts.ts中的speakWithBackend()函数
  - 使用AudioContext.decodeAudioData() + AudioBufferSourceNode替代HTML5 Audio播放
  - AudioContext在用户手势时解锁后，即使经过异步fetch仍可正常播放
  - 保留HTML5 Audio作为降级方案（当decodeAudioData失败时）
  - 添加stopCurrentAudio()函数管理当前播放的音频源
  - 添加isAndroidWebView()检测（Web Speech API在WebView中不支持）
  - 添加全局首次触摸解锁AudioContext（在page.tsx的PageRouter组件中）

- **编译APK**：
  - APK已更新（24MB），使用原生WebView加载静态资源
  - SettingsPage已更新APK大小

- **推送代码**：
  - 代码已推送到GitHub

Stage Summary:
- TTS核心修复：AudioContext.decodeAudioData替代HTML5 Audio，解决移动浏览器autoplay限制
- 新增Android WebView检测，跳过不支持的Web Speech API
- 全局AudioContext解锁确保首次触摸即可播放音频
- APK已更新（24MB）
- 代码已推送到GitHub
