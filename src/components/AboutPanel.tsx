import React from 'react';
import { X, Briefcase, Code, MapPin, CheckCircle2 } from 'lucide-react';
import { PERSONAL_INFO, SKILL_CATEGORIES, EXPERIENCES } from '../data/portfolioData';
import { sounds } from '../utils/audio';

interface AboutPanelProps {
  onClose: () => void;
  onNavigateContact: () => void;
}

export const AboutPanel: React.FC<AboutPanelProps> = ({ onClose, onNavigateContact }) => {
  return (
    <div className="relative w-full max-w-4xl mx-auto bg-[#181a20]/95 backdrop-blur-xl border border-white/[0.12] rounded-2xl p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-300 max-h-[85vh] overflow-y-auto">
      {/* Header bar */}
      <div className="flex items-start justify-between pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-400 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{PERSONAL_INFO.status}</span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1 text-slate-400">
              <MapPin className="w-3 h-3" />
              {PERSONAL_INFO.location}
            </span>
          </div>
          <h2 className="font-['Syne',sans-serif] text-2xl sm:text-3xl font-bold tracking-tight text-white">
            {PERSONAL_INFO.name}
          </h2>
          <p className="text-sm text-slate-300 font-medium mt-0.5">
            {PERSONAL_INFO.title}
          </p>
        </div>

        <button
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors border border-white/5 cursor-pointer"
          aria-label="Close About Panel"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Bio & Key Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-6 border-b border-white/[0.08]">
        <div className="lg:col-span-2 space-y-4">
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            {PERSONAL_INFO.bio}
          </p>
          <p className="text-sm text-slate-400 leading-relaxed">
            My philosophy centers around intentional craft: minimal visual noise, physically-calibrated lighting, responsive tactile feedback, and obsessive memory profiling to maintain 60 FPS everywhere.
          </p>
        </div>

        {/* Tabular Stats Grid */}
        <div className="grid grid-cols-2 gap-3 bg-white/[0.02] p-4 rounded-xl border border-white/[0.06]">
          {PERSONAL_INFO.stats.map((stat) => (
            <div key={stat.label} className="p-2">
              <div className="font-['JetBrains_Mono',monospace] text-2xl font-bold text-amber-300 tabular-nums">
                {stat.value}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Technical Capabilities */}
      <div className="py-6 border-b border-white/[0.08]">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
          <Code className="w-3.5 h-3.5 text-amber-400" />
          <span>Core Competencies & Stack</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {SKILL_CATEGORIES.map((cat) => (
            <div key={cat.title} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <h4 className="text-xs font-semibold text-white mb-2.5">
                {cat.title}
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {cat.skills.map((skill) => (
                  <li key={skill} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{skill}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Experience History */}
      <div className="pt-6">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
          <Briefcase className="w-3.5 h-3.5 text-amber-400" />
          <span>Professional Background</span>
        </div>
        <div className="space-y-4">
          {EXPERIENCES.map((exp) => (
            <div
              key={exp.period}
              className="flex flex-col sm:flex-row sm:items-start justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] gap-2"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-white">
                    {exp.role}
                  </h4>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span className="text-xs text-amber-400 font-medium">
                    {exp.company}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                  {exp.highlight}
                </p>
              </div>
              <span className="text-xs text-slate-400 font-mono shrink-0">
                {exp.period}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="mt-8 pt-5 border-t border-white/[0.08] flex items-center justify-between">
        <span className="text-xs text-slate-400">
          Interested in collaborating on a spatial web project?
        </span>
        <button
          onClick={() => {
            sounds.playClick();
            onNavigateContact();
          }}
          className="px-4 py-2 rounded-lg text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 transition-colors cursor-pointer"
        >
          Send a Message
        </button>
      </div>
    </div>
  );
};
