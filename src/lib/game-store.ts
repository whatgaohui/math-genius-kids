// Main game store for 学习小达人 (Learning Genius)
'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MathQuestion, Operation, Difficulty } from './math-utils';
import type { ChineseQuestion, ChineseMode } from './chinese-utils';
import type { EnglishQuestion, EnglishMode } from './english-utils';
import { generateQuestions, calculateStars, calculateXP, calculateLevel } from './math-utils';
import { generateCurriculumQuestions, type Grade, type Semester } from './math-curriculum';
import { computeUnlockedAchievements } from './achievements';
import type { PracticeRecordSummary } from './achievements';
import { usePetStore, type PracticeReward, getCoinBonusPercent, getCriticalHitChance, getPetTalent } from './pet-store';

// ─── Types ──────────────────────────────────────────────────────────────────

export type Subject = 'math' | 'chinese' | 'english';

export interface PracticeRecord {
  date: string;
  correct: number;
  total: number;
  timeMs: number;
  stars: number;
  xp: number;
  operation: string;
  difficulty: string;
  mode: string;
  subject: Subject;
}

export type GameMode = 'free' | 'speed' | 'adventure' | 'daily';

interface GameSessionState {
  // Questions
  questions: MathQuestion[] | ChineseQuestion[] | EnglishQuestion[];
  currentQuestionIndex: number;
  sessionStartTime: number;
  questionStartTime: number;

  // Session stats
  sessionCorrect: number;
  sessionWrong: number;
  sessionTimeMs: number;
  sessionStars: number;
  sessionMaxCombo: number;
  sessionCurrentCombo: number;
  sessionXP: number;

  // Session config
  sessionMode: GameMode;
  sessionSubject: Subject;
  sessionOperation: string;
  sessionDifficulty: string;
  sessionQuestionCount: number;

  // Speed mode
  speedTimeLimit: number; // seconds

  // Daily challenge
  isDailyChallenge: boolean;
}

// ─── State ──────────────────────────────────────────────────────────────────

interface GameState {
  // Player info
  playerName: string;
  playerAvatar: string;
  playerLevel: number;
  totalStars: number;
  totalXP: number;
  streak: number;
  lastPracticeDate: string;

  // Navigation
  currentSubject: Subject;
  currentView: string;

  // Free practice settings
  selectedOperation: Operation;
  selectedDifficulty: Difficulty;

  // Speed challenge settings
  speedTimeLimit: number;
  speedOperation: Operation;

  // Adventure mode (math)
  adventureLevel: number;
  adventureStars: Record<number, number>;

  // Adventure mode (chinese)
  chineseAdventureLevel: number;
  chineseAdventureStars: Record<number, number>;

  // Adventure mode (english)
  englishAdventureLevel: number;
  englishAdventureStars: Record<number, number>;

  // Speed challenge config per subject
  chineseSpeedTimeLimit: number;
  englishSpeedTimeLimit: number;

  // Last game info
  lastGameSource: string;
  lastLevelName: string;
  lastLevelEmoji: string;

  // Current game session
  session: GameSessionState | null;

  // Last session result (saved before session is cleared)
  lastResult: {
    correct: number;
    wrong: number;
    total: number;
    timeMs: number;
    stars: number;
    xp: number;
    maxCombo: number;
    mode: string;
    operation: string;
    difficulty: string;
    subject: Subject;
    coinsEarned: number;
    petXPEarned: number;
    isCriticalHit: boolean;
    // Bonus breakdown for display
    bonusDetails?: {
      base: number;
      star: number;
      combo: number;
      perfect: number;
      speed: number;
      streak: number;
      petBonus: number;
      critical: number;
      petLevel: number;
      coinBonusPercent: number;
      critChance: number;
    };
  } | null;

  // Daily challenge
  dailyChallengeCompletedDates: string[];

  // Practice history
  practiceHistory: PracticeRecord[];

  // Achievements
  unlockedAchievements: string[];

  // Sound
  soundEnabled: boolean;

  // Curriculum settings
  selectedMathGrade: number;    // 1-6, 0 = not set
  selectedMathSemester: string; // '上册' | '下册' | ''
  selectedChineseGrade: number;
  selectedChineseSemester: string;
  selectedEnglishGrade: number;
  selectedEnglishSemester: string;
}

// ─── Actions ────────────────────────────────────────────────────────────────

interface GameActions {
  // Navigation
  setCurrentView: (view: string) => void;
  setCurrentSubject: (subject: Subject) => void;

  // Player
  setPlayerName: (name: string) => void;
  setPlayerAvatar: (avatar: string) => void;
  toggleSound: () => void;

  // Settings
  setSelectedOperation: (op: Operation) => void;
  setSelectedDifficulty: (diff: Difficulty) => void;
  setSpeedTimeLimit: (seconds: number) => void;
  setSpeedOperation: (op: Operation) => void;

  // Curriculum
  setMathGrade: (grade: number, semester: string) => void;
  setChineseGrade: (grade: number, semester: string) => void;
  setEnglishGrade: (grade: number, semester: string) => void;

  // Adventure (math)
  setAdventureLevel: (level: number) => void;
  setAdventureStars: (level: number, stars: number) => void;

  // Adventure (chinese)
  setChineseAdventureLevel: (level: number) => void;
  setChineseAdventureStars: (level: number, stars: number) => void;

  // Adventure (english)
  setEnglishAdventureLevel: (level: number) => void;
  setEnglishAdventureStars: (level: number, stars: number) => void;

  // Speed challenge config per subject
  setChineseSpeedTimeLimit: (seconds: number) => void;
  setEnglishSpeedTimeLimit: (seconds: number) => void;

  // ── Math Session ──
  startMathSession: (mode: GameMode, operation?: Operation, difficulty?: Difficulty, count?: number) => void;
  nextQuestion: () => void;
  answerQuestion: (questionId: string, answer: number | boolean, timeMs: number) => void;
  advanceToNextOrEnd: () => 'next' | 'end';
  endSession: () => PracticeRecord | null;
  updateSessionMaxCombo: () => void;
  resetGame: () => void;

  // ── Chinese/English Session ──
  startChineseSession: (mode: ChineseMode, grade: number, count?: number) => void;
  startEnglishSession: (mode: EnglishMode, grade: number, count?: number) => void;
  completeSubjectSession: (params: {
    correct: number;
    total: number;
    timeMs: number;
    maxCombo: number;
    subject: Subject;
    mode: string;
    difficulty: string;
    floorLevel?: number;
  }) => { record: PracticeRecord; reward: PracticeReward } | null;

  // ── Achievements ──
  refreshAchievements: () => string[];

  // ── Utilities ──
  clearHistory: () => void;
  updateStreak: () => void;
  getTodayStr: () => string;
  getBestSessionMaxCombo: () => number;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function getTodayStr(): string {
  return new Date().toISOString().split('T')[0];
}

function getOperationForRecord(operation: string, mode: ChineseMode | EnglishMode | string): string {
  if (operation) return operation;
  return mode;
}

// ─── Store ──────────────────────────────────────────────────────────────────

export const useGameStore = create<GameState & GameActions>()(
  persist(
    (set, get) => ({
      // ── Initial State ──
      playerName: '',
      playerAvatar: '😀',
      playerLevel: 1,
      totalStars: 0,
      totalXP: 0,
      streak: 0,
      lastPracticeDate: '',

      currentSubject: 'math',
      currentView: 'home',

      selectedOperation: 'add',
      selectedDifficulty: 'easy',

      speedTimeLimit: 60,
      speedOperation: 'add',

      adventureLevel: 1,
      adventureStars: {},

      chineseAdventureLevel: 1,
      chineseAdventureStars: {},

      englishAdventureLevel: 1,
      englishAdventureStars: {},

      chineseSpeedTimeLimit: 60,
      englishSpeedTimeLimit: 60,

      lastGameSource: '',
      lastLevelName: '',
      lastLevelEmoji: '',

      session: null,

      lastResult: null,

      dailyChallengeCompletedDates: [],

      practiceHistory: [],
      unlockedAchievements: [],

      soundEnabled: true,

      selectedMathGrade: 0,
      selectedMathSemester: '',
      selectedChineseGrade: 0,
      selectedChineseSemester: '',
      selectedEnglishGrade: 0,
      selectedEnglishSemester: '',

      // ── Navigation ──
      setCurrentView: (view: string) => set({ currentView: view }),
      setCurrentSubject: (subject: Subject) => set({ currentSubject: subject }),

      // ── Player ──
      setPlayerName: (name: string) => set({ playerName: name }),
      setPlayerAvatar: (avatar: string) => set({ playerAvatar: avatar }),
      toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),

      // ── Settings ──
      setSelectedOperation: (op: Operation) => set({ selectedOperation: op }),
      setSelectedDifficulty: (diff: Difficulty) => set({ selectedDifficulty: diff }),
      setSpeedTimeLimit: (seconds: number) => set({ speedTimeLimit: seconds }),
      setSpeedOperation: (op: Operation) => set({ speedOperation: op }),

      // ── Curriculum ──
      setMathGrade: (grade: number, semester: string) => set({ selectedMathGrade: grade, selectedMathSemester: semester }),
      setChineseGrade: (grade: number, semester: string) => set({ selectedChineseGrade: grade, selectedChineseSemester: semester }),
      setEnglishGrade: (grade: number, semester: string) => set({ selectedEnglishGrade: grade, selectedEnglishSemester: semester }),

      // ── Adventure (Math) ──
      setAdventureLevel: (level: number) => set({ adventureLevel: level }),
      setAdventureStars: (level: number, stars: number) =>
        set((s) => ({
          adventureStars: {
            ...s.adventureStars,
            [level]: Math.max(s.adventureStars[level] ?? 0, stars),
          },
        })),

      // ── Adventure (Chinese) ──
      setChineseAdventureLevel: (level: number) => set({ chineseAdventureLevel: level }),
      setChineseAdventureStars: (level: number, stars: number) =>
        set((s) => ({
          chineseAdventureStars: {
            ...s.chineseAdventureStars,
            [level]: Math.max(s.chineseAdventureStars[level] ?? 0, stars),
          },
        })),

      // ── Adventure (English) ──
      setEnglishAdventureLevel: (level: number) => set({ englishAdventureLevel: level }),
      setEnglishAdventureStars: (level: number, stars: number) =>
        set((s) => ({
          englishAdventureStars: {
            ...s.englishAdventureStars,
            [level]: Math.max(s.englishAdventureStars[level] ?? 0, stars),
          },
        })),

      // ── Speed config per subject ──
      setChineseSpeedTimeLimit: (seconds: number) => set({ chineseSpeedTimeLimit: seconds }),
      setEnglishSpeedTimeLimit: (seconds: number) => set({ englishSpeedTimeLimit: seconds }),

      // ── Math Session ──
      startMathSession: (
        mode: GameMode,
        operation?: Operation,
        difficulty?: Difficulty,
        count: number = 10
      ) => {
        const state = get();
        const op = operation ?? state.selectedOperation;
        const diff = difficulty ?? state.selectedDifficulty;

        // Question generation strategy:
        // - Adventure mode: always use level-defined operation/difficulty (never curriculum)
        // - Free/Speed mode with grade set: use curriculum-aligned questions
        // - Free/Speed mode without grade: use operation/difficulty-based generator
        let questions: MathQuestion[];
        const isAdventure = mode === 'adventure';
        const gradeSet = state.selectedMathGrade > 0 && state.selectedMathSemester;

        if (isAdventure) {
          // Adventure mode always uses level-defined operation/difficulty
          questions = generateQuestions(op, diff, count);
        } else if (gradeSet) {
          // Free/Speed mode: use curriculum-aligned questions when grade/semester configured
          const curriculumQuestions = generateCurriculumQuestions(
            state.selectedMathGrade as Grade,
            state.selectedMathSemester as Semester,
            count
          );
          // Fall back to standard generator if curriculum returned nothing
          questions = curriculumQuestions.length > 0 ? curriculumQuestions : generateQuestions(op, diff, count);
        } else {
          questions = generateQuestions(op, diff, count);
        }

        const session: GameSessionState = {
          questions,
          currentQuestionIndex: 0,
          sessionStartTime: Date.now(),
          questionStartTime: Date.now(),
          sessionCorrect: 0,
          sessionWrong: 0,
          sessionTimeMs: 0,
          sessionStars: 0,
          sessionMaxCombo: 0,
          sessionCurrentCombo: 0,
          sessionXP: 0,
          sessionMode: mode,
          sessionSubject: 'math',
          sessionOperation: op,
          sessionDifficulty: diff,
          sessionQuestionCount: count,
          speedTimeLimit: mode === 'speed' ? state.speedTimeLimit : 0,
          isDailyChallenge: mode === 'daily',
        };

        set({ session });
      },

      nextQuestion: () => {
        set((s) => {
          if (!s.session) return {};
          const nextIndex = s.session.currentQuestionIndex + 1;
          if (nextIndex >= s.session.questions.length) return {};
          return {
            session: {
              ...s.session,
              currentQuestionIndex: nextIndex,
              questionStartTime: Date.now(),
            },
          };
        });
      },

      answerQuestion: (questionId: string, answer: number | boolean, timeMs: number) => {
        set((s) => {
          if (!s.session) return {};

          const questions = s.session.questions as MathQuestion[];
          const qIndex = questions.findIndex((q) => q.id === questionId);
          if (qIndex === -1) return {};

          const question = questions[qIndex];
          const isCorrect =
            typeof answer === 'boolean'
              ? answer === question.correctAnswer
              : Number(answer) === Number(question.correctAnswer);

          const newQuestions = [...questions];
          newQuestions[qIndex] = {
            ...question,
            userAnswer: answer,
            isCorrect,
            timeMs,
          };

          const newCorrect = s.session.sessionCorrect + (isCorrect ? 1 : 0);
          const newWrong = s.session.sessionWrong + (isCorrect ? 0 : 1);
          const newCombo = isCorrect ? s.session.sessionCurrentCombo + 1 : 0;
          const newMaxCombo = Math.max(s.session.sessionMaxCombo, newCombo);

          return {
            session: {
              ...s.session,
              questions: newQuestions,
              sessionCorrect: newCorrect,
              sessionWrong: newWrong,
              sessionCurrentCombo: newCombo,
              sessionMaxCombo: newMaxCombo,
              questionStartTime: Date.now(),
            },
          };
        });
      },

      advanceToNextOrEnd: (): 'next' | 'end' => {
        const state = get();
        if (!state.session) return 'end';
        const nextIndex = state.session.currentQuestionIndex + 1;
        if (nextIndex >= state.session.questions.length) {
          return 'end';
        }
        set({
          session: {
            ...state.session,
            currentQuestionIndex: nextIndex,
            questionStartTime: Date.now(),
          },
        });
        return 'next';
      },

      endSession: (): PracticeRecord | null => {
        const state = get();
        if (!state.session) return null;

        const session = state.session;
        const totalTimeMs = Date.now() - session.sessionStartTime;
        const correct = session.sessionCorrect;
        const wrong = session.sessionWrong;
        const total = correct + wrong; // Actual answered count, not pool size
        const stars = calculateStars(correct, total);
        const xp = calculateXP(correct, total, totalTimeMs, stars, session.sessionMaxCombo);

        const record: PracticeRecord = {
          date: getTodayStr(),
          correct,
          total,
          timeMs: totalTimeMs,
          stars,
          xp,
          operation: session.sessionOperation,
          difficulty: session.sessionDifficulty,
          mode: session.sessionMode,
          subject: session.sessionSubject,
        };

        // Update totals
        const newTotalStars = state.totalStars + stars;
        const newTotalXP = state.totalXP + xp;
        const newPlayerLevel = calculateLevel(newTotalXP);
        const newHistory = [record, ...state.practiceHistory].slice(0, 200);

        // Update streak
        const today = getTodayStr();
        let newStreak = state.streak;
        if (state.lastPracticeDate === today) {
          // Already practiced today, keep streak
        } else {
          const lastDate = new Date(state.lastPracticeDate);
          const todayDate = new Date(today);
          const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays === 1) {
            newStreak += 1;
          } else if (diffDays > 1) {
            newStreak = 1;
          } else {
            newStreak = 1;
          }
        }

        // Daily challenge tracking
        let newDailyDates = state.dailyChallengeCompletedDates;
        if (session.isDailyChallenge && !state.dailyChallengeCompletedDates.includes(today)) {
          newDailyDates = [...state.dailyChallengeCompletedDates, today];
        }

        // Award coins & pet XP
        const petStore = usePetStore.getState();
        const reward = petStore.calculatePracticeReward({
          correct,
          total,
          stars,
          maxCombo: session.sessionMaxCombo,
          timeMs: totalTimeMs,
          playerStreak: newStreak,
          subject: session.sessionSubject,
        });
        petStore.awardPracticeReward(reward);

        // Save result before clearing session (for ResultPage to read)
        const resultData = {
          correct,
          wrong: total - correct,
          total,
          timeMs: totalTimeMs,
          stars,
          xp,
          maxCombo: session.sessionMaxCombo,
          mode: session.sessionMode,
          operation: session.sessionOperation,
          difficulty: session.sessionDifficulty,
          subject: session.sessionSubject,
          coinsEarned: reward.coins,
          petXPEarned: reward.petXP,
          isCriticalHit: reward.isCriticalHit,
          bonusDetails: {
            ...reward.bonuses,
            petLevel: petStore.petLevel,
            coinBonusPercent: getCoinBonusPercent(petStore.petLevel, petStore.petType),
            critChance: getCriticalHitChance(petStore.petLevel, petStore.petType),
            talentBonus: reward.talentBonus,
            talentName: reward.talentName,
            talentEmoji: reward.talentEmoji,
          },
        };

        set({
          session: null,
          lastResult: resultData,
          totalStars: newTotalStars,
          totalXP: newTotalXP,
          playerLevel: newPlayerLevel,
          streak: newStreak,
          lastPracticeDate: today,
          practiceHistory: newHistory,
          dailyChallengeCompletedDates: newDailyDates,
        });

        get().refreshAchievements();

        return record;
      },

      updateSessionMaxCombo: () => {
        set((s) => {
          if (!s.session) return {};
          return {
            session: {
              ...s.session,
              sessionMaxCombo: Math.max(
                s.session.sessionMaxCombo,
                s.session.sessionCurrentCombo
              ),
            },
          };
        });
      },

      resetGame: () => {
        set({ session: null });
      },

      // ── Chinese Session ──
      startChineseSession: (mode: ChineseMode, _grade: number, count: number = 10) => {
        // Import dynamically to avoid issues
        import('./chinese-utils').then(({ generateChineseQuestions }) => {
          const questions = generateChineseQuestions(mode, _grade as 1|2|3|4|5|6, count);
          const session: GameSessionState = {
            questions,
            currentQuestionIndex: 0,
            sessionStartTime: Date.now(),
            questionStartTime: Date.now(),
            sessionCorrect: 0,
            sessionWrong: 0,
            sessionTimeMs: 0,
            sessionStars: 0,
            sessionMaxCombo: 0,
            sessionCurrentCombo: 0,
            sessionXP: 0,
            sessionMode: 'free',
            sessionSubject: 'chinese',
            sessionOperation: mode,
            sessionDifficulty: String(_grade),
            sessionQuestionCount: count,
            speedTimeLimit: 0,
            isDailyChallenge: false,
          };
          set({ session });
        });
      },

      // ── English Session ──
      startEnglishSession: (mode: EnglishMode, _grade: number, count: number = 10) => {
        import('./english-utils').then(({ generateEnglishQuestions }) => {
          const questions = generateEnglishQuestions(mode, _grade as 1 | 2 | 3 | 4 | 5 | 6, count);
          const session: GameSessionState = {
            questions,
            currentQuestionIndex: 0,
            sessionStartTime: Date.now(),
            questionStartTime: Date.now(),
            sessionCorrect: 0,
            sessionWrong: 0,
            sessionTimeMs: 0,
            sessionStars: 0,
            sessionMaxCombo: 0,
            sessionCurrentCombo: 0,
            sessionXP: 0,
            sessionMode: 'free',
            sessionSubject: 'english',
            sessionOperation: mode,
            sessionDifficulty: String(_grade),
            sessionQuestionCount: count,
            speedTimeLimit: 0,
            isDailyChallenge: false,
          };
          set({ session });
        });
      },

      // ── Complete subject session (for chinese/english with external answer tracking) ──
      // Does NOT require an active session — all info passed via params
      completeSubjectSession: (params: {
        correct: number;
        total: number;
        timeMs: number;
        maxCombo: number;
        subject: Subject;
        mode: string;
        difficulty: string;
        floorLevel?: number;
      }): { record: PracticeRecord; reward: PracticeReward } | null => {
        const state = get();
        const { correct, total, timeMs, maxCombo, subject, mode, difficulty, floorLevel } = params;

        if (total === 0) return null;

        const stars = calculateStars(correct, total);
        const xp = calculateXP(correct, total, timeMs, stars, maxCombo);

        const record: PracticeRecord = {
          date: getTodayStr(),
          correct,
          total,
          timeMs,
          stars,
          xp,
          operation: mode,
          difficulty,
          mode,
          subject,
        };

        const newTotalStars = state.totalStars + stars;
        const newTotalXP = state.totalXP + xp;
        const newPlayerLevel = calculateLevel(newTotalXP);
        const newHistory = [record, ...state.practiceHistory].slice(0, 200);

        const today = getTodayStr();
        let newStreak = state.streak;
        if (state.lastPracticeDate !== today) {
          const lastDate = state.lastPracticeDate
            ? new Date(state.lastPracticeDate)
            : new Date(0);
          const todayDate = new Date(today);
          const diffDays = Math.floor(
            (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
          );
          if (diffDays === 1) {
            newStreak += 1;
          } else {
            newStreak = 1;
          }
        }

        // Award coins & pet XP via pet store (pass mode & floorLevel for multiplier)
        const petStore = usePetStore.getState();
        const reward = petStore.calculatePracticeReward({
          correct,
          total,
          stars,
          maxCombo,
          timeMs,
          playerStreak: newStreak,
          subject,
          mode,
          floorLevel,
        });
        petStore.awardPracticeReward(reward);

        // Save lastResult for result page
        const resultData = {
          correct,
          wrong: total - correct,
          total,
          timeMs,
          stars,
          xp,
          maxCombo,
          mode,
          operation: mode,
          difficulty,
          subject,
          coinsEarned: reward.coins,
          petXPEarned: reward.petXP,
          isCriticalHit: reward.isCriticalHit,
          bonusDetails: {
            ...reward.bonuses,
            petLevel: petStore.petLevel,
            coinBonusPercent: getCoinBonusPercent(petStore.petLevel, petStore.petType),
            critChance: getCriticalHitChance(petStore.petLevel, petStore.petType),
            talentBonus: reward.talentBonus,
            talentName: reward.talentName,
            talentEmoji: reward.talentEmoji,
          },
        };

        // Build the base update object
        const baseUpdate: Partial<GameState> = {
          session: null,
          lastResult: resultData,
          totalStars: newTotalStars,
          totalXP: newTotalXP,
          playerLevel: newPlayerLevel,
          streak: newStreak,
          lastPracticeDate: today,
          practiceHistory: newHistory,
        };

        // Adventure progress tracking for chinese/english
        if (mode === 'adventure' && floorLevel !== undefined && floorLevel > 0) {
          if (subject === 'chinese') {
            // Update highest completed level
            if (floorLevel > state.chineseAdventureLevel) {
              baseUpdate.chineseAdventureLevel = floorLevel;
            }
            // Update stars for this floor (keep best)
            const currentStars = state.chineseAdventureStars[floorLevel] ?? 0;
            if (stars > currentStars) {
              baseUpdate.chineseAdventureStars = {
                ...state.chineseAdventureStars,
                [floorLevel]: stars,
              };
            }
          } else if (subject === 'english') {
            if (floorLevel > state.englishAdventureLevel) {
              baseUpdate.englishAdventureLevel = floorLevel;
            }
            const currentStars = state.englishAdventureStars[floorLevel] ?? 0;
            if (stars > currentStars) {
              baseUpdate.englishAdventureStars = {
                ...state.englishAdventureStars,
                [floorLevel]: stars,
              };
            }
          }
        }

        set(baseUpdate);

        get().refreshAchievements();
        return { record, reward };
      },

      // ── Achievements ──
      refreshAchievements: (): string[] => {
        const state = get();
        const historySummary: PracticeRecordSummary[] = state.practiceHistory.map((r) => ({
          correct: r.correct,
          total: r.total,
          stars: r.stars,
          mode: r.mode,
          subject: r.subject,
        }));

        const newAchievements = computeUnlockedAchievements({
          totalStars: state.totalStars,
          totalXP: state.totalXP,
          streak: state.streak,
          practiceHistory: historySummary,
          unlockedAchievements: state.unlockedAchievements,
          petLevel: 1, // Will be updated by pet store
          maxCombo: state.session?.sessionMaxCombo ?? state.practiceHistory.reduce((max, _r) => max, 0),
          adventureMaxFloor: state.adventureLevel,
          chineseAdventureMaxFloor: state.chineseAdventureLevel,
          englishAdventureMaxFloor: state.englishAdventureLevel,
        });

        if (newAchievements.length > 0) {
          set({
            unlockedAchievements: [
              ...state.unlockedAchievements,
              ...newAchievements,
            ],
          });
        }

        return newAchievements;
      },

      // ── Utilities ──
      clearHistory: () => set({ practiceHistory: [] }),

      updateStreak: () => {
        const state = get();
        const today = getTodayStr();
        if (state.lastPracticeDate === today) return;

        const lastDate = state.lastPracticeDate
          ? new Date(state.lastPracticeDate)
          : new Date(0);
        const todayDate = new Date(today);
        const diffDays = Math.floor(
          (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        let newStreak = 1;
        if (diffDays === 1) {
          newStreak = state.streak + 1;
        }

        set({ streak: newStreak, lastPracticeDate: today });
      },

      getTodayStr: (): string => getTodayStr(),

      getBestSessionMaxCombo: (): number => {
        const state = get();
        if (state.session) {
          return state.session.sessionMaxCombo;
        }
        // Look through history for best combo info (approximation)
        return 0;
      },
    }),
    {
      name: 'math-genius-game-store',
      partialize: (state) => ({
        // Only persist these fields
        playerName: state.playerName,
        playerAvatar: state.playerAvatar,
        playerLevel: state.playerLevel,
        totalStars: state.totalStars,
        totalXP: state.totalXP,
        streak: state.streak,
        lastPracticeDate: state.lastPracticeDate,
        selectedOperation: state.selectedOperation,
        selectedDifficulty: state.selectedDifficulty,
        speedTimeLimit: state.speedTimeLimit,
        speedOperation: state.speedOperation,
        adventureLevel: state.adventureLevel,
        adventureStars: state.adventureStars,
        chineseAdventureLevel: state.chineseAdventureLevel,
        chineseAdventureStars: state.chineseAdventureStars,
        englishAdventureLevel: state.englishAdventureLevel,
        englishAdventureStars: state.englishAdventureStars,
        chineseSpeedTimeLimit: state.chineseSpeedTimeLimit,
        englishSpeedTimeLimit: state.englishSpeedTimeLimit,
        lastGameSource: state.lastGameSource,
        lastLevelName: state.lastLevelName,
        lastLevelEmoji: state.lastLevelEmoji,
        dailyChallengeCompletedDates: state.dailyChallengeCompletedDates,
        practiceHistory: state.practiceHistory,
        unlockedAchievements: state.unlockedAchievements,
        soundEnabled: state.soundEnabled,
        selectedMathGrade: state.selectedMathGrade,
        selectedMathSemester: state.selectedMathSemester,
        selectedChineseGrade: state.selectedChineseGrade,
        selectedChineseSemester: state.selectedChineseSemester,
        selectedEnglishGrade: state.selectedEnglishGrade,
        selectedEnglishSemester: state.selectedEnglishSemester,
      }),
    }
  )
);
