import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { client, hasSanityConfig } from "@/lib/sanity";
import { projectBySlugQuery, allProjectsQuery } from "@/lib/queries";
import { Project } from "@/lib/types";
import Button from "@/components/ui/Button";
import ProjectImageCarousel from "@/components/ui/ProjectImageCarousel";

export const revalidate = 60;

interface Params {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  if (!hasSanityConfig || !client) return [];

  const projects = await client.fetch<Project[]>(allProjectsQuery);
  return (projects ?? []).map((project) => ({ slug: project.slug.current }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  if (!hasSanityConfig || !client) {
    return {
      title: "Project",
      description: "",
    };
  }

  const { slug } = await params;
  const project = await client.fetch<Project>(projectBySlugQuery, { slug });

  return {
    title: project?.title ?? "Project",
    description: project?.summary ?? "",
  };
}

export default async function ProjectDetailPage({ params }: Params) {
  if (!hasSanityConfig || !client) notFound();

  const { slug } = await params;
  const project = await client.fetch<Project>(projectBySlugQuery, { slug });

  if (!project) notFound();

  const techStack = project.techStack ?? [];
  const summary = project.summary ?? "No summary is available for this project yet.";
  const mobileVisibleStackCount = 8;
  const visibleTechStack = techStack.slice(0, mobileVisibleStackCount);
  const hiddenTechStack = techStack.slice(mobileVisibleStackCount);
  const galleryImages = project.thumbnails && project.thumbnails.length > 0
    ? project.thumbnails
    : project.thumbnail
      ? [project.thumbnail]
      : [];

  return (
    <main
      className="relative min-h-screen overflow-hidden text-white"
      style={{ background: "linear-gradient(180deg,#08080f 0%,#0a0a14 55%,#09090f 100%)" }}
    >
      <style>{`
        @keyframes detailScanline {
          from { transform: translateY(-100%); }
          to { transform: translateY(100vh); }
        }
      `}</style>

      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(100% 80% at 10% 0%, rgba(124,58,237,0.2) 0%, transparent 58%), radial-gradient(80% 70% at 90% 20%, rgba(99,102,241,0.14) 0%, transparent 60%), radial-gradient(70% 60% at 50% 100%, rgba(124,58,237,0.12) 0%, transparent 62%)",
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
            animation: "detailScanline 8s linear infinite",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.035] mix-blend-screen"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 300 300' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-10 lg:px-8 lg:pb-24 lg:pt-14">
        <Link
          href="/projects"
          className="mb-8 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-mono uppercase tracking-[0.12em] transition-all duration-300 hover:text-violet-200"
          style={{
            color: "#9ca3af",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <span className="text-violet-400">&lt;</span>
          All projects
        </Link>

        <section
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
            className="pointer-events-none absolute -top-20 right-0 h-52 w-52 rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(124,58,237,0.22) 0%, transparent 70%)",
              filter: "blur(28px)",
            }}
          />

          <div className="relative">
            <div className="mb-5 flex flex-wrap items-center gap-2.5">
              <span className="text-xs font-mono uppercase tracking-[0.3em] text-violet-400">Case Study</span>
              {project.featured ? (
                <span
                  className="rounded-full px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.12em]"
                  style={{
                    color: "#c4b5fd",
                    background: "rgba(124,58,237,0.2)",
                    border: "1px solid rgba(124,58,237,0.35)",
                  }}
                >
                  Featured project
                </span>
              ) : null}
            </div>

            <h1 className="text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              {project.title}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-zinc-400 lg:text-lg">{summary}</p>

            <div className="mt-6 flex flex-wrap gap-2.5">
              <span
                className="rounded-full px-3 py-1.5 text-[11px] font-mono uppercase tracking-[0.12em]"
                style={{
                  color: "#a1a1aa",
                  background: "rgba(255,255,255,0.035)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                {techStack.length} tech stack
              </span>
              <span
                className="rounded-full px-3 py-1.5 text-[11px] font-mono uppercase tracking-[0.12em]"
                style={{
                  color: "#a1a1aa",
                  background: "rgba(255,255,255,0.035)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                demo {project.demoUrl ? "available" : "none"}
              </span>
              <span
                className="rounded-full px-3 py-1.5 text-[11px] font-mono uppercase tracking-[0.12em]"
                style={{
                  color: "#a1a1aa",
                  background: "rgba(255,255,255,0.035)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                repository {project.repoUrl ? "available" : "none"}
              </span>
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              {project.demoUrl ? (
                <Button href={project.demoUrl} target="_blank" rel="noopener noreferrer" variant="primary">
                  Live Demo -&gt;
                </Button>
              ) : null}
              {project.repoUrl ? (
                <Button href={project.repoUrl} target="_blank" rel="noopener noreferrer" variant="outline">
                  GitHub Repo -&gt;
                </Button>
              ) : null}
            </div>
          </div>
        </section>

        <section className="mt-8">
          {galleryImages.length > 0 ? (
            <div
              className="relative overflow-hidden rounded-3xl border"
              style={{
                borderColor: "rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.02)",
                boxShadow: "0 24px 70px rgba(0,0,0,0.42)",
              }}
            >
              <div className="absolute inset-x-0 top-0 z-10 h-px bg-gradient-to-r from-transparent via-violet-400/60 to-transparent" />
              <div className="relative w-full">
                <ProjectImageCarousel images={galleryImages} title={project.title} />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
              </div>
            </div>
          ) : (
            <div
              className="rounded-3xl border px-6 py-16 text-center"
              style={{
                borderColor: "rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.02)",
              }}
            >
              <p className="text-sm font-mono text-zinc-400">No preview image available.</p>
            </div>
          )}
        </section>

        <section className="mt-8">
          <div
            className="rounded-3xl border p-5 sm:p-6 lg:p-8"
            style={{
              borderColor: "rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.02)",
              backdropFilter: "blur(10px)",
            }}
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs font-mono uppercase tracking-[0.25em] text-violet-400">Tech Stack</p>
              <span
                className="w-fit rounded-full px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.12em]"
                style={{
                  color: "#a1a1aa",
                  background: "rgba(255,255,255,0.035)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                {techStack.length} item{techStack.length !== 1 ? "s" : ""}
              </span>
            </div>

            {techStack.length > 0 ? (
              <>
                <div className="mt-4 flex flex-wrap gap-2 sm:hidden">
                  {visibleTechStack.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-full px-2 py-0.5 text-[10px] font-mono"
                      style={{
                        color: "#c4b5fd",
                        background: "rgba(124,58,237,0.1)",
                        border: "1px solid rgba(124,58,237,0.3)",
                      }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {hiddenTechStack.length > 0 ? (
                  <details className="group mt-2 sm:hidden">
                    <summary
                      className="inline-flex cursor-pointer list-none items-center rounded-full px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.1em]"
                      style={{
                        color: "#d4d4d8",
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.1)",
                      }}
                    >
                      <span className="group-open:hidden">Show more</span>
                      <span className="hidden group-open:inline">Show less</span>
                    </summary>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {hiddenTechStack.map((tech) => (
                        <span
                          key={`hidden-${tech}`}
                          className="rounded-full px-2 py-0.5 text-[10px] font-mono"
                          style={{
                            color: "#c4b5fd",
                            background: "rgba(124,58,237,0.1)",
                            border: "1px solid rgba(124,58,237,0.3)",
                          }}
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </details>
                ) : null}

                <div className="mt-4 hidden flex-wrap gap-2.5 sm:flex">
                  {techStack.map((tech) => (
                    <span
                      key={`desktop-${tech}`}
                      className="rounded-full px-2.5 py-1 text-xs font-mono"
                      style={{
                        color: "#c4b5fd",
                        background: "rgba(124,58,237,0.1)",
                        border: "1px solid rgba(124,58,237,0.3)",
                      }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <p className="mt-4 text-sm text-zinc-500">No stack information provided.</p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
