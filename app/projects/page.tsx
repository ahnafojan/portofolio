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

  return (
    <main className="bg-[#080808] min-h-screen text-white">
      {/* Header */}
      <div className="border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-16 lg:py-24">
          <Link href="/" className="text-xs font-mono text-zinc-600 hover:text-zinc-400 transition-colors flex items-center gap-2 mb-8">
            ← Back home
          </Link>
          <p className="text-xs font-mono text-zinc-600 tracking-widest uppercase mb-3">Work</p>
          <h1 className="text-4xl lg:text-5xl font-bold text-white">All Projects</h1>
          <p className="text-zinc-500 mt-4 text-sm max-w-md">
            {projects?.length ?? 0} project{(projects?.length ?? 0) !== 1 ? "s" : ""} — sorted by recency
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-16">
        {!projects || projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <p className="text-zinc-600 text-sm font-mono">No projects yet.</p>
            <p className="text-zinc-700 text-xs">Add some in your Sanity Studio at /studio</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((project) => (
              <ProjectCard key={project._id} project={project} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
