import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { emotion, category } = await req.json()

    if (!emotion || !category) {
      return NextResponse.json({ error: '缺少必要欄位' }, { status: 400 })
    }

    let visitorId = req.cookies.get('mood_visitor_id')?.value
    if (!visitorId) {
      visitorId = crypto.randomUUID()
    }

    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)

    const existingVote = await prisma.emotionVote.findFirst({
      where: {
        visitorId,
        createdAt: { gte: startOfDay, lt: endOfDay },
      },
    })

    if (existingVote) {
      return NextResponse.json(
        { error: '今天已經記錄過心情囉！明天再來吧', votedEmotion: existingVote.emotion },
        { status: 429 }
      )
    }

    await prisma.emotionVote.create({
      data: { emotion, category, visitorId },
    })

    const response = NextResponse.json({ success: true, emotion })
    response.cookies.set('mood_visitor_id', visitorId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 365 * 24 * 60 * 60,
      sameSite: 'lax',
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Vote error:', error)
    return NextResponse.json({ error: '記錄心情時發生錯誤' }, { status: 500 })
  }
}
