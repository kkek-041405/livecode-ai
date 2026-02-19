// Edited: wired to backend API (placeholder change)
import { useState } from "react";
import { Terminal, FileInput, FileOutput, AlertTriangle, Trash2 } from "lucide-react";

type ConsoleTab = "input" | "output" | "logs";

interface ConsolePanelProps {
  input: string;
  output: string;
  logs: string[];
  isRunning: boolean;
  onInputChange: (value: string) => void;
  onClearOutput: () => void;
  executionInfo?: {
    time?: string;
    memory?: string;
    status?: "success" | "error" | "running" | "idle";
  };
}

const ConsolePanel = ({
  input,
  output,
  logs,
  isRunning,
  onInputChange,
  onClearOutput,
  executionInfo,
}: ConsolePanelProps) => {
  const [activeTab, setActiveTab] = useState<ConsoleTab>("output");

  const tabs: { id: ConsoleTab; label: string; icon: React.ReactNode }[] = [
    { id: "input", label: "Input", icon: <FileInput className="w-3.5 h-3.5" /> },
    { id: "output", label: "Output", icon: <FileOutput className="w-3.5 h-3.5" /> },
    { id: "logs", label: "Logs", icon: <Terminal className="w-3.5 h-3.5" /> },
  ];

  const statusColor = {
    success: "text-success",
    error: "text-destructive",
    running: "text-running",
    idle: "text-muted-foreground",
  };

  return (
    <div className="h-full flex flex-col bg-console-bg">
      {/* Tab bar */}
      <div className="flex items-center h-9 bg-panel-header border-b border-border px-2">
        <div className="flex gap-0.5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                activeTab === tab.id
                  ? "bg-console-bg text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.id === "logs" && logs.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-primary/20 text-primary text-[10px] rounded-full">
                  {logs.length}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {/* Execution info */}
        {executionInfo && (
          <div className="flex items-center gap-3 mr-3">
            {isRunning && (
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-running animate-pulse" />
                <span className="text-[10px] text-running font-mono">Running...</span>
              </div>
            )}
            {executionInfo.time && (
              <span className="text-[10px] text-muted-foreground font-mono">
                ⏱ {executionInfo.time}
              </span>
            )}
            {executionInfo.memory && (
              <span className="text-[10px] text-muted-foreground font-mono">
                💾 {executionInfo.memory}
              </span>
            )}
            {executionInfo.status && (
              <span className={`text-[10px] font-mono font-medium ${statusColor[executionInfo.status]}`}>
                {executionInfo.status === "success" ? "✓ Done" : executionInfo.status === "error" ? "✗ Error" : ""}
              </span>
            )}
          </div>
        )}

        <button
          onClick={onClearOutput}
          className="p-1 text-muted-foreground hover:text-foreground transition-colors rounded"
          title="Clear"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-auto">
        {activeTab === "input" && (
          <textarea
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder="Enter stdin input here..."
            className="w-full h-full bg-transparent text-foreground font-mono text-sm p-3 resize-none focus:outline-none placeholder:text-muted-foreground/50"
            spellCheck={false}
          />
        )}

        {activeTab === "output" && (
          <div className="p-3 font-mono text-sm whitespace-pre-wrap">
            {output ? (
              <span className={executionInfo?.status === "error" ? "text-destructive" : "text-foreground"}>
                {output}
              </span>
            ) : (
              <span className="text-muted-foreground/50 italic">
                Run your code to see output here...
              </span>
            )}
          </div>
        )}

        {activeTab === "logs" && (
          <div className="p-3 space-y-1">
            {logs.length > 0 ? (
              logs.map((log, i) => (
                <div key={i} className="flex items-start gap-2 text-xs font-mono animate-slide-up">
                  <span className="text-muted-foreground shrink-0">[{String(i + 1).padStart(2, "0")}]</span>
                  <span className="text-foreground">{log}</span>
                </div>
              ))
            ) : (
              <span className="text-muted-foreground/50 text-sm italic">No logs yet...</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsolePanel;
