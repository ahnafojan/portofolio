import Link from "next/link";
import { client } from "@/lib/sanity";
import { allProjectsQuery } from "@/lib/queries";
import { Project } from "@/lib/types";
import ProjectCard from "@/components/ui/ProjectCard";

export const revalidate = 60;

export const metadata = {
  title: "Projects",
  description: "A collection of my projects and work.",
};

export default async function ProjectsPage() {
  const projects = await client.fetch<Project[]>(allProjectsQuery);
  const totalProjects = projects?.length ?? 0;
  const featuredProjects = projects?.filter((project) => project.featured).length ?? 0;
  const projectsWithDemo = projects?.filter((project) => Boolean(project.demoUrl)).length ?? 0;
  const projectsWithRepo = projects?.filter((project) => Boolean(project.repoUrl)).length ?? 0;

  return (
    <main
      className="relative min-h-screen overflow-hidden text-white"
      style={{ background: "linear-gradient(180deg,#08080f 0%,#0a0a14 55%,#09090f 100%)" }}
    >
      <style>{`
        @keyframes projectScanline {
          from { transform: translateY(-100%); }
          to { transform: translateY(100vh); }
        }
        @keyframes projectReveal {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(100% 80% at 10% 0%, rgba(124,58,237,0.2) 0%, transparent 58%), radial-gradient(80% 70% at 90% 20%, rgba(99,102,241,0.14) 0%, transparent 60%), radial-gradient(80% 70% at 50% 100%, rgba(124,58,237,0.12) 0%, transparent 60%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)",
            backgroundSize: "68px 68px",
          }}
        />
        <div
          className="absolute left-0 right-0 top-0 h-px"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(124,58,237,0.3), transparent)",
            animation: "projectScanline 7s linear infinite",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.035] mix-blend-screen"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 300 300' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.78' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
          }}
        />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 lg:px-8 pt-12 lg:pt-16 pb-8 lg:pb-10">
        <header
          className="relative overflow-hidden rounded-3xl border p-7 lg:p-10"
          style={{
            borderColor: "rgba(255,255,255,0.08)",
            background: "linear-gradient(160deg,rgba(255,255,255,0.035) 0%,rgba(255,255,255,0.02) 100%)",
            backdropFilter: "blur(16px)",
            boxShadow: "0 24px 70px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.08)",
          }}
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/70 to-transparent" />
          <div
            className="pointer-events-none absolute -top-16 -right-10 h-44 w-44 rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(124,58,237,0.28) 0%, transparent 70%)",
              filter: "blur(20px)",
            }}
          />

          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-mono uppercase tracking-[0.12em] transition-all duration-300 hover:text-violet-200"
            style={{
              color: "#9ca3af",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <span className="text-violet-400">&lt;</span>
            Back home
          </Link>

          <p className="mb-3 text-xs font-mono uppercase tracking-[0.3em] text-violet-400">Work</p>
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
            All Projects
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-zinc-400">
            Kumpulan project yang pernah saya kerjakan, dengan fokus pada pengalaman pengguna, performa, dan kualitas implementasi.
          </p>

          <div className="mt-7 flex flex-wrap gap-2.5">
            {[
              `${totalProjects} total`,
              `${featuredProjects} featured`,
              `${projectsWithDemo} with demo`,
              `${projectsWithRepo} with repo`,
            ].map((item) => (
              <span
                key={item}
                className="rounded-full px-3 py-1.5 text-[11px] font-mono uppercase tracking-[0.12em]"
                style={{
                  color: "#a1a1aa",
                  background: "rgba(255,255,255,0.035)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                {item}
              </span>
            ))}
          </div>
        </header>
      </div>

      <div className="relative max-w-6xl mx-auto px-6 lg:px-8 pb-20 lg:pb-24">
        {!projects || projects.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center gap-3 rounded-3xl border py-28 text-center"
            style={{
              borderColor: "rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.02)",
              backdropFilter: "blur(10px)",
            }}
          >
            <p className="text-sm font-mono text-zinc-400">No projects yet.</p>
            <p className="text-xs text-zinc-500">Tambahkan project baru dari Sanity Studio di /studio.</p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, index) => (
              <div
                key={project._id}
                style={{
                  opacity: 0,
                  animation: "projectReveal 0.65s cubic-bezier(0.16,1,0.3,1) forwards",
                  animationDelay: `${index * 70}ms`,
                }}
              >
                <ProjectCard project={project} />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
