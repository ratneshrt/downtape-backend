import { spawn } from "child_process"

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*", // allow all origins (ok for personal project)
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  }
}

const server = Bun.serve({
  port: process.env.PORT || 3000,
  async fetch(req) {
    const urlPath = new URL(req.url).pathname

    // Handle preflight CORS (OPTIONS)
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(),
      })
    }

    if (req.method === "POST" && urlPath === "/download") {
      try {
        const body = await req.json()
        const url = body?.url
        if (!url) {
          return new Response(JSON.stringify({ error: "Missing URL" }), {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders() },
          })
        }

        const args = ["-f", "best", "-o", "-", url]
        const yt = spawn("yt-dlp", args, { stdio: ["ignore", "pipe", "inherit"] })

        return new Response(yt.stdout as any, {
          headers: {
            "Content-Disposition": 'attachment; filename="video.mp4"',
            "Content-Type": "video/mp4",
            ...corsHeaders(),
          },
        })
      } catch (err) {
        console.error("Internal error:", err)
        return new Response(JSON.stringify({ error: "Internal Server Error" }), {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders() },
        })
      }
    }

    return new Response("Not found", {
      status: 404,
      headers: corsHeaders(),
    })
  },
})

console.log(`Server running on port ${server.port}`)
