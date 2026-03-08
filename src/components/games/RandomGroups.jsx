import { useState, useCallback } from 'react'
import { haptic } from '../../utils/haptic'
import { X } from 'lucide-react'

const GROUP_COLORS = [
  'from-violet-400 to-purple-500',
  'from-pink-400 to-rose-500',
  'from-blue-400 to-indigo-500',
  'from-emerald-400 to-green-500',
  'from-amber-400 to-orange-500',
  'from-cyan-400 to-teal-500',
  'from-red-400 to-pink-500',
  'from-indigo-400 to-violet-500',
]

const GROUP_LABELS = ['A 组', 'B 组', 'C 组', 'D 组', 'E 组', 'F 组', 'G 组', 'H 组']

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function RandomGroups() {
  const [inputValue, setInputValue] = useState('')
  const [names, setNames] = useState([])
  const [groupCount, setGroupCount] = useState(2)
  const [groups, setGroups] = useState(null)
  const [shuffling, setShuffling] = useState(false)

  const addName = useCallback(() => {
    const trimmed = inputValue.trim()
    if (!trimmed) return
    const newNames = trimmed
      .split(/[,，、\s\n]+/)
      .map((n) => n.trim())
      .filter((n) => n.length > 0)
    setNames((prev) => [...prev, ...newNames])
    setInputValue('')
    setGroups(null)
    haptic('light')
  }, [inputValue])

  const removeName = useCallback((index) => {
    setNames((prev) => prev.filter((_, i) => i !== index))
    setGroups(null)
  }, [])

  const doShuffle = useCallback(() => {
    if (names.length < groupCount) return
    haptic('spin')
    setShuffling(true)
    setGroups(null)

    setTimeout(() => {
      const shuffled = shuffle(names)
      const result = Array.from({ length: groupCount }, () => [])
      shuffled.forEach((name, i) => result[i % groupCount].push(name))
      setGroups(result)
      setShuffling(false)
      haptic('success')
    }, 600)
  }, [names, groupCount])

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Name Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addName()}
          placeholder="输入名字，回车添加"
          className="flex-1 px-4 py-2.5 rounded-xl border border-purple-100 bg-white text-sm text-text placeholder:text-text-secondary/50 outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
        />
        <button
          onClick={addName}
          className="px-4 py-2.5 bg-gradient-to-r from-primary to-primary-light text-white font-semibold rounded-xl text-sm active:scale-95 transition-all"
        >
          添加
        </button>
      </div>

      {/* Name Tags */}
      {names.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {names.map((name, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary text-xs font-medium rounded-full"
            >
              {name}
              <button
                onClick={() => removeName(i)}
                className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Group Count */}
      <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
        <span className="text-sm text-text font-medium">分成几组</span>
        <div className="flex items-center gap-2">
          {[2, 3, 4, 5, 6].map((n) => (
            <button
              key={n}
              onClick={() => { setGroupCount(n); setGroups(null); haptic('light') }}
              className={`w-9 h-9 rounded-lg text-sm font-bold transition-all duration-300 ${
                groupCount === n
                  ? 'bg-gradient-to-r from-primary to-primary-light text-white shadow-md'
                  : 'bg-white text-text-secondary border border-gray-200'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Shuffle Button */}
      <button
        onClick={doShuffle}
        disabled={names.length < groupCount || shuffling}
        className="w-full py-3 bg-gradient-to-r from-accent to-accent-light text-white font-semibold rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 active:scale-95 disabled:opacity-40 text-sm"
      >
        {shuffling
          ? '正在打乱… 🌀'
          : names.length < groupCount
            ? `至少需要 ${groupCount} 人`
            : `🎲 随机分成 ${groupCount} 组！`}
      </button>

      {/* Results */}
      {groups && (
        <div className="space-y-3 animate-pop-in">
          <p className="text-xs text-text-secondary text-center font-medium">
            分组结果出炉 🎉
          </p>
          {groups.map((group, i) => (
            <div
              key={i}
              className={`rounded-xl p-3.5 bg-gradient-to-r ${GROUP_COLORS[i]} shadow-sm`}
            >
              <p className="text-xs font-bold text-white/80 mb-2">
                {GROUP_LABELS[i]}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {group.map((name, j) => (
                  <span
                    key={j}
                    className="px-2.5 py-1 bg-white/25 backdrop-blur-sm text-white text-xs font-medium rounded-lg"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
