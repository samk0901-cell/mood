import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)

    const [todayVotes, allTimeVotes, todayTotal, allTimeTotal] = await Promise.all([
      prisma.emotionVote.groupBy({
        by: ['emotion', 'category'],
        where: { createdAt: { gte: startOfDay, lt: endOfDay } },
        _count: { emotion: true },
      }),
      prisma.emotionVote.groupBy({
        by: ['emotion', 'category'],
        _count: { emotion: true },
      }),
      prisma.emotionVote.count({
        where: { createdAt: { gte: startOfDay, lt: endOfDay } },
      }),
      prisma.emotionVote.count(),
    ])

    return NextResponse.json({
      today: todayVotes
        .map((v) => ({ emotion: v.emotion, category: v.category, count: v._count.emotion }))
        .sort((a, b) => b.count - a.count),
      allTime: allTimeVotes
        .map((v) => ({ emotion: v.emotion, category: v.category, count: v._count.emotion }))
        .sort((a, b) => b.count - a.count),
      todayTotal,
      allTimeTotal,
    })
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json({ error: '載入統計資料時發生錯誤' }, { status: 500 })
  }
}
