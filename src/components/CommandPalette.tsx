"use client";

import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { Search, Monitor, ShieldAlert, Sparkles, TerminalSquare, Terminal as TerminalIcon } from "lucide-react";
import { verifyGodMode, isAdminOrOwner, UserProfile } from "../lib/god_mode";

export function CommandPalette({ onOpenUrl, onSplitScreen, onToggleTerminal }: { onOpenUrl: (url: string) => void, onSplitScreen: () => void, onToggleTerminal: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [adminKey, setAdminKey] = useState("");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleAction = async (action: string) => {
    setIsOpen(false);
    if (action === "game_mode") {
      const res = await invoke("toggle_game_mode");
      alert(res);
    } else if (action === "dev_mode") {
      onSplitScreen();
    } else if (action === "terminal") {
      onToggleTerminal();
    } else if (action === "premium") {
      // Имитация бэкенда для God Mode
      const profile = verifyGodMode("guest@local", adminKey);
      setUserProfile(profile);
      if (isAdminOrOwner(profile)) {
        alert("Grandmaster Owner Status Unlocked! Full premium access granted.");
      } else {
        alert("Invalid Secret Key");
      }
    } else if (action.startsWith("url:")) {
      onOpenUrl(action.replace("url:", ""));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center items-start pt-32 no-drag">
      <div className="bg-[#1c1f26] w-full max-w-2xl rounded-xl border border-white/10 shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center px-4 py-3 border-b border-white/5">
          <Search size={20} className="text-gray-400 mr-3" />
          <input
            autoFocus
            type="text"
            className="w-full bg-transparent outline-none text-lg text-white placeholder-gray-500"
            placeholder="Type a command, URL, or search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        
        <div className="p-2 flex flex-col gap-1">
          <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">Features</div>
          
          <button onClick={() => handleAction("game_mode")} className="flex items-center w-full px-4 py-3 text-left hover:bg-white/5 rounded-lg text-gray-300 transition-colors">
            <Monitor size={18} className="mr-3 text-blue-400" />
            <div className="flex-1">
              <div className="text-sm font-medium">Toggle Game Mode</div>
              <div className="text-xs text-gray-500">Free RAM and boost CPU priority (Rust System API)</div>
            </div>
          </button>
          
          <button onClick={() => handleAction("dev_mode")} className="flex items-center w-full px-4 py-3 text-left hover:bg-white/5 rounded-lg text-gray-300 transition-colors">
            <TerminalSquare size={18} className="mr-3 text-green-400" />
            <div className="flex-1">
              <div className="text-sm font-medium">Split-Screen (Dev Mode)</div>
              <div className="text-xs text-gray-500">Open side-by-side browser views</div>
            </div>
          </button>

          <button onClick={() => handleAction("terminal")} className="flex items-center w-full px-4 py-3 text-left hover:bg-white/5 rounded-lg text-gray-300 transition-colors">
            <TerminalIcon size={18} className="mr-3 text-purple-400" />
            <div className="flex-1">
              <div className="text-sm font-medium">Integrated Terminal</div>
              <div className="text-xs text-gray-500">Open system developer terminal</div>
            </div>
          </button>
          
          <div className="px-3 py-1 mt-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Admin / God Mode</div>
          <div className="flex items-center w-full px-4 py-2 hover:bg-white/5 rounded-lg text-gray-300 transition-colors">
            <ShieldAlert size={18} className="mr-3 text-red-400" />
            <input 
              type="password" 
              placeholder="Enter Premium Key"
              className="flex-1 bg-black/20 border border-white/10 rounded px-3 py-1 text-sm text-white outline-none focus:border-red-500"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAction("premium")}
            />
            {userProfile?.isPremium && <Sparkles size={18} className="ml-3 text-yellow-400" />}
          </div>
        </div>
      </div>
    </div>
  );
}
