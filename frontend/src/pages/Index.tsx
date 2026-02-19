import { useState, useCallback } from "react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import Navbar from "@/components/editor/Navbar";
import EditorPanel from "@/components/editor/EditorPanel";
import ConsolePanel from "@/components/editor/ConsolePanel";
import AIAssistantPanel from "@/components/editor/AIAssistantPanel";
import StatusBar from "@/components/editor/StatusBar";
import { Language, getLanguageById } from "@/constants/boilerplates";
import { toast } from "sonner";
import { API_BASE } from "@/lib/api";

const Index = () => {
  const [language, setLanguage] = useState<Language>("python");
  const [code, setCode] = useState(getLanguageById("python").boilerplate);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [logs, setLogs] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(true);
  const [executionInfo, setExecutionInfo] = useState<{
    time?: string;
    memory?: string;
    status?: "success" | "error" | "running" | "idle";
  }>({ status: "idle" });

  const handleLanguageChange = useCallback(
    (lang: Language) => {
      setLanguage(lang);
      setCode(getLanguageById(lang).boilerplate);
      setOutput("");
      setLogs([]);
      setExecutionInfo({ status: "idle" });
      toast.success(`Switched to ${getLanguageById(lang).label}`);
    },
    []
  );

  const handleRun = useCallback(async () => {
    setIsRunning(true);
    setOutput("");
    setExecutionInfo({ status: "running" });
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] Executing ${getLanguageById(language).label} code...`]);

    try {
      const res = await fetch(`${API_BASE}/api/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, code, input }),
      });

      if (!res.ok) throw new Error("Execution failed");
      const data = await res.json();

      setOutput(data.output);
      setExecutionInfo({ time: data.time, memory: data.memory, status: data.status });
      setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] Execution completed successfully.`]);
    } catch (err: any) {
      setOutput(String(err?.message || "Execution error"));
      setExecutionInfo({ status: "error" });
      setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] Execution failed: ${err?.message || "unknown"}`]);
      toast.error("Execution failed — backend unavailable or returned an error");
    } finally {
      setIsRunning(false);
    }
  }, [language, code, input]);

  const handleStop = useCallback(() => {
    setIsRunning(false);
    setExecutionInfo({ status: "idle" });
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] Execution stopped by user.`]);
    toast.info("Execution stopped");
  }, []);

  const handleSave = useCallback(() => {
    toast.success("Project saved successfully");
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] Project saved.`]);
  }, []);

  const handleShare = useCallback(() => {
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    navigator.clipboard.writeText(`livecode.plus/room/${roomId}`);
    toast.success(`Room ID copied: ${roomId}`, {
      description: "Share this link for real-time collaboration",
    });
  }, []);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Navbar
        language={language}
        onLanguageChange={handleLanguageChange}
        onRun={handleRun}
        onStop={handleStop}
        onSave={handleSave}
        onShare={handleShare}
        onToggleAI={() => setIsAIOpen(!isAIOpen)}
        isRunning={isRunning}
        isAIOpen={isAIOpen}
        collaborators={0}
      />

      <div className="flex-1 min-h-0">
        <ResizablePanelGroup direction="horizontal">
          {/* Editor + Console */}
          <ResizablePanel defaultSize={isAIOpen ? 70 : 100} minSize={40}>
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel defaultSize={65} minSize={30}>
                <EditorPanel code={code} language={language} onChange={setCode} />
              </ResizablePanel>
              <ResizableHandle />
              <ResizablePanel defaultSize={35} minSize={15}>
                <ConsolePanel
                  input={input}
                  output={output}
                  logs={logs}
                  isRunning={isRunning}
                  onInputChange={setInput}
                  onClearOutput={() => {
                    setOutput("");
                    setLogs([]);
                    setExecutionInfo({ status: "idle" });
                  }}
                  executionInfo={executionInfo}
                />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>

          {/* AI Panel */}
          {isAIOpen && (
            <>
              <ResizableHandle />
              <ResizablePanel defaultSize={30} minSize={20} maxSize={45}>
                <AIAssistantPanel
                  isOpen={isAIOpen}
                  onClose={() => setIsAIOpen(false)}
                  currentCode={code}
                  language={getLanguageById(language).label}
                />
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>

      <StatusBar language={language} cursorLine={1} cursorCol={1} collaborators={0} />
    </div>
  );
};

export default Index;
