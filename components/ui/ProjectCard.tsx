import Image from "next/image";
import Link from "next/link";
import { Project } from "@/lib/types";
import { urlFor } from "@/lib/sanity";
import Badge from "@/components/ui/Badge";

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const previewImage = project.thumbnails?.[0] ?? project.thumbnail;

  return (
    <Link
      href={`/projects/${project.slug.current}`}
      className="group relative flex flex-col bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden hover:border-white/20 hover:bg-white/[0.06] transition-all duration-300"
    >
      {/* Thumbnail */}
      <div className="relative w-full aspect-video bg-zinc-900 overflow-hidden">
        {previewImage ? (
          <Image
            src={urlFor(previewImage).auto("format").fit("crop").width(960).height(540).url()}
            alt={project.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, 50vw"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-zinc-700 text-sm font-mono">no preview</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        <h3 className="font-semibold text-white text-lg leading-snug group-hover:text-zinc-100 transition-colors">
          {project.title}
        </h3>
        {project.summary && (
          <p className="text-zinc-500 text-sm leading-relaxed line-clamp-2">
            {project.summary}
          </p>
        )}
        {project.techStack && project.techStack.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
            {project.techStack.slice(0, 5).map((tech) => (
              <Badge key={tech} label={tech} />
            ))}
            {project.techStack.length > 5 && (
              <Badge label={`+${project.techStack.length - 5}`} />
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
