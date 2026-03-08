import { useState, useCallback, useRef } from 'react'
import { haptic } from '../../utils/haptic'

const TRUTHS = {
  easy: [
    '你手机里最近删除的一张照片是什么内容？',
    '你觉得在座谁的颜值最高？',
    '你手机屏幕使用时间最长的 App 是？',
    '你最近一次发朋友圈是什么内容？',
    '你的微信/QQ 置顶了几个人？',
    '你用过最久的头像是什么？',
    '你最常用的 3 个表情包是哪些？',
    '你最近一次网购买了什么？',
    '你手机闹钟设了几个？最早几点？',
    '你上次真心夸一个人是夸的谁？',
    '你昨晚几点睡的？在干嘛？',
    '你最近循环播放的一首歌是？',
  ],
  medium: [
    '你最近偷偷关注了谁的社交媒体？',
    '你觉得在座谁最可能成为你的恋人？',
    '你做过最疯狂的事是什么？',
    '你谈过几次恋爱？',
    '你最近一次哭是因为什么？',
    '你最想删掉手机里的哪个聊天记录？',
    '你对在座某人的第一印象是什么？（指定一人）',
    '你撒过最离谱的一个谎是什么？',
    '你觉得自己最大的缺点是什么？',
    '你做过最后悔的一件事是什么？',
    '你最想和在座的谁交换人生一天？',
    '你有没有偷偷屏蔽过在座某人的朋友圈？',
  ],
  hard: [
    '打开你和最近聊天的人的对话给大家看 10 秒',
    '展示你手机最近三条通话记录',
    '说出你暗恋过的人的名字首字母',
    '让在座一个人翻你 10 秒手机相册',
    '说出你对右边那个人最真实的评价',
    '打开你的外卖/网购订单给大家看',
    '展示你小红书/抖音的浏览记录 10 秒',
    '说出你最近一次心动是因为谁',
    '读出你最近收到的最后一条消息',
    '公开你的手机屏幕使用时间报告',
    '展示你最近保存的 5 张图片',
    '说出你微信里备注最特别的一个人是谁',
  ],
}

const DARES = {
  easy: [
    '学你最拿手的一个动物叫',
    '用屁股写出你的名字',
    '对着手机前置做 5 个自拍表情',
    '模仿在座一个人的标志性动作',
    '给大家表演 15 秒即兴舞蹈',
    '用最嗲的声音说"我好想你"',
    '单脚站立坚持 30 秒',
    '模仿一个明星说"大家好"',
    '给在座每个人说一句真心夸赞',
    '做 10 个深蹲',
    '用方言说一句"我是全场最靓的仔"',
    '闭眼转三圈然后走直线',
  ],
  medium: [
    '给通讯录里第 3 个人发"在干嘛呀"',
    '用歌词和右边的人对话 1 分钟',
    '打电话给一个朋友用撒娇语气说话 30 秒',
    '模仿在座某人发朋友圈的风格发一条到群里',
    '对着前置摄像头做最丑鬼脸然后截图',
    '用 RAP 的方式做一段自我介绍',
    '闭眼从手机里随机选一首歌唱 30 秒',
    '模仿一段经典电影台词',
    '和左边的人拍一张搞怪合照',
    '打一个 10 秒电话给最近联系人说"你猜我是谁"',
    '模仿你妈/你爸叫你吃饭的样子',
    '用婴儿的方式喝完一杯水',
  ],
  hard: [
    '发一条朋友圈"今晚好想谈恋爱"保留到明天',
    '给最近聊天的异性发"今晚月色真美"',
    '让在座所有人给你颜值打分 1-10',
    '用 RAP 方式介绍在座每一个人',
    '拨打最近通话第一个人说"我好想你啊"',
    '允许在座一人用你的手机发一条朋友圈',
    '把头像换成在座某人指定的照片保留一天',
    '录一段 15 秒的"深情告白"视频发到群里',
    '以最骚的姿势走一段猫步',
    '连续对 3 个在座的人做心动告白表情',
    '让在座的人集体给你录一段搞怪视频',
    '用 5 种不同的语气说"我爱你"',
  ],
}

const LEVELS = [
  { id: 'easy', label: '破冰暖场', emoji: '🟢', color: 'from-green-400 to-emerald-400' },
  { id: 'medium', label: '有点刺激', emoji: '🟡', color: 'from-yellow-400 to-orange-400' },
  { id: 'hard', label: '社死现场', emoji: '🔴', color: 'from-red-400 to-pink-500' },
]

export default function TruthOrDare() {
  const [level, setLevel] = useState('easy')
  const [result, setResult] = useState(null)
  const [type, setType] = useState(null)
  const [revealing, setRevealing] = useState(false)
  const usedRef = useRef({ truth: new Set(), dare: new Set() })

  const pickQuestion = useCallback(
    (mode) => {
      const pickMode = mode === 'random' ? (Math.random() > 0.5 ? 'truth' : 'dare') : mode
      const pool = pickMode === 'truth' ? TRUTHS[level] : DARES[level]
      const used = usedRef.current[pickMode]

      let available = pool.filter((_, i) => !used.has(`${level}-${i}`))
      if (available.length === 0) {
        used.clear()
        available = pool
      }

      const picked = available[Math.floor(Math.random() * available.length)]
      const idx = pool.indexOf(picked)
      used.add(`${level}-${idx}`)

      haptic('flip')
      setRevealing(true)
      setType(pickMode)

      setTimeout(() => {
        setResult(picked)
        setRevealing(false)
        haptic('success')
      }, 400)
    },
    [level]
  )

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Level Tabs */}
      <div className="flex gap-2 w-full">
        {LEVELS.map((lv) => (
          <button
            key={lv.id}
            onClick={() => { setLevel(lv.id); haptic('light') }}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all duration-300 ${
              level === lv.id
                ? `bg-gradient-to-r ${lv.color} text-white shadow-md`
                : 'bg-gray-100 text-text-secondary'
            }`}
          >
            {lv.emoji} {lv.label}
          </button>
        ))}
      </div>

      {/* Card Display */}
      <div
        className={`w-full min-h-[180px] rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all duration-400 ${
          revealing
            ? 'scale-95 opacity-50'
            : result
              ? 'scale-100 opacity-100'
              : ''
        } ${
          type === 'truth'
            ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200'
            : type === 'dare'
              ? 'bg-gradient-to-br from-pink-50 to-red-50 border-2 border-pink-200'
              : 'bg-gradient-to-br from-gray-50 to-purple-50 border-2 border-purple-100'
        }`}
      >
        {result && !revealing ? (
          <div className="animate-pop-in space-y-3">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r shadow-sm
              ${type === 'truth' ? 'from-blue-400 to-indigo-400' : 'from-pink-400 to-red-400'}">
              {type === 'truth' ? '💬 真心话' : '🎯 大冒险'}
            </span>
            <p className="text-base font-medium text-text leading-relaxed">
              {result}
            </p>
          </div>
        ) : (
          <div className="space-y-2 opacity-40">
            <span className="text-4xl">🎴</span>
            <p className="text-sm text-text-secondary">选择真心话或大冒险</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 w-full">
        <button
          onClick={() => pickQuestion('truth')}
          disabled={revealing}
          className="flex-1 py-3 bg-gradient-to-r from-blue-400 to-indigo-400 text-white font-semibold rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 active:scale-95 disabled:opacity-50 text-sm"
        >
          💬 真心话
        </button>
        <button
          onClick={() => pickQuestion('random')}
          disabled={revealing}
          className="py-3 px-4 bg-gradient-to-r from-primary to-primary-light text-white font-semibold rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 active:scale-95 disabled:opacity-50 text-sm"
        >
          🎲
        </button>
        <button
          onClick={() => pickQuestion('dare')}
          disabled={revealing}
          className="flex-1 py-3 bg-gradient-to-r from-pink-400 to-red-400 text-white font-semibold rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 active:scale-95 disabled:opacity-50 text-sm"
        >
          🎯 大冒险
        </button>
      </div>
    </div>
  )
}
