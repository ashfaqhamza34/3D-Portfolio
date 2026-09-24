import React from 'react';
import { Laptop, Leaf, Coffee, ArrowLeft, MousePointerClick } from 'lucide-react';
import { SectionId } from '../types';
import { sounds } from '../utils/audio';

interface WorkspaceOverlayProps {
  activeSection: SectionId;
  hoveredSection: SectionId | null;
  hoveredName: string | null;
  onSelectSection: (section: SectionId) => void;
  isTransitioning: boolean;
}

export const WorkspaceOverlay: React.FC<WorkspaceOverlayProps> = ({
  activeSection,
  hoveredSection,
  hoveredName,
  onSelectSection,
  isTransitioning,
}) => {
  const handleSelect = (section: SectionId) => {
    if (isTransitioning) return;
    sounds.playClick();
    onSelectSection(section);
  };

  return (
    <>
      {/* Overview Scene HUD & Object Hotspot Hints */}
      {activeSection === 'overview' && (
        <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between p-6 sm:p-10">
          {/* Top subtle intro kicker */}
          <div className="pt-16 sm:pt-14 max-w-md pointer-events-auto">
            <div className="flex items-center gap-2 text-xs font-medium text-amber-400/90 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span>INTERACTIVE 3D WORKSPACE</span>
            </div>
            <h1 className="font-['Syne',sans-serif] text-2xl sm:text-3xl font-bold tracking-tight text-white/95">
              Alex Vance
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
              Spatial Front-End Architect. Click the objects on the desk to navigate into projects, experience, or direct contact.
            </p>
          </div>

          {/* Bottom Floating Hotspot Controller Bar */}
          <div className="pb-4 sm:pb-6 flex flex-col items-center gap-3">
            {/* Hover Tooltip feedback */}
            <div
              className={`transition-all duration-200 pointer-events-none ${
                hoveredSection
                  ? 'opacity-100 transform translate-y-0'
                  : 'opacity-0 transform translate-y-2'
              }`}
            >
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-amber-400/30 text-xs text-amber-200 shadow-lg">
                <MousePointerClick className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                <span className="font-medium">{hoveredName || 'Click to examine'}</span>
              </div>
            </div>

            {/* Quick Desk Guide Buttons */}
            <div className="pointer-events-auto flex items-center gap-2 p-1.5 rounded-2xl bg-[#14151b]/80 backdrop-blur-lg border border-white/10 shadow-xl">
              <button
                onClick={() => handleSelect('projects')}
                disabled={isTransitioning}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  hoveredSection === 'projects'
                    ? 'bg-amber-400 text-stone-950 font-semibold shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.08]'
                }`}
              >
                <Laptop className="w-3.5 h-3.5" />
                <span>Laptop · Projects</span>
              </button>

              <button
                onClick={() => handleSelect('about')}
                disabled={isTransitioning}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  hoveredSection === 'about'
                    ? 'bg-amber-400 text-stone-950 font-semibold shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.08]'
                }`}
              >
                <Leaf className="w-3.5 h-3.5" />
                <span>Plant · About Me</span>
              </button>

              <button
                onClick={() => handleSelect('contact')}
                disabled={isTransitioning}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  hoveredSection === 'contact'
                    ? 'bg-amber-400 text-stone-950 font-semibold shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.08]'
                }`}
              >
                <Coffee className="w-3.5 h-3.5" />
                <span>Coffee · Contact</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating "Back to Desk" Button when section panel is open */}
      {activeSection !== 'overview' && (
        <div className="fixed bottom-6 left-6 z-30 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <button
            onClick={() => handleSelect('overview')}
            disabled={isTransitioning}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#14151b]/90 backdrop-blur-md border border-white/15 text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/[0.1] hover:border-amber-400/40 shadow-xl transition-all cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 text-amber-400 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Workspace</span>
            <span className="hidden sm:inline text-[10px] text-slate-500 font-mono pl-1">ESC</span>
          </button>
        </div>
      )}
    </>
  );
};
