import { NextResponse } from 'next/server'
import { parseCourses } from '@/lib/parseCourses'
import { parseSheet } from '@/lib/parseSheet'

export const revalidate = 900 // Vercel ISR: re-fetch every 15 minutes

export async function GET() {
  const scheduleUrl = process.env.GOOGLE_SHEET_SCHEDULE_URL
  const coursesUrl = process.env.GOOGLE_SHEET_COURSES_URL

  if (!scheduleUrl || !coursesUrl) {
    return NextResponse.json({ error: 'Sheet URLs not configured' }, { status: 500 })
  }

  try {
    const [scheduleRes, coursesRes] = await Promise.all([
      fetch(scheduleUrl, { next: { revalidate: 900 } }),
      fetch(coursesUrl, { next: { revalidate: 900 } }),
    ])

    if (!scheduleRes.ok || !coursesRes.ok) {
      throw new Error('Failed to fetch Google Sheet')
    }

    const [scheduleCsv, coursesCsv] = await Promise.all([
      scheduleRes.text(),
      coursesRes.text(),
    ])

    const courseMap = parseCourses(coursesCsv)
    const classes = parseSheet(scheduleCsv, courseMap)

    return NextResponse.json(
      { classes },
      { headers: { 'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=60' } },
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
