import { NextResponse } from 'next/server'
import { Pool } from 'pg'

function getPool() {
  const connectionString =
    process.env.POSTGRES_URL ??
    process.env.DATABASE_URL ??
    'postgresql://localhost:5432/mood'
  return new Pool({ connectionString, max: 5 })
}

export async function GET() {
  const pool = getPool()
  try {
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)
    const thirtyDaysAgo = new Date(startOfDay.getTime() - 30 * 24 * 60 * 60 * 1000)

    const [todayRes, monthRes, dailyRes, todayTotalRes, monthTotalRes] = await Promise.all([
      // 今日各情緒票數
      pool.query(
        `SELECT emotion, category, COUNT(*)::int AS count
         FROM "EmotionVote"
         WHERE "createdAt" >= $1 AND "createdAt" < $2
         GROUP BY emotion, category
         ORDER BY count DESC`,
        [startOfDay, endOfDay]
      ),
      // 過去30天各情緒票數
      pool.query(
        `SELECT emotion, category, COUNT(*)::int AS count
         FROM "EmotionVote"
         WHERE "createdAt" >= $1
         GROUP BY emotion, category
         ORDER BY count DESC`,
        [thirtyDaysAgo]
      ),
      // 過去30天每日分類趨勢
      pool.query(
        `SELECT
           "createdAt"::date AS date,
           category,
           COUNT(*)::int AS count
         FROM "EmotionVote"
         WHERE "createdAt" >= $1
         GROUP BY "createdAt"::date, category
         ORDER BY date ASC, category`,
        [thirtyDaysAgo]
      ),
      // 今日總票數
      pool.query(
        `SELECT COUNT(*)::int AS total
         FROM "EmotionVote"
         WHERE "createdAt" >= $1 AND "createdAt" < $2`,
        [startOfDay, endOfDay]
      ),
      // 過去30天總票數
      pool.query(
        `SELECT COUNT(*)::int AS total
         FROM "EmotionVote"
         WHERE "createdAt" >= $1`,
        [thirtyDaysAgo]
      ),
    ])

    // 組裝每日趨勢資料（補齊沒有資料的天）
    const dailyMap: Record<string, Record<string, number>> = {}
    for (let d = new Date(thirtyDaysAgo); d <= startOfDay; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().split('T')[0]
      dailyMap[key] = { happy: 0, angry: 0, sad: 0, calm: 0 }
    }
    for (const row of dailyRes.rows) {
      const key = new Date(row.date).toISOString().split('T')[0]
      if (dailyMap[key]) {
        dailyMap[key][row.category] = row.count
      }
    }
    const dailyTrend = Object.entries(dailyMap).map(([date, cats]) => ({
      date,
      ...cats,
      total: Object.values(cats).reduce((s, n) => s + n, 0),
    }))

    return NextResponse.json({
      today: todayRes.rows,
      month: monthRes.rows,
      dailyTrend,
      todayTotal: todayTotalRes.rows[0]?.total ?? 0,
      monthTotal: monthTotalRes.rows[0]?.total ?? 0,
    })
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json({ error: '載入統計資料時發生錯誤' }, { status: 500 })
  } finally {
    await pool.end()
  }
}
