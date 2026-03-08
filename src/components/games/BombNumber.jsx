import { useState, useCallback } from 'react'
import { RotateCcw, Send, Delete } from 'lucide-react'
import { haptic } from '../../utils/haptic'

function playBoom() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const now = ctx.currentTime
    const rumble = ctx.createOscillator()
    const rumbleG = ctx.createGain()
    rumble.type = 'sawtooth'
    rumble.connect(rumbleG)
    rumbleG.connect(ctx.destination)
    rumble.frequency.setValueAtTime(80, now)
    rumble.frequency.exponentialRampToValueAtTime(20, now + 0.6)
    rumbleG.gain.setValueAtTime(0.4, now)
    rumbleG.gain.exponentialRampToValueAtTime(0.01, now + 0.8)
    rumble.start(now)
    rumble.stop(now + 0.8)
    const burst = ctx.createOscillator()
    const burstG = ctx.createGain()
    burst.type = 'square'
    burst.connect(burstG)
    burstG.connect(ctx.destination)
    burst.frequency.setValueAtTime(200, now)
    burst.frequency.exponentialRampToValueAtTime(40, now + 0.4)
    burstG.gain.setValueAtTime(0.3, now)
    burstG.gain.exponentialRampToValueAtTime(0.01, now + 0.5)
    burst.start(now)
    burst.stop(now + 0.5)
    const crack = ctx.createOscillator()
    const crackG = ctx.createGain()
    crack.type = 'sawtooth'
    crack.connect(crackG)
    crackG.connect(ctx.destination)
    crack.frequency.setValueAtTime(600, now)
    crack.frequency.exponentialRampToValueAtTime(100, now + 0.15)
    crackG.gain.setValueAtTime(0.25, now)
    crackG.gain.exponentialRampToValueAtTime(0.01, now + 0.2)
    crack.start(now)
    crack.stop(now + 0.2)
    setTimeout(() => ctx.close(), 1000)
  } catch { /* unsupported */ }
}

function playTick() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.setValueAtTime(600, now)
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.1)
    gain.gain.setValueAtTime(0.15, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12)
    osc.start(now)
    osc.stop(now + 0.12)
    const tap = ctx.createOscillator()
    const tapG = ctx.createGain()
    tap.type = 'triangle'
    tap.connect(tapG)
    tapG.connect(ctx.destination)
    tap.frequency.value = 1000
    tapG.gain.setValueAtTime(0.08, now + 0.05)
    tapG.gain.exponentialRampToValueAtTime(0.01, now + 0.1)
    tap.start(now + 0.05)
    tap.stop(now + 0.1)
    setTimeout(() => ctx.close(), 200)
  } catch { /* unsupported */ }
}

const NUM_KEYS = [1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, 'del']

export default function BombNumber() {
  const [phase, setPhase] = useState('ready')
  const [bomb, setBomb] = useState(0)
  const [low, setLow] = useState(1)
  const [high, setHigh] = useState(100)
  const [input, setInput] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [shaking, setShaking] = useState(false)
  const [shrinking, setShrinking] = useState(false)
  const [boomFlash, setBoomFlash] = useState(false)

  const startGame = useCallback(() => {
    const num = Math.floor(Math.random() * 100) + 1
    setBomb(num)
    setLow(1)
    setHigh(100)
    setInput('')
    setAttempts(0)
    setPhase('playing')
    haptic('medium')
  }, [])

  const handleKeyPress = useCallback((key) => {
    if (key === 'del') {
      setInput(prev => prev.slice(0, -1))
      haptic('light')
      return
    }
    if (key === null) return
    setInput(prev => {
      if (prev.length >= 3) return prev
      return prev + String(key)
    })
    haptic('light')
  }, [])

  const triggerBoom = useCallback(() => {
    setPhase('boom')
    setBoomFlash(true)
    playBoom()
    haptic('heavy')
    try { navigator.vibrate?.([100, 50, 100, 50, 200, 100, 400]) } catch {}
    setTimeout(() => setBoomFlash(false), 2000)
  }, [])

  const handleConfirm = useCallback(() => {
    const guess = parseInt(input, 10)
    if (isNaN(guess) || guess < low || guess > high) {
      setShaking(true)
      haptic('heavy')
      setTimeout(() => setShaking(false), 500)
      return
    }

    setAttempts(a => a + 1)
    setInput('')

    if (guess === bomb) {
      triggerBoom()
      return
    }

    const newLow = guess < bomb ? guess + 1 : low
    const newHigh = guess > bomb ? guess - 1 : high

    // 范围缩到只剩炸弹本身 → 等同踩中，直接爆炸
    if (newLow === newHigh) {
      setLow(newLow)
      setHigh(newHigh)
      triggerBoom()
      return
    }

    playTick()
    setShrinking(true)
    setTimeout(() => setShrinking(false), 300)
    setLow(newLow)
    setHigh(newHigh)
    haptic('medium')
  }, [input, low, high, bomb, triggerBoom])

  // ─── Boom Screen ───
  if (phase === 'boom') {
    return (
      <div className="flex flex-col items-center gap-5 w-full">
        {boomFlash && (
          <div className="fixed inset-0 z-50 bg-red-600 animate-red-flash pointer-events-none" />
        )}
        <div className={`w-full ${boomFlash ? 'animate-screen-shake' : ''}`}>
          <div className="w-full rounded-3xl bg-gradient-to-b from-red-500 via-red-600 to-red-800 p-8 text-center shadow-2xl animate-pop-in">
            <span className="text-8xl block mb-3 drop-shadow-lg">💥</span>
            <p className="text-4xl font-black text-white tracking-widest mb-2">BOOM!</p>
            <p className="text-lg text-red-100 font-bold">踩中炸弹，罚酒！</p>
            <div className="mt-4 inline-block px-5 py-2 rounded-full bg-white/20 backdrop-blur-sm">
              <p className="text-sm text-white font-bold">
                炸弹数字：<span className="text-yellow-300 text-xl">{bomb}</span>
              </p>
            </div>
            <p className="text-xs text-red-200 mt-3">共猜了 {attempts} 次</p>
          </div>
        </div>
        <button
          onClick={startGame}
          className="w-full py-3.5 bg-gradient-to-r from-primary to-primary-light text-white font-bold rounded-2xl shadow-lg transition-all active:scale-[0.97] text-sm flex items-center justify-center gap-2"
        >
          <RotateCcw size={16} /> 再来一局
        </button>
      </div>
    )
  }

  // ─── Ready Screen ───
  if (phase === 'ready') {
    return (
      <div className="flex flex-col items-center gap-5 w-full">
        <div className="text-center">
          <span className="text-6xl block mb-3 animate-bounce-soft">💣</span>
          <h2 className="text-xl font-black text-text">猜数字炸弹</h2>
          <p className="text-xs text-text-secondary mt-1">1~100 之间有一个炸弹数字</p>
          <p className="text-xs text-text-secondary">猜中即爆炸，罚酒一杯！</p>
        </div>
        <button
          onClick={startGame}
          className="w-full py-3.5 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all active:scale-[0.97] text-sm flex items-center justify-center gap-2"
        >
          💣 开始游戏
        </button>
      </div>
    )
  }

  // ─── Playing Screen ───
  const rangeWidth = high - low + 1
  const dangerLevel = rangeWidth <= 5 ? 'critical' : rangeWidth <= 15 ? 'danger' : rangeWidth <= 30 ? 'warning' : 'safe'
  const rangeColors = {
    critical: 'from-red-500 to-red-600 text-white',
    danger: 'from-orange-400 to-red-500 text-white',
    warning: 'from-yellow-400 to-orange-400 text-white',
    safe: 'from-blue-100 to-indigo-100 text-text',
  }
  const guess = parseInt(input, 10)
  const isValid = !isNaN(guess) && guess >= low && guess <= high

  return (
    <div className={`flex flex-col items-center gap-4 w-full ${shaking ? 'animate-shake' : ''}`}>
      {/* Range display */}
      <div className={`w-full rounded-2xl p-6 text-center bg-gradient-to-br ${rangeColors[dangerLevel]} shadow-lg transition-all duration-500 ${shrinking ? 'animate-number-shrink' : ''}`}>
        <p className={`text-xs font-bold mb-3 ${dangerLevel === 'safe' ? 'text-text-secondary' : 'text-white/80'}`}>
          💣 安全范围
        </p>
        <div className="flex items-center justify-center gap-3">
          <span className="text-4xl font-black">{low}</span>
          <span className={`text-2xl font-light ${dangerLevel === 'safe' ? 'text-text-secondary' : 'text-white/60'}`}>~</span>
          <span className="text-4xl font-black">{high}</span>
        </div>
        <div className="mt-3 flex items-center justify-center gap-3">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${dangerLevel === 'safe' ? 'bg-black/5 text-text-secondary' : 'bg-white/20'}`}>
            剩余 {rangeWidth} 个数字
          </span>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${dangerLevel === 'safe' ? 'bg-black/5 text-text-secondary' : 'bg-white/20'}`}>
            第 {attempts + 1} 次猜测
          </span>
        </div>
      </div>

      {/* Input display */}
      <div className="w-full bg-white rounded-2xl p-4 border border-purple-50 shadow-sm">
        <div className="h-14 flex items-center justify-center rounded-xl bg-gray-50 border-2 border-dashed border-gray-200 mb-3">
          {input ? (
            <span className="text-3xl font-black text-text tracking-widest">{input}</span>
          ) : (
            <span className="text-sm text-text-secondary/40 font-medium">输入你的猜测</span>
          )}
        </div>

        {/* Number keypad */}
        <div className="grid grid-cols-3 gap-2">
          {NUM_KEYS.map((key, idx) => {
            if (key === null) return <div key={idx} />
            if (key === 'del') {
              return (
                <button
                  key={idx}
                  onClick={() => handleKeyPress('del')}
                  className="h-12 rounded-xl bg-gray-100 flex items-center justify-center text-text-secondary active:scale-90 active:bg-gray-200 transition-all"
                >
                  <Delete size={20} />
                </button>
              )
            }
            return (
              <button
                key={idx}
                onClick={() => handleKeyPress(key)}
                className="h-12 rounded-xl bg-gray-50 border border-gray-100 text-lg font-bold text-text active:scale-90 active:bg-primary/10 active:border-primary/30 transition-all"
              >
                {key}
              </button>
            )
          })}
        </div>
      </div>

      {/* Confirm button */}
      <button
        onClick={handleConfirm}
        disabled={!input}
        className={`w-full py-3.5 font-bold rounded-2xl shadow-lg transition-all active:scale-[0.97] text-sm flex items-center justify-center gap-2 ${
          isValid
            ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white hover:shadow-xl'
            : input
              ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-white'
              : 'bg-gray-200 text-gray-400'
        }`}
      >
        <Send size={16} />
        {input ? (isValid ? `确认猜 ${input}` : `${guess < low ? '太小了' : '太大了'}，范围 ${low}~${high}`) : '请输入数字'}
      </button>
    </div>
  )
}
