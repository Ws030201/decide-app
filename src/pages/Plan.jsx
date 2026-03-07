import { useState, useRef, useCallback } from 'react'
import { UserPlus, X, Sparkles, MapPin, Clock, Users, ChevronDown, RotateCcw, Share2, Download, CalendarClock } from 'lucide-react'
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

function analyze(members) {
  const total = members.length
  const dims = {
    E: members.filter(m => m[0] === 'E').length,
    I: members.filter(m => m[0] === 'I').length,
    S: members.filter(m => m[1] === 'S').length,
    N: members.filter(m => m[1] === 'N').length,
    T: members.filter(m => m[2] === 'T').length,
    F: members.filter(m => m[2] === 'F').length,
    J: members.filter(m => m[3] === 'J').length,
    P: members.filter(m => m[3] === 'P').length,
  }
  return {
    ...dims,
    total,
    eRatio: dims.E / total,
    sRatio: dims.S / total,
    tRatio: dims.T / total,
    jRatio: dims.J / total,
  }
}

function getButtonText(members) {
  if (members.length === 0) return null
  const { eRatio, jRatio } = analyze(members)
  if (eRatio >= 0.8 && jRatio < 0.3) return { text: '冲！去炸街！💥', sub: '全员 E + P，今晚属于你们' }
  if (eRatio >= 0.8) return { text: '走！嗨起来！🔥', sub: 'E 人集结完毕，准备出击' }
  if (eRatio <= 0.2 && jRatio > 0.7) return { text: '出发吧（按计划行动）📋', sub: '全员 I+J，一切尽在掌控' }
  if (eRatio <= 0.2) return { text: '找个没人的角落待着 🌙', sub: '全员 I 人，安静就是快乐' }
  if (jRatio >= 0.8) return { text: '按计划出发！⏰', sub: 'J 人已经做好 Excel 了' }
  if (jRatio <= 0.2) return { text: '走到哪算哪！🎲', sub: 'P 人的世界没有计划' }
  return { text: '帮我决定去哪玩！✨', sub: '看看命运怎么安排' }
}

function getGroupVibeText(stats) {
  const vibes = []
  if (stats.eRatio >= 0.8) vibes.push('🔥 全员社牛，气氛拉满')
  else if (stats.eRatio <= 0.2) vibes.push('🌙 全员社恐，岁月静好')
  else vibes.push('✨ 内外搭配，平衡感满分')

  if (stats.jRatio >= 0.7) vibes.push('📋 计划型团队，行程已安排')
  else if (stats.jRatio <= 0.3) vibes.push('🎲 随性团队，走到哪玩到哪')

  if (stats.sRatio >= 0.7) vibes.push('🎯 务实派，要的就是真实体验')
  else if (stats.sRatio <= 0.3) vibes.push('🌈 脑洞派，越新奇越兴奋')

  if (stats.tRatio >= 0.7) vibes.push('🧠 理性派，讲逻辑不讲感情')
  else if (stats.tRatio <= 0.3) vibes.push('💕 感性派，氛围感拉满')

  return vibes
}

function getRecommendations(members) {
  if (members.length === 0) return null
  const stats = analyze(members)
  const { E, I, S, N, T, F, J, P, total, eRatio, sRatio, tRatio, jRatio } = stats
  const recommendations = []

  // === E/I 主维度：社交能量 ===
  if (eRatio >= 0.8) {
    recommendations.push(
      { title: '夜店蹦迪', emoji: '🪩', desc: '全员 E 人！把夜晚交给节拍，嗨到天亮', duration: '4-6小时', people: `${total}人`, vibe: '🔥 超级热闹', tag: '社牛之选' },
      { title: '主题游乐园', emoji: '🎢', desc: '过山车前排选手，尖叫声就是你们的BGM', duration: '一整天', people: `${total}人`, vibe: '🎉 刺激冒险', tag: '经典推荐' },
    )
  } else if (eRatio <= 0.2) {
    recommendations.push(
      { title: '私人影院', emoji: '🎬', desc: '包个厅，关上门，世界与我无关', duration: '3小时', people: `${total}人`, vibe: '🌙 安静舒适', tag: 'I 人天堂' },
      { title: '咖啡馆泡一天', emoji: '☕', desc: '各自看书偶尔聊两句，这就是 I 人的社交', duration: '2-4小时', people: `${total}人`, vibe: '📚 知性安静', tag: '舒适区' },
    )
  } else {
    recommendations.push(
      { title: '剧本杀', emoji: '🔍', desc: 'I 人默默推理封神，E 人疯狂表演带节奏', duration: '3-4小时', people: `${total}人`, vibe: '🧩 烧脑互动', tag: 'IE 绝配' },
      { title: '桌游轰趴', emoji: '🎲', desc: '阿瓦隆、狼人杀… 社恐社牛都有位置', duration: '3-5小时', people: `${total}人`, vibe: '🃏 欢乐互动', tag: '万金油' },
    )
  }

  // === S/N 维度：体验偏好 ===
  if (sRatio >= 0.7) {
    recommendations.push(
      { title: '密室逃脱', emoji: '🚪', desc: 'S 人的观察力在线，每个线索都不放过', duration: '1.5-2小时', people: `${total}人`, vibe: '🔎 沉浸体验', tag: '实感派' },
      { title: '手工DIY工坊', emoji: '🏺', desc: '陶艺/香薰/皮具… 亲手做的东西最有成就感', duration: '2-3小时', people: `${total}人`, vibe: '🍃 治愈手作', tag: '实感派' },
    )
    if (eRatio > 0.4) {
      recommendations.push(
        { title: '城市骑行探店', emoji: '🚲', desc: '实感派出动，边骑边逛边吃，一条街吃到头', duration: '3-4小时', people: `${total}人`, vibe: '🌆 城市漫游', tag: '实感派' },
      )
    }
  } else if (sRatio <= 0.3) {
    recommendations.push(
      { title: '先锋话剧/脱口秀', emoji: '🎭', desc: 'N 人最爱！看完一起讨论到凌晨三点', duration: '2-3小时', people: `${total}人`, vibe: '🌟 思想碰撞', tag: '直觉派' },
      { title: '特色艺术展', emoji: '🖼️', desc: '越抽象越兴奋，别人看不懂你们却聊嗨了', duration: '2-3小时', people: `${total}人`, vibe: '🎨 审美在线', tag: '直觉派' },
    )
    if (eRatio > 0.5) {
      recommendations.push(
        { title: '即兴戏剧工作坊', emoji: '🎪', desc: 'N+E 的究极组合，脑洞开到银河系', duration: '2-3小时', people: `${total}人`, vibe: '🚀 脑洞大开', tag: '直觉派' },
      )
    }
  } else {
    if (eRatio > 0.5) {
      recommendations.push(
        { title: '主题真人RPG', emoji: '⚔️', desc: 'S 人负责细节，N 人负责剧情走向，完美搭档', duration: '3-4小时', people: `${total}人`, vibe: '🗡️ 沉浸冒险', tag: 'SN混搭' },
      )
    }
  }

  // === T/F 维度：决策方式 ===
  if (tRatio >= 0.7) {
    recommendations.push(
      { title: '真人CS / 射箭', emoji: '🏹', desc: '理性派的快乐就是赢！制定战术然后碾压对手', duration: '2-3小时', people: `${total}人`, vibe: '⚡ 竞技对抗', tag: '理性派' },
    )
    if (eRatio > 0.3) {
      recommendations.push(
        { title: '辩论之夜', emoji: '🎙️', desc: '找个话题辩到飞起，T 人的快乐就是这么朴实', duration: '2-3小时', people: `${total}人`, vibe: '🧠 头脑风暴', tag: '理性派' },
      )
    }
  } else if (tRatio <= 0.3) {
    recommendations.push(
      { title: '猫咖 / 宠物咖啡', emoji: '🐱', desc: '一群 F 人被毛茸茸包围，幸福感溢出屏幕', duration: '2-3小时', people: `${total}人`, vibe: '💕 温馨治愈', tag: '感性派' },
    )
    if (eRatio <= 0.5) {
      recommendations.push(
        { title: '手帐/绘画下午茶', emoji: '🎨', desc: '安静画画写写，偶尔分享一下，治愈整个下午', duration: '2-4小时', people: `${total}人`, vibe: '🌸 文艺治愈', tag: '感性派' },
      )
    }
  }

  // === J/P 维度：影响行程风格 ===
  if (jRatio <= 0.3) {
    recommendations.push(
      { title: '随便逛逛街区', emoji: '🛍️', desc: 'P 人最爱！不用预约不用计划，路过啥玩啥', duration: '想逛多久逛多久', people: `${total}人`, vibe: '🎈 佛系出行', tag: '随性派' },
    )
  }

  if (eRatio >= 0.6 && jRatio <= 0.3) {
    recommendations.push(
      { title: '夜市美食大冒险', emoji: '🍢', desc: 'E+P 的经典操作：走到哪吃到哪，胖了再说', duration: '3-4小时', people: `${total}人`, vibe: '🌃 夜猫子', tag: 'E+P 限定' },
    )
  }

  if (eRatio <= 0.3 && jRatio >= 0.7) {
    recommendations.push(
      { title: '精品下午茶', emoji: '🍰', desc: 'I+J 的完美下午：提前选好店，安安静静享受', duration: '2-3小时', people: `${total}人`, vibe: '🫖 精致生活', tag: 'I+J 限定' },
    )
  }

  // === J/P 维度：行程表生成 ===
  let schedule = null
  if (jRatio >= 0.5 && recommendations.length >= 2) {
    const topPicks = recommendations.slice(0, Math.min(3, recommendations.length))
    schedule = generateSchedule(topPicks, stats)
  }

  const groupVibes = getGroupVibeText(stats)

  return { recommendations, groupVibes, stats, members, schedule }
}

function generateSchedule(picks, stats) {
  const { jRatio } = stats
  const isStrict = jRatio >= 0.8

  if (picks.length === 1) {
    return [
      { time: '14:00', activity: '集合出发 🚗', note: isStrict ? '迟到罚奶茶' : '差不多到就行' },
      { time: '14:30', activity: picks[0].title + ' ' + picks[0].emoji, note: picks[0].desc },
      { time: '17:30', activity: '觅食时间 🍜', note: '找家附近评分高的店' },
      { time: '19:00', activity: '自由解散 👋', note: isStrict ? '准时收工' : '或者继续第二场？' },
    ]
  }

  const times = ['13:00', '13:30', '16:00', '18:00', '19:00', '21:00']
  const schedule = [
    { time: times[0], activity: '集合出发 🚗', note: isStrict ? '请准时！迟到罚奶茶💰' : '差不多到了就出发~' },
  ]
  picks.forEach((pick, i) => {
    schedule.push({
      time: times[i + 1] || `${16 + i * 2}:00`,
      activity: pick.title + ' ' + pick.emoji,
      note: pick.desc,
    })
  })
  schedule.push(
    { time: times[picks.length + 1] || '18:30', activity: '晚饭时间 🍜', note: '好吃的在路上' },
    { time: times[picks.length + 2] || '20:00', activity: '圆满结束 🌟', note: isStrict ? '按计划完美收官！' : '今天真开心~' },
  )
  return schedule
}

function drawPoster(canvas, result) {
  const ctx = canvas.getContext('2d')
  const w = 750
  const h = 1334
  canvas.width = w
  canvas.height = h

  const grad = ctx.createLinearGradient(0, 0, w, h)
  grad.addColorStop(0, '#6c5ce7')
  grad.addColorStop(0.5, '#a29bfe')
  grad.addColorStop(1, '#fd79a8')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)

  ctx.fillStyle = 'rgba(255,255,255,0.08)'
  ctx.beginPath(); ctx.arc(600, 120, 200, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(100, 400, 150, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(650, 900, 180, 0, Math.PI * 2); ctx.fill()

  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 56px "PingFang SC", "Microsoft YaHei", sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('🎲 帮你决定', w / 2, 120)

  ctx.font = '28px "PingFang SC", "Microsoft YaHei", sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.85)'
  ctx.fillText('我们的 MBTI 神奇组合', w / 2, 180)

  const mbtiStr = result.members.join(' + ')
  ctx.font = 'bold 36px "PingFang SC", "Microsoft YaHei", sans-serif'
  ctx.fillStyle = '#ffffff'

  if (ctx.measureText(mbtiStr).width > w - 100) {
    const half = Math.ceil(result.members.length / 2)
    ctx.fillText(result.members.slice(0, half).join(' + '), w / 2, 250)
    ctx.fillText(result.members.slice(half).join(' + '), w / 2, 300)
  } else {
    ctx.fillText(mbtiStr, w / 2, 270)
  }

  const vibes = result.groupVibes
  ctx.font = '26px "PingFang SC", "Microsoft YaHei", sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.9)'
  vibes.forEach((v, i) => {
    ctx.fillText(v, w / 2, 340 + i * 40)
  })

  const cardY = 340 + vibes.length * 40 + 30
  const recs = result.recommendations.slice(0, 3)

  recs.forEach((rec, i) => {
    const cy = cardY + i * 200
    const rx = 60, ry = cy, rw = w - 120, rh = 170, r = 24

    ctx.fillStyle = 'rgba(255,255,255,0.95)'
    ctx.beginPath()
    ctx.moveTo(rx + r, ry)
    ctx.lineTo(rx + rw - r, ry)
    ctx.quadraticCurveTo(rx + rw, ry, rx + rw, ry + r)
    ctx.lineTo(rx + rw, ry + rh - r)
    ctx.quadraticCurveTo(rx + rw, ry + rh, rx + rw - r, ry + rh)
    ctx.lineTo(rx + r, ry + rh)
    ctx.quadraticCurveTo(rx, ry + rh, rx, ry + rh - r)
    ctx.lineTo(rx, ry + r)
    ctx.quadraticCurveTo(rx, ry, rx + r, ry)
    ctx.closePath()
    ctx.fill()

    ctx.font = '48px sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText(rec.emoji, rx + 24, cy + 65)

    ctx.font = 'bold 32px "PingFang SC", "Microsoft YaHei", sans-serif'
    ctx.fillStyle = '#2d3436'
    ctx.fillText(rec.title, rx + 90, cy + 58)

    ctx.font = '22px "PingFang SC", "Microsoft YaHei", sans-serif'
    ctx.fillStyle = '#636e72'
    const maxDescW = rw - 120
    const desc = rec.desc.length > 22 ? rec.desc.slice(0, 22) + '…' : rec.desc
    ctx.fillText(desc, rx + 90, cy + 100)

    ctx.font = '20px "PingFang SC", "Microsoft YaHei", sans-serif'
    ctx.fillStyle = '#a29bfe'
    ctx.fillText(`⏱ ${rec.duration}  👥 ${rec.people}`, rx + 90, cy + 140)

    ctx.fillStyle = '#2d3436'
    ctx.textAlign = 'center'
  })

  const footerY = Math.min(cardY + recs.length * 200 + 40, h - 100)
  ctx.textAlign = 'center'
  ctx.font = '24px "PingFang SC", "Microsoft YaHei", sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.7)'
  ctx.fillText('— 「帮你决定」App 为你生成 —', w / 2, footerY)
  ctx.font = '20px "PingFang SC", "Microsoft YaHei", sans-serif'
  ctx.fillText('长按保存图片，分享给小伙伴们 🤝', w / 2, footerY + 40)
}

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
    setResult(getRecommendations(members))
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
        const canvas = canvasRef.current
        drawPoster(canvas, result)
        const url = canvas.toDataURL('image/png')
        setPosterUrl(url)
      } catch {
        // canvas error
      }
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

  const buttonInfo = getButtonText(members)

  return (
    <div className="space-y-5 pb-4">
      <div className="pt-4">
        <h1 className="text-2xl font-extrabold text-text flex items-center gap-2">
          🧠 MBTI 活动规划
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          添加同行小伙伴的 MBTI，为你们匹配命中注定的活动
        </p>
      </div>

      {/* Members List */}
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
            <span className="text-3xl block mb-2">👥</span>
            <p className="text-sm">还没有添加同行者呢</p>
            <p className="text-xs opacity-60 mt-1">快把你和朋友们的 MBTI 加上吧~</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 mb-3">
            {members.map((type, idx) => (
              <div
                key={idx}
                className={`animate-pop-in inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-semibold ${MBTI_COLORS[type]}`}
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <span>{type}</span>
                <span className="text-[10px] opacity-70">{MBTI_NICKNAMES[type]}</span>
                <button
                  onClick={() => removeMember(idx)}
                  className="ml-0.5 hover:bg-black/10 rounded-full p-0.5 transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

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
              <p className="text-xs text-text-secondary mb-3">点一下就行，选你的 MBTI 类型：</p>
              <div className="grid grid-cols-4 gap-2">
                {MBTI_TYPES.map(type => (
                  <button
                    key={type}
                    onClick={() => addMember(type)}
                    className={`py-2 px-1 rounded-xl border text-xs font-bold transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95 ${MBTI_COLORS[type]}`}
                  >
                    <div>{type}</div>
                    <div className="text-[9px] font-normal opacity-60 mt-0.5">{MBTI_NICKNAMES[type]}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Generate Button */}
      {members.length > 0 && !result && buttonInfo && (
        <button
          onClick={handleGenerate}
          className="animate-pop-in w-full py-4 bg-gradient-to-r from-primary to-accent text-white font-bold text-base rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 active:scale-[0.97] flex flex-col items-center gap-1"
        >
          <span className="flex items-center gap-2">
            <Sparkles size={20} />
            {buttonInfo.text}
          </span>
          <span className="text-[11px] font-normal opacity-80">{buttonInfo.sub}</span>
        </button>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4 animate-slide-up">
          {/* Four-Dimension Analysis */}
          <div className="bg-gradient-to-br from-primary/10 via-accent/5 to-sky/10 rounded-2xl p-4 border border-primary/10">
            <h3 className="font-bold text-text text-sm mb-3">📊 团队性格画像</h3>
            <div className="grid grid-cols-4 gap-2 text-center">
              {[
                { a: 'E', b: 'I', av: result.stats.E, bv: result.stats.I, ac: 'text-orange-500', bc: 'text-indigo-500' },
                { a: 'S', b: 'N', av: result.stats.S, bv: result.stats.N, ac: 'text-green-500', bc: 'text-purple-500' },
                { a: 'T', b: 'F', av: result.stats.T, bv: result.stats.F, ac: 'text-blue-500', bc: 'text-pink-500' },
                { a: 'J', b: 'P', av: result.stats.J, bv: result.stats.P, ac: 'text-red-500', bc: 'text-teal-500' },
              ].map(({ a, b, av, bv, ac, bc }) => (
                <div key={a + b} className="bg-white/60 rounded-xl py-2 px-1">
                  <div className="flex items-center justify-center gap-1 text-lg font-extrabold">
                    <span className={ac}>{av}</span>
                    <span className="text-gray-300 text-sm">:</span>
                    <span className={bc}>{bv}</span>
                  </div>
                  <div className="text-[10px] text-text-secondary mt-0.5">
                    <span className={ac}>{a}</span> / <span className={bc}>{b}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                      style={{ width: `${(av / (av + bv)) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 space-y-1">
              {result.groupVibes.map((vibe, i) => (
                <p key={i} className="text-center text-sm font-medium animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
                  {vibe}
                </p>
              ))}
            </div>
          </div>

          {/* Schedule (J-heavy teams) */}
          {result.schedule && (
            <div className="bg-card rounded-2xl p-4 shadow-sm border border-amber-100">
              <h3 className="font-bold text-text text-sm mb-3 flex items-center gap-2">
                <CalendarClock size={16} className="text-amber-500" />
                今日行程表
                <span className="text-[10px] font-normal text-text-secondary bg-amber-50 px-2 py-0.5 rounded-full">
                  J 人专属
                </span>
              </h3>
              <div className="relative pl-6 border-l-2 border-dashed border-amber-200 space-y-4">
                {result.schedule.map((item, i) => (
                  <div key={i} className="relative animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
                    <div className="absolute -left-[1.6rem] top-1 w-3 h-3 rounded-full bg-amber-400 border-2 border-white" />
                    <div>
                      <span className="text-xs font-bold text-amber-600">{item.time}</span>
                      <p className="text-sm font-semibold text-text">{item.activity}</p>
                      <p className="text-xs text-text-secondary">{item.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendation Cards */}
          <h3 className="font-bold text-text flex items-center gap-2">
            <Sparkles size={16} className="text-accent" />
            为你们推荐
          </h3>
          {result.recommendations.map((rec, idx) => (
            <div
              key={idx}
              className="animate-slide-up bg-card rounded-2xl p-4 shadow-sm border border-purple-50 hover:shadow-md transition-all duration-300"
              style={{ animationDelay: `${(idx + 1) * 80}ms` }}
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl flex-shrink-0">{rec.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-text text-base">{rec.title}</h4>
                    {rec.tag && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                        {rec.tag}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-text-secondary mt-1 leading-relaxed">{rec.desc}</p>
                  <div className="flex items-center gap-3 mt-3 text-[11px] text-text-secondary flex-wrap">
                    <span className="flex items-center gap-1"><Clock size={12} /> {rec.duration}</span>
                    <span className="flex items-center gap-1"><Users size={12} /> {rec.people}</span>
                    <span className="flex items-center gap-1"><MapPin size={12} /> {rec.vibe}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Share Poster Section */}
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
                <img
                  src={posterUrl}
                  alt="分享海报"
                  className="w-full rounded-xl shadow-md border border-gray-100"
                />
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
