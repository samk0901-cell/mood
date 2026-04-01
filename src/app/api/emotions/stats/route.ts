import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)
    const thirtyDaysAgo = new Date(startOfDay.getTime() - 30 * 24 * 60 * 60 * 1000)

    const [todayVotes, monthVotes, allVotes30, todayTotal, monthTotal] = await Promise.all([
      // 今日各情緒票數
      prisma.emotionVote.groupBy({
        by: ['emotion', 'category'],
        where: { createdAt: { gte: startOfDay, lt: endOfDay } },
        _count: { emotion: true },
        orderBy: { _count: { emotion: 'desc' } },
      }),
      // 過去30天各情緒票數
      prisma.emotionVote.groupBy({
        by: ['emotion', 'category'],
        where: { createdAt: { gte: thirtyDaysAgo } },
        _count: { emotion: true },
        orderBy: { _count: { emotion: 'desc' } },
      }),
      // 過去30天所有投票（用來算每日趨勢）
      prisma.emotionVote.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: { category: true, createdAt: true },
      }),
      prisma.emotionVote.count({
        where: { createdAt: { gte: startOfDay, lt: endOfDay } },
      }),
      prisma.emotionVote.count({
        where: { createdAt: { gte: thirtyDaysAgo } },
      }),
    ])

    // 組裝每日趨勢資料（補齊沒有資料的天）
    const dailyMap: Record<string, Record<string, number>> = {}
    for (let d = new Date(thirtyDaysAgo); d <= startOfDay; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().split('T')[0]
      dailyMap[key] = { happy: 0, angry: 0, sad: 0, calm: 0 }
    }
    for (const vote of allVotes30) {
      const key = vote.createdAt.toISOString().split('T')[0]
      if (dailyMap[key] && dailyMap[key][vote.category] !== undefined) {
        dailyMap[key][vote.category]++
      }
    }
    const dailyTrend = Object.entries(dailyMap).map(([date, cats]) => ({
      date,
      ...cats,
      total: Object.values(cats).reduce((s, n) => s + n, 0),
    }))

    return NextResponse.json({
      today: todayVotes.map((v) => ({
        emotion: v.emotion,
        category: v.category,
        count: v._count.emotion,
      })),
      month: monthVotes.map((v) => ({
        emotion: v.emotion,
        category: v.category,
        count: v._count.emotion,
      })),
      dailyTrend,
      todayTotal,
      monthTotal,
    })
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json({ error: '載入統計資料時發生錯誤' }, { status: 500 })
  }
}
