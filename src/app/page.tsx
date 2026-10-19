import { redirect } from "next/navigation"

// The admin guard (Task 03) sends signed-out visitors on to /login.
export default function Home() {
  redirect("/dashboard")
}
