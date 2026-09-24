import React, { useState } from 'react';
import { Laptop, Leaf, Coffee, Box, ExternalLink, Github, Sparkles, Send, Mail, Copy, Check } from 'lucide-react';
import { SectionId } from '../types';
import { PERSONAL_INFO, PROJECTS, SKILL_CATEGORIES, EXPERIENCES } from '../data/portfolioData';
import { sounds } from '../utils/audio';

interface FallbackViewProps {
  onSwitchTo3D: () => void;
}

export const FallbackView: React.FC<FallbackViewProps> = ({ onSwitchTo3D }) => {
  const [tab, setTab] = useState<SectionId>('projects');
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactData, setContactData] = useState({ name: '', email: '', message: '' });

  const handleCopy = () => {
    navigator.clipboard.writeText(PERSONAL_INFO.email);
    setCopiedEmail(true);
    sounds.playClick();
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitted(true);
    sounds.playSuccess();
  };

  return (
    <div className="min-h-full w-full bg-[#121316] text-slate-100 px-6 py-20 max-w-5xl mx-auto">
      {/* 2D Mode Notice Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 mb-10 rounded-xl bg-white/[0.03] border border-white/10 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-400/10 text-amber-400">
            <Box className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-white">2D Performance View Active</div>
            <div className="text-xs text-slate-400">Lightweight layout optimized for low-power or mobile environments.</div>
          </div>
        </div>
        <button
          onClick={() => {
            sounds.playClick();
            onSwitchTo3D();
          }}
          className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 transition-colors cursor-pointer shrink-0"
        >
          <Box className="w-3.5 h-3.5" />
          <span>Launch 3D Scene</span>
        </button>
      </div>

      {/* Hero Header */}
      <div className="mb-10">
        <div className="text-xs font-medium text-amber-400 tracking-wider mb-2">
          CREATIVE TECHNOLOGIST & SPATIAL DEV
        </div>
        <h1 className="font-['Syne',sans-serif] text-4xl sm:text-5xl font-bold tracking-tight text-white">
          {PERSONAL_INFO.name}
        </h1>
        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mt-3 leading-relaxed">
          {PERSONAL_INFO.bio}
        </p>

        {/* Tabular Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/[0.08]">
          {PERSONAL_INFO.stats.map((s) => (
            <div key={s.label}>
              <div className="font-mono text-xl font-bold text-amber-300 tabular-nums">{s.value}</div>
              <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Isometric Desk Illustration / Thematic Anchor */}
      <div className="relative p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/[0.08] mb-12 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Workspace Hub
          </span>
          <span className="text-xs text-amber-400 font-mono">3 Interactive Objects</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => {
              sounds.playClick();
              setTab('projects');
            }}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
              tab === 'projects'
                ? 'bg-amber-400/10 border-amber-400/40'
                : 'bg-white/[0.02] border-white/5 hover:border-white/20'
            }`}
          >
            <Laptop className="w-5 h-5 text-amber-400 mb-2" />
            <div className="text-sm font-bold text-white">The Laptop</div>
            <div className="text-xs text-slate-400 mt-1">Featured Projects & Demos</div>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setTab('about');
            }}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
              tab === 'about'
                ? 'bg-amber-400/10 border-amber-400/40'
                : 'bg-white/[0.02] border-white/5 hover:border-white/20'
            }`}
          >
            <Leaf className="w-5 h-5 text-emerald-400 mb-2" />
            <div className="text-sm font-bold text-white">The Plant</div>
            <div className="text-xs text-slate-400 mt-1">Background & Capabilities</div>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setTab('contact');
            }}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
              tab === 'contact'
                ? 'bg-amber-400/10 border-amber-400/40'
                : 'bg-white/[0.02] border-white/5 hover:border-white/20'
            }`}
          >
            <Coffee className="w-5 h-5 text-amber-300 mb-2" />
            <div className="text-sm font-bold text-white">The Coffee Mug</div>
            <div className="text-xs text-slate-400 mt-1">Direct Contact & Channels</div>
          </button>
        </div>
      </div>

      {/* Tab Content Display */}
      {tab === 'projects' && (
        <div className="space-y-6">
          <h2 className="font-['Syne',sans-serif] text-2xl font-bold text-white">Projects Showcase</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PROJECTS.map((p) => (
              <div
                key={p.id}
                className="p-5 rounded-xl bg-white/[0.03] border border-white/[0.08] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                    <span className="capitalize">{p.category.replace('-', ' ')}</span>
                    <span>·</span>
                    <span>{p.year}</span>
                  </div>
                  <h3 className="font-['Syne',sans-serif] text-lg font-bold text-white">{p.title}</h3>
                  <p className="text-xs text-amber-300/80 font-medium mt-1">{p.subtitle}</p>
                  <p className="text-xs text-slate-300 mt-3 leading-relaxed">{p.description}</p>
                  <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center gap-1.5 text-xs text-amber-300 font-mono">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>{p.featuredStat}</span>
                  </div>
                </div>
                <div className="mt-6 pt-3 border-t border-white/[0.06] flex items-center gap-3">
                  {p.demoUrl && (
                    <a
                      href={p.demoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-xs font-semibold text-stone-900 bg-amber-400 hover:bg-amber-300 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <span>Demo</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {p.githubUrl && (
                    <a
                      href={p.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-white/[0.08] transition-colors"
                    >
                      <Github className="w-3.5 h-3.5" />
                      <span>Code</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'about' && (
        <div className="space-y-8">
          <div>
            <h2 className="font-['Syne',sans-serif] text-2xl font-bold text-white mb-4">Core Competencies</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {SKILL_CATEGORIES.map((cat) => (
                <div key={cat.title} className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <h3 className="text-xs font-semibold text-white mb-2">{cat.title}</h3>
                  <div className="space-y-1 text-xs text-slate-300">
                    {cat.skills.map((s) => (
                      <div key={s}>• {s}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-['Syne',sans-serif] text-2xl font-bold text-white mb-4">Experience</h2>
            <div className="space-y-4">
              {EXPERIENCES.map((exp) => (
                <div key={exp.period} className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div>
                    <div className="text-sm font-semibold text-white">
                      {exp.role} · <span className="text-amber-400 font-normal">{exp.company}</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">{exp.highlight}</p>
                  </div>
                  <span className="text-xs font-mono text-slate-400 shrink-0">{exp.period}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'contact' && (
        <div className="max-w-xl mx-auto space-y-6">
          <h2 className="font-['Syne',sans-serif] text-2xl font-bold text-white">Get in Touch</h2>
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08]">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-mono text-slate-200">{PERSONAL_INFO.email}</span>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-white/[0.06] hover:bg-white/[0.1] transition-colors"
            >
              {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedEmail ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {contactSubmitted ? (
            <div className="p-6 rounded-xl bg-white/[0.03] border border-white/[0.08] text-center space-y-2">
              <div className="text-emerald-400 font-bold text-sm">Message Received</div>
              <p className="text-xs text-slate-400">Thanks for getting in touch. I will follow up shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={contactData.name}
                  onChange={(e) => setContactData({ ...contactData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/10 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={contactData.email}
                  onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/10 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Message</label>
                <textarea
                  required
                  rows={4}
                  value={contactData.message}
                  onChange={(e) => setContactData({ ...contactData, message: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/10 text-sm text-white focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 transition-colors"
              >
                <span>Send Message</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
