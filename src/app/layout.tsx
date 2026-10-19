import type { Metadata } from "next"
import { Cairo } from "next/font/google"

import { AppProviders } from "@/components/providers/app-providers"
import "./globals.css"

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    template: "%s | لوحة تحكم القطيف اليوم",
    default: "لوحة تحكم جريدة القطيف اليوم الاخبارية",
  },
  robots: { index: false, follow: false },
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} h-full`}>
      <body className="min-h-full">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}
