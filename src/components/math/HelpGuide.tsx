'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useGameStore } from '@/lib/game-store';
import { playClickSound } from '@/lib/sound';
import BottomNav from './BottomNav';

// ─── Section Data ──────────────────────────────────────────────────────────

interface HelpSection {
  id: string;
  emoji: string;
  title: string;
  gradient: string;
  items: { icon: string; title: string; desc: string }[];
}

const SECTIONS: HelpSection[] = [
  {
    id: 'learning',
    emoji: '📚',
    title: '学习系统',
    gradient: 'from-amber-400 to-orange-400',
    items: [
      { icon: '📝', title: '自由练习', desc: '选择运算和难度，按自己的节奏做题' },
      { icon: '⏱️', title: '限时挑战', desc: '在限定时间内尽量多答题，挑战速度极限' },
      { icon: '🗺️', title: '闯关模式', desc: '逐关挑战收集星星，用星星解锁更多关卡' },
      { icon: '📖', title: '语文练习', desc: '识字、拼音、词语、成语、古诗等多种题型' },
      { icon: '🔤', title: '英语练习', desc: '看图选词、听力、拼写，从1年级到6年级' },
      { icon: '⭐', title: '经验升级', desc: '答题获得经验值，升级后解锁更多功能' },
    ],
  },
  {
    id: 'coins',
    emoji: '💰',
    title: '金币奖励',
    gradient: 'from-yellow-400 to-amber-500',
    items: [
      { icon: '🪙', title: '基础金币', desc: '每答对1题获得2金币' },
      { icon: '🌟', title: '星星奖励', desc: '获得2-3星额外奖励5-15金币' },
      { icon: '🔥', title: '连击奖励', desc: '连续答对3题以上，每连击+1金币' },
      { icon: '💯', title: '满分奖励', desc: '全部答对额外+20金币' },
      { icon: '⚡', title: '速度奖励', desc: '平均答题快于5秒，额外+10金币' },
      { icon: '📅', title: '连续学习', desc: '连续学习天数越多，额外金币越多' },
      { icon: '💎', title: '暴击加成', desc: '有一定概率触发暴击，金币翻倍！' },
      { icon: '🐾', title: '天赋加成', desc: '不同宠物有不同天赋，额外加成金币' },
    ],
  },
  {
    id: 'pet',
    emoji: '🐾',
    title: '宠物系统',
    gradient: 'from-rose-400 to-pink-500',
    items: [
      { icon: '🏠', title: '领养宠物', desc: '在宠物小屋选择一只喜欢的小伙伴' },
      { icon: '📊', title: '宠物成长', desc: '宠物通过答题获得经验，等级越来越高' },
      { icon: '😊', title: '宠物心情', desc: '喂食和玩耍可以让宠物更开心' },
      { icon: '🛒', title: '宠物商店', desc: '用金币购买家具，装扮宠物的小房间' },
      { icon: '✨', title: '独特天赋', desc: '每种宠物有不同的天赋，影响金币和经验' },
      { icon: '🔄', title: '更换宠物', desc: '可以随时换宠物，但等级会重置哦' },
    ],
  },
  {
    id: 'talents',
    emoji: '✨',
    title: '宠物天赋',
    gradient: 'from-violet-400 to-purple-500',
    items: [
      { icon: '🐱', title: '布偶猫 · 财运亨通', desc: '金币加成额外+20%，赚钱小能手' },
      { icon: '🐕', title: '柴犬 · 暴击之王', desc: '暴击率额外+8%，经常触发暴击' },
      { icon: '🦮', title: '金毛 · 学霸附体', desc: '经验加成额外+15%，升级更快' },
      { icon: '🐰', title: '兔子 · 连击达人', desc: '连击奖励额外+50%，连击之王' },
      { icon: '🐹', title: '仓鼠 · 聚宝盆', desc: '满分奖励+15，速度奖励+8' },
      { icon: '🦜', title: '鹦鹉 · 外语天才', desc: '英语练习金币额外+25%' },
      { icon: '🐼', title: '小熊猫 · 全能学霸', desc: '所有加成额外+8%，均衡发展' },
    ],
  },
  {
    id: 'skills',
    emoji: '⚡',
    title: '技能与等级',
    gradient: 'from-emerald-400 to-teal-500',
    items: [
      { icon: '🛡️', title: '金币加成', desc: '宠物等级越高，金币加成越多' },
      { icon: '📈', title: '经验加成', desc: '宠物等级越高，获得的经验也越多' },
      { icon: '💥', title: '暴击率', desc: '等级提升增加暴击概率' },
      { icon: '🔥', title: '连击倍率', desc: '高等级宠物连击奖励更高' },
      { icon: '🔓', title: '等级解锁', desc: '达到特定等级解锁新功能和奖励' },
    ],
  },
  {
    id: 'achievements',
    emoji: '🏆',
    title: '成就系统',
    gradient: 'from-amber-400 to-yellow-500',
    items: [
      { icon: '🌟', title: '初次练习', desc: '完成第一次练习' },
      { icon: '🔥', title: '坚持学习', desc: '连续学习3天、7天、30天等' },
      { icon: '💯', title: '完美表现', desc: '多次获得满分' },
      { icon: '⚡', title: '速度之星', desc: '快速完成练习' },
      { icon: '🧮', title: '全科达人', desc: '三个科目都取得好成绩' },
    ],
  },
  {
    id: 'tips',
    emoji: '💡',
    title: '答题技巧',
    gradient: 'from-cyan-400 to-blue-500',
    items: [
      { icon: '🔥', title: '保持连击', desc: '连续答对可以累积连击，连击越高奖励越多' },
      { icon: '⏱️', title: '注意速度', desc: '每题平均5秒内有额外速度奖励' },
      { icon: '💯', title: '追求满分', desc: '全部答对有20金币满分奖励' },
      { icon: '📅', title: '每天练习', desc: '连续登录和练习有额外金币奖励' },
      { icon: '🐾', title: '善用天赋', desc: '英语练习选鹦鹉，赚金币选布偶猫' },
      { icon: '📈', title: '升级宠物', desc: '宠物等级越高，各种加成越强' },
    ],
  },
];

// ─── Animation ──────────────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

// ─── Collapsible Section ───────────────────────────────────────────────────

function SectionCard({ section, defaultOpen = false }: { section: HelpSection; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <motion.div variants={itemVariants}>
      <button
        onClick={() => { setOpen(!open); playClickSound(); }}
        className="w-full text-left"
      >
        <div className={`flex items-center gap-3 rounded-2xl bg-gradient-to-r ${section.gradient} p-4 text-white shadow-md`}>
          <span className="text-2xl">{section.emoji}</span>
          <span className="text-sm font-bold flex-1">{section.title}</span>
          <span className="text-xs opacity-80">{section.items.length}项</span>
          {open ? <ChevronUp className="w-4 h-4 opacity-80" /> : <ChevronDown className="w-4 h-4 opacity-80" />}
        </div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="pt-2 space-y-1.5">
              {section.items.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="flex items-start gap-2.5 rounded-xl bg-white p-3 shadow-sm"
                >
                  <span className="text-base mt-0.5 flex-shrink-0">{item.icon}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-800">{item.title}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────

export default function HelpGuide() {
  const { setCurrentView } = useGameStore();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-amber-50/20 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-500 to-purple-600 px-4 pb-5 text-white">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => { playClickSound(); setCurrentView('home'); }}
              className="flex items-center gap-1 text-white/80 hover:text-white text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              返回
            </button>
          </div>
          <h1 className="text-2xl font-bold">📖 游戏指南</h1>
          <p className="text-white/80 text-xs mt-0.5">了解所有规则，成为学习小达人</p>
        </div>
      </div>

      {/* Sections */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-md mx-auto px-4 pt-4 pb-24 space-y-3"
      >
        {/* Welcome Card */}
        <motion.div variants={itemVariants}>
          <div className="rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 border border-amber-100 p-4">
            <div className="text-center">
              <p className="text-3xl mb-2">🎓</p>
              <p className="text-sm font-bold text-gray-800">欢迎来到学习小达人！</p>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                这里是所有系统规则的说明。点击下方的分类查看详情吧！
              </p>
            </div>
          </div>
        </motion.div>

        {SECTIONS.map((section, idx) => (
          <SectionCard key={section.id} section={section} defaultOpen={idx === 0} />
        ))}

        {/* Footer */}
        <motion.div variants={itemVariants} className="text-center pt-2">
          <p className="text-xs text-gray-300">Made with ❤️ for kids</p>
        </motion.div>
      </motion.div>

      <BottomNav />
    </div>
  );
}
