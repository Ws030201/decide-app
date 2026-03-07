import { useState, useCallback } from 'react'
import { haptic } from '../../utils/haptic'

const SUITS = [
  { name: '♠', color: 'text-gray-900', label: '黑桃' },
  { name: '♥', color: 'text-red-500', label: '红心' },
  { name: '♣', color: 'text-gray-900', label: '梅花' },
  { name: '♦', color: 'text-red-500', label: '方块' },
]

const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']

const CARD_QUIPS = {
  A: '王炸开局！今天你说了算 👑',
  K: '国王驾到！全场听你的 🤴',
  Q: '女王范儿，气场两米八 💅',
  J: '骑士出击，勇往直前 ⚔️',
  '10': '十全十美，运气在线 ✨',
}

export default function CardDraw() {
  const [card, setCard] = useState(null)
  const [flipped, setFlipped] = useState(false)
  const [animating, setAnimating] = useState(false)

  const drawCard = useCallback(() => {
    if (animating) return
    haptic('flip')
    setAnimating(true)
    setFlipped(false)

    setTimeout(() => {
      const suit = SUITS[Math.floor(Math.random() * SUITS.length)]
      const rank = RANKS[Math.floor(Math.random() * RANKS.length)]
      setCard({ suit, rank })

      setTimeout(() => {
        setFlipped(true)
        haptic('success')
        setAnimating(false)
      }, 300)
    }, 200)
  }, [animating])

  const quip = card ? CARD_QUIPS[card.rank] : null

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      <p className="text-text-secondary text-sm">
        {animating ? '牌面正在翻转… 🃏' : '戳一下，看看命运给你发了什么牌'}
      </p>

      <div className="perspective-1000 cursor-pointer" onClick={drawCard}>
        <div
          className="relative w-44 h-64"
          style={{
            transformStyle: 'preserve-3d',
            transition: 'transform 0.6s ease-in-out',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* Card Back */}
          <div
            className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary via-primary-light to-accent shadow-lg border-4 border-white flex items-center justify-center"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="w-36 h-56 rounded-xl border-2 border-white/30 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-2">🃏</div>
                <p className="text-white/80 text-xs font-medium">点击翻牌</p>
              </div>
            </div>
          </div>

          {/* Card Front */}
          <div
            className="absolute inset-0 rounded-2xl bg-white shadow-lg border-2 border-gray-100 p-4 flex flex-col justify-between"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            {card && (
              <>
                <div className={`flex flex-col items-start ${card.suit.color}`}>
                  <span className="text-2xl font-bold leading-none">{card.rank}</span>
                  <span className="text-xl leading-none">{card.suit.name}</span>
                </div>
                <div className={`text-center ${card.suit.color}`}>
                  <span className="text-6xl">{card.suit.name}</span>
                </div>
                <div className={`flex flex-col items-end rotate-180 ${card.suit.color}`}>
                  <span className="text-2xl font-bold leading-none">{card.rank}</span>
                  <span className="text-xl leading-none">{card.suit.name}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {card && flipped && (
        <div className="animate-pop-in text-center space-y-1">
          <p className={`text-lg font-bold ${card.suit.color}`}>
            {card.suit.label} {card.rank}
          </p>
          {quip && <p className="text-xs text-text-secondary">{quip}</p>}
        </div>
      )}

      <button
        onClick={drawCard}
        disabled={animating}
        className="px-8 py-3 bg-gradient-to-r from-sky to-mint text-white font-semibold rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 active:scale-95 disabled:opacity-50 text-sm"
      >
        {animating ? '翻牌中… 🌀' : card ? '再来一张！🃏' : '🃏 抽一张牌'}
      </button>
    </div>
  )
}
