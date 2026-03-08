import { useState, useCallback, useRef } from 'react'
import { Plus, X, Play, RotateCcw, ChevronRight, Users } from 'lucide-react'
import { haptic } from '../../utils/haptic'

const SUITS = ['♠', '♥', '♦', '♣']
const VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
const RED_SUITS = new Set(['♥', '♦'])

const RULES = {
  'A': { name: '指名道姓', desc: '指定一人喝酒！', emoji: '👆', color: 'from-violet-500 to-purple-600' },
  '2': { name: '桃园结义', desc: '再拉两人，三人共饮！', emoji: '🍑', color: 'from-pink-500 to-rose-600' },
  '3': { name: '逛三园', desc: '选一类事物开始接龙，说不出的喝！', emoji: '🏞️', color: 'from-emerald-500 to-green-600' },
  '4': { name: '摸鼻子', desc: '所有人摸鼻子！最后一个摸的喝！', emoji: '👃', color: 'from-amber-500 to-yellow-600' },
  '5': { name: '照相机', desc: '持续效果：你看谁谁就得喝！', emoji: '📸', color: 'from-cyan-500 to-blue-600', isStatus: true },
  '6': { name: '左边喝', desc: '你左手边的人喝酒！', emoji: '⬅️', color: 'from-blue-500 to-indigo-600' },
  '7': { name: '逢七过', desc: '从1开始报数，逢7或7的倍数喊"过"！', emoji: '7️⃣', color: 'from-teal-500 to-cyan-600' },
  '8': { name: '厕所牌', desc: '获得一张免罚金牌！自动存入库存。', emoji: '🚽', color: 'from-lime-500 to-green-600', isInventory: true },
  '9': { name: '自己喝', desc: '没什么好说的，自罚一杯！', emoji: '🍺', color: 'from-orange-500 to-red-600' },
  '10': { name: '神经病', desc: '持续效果：随时可以指人喝酒！', emoji: '🤪', color: 'from-fuchsia-500 to-pink-600', isStatus: true },
  'J': { name: '左边喝', desc: '你左手边的人喝酒！', emoji: '⬅️', color: 'from-blue-500 to-indigo-600' },
  'Q': { name: '小姐牌', desc: '持续效果：别人喝酒你必须陪饮！', emoji: '👸', color: 'from-rose-500 to-pink-600', isStatus: true },
  'K': { name: '制定规则', desc: '你就是法律！制定一条新规则！', emoji: '👑', color: 'from-yellow-500 to-amber-600' },
}

const STATUS_MAP = {
  '5': { type: 'camera', name: '照相机' },
  '10': { type: 'crazy', name: '神经病' },
  'Q': { type: 'lady', name: '小姐牌' },
}

function createDeck() {
  const deck = []
  for (const suit of SUITS) {
    for (const value of VALUES) {
      deck.push({ suit, value })
    }
  }
  return deck
}

function fisherYatesShuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function playSound(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)

    if (type === 'alert') {
      osc.type = 'square'
      osc.frequency.value = 880
      gain.gain.value = 0.25
      osc.start()
      setTimeout(() => { osc.frequency.value = 660 }, 150)
      setTimeout(() => { osc.frequency.value = 880 }, 300)
      setTimeout(() => { osc.stop(); ctx.close() }, 450)
    } else if (type === 'flip') {
      osc.type = 'sine'
      osc.frequency.value = 523
      gain.gain.value = 0.12
      osc.start()
      setTimeout(() => { osc.frequency.value = 784 }, 80)
      setTimeout(() => { osc.stop(); ctx.close() }, 160)
    } else if (type === 'newround') {
      osc.type = 'sine'
      osc.frequency.value = 440
      gain.gain.value = 0.18
      osc.start()
      setTimeout(() => { osc.frequency.value = 554 }, 150)
      setTimeout(() => { osc.frequency.value = 659 }, 300)
      setTimeout(() => { osc.stop(); ctx.close() }, 500)
    } else if (type === 'status') {
      osc.type = 'triangle'
      osc.frequency.value = 600
      gain.gain.value = 0.15
      osc.start()
      setTimeout(() => { osc.frequency.value = 800 }, 100)
      setTimeout(() => { osc.stop(); ctx.close() }, 200)
    }
  } catch { /* unsupported browser */ }
}

// ─── Toast Notification Component ───
function ToastLayer({ toasts }) {
  if (toasts.length === 0) return null
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] space-y-2 w-[90%] max-w-[440px] pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`animate-toast-in px-4 py-3 rounded-2xl shadow-xl text-sm font-bold text-center backdrop-blur-sm ${
            t.type === 'expire'  ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white' :
            t.type === 'error'   ? 'bg-red-500 text-white' :
            t.type === 'success' ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white' :
            t.type === 'status'  ? 'bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white' :
            'bg-gray-800/90 text-white'
          }`}
        >
          {t.message}
        </div>
      ))}
    </div>
  )
}

// ─── Setup Phase Component ───
function SetupPhase({ onStart }) {
  const [playerNames, setPlayerNames] = useState(['', '', ''])
  const [statusDuration, setStatusDuration] = useState(3)

  const addPlayer = () => setPlayerNames(prev => [...prev, ''])
  const removePlayer = (idx) => {
    if (playerNames.length <= 2) return
    setPlayerNames(prev => prev.filter((_, i) => i !== idx))
  }
  const updateName = (idx, val) => {
    setPlayerNames(prev => prev.map((n, i) => i === idx ? val : n))
  }

  const handleStart = () => {
    const names = playerNames.map(n => n.trim()).filter(Boolean)
    if (names.length < 2) return
    if (new Set(names).size !== names.length) return
    onStart(names, statusDuration)
  }

  const validNames = playerNames.map(n => n.trim()).filter(Boolean)
  const hasDuplicates = new Set(validNames).size !== validNames.length
  const canStart = validNames.length >= 2 && !hasDuplicates

  return (
    <div className="space-y-4 w-full">
      <div className="text-center mb-2">
        <span className="text-5xl block mb-2">🃏</span>
        <h2 className="text-xl font-black text-text">金陵十三钗</h2>
        <p className="text-xs text-text-secondary mt-0.5">专业版 · 完整状态追踪</p>
      </div>

      {/* Player list */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-text flex items-center gap-1.5">
            <Users size={15} /> 玩家 ({validNames.length})
          </span>
          <button
            onClick={addPlayer}
            className="text-xs text-primary font-semibold flex items-center gap-0.5 active:scale-95 transition-transform"
          >
            <Plus size={13} /> 添加
          </button>
        </div>

        <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
          {playerNames.map((name, idx) => (
            <div key={idx} className="flex gap-2 items-center animate-slide-up" style={{ animationDelay: `${idx * 50}ms` }}>
              <span className="text-xs text-text-secondary w-5 text-right font-mono">{idx + 1}</span>
              <input
                type="text"
                value={name}
                onChange={e => updateName(idx, e.target.value)}
                placeholder={`玩家 ${idx + 1} 的名字`}
                className="flex-1 px-3 py-2.5 rounded-xl border border-purple-100 bg-white/90 text-sm text-text placeholder:text-text-secondary/40 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
              />
              {playerNames.length > 2 && (
                <button
                  onClick={() => removePlayer(idx)}
                  className="p-2 rounded-xl text-red-400 hover:bg-red-50 active:scale-90 transition-all"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
        {hasDuplicates && (
          <p className="text-xs text-red-500 font-medium pl-7">⚠️ 玩家名字不能重复</p>
        )}
      </div>

      {/* Status duration setting */}
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-4 border border-purple-100">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-bold text-text">⏱️ 状态牌有效圈数</p>
            <p className="text-[10px] text-text-secondary mt-1 leading-relaxed">
              📸照相机 / 🤪神经病 / 👸小姐牌<br/>
              经过此圈数后自动失效并提醒
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setStatusDuration(d => Math.max(1, d - 1))}
              className="w-8 h-8 rounded-xl bg-white border border-purple-200 flex items-center justify-center text-text font-bold text-base active:scale-90 transition-transform shadow-sm"
            >
              −
            </button>
            <span className="text-2xl font-black text-primary w-7 text-center">{statusDuration}</span>
            <button
              onClick={() => setStatusDuration(d => Math.min(10, d + 1))}
              className="w-8 h-8 rounded-xl bg-white border border-purple-200 flex items-center justify-center text-text font-bold text-base active:scale-90 transition-transform shadow-sm"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Start button */}
      <button
        onClick={handleStart}
        disabled={!canStart}
        className="w-full py-3.5 bg-gradient-to-r from-primary to-primary-light text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 active:scale-[0.97] text-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:active:scale-100"
      >
        <Play size={16} fill="white" /> 开始游戏
      </button>
    </div>
  )
}

// ─── Playing Card Component ───
function PlayingCard({ card, isFlipped, onDraw }) {
  const isRed = card ? RED_SUITS.has(card.suit) : false
  const suitColor = isRed ? 'text-red-500' : 'text-gray-800'

  return (
    <div className="perspective-1000 cursor-pointer select-none" onClick={onDraw}>
      <div
        className={`relative w-[170px] h-[250px] transition-transform duration-700 ease-in-out preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}
      >
        {/* Back face */}
        <div className="absolute inset-0 backface-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-700 shadow-2xl flex items-center justify-center border-[3px] border-indigo-400/30 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="absolute text-white/20 text-xl font-bold"
                style={{ top: `${(i % 4) * 30 + 10}%`, left: `${Math.floor(i / 4) * 35 + 5}%`, transform: `rotate(${i * 30}deg)` }}
              >
                ♠♥♦♣
              </div>
            ))}
          </div>
          <div className="w-[82%] h-[85%] rounded-xl border-2 border-white/20 flex items-center justify-center relative">
            <div className="text-center">
              <span className="text-5xl drop-shadow-lg">🃏</span>
              <p className="text-white/60 text-xs mt-3 font-semibold tracking-wider">点击抽牌</p>
            </div>
          </div>
        </div>

        {/* Front face */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-2xl bg-white shadow-2xl border-[3px] border-gray-100 p-3 flex flex-col justify-between overflow-hidden">
          {card && (
            <>
              <div className={`text-left leading-none ${suitColor}`}>
                <span className="text-2xl font-black">{card.value}</span>
                <span className="text-lg ml-0.5">{card.suit}</span>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <span className={`text-7xl ${suitColor} drop-shadow-sm`}>
                  {card.suit}
                </span>
              </div>
              <div className={`text-right leading-none ${suitColor}`}>
                <span className="text-lg mr-0.5">{card.suit}</span>
                <span className="text-2xl font-black">{card.value}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Rule Banner Component ───
function RuleBanner({ rule }) {
  if (!rule) return null
  return (
    <div className="w-full animate-pop-in mt-3">
      <div className={`bg-gradient-to-r ${rule.color} rounded-2xl p-5 text-center shadow-xl relative overflow-hidden`}>
        <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px]" />
        <div className="relative">
          <span className="text-5xl block mb-2 drop-shadow-md">{rule.emoji}</span>
          <p className="text-3xl font-black text-white tracking-wider drop-shadow-sm">{rule.name}</p>
          <p className="text-sm text-white/90 mt-2 font-semibold">{rule.desc}</p>
          {rule.isStatus && (
            <span className="inline-block mt-2 px-3 py-1 rounded-full bg-white/20 text-[10px] text-white font-bold">
              ⏱ 持续性效果
            </span>
          )}
          {rule.isInventory && (
            <span className="inline-block mt-2 px-3 py-1 rounded-full bg-white/20 text-[10px] text-white font-bold">
              📦 已存入库存
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Player Status Panel Component ───
function PlayerPanel({ players, currentIdx, toilets, activeStatuses, currentCircle, statusDuration, onUseToilet }) {
  return (
    <div className="bg-white/90 rounded-2xl p-3 border border-purple-50 shadow-sm">
      <p className="text-xs font-bold text-text-secondary mb-2 flex items-center gap-1">📋 玩家状态面板</p>
      <div className="space-y-1">
        {players.map((name, idx) => {
          const pStatuses = activeStatuses.filter(s => s.player === name)
          const toiletCount = toilets[name] || 0
          const isCurrent = idx === currentIdx
          return (
            <div
              key={name}
              className={`flex items-center justify-between py-2 px-2.5 rounded-xl transition-all duration-300 ${
                isCurrent ? 'bg-primary/5 border border-primary/20' : 'border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className={`text-xs font-bold truncate ${isCurrent ? 'text-primary' : 'text-text'}`}>
                  {isCurrent ? '▶ ' : ''}{name}
                </span>
                <div className="flex gap-1 flex-wrap">
                  {pStatuses.map((s, i) => {
                    const remaining = statusDuration - (currentCircle - s.triggerCircle)
                    return (
                      <span
                        key={i}
                        className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-purple-100 text-[10px] font-bold text-purple-700 animate-pulse-glow"
                      >
                        {s.emoji} {remaining > 0 ? `${remaining}圈` : '即将失效'}
                      </span>
                    )
                  })}
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                <span className="text-[11px] text-text-secondary font-semibold">🚽×{toiletCount}</span>
                {toiletCount > 0 && (
                  <button
                    onClick={() => onUseToilet(name)}
                    className="px-2 py-1 rounded-lg bg-lime-100 text-lime-700 text-[10px] font-bold active:scale-90 transition-transform hover:bg-lime-200"
                  >
                    使用
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Main Game Component ───
export default function ThirteenCards() {
  const [phase, setPhase] = useState('setup')

  const [players, setPlayers] = useState([])
  const [statusDuration, setStatusDuration] = useState(3)
  const [deck, setDeck] = useState([])
  const [round, setRound] = useState(1)
  const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0)
  const [currentCircle, setCurrentCircle] = useState(1)
  const [currentCard, setCurrentCard] = useState(null)
  const [isFlipped, setIsFlipped] = useState(false)
  const [showRule, setShowRule] = useState(false)
  const [toilets, setToilets] = useState({})
  const [activeStatuses, setActiveStatuses] = useState([])
  const [toasts, setToasts] = useState([])

  const toastIdRef = useRef(0)

  const addToast = useCallback((message, type = 'info') => {
    const id = ++toastIdRef.current
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }, [])

  const handleStart = useCallback((names, duration) => {
    const newDeck = fisherYatesShuffle(createDeck())
    setPlayers(names)
    setStatusDuration(duration)
    setDeck(newDeck)
    setRound(1)
    setCurrentPlayerIdx(0)
    setCurrentCircle(1)
    setCurrentCard(null)
    setIsFlipped(false)
    setShowRule(false)
    setToilets(Object.fromEntries(names.map(n => [n, 0])))
    setActiveStatuses([])
    setPhase('playing')
    haptic('success')
  }, [])

  const drawCard = useCallback(() => {
    if (currentCard) return

    let currentDeck = [...deck]
    let newRound = round

    if (currentDeck.length === 0) {
      currentDeck = fisherYatesShuffle(createDeck())
      newRound = round + 1
      setRound(newRound)
      addToast(`🃏 牌库用尽！洗入新牌，进入第 ${newRound} 轮`, 'info')
      playSound('newround')
    }

    const card = currentDeck.pop()
    setDeck(currentDeck)
    setCurrentCard(card)

    setTimeout(() => {
      setIsFlipped(true)
      haptic('flip')
      playSound('flip')
    }, 100)

    setTimeout(() => {
      setShowRule(true)

      const playerName = players[currentPlayerIdx]
      const rule = RULES[card.value]

      if (rule.isInventory) {
        setToilets(prev => ({ ...prev, [playerName]: (prev[playerName] || 0) + 1 }))
        addToast(`🚽 ${playerName} 获得一张厕所牌！`, 'success')
        playSound('status')
      }

      if (rule.isStatus) {
        const statusInfo = STATUS_MAP[card.value]
        setActiveStatuses(prev => [...prev, {
          player: playerName,
          type: statusInfo.type,
          typeName: statusInfo.name,
          emoji: rule.emoji,
          triggerCircle: currentCircle,
        }])
        addToast(`${rule.emoji} ${playerName} 触发了【${statusInfo.name}】效果！`, 'status')
        playSound('status')
      }
    }, 800)
  }, [currentCard, deck, round, players, currentPlayerIdx, currentCircle, addToast])

  const nextTurn = useCallback(() => {
    const nextIdx = (currentPlayerIdx + 1) % players.length
    const newCircle = nextIdx === 0 ? currentCircle + 1 : currentCircle

    const expired = activeStatuses.filter(s => newCircle - s.triggerCircle >= statusDuration)
    const remaining = activeStatuses.filter(s => newCircle - s.triggerCircle < statusDuration)

    if (expired.length > 0) {
      expired.forEach((s, i) => {
        setTimeout(() => {
          addToast(`⏰ ${s.player} 的【${s.typeName}】效果已解除！`, 'expire')
          playSound('alert')
          haptic('heavy')
        }, i * 600)
      })
      setActiveStatuses(remaining)
    }

    setCurrentPlayerIdx(nextIdx)
    if (nextIdx === 0) setCurrentCircle(c => c + 1)
    setCurrentCard(null)
    setIsFlipped(false)
    setShowRule(false)
  }, [currentPlayerIdx, players.length, currentCircle, activeStatuses, statusDuration, addToast])

  const useToilet = useCallback((playerName) => {
    if ((toilets[playerName] || 0) <= 0) return
    setToilets(prev => ({ ...prev, [playerName]: prev[playerName] - 1 }))
    addToast(`🚽 ${playerName} 使用了一张厕所牌！免罚一次！`, 'info')
    haptic('medium')
  }, [toilets, addToast])

  const resetGame = useCallback(() => {
    setPhase('setup')
    setCurrentCard(null)
    setIsFlipped(false)
    setShowRule(false)
    setToasts([])
  }, [])

  if (phase === 'setup') {
    return (
      <div className="bg-card rounded-2xl p-5 shadow-sm border border-purple-50">
        <SetupPhase onStart={handleStart} />
      </div>
    )
  }

  const currentPlayer = players[currentPlayerIdx]
  const cardRule = currentCard ? RULES[currentCard.value] : null

  return (
    <div className="space-y-3 w-full pb-2">
      <ToastLayer toasts={toasts} />

      {/* Header stats */}
      <div className="flex items-center justify-between">
        <button
          onClick={resetGame}
          className="text-xs text-text-secondary flex items-center gap-1 px-2.5 py-1.5 rounded-xl hover:bg-white/60 active:scale-95 transition-all"
        >
          <RotateCcw size={12} /> 退出
        </button>
        <div className="flex gap-1.5 text-[10px] font-bold">
          <span className="px-2.5 py-1 rounded-lg bg-purple-100 text-purple-700">第{round}轮</span>
          <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-700">第{currentCircle}圈</span>
          <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-700">🃏 {deck.length}</span>
        </div>
      </div>

      {/* Player carousel */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        {players.map((name, idx) => {
          const isCurrent = idx === currentPlayerIdx
          return (
            <div
              key={name}
              className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
                isCurrent
                  ? 'bg-gradient-to-r from-primary to-primary-light text-white shadow-lg scale-[1.05]'
                  : 'bg-white/70 text-text-secondary border border-purple-50'
              }`}
            >
              {isCurrent && '🎯 '}{name}
            </div>
          )
        })}
      </div>

      {/* Current player callout */}
      <div className="text-center py-1">
        <p className="text-text-secondary text-xs">当前回合</p>
        <p className="text-lg font-black text-primary">{currentPlayer}</p>
      </div>

      {/* Card area */}
      <div className="flex flex-col items-center">
        <PlayingCard
          card={currentCard}
          isFlipped={isFlipped}
          onDraw={drawCard}
        />
        {showRule && <RuleBanner rule={cardRule} />}
      </div>

      {/* Next turn button */}
      {showRule && (
        <button
          onClick={nextTurn}
          className="w-full py-3.5 bg-gradient-to-r from-primary to-primary-light text-white font-bold rounded-2xl shadow-lg transition-all active:scale-[0.97] text-sm flex items-center justify-center gap-1.5 animate-slide-up"
        >
          下一位 <ChevronRight size={16} />
        </button>
      )}

      {/* Player status panel */}
      <PlayerPanel
        players={players}
        currentIdx={currentPlayerIdx}
        toilets={toilets}
        activeStatuses={activeStatuses}
        currentCircle={currentCircle}
        statusDuration={statusDuration}
        onUseToilet={useToilet}
      />
    </div>
  )
}
