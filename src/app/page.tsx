'use client'

import { useState, useEffect, useCallback } from 'react'

/* ───────── Emotion Data ───────── */
interface Emotion {
  name: string
  message: string
}

interface EmotionCategory {
  label: string
  color: string
  bgColor: string
  borderColor: string
  hoverColor: string
  emoji: string
  emotions: Emotion[]
}

const CATEGORIES: Record<string, EmotionCategory> = {
  happy: {
    label: '開心',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-300',
    hoverColor: 'hover:bg-yellow-100',
    emoji: '😊',
    emotions: [
      { name: '開心', message: '哇！現在心裡是不是像開了一朵花？記住這個感覺，它是你今天的超能力！' },
      { name: '興奮', message: '感覺全身充滿電力對吧！可以用這份力氣去做一件你最想挑戰的事嗎？' },
      { name: '幸福', message: '這種暖洋洋的感覺真好。試著抱抱身邊的人，把這份溫暖分享出去吧！' },
      { name: '害羞', message: '臉紅紅的也沒關係喔，這代表你很看重現在發生的事，是個很細心的人呢。' },
      { name: '喜歡', message: '當心裡有喜歡的東西時，眼睛會閃閃發光喔！大聲說出你為什麼喜歡它吧。' },
      { name: '好奇', message: '腦袋裡是不是有很多問號？這些問號就是通往寶藏的鑰匙，去探索吧！' },
      { name: '期待', message: '等待的過程雖然心癢癢的，但也讓成果變得更珍貴。你準備好迎接它了嗎？' },
      { name: '驕傲', message: '你做到了！給認真努力的自己一個大大的大拇指，你值得這份榮耀。' },
      { name: '得意', message: '這種「我做到了」的感覺真棒！回頭看看你克服了什麼困難，你很厲害喔。' },
      { name: '自信', message: '相信自己可以做到，這就是最強大的魔法。帶著這份勇氣繼續前進吧！' },
    ],
  },
  angry: {
    label: '生氣',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-300',
    hoverColor: 'hover:bg-red-100',
    emoji: '😤',
    emotions: [
      { name: '生氣', message: '現在心裡像是有座小火山？我們先一起深呼吸，吸氣、吐氣，讓岩漿慢慢降溫。' },
      { name: '驚嚇', message: '嚇了一大跳對吧！心跳很快是正常的，拍拍胸口跟自己說：現在安全了。' },
      { name: '慌張', message: '手忙腳亂的時候，我們先停下來一分鐘。只要找出一件現在能做的小事就好。' },
      { name: '嫉妒', message: '看到別人的好，心裡酸酸的是正常的。這代表你也想變得更好，我們一起努力。' },
      { name: '不安', message: '覺得心裡毛毛的、沒著落？找一個你信任的人握握手，感受一下對方的溫度。' },
      { name: '討厭', message: '不喜歡這個東西或這件事沒關係，你有權利表達不喜歡，我們換個方式試試。' },
      { name: '疑惑', message: '覺得事情怪怪的？這代表你在思考喔。試著把不懂的地方問出來吧。' },
      { name: '看不起', message: '覺得對方做得不夠好嗎？試著想想看，如果是你，會希望別人怎麼幫你？' },
      { name: '尷尬', message: '恨不得鑽進地洞裡？其實大家都可能會出糗，笑一笑，這會變成有趣的點心時間。' },
      { name: '生悶氣', message: '把話悶在心裡很辛苦吧？試著用畫的或是寫的，把那口氣排出來。' },
      { name: '著急', message: '時間好像快不夠了？我們先把肩膀放鬆，一件一件來，一定來得及。' },
      { name: '緊張', message: '手心出汗了嗎？這代表你很在乎這件事。試著對鏡子裡的自己點點頭。' },
      { name: '心煩', message: '腦袋像毛線球亂成一團？我們去洗個臉、喝口水，讓腦袋清爽一下。' },
    ],
  },
  sad: {
    label: '難過',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-300',
    hoverColor: 'hover:bg-blue-100',
    emoji: '😢',
    emotions: [
      { name: '難過', message: '想哭就哭出來吧，眼淚會帶走心裡的灰塵。我會在這裡陪著你。' },
      { name: '愧疚', message: '覺得自己做錯了，心裡重重的？承認錯誤需要很大的勇氣，你已經跨出第一步了。' },
      { name: '無聊', message: '覺得什麼都沒意思？這是大腦在提醒你該休息了，或是該去發掘新的冒險囉。' },
      { name: '沈悶', message: '像天氣陰陰的一樣，心裡也悶悶的。去窗邊看看天空，感受一下風的流動吧。' },
      { name: '失望', message: '事情跟想的不一樣，心裡空空的。沒關係，我們給自己一點時間難過，再重新開始。' },
      { name: '心累', message: '真的辛苦了。現在什麼都不用想，閉上眼睛休息五分鐘，幫心充個電。' },
      { name: '丟臉', message: '覺得大家都在看你？其實每個人都有失誤的時候，你已經做得很好了。' },
      { name: '挫折', message: '撞到牆壁的感覺很痛吧？休息一下，我們下次換個角度看看這道牆。' },
    ],
  },
  calm: {
    label: '放鬆',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-300',
    hoverColor: 'hover:bg-green-100',
    emoji: '😌',
    emotions: [
      { name: '放鬆', message: '感覺全身軟綿綿的，像躺在雲朵上。好好享受這份寧靜的時光。' },
      { name: '滿足', message: '心裡飽飽的感覺真好。想想看，是什麼讓你覺得這麼幸福？' },
      { name: '安心', message: '覺得很安全、很踏實。這是一個適合讀本好書、或跟家人靜靜待著的好時刻。' },
      { name: '普通', message: '平平淡淡也是一種舒服的狀態。感受一下現在的呼吸，很順暢對吧？' },
      { name: '平靜', message: '心像湖水一樣靜悄悄的。這種不被干擾的感覺，是內心最強大的力量。' },
      { name: '心疼', message: '因為愛，所以才會捨不得。這份溫柔的感覺，證明你是個內心柔軟的人。' },
    ],
  },
}

const CATEGORY_ORDER = ['happy', 'angry', 'sad', 'calm']

const CATEGORY_COLORS: Record<string, string> = {
  happy: '#f59e0b',
  angry: '#ef4444',
  sad: '#3b82f6',
  calm: '#22c55e',
}

/* ───────── Stats Types ───────── */
interface StatItem {
  emotion: string
  category: string
  count: number
}

interface DailyTrend {
  date: string
  happy: number
  angry: number
  sad: number
  calm: number
  total: number
}

interface Stats {
  today: StatItem[]
  month: StatItem[]
  dailyTrend: DailyTrend[]
  todayTotal: number
  monthTotal: number
}

/* ───────── Component ───────── */
export default function MoodPage() {
  const [selectedEmotion, setSelectedEmotion] = useState<{ name: string; category: string; message: string } | null>(null)
  const [voted, setVoted] = useState(false)
  const [votedEmotion, setVotedEmotion] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<Stats | null>(null)
  const [showStats, setShowStats] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/emotions/stats')
      if (res.ok) {
        setStats(await res.json())
      }
    } catch {
      // silent fail
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const handleVote = async () => {
    if (!selectedEmotion || voted) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/emotions/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emotion: selectedEmotion.name, category: selectedEmotion.category }),
      })

      const data = await res.json()

      if (res.status === 429) {
        setVoted(true)
        setVotedEmotion(data.votedEmotion)
        setError(data.error)
        fetchStats()
        setTimeout(() => setShowStats(true), 1500)
      } else if (!res.ok) {
        setError(data.error || '發生錯誤')
      } else {
        setVoted(true)
        setVotedEmotion(selectedEmotion.name)
        fetchStats()
        // 投票成功後 1.5 秒自動跳到統計頁
        setTimeout(() => setShowStats(true), 1500)
      }
    } catch {
      setError('網路錯誤，請稍後再試')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-800">情緒童伴圓</h1>
          <button
            onClick={() => setShowStats(!showStats)}
            className="text-sm text-orange-500 hover:text-orange-600 font-medium transition-colors"
          >
            {showStats ? '選心情' : '看統計'}
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Title */}
        <div className="text-center mb-6">
          <p className="text-gray-500 text-sm">你今天有哪些心情呢？</p>
          {voted && (
            <p className="text-orange-500 text-sm mt-1 font-medium">
              今日已記錄：{votedEmotion}
            </p>
          )}
        </div>

        {showStats ? (
          <StatsView stats={stats} />
        ) : (
          <>
            {/* Emotion Grid by Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {CATEGORY_ORDER.map((key) => {
                const cat = CATEGORIES[key]
                return (
                  <div
                    key={key}
                    className={`rounded-2xl border-2 ${cat.borderColor} ${cat.bgColor} p-4 transition-all`}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">{cat.emoji}</span>
                      <span className={`font-bold text-lg ${cat.color}`}>{cat.label}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {cat.emotions.map((emotion) => {
                        const isSelected = selectedEmotion?.name === emotion.name
                        const isVotedThis = votedEmotion === emotion.name
                        return (
                          <button
                            key={emotion.name}
                            onClick={() => {
                              if (!voted) {
                                setSelectedEmotion({
                                  name: emotion.name,
                                  category: key,
                                  message: emotion.message,
                                })
                              }
                            }}
                            disabled={voted && !isVotedThis}
                            className={`
                              px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200
                              ${isVotedThis
                                ? 'bg-orange-500 text-white shadow-md scale-105'
                                : isSelected
                                  ? 'bg-white shadow-md scale-105 ring-2 ring-orange-400 text-gray-800'
                                  : voted
                                    ? 'bg-white/60 text-gray-400 cursor-not-allowed'
                                    : `bg-white/80 text-gray-700 ${cat.hoverColor} hover:shadow-sm active:scale-95 cursor-pointer`
                              }
                            `}
                          >
                            {emotion.name}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Selected Emotion Message */}
            {selectedEmotion && (
              <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 mb-4 mood-fade-in">
                <div className="flex items-start gap-3">
                  <span className="text-3xl mt-0.5">
                    {CATEGORIES[selectedEmotion.category]?.emoji}
                  </span>
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg mb-1">
                      {selectedEmotion.name}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {selectedEmotion.message}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="text-center text-orange-600 text-sm mb-4 bg-orange-50 rounded-lg py-2">
                {error}
              </div>
            )}

            {/* Vote Button */}
            {selectedEmotion && !voted && (
              <button
                onClick={handleVote}
                disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-2xl shadow-md transition-all duration-200 disabled:opacity-50 active:scale-[0.98] mood-fade-in"
              >
                {loading ? '記錄中...' : `記錄今天的心情：${selectedEmotion.name}`}
              </button>
            )}

            {voted && !error && (
              <div className="text-center mood-fade-in">
                <div className="inline-block bg-white rounded-2xl shadow-md border border-gray-100 px-6 py-4">
                  <p className="text-2xl mb-2">✨</p>
                  <p className="text-gray-700 font-medium">已記錄！馬上帶你看大家的心情...</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}

/* ───────── Stats Sub-component ───────── */
function StatsView({ stats }: { stats: Stats | null }) {
  const [tab, setTab] = useState<'today' | 'month'>('today')

  if (!stats) {
    return (
      <div className="text-center py-12 text-gray-400">載入統計中...</div>
    )
  }

  const data = tab === 'today' ? stats.today : stats.month
  const total = tab === 'today' ? stats.todayTotal : stats.monthTotal
  const maxCount = data.length > 0 ? data[0].count : 1

  return (
    <div className="mood-fade-in">
      {/* Tab Switcher */}
      <div className="flex justify-center gap-2 mb-6">
        <button
          onClick={() => setTab('today')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            tab === 'today'
              ? 'bg-orange-500 text-white shadow-md'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          今日心情
        </button>
        <button
          onClick={() => setTab('month')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            tab === 'month'
              ? 'bg-orange-500 text-white shadow-md'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          近 30 天
        </button>
      </div>

      {/* Total Count */}
      <div className="text-center mb-6">
        <span className="text-4xl font-bold text-gray-800">{total}</span>
        <span className="text-gray-500 ml-2 text-sm">
          {tab === 'today' ? '人今天分享了心情' : '人在近 30 天分享了心情'}
        </span>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-4xl mb-3">🌱</p>
          <p className="text-gray-400">還沒有人分享心情，成為第一個吧！</p>
        </div>
      ) : (
        <>
          {/* Bar Chart - Emotion Ranking */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
            <h3 className="text-sm font-semibold text-gray-500 mb-4">
              {tab === 'today' ? '今日心情排行' : '近 30 天心情排行'}
            </h3>
            <div className="space-y-3">
              {data.slice(0, 15).map((item, i) => {
                const pct = Math.round((item.count / maxCount) * 100)
                const catColor = CATEGORY_COLORS[item.category] || '#f97316'
                return (
                  <div key={item.emotion} className="mood-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          {CATEGORIES[item.category]?.emoji || '😶'}
                        </span>
                        <span className="text-sm font-medium text-gray-700">
                          {item.emotion}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {item.count} 票
                        {total > 0 && (
                          <span className="ml-1">({Math.round((item.count / total) * 100)}%)</span>
                        )}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: catColor,
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Category Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {CATEGORY_ORDER.map((key) => {
              const cat = CATEGORIES[key]
              const catTotal = data
                .filter((d) => d.category === key)
                .reduce((sum, d) => sum + d.count, 0)
              const catPct = total > 0 ? Math.round((catTotal / total) * 100) : 0
              return (
                <div
                  key={key}
                  className={`${cat.bgColor} rounded-xl p-3 text-center border ${cat.borderColor}`}
                >
                  <div className="text-xl mb-1">{cat.emoji}</div>
                  <div className={`text-xs font-medium ${cat.color}`}>{cat.label}</div>
                  <div className="text-lg font-bold text-gray-800">{catPct}%</div>
                  <div className="text-xs text-gray-400">{catTotal} 票</div>
                </div>
              )
            })}
          </div>

          {/* 30-Day Daily Trend Chart */}
          {stats.dailyTrend.length > 0 && (
            <DailyTrendChart data={stats.dailyTrend} />
          )}
        </>
      )}
    </div>
  )
}

/* ───────── Daily Trend Chart ───────── */
function DailyTrendChart({ data }: { data: DailyTrend[] }) {
  const maxTotal = Math.max(...data.map((d) => d.total), 1)

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mood-fade-in">
      <h3 className="text-sm font-semibold text-gray-500 mb-4">近 30 天每日心情趨勢</h3>

      {/* Legend */}
      <div className="flex justify-center gap-4 mb-4 text-xs">
        {CATEGORY_ORDER.map((key) => (
          <div key={key} className="flex items-center gap-1">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: CATEGORY_COLORS[key] }}
            />
            <span className="text-gray-500">{CATEGORIES[key].label}</span>
          </div>
        ))}
      </div>

      {/* Stacked Bar Chart */}
      <div className="flex items-end gap-[2px] h-40 overflow-x-auto">
        {data.map((day) => {
          const dayDate = new Date(day.date)
          const isToday = day.date === new Date().toISOString().split('T')[0]
          const dayLabel = `${dayDate.getMonth() + 1}/${dayDate.getDate()}`
          const heightPct = day.total > 0 ? (day.total / maxTotal) * 100 : 0

          return (
            <div
              key={day.date}
              className="flex-1 min-w-[8px] flex flex-col items-center group relative"
            >
              {/* Tooltip */}
              <div className="absolute bottom-full mb-1 hidden group-hover:block z-10">
                <div className="bg-gray-800 text-white text-xs rounded-lg px-2 py-1.5 whitespace-nowrap shadow-lg">
                  <div className="font-medium mb-0.5">{dayLabel} ({day.total} 人)</div>
                  {CATEGORY_ORDER.map((cat) => {
                    const val = day[cat as keyof DailyTrend] as number
                    return val > 0 ? (
                      <div key={cat} className="flex items-center gap-1">
                        <div
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: CATEGORY_COLORS[cat] }}
                        />
                        {CATEGORIES[cat].label}: {val}
                      </div>
                    ) : null
                  })}
                </div>
              </div>

              {/* Stacked bars */}
              <div
                className="w-full flex flex-col-reverse rounded-t overflow-hidden"
                style={{ height: `${heightPct}%`, minHeight: day.total > 0 ? '2px' : '0' }}
              >
                {CATEGORY_ORDER.map((cat) => {
                  const val = day[cat as keyof DailyTrend] as number
                  if (val === 0 || day.total === 0) return null
                  const segPct = (val / day.total) * 100
                  return (
                    <div
                      key={cat}
                      style={{
                        height: `${segPct}%`,
                        backgroundColor: CATEGORY_COLORS[cat],
                        minHeight: '1px',
                      }}
                    />
                  )
                })}
              </div>

              {/* Date label (show every 5th day + today) */}
              {(data.indexOf(day) % 5 === 0 || isToday) && (
                <div className={`text-[9px] mt-1 ${isToday ? 'text-orange-500 font-bold' : 'text-gray-300'}`}>
                  {dayLabel}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Summary line */}
      <div className="mt-3 pt-3 border-t border-gray-50 text-center text-xs text-gray-400">
        過去 30 天共 {data.reduce((s, d) => s + d.total, 0)} 人分享了心情
      </div>
    </div>
  )
}
