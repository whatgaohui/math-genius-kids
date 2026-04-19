# Task 2 - EnglishHome UI Redesign

## Agent: UI Redesign Agent

## Summary
Redesigned the EnglishHome.tsx page to match the MathHome.tsx UI design language, and extended the English vocabulary database to support grades 1-6.

## Files Modified
1. `/home/z/my-project/src/lib/english-utils.ts` - Extended grade types and added vocabulary
2. `/home/z/my-project/src/components/english/EnglishHome.tsx` - Complete UI redesign

## Changes Detail

### english-utils.ts
- `EnglishGrade` type: `1 | 2 | 3` → `1 | 2 | 3 | 4 | 5 | 6`
- Added `GRADE_4_VOCAB`: 39 entries (weather, clothes, hobbies, school subjects, time expressions, adjectives)
- Added `GRADE_5_VOCAB`: 40 entries (travel, nature, feelings, comparisons, daily routines, verbs)
- Added `GRADE_6_VOCAB`: 40 entries (environment, technology, future plans, descriptions, advanced vocabulary)
- Updated `GRADED_VOCAB` record to include all 6 grades
- Refactored distractor pool to use `Object.values(GRADED_VOCAB).flat()` (cleaner, auto-includes new grades)

### EnglishHome.tsx
- **Header**: Gradient banner (emerald-500 to teal-500) with back button, "🔤 英语乐园" title, "ABC字母，轻松掌握" subtitle, star count badge, streak badge
- **Mode Cards**: Vertical list matching MathHome pattern - gradient icon (ImageIcon, Palette, Headphones, PencilLine), title + description, ChevronRight, border-none shadow-lg. Selected mode has ring-2 ring-emerald-400 ring-offset-2
- **Grade Selector**: 6 pill/chip buttons (一年级-六年级), filled emerald/teal gradient when selected, outlined when not
- **Count Selector**: 4 pill buttons (5/10/15/20), same styling
- **Start Button**: Full-width gradient button with Play icon
- **Quick Tips**: Emerald-themed tips box at bottom
- **Animation**: containerVariants/itemVariants for staggered entrance
- **Layout**: max-w-md mx-auto, mobile-first
- **Preserved**: All existing functionality (englishPlayConfig, sound effects, resumeAudioContext)

## Verification
- `bun run lint`: 0 errors
- Dev server: compiled successfully, no errors in dev.log
