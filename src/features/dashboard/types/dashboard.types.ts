export type ChartPoint = {
  label: string
  views: number
}

export type TopPost = {
  title: string
  category: string
  views: number
}

export type Dashboard = {
  today: {
    news: number
    views: number
    visitors: number
  }
  /** Most-read categories this week, most-read first; zero-view categories removed. */
  topCategories: ChartPoint[]
  /** Most-visited weekdays this week. Empty when the API has no data. */
  weekDays: ChartPoint[]
  /** Top 10 days by visits this month. Empty when the API has no data. */
  monthDays: ChartPoint[]
  /** Top 10 posts by reads this week. */
  topPosts: TopPost[]
}
