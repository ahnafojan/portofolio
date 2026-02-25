export interface SanityImage {
  _type: "image";
  asset: {
    _ref: string;
    _type: "reference";
  };
  hotspot?: {
    x: number;
    y: number;
    height: number;
    width: number;
  };
}

export interface Profile {
  _id: string;
  fullName: string;
  headline?: string;
  about?: string;
  location?: string;
  avatar?: SanityImage;
  socials?: {
    github?: string;
    linkedin?: string;
    instagram?: string;
    website?: string;
  };
}

export interface Project {
  _id: string;
  title: string;
  slug: { current: string };
  summary?: string;
  thumbnails?: SanityImage[];
  thumbnail?: SanityImage;
  techStack?: string[];
  demoUrl?: string;
  repoUrl?: string;
  featured?: boolean;
  order?: number;
}

export interface Experience {
  _id: string;
  company: string;
  role: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  description?: string;
  order?: number;
}

export interface Skill {
  _id: string;
  name: string;
  category?: string;
  level?: number;
  order?: number;
}

export type SkillsByCategory = Record<string, Skill[]>;

export type Organization = {
  _id: string;
  name: string;
  role: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  description?: string;
  order?: number;
};

export type Certificate = {
  _id: string;
  title: string;
  issuer?: string;
  issueDate?: string;
  expiryDate?: string;
  credentialUrl?: string;
  credentialId?: string;
  skills?: string[];
  logo?: SanityImage;
  logos?: SanityImage[];
  order?: number;
};
