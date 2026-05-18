'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface LearningGoal {
  id: string;
  type: 'daily' | 'weekly';
  targetSessions: number;  // how many practice sessions
  targetQuestions: number; // how many questions to answer
  targetStars: number;     // how many stars to earn
  subject: 'all' | 'math' | 'chinese' | 'english';
  isActive: boolean;
}

interface LearningGoalsState {
  goals: LearningGoal[];
  todayCompletedSessions: number;
  todayCompletedQuestions: number;
  todayEarnedStars: number;
  weekCompletedSessions: number;
  weekCompletedQuestions: number;
  weekEarnedStars: number;
  lastResetDate: string;
  lastWeekResetDate: string;
  
  // Actions
  addGoal: (goal: Omit<LearningGoal, 'id'>) => void;
  removeGoal: (id: string) => void;
  toggleGoal: (id: string) => void;
  updateGoalProgress: (sessions: number, questions: number, stars: number) => void;
  resetDailyProgress: () => void;
  getGoalProgress: (goal: LearningGoal) => { current: number; target: number; percent: number };
}

export const useLearningGoalsStore = create<LearningGoalsState>()(
  persist(
    (set, get) => ({
      goals: [
        // Default goals
        {
          id: 'default-daily-sessions',
          type: 'daily',
          targetSessions: 3,
          targetQuestions: 0,
          targetStars: 0,
          subject: 'all',
          isActive: true,
        },
        {
          id: 'default-daily-stars',
          type: 'daily',
          targetSessions: 0,
          targetQuestions: 0,
          targetStars: 5,
          subject: 'all',
          isActive: true,
        },
      ],
      todayCompletedSessions: 0,
      todayCompletedQuestions: 0,
      todayEarnedStars: 0,
      weekCompletedSessions: 0,
      weekCompletedQuestions: 0,
      weekEarnedStars: 0,
      lastResetDate: new Date().toISOString().split('T')[0],
      lastWeekResetDate: new Date().toISOString().split('T')[0],

      addGoal: (goal) => set((s) => ({
        goals: [...s.goals, { ...goal, id: `goal-${Date.now()}` }],
      })),

      removeGoal: (id) => set((s) => ({
        goals: s.goals.filter(g => g.id !== id),
      })),

      toggleGoal: (id) => set((s) => ({
        goals: s.goals.map(g => g.id === id ? { ...g, isActive: !g.isActive } : g),
      })),

      updateGoalProgress: (sessions, questions, stars) => {
        const today = new Date().toISOString().split('T')[0];
        const state = get();
        
        // Check if we need to reset daily progress
        let dailySessions = state.todayCompletedSessions;
        let dailyQuestions = state.todayCompletedQuestions;
        let dailyStars = state.todayEarnedStars;
        
        if (state.lastResetDate !== today) {
          dailySessions = 0;
          dailyQuestions = 0;
          dailyStars = 0;
        }

        // Check if we need to reset weekly progress
        let weekSessions = state.weekCompletedSessions;
        let weekQuestions = state.weekCompletedQuestions;
        let weekStars = state.weekEarnedStars;

        const lastWeekReset = new Date(state.lastWeekResetDate);
        const todayDate = new Date(today);
        const dayOfWeek = todayDate.getDay();
        const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        const thisMonday = new Date(todayDate);
        thisMonday.setDate(todayDate.getDate() - daysSinceMonday);
        const lastResetMonday = new Date(lastWeekReset);
        const lastResetDaysSinceMonday = lastWeekReset.getDay() === 0 ? 6 : lastWeekReset.getDay() - 1;
        lastResetMonday.setDate(lastWeekReset.getDate() - lastResetDaysSinceMonday);

        if (thisMonday.getTime() > lastResetMonday.getTime()) {
          weekSessions = 0;
          weekQuestions = 0;
          weekStars = 0;
        }
        
        set({
          todayCompletedSessions: dailySessions + sessions,
          todayCompletedQuestions: dailyQuestions + questions,
          todayEarnedStars: dailyStars + stars,
          weekCompletedSessions: weekSessions + sessions,
          weekCompletedQuestions: weekQuestions + questions,
          weekEarnedStars: weekStars + stars,
          lastResetDate: today,
          lastWeekResetDate: thisMonday.getTime() > lastResetMonday.getTime() ? today : state.lastWeekResetDate,
        });
      },

      resetDailyProgress: () => set({
        todayCompletedSessions: 0,
        todayCompletedQuestions: 0,
        todayEarnedStars: 0,
        lastResetDate: new Date().toISOString().split('T')[0],
      }),

      getGoalProgress: (goal) => {
        const state = get();
        let current = 0;
        let target = 0;

        if (goal.type === 'daily') {
          if (goal.targetSessions > 0) {
            current = state.todayCompletedSessions;
            target = goal.targetSessions;
          } else if (goal.targetQuestions > 0) {
            current = state.todayCompletedQuestions;
            target = goal.targetQuestions;
          } else if (goal.targetStars > 0) {
            current = state.todayEarnedStars;
            target = goal.targetStars;
          }
        } else {
          if (goal.targetSessions > 0) {
            current = state.weekCompletedSessions;
            target = goal.targetSessions;
          } else if (goal.targetQuestions > 0) {
            current = state.weekCompletedQuestions;
            target = goal.targetQuestions;
          } else if (goal.targetStars > 0) {
            current = state.weekEarnedStars;
            target = goal.targetStars;
          }
        }

        return {
          current,
          target,
          percent: target > 0 ? Math.min(Math.round((current / target) * 100), 100) : 0,
        };
      },
    }),
    {
      name: 'math-genius-learning-goals',
      partialize: (state) => ({
        goals: state.goals,
        todayCompletedSessions: state.todayCompletedSessions,
        todayCompletedQuestions: state.todayCompletedQuestions,
        todayEarnedStars: state.todayEarnedStars,
        weekCompletedSessions: state.weekCompletedSessions,
        weekCompletedQuestions: state.weekCompletedQuestions,
        weekEarnedStars: state.weekEarnedStars,
        lastResetDate: state.lastResetDate,
        lastWeekResetDate: state.lastWeekResetDate,
      }),
    }
  )
);
