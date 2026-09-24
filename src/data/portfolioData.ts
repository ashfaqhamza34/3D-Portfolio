import { Project, SkillCategory, ExperienceItem } from '../types';

export const PERSONAL_INFO = {
  name: 'Alex Vance',
  title: 'Creative Technologist & Spatial Web Engineer',
  location: 'San Francisco, CA',
  status: 'Available for Q2 Projects',
  email: 'alex.vance.dev@gmail.com',
  github: 'https://github.com',
  linkedin: 'https://linkedin.com',
  x: 'https://x.com',
  bio: `I craft tactile, high-performance digital experiences at the intersection of creative front-end architecture, WebGL graphics, and robust full-stack systems. With 7+ years of engineering experience, I specialize in bringing complex interactive environments and fluid interfaces to life with pixel-level precision.`,
  stats: [
    { label: 'Years Experience', value: '7+' },
    { label: 'Production Shipped', value: '34+' },
    { label: 'Avg Lighthouse Score', value: '99' },
    { label: 'Client Satisfaction', value: '100%' },
  ],
};

export const PROJECTS: Project[] = [
  {
    id: 'prism-studio',
    title: 'Prism Spatial Studio',
    subtitle: 'Browser-based real-time 3D lighting & shader staging tool',
    description:
      'A WebGL engine providing instant environment mapping, physically-based materials playground, and high-framerate GLTF model inspections for creative studios.',
    tags: ['Three.js', 'GLSL Shaders', 'WebGPU', 'TypeScript'],
    category: '3d-web',
    year: '2026',
    demoUrl: 'https://github.com',
    githubUrl: 'https://github.com',
    featuredStat: '60 FPS @ 4K resolution on Apple Silicon',
  },
  {
    id: 'voxelflow',
    title: 'VoxelFlow Systems',
    subtitle: 'High-throughput visual analytics and asset pipeline',
    description:
      'Architected distributed procedural geometry generator and pipeline manager with real-time websocket synchronization and collaborative multi-user canvas.',
    tags: ['React', 'Three.js', 'Rust / Wasm', 'Node.js'],
    category: 'fullstack',
    year: '2025',
    demoUrl: 'https://github.com',
    githubUrl: 'https://github.com',
    featuredStat: '< 14ms latency asset sync across 200 nodes',
  },
  {
    id: 'aether-audio',
    title: 'Aether Audio Engine',
    subtitle: 'Spatial soundscape synthesizer & interactive visualizer',
    description:
      'Interactive binaural sound simulation environment using Web Audio API nodes with reactive FFT frequency particle meshes and zero-latency audio routing.',
    tags: ['Web Audio API', 'Canvas API', 'TypeScript', 'Tailwind'],
    category: 'tooling',
    year: '2025',
    demoUrl: 'https://github.com',
    githubUrl: 'https://github.com',
    featuredStat: 'Selected for Creative Code Showcase 2025',
  },
];

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    title: 'Spatial & 3D Web',
    skills: ['Three.js', 'WebGL / GLSL', 'GSAP Animation', 'WebGPU', 'Blender / Low-Poly 3D'],
  },
  {
    title: 'Frontend Architecture',
    skills: ['TypeScript', 'React 19', 'Next.js', 'Tailwind CSS', 'Vite & Build Optimization'],
  },
  {
    title: 'Backend & Systems',
    skills: ['Node.js & Express', 'WebSockets', 'REST & GraphQL', 'PostgreSQL', 'Cloud Run / GCP'],
  },
];

export const EXPERIENCES: ExperienceItem[] = [
  {
    period: '2023 — Present',
    role: 'Lead Spatial Engineer',
    company: 'Atelier Labs SF',
    highlight: 'Directed WebGL interactive product launches for tier-1 brands, reducing bundle payloads by 42%.',
  },
  {
    period: '2021 — 2023',
    role: 'Senior Creative Developer',
    company: 'Monolith Interactive',
    highlight: 'Engineered real-time 3D showroom engines and micro-interaction frameworks used by 1.2M monthly users.',
  },
  {
    period: '2019 — 2021',
    role: 'Full-Stack Developer',
    company: 'Vanguard Digital',
    highlight: 'Built resilient frontend platforms with serverless APIs and custom motion design systems.',
  },
];
