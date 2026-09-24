import React, { useState } from 'react';
import { ExternalLink, Github, X, Sparkles, Layers } from 'lucide-react';
import { PROJECTS } from '../data/portfolioData';
import { sounds } from '../utils/audio';

interface ProjectsPanelProps {
  onClose: () => void;
}

export const ProjectsPanel: React.FC<ProjectsPanelProps> = ({ onClose }) => {
  const [filter, setFilter] = useState<'all' | '3d-web' | 'fullstack' | 'tooling'>('all');

  const filteredProjects = filter === 'all'
    ? PROJECTS
    : PROJECTS.filter((p) => p.category === filter);

  return (
    <div className="relative w-full max-w-4xl mx-auto bg-[#181a20]/95 backdrop-blur-xl border border-white/[0.12] rounded-2xl p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
      {/* Header bar */}
      <div className="flex items-start justify-between pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-amber-400 mb-1">
            <Layers className="w-3.5 h-3.5" />
            <span>SELECTED WORK · 2024–2026</span>
          </div>
          <h2 className="font-['Syne',sans-serif] text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Engineered Projects
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            Real-time WebGL engines, spatial visualizers, and distributed web applications.
          </p>
        </div>

        <button
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors border border-white/5 cursor-pointer"
          aria-label="Close Projects Panel"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Interactive Filter Tabs (Button segmented controls) */}
      <div className="flex items-center gap-1.5 py-4 border-b border-white/[0.06] overflow-x-auto">
        {[
          { id: 'all', label: 'All Projects' },
          { id: '3d-web', label: '3D & Spatial' },
          { id: 'fullstack', label: 'Full-Stack' },
          { id: 'tooling', label: 'Audio & Tooling' },
        ].map((tab) => {
          const isActive = filter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                sounds.playClick();
                setFilter(tab.id as typeof filter);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-amber-400 text-stone-950 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Project Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            className="flex flex-col justify-between p-5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.07] hover:border-amber-400/40 transition-all duration-200 group"
          >
            <div>
              {/* Clean unboxed metadata with separators */}
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                <span className="capitalize">{project.category.replace('-', ' ')}</span>
                <span aria-hidden="true">·</span>
                <span>{project.year}</span>
              </div>

              <h3 className="font-['Syne',sans-serif] text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                {project.title}
              </h3>

              <p className="text-xs text-amber-200/80 font-medium mt-1">
                {project.subtitle}
              </p>

              <p className="text-xs text-slate-300 leading-relaxed mt-3">
                {project.description}
              </p>

              {/* Highlight Metric */}
              <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center gap-1.5 text-xs text-amber-300 font-mono">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{project.featuredStat}</span>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-white/[0.06]">
              {/* Tech tags as clean unboxed text */}
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400 mb-4">
                {project.tags.map((tag, i) => (
                  <React.Fragment key={tag}>
                    <span>{tag}</span>
                    {i < project.tags.length - 1 && <span aria-hidden="true" className="text-slate-600">·</span>}
                  </React.Fragment>
                ))}
              </div>

              {/* Action Links */}
              <div className="flex items-center gap-3">
                {project.demoUrl && (
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => sounds.playClick()}
                    className="flex items-center gap-1.5 text-xs font-semibold text-stone-900 bg-amber-400 hover:bg-amber-300 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    <span>Inspect</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => sounds.playClick()}
                    className="flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-white/[0.08] transition-colors cursor-pointer"
                  >
                    <Github className="w-3.5 h-3.5" />
                    <span>Source</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
