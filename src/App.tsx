/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { SectionId } from './types';
import { ThreeCanvas } from './components/ThreeCanvas';
import { Navigation } from './components/Navigation';
import { WorkspaceOverlay } from './components/WorkspaceOverlay';
import { ProjectsPanel } from './components/ProjectsPanel';
import { AboutPanel } from './components/AboutPanel';
import { ContactPanel } from './components/ContactPanel';
import { FallbackView } from './components/FallbackView';
import { sounds } from './utils/audio';

export default function App() {
  const [activeSection, setActiveSection] = useState<SectionId>('overview');
  const [panelRevealed, setPanelRevealed] = useState<boolean>(false);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [hoveredSection, setHoveredSection] = useState<SectionId | null>(null);
  const [hoveredName, setHoveredName] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [is2DMode, setIs2DMode] = useState<boolean>(false);
  const [webglSupported, setWebglSupported] = useState<boolean>(true);

  // Check WebGL availability on mount
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setWebglSupported(false);
        setIs2DMode(true);
      }
    } catch {
      setWebglSupported(false);
      setIs2DMode(true);
    }
  }, []);

  // Sync soundEnabled with sound system
  useEffect(() => {
    sounds.enabled = soundEnabled;
  }, [soundEnabled]);

  // Section selection handler
  const handleSelectSection = useCallback((section: SectionId) => {
    if (section === activeSection) return;
    // Hide open panel while camera transitions
    setPanelRevealed(false);
    setActiveSection(section);
  }, [activeSection]);

  // Called when camera transition finishes
  const handleCameraTransitionComplete = useCallback((section: SectionId) => {
    // Only reveal content panel if we're focused on an interactive object
    if (section !== 'overview') {
      // Smooth reveal delay for panel slide-in
      setTimeout(() => {
        setPanelRevealed(true);
      }, 100);
    } else {
      setPanelRevealed(false);
    }
  }, []);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activeSection !== 'overview') {
          sounds.playClick();
          handleSelectSection('overview');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeSection, handleSelectSection]);

  const toggleSound = () => {
    setSoundEnabled((prev) => !prev);
  };

  const toggleMode = () => {
    sounds.playClick();
    if (!webglSupported && is2DMode) {
      // Cannot switch to 3D if WebGL is unsupported
      return;
    }
    setIs2DMode((prev) => !prev);
  };

  return (
    <div className="relative w-full h-full bg-[#121316] text-slate-100 overflow-hidden select-none font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Persistent Navigation Bar */}
      <Navigation
        activeSection={activeSection}
        onSelectSection={handleSelectSection}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
        is2DMode={is2DMode}
        onToggleMode={toggleMode}
        isTransitioning={isTransitioning}
      />

      {/* Main View Area */}
      {is2DMode ? (
        <div className="w-full h-full overflow-y-auto">
          <FallbackView onSwitchTo3D={() => setIs2DMode(false)} />
        </div>
      ) : (
        <main className="relative w-full h-full">
          {/* 3D Scene Viewport */}
          <ThreeCanvas
            activeSection={activeSection}
            onSelectSection={handleSelectSection}
            onCameraTransitionComplete={handleCameraTransitionComplete}
            onHoverObject={(sec, name) => {
              setHoveredSection(sec);
              setHoveredName(name);
            }}
            isTransitioning={isTransitioning}
            setIsTransitioning={setIsTransitioning}
          />

          {/* 3D Workspace HUD Overlay */}
          <WorkspaceOverlay
            activeSection={activeSection}
            hoveredSection={hoveredSection}
            hoveredName={hoveredName}
            onSelectSection={handleSelectSection}
            isTransitioning={isTransitioning}
          />

          {/* Section Detail Floating Panels (Reveals smoothly AFTER camera finishes moving) */}
          {activeSection !== 'overview' && panelRevealed && (
            <div className="fixed inset-0 z-40 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-black/40 backdrop-blur-[3px] animate-in fade-in duration-300">
              <div
                className="w-full max-h-[90vh] overflow-y-auto py-4"
                onClick={(e) => {
                  // Prevent click-through to backdrop
                  e.stopPropagation();
                }}
              >
                {activeSection === 'projects' && (
                  <ProjectsPanel onClose={() => handleSelectSection('overview')} />
                )}
                {activeSection === 'about' && (
                  <AboutPanel
                    onClose={() => handleSelectSection('overview')}
                    onNavigateContact={() => handleSelectSection('contact')}
                  />
                )}
                {activeSection === 'contact' && (
                  <ContactPanel onClose={() => handleSelectSection('overview')} />
                )}
              </div>
            </div>
          )}
        </main>
      )}
    </div>
  );
}
