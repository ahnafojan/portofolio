import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import { client, urlFor } from "@/lib/sanity";
import { projectBySlugQuery, allProjectsQuery } from "@/lib/queries";
import { Project } from "@/lib/types";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

export const revalidate = 60;

interface Params {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const projects = await client.fetch<Project[]>(allProjectsQuery);
  return (projects ?? []).map((p) => ({ slug: p.slug.current }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const project = await client.fetch<Project>(projectBySlugQuery, { slug });
  return {
    title: project?.title ?? "Project",
    description: project?.summary ?? "",
  };
}

export default async function ProjectDetailPage({ params }: Params) {
  const { slug } = await params;
  const project = await client.fetch<Project>(projectBySlugQuery, { slug });

  if (!project) notFound();

  return (
    <main className="bg-[#080808] min-h-screen text-white">
      {/* Nav */}
      <div className="max-w-6xl mx-auto px-6 lg:px-8 pt-8">
        <Link
          href="/projects"
          className="text-xs font-mono text-zinc-600 hover:text-zinc-400 transition-colors flex items-center gap-2"
        >
          ← All Projects
        </Link>
      </div>

      {/* Hero */}
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-12 lg:py-20">
        <div className="flex flex-col gap-5 max-w-3xl">
          {project.featured && (
            <span className="text-xs font-mono text-violet-400 bg-violet-500/10 px-3 py-1 rounded-full border border-violet-500/20 w-fit">
              Featured
            </span>
          )}
          <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight">
            {project.title}
          </h1>
          {project.summary && (
            <p className="text-zinc-400 text-lg leading-relaxed">{project.summary}</p>
          )}
          {project.techStack && project.techStack.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {project.techStack.map((tech) => (
                <Badge key={tech} label={tech} variant="default" />
              ))}
            </div>
          )}
          <div className="flex flex-wrap gap-3 mt-4">
            {project.demoUrl && (
              <Button href={project.demoUrl} target="_blank" rel="noopener noreferrer" variant="primary">
                Live Demo ↗
              </Button>
            )}
            {project.repoUrl && (
              <Button href={project.repoUrl} target="_blank" rel="noopener noreferrer" variant="outline">
                GitHub Repo ↗
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Thumbnail */}
      {project.thumbnail && (
        <div className="max-w-6xl mx-auto px-6 lg:px-8 pb-16">
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/8">
            <Image
              src={urlFor(project.thumbnail).width(1200).height(675).url()}
              alt={project.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 1200px"
              priority
            />
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="max-w-6xl mx-auto px-6 lg:px-8 pb-24">
        <div className="border-t border-white/5 pt-12 flex flex-col gap-4">
          <p className="text-xs font-mono text-zinc-600 tracking-widest uppercase">Details</p>
          {project.techStack && project.techStack.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-zinc-500 text-sm font-medium">Tech Stack</p>
              <div className="flex flex-wrap gap-2">
                {project.techStack.map((tech) => (
                  <Badge key={tech} label={tech} variant="accent" />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
