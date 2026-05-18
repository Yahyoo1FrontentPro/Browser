"use client";

import { useState } from "react";
import { Globe, Settings, Terminal, Gamepad2, ChevronRight, Hash } from "lucide-react";
import { CommandPalette } from "../components/CommandPalette";

export default function BrowserApp() {
  const [currentUrl, setCurrentUrl] = useState("https://www.google.com/search?igu=1");
  const [isSplitScreen, setIsSplitScreen] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#09090b] text-zinc-300 font-sans overflow-hidden selection:bg-indigo-500/30">
      
      {/* 1. Vertical Sidebar (No Standard Tabs) - Glassmorphism */}
      <aside className="w-16 flex flex-col items-center py-4 bg-white/5 border-r border-white/10 backdrop-blur-xl z-20 drag-region">
        <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.5)] mb-8 no-drag cursor-pointer">
          <span className="text-white font-bold text-lg">A</span>
        </div>

        <div className="flex flex-col gap-4 no-drag w-full px-2 flex-1">
          <button onClick={() => setCurrentUrl("https://www.google.com/search?igu=1")} className="w-full aspect-square rounded-xl bg-white/10 hover:bg-white/20 transition-all flex items-center justify-center group relative">
            <Globe size={20} className="text-zinc-400 group-hover:text-white transition-colors" />
            <span className="absolute left-14 bg-black/80 px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 pointer-events-none border border-white/10">Google</span>
          </button>
          
          <button onClick={() => setCurrentUrl("https://github.com")} className="w-full aspect-square rounded-xl bg-white/5 hover:bg-white/20 transition-all flex items-center justify-center group relative">
            <Hash size={20} className="text-zinc-400 group-hover:text-white transition-colors" />
            <span className="absolute left-14 bg-black/80 px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 pointer-events-none border border-white/10">GitHub</span>
          </button>
        </div>

        <div className="flex flex-col gap-4 no-drag w-full px-2">
          <button className="w-full aspect-square rounded-xl hover:bg-white/10 transition-all flex items-center justify-center text-zinc-500 hover:text-white">
            <Settings size={20} />
          </button>
        </div>
      </aside>

      {/* 2. Command Palette (Ctrl+K) */}
      <CommandPalette 
        onOpenUrl={setCurrentUrl} 
        onSplitScreen={() => setIsSplitScreen(!isSplitScreen)} 
        onToggleTerminal={() => setIsTerminalOpen(!isTerminalOpen)}
      />

      {/* 3. Main Views (Split Screen Support) */}
      <main className="flex-1 flex flex-col relative no-drag">
        {/* Top Hint */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-black/40 backdrop-blur-md border border-white/10 rounded-full px-4 py-1.5 flex items-center gap-2 pointer-events-none text-xs text-zinc-400 shadow-xl">
          Press <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-white font-mono text-[10px]">Ctrl</kbd> + <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-white font-mono text-[10px]">K</kbd> to command
        </div>

        <div className="flex-1 flex w-full h-full">
          {/* Primary View */}
          <iframe
            src={currentUrl}
            className="flex-1 h-full border-none bg-white"
            title="Primary View"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />

          {/* Secondary View (Split Screen) */}
          {isSplitScreen && (
            <iframe
              src="https://nextjs.org/docs"
              className="flex-1 h-full border-none border-l-2 border-white/10 bg-white"
              title="Dev View"
            />
          )}
        </div>

        {/* 4. Dev Integrated Terminal (Slide up) */}
        {isTerminalOpen && (
          <div className="h-64 bg-[#0a0a0c] border-t border-white/10 p-4 font-mono text-sm overflow-y-auto shadow-[0_-10px_30px_rgba(0,0,0,0.5)] z-20">
            <div className="flex justify-between items-center mb-2 text-zinc-500 border-b border-white/5 pb-2">
              <span className="flex items-center gap-2"><Terminal size={14} /> Integrated Terminal</span>
              <button onClick={() => setIsTerminalOpen(false)} className="hover:text-white">✕</button>
            </div>
            <div className="text-green-400">root@aura-nexus:~$ <span className="text-zinc-300">cargo run --release</span></div>
            <div className="text-zinc-400 mt-1">Compiling aura-nexus v0.1.0...</div>
            <div className="text-zinc-400">Finished release [optimized] target(s) in 2.34s</div>
            <div className="text-green-400 mt-2">root@aura-nexus:~$ <span className="animate-pulse">_</span></div>
          </div>
        )}
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .drag-region { -webkit-app-region: drag; }
        .no-drag { -webkit-app-region: no-drag; }
      `}} />
    </div>
  );
}
