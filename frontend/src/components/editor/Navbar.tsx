import { Play, Square, Save, Share2, Users, Sparkles, Settings, FolderOpen } from "lucide-react";
import { Language, languages, getLanguageById } from "@/constants/boilerplates";

interface NavbarProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onRun: () => void;
  onStop: () => void;
  onSave: () => void;
  onShare: () => void;
  onToggleAI: () => void;
  isRunning: boolean;
  isAIOpen: boolean;
  collaborators?: number;
}

const Navbar = ({
  language,
  onLanguageChange,
  onRun,
  onStop,
  onSave,
  onShare,
  onToggleAI,
  isRunning,
  isAIOpen,
  collaborators = 0,
}: NavbarProps) => {
  const currentLang = getLanguageById(language);

  return (
    <nav className="flex items-center justify-between h-12 px-4 bg-navbar-bg border-b border-border select-none">
      {/* Left section */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm font-mono">L+</span>
          </div>
          <span className="text-foreground font-semibold text-sm tracking-tight hidden sm:inline">
            LiveCode<span className="text-primary">+</span>
          </span>
        </div>

        <div className="h-5 w-px bg-border" />

        {/* Language selector */}
        <div className="relative">
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value as Language)}
            className="appearance-none bg-secondary text-secondary-foreground text-xs font-medium px-3 py-1.5 pr-7 rounded-md border border-border cursor-pointer hover:bg-muted transition-colors focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {languages.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.icon} {lang.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground text-[10px]">
            ▼
          </div>
        </div>
      </div>

      {/* Center section - Actions */}
      <div className="flex items-center gap-1.5">
        {isRunning ? (
          <button
            onClick={onStop}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-destructive text-destructive-foreground text-xs font-medium rounded-md hover:opacity-90 transition-all"
          >
            <Square className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Stop</span>
          </button>
        ) : (
          <button
            onClick={onRun}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-success text-success-foreground text-xs font-medium rounded-md hover:opacity-90 transition-all animate-pulse-glow"
          >
            <Play className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Run</span>
          </button>
        )}

        <button
          onClick={onSave}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-secondary-foreground text-xs font-medium rounded-md hover:bg-muted transition-colors"
        >
          <Save className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Save</span>
        </button>

        <button
          onClick={onShare}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-secondary-foreground text-xs font-medium rounded-md hover:bg-muted transition-colors"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Share</span>
        </button>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
        {collaborators > 0 && (
          <div className="flex items-center gap-1 px-2 py-1 bg-secondary rounded-md">
            <Users className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs text-secondary-foreground">{collaborators}</span>
          </div>
        )}

        <button
          onClick={onToggleAI}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
            isAIOpen
              ? "bg-primary/20 text-primary border border-primary/30"
              : "bg-secondary text-secondary-foreground hover:bg-muted"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">AI</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
