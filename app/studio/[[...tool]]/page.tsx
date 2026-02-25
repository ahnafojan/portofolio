/**
 * This route is responsible for the built-in authoring environment using Sanity Studio.
 * All routes under your studio path is handled by this file using Next.js' catch-all routes:
 * https://nextjs.org/docs/routing/dynamic-routes#catch-all-routes
 *
 * You can learn more about the next-sanity package here:
 * https://github.com/sanity-io/next-sanity
 */

import { NextStudio } from 'next-sanity/studio'

export const dynamic = 'force-static'

export { metadata, viewport } from 'next-sanity/studio'

export default async function StudioPage() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET

  if (!projectId || !dataset) {
    return (
      <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#080808", color: "white", padding: "24px" }}>
        <div style={{ maxWidth: "640px", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "16px", padding: "20px", background: "rgba(255,255,255,0.03)" }}>
          <h1 style={{ margin: "0 0 10px 0", fontSize: "18px" }}>Sanity Studio belum terkonfigurasi</h1>
          <p style={{ margin: 0, opacity: 0.8, lineHeight: 1.6 }}>
            Tambahkan <code>NEXT_PUBLIC_SANITY_PROJECT_ID</code> dan <code>NEXT_PUBLIC_SANITY_DATASET</code> di Vercel Project Settings - Environment Variables, lalu redeploy.
          </p>
        </div>
      </main>
    )
  }

  const { default: config } = await import('../../../sanity.config')
  return <NextStudio config={config} />
}
