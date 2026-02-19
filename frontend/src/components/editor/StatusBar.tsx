import { Wifi, GitBranch, Check } from "lucide-react";
import { Language, getLanguageById } from "@/constants/boilerplates";

interface StatusBarProps {
  language: Language;
  cursorLine: number;
  cursorCol: number;
  collaborators: number;
}

const StatusBar = ({ language, cursorLine, cursorCol, collaborators }: StatusBarProps) => {
  const lang = getLanguageById(language);

  return (
    <div className="flex items-center justify-between h-6 px-3 bg-primary text-primary-foreground text-[11px] font-mono select-none">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <GitBranch className="w-3 h-3" />
          <span>main</span>
        </div>
        <div className="flex items-center gap-1">
          <Check className="w-3 h-3" />
          <span>0 problems</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span>
          Ln {cursorLine}, Col {cursorCol}
        </span>
        <span>Spaces: {lang.id === "python" ? 4 : 2}</span>
        <span>{lang.label}</span>
        {collaborators > 0 && (
          <div className="flex items-center gap-1">
            <Wifi className="w-3 h-3" />
            <span>{collaborators} online</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatusBar;
