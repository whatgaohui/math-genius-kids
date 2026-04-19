'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Star,
  Coins,
  Zap,
  Flame,
  Target,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import { useGameStore } from '@/lib/game-store';
import { PET_CONFIGS, PET_ABILITIES, LEVEL_UNLOCKS } from '@/lib/pet-store';
import { ACHIEVEMENTS } from '@/lib/achievements';
import { playClickSound } from '@/lib/sound';
import BottomNav from './BottomNav';

// ─── Tab Data ────────────────────────────────────────────────────────────────

interface GuideTab {
  id: string;
  emoji: string;
  label: string;
  color: string;
}

const TABS: GuideTab[] = [
  { id: 'start', emoji: '🎮', label: '入门', color: 'from-violet-500 to-purple-600' },
  { id: 'math', emoji: '🧮', label: '数学', color: 'from-amber-500 to-orange-500' },
  { id: 'chinese', emoji: '📖', label: '语文', color: 'from-rose-500 to-orange-500' },
  { id: 'english', emoji: '🔤', label: '英语', color: 'from-emerald-500 to-teal-500' },
  { id: 'coins', emoji: '💰', label: '金币', color: 'from-yellow-500 to-amber-500' },
  { id: 'pet', emoji: '🐾', label: '宠物', color: 'from-pink-500 to-rose-500' },
  { id: 'talent', emoji: '✨', label: '天赋', color: 'from-indigo-500 to-purple-500' },
  { id: 'skill', emoji: '⚡', label: '技能', color: 'from-cyan-500 to-blue-500' },
  { id: 'achievement', emoji: '🏆', label: '成就', color: 'from-amber-400 to-yellow-500' },
  { id: 'tips', emoji: '💡', label: '攻略', color: 'from-orange-400 to-red-400' },
];

// ─── Animation ──────────────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 350, damping: 28 } },
};

// ─── Reusable UI Components ─────────────────────────────────────────────────

function GuideCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div variants={itemVariants} className={`rounded-2xl bg-white p-4 shadow-sm border border-gray-100/80 ${className}`}>
      {children}
    </motion.div>
  );
}

function SectionTitle({ emoji, title, subtitle }: { emoji: string; title: string; subtitle?: string }) {
  return (
    <motion.div variants={itemVariants} className="mb-3 mt-1">
      <div className="flex items-center gap-2 mb-0.5">
        <span className="text-xl">{emoji}</span>
        <h3 className="text-sm font-bold text-gray-800">{title}</h3>
      </div>
      {subtitle && <p className="text-[11px] text-gray-400 ml-8">{subtitle}</p>}
    </motion.div>
  );
}

function FormulaBox({ label, formula, result }: { label: string; formula: string; result: string }) {
  return (
    <motion.div variants={itemVariants} className="rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 p-3">
      <p className="text-[11px] font-bold text-amber-700 mb-1">{label}</p>
      <p className="text-xs text-gray-600 font-mono leading-relaxed">{formula}</p>
      <p className="text-[11px] text-amber-600 mt-1">{result}</p>
    </motion.div>
  );
}

function BonusTag({ emoji, label, value, highlight = false }: { emoji: string; label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-medium ${highlight ? 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 border border-amber-200' : 'bg-gray-50 text-gray-600'}`}>
      <span>{emoji}</span>
      <span>{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}

function PetTalentRow({ pet, index }: { pet: typeof PET_CONFIGS[number]; index: number }) {
  const talent = pet.talent;
  return (
    <motion.div
      variants={itemVariants}
      className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm border border-gray-100/80"
    >
      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center text-2xl">
        {pet.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-gray-800">{pet.name}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-violet-100 text-violet-600 font-bold">{talent.emoji} {talent.name}</span>
        </div>
        <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{talent.description}</p>
        <div className="flex flex-wrap gap-1 mt-1.5">
          {talent.coinBonusExtra > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">金币+{talent.coinBonusExtra}%</span>}
          {talent.critChanceExtra > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-700">暴击+{(talent.critChanceExtra * 100).toFixed(0)}%</span>}
          {talent.xpBonusExtra > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">经验+{talent.xpBonusExtra}%</span>}
          {talent.comboMultiplierExtra > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-100 text-orange-700">连击+{(talent.comboMultiplierExtra * 100).toFixed(0)}%</span>}
          {talent.perfectBonusExtra > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-700">满分+{talent.perfectBonusExtra}</span>}
          {talent.speedBonusExtra > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-100 text-cyan-700">速度+{talent.speedBonusExtra}</span>}
          {talent.englishBonusExtra > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">英语+{talent.englishBonusExtra}%</span>}
          {talent.allBonusExtra > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-100 text-violet-700">全属性+{talent.allBonusExtra}%</span>}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Tab Content Components ──────────────────────────────────────────────────

function GettingStartedTab() {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-3">
      {/* Welcome */}
      <GuideCard>
        <div className="text-center py-2">
          <motion.span
            className="text-5xl block mb-2"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >🎓</motion.span>
          <h2 className="text-base font-black text-gray-800">欢迎来到学习小达人！</h2>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            这是一个集数学、语文、英语于一体的学习乐园，<br />还有可爱的宠物伙伴陪你一起成长！
          </p>
        </div>
      </GuideCard>

      {/* How to play */}
      <SectionTitle emoji="📋" title="怎么玩？" subtitle="三步开始你的学习之旅" />

      <GuideCard>
        <div className="space-y-3">
          {[
            { step: 1, emoji: '📚', title: '选择科目', desc: '从数学、语文、英语三科中选择一科开始练习。每个科目都有不同的题型和难度等你挑战！' },
            { step: 2, emoji: '✏️', title: '开始答题', desc: '选择你喜欢的模式，设置好年级和题数，点击"开始练习"就可以啦！答题要又快又准哦~' },
            { step: 3, emoji: '🏆', title: '获取奖励', desc: '答完题会得到星星、经验值和金币！金币可以用来养宠物、买家具。积累越多奖励越丰富！' },
          ].map((item) => (
            <div key={item.step} className="flex gap-3 items-start">
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
                {item.step}
              </div>
              <div>
                <p className="text-xs font-bold text-gray-800">{item.emoji} {item.title}</p>
                <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </GuideCard>

      {/* Reward overview */}
      <SectionTitle emoji="🎁" title="答题有什么奖励？" />

      <GuideCard>
        <div className="grid grid-cols-2 gap-2">
          {[
            { emoji: '⭐', name: '星星', desc: '评价你的表现\n⭐⭐⭐ = 满分', color: 'bg-amber-50 border-amber-100' },
            { emoji: '📈', name: '经验值', desc: '积累升级\n升级解锁新功能', color: 'bg-blue-50 border-blue-100' },
            { emoji: '🪙', name: '金币', desc: '答题赚金币\n买道具养宠物', color: 'bg-yellow-50 border-yellow-100' },
            { emoji: '🐾', name: '宠物经验', desc: '宠物也升级\n解锁新技能', color: 'bg-pink-50 border-pink-100' },
          ].map((r) => (
            <div key={r.name} className={`rounded-xl border p-2.5 text-center ${r.color}`}>
              <span className="text-xl">{r.emoji}</span>
              <p className="text-[11px] font-bold text-gray-700 mt-1">{r.name}</p>
              <p className="text-[10px] text-gray-500 mt-0.5 whitespace-pre-line leading-relaxed">{r.desc}</p>
            </div>
          ))}
        </div>
      </GuideCard>

      {/* Star rating */}
      <SectionTitle emoji="⭐" title="星星评价规则" subtitle="表现越好，星星越多" />

      <GuideCard>
        <div className="space-y-2">
          <div className="flex items-center gap-3 rounded-lg bg-amber-50 p-2.5">
            <div className="flex gap-0.5">
              {[1,2,3].map(s => <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
            </div>
            <div>
              <p className="text-xs font-bold text-amber-800">三星 · 完美！</p>
              <p className="text-[11px] text-amber-600">正确率 ≥ 90%</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg bg-orange-50 p-2.5">
            <div className="flex gap-0.5">
              {[1,2].map(s => <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
              <Star className="w-4 h-4 text-gray-200" />
            </div>
            <div>
              <p className="text-xs font-bold text-orange-800">两星 · 不错！</p>
              <p className="text-[11px] text-orange-600">正确率 ≥ 70%</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-2.5">
            <div className="flex gap-0.5">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <Star className="w-4 h-4 text-gray-200" />
              <Star className="w-4 h-4 text-gray-200" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-700">一星 · 加油！</p>
              <p className="text-[11px] text-gray-500">正确率 ≥ 50%</p>
            </div>
          </div>
        </div>
      </GuideCard>
    </motion.div>
  );
}

function MathGuideTab() {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-3">
      <SectionTitle emoji="✏️" title="自由练习" subtitle="按自己的节奏做题" />
      <GuideCard>
        <div className="space-y-2">
          <p className="text-[11px] text-gray-600 leading-relaxed">
            自由练习是最灵活的模式！你可以选择：
          </p>
          <div className="space-y-2 mt-2">
            {[
              { emoji: '➕', name: '加法', desc: '两个数相加，从简单到困难' },
              { emoji: '➖', name: '减法', desc: '两个数相减，锻炼计算能力' },
              { emoji: '✖️', name: '乘法', desc: '乘法口诀，打好基础' },
              { emoji: '➗', name: '除法', desc: '整除计算，提升思维' },
              { emoji: '🔀', name: '混合运算', desc: '加减乘除混合，综合练习' },
              { emoji: '⚖️', name: '大小比较', desc: '比一比谁大谁小' },
            ].map((op) => (
              <div key={op.name} className="flex items-center gap-2">
                <span className="text-base w-6 text-center">{op.emoji}</span>
                <div>
                  <span className="text-xs font-bold text-gray-700">{op.name}</span>
                  <span className="text-[11px] text-gray-400 ml-2">{op.desc}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2 rounded-lg bg-amber-50 p-2.5">
            <p className="text-[11px] text-amber-700 leading-relaxed">
              💡 <b>难度说明：</b>简单 = 10以内 | 中等 = 50以内 | 困难 = 100以内
            </p>
          </div>
        </div>
      </GuideCard>

      <SectionTitle emoji="⚡" title="限时挑战" subtitle="和计时器赛跑！" />
      <GuideCard>
        <div className="space-y-2">
          <p className="text-[11px] text-gray-600 leading-relaxed">
            在限定时间内尽量多答题！挑战你的速度极限！
          </p>
          <div className="grid grid-cols-4 gap-2 mt-2">
            {[
              { time: '30秒', emoji: '🐇', tip: '热身用' },
              { time: '60秒', emoji: '🏃', tip: '推荐新手' },
              { time: '90秒', emoji: '🚴', tip: '中等挑战' },
              { time: '120秒', emoji: '🏃‍♂️', tip: '高手挑战' },
            ].map((t) => (
              <div key={t.time} className="rounded-xl bg-red-50 border border-red-100 p-2 text-center">
                <span className="text-lg">{t.emoji}</span>
                <p className="text-xs font-bold text-red-700 mt-0.5">{t.time}</p>
                <p className="text-[10px] text-red-400">{t.tip}</p>
              </div>
            ))}
          </div>
          <div className="rounded-lg bg-red-50 p-2.5 mt-2">
            <p className="text-[11px] text-red-700 leading-relaxed">
              ⏱️ <b>规则：</b>答对自动跳下一题（省时间！），答错不跳但消耗时间。速度越快得分越多！
            </p>
          </div>
        </div>
      </GuideCard>

      <SectionTitle emoji="🗺️" title="冒险闯关" subtitle="150层无限挑战！" />
      <GuideCard>
        <div className="space-y-2">
          <p className="text-[11px] text-gray-600 leading-relaxed">
            冒险模式借鉴"大秘境"玩法，共有<b>150层</b>挑战！越往高层难度越大，但奖励也越丰厚！
          </p>
          <div className="mt-2 rounded-lg bg-emerald-50 p-2.5">
            <p className="text-[11px] text-emerald-700 leading-relaxed">
              🏔️ <b>玩法：</b>从第1层开始，答对一组题即可进入下一层。每10层为一个难度阶段，数字越来越大、运算越来越复杂！
            </p>
          </div>
          <div className="grid grid-cols-4 gap-1.5 mt-2">
            {[
              { name: '第1层', desc: '个位数加法', emoji: '🌱' },
              { name: '第10层', desc: '两位数加减', emoji: '📝' },
              { name: '第30层', desc: '乘法挑战', emoji: '🔢' },
              { name: '第50层', desc: '除法初探', emoji: '🧩' },
              { name: '第70层', desc: '混合运算', emoji: '🔄' },
              { name: '第100层', desc: '大数挑战', emoji: '💪' },
              { name: '第130层', desc: '极限考验', emoji: '🌟' },
              { name: '第150层', desc: '终极传说', emoji: '👑' },
            ].map((lvl) => (
              <div key={lvl.name} className="rounded-lg bg-gray-50 border border-gray-100 p-1.5 text-center">
                <span className="text-sm">{lvl.emoji}</span>
                <p className="text-[10px] font-bold text-gray-700 truncate">{lvl.name}</p>
                <p className="text-[9px] text-gray-400">{lvl.desc}</p>
              </div>
            ))}
          </div>
          <div className="rounded-lg bg-orange-50 p-2.5 mt-2">
            <p className="text-[11px] text-orange-700 leading-relaxed">
              💡 <b>奖励加成：</b>冒险模式有楼层倍率加成！公式为 <b>min(⌊层数/10⌋+1, 10)倍</b>，层数越高倍率越大，最高10倍！
            </p>
          </div>
        </div>
      </GuideCard>
    </motion.div>
  );
}

function ChineseGuideTab() {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-3">
      <SectionTitle emoji="📖" title="语文三种模式" subtitle="自由练习、限时挑战、冒险闯关" />

      <GuideCard>
        <div className="space-y-2.5">
          <div className="rounded-xl bg-gradient-to-r from-rose-50/80 to-orange-50/80 p-3 border border-rose-100/60">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-lg">✏️</span>
              <span className="text-xs font-bold text-gray-800">自由练习</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-600">8种题型</span>
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed">按自己的节奏做题，选择年级和题型，随时开始。</p>
          </div>
          <div className="rounded-xl bg-gradient-to-r from-orange-50/80 to-red-50/80 p-3 border border-orange-100/60">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-lg">⚡</span>
              <span className="text-xs font-bold text-gray-800">限时挑战</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-600">1.5x金币</span>
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed">30/60/90/120秒限时，答对自动跳下一题。速度模式金币奖励<b>1.5倍</b>加成！</p>
          </div>
          <div className="rounded-xl bg-gradient-to-r from-emerald-50/80 to-teal-50/80 p-3 border border-emerald-100/60">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-lg">🏔️</span>
              <span className="text-xs font-bold text-gray-800">冒险闯关</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-600">150层</span>
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed">大秘境式150层挑战，楼层倍率加成最高<b>10倍</b>！每10层解锁更高难度。</p>
          </div>
        </div>
      </GuideCard>

      <SectionTitle emoji="📝" title="八种题型" subtitle="从1年级到6年级，越学越有趣！" />

      <GuideCard>
        <div className="space-y-2.5">
          {[
            { emoji: '📝', name: '识字认字', grade: '1年级+', desc: '看汉字，选出正确的读音或意思。打好认字基础！' },
            { emoji: '🔤', name: '拼音练习', grade: '1年级+', desc: '看拼音选汉字，或看汉字选拼音。拼音是小学生的基本功！' },
            { emoji: '📚', name: '词语搭配', grade: '1年级+', desc: '选择正确的词语搭配。学习常用词汇和搭配方式！' },
            { emoji: '🎧', name: '听写模式', grade: '2年级+', desc: '听发音写出正确的汉字。锻炼听力和记忆力！' },
            { emoji: '🖍️', name: '成语填空', grade: '4年级+', desc: '在成语中填入缺失的字。感受中华文化的魅力！' },
            { emoji: '🔄', name: '反义词大挑战', grade: '4年级+', desc: '找出词语的反义词。扩大你的词汇量！' },
            { emoji: '📜', name: '古诗填空', grade: '5年级+', desc: '背诵古诗，在空白处填入正确的诗句。品味古典文学！' },
            { emoji: '🔗', name: '近义词连连看', grade: '4年级+', desc: '找出意思相近的词语。丰富表达方式！' },
          ].map((mode) => (
            <div key={mode.name} className="flex items-start gap-2.5 rounded-xl bg-gradient-to-r from-rose-50/80 to-orange-50/80 p-2.5 border border-rose-100/60">
              <span className="text-xl flex-shrink-0">{mode.emoji}</span>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-gray-800">{mode.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-600">{mode.grade}</span>
                </div>
                <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{mode.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </GuideCard>

      <SectionTitle emoji="📊" title="年级难度说明" subtitle="选择适合你的年级" />

      <GuideCard>
        <div className="grid grid-cols-2 gap-2">
          {[
            { grade: '1-2年级', emoji: '🌱', desc: '基础汉字、简单拼音、常用词语', color: 'bg-green-50 border-green-100' },
            { grade: '3年级', emoji: '🌿', desc: '进阶汉字、词语搭配、听写', color: 'bg-emerald-50 border-emerald-100' },
            { grade: '4年级', emoji: '🌳', desc: '成语、反义词、近义词', color: 'bg-teal-50 border-teal-100' },
            { grade: '5-6年级', emoji: '🏔️', desc: '古诗填空、高阶词汇、文学素养', color: 'bg-cyan-50 border-cyan-100' },
          ].map((g) => (
            <div key={g.grade} className={`rounded-xl border p-2.5 ${g.color}`}>
              <span className="text-lg">{g.emoji}</span>
              <p className="text-xs font-bold text-gray-700 mt-1">{g.grade}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">{g.desc}</p>
            </div>
          ))}
        </div>
      </GuideCard>

      <GuideCard>
        <div className="rounded-lg bg-rose-50 p-2.5">
          <p className="text-[11px] text-rose-700 leading-relaxed">
            🎧 <b>听写模式提示：</b>需要开启声音！点击🔊按钮可以听到汉字的发音，然后从选项中选出正确的答案。
          </p>
        </div>
      </GuideCard>
    </motion.div>
  );
}

function EnglishGuideTab() {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-3">
      <SectionTitle emoji="🔤" title="英语三种模式" subtitle="自由练习、限时挑战、冒险闯关" />

      <GuideCard>
        <div className="space-y-2.5">
          <div className="rounded-xl bg-gradient-to-r from-emerald-50/80 to-teal-50/80 p-3 border border-emerald-100/60">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-lg">✏️</span>
              <span className="text-xs font-bold text-gray-800">自由练习</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-600">4种题型</span>
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed">按自己的节奏做题，从1年级到6年级循序渐进。</p>
          </div>
          <div className="rounded-xl bg-gradient-to-r from-orange-50/80 to-red-50/80 p-3 border border-orange-100/60">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-lg">⚡</span>
              <span className="text-xs font-bold text-gray-800">限时挑战</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-600">1.5x金币</span>
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed">30/60/90/120秒限时模式，速度越快答题越多，金币奖励<b>1.5倍</b>加成！</p>
          </div>
          <div className="rounded-xl bg-gradient-to-r from-emerald-50/80 to-teal-50/80 p-3 border border-emerald-100/60">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-lg">🏔️</span>
              <span className="text-xs font-bold text-gray-800">冒险闯关</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-600">150层</span>
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed">大秘境式150层挑战，楼层倍率加成最高<b>10倍</b>！词汇难度随楼层递增。</p>
          </div>
        </div>
      </GuideCard>

      <SectionTitle emoji="📝" title="四种题型" subtitle="从字母到单词，快乐学英语！" />

      <GuideCard>
        <div className="space-y-2.5">
          {[
            { emoji: '🖼️', name: '看图选词', desc: '看图片，选出对应的英文单词。用眼睛和大脑一起记单词！' },
            { emoji: '🔤', name: '看词选图', desc: '看英文单词，选出对应的图片。反过来练习加深印象！' },
            { emoji: '🎧', name: '听力选择', desc: '听英文发音，选出对应的单词。锻炼英语听力！' },
            { emoji: '✏️', name: '拼写练习', desc: '看图片或听发音，拼写出正确的英文单词。考验拼写能力！' },
          ].map((mode) => (
            <div key={mode.name} className="flex items-start gap-2.5 rounded-xl bg-gradient-to-r from-emerald-50/80 to-teal-50/80 p-2.5 border border-emerald-100/60">
              <span className="text-xl flex-shrink-0">{mode.emoji}</span>
              <div>
                <span className="text-xs font-bold text-gray-800">{mode.name}</span>
                <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{mode.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </GuideCard>

      <SectionTitle emoji="📚" title="词汇难度分级" subtitle="1年级到6年级循序渐进" />

      <GuideCard>
        <div className="space-y-2">
          {[
            { grades: '1-2年级', emoji: '🌱', words: '颜色、数字、动物、水果、身体部位、家庭成员', color: 'bg-green-50 border-green-100' },
            { grades: '3年级', emoji: '🌿', words: '学校用品、食物饮料、天气、交通工具、职业', color: 'bg-emerald-50 border-emerald-100' },
            { grades: '4年级', emoji: '🌳', words: '衣服、爱好、学科、时间表达、日常活动', color: 'bg-teal-50 border-teal-100' },
            { grades: '5年级', emoji: '🏔️', words: '旅行、自然、情感、比较级、日常习惯', color: 'bg-cyan-50 border-cyan-100' },
            { grades: '6年级', emoji: '🌟', words: '环保、科技、未来计划、高级描述、复杂词汇', color: 'bg-indigo-50 border-indigo-100' },
          ].map((g) => (
            <div key={g.grades} className={`rounded-xl border p-2.5 ${g.color}`}>
              <div className="flex items-center gap-1.5">
                <span>{g.emoji}</span>
                <span className="text-xs font-bold text-gray-700">{g.grades}</span>
              </div>
              <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">{g.words}</p>
            </div>
          ))}
        </div>
      </GuideCard>

      <GuideCard>
        <div className="rounded-lg bg-emerald-50 p-2.5">
          <p className="text-[11px] text-emerald-700 leading-relaxed">
            🦜 <b>英语加分秘籍：</b>选择鹦鹉作为宠物可以获得英语练习金币额外+25%的加成！英语练习选鹦鹉最划算哦！
          </p>
        </div>
      </GuideCard>
    </motion.div>
  );
}

function CoinSystemTab() {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-3">
      <SectionTitle emoji="🪙" title="金币从哪里来？" subtitle="了解每项奖励的计算方式" />

      <GuideCard>
        <div className="space-y-3">
          <p className="text-[11px] text-gray-600 leading-relaxed">
            金币是学习小达人中最重要的货币！每次答题都能获得金币，金币可以用来养宠物和买道具。
          </p>

          <h4 className="text-xs font-bold text-gray-700 flex items-center gap-1">
            <Coins className="w-3.5 h-3.5 text-amber-500" /> 基础奖励
          </h4>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between rounded-lg bg-amber-50 p-2">
              <div className="flex items-center gap-2">
                <span>✅</span>
                <span className="text-xs text-gray-700">答对一题</span>
              </div>
              <span className="text-xs font-bold text-amber-600">+2 金币</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-amber-50 p-2">
              <div className="flex items-center gap-2">
                <span>⭐</span>
                <span className="text-xs text-gray-700">每获得一颗星星</span>
              </div>
              <span className="text-xs font-bold text-amber-600">+5 金币</span>
            </div>
          </div>

          <h4 className="text-xs font-bold text-gray-700 flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-orange-500" /> 连击奖励
          </h4>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between rounded-lg bg-orange-50 p-2">
              <div className="flex items-center gap-2">
                <span>🔥</span>
                <span className="text-xs text-gray-700">连续答对 ≥ 3题</span>
              </div>
              <span className="text-xs font-bold text-orange-600">+5 金币</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-orange-50 p-2">
              <div className="flex items-center gap-2">
                <span>🔥</span>
                <span className="text-xs text-gray-700">连续答对 ≥ 5题</span>
              </div>
              <span className="text-xs font-bold text-orange-600">+10 金币</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-orange-50 p-2">
              <div className="flex items-center gap-2">
                <span>💥</span>
                <span className="text-xs text-gray-700">连续答对 ≥ 10题</span>
              </div>
              <span className="text-xs font-bold text-orange-600">+25 金币</span>
            </div>
            <p className="text-[10px] text-orange-500 mt-0.5">* 高等级宠物连击奖励翻倍！兔子天赋额外+50%</p>
          </div>

          <h4 className="text-xs font-bold text-gray-700 flex items-center gap-1">
            <Target className="w-3.5 h-3.5 text-green-500" /> 特殊奖励
          </h4>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between rounded-lg bg-green-50 p-2">
              <div className="flex items-center gap-2">
                <span>💯</span>
                <span className="text-xs text-gray-700">满分（全部答对，≥5题）</span>
              </div>
              <span className="text-xs font-bold text-green-600">+20 金币</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-cyan-50 p-2">
              <div className="flex items-center gap-2">
                <span>⚡</span>
                <span className="text-xs text-gray-700">速度奖励（30秒内完成≥5题）</span>
              </div>
              <span className="text-xs font-bold text-cyan-600">+10 金币</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-rose-50 p-2">
              <div className="flex items-center gap-2">
                <span>📅</span>
                <span className="text-xs text-gray-700">连续学习奖励</span>
              </div>
              <span className="text-xs font-bold text-rose-600">每天 ×3，上限30</span>
            </div>
          </div>

          <h4 className="text-xs font-bold text-gray-700 flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-red-500" /> 模式加成
          </h4>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between rounded-lg bg-gradient-to-r from-red-50 to-orange-50 p-2 border border-red-100">
              <div className="flex items-center gap-2">
                <span>⚡</span>
                <span className="text-xs text-gray-700">限时挑战模式</span>
              </div>
              <span className="text-xs font-bold text-red-600">金币 ×1.5</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 p-2 border border-emerald-100">
              <div className="flex items-center gap-2">
                <span>🏔️</span>
                <span className="text-xs text-gray-700">冒险模式（楼层倍率）</span>
              </div>
              <span className="text-xs font-bold text-emerald-600">最高 ×10</span>
            </div>
            <p className="text-[10px] text-gray-500 mt-0.5">* 冒险模式倍率 = min(⌊层数/10⌋+1, 10)，第1层1倍，第10层2倍，第50层6倍...第100层+都是10倍！</p>
          </div>

          <h4 className="text-xs font-bold text-gray-700 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-yellow-500" /> 暴击加成
          </h4>
          <div className="rounded-lg bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 p-3">
            <p className="text-[11px] text-amber-800 leading-relaxed">
              💎 <b>暴击</b>是一定概率触发的特殊事件！触发后当前所有金币<b>翻倍</b>！
            </p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              <BonusTag emoji="🎲" label="基础暴击率" value="10%" highlight />
              <BonusTag emoji="🐾" label="宠物Lv.10+" value="+5%" />
              <BonusTag emoji="🐕" label="柴犬天赋" value="+8%" />
              <BonusTag emoji="💥" label="触发后" value="×2" highlight />
            </div>
          </div>

          <h4 className="text-xs font-bold text-gray-700 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-violet-500" /> 宠物加成
          </h4>
          <div className="rounded-lg bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 p-3">
            <p className="text-[11px] text-violet-800 leading-relaxed mb-2">
              🐾 宠物等级越高，金币加成越多！不同宠物天赋还能提供额外加成！
            </p>
            <div className="space-y-1">
              <p className="text-[11px] text-violet-600">• 宠物 Lv.5 → 金币加成 <b>+15%</b></p>
              <p className="text-[11px] text-violet-600">• 宠物 Lv.16 → 金币加成 <b>+25%</b></p>
              <p className="text-[11px] text-violet-600">• 宠物 Lv.20 → 金币加成 <b>+30%</b></p>
              <p className="text-[11px] text-violet-600">• 🐱 布偶猫天赋 → 金币额外 <b>+20%</b></p>
              <p className="text-[11px] text-violet-600">• 🐼 小熊猫天赋 → 全属性额外 <b>+8%</b></p>
            </div>
          </div>
        </div>
      </GuideCard>

      {/* Formula */}
      <SectionTitle emoji="📐" title="金币计算公式" subtitle="看懂每一枚金币的来源" />
      <FormulaBox
        label="总金币 = (基础 + 星星 + 连击 + 满分 + 速度 + 连续天数) × (1 + 宠物加成%) × 暴击倍率"
        formula="小计 = 基础金币(正确×2) + 星星(×5) + 连击(3连+5, 5连+10, 10连+25)
+ 满分(全对+20) + 速度(<30秒+10) + 连续天数(天×3, 上限30)
宠物加成 = 小计 × 加成百分比
暴击 = (小计 + 宠物加成) × 暴击倍率(1或2)"
        result="最终金币 = 小计 + 宠物加成 + 天赋加成 + 暴击额外"
      />

      {/* Coin usage */}
      <SectionTitle emoji="🛒" title="金币怎么花？" subtitle="合理消费让金币更有价值" />
      <GuideCard>
        <div className="space-y-2">
          {[
            { emoji: '🍖', name: '喂食宠物', cost: '5金币/次', desc: '提升宠物心情+10，获得10点宠物经验' },
            { emoji: '🎾', name: '和宠物玩', cost: '3金币/次', desc: '提升宠物心情+15，获得5点宠物经验' },
            { emoji: '🛏️', name: '买家具', cost: '30~500金币', desc: '装饰宠物房间，4类家具可选' },
          ].map((item) => (
            <div key={item.name} className="flex items-center gap-2.5 rounded-lg bg-gray-50 p-2">
              <span className="text-lg">{item.emoji}</span>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-gray-700">{item.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-600">{item.cost}</span>
                </div>
                <p className="text-[11px] text-gray-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </GuideCard>
    </motion.div>
  );
}

function PetSystemTab() {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-3">
      <SectionTitle emoji="🐾" title="宠物系统概览" subtitle="你的学习好伙伴" />

      <GuideCard>
        <div className="text-center py-1">
          <motion.span
            className="text-4xl block mb-1"
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >🐱</motion.span>
          <p className="text-xs text-gray-600 leading-relaxed">
            领养一只宠物小伙伴，它会陪你一起学习成长！<br />宠物等级越高，给你带来的加成就越强！
          </p>
        </div>
      </GuideCard>

      <SectionTitle emoji="🏠" title="领养宠物" subtitle="7种可爱宠物等你领养" />
      <GuideCard>
        <div className="grid grid-cols-2 gap-2">
          {PET_CONFIGS.map((pet) => (
            <div key={pet.id} className="rounded-xl bg-gradient-to-br from-pink-50/80 to-rose-50/80 border border-pink-100/60 p-2.5 text-center">
              <span className="text-2xl">{pet.emoji}</span>
              <p className="text-xs font-bold text-gray-700 mt-1">{pet.name}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">{pet.description}</p>
            </div>
          ))}
        </div>
        <div className="rounded-lg bg-rose-50 p-2.5 mt-2">
          <p className="text-[11px] text-rose-700 leading-relaxed">
            ⚠️ <b>重要提示：</b>更换宠物时，宠物等级会重置为1级！请谨慎选择哦~
          </p>
        </div>
      </GuideCard>

      <SectionTitle emoji="📈" title="宠物成长" subtitle="等级1到20，越来越强！" />
      <GuideCard>
        <div className="space-y-2">
          <p className="text-[11px] text-gray-600 leading-relaxed">
            宠物通过获得经验值来升级，升级后会解锁新技能和更强的加成效果！
          </p>
          <div className="rounded-lg bg-blue-50 p-2.5">
            <p className="text-[11px] text-blue-700 leading-relaxed">
              📊 <b>宠物经验来源：</b>答题获得 (正确数×3 + 星星数×10)
            </p>
          </div>
          <div className="space-y-1">
            {[
              { emoji: '1️⃣', level: 'Lv.1', desc: '学习伙伴 — 基础陪伴' },
              { emoji: '2️⃣', level: 'Lv.3', desc: '学习助手 — 经验加成+10%' },
              { emoji: '3️⃣', level: 'Lv.5', desc: '金币猎人 — 金币加成+15%，解锁每日奖励翻倍' },
              { emoji: '4️⃣', level: 'Lv.8', desc: '连击守护 — 连击奖励翻倍' },
              { emoji: '5️⃣', level: 'Lv.10', desc: '幸运星 — 暴击率+5%' },
              { emoji: '6️⃣', level: 'Lv.13', desc: '经验大师 — 经验加成+20%' },
              { emoji: '7️⃣', level: 'Lv.16', desc: '财富之友 — 金币加成+25%' },
              { emoji: '8️⃣', level: 'Lv.20', desc: '满级大师 — 全属性加成+30%！传说称号！' },
            ].map((s) => (
              <div key={s.level} className="flex items-center gap-2 rounded-lg bg-gray-50 p-2">
                <span className="text-sm">{s.emoji}</span>
                <span className="text-[11px] font-bold text-gray-700 w-10">{s.level}</span>
                <span className="text-[11px] text-gray-500">{s.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </GuideCard>

      <SectionTitle emoji="😊" title="宠物心情" subtitle="开心的宠物更有动力！" />
      <GuideCard>
        <div className="space-y-2">
          <p className="text-[11px] text-gray-600 leading-relaxed">
            宠物心情范围 0~100，新领养时心情100分。心情会影响宠物的表现：
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { range: '80-100', emoji: '😄', label: '超开心', color: 'bg-green-50 border-green-100' },
              { range: '50-79', emoji: '🙂', label: '还不错', color: 'bg-yellow-50 border-yellow-100' },
              { range: '20-49', emoji: '😐', label: '有点无聊', color: 'bg-orange-50 border-orange-100' },
              { range: '0-19', emoji: '😢', label: '需要关爱', color: 'bg-red-50 border-red-100' },
            ].map((m) => (
              <div key={m.range} className={`rounded-xl border p-2 text-center ${m.color}`}>
                <span className="text-lg">{m.emoji}</span>
                <p className="text-[10px] font-bold text-gray-700 mt-0.5">{m.label}</p>
                <p className="text-[10px] text-gray-400">{m.range}</p>
              </div>
            ))}
          </div>
          <div className="rounded-lg bg-amber-50 p-2.5">
            <p className="text-[11px] text-amber-700 leading-relaxed">
              💡 答题后心情+3 | 喂食心情+10 (5金币) | 玩耍心情+15 (3金币)
            </p>
          </div>
        </div>
      </GuideCard>

      <SectionTitle emoji="🛏️" title="宠物进化" subtitle="等级越高，外观越酷！" />
      <GuideCard>
        <div className="space-y-1.5">
          <p className="text-[11px] text-gray-600 leading-relaxed mb-1">
            宠物达到特定等级后，外观会发生变化（进化）：
          </p>
          {[
            { pet: '布偶猫', evo: '🐱 → 😺(Lv.8) → 😸(Lv.15) → 😻(Lv.20)' },
            { pet: '柴犬', evo: '🐕 → 🐶(Lv.8) → 🐕‍🦺(Lv.15) → 🦮(Lv.20)' },
            { pet: '金毛', evo: '🐕 → 🦮(Lv.8) → 🦮(Lv.15) → 🐕‍🦺(Lv.20)' },
            { pet: '兔子', evo: '🐰 → 🐇(Lv.8) → 🐇(Lv.15) → 🐇(Lv.20)' },
            { pet: '仓鼠', evo: '🐹 → 🐁(Lv.8) → 🐿️(Lv.15) → 🐿️(Lv.20)' },
            { pet: '鹦鹉', evo: '🦜 → 🦜(Lv.8) → 🦚(Lv.15) → 🦚(Lv.20)' },
            { pet: '小熊猫', evo: '🐼 → 🐼(Lv.8) → 🐼(Lv.15) → 🐼(Lv.20)' },
          ].map((e) => (
            <div key={e.pet} className="flex items-center gap-2 rounded-lg bg-gray-50 p-2">
              <span className="text-[11px] font-bold text-gray-600 w-12">{e.pet}</span>
              <span className="text-[11px] text-gray-500">{e.evo}</span>
            </div>
          ))}
        </div>
      </GuideCard>

      <SectionTitle emoji="🛒" title="宠物商店" subtitle="用金币装扮宠物的小房间" />
      <GuideCard>
        <div className="space-y-2">
          <p className="text-[11px] text-gray-600 leading-relaxed">
            商店里有4类家具可以购买和装备：
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { emoji: '🛏️', cat: '床铺', items: '小窝(50) · 毛绒窝(150) · 小城堡(500)', color: 'bg-pink-50 border-pink-100' },
              { emoji: '🥣', cat: '餐具', items: '小碗(30) · 精致餐具(120) · 大餐台(400)', color: 'bg-amber-50 border-amber-100' },
              { emoji: '🎾', cat: '玩具', items: '小球(40) · 益智玩具(100) · 小滑梯(350)', color: 'bg-green-50 border-green-100' },
              { emoji: '🏮', cat: '装饰', items: '小夜灯(60) · 小盆栽(80) · 彩虹地毯(300)', color: 'bg-purple-50 border-purple-100' },
            ].map((c) => (
              <div key={c.cat} className={`rounded-xl border p-2.5 ${c.color}`}>
                <div className="flex items-center gap-1.5">
                  <span>{c.emoji}</span>
                  <span className="text-xs font-bold text-gray-700">{c.cat}</span>
                </div>
                <p className="text-[10px] text-gray-500 mt-0.5">{c.items}</p>
              </div>
            ))}
          </div>
        </div>
      </GuideCard>
    </motion.div>
  );
}

function TalentCompareTab() {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-3">
      <SectionTitle emoji="✨" title="宠物天赋对比" subtitle="每种宠物都有独特的天赋加成" />

      <GuideCard>
        <div className="rounded-lg bg-gradient-to-r from-violet-50 to-purple-50 p-3 mb-3">
          <p className="text-[11px] text-violet-700 leading-relaxed">
            🎯 <b>选宠策略：</b>不同宠物适合不同的学习目标。选择与你的目标匹配的宠物，可以让学习效率最大化！
          </p>
        </div>
        <div className="space-y-2">
          {PET_CONFIGS.map((pet, idx) => (
            <PetTalentRow key={pet.id} pet={pet} index={idx} />
          ))}
        </div>
      </GuideCard>

      <SectionTitle emoji="💡" title="天赋推荐" subtitle="根据你的目标选择宠物" />
      <GuideCard>
        <div className="space-y-2">
          {[
            { goal: '想赚更多金币', pet: '🐱 布偶猫', reason: '金币加成额外+20%，是所有宠物中金币收益最高的' },
            { goal: '想要更多暴击', pet: '🐕 柴犬', reason: '暴击率额外+8%，配合等级加成暴击率可达23%+！' },
            { goal: '想快速升级', pet: '🦮 金毛', reason: '经验加成额外+15%，让你更快提升等级' },
            { goal: '擅长连续答对', pet: '🐰 兔子', reason: '连击奖励额外+50%，连击达人必备！' },
            { goal: '追求满分表现', pet: '🐹 仓鼠', reason: '满分+15金币，速度+8金币，完美主义者的最佳伙伴' },
            { goal: '专注学英语', pet: '🦜 鹦鹉', reason: '英语练习金币额外+25%，英语小达人的不二之选' },
            { goal: '均衡发展', pet: '🐼 小熊猫', reason: '所有加成额外+8%，各方面都很优秀' },
          ].map((r) => (
            <div key={r.goal} className="rounded-lg bg-gradient-to-r from-gray-50 to-white border border-gray-100 p-2.5">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-bold text-gray-700">{r.goal}</span>
                <span className="text-xs font-bold text-violet-600">→ {r.pet}</span>
              </div>
              <p className="text-[11px] text-gray-500 leading-relaxed">{r.reason}</p>
            </div>
          ))}
        </div>
      </GuideCard>
    </motion.div>
  );
}

function SkillLevelTab() {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-3">
      <SectionTitle emoji="⚡" title="宠物技能树" subtitle="等级越高，技能越强" />

      <GuideCard>
        <div className="space-y-2">
          {PET_ABILITIES.map((ability, idx) => (
            <motion.div key={ability.level} variants={itemVariants} className="flex items-start gap-3">
              <div className="flex-shrink-0 flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                  {ability.emoji}
                </div>
                {idx < PET_ABILITIES.length - 1 && (
                  <div className="w-0.5 h-4 bg-gradient-to-b from-cyan-300 to-blue-200 mt-1" />
                )}
              </div>
              <div className="flex-1 pb-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-gray-800">{ability.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-600 font-bold">Lv.{ability.level}</span>
                </div>
                <p className="text-[11px] text-gray-500 mt-0.5">{ability.description}</p>
                <p className="text-[11px] text-cyan-600 font-bold mt-0.5">{ability.effect}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </GuideCard>

      <SectionTitle emoji="🔓" title="等级解锁奖励" subtitle="达到特定等级解锁新内容！" />

      <GuideCard>
        <div className="space-y-1.5">
          {LEVEL_UNLOCKS.map((unlock) => (
            <motion.div key={unlock.level + unlock.name} variants={itemVariants} className="flex items-center gap-2.5 rounded-lg bg-gray-50 p-2">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-sm">
                {unlock.emoji}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-gray-700">{unlock.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    unlock.category === 'mode' ? 'bg-emerald-100 text-emerald-600' :
                    unlock.category === 'reward' ? 'bg-amber-100 text-amber-600' :
                    'bg-purple-100 text-purple-600'
                  }`}>{unlock.category === 'mode' ? '模式' : unlock.category === 'reward' ? '奖励' : '功能'}</span>
                </div>
                <p className="text-[11px] text-gray-500">{unlock.description}</p>
              </div>
              <span className="text-[10px] font-bold text-gray-400 shrink-0">Lv.{unlock.level}</span>
            </motion.div>
          ))}
        </div>
      </GuideCard>

      <SectionTitle emoji="📈" title="等级加成表" subtitle="等级越高加成越强" />
      <GuideCard>
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-1.5 text-gray-500 font-medium">等级</th>
                <th className="text-center py-1.5 text-amber-500 font-medium">金币加成</th>
                <th className="text-center py-1.5 text-blue-500 font-medium">经验加成</th>
                <th className="text-center py-1.5 text-red-500 font-medium">暴击率</th>
                <th className="text-center py-1.5 text-orange-500 font-medium">连击</th>
              </tr>
            </thead>
            <tbody>
              {[
                { lv: 'Lv.1-2', coin: '0%', xp: '0%', crit: '10%', combo: '×1' },
                { lv: 'Lv.3-4', coin: '0%', xp: '10%', crit: '10%', combo: '×1' },
                { lv: 'Lv.5-7', coin: '15%', xp: '10%', crit: '10%', combo: '×1' },
                { lv: 'Lv.8-9', coin: '15%', xp: '10%', crit: '10%', combo: '×2' },
                { lv: 'Lv.10-12', coin: '15%', xp: '10%', crit: '15%', combo: '×2' },
                { lv: 'Lv.13-15', coin: '15%', xp: '20%', crit: '15%', combo: '×2' },
                { lv: 'Lv.16-19', coin: '25%', xp: '20%', crit: '15%', combo: '×2' },
                { lv: 'Lv.20', coin: '30%', xp: '30%', crit: '15%', combo: '×2' },
              ].map((r) => (
                <tr key={r.lv} className="border-b border-gray-50">
                  <td className="py-1.5 font-bold text-gray-700">{r.lv}</td>
                  <td className="text-center py-1.5 text-amber-600">{r.coin}</td>
                  <td className="text-center py-1.5 text-blue-600">{r.xp}</td>
                  <td className="text-center py-1.5 text-red-600">{r.crit}</td>
                  <td className="text-center py-1.5 text-orange-600">{r.combo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[10px] text-gray-400 mt-2 text-center">* 以上为基础加成，宠物天赋可提供额外加成</p>
      </GuideCard>
    </motion.div>
  );
}

function AchievementTab() {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-3">
      <SectionTitle emoji="🏆" title="成就大全" subtitle={`共 ${ACHIEVEMENTS.length} 个成就等你解锁`} />

      {/* Speed achievements */}
      <SectionTitle emoji="⚡" title="速度成就" subtitle="限时挑战中的荣誉" />
      <GuideCard>
        <div className="space-y-1.5">
          {ACHIEVEMENTS.filter(a => a.category === 'speed').map((ach) => (
            <motion.div key={ach.id} variants={itemVariants} className="flex items-center gap-2.5 rounded-lg bg-gray-50 p-2">
              <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center text-lg">
                {ach.emoji}
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-gray-800">{ach.name}</p>
                <p className="text-[11px] text-gray-500">{ach.description}</p>
              </div>
            </motion.div>
          ))}
          {ACHIEVEMENTS.filter(a => a.category === 'speed').length === 0 && (
            <div className="space-y-1.5">
              {[
                { emoji: '🌟', name: '速度新星', desc: '完成一次限时挑战' },
                { emoji: '🚀', name: '速度达人', desc: '限时挑战答对20题以上' },
                { emoji: '⚡', name: '闪电满分', desc: '限时挑战全部答对' },
              ].map((ach) => (
                <motion.div key={ach.name} variants={itemVariants} className="flex items-center gap-2.5 rounded-lg bg-gray-50 p-2">
                  <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center text-lg">
                    {ach.emoji}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-gray-800">{ach.name}</p>
                    <p className="text-[11px] text-gray-500">{ach.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </GuideCard>

      {/* Math adventure */}
      <SectionTitle emoji="🧮" title="数学冒险" subtitle="征服150层的荣耀" />
      <GuideCard>
        <div className="space-y-1.5">
          {[
            { emoji: '🏔️', name: '数学探险家', desc: '冒险模式到达第10层' },
            { emoji: '🐉', name: '数学屠龙者', desc: '冒险模式到达第50层' },
            { emoji: '👑', name: '数学传奇', desc: '冒险模式到达第100层' },
            { emoji: '✨', name: '数学之神', desc: '冒险模式到达第150层（通关！）' },
          ].map((ach) => (
            <motion.div key={ach.name} variants={itemVariants} className="flex items-center gap-2.5 rounded-lg bg-gray-50 p-2">
              <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-amber-100 to-yellow-100 flex items-center justify-center text-lg">
                {ach.emoji}
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-gray-800">{ach.name}</p>
                <p className="text-[11px] text-gray-500">{ach.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </GuideCard>

      {/* Chinese adventure */}
      <SectionTitle emoji="📖" title="语文冒险" subtitle="文字世界的探索者" />
      <GuideCard>
        <div className="space-y-1.5">
          {[
            { emoji: '🏔️', name: '语文探险家', desc: '语文冒险到达第10层' },
            { emoji: '📜', name: '语文诗人', desc: '语文冒险到达第25层' },
            { emoji: '🎓', name: '语文大师', desc: '语文冒险到达第50层' },
            { emoji: '👑', name: '语文传奇', desc: '语文冒险到达第100层' },
          ].map((ach) => (
            <motion.div key={ach.name} variants={itemVariants} className="flex items-center gap-2.5 rounded-lg bg-gray-50 p-2">
              <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-rose-100 to-orange-100 flex items-center justify-center text-lg">
                {ach.emoji}
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-gray-800">{ach.name}</p>
                <p className="text-[11px] text-gray-500">{ach.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </GuideCard>

      {/* English adventure */}
      <SectionTitle emoji="🔤" title="英语冒险" subtitle="征服ABC世界" />
      <GuideCard>
        <div className="space-y-1.5">
          {[
            { emoji: '🏔️', name: '英语探险家', desc: '英语冒险到达第10层' },
            { emoji: '🌍', name: '英语旅行家', desc: '英语冒险到达第25层' },
            { emoji: '🎓', name: '英语大师', desc: '英语冒险到达第50层' },
            { emoji: '👑', name: '英语传奇', desc: '英语冒险到达第100层' },
          ].map((ach) => (
            <motion.div key={ach.name} variants={itemVariants} className="flex items-center gap-2.5 rounded-lg bg-gray-50 p-2">
              <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-lg">
                {ach.emoji}
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-gray-800">{ach.name}</p>
                <p className="text-[11px] text-gray-500">{ach.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </GuideCard>

      {/* Multi-subject */}
      <SectionTitle emoji="🌟" title="全科成就" subtitle="三科全能才是真正的大师" />
      <GuideCard>
        <div className="space-y-1.5">
          {[
            { emoji: '📖', name: '全科达人', desc: '三科冒险都到达第10层' },
            { emoji: '🏆', name: '全科大师', desc: '三科冒险都到达第50层' },
          ].map((ach) => (
            <motion.div key={ach.name} variants={itemVariants} className="flex items-center gap-2.5 rounded-lg bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-100 p-2">
              <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-amber-100 to-yellow-100 flex items-center justify-center text-lg">
                {ach.emoji}
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-gray-800">{ach.name}</p>
                <p className="text-[11px] text-gray-500">{ach.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </GuideCard>

      <GuideCard>
        <div className="rounded-lg bg-amber-50 p-2.5">
          <p className="text-[11px] text-amber-700 leading-relaxed">
            💡 <b>小提示：</b>成就会在你完成对应条件时自动解锁！多练习、多坚持，你一定能收集所有成就！
          </p>
        </div>
      </GuideCard>
    </motion.div>
  );
}

function TipsTab() {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-3">
      <SectionTitle emoji="🎯" title="答题攻略" subtitle="成为学习达人的秘诀" />

      <GuideCard>
        <div className="space-y-2.5">
          {[
            {
              emoji: '🔥', title: '保持连击是关键',
              desc: '连续答对3题以上就开始累积连击奖励！连击越高金币越多。遇到不确定的题目也要大胆选择，错了也不要灰心~',
              color: 'from-orange-50 to-red-50 border-orange-100',
            },
            {
              emoji: '⏱️', title: '速度模式是赚金币最快的方式',
              desc: '限时挑战模式自带1.5倍金币加成！在30秒内答完5题以上还能获得额外速度奖励。配合宠物布偶猫的天赋，收益极高！',
              color: 'from-cyan-50 to-blue-50 border-cyan-100',
            },
            {
              emoji: '🏔️', title: '冒险模式奖励潜力最大',
              desc: '冒险模式的楼层倍率加成是所有模式中最高的！第10层=2倍，第50层=6倍，第100层+=10倍！如果实力强，冒险模式的金币收益远超其他模式。',
              color: 'from-emerald-50 to-teal-50 border-emerald-100',
            },
            {
              emoji: '💯', title: '满分奖励很丰厚',
              desc: '全部答对额外+20金币，加上3星=15金币，总计额外+35金币！建议从简单的年级和题目数开始，先拿满分建立信心~',
              color: 'from-green-50 to-emerald-50 border-green-100',
            },
            {
              emoji: '📅', title: '每天坚持练习',
              desc: '连续学习天数越多，额外金币越多（每天×3，上限30金币）。即使每天只做5道题也比断断续续好很多！',
              color: 'from-rose-50 to-pink-50 border-rose-100',
            },
            {
              emoji: '🐾', title: '善用宠物天赋',
              desc: '学英语选鹦鹉(+25%英语金币)，想赚钱选布偶猫(+20%金币)，爱连击选兔子(+50%连击)。根据学习目标选择合适的宠物！',
              color: 'from-violet-50 to-purple-50 border-violet-100',
            },
            {
              emoji: '📈', title: '宠物等级是长期投资',
              desc: '宠物升到20级后全属性+30%！这个加成非常可观。坚持答题，宠物和你的等级都会越来越高~',
              color: 'from-amber-50 to-yellow-50 border-amber-100',
            },
            {
              emoji: '🧗', title: '冒险模式闯关策略',
              desc: '先从第1层开始，确保每关稳定通关。前30层打好基础，30层后再挑战更高难度。失败不要气馁，回到最近已通过的楼层继续！',
              color: 'from-teal-50 to-cyan-50 border-teal-100',
            },
          ].map((tip) => (
            <div key={tip.title} className={`rounded-xl bg-gradient-to-r ${tip.color} border p-3`}>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-base">{tip.emoji}</span>
                <span className="text-xs font-bold text-gray-800">{tip.title}</span>
              </div>
              <p className="text-[11px] text-gray-600 leading-relaxed">{tip.desc}</p>
            </div>
          ))}
        </div>
      </GuideCard>

      <SectionTitle emoji="🎯" title="新手推荐路线" subtitle="从入门到高手的成长路径" />
      <GuideCard>
        <div className="space-y-2">
          {[
            { step: '第1天', emoji: '🏠', desc: '领养一只宠物（推荐布偶猫或小熊猫），在设置中修改昵称和头像' },
            { step: '第1-3天', emoji: '✏️', desc: '每天做10道数学简单加法题，熟悉答题流程，争取满分' },
            { step: '第3-7天', emoji: '📖', desc: '开始做语文练习（识字认字、拼音），同时数学尝试减法和乘法' },
            { step: '第7-14天', emoji: '🔤', desc: '加入英语练习，数学尝试限时挑战模式赚取金币' },
            { step: '第14天+', emoji: '🏔️', desc: '开始三科冒险闯关模式，冲击更高楼层获取倍率奖励！' },
          ].map((r) => (
            <div key={r.step} className="flex items-start gap-2.5">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-xs">
                {r.emoji}
              </div>
              <div>
                <span className="text-xs font-bold text-gray-700">{r.step}</span>
                <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{r.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </GuideCard>

      <GuideCard>
        <div className="text-center py-2 rounded-xl bg-gradient-to-r from-amber-50 via-orange-50 to-rose-50">
          <p className="text-2xl mb-1">💪</p>
          <p className="text-xs font-bold text-gray-700">坚持就是胜利！</p>
          <p className="text-[11px] text-gray-500 mt-0.5">每天进步一点点，你就是学习小达人！</p>
        </div>
      </GuideCard>
    </motion.div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────

const TAB_COMPONENTS: Record<string, React.FC> = {
  start: GettingStartedTab,
  math: MathGuideTab,
  chinese: ChineseGuideTab,
  english: EnglishGuideTab,
  coins: CoinSystemTab,
  pet: PetSystemTab,
  talent: TalentCompareTab,
  skill: SkillLevelTab,
  achievement: AchievementTab,
  tips: TipsTab,
};

export default function HelpGuide() {
  const { setCurrentView } = useGameStore();
  const [activeTab, setActiveTab] = useState('start');
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleTabChange = (tabId: string) => {
    playClickSound();
    setActiveTab(tabId);
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const ActiveContent = TAB_COMPONENTS[activeTab] ?? GettingStartedTab;

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-b from-slate-50 via-violet-50/20 to-white flex flex-col">
      {/* Header */}
      <div className={`bg-gradient-to-r ${TABS.find(t => t.id === activeTab)?.color ?? 'from-violet-500 to-purple-600'} px-4 pb-4 text-white shrink-0`}>
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => { playClickSound(); setCurrentView('home'); }}
              className="flex items-center gap-1 text-white/80 hover:text-white text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              返回
            </button>
            <div className="flex items-center gap-1 text-white/80">
              <BookOpen className="w-4 h-4" />
              <span className="text-xs font-medium">攻略百科</span>
            </div>
          </div>
          <h1 className="text-xl font-bold">📖 学习小达人攻略</h1>
          <p className="text-white/80 text-xs mt-0.5">
            {TABS.find(t => t.id === activeTab)?.emoji}{' '}
            {activeTab === 'start' && '新手入门指南'}
            {activeTab === 'math' && '数学练习全面攻略'}
            {activeTab === 'chinese' && '语文学习完全指南'}
            {activeTab === 'english' && '英语学习完全指南'}
            {activeTab === 'coins' && '金币系统深度解析'}
            {activeTab === 'pet' && '宠物系统完全攻略'}
            {activeTab === 'talent' && '宠物天赋对比分析'}
            {activeTab === 'skill' && '技能成长与等级奖励'}
            {activeTab === 'achievement' && '全部成就解锁条件'}
            {activeTab === 'tips' && '成为学习达人的秘诀'}
          </p>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="shrink-0 border-b border-gray-200 bg-white/90 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-md mx-auto">
          <div className="flex overflow-x-auto scrollbar-hide px-2 pt-2 gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`shrink-0 flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-t-lg text-[10px] font-bold transition-all border-b-2 ${
                  activeTab === tab.id
                    ? 'text-violet-600 border-violet-500 bg-violet-50/50'
                    : 'text-gray-400 border-transparent hover:text-gray-600'
                }`}
              >
                <span className="text-base">{tab.emoji}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="max-w-md mx-auto px-4 pt-4 pb-24"
        >
          <ActiveContent />
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
}
