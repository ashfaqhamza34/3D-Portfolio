import React, { useState } from 'react';
import { X, Send, Mail, Copy, Check, Github, Linkedin, Twitter } from 'lucide-react';
import { PERSONAL_INFO } from '../data/portfolioData';
import { sounds } from '../utils/audio';

interface ContactPanelProps {
  onClose: () => void;
}

export const ContactPanel: React.FC<ContactPanelProps> = ({ onClose }) => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setIsSubmitting(true);
    sounds.playClick();

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      sounds.playSuccess();
    }, 900);
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(PERSONAL_INFO.email);
    setCopiedEmail(true);
    sounds.playClick();
    setTimeout(() => setCopiedEmail(false), 2200);
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto bg-[#181a20]/95 backdrop-blur-xl border border-white/[0.12] rounded-2xl p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
      {/* Header bar */}
      <div className="flex items-start justify-between pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-amber-400 mb-1">
            <Mail className="w-3.5 h-3.5" />
            <span>START A CONVERSATION</span>
          </div>
          <h2 className="font-['Syne',sans-serif] text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Get in Touch
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Have an interactive project or engineering role in mind? Let's connect.
          </p>
        </div>

        <button
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors border border-white/5 cursor-pointer"
          aria-label="Close Contact Panel"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Direct Contact Bar */}
      <div className="flex items-center justify-between p-3.5 my-5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-amber-400/10 text-amber-400">
            <Mail className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400">Direct Email</div>
            <div className="text-xs sm:text-sm font-mono text-slate-200">{PERSONAL_INFO.email}</div>
          </div>
        </div>
        <button
          type="button"
          onClick={handleCopyEmail}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 transition-colors cursor-pointer"
        >
          {copiedEmail ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Contact Form */}
      {isSubmitted ? (
        <div className="py-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/30">
            <Check className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white font-['Syne',sans-serif]">Message Dispatched</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Thank you for reaching out, {formData.name}. I typically respond within 24 hours.
          </p>
          <button
            onClick={() => {
              setIsSubmitted(false);
              setFormData({ name: '', email: '', message: '' });
            }}
            className="mt-4 px-4 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-white/[0.06] hover:bg-white/[0.1] transition-colors cursor-pointer"
          >
            Send another note
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-xs font-medium text-slate-300 mb-1.5">
                Your Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Jane Doe"
                className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.03] border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/60 transition-all"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-slate-300 mb-1.5">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="jane@company.com"
                className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.03] border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/60 transition-all"
              />
            </div>
          </div>

          <div>
            <label htmlFor="message" className="block text-xs font-medium text-slate-300 mb-1.5">
              Message / Project Scope
            </label>
            <textarea
              id="message"
              required
              rows={4}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Tell me about what you are building..."
              className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.03] border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/60 transition-all resize-none"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <a
                href={PERSONAL_INFO.github}
                target="_blank"
                rel="noreferrer"
                className="p-2 text-slate-400 hover:text-white transition-colors"
                title="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href={PERSONAL_INFO.linkedin}
                target="_blank"
                rel="noreferrer"
                className="p-2 text-slate-400 hover:text-white transition-colors"
                title="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href={PERSONAL_INFO.x}
                target="_blank"
                rel="noreferrer"
                className="p-2 text-slate-400 hover:text-white transition-colors"
                title="X / Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 transition-colors cursor-pointer"
            >
              {isSubmitting ? (
                <span>Transmitting...</span>
              ) : (
                <>
                  <span>Send Message</span>
                  <Send className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
