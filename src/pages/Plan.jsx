import { useState, useRef, useCallback } from 'react'
import { UserPlus, X, Sparkles, ChevronDown, RotateCcw, Share2, Download, Users } from 'lucide-react'
import { haptic } from '../utils/haptic'

const MBTI_TYPES = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISTP', 'ESTJ', 'ESTP',
  'ISFJ', 'ISFP', 'ESFJ', 'ESFP',
]

const MBTI_COLORS = {
  INTJ: 'bg-purple-100 text-purple-700 border-purple-200',
  INTP: 'bg-violet-100 text-violet-700 border-violet-200',
  ENTJ: 'bg-blue-100 text-blue-700 border-blue-200',
  ENTP: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  INFJ: 'bg-green-100 text-green-700 border-green-200',
  INFP: 'bg-teal-100 text-teal-700 border-teal-200',
  ENFJ: 'bg-amber-100 text-amber-700 border-amber-200',
  ENFP: 'bg-orange-100 text-orange-700 border-orange-200',
  ISTJ: 'bg-slate-100 text-slate-700 border-slate-200',
  ISTP: 'bg-gray-100 text-gray-700 border-gray-200',
  ESTJ: 'bg-red-100 text-red-700 border-red-200',
  ESTP: 'bg-rose-100 text-rose-700 border-rose-200',
  ISFJ: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  ISFP: 'bg-lime-100 text-lime-700 border-lime-200',
  ESFJ: 'bg-pink-100 text-pink-700 border-pink-200',
  ESFP: 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200',
}

const MBTI_NICKNAMES = {
  INTJ: '策略家', INTP: '思想家', ENTJ: '指挥官', ENTP: '辩论家',
  INFJ: '提倡者', INFP: '调停者', ENFJ: '主人公', ENFP: '竞选者',
  ISTJ: '检查员', ISTP: '鉴赏家', ESTJ: '总经理', ESTP: '企业家',
  ISFJ: '守护者', ISFP: '探险家', ESFJ: '执政官', ESFP: '表演者',
}

const MBTI_EMOJIS = {
  INTJ: '🧠', INTP: '💭', ENTJ: '👔', ENTP: '💡',
  INFJ: '🌟', INFP: '🦋', ENFJ: '🌻', ENFP: '🎈',
  ISTJ: '📋', ISTP: '🔧', ESTJ: '📊', ESTP: '🏄',
  ISFJ: '🛡️', ISFP: '🎨', ESFJ: '🤝', ESFP: '🎉',
}

const DIM_LABELS = { E: '外向', I: '内向', S: '实感', N: '直觉', T: '理性', F: '感性', J: '计划', P: '随性' }

// ─── 推荐数据：面向大学生的平价高情绪价值活动 ───

const MOODS = {
  energy: {
    title: '⚡ 能量爆炸局',
    copy: '全员E人集结！今晚谁也别想早睡！出门就要把气氛拉到最高！',
    gradient: 'from-orange-400 via-red-400 to-pink-500',
    cardBg: 'from-orange-50 via-red-50 to-pink-50',
    activities: [
      { name: '恐怖密室逃脱', emoji: '🚪', price: '人均50左右' },
      { name: 'Livehouse蹦迪发泄', emoji: '🎸', price: '人均30-80' },
      { name: 'KTV夜间特惠包段', emoji: '🎤', price: '人均20-40' },
      { name: '大学城夜市扫街', emoji: '🍢', price: '人均30吃到撑' },
    ],
  },
  recharge: {
    title: '🔋 充电回血局',
    copy: '既然大家都这么内向，不如去找小猫咪倾诉吧！安静就是最大的快乐~',
    gradient: 'from-emerald-400 via-teal-400 to-cyan-500',
    cardBg: 'from-emerald-50 via-teal-50 to-cyan-50',
    activities: [
      { name: '猫咖狗咖吸小动物', emoji: '🐱', price: '人均30-50' },
      { name: '公园躺草坪+零食', emoji: '🌿', price: '几乎免费' },
      { name: '私人影院看电影', emoji: '🎬', price: '人均40-60' },
      { name: '安静的手作/陶艺DIY', emoji: '🏺', price: '人均50-80' },
    ],
  },
  balance: {
    title: '⚖️ 社交端水局',
    copy: '内外搭配，活动不累！I人负责动脑，E人负责炒气氛，完美组合！',
    gradient: 'from-violet-400 via-purple-400 to-fuchsia-500',
    cardBg: 'from-violet-50 via-purple-50 to-fuchsia-50',
    activities: [
      { name: '欢乐阵营剧本杀', emoji: '🔍', price: '人均40-60' },
      { name: '桌游馆/台球厅', emoji: '🎱', price: '人均20-40' },
      { name: '氛围感清吧微醺', emoji: '🍷', price: '人均50' },
    ],
  },
}

const P_TIP = '💡 测出你们随性派较多，建议：不做任何攻略，立刻出门开启 Citywalk 盲盒，走到哪算哪！'
const J_TIP = '💡 测出你们计划派较多，建议：提前定好路线，去市博物馆看展，或打卡收藏夹里那家排队很久的网红店。'

// ─── 核心推荐算法 ───

function analyzeTeam(members) {
  const total = members.length
  const E = members.filter(m => m[0] === 'E').length
  const I = members.filter(m => m[0] === 'I').length
  const S = members.filter(m => m[1] === 'S').length
  const N = members.filter(m => m[1] === 'N').length
  const T = members.filter(m => m[2] === 'T').length
  const F = members.filter(m => m[2] === 'F').length
  const J = members.filter(m => m[3] === 'J').length
  const P = members.filter(m => m[3] === 'P').length

  let mood
  if (I === 0) mood = 'energy'
  else if (E === 0) mood = 'recharge'
  else mood = 'balance'

  let tip = null
  if (P > J) tip = 'p'
  else if (J > P) tip = 'j'

  const moodData = MOODS[mood]
  const tipText = tip === 'p' ? P_TIP : tip === 'j' ? J_TIP : null

  return { total, E, I, S, N, T, F, J, P, mood, moodData, tip, tipText, members }
}

function getButtonCopy(members) {
  if (members.length === 0) return null
  const E = members.filter(m => m[0] === 'E').length
  const I = members.filter(m => m[0] === 'I').length
  if (I === 0) return { text: '冲！今晚嗨翻天！🔥', sub: '全员 E 人，准备出击' }
  if (E === 0) return { text: '找个安静的角落吧 🌙', sub: '全员 I 人，安静最快乐' }
  return { text: '帮我决定去哪玩！✨', sub: '看看命运怎么安排' }
}

// ─── 海报生成 ───

function drawPoster(canvas, result) {
  const ctx = canvas.getContext('2d')
  const w = 750, h = 1334
  canvas.width = w
  canvas.height = h

  const colors = {
    energy: ['#f97316', '#ef4444', '#ec4899'],
    recharge: ['#10b981', '#14b8a6', '#06b6d4'],
    balance: ['#8b5cf6', '#a855f7', '#d946ef'],
  }
  const [c1, c2, c3] = colors[result.mood]
  const grad = ctx.createLinearGradient(0, 0, w, h)
  grad.addColorStop(0, c1)
  grad.addColorStop(0.5, c2)
  grad.addColorStop(1, c3)
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)

  ctx.fillStyle = 'rgba(255,255,255,0.08)'
  ctx.beginPath(); ctx.arc(600, 120, 200, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(100, 500, 150, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(650, 900, 180, 0, Math.PI * 2); ctx.fill()

  ctx.fillStyle = '#ffffff'
  ctx.textAlign = 'center'
  ctx.font = 'bold 56px "PingFang SC", "Microsoft YaHei", sans-serif'
  ctx.fillText('🎲 帮你决定', w / 2, 120)

  ctx.font = 'bold 48px "PingFang SC", "Microsoft YaHei", sans-serif'
  ctx.fillText(result.moodData.title, w / 2, 220)

  ctx.font = '26px "PingFang SC", "Microsoft YaHei", sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.9)'
  const mbtiStr = result.members.join(' + ')
  if (ctx.measureText(mbtiStr).width > w - 100) {
    const half = Math.ceil(result.members.length / 2)
    ctx.fillText(result.members.slice(0, half).join(' + '), w / 2, 290)
    ctx.fillText(result.members.slice(half).join(' + '), w / 2, 330)
  } else {
    ctx.fillText(mbtiStr, w / 2, 300)
  }

  const activities = result.moodData.activities
  const startY = 400
  activities.forEach((act, i) => {
    const cy = startY + i * 180
    const rx = 60, rw = w - 120, rh = 150, r = 24
    ctx.fillStyle = 'rgba(255,255,255,0.95)'
    ctx.beginPath()
    ctx.moveTo(rx + r, cy); ctx.lineTo(rx + rw - r, cy)
    ctx.quadraticCurveTo(rx + rw, cy, rx + rw, cy + r)
    ctx.lineTo(rx + rw, cy + rh - r)
    ctx.quadraticCurveTo(rx + rw, cy + rh, rx + rw - r, cy + rh)
    ctx.lineTo(rx + r, cy + rh)
    ctx.quadraticCurveTo(rx, cy + rh, rx, cy + rh - r)
    ctx.lineTo(rx, cy + r)
    ctx.quadraticCurveTo(rx, cy, rx + r, cy)
    ctx.closePath(); ctx.fill()

    ctx.font = '48px sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText(act.emoji, rx + 24, cy + 65)
    ctx.font = 'bold 32px "PingFang SC", "Microsoft YaHei", sans-serif'
    ctx.fillStyle = '#2d3436'
    ctx.fillText(act.name, rx + 90, cy + 58)
    ctx.font = '22px "PingFang SC", "Microsoft YaHei", sans-serif'
    ctx.fillStyle = '#636e72'
    ctx.fillText(act.price, rx + 90, cy + 100)
    ctx.fillStyle = '#ffffff'
    ctx.textAlign = 'center'
  })

  if (result.tipText) {
    const tipY = startY + activities.length * 180 + 30
    ctx.font = '22px "PingFang SC", "Microsoft YaHei", sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.85)'
    ctx.textAlign = 'center'
    const maxW = w - 120
    const tipStr = result.tipText
    if (ctx.measureText(tipStr).width > maxW) {
      const mid = Math.floor(tipStr.length / 2)
      let breakIdx = tipStr.lastIndexOf('，', mid)
      if (breakIdx === -1) breakIdx = mid
      ctx.fillText(tipStr.slice(0, breakIdx + 1), w / 2, tipY)
      ctx.fillText(tipStr.slice(breakIdx + 1), w / 2, tipY + 35)
    } else {
      ctx.fillText(tipStr, w / 2, tipY)
    }
  }

  const footerY = h - 80
  ctx.textAlign = 'center'
  ctx.font = '24px "PingFang SC", "Microsoft YaHei", sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.6)'
  ctx.fillText('— 「帮你决定」App 生成 —', w / 2, footerY)
}

// ─── 同行者卡片 ───

function MemberCard({ type, index, onRemove }) {
  const nickname = MBTI_NICKNAMES[type]
  const emoji = MBTI_EMOJIS[type]
  const colorClass = MBTI_COLORS[type]
  const dims = type.split('').map(d => DIM_LABELS[d]).join(' · ')
  const isE = type[0] === 'E'

  return (
    <div className={`relative rounded-2xl border p-3 ${colorClass} animate-pop-in`} style={{ animationDelay: `${index * 60}ms` }}>
      <button
        onClick={onRemove}
        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gray-400 text-white flex items-center justify-center shadow-sm hover:bg-red-400 transition-colors"
      >
        <X size={10} />
      </button>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{emoji}</span>
        <span className="text-sm font-black tracking-wide">{type}</span>
        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${isE ? 'bg-orange-200 text-orange-800' : 'bg-indigo-200 text-indigo-800'}`}>
          {isE ? 'E外向' : 'I内向'}
        </span>
      </div>
      <p className="text-[11px] font-semibold opacity-70">{nickname}</p>
      <p className="text-[9px] opacity-50 mt-0.5">{dims}</p>
    </div>
  )
}

// ─── 结果卡片 ───

function ResultCard({ result }) {
  const { moodData, tipText, members } = result
  const { E, I, S, N, T, F, J, P, total } = result
  const dims = [
    { a: 'E', b: 'I', av: E, bv: I, ac: 'text-orange-600', bc: 'text-indigo-600' },
    { a: 'S', b: 'N', av: S, bv: N, ac: 'text-green-600', bc: 'text-purple-600' },
    { a: 'T', b: 'F', av: T, bv: F, ac: 'text-blue-600', bc: 'text-pink-600' },
    { a: 'J', b: 'P', av: J, bv: P, ac: 'text-red-600', bc: 'text-teal-600' },
  ]

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Main mood card */}
      <div className={`rounded-3xl p-6 bg-gradient-to-br ${moodData.cardBg} border border-white/60 shadow-lg relative overflow-hidden`}>
        <div className="absolute -right-6 -top-6 text-[120px] opacity-[0.06] leading-none select-none">
          {moodData.title.slice(0, 2)}
        </div>
        <div className="relative">
          <p className="text-3xl font-black text-text tracking-wide">{moodData.title}</p>
          <p className="text-sm text-text-secondary mt-2 leading-relaxed font-medium">{moodData.copy}</p>

          {/* Activity tags */}
          <div className="flex flex-wrap gap-2 mt-5">
            {moodData.activities.map((act, i) => (
              <div
                key={i}
                className="animate-pop-in bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-sm border border-white/50 flex-shrink-0"
                style={{ animationDelay: `${(i + 1) * 100}ms` }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{act.emoji}</span>
                  <div>
                    <p className="text-sm font-bold text-text">{act.name}</p>
                    <p className="text-[10px] text-text-secondary font-medium">{act.price}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* MBTI combo */}
          <div className="mt-5 pt-4 border-t border-black/5">
            <p className="text-[10px] text-text-secondary font-semibold mb-2">本次组合</p>
            <div className="flex flex-wrap gap-1.5">
              {members.map((m, i) => (
                <span
                  key={i}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${MBTI_COLORS[m]}`}
                >
                  {MBTI_EMOJIS[m]} {m}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Four-dimension analysis */}
      <div className="bg-white/80 rounded-2xl p-4 border border-purple-50 shadow-sm">
        <h3 className="font-bold text-text text-sm mb-3">📊 团队性格画像</h3>
        <div className="grid grid-cols-4 gap-2 text-center">
          {dims.map(({ a, b, av, bv, ac, bc }) => (
            <div key={a + b} className="bg-gray-50/80 rounded-xl py-2.5 px-1">
              <div className="flex items-center justify-center gap-1 text-lg font-black">
                <span className={ac}>{av}</span>
                <span className="text-gray-300 text-xs">:</span>
                <span className={bc}>{bv}</span>
              </div>
              <div className="text-[10px] text-text-secondary mt-0.5 font-medium">
                <span className={ac}>{a}</span> / <span className={bc}>{b}</span>
              </div>
              <div className="mt-1.5 h-1.5 bg-gray-200/60 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-700"
                  style={{ width: `${total > 0 ? (av / total) * 100 : 50}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* P/J supplementary tip */}
      {tipText && (
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-4 border border-amber-100 shadow-sm animate-pop-in">
          <p className="text-sm text-amber-900 font-medium leading-relaxed">{tipText}</p>
        </div>
      )}
    </div>
  )
}

// ─── 主组件 ───

export default function Plan() {
  const [members, setMembers] = useState([])
  const [showSelector, setShowSelector] = useState(false)
  const [result, setResult] = useState(null)
  const [posterUrl, setPosterUrl] = useState(null)
  const [generatingPoster, setGeneratingPoster] = useState(false)
  const canvasRef = useRef(null)

  const addMember = (type) => {
    haptic('light')
    setMembers(prev => [...prev, type])
    setShowSelector(false)
    setResult(null)
    setPosterUrl(null)
  }

  const removeMember = (index) => {
    haptic('light')
    setMembers(prev => prev.filter((_, i) => i !== index))
    setResult(null)
    setPosterUrl(null)
  }

  const handleGenerate = () => {
    haptic('success')
    setResult(analyzeTeam(members))
    setPosterUrl(null)
  }

  const handleReset = () => {
    haptic('medium')
    setMembers([])
    setResult(null)
    setPosterUrl(null)
  }

  const handlePoster = useCallback(() => {
    if (!result || generatingPoster) return
    setGeneratingPoster(true)
    haptic('success')
    requestAnimationFrame(() => {
      try {
        drawPoster(canvasRef.current, result)
        setPosterUrl(canvasRef.current.toDataURL('image/png'))
      } catch { /* canvas error */ }
      setGeneratingPoster(false)
    })
  }, [result, generatingPoster])

  const handleDownload = () => {
    if (!posterUrl) return
    const a = document.createElement('a')
    a.href = posterUrl
    a.download = `帮你决定-${Date.now()}.png`
    a.click()
  }

  const handleShare = async () => {
    if (!posterUrl) return
    try {
      const res = await fetch(posterUrl)
      const blob = await res.blob()
      const file = new File([blob], '帮你决定.png', { type: 'image/png' })
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({ title: '帮你决定 - MBTI活动推荐', files: [file] })
      } else {
        handleDownload()
      }
    } catch {
      handleDownload()
    }
  }

  const buttonCopy = getButtonCopy(members)

  return (
    <div className="space-y-5 pb-4">
      <div className="pt-4">
        <h1 className="text-2xl font-extrabold text-text flex items-center gap-2">
          🧠 MBTI 活动规划
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          添加同行小伙伴的 MBTI，为你们匹配周末好去处
        </p>
      </div>

      {/* Members section */}
      <div className="bg-card rounded-2xl p-4 shadow-sm border border-purple-50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-text flex items-center gap-1.5">
            <Users size={16} className="text-primary" />
            同行者 ({members.length} 人)
          </h3>
          {members.length > 0 && (
            <button
              onClick={handleReset}
              className="text-xs text-text-secondary hover:text-accent flex items-center gap-1 transition-colors"
            >
              <RotateCcw size={12} /> 全部清空
            </button>
          )}
        </div>

        {members.length === 0 ? (
          <div className="text-center py-8 text-text-secondary">
            <span className="text-4xl block mb-2">👥</span>
            <p className="text-sm font-medium">还没有添加同行者呢</p>
            <p className="text-xs opacity-60 mt-1">快把你和朋友们的 MBTI 加上吧~</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 mb-3">
            {members.map((type, idx) => (
              <MemberCard
                key={idx}
                type={type}
                index={idx}
                onRemove={() => removeMember(idx)}
              />
            ))}
          </div>
        )}

        {/* MBTI selector */}
        <div className="relative">
          <button
            onClick={() => { haptic('light'); setShowSelector(!showSelector) }}
            className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-primary/30 rounded-xl text-primary text-sm font-medium hover:border-primary/60 hover:bg-primary/5 transition-all duration-300 active:scale-[0.98]"
          >
            <UserPlus size={16} />
            添加同行者 MBTI
            <ChevronDown size={14} className={`transition-transform duration-300 ${showSelector ? 'rotate-180' : ''}`} />
          </button>

          {showSelector && (
            <div className="animate-slide-up mt-2 bg-white rounded-2xl border border-purple-100 shadow-lg p-4 z-10">
              <p className="text-xs text-text-secondary mb-3 font-medium">选择 MBTI 类型（可重复添加多人）：</p>
              <div className="grid grid-cols-4 gap-2">
                {MBTI_TYPES.map(type => (
                  <button
                    key={type}
                    onClick={() => addMember(type)}
                    className={`py-2 px-1 rounded-xl border text-xs font-bold transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95 ${MBTI_COLORS[type]}`}
                  >
                    <div className="text-base mb-0.5">{MBTI_EMOJIS[type]}</div>
                    <div>{type}</div>
                    <div className="text-[9px] font-normal opacity-60 mt-0.5">{MBTI_NICKNAMES[type]}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Generate button */}
      {members.length > 0 && !result && buttonCopy && (
        <button
          onClick={handleGenerate}
          className="animate-pop-in w-full py-4 bg-gradient-to-r from-primary to-accent text-white font-bold text-base rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 active:scale-[0.97] flex flex-col items-center gap-1"
        >
          <span className="flex items-center gap-2">
            <Sparkles size={20} />
            {buttonCopy.text}
          </span>
          <span className="text-[11px] font-normal opacity-80">{buttonCopy.sub}</span>
        </button>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          <ResultCard result={result} />

          {/* Share poster section */}
          <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl p-4 border border-primary/10 space-y-3">
            <h3 className="font-bold text-text text-sm flex items-center gap-2">
              <Share2 size={16} className="text-primary" />
              分享给小伙伴
            </h3>
            <p className="text-xs text-text-secondary">
              生成一张好看的海报，发朋友圈展示你们的 MBTI 组合！
            </p>
            {!posterUrl ? (
              <button
                onClick={handlePoster}
                disabled={generatingPoster}
                className="w-full py-3 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 active:scale-[0.97] disabled:opacity-50 text-sm"
              >
                {generatingPoster ? '生成中…' : '🖼️ 生成分享海报'}
              </button>
            ) : (
              <div className="space-y-3 animate-pop-in">
                <img src={posterUrl} alt="分享海报" className="w-full rounded-xl shadow-md border border-gray-100" />
                <div className="flex gap-2">
                  <button
                    onClick={handleDownload}
                    className="flex-1 py-2.5 bg-primary text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-1.5 hover:bg-primary/90 transition-colors active:scale-[0.97]"
                  >
                    <Download size={14} /> 保存图片
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex-1 py-2.5 bg-accent text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-1.5 hover:bg-accent/90 transition-colors active:scale-[0.97]"
                  >
                    <Share2 size={14} /> 分享
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleReset}
            className="w-full py-3 border-2 border-primary/20 text-primary font-semibold rounded-2xl hover:bg-primary/5 transition-all duration-300 active:scale-[0.97]"
          >
            🔄 换一批人重新规划
          </button>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
