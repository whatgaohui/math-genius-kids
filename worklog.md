# Math Genius Kids - Worklog

---
Task ID: 1
Agent: Main Agent
Task: Clone repository, copy code, adjust page widths for mobile

Work Log:
- Cloned repository from https://github.com/whatgaohui/math-genius-kids
- Examined the project structure - it's a kids' learning app with math, Chinese, English subjects
- Copied all source files from cloned repo to working project at /home/z/my-project
- Analyzed page width patterns across all pages:
  - StatsPage, AchievementsPage, PetPage use `mx-auto max-w-md` pattern (mobile-friendly)
  - HomePage, SettingsPage used `px-5` without max-width constraint (wider than intended)
  - PracticeSetup, SpeedSetup, LearningGoalsPage, ParentDashboard used `max-w-lg` (wider than standard)
- Fixed HomePage.tsx:
  - Added `mx-auto max-w-md` wrapper to hero header content
  - Changed `px-5` to `mx-auto max-w-md px-4` on XP progress, subjects, quick actions, pet card sections
- Fixed SettingsPage.tsx:
  - Added `mx-auto max-w-md` wrapper to hero header content
  - Changed `px-5` to `mx-auto max-w-md px-4` on stat chips and settings groups sections
- Fixed PracticeSetup.tsx, SpeedSetup.tsx, LearningGoalsPage.tsx, ParentDashboard.tsx:
  - Changed all `max-w-lg` to `max-w-md` for consistent mobile width
- Verified: Lint passes with no errors, page compiles and renders with HTTP 200

Stage Summary:
- All page-level components now consistently use `max-w-md` (448px max width) for mobile-friendly layout
- The `mx-auto max-w-md` pattern ensures content is centered and doesn't stretch too wide on larger screens
- Key files modified: HomePage.tsx, SettingsPage.tsx, PracticeSetup.tsx, SpeedSetup.tsx, LearningGoalsPage.tsx, ParentDashboard.tsx

---
Task ID: 2
Agent: Main Agent
Task: Fix top spacing on Stats/Achievements/Pet pages + Fix TTS audio on mobile

Work Log:
- **Issue 1: Top spacing on Stats/Achievements/Pet pages**
  - Back buttons were too close to the top edge of the screen
  - Added `pt-3` top padding and `safe-top` CSS class (supports safe-area-inset on notched devices) to all header divs
  - Added `min-h-[44px]` to all back buttons for proper touch target size
  - Fixed pages: StatsPage, AchievementsPage, PetPage (both no-pet and has-pet views), EnglishHome, ChineseHome, MathHome, LeaderboardPage, ErrorBookPage
  - Added `.safe-top` CSS utility class to globals.css
- **Issue 2: TTS audio not working on mobile for listening features**
  - Root cause: Mobile browsers block audio playback without user gesture (autoplay policy)
  - Chinese dictation mode was auto-playing via useEffect, which fails on mobile
  - Web Speech API needs AudioContext resumed before speaking
  - Major fixes to `/src/lib/tts.ts`:
    1. Added `ensureAudioContext()` that creates and resumes AudioContext before speaking
    2. Added mobile Chrome bug workaround: periodic `speechSynthesis.resume()` for stuck paused state
    3. Added small delay (100ms) on mobile before `speak()` call for better reliability
    4. Better error handling: "canceled" and "interrupted" errors now resolve instead of reject
    5. Added `resumeAudioForMobile()` export for components to call on user interaction
    6. Backend fallback: added NotAllowedError overlay for mobile with "点击播放发音" button
  - Fixed Chinese dictation mode (`ChinesePlay.tsx`):
    1. On mobile, don't auto-play - show "👆 点击播放发音" prompt instead
    2. Added `pendingDictationSpeak` state to track pending speech text
    3. Added `handleDictationPlay` callback with `resumeAudioForMobile()`
    4. Both dictation play buttons now call `resumeAudioForMobile()` before speaking
  - Fixed English listening mode (`EnglishPlay.tsx`):
    1. `handleSpeak` now calls `resumeAudioForMobile()` before speaking
  - QA verified with agent-browser: no console errors, pages render correctly
  - VLM analysis confirms top spacing is sufficient on stats page

Stage Summary:
- All page headers now have proper top padding (pt-3 + safe-top for notched devices)
- All back buttons have minimum 44px touch target
- TTS audio now works reliably on mobile browsers:
  - AudioContext is properly resumed before speaking
  - Chinese dictation mode no longer auto-plays on mobile (shows tap-to-play)
  - Both English and Chinese listening features call resumeAudioForMobile()
  - Chrome on Android stuck-in-paused bug is handled
- Key files modified: tts.ts, ChinesePlay.tsx, EnglishPlay.tsx, StatsPage.tsx, AchievementsPage.tsx, PetPage.tsx, EnglishHome.tsx, ChineseHome.tsx, MathHome.tsx, LeaderboardPage.tsx, ErrorBookPage.tsx, globals.css
