/** Raw `GET /admin/settings/adminHome`. Source: rules/api-samples/dashboard-admin-home.json. */
type NumberLike = string | number

export type AdminHomeDto = {
  status: "success"
  todaySummary: {
    todayNews: NumberLike
    todayViews: NumberLike
    /** Spelled this way by the API. */
    todayVistores: NumberLike
  }
  topCategories: { title: string; totalViews: NumberLike }[]
  /** No id or type — the posts cannot be linked. */
  topPosts: { title: string; categoryTitle: string; views: NumberLike }[]
  /** `[{ totalViews: "0", dayname: "" }]` when there is no data. ⚠ TBD dayname format. */
  topWeekDays: { dayname: string; totalViews: NumberLike }[]
  /** `[{ totalViews: "0", openDate: "" }]` when there is no data. ⚠ TBD openDate format. */
  monthDays: { openDate: string; totalViews: NumberLike }[]
}
