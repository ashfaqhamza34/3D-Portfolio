export type SectionId = 'overview' | 'projects' | 'about' | 'contact';

export interface Project {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  tags: string[];
  category: '3d-web' | 'fullstack' | 'tooling';
  year: string;
  demoUrl?: string;
  githubUrl?: string;
  featuredStat: string;
}

export interface SkillCategory {
  title: string;
  skills: string[];
}

export interface ExperienceItem {
  period: string;
  role: string;
  company: string;
  highlight: string;
}
