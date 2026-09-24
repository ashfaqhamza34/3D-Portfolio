import React from 'react';
import { Volume2, VolumeX, Eye, Box, ArrowLeft } from 'lucide-react';
import { SectionId } from '../types';
import { sounds } from '../utils/audio';

interface NavigationProps {
  activeSection: SectionId;
  onSelectSection: (section: SectionId) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  is2DMode: boolean;
  onToggleMode: () => void;
  isTransitioning: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeSection,
  onSelectSection,
  soundEnabled,
  onToggleSound,
  is2DMode,
  onToggleMode,
  isTransitioning,
}) => {
  const navItems: { id: SectionId; label: string }[] = [
    { id: 'overview', label: 'Workspace' },
    { id: 'projects', label: 'Projects' },
    { id: 'about', label: 'About' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleNavClick = (id: SectionId) => {
    if (isTransitioning) return;
    sounds.playClick();
    onSelectSection(id);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-6 py-4 md:px-10 md:py-5 border-b border-white/[0.07] bg-[#121316]/75 backdrop-blur-md transition-colors duration-300">
      {/* Zone 1: Wordmark */}
      <div className="flex items-center gap-3">
        {activeSection !== 'overview' && (
          <button
            onClick={() => handleNavClick('overview')}
            className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-medium px-2.5 py-1 rounded bg-amber-400/10 hover:bg-amber-400/20 transition-all border border-amber-400/20 mr-1 cursor-pointer"
            title="Return to Workspace view"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Back</span>
          </button>
        )}
        <button
          onClick={() => handleNavClick('overview')}
          className="text-left font-['Syne',sans-serif] text-base md:text-lg font-bold tracking-tight text-white hover:text-amber-300 transition-colors cursor-pointer"
        >
          ALEX VANCE
        </button>
      </div>

      {/* Zone 2: Navigation Links */}
      <nav className="flex items-center gap-2 sm:gap-6 md:gap-8">
        {navItems.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              disabled={isTransitioning}
              className={`relative text-xs md:text-sm font-medium transition-colors py-1 cursor-pointer ${
                isActive
                  ? 'text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              } ${isTransitioning ? 'opacity-50 cursor-wait' : ''}`}
            >
              {item.label}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-amber-400 rounded-full" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Zone 3: Actions */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Audio Toggle */}
        <button
          onClick={onToggleSound}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors border border-transparent hover:border-white/10 cursor-pointer"
          title={soundEnabled ? 'Mute ambient sound' : 'Enable audio feedback'}
          aria-label="Toggle Audio"
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 text-amber-400" />
          ) : (
            <VolumeX className="w-4 h-4" />
          )}
        </button>

        {/* 2D / 3D Mode Toggle */}
        <button
          onClick={onToggleMode}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 transition-colors cursor-pointer"
          title={is2DMode ? 'Switch to interactive 3D scene' : 'Switch to lightweight 2D layout'}
        >
          {is2DMode ? (
            <>
              <Box className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">3D Scene</span>
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">2D View</span>
            </>
          )}
        </button>

        {/* CTA Contact link */}
        <button
          onClick={() => handleNavClick('contact')}
          className="hidden lg:flex items-center px-3.5 py-1.5 rounded-lg text-xs font-semibold text-stone-900 bg-amber-400 hover:bg-amber-300 transition-colors cursor-pointer"
        >
          Get In Touch
        </button>
      </div>
    </header>
  );
};
