import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { FunnelClient } from "./funnel-client"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: videos } = await supabase.from("funnel_videos").select("step, language, video_url")

  const videosByStepLang = videos?.reduce(
    (acc, video) => {
      acc[`${video.step}-${video.language}`] = video.video_url
      return acc
    },
    {} as Record<string, string>,
  )

  return <FunnelClient serverVideos={videosByStepLang || {}} />
}
