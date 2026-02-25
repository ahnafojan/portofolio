import { client, hasSanityConfig } from "@/lib/sanity";
import {
  profileQuery,
  featuredProjectsQuery,
  experiencesQuery,
  skillsQuery,
  ORGANIZATIONS_QUERY,
  CERTIFICATES_QUERY,
} from "@/lib/queries";
import {
  Profile,
  Project,
  Experience as ExperienceType,
  Skill,
  Certificate,
  Organization,
} from "@/lib/types";

import Hero from "@/components/sections/Hero";
import FeaturedProjects from "@/components/sections/FeaturedProjects";
import Skills from "@/components/sections/Skills";
import Experience from "@/components/sections/Experience";
import Organizations from "@/components/sections/Organizations";
import Certificates from "@/components/sections/Certificates";
import Contact from "@/components/sections/Contact";
import TopNavbar from "@/components/TopNavbar";

export const revalidate = 60;

export default async function Home() {
  if (!hasSanityConfig || !client) {
    return (
      <main className="min-h-screen bg-[#080808] text-white">
        <TopNavbar />
        <section className="mx-auto max-w-6xl px-6 pt-28">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-zinc-300">
            Data Sanity belum aktif di environment ini. Set
            {" "}<code className="text-violet-300">NEXT_PUBLIC_SANITY_PROJECT_ID</code> dan{" "}
            <code className="text-violet-300">NEXT_PUBLIC_SANITY_DATASET</code> di Vercel, lalu redeploy.
          </div>
        </section>
        <FeaturedProjects projects={[]} />
        <Skills skills={[]} />
        <Experience experiences={[]} />
        <Organizations items={[]} />
        <Certificates items={[]} />
      </main>
    );
  }

  const [
    profile,
    featuredProjects,
    experiences,
    skills,
    organizations,
    certificates,
  ] = await Promise.all([
    client.fetch<Profile | null>(profileQuery),
    client.fetch<Project[]>(featuredProjectsQuery),
    client.fetch<ExperienceType[]>(experiencesQuery),
    client.fetch<Skill[]>(skillsQuery),
    client.fetch<Organization[]>(ORGANIZATIONS_QUERY),
    client.fetch<Certificate[]>(CERTIFICATES_QUERY),
  ]);

  return (
    <main className="min-h-screen bg-[#080808] text-white">
      <TopNavbar />
      {profile ? <Hero profile={profile} skills={skills ?? []} /> : null}
      <FeaturedProjects projects={featuredProjects ?? []} />
      <Skills skills={skills ?? []} />
      <Experience experiences={experiences ?? []} />

      <Organizations items={organizations ?? []} />
      <Certificates items={certificates ?? []} />

      {profile ? <Contact profile={profile} /> : null}
    </main>
  );
}
