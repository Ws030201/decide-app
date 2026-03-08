import { useState, useCallback, useRef, useEffect } from 'react'
import { haptic } from '../../utils/haptic'

const TOPICS = [
  '说一种水果 🍎',
  '说一个国家名 🌍',
  '说一个品牌名 💼',
  '说一种动物 🐾',
  '说一个明星名 ⭐',
  '说一种颜色 🎨',
  '说一个城市名 🏙️',
  '说一种运动 ⚽',
  '说一种食物 🍕',
  '说一个电影名 🎬',
  '说一首歌名 🎵',
  '说一种花名 🌸',
  '说一种职业 👨‍⚕️',
  '说一个 App 名 📱',
  '说一种饮料 🥤',
  '说一个卡通角色 🧸',
]

const SPEEDS = [
  { id: 'fast', label: '快速', emoji: '⚡', min: 5, max: 15 },
  { id: 'normal', label: '标准', emoji: '🔥', min: 10, max: 30 },
  { id: 'long', label: '持久', emoji: '💀', min: 20, max: 60 },
]

export default function TimeBomb() {
  const [phase, setPhase] = useState('setup')
  const [speed, setSpeed] = useState('normal')
  const [topic, setTopic] = useState(() => TOPICS[Math.floor(Math.random() * TOPICS.length)])
  const [intensity, setIntensity] = useState('low')
  const durationRef = useRef(0)
  const startTimeRef = useRef(0)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (phase !== 'ticking') return

    const check = () => {
      const elapsed = Date.now() - startTimeRef.current
      const progress = elapsed / durationRef.current

      if (progress >= 1) {
        clearInterval(intervalRef.current)
        setPhase('exploded')
        try { navigator.vibrate?.([100, 50, 100, 50, 200, 100, 400]) } catch {}
      } else if (progress > 0.8) {
        setIntensity('high')
      } else if (progress > 0.5) {
        setIntensity('medium')
      } else {
        setIntensity('low')
      }
    }

    intervalRef.current = setInterval(check, 100)
    return () => clearInterval(intervalRef.current)
  }, [phase])

  const startBomb = useCallback(() => {
    const cfg = SPEEDS.find((s) => s.id === speed)
    const duration = (cfg.min + Math.random() * (cfg.max - cfg.min)) * 1000
    durationRef.current = duration
    startTimeRef.current = Date.now()
    setTopic(TOPICS[Math.floor(Math.random() * TOPICS.length)])
    setIntensity('low')
    setPhase('ticking')
    haptic('heavy')
  }, [speed])

  const reset = useCallback(() => {
    clearInterval(intervalRef.current)
    setPhase('setup')
    setIntensity('low')
    setTopic(TOPICS[Math.floor(Math.random() * TOPICS.length)])
  }, [])

  if (phase === 'exploded') {
    return (
      <div className="flex flex-col items-center gap-5 w-full animate-pop-in">
        <div className="w-full rounded-2xl bg-gradient-to-b from-red-500 to-red-700 p-8 text-center shadow-xl">
          <span className="text-6xl block mb-3">💥</span>
          <p className="text-3xl font-black text-white tracking-wider">BOOM!</p>
          <p className="text-base text-red-100 mt-2 font-medium">
            不幸的人就是你！💀
          </p>
        </div>
        <button
          onClick={reset}
          className="px-8 py-3 bg-gradient-to-r from-primary to-primary-light text-white font-semibold rounded-2xl shadow-md transition-all duration-300 active:scale-95 text-sm"
        >
          再来一局 🔄
        </button>
      </div>
    )
  }

  if (phase === 'ticking') {
    return (
      <div className="flex flex-col items-center gap-5 w-full">
        <p className="text-sm text-text-secondary text-center">
          传！快传给下一个人！
        </p>

        <div
          className={`w-full rounded-2xl p-8 text-center transition-all duration-300 ${
            intensity === 'high'
              ? 'bg-gradient-to-b from-red-100 to-red-200 animate-shake'
              : intensity === 'medium'
                ? 'bg-gradient-to-b from-orange-50 to-red-100'
                : 'bg-gradient-to-b from-yellow-50 to-orange-50'
          }`}
        >
          <span
            className={`text-7xl block mb-4 ${
              intensity === 'high'
                ? 'animate-shake'
                : intensity === 'medium'
                  ? 'animate-bounce-soft'
                  : 'animate-float'
            }`}
          >
            💣
          </span>
          <div className="bg-white/80 rounded-xl py-3 px-4">
            <p className="text-xs text-text-secondary mb-1">本轮话题</p>
            <p className="text-lg font-bold text-text">{topic}</p>
          </div>
          <p className="text-xs text-text-secondary mt-3">
            说不出来就传给下一位！
          </p>
        </div>

        <button
          onClick={reset}
          className="px-6 py-2 bg-gray-200 text-text-secondary font-medium rounded-xl text-xs transition-all active:scale-95"
        >
          强制结束
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <p className="text-text-secondary text-sm text-center">
        设定炸弹倒计时，传给下一个人！
      </p>

      {/* Speed Selection */}
      <div className="flex gap-2 w-full">
        {SPEEDS.map((s) => (
          <button
            key={s.id}
            onClick={() => { setSpeed(s.id); haptic('light') }}
            className={`flex-1 flex flex-col items-center gap-0.5 py-3 rounded-xl text-xs font-semibold transition-all duration-300 ${
              speed === s.id
                ? 'bg-gradient-to-b from-red-400 to-orange-400 text-white shadow-md'
                : 'bg-gray-100 text-text-secondary'
            }`}
          >
            <span className="text-lg">{s.emoji}</span>
            <span>{s.label}</span>
            <span className="text-[10px] opacity-70">{s.min}-{s.max}秒</span>
          </button>
        ))}
      </div>

      {/* Topic Preview */}
      <div className="w-full bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-5 text-center border border-orange-100">
        <span className="text-5xl block mb-3">💣</span>
        <p className="text-xs text-text-secondary mb-1">本轮话题预览</p>
        <p className="text-base font-bold text-text">{topic}</p>
        <button
          onClick={() => setTopic(TOPICS[Math.floor(Math.random() * TOPICS.length)])}
          className="mt-2 text-xs text-primary font-medium"
        >
          换个话题 🔄
        </button>
      </div>

      {/* Start Button */}
      <button
        onClick={startBomb}
        className="w-full py-3.5 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95 text-sm"
      >
        💣 启动炸弹！
      </button>
    </div>
  )
}
