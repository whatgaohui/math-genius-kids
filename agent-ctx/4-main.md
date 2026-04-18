# Task 4 — Chinese Question Bank Enhancement (Grades 1-6)

## Status: COMPLETED ✅

## Changes Made

### 1. `src/lib/chinese-utils.ts` — Complete Rewrite
- **ChineseGrade**: Expanded from `1 | 2 | 3` to `1 | 2 | 3 | 4 | 5 | 6`
- **ChineseMode**: Added 4 new modes — `idiom-fill`, `antonym`, `poetry-fill`, `synonym`
- **Character databases**: 6 grade levels with curriculum-appropriate content (252 total chars)
  - G1: Body/nature/daily actions (removed numerals 一二三四五六七八九十)
  - G2: Colors/directions/seasons/emotions
  - G3: Cognitive verbs/abstract concepts
  - G4: Antonym pairs/descriptive vocabulary
  - G5: Advanced/literary vocabulary
  - G6: Aesthetic/literary vocabulary
- **Word databases**: 147 words across 6 grades
- **Idiom database**: 30 four-character idioms with blank positions
- **Antonym database**: 29 word pairs
- **Synonym database**: 18 entries with distractors
- **Poetry database**: 20 lines from Tang/Song/Qing dynasty poems
- **Proverb database**: 12 Chinese proverbs
- **Smart distractor system**: 55 similar character groups (appearance + pinyin)
  - Priority: similar appearance → similar pronunciation → same grade → adjacent grade → all
- **New exports**: `getModesForGrade()`, `getAvailableMode()`
- **MODE_CONFIG**: Added `minGrade` field, 8 total modes

### 2. `src/components/chinese/ChineseHome.tsx` — Updated
- 6 grades with descriptions (基础识字, 词语积累, 理解表达, 成语反义, 古诗谚语, 文学素养)
- Mode cards show availability (greyed out with "X年级+" label when not available)
- `activeMode` auto-switches when current mode is unavailable for selected grade
- `MODE_ICONS` extended with 4 new mode entries

### 3. `src/components/chinese/ChinesePlay.tsx` — Updated
- New mode prompt labels for all 8 modes
- Uses `getAvailableMode()` for graceful mode fallback
- Grade type cast updated from `1 | 2 | 3` to `ChineseGrade`

### 4. `src/lib/game-store.ts` — Updated
- Grade type cast updated from `1 | 2 | 3` to `1|2|3|4|5|6`

## Verification
- `bun run lint`: 0 errors
- Dev server: compiles clean
