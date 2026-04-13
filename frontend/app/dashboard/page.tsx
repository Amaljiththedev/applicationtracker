"use client"
import { supabase } from "@/lib/supabaseClient"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import ApplicationTrackerLive from "@/components/applicationtracker-live"

export default function DashboardPage() {
  const [ready, setReady] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function validateSession() {
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        router.replace("/")
        return
      }
      setReady(true)
    }

    validateSession()
  }, [router])

  if (!ready) {
    return <div className="dark min-h-screen bg-zinc-950 text-zinc-200 flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="dark min-h-screen bg-zinc-950">
        <ApplicationTrackerLive />
    </div>
  )
}