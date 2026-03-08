import { useState, useCallback } from 'react'
import { haptic } from '../../utils/haptic'
import { X, Plus, Ban } from 'lucide-react'

const GROUP_COLORS = [
  'from-violet-400 to-purple-500',
  'from-pink-400 to-rose-500',
  'from-blue-400 to-indigo-500',
  'from-emerald-400 to-green-500',
  'from-amber-400 to-orange-500',
  'from-cyan-400 to-teal-500',
  'from-red-400 to-pink-500',
  'from-indigo-400 to-violet-500',
  'from-fuchsia-400 to-purple-500',
  'from-teal-400 to-green-500',
]

const GROUP_LABELS = ['A 组', 'B 组', 'C 组', 'D 组', 'E 组', 'F 组', 'G 组', 'H 组', 'I 组', 'J 组']

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function shuffleWithConstraints(names, groupCount, exclusions, maxRetries = 500) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const shuffled = shuffle(names)
    const groups = Array.from({ length: groupCount }, () => [])
    shuffled.forEach((name, i) => groups[i % groupCount].push(name))

    let valid = true
    for (const { a, b } of exclusions) {
      const gA = groups.findIndex(g => g.includes(a))
      const gB = groups.findIndex(g => g.includes(b))
      if (gA !== -1 && gB !== -1 && gA === gB) {
        valid = false
        break
      }
    }
    if (valid) return groups
  }
  return null
}

export default function RandomGroups() {
  const [inputValue, setInputValue] = useState('')
  const [names, setNames] = useState([])
  const [groupCount, setGroupCount] = useState(2)
  const [groupInput, setGroupInput] = useState('2')
  const [groups, setGroups] = useState(null)
  const [shuffling, setShuffling] = useState(false)
  const [error, setError] = useState('')

  const [exclusions, setExclusions] = useState([])
  const [exA, setExA] = useState('')
  const [exB, setExB] = useState('')

  const addName = useCallback(() => {
    const trimmed = inputValue.trim()
    if (!trimmed) return
    const newNames = trimmed
      .split(/[,，、\s\n]+/)
      .map(n => n.trim())
      .filter(n => n.length > 0)
    setNames(prev => [...prev, ...newNames])
    setInputValue('')
    setGroups(null)
    setError('')
    haptic('light')
  }, [inputValue])

  const removeName = useCallback((index) => {
    const removed = names[index]
    setNames(prev => prev.filter((_, i) => i !== index))
    setExclusions(prev => prev.filter(e => e.a !== removed && e.b !== removed))
    setGroups(null)
    setError('')
  }, [names])

  const updateGroupCount = useCallback((val) => {
    const num = parseInt(val, 10)
    if (isNaN(num) || num < 2) {
      setGroupCount(2)
      setGroupInput('2')
    } else {
      const clamped = Math.min(num, 10)
      setGroupCount(clamped)
      setGroupInput(String(clamped))
    }
    setGroups(null)
    setError('')
  }, [])

  const handleGroupInputChange = useCallback((val) => {
    setGroupInput(val)
    const num = parseInt(val, 10)
    if (!isNaN(num) && num >= 2 && num <= 10) {
      setGroupCount(num)
      setGroups(null)
      setError('')
    }
  }, [])

  const addExclusion = useCallback(() => {
    if (!exA || !exB || exA === exB) return
    const exists = exclusions.some(
      e => (e.a === exA && e.b === exB) || (e.a === exB && e.b === exA)
    )
    if (exists) return
    setExclusions(prev => [...prev, { a: exA, b: exB }])
    setExA('')
    setExB('')
    setGroups(null)
    setError('')
    haptic('light')
  }, [exA, exB, exclusions])

  const removeExclusion = useCallback((idx) => {
    setExclusions(prev => prev.filter((_, i) => i !== idx))
    setGroups(null)
    setError('')
  }, [])

  const doShuffle = useCallback(() => {
    if (names.length < groupCount) return
    haptic('spin')
    setShuffling(true)
    setGroups(null)
    setError('')

    setTimeout(() => {
      const validExclusions = exclusions.filter(
        e => names.includes(e.a) && names.includes(e.b)
      )
      const result = shuffleWithConstraints(names, groupCount, validExclusions)
      if (result) {
        setGroups(result)
        setError('')
        haptic('success')
      } else {
        setError('⚠️ 无法满足所有互斥条件，请减少约束或增加组数')
        haptic('heavy')
      }
      setShuffling(false)
    }, 600)
  }, [names, groupCount, exclusions])

  const canAddExclusion = exA && exB && exA !== exB

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Name Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addName()}
          placeholder="输入名字，回车添加（逗号/空格可批量）"
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

      {/* Group Count - Input + Stepper */}
      <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
        <span className="text-sm text-text font-medium">分成几组</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => updateGroupCount(groupCount - 1)}
            disabled={groupCount <= 2}
            className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-text font-bold text-base active:scale-90 transition-transform shadow-sm disabled:opacity-30 disabled:active:scale-100"
          >−</button>
          <input
            type="text"
            inputMode="numeric"
            value={groupInput}
            onChange={e => handleGroupInputChange(e.target.value)}
            onBlur={() => updateGroupCount(groupInput)}
            className="w-10 h-8 rounded-lg border border-gray-200 bg-white text-center text-sm font-bold text-primary outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/10"
          />
          <button
            onClick={() => updateGroupCount(groupCount + 1)}
            disabled={groupCount >= 10}
            className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-text font-bold text-base active:scale-90 transition-transform shadow-sm disabled:opacity-30 disabled:active:scale-100"
          >+</button>
        </div>
      </div>

      {/* Exclusion Constraints */}
      {names.length >= 2 && (
        <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-3 border border-red-100/60 space-y-2.5">
          <p className="text-xs font-bold text-text flex items-center gap-1">
            <Ban size={13} className="text-red-400" /> 互斥规则（不能同组）
          </p>

          <div className="flex gap-1.5 items-center">
            <select
              value={exA}
              onChange={e => setExA(e.target.value)}
              className="flex-1 px-2 py-2 rounded-lg border border-red-100 bg-white text-xs text-text outline-none focus:border-red-300 appearance-none truncate"
            >
              <option value="">选择玩家A</option>
              {names.filter(n => n !== exB).map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            <span className="text-[10px] text-red-400 font-bold flex-shrink-0">≠</span>
            <select
              value={exB}
              onChange={e => setExB(e.target.value)}
              className="flex-1 px-2 py-2 rounded-lg border border-red-100 bg-white text-xs text-text outline-none focus:border-red-300 appearance-none truncate"
            >
              <option value="">选择玩家B</option>
              {names.filter(n => n !== exA).map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            <button
              onClick={addExclusion}
              disabled={!canAddExclusion}
              className="flex-shrink-0 p-2 rounded-lg bg-red-400 text-white active:scale-90 transition-all disabled:opacity-30 disabled:active:scale-100"
            >
              <Plus size={14} />
            </button>
          </div>

          {exclusions.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {exclusions.map((ex, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-700 text-[11px] font-semibold rounded-full"
                >
                  {ex.a} ≠ {ex.b}
                  <button
                    onClick={() => removeExclusion(i)}
                    className="hover:bg-red-200 rounded-full p-0.5 transition-colors"
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Error message */}
      {error && (
        <p className="text-xs text-red-500 font-semibold text-center animate-pop-in">{error}</p>
      )}

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
              className={`rounded-xl p-3.5 bg-gradient-to-r ${GROUP_COLORS[i % GROUP_COLORS.length]} shadow-sm`}
            >
              <p className="text-xs font-bold text-white/80 mb-2">
                {i < GROUP_LABELS.length ? GROUP_LABELS[i] : `${i + 1} 组`}
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
