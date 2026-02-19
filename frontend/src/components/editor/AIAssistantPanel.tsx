import { useState, useRef, useEffect, useCallback } from "react";
import { Sparkles, Send, X, Code, Bug, Zap, MessageSquare, Lightbulb, Copy, Check, Trash2 } from "lucide-react";
import { API_BASE } from "@/lib/api";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AIAssistantPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentCode: string;
  language: string;
}

const quickActions = [
  { icon: <Code className="w-3.5 h-3.5" />, label: "Explain Code", prompt: "Explain the current code in detail." },
  { icon: <Bug className="w-3.5 h-3.5" />, label: "Find Bugs", prompt: "Analyze the code for potential bugs and issues." },
  { icon: <Zap className="w-3.5 h-3.5" />, label: "Optimize", prompt: "Suggest optimizations for time and space complexity." },
  { icon: <Lightbulb className="w-3.5 h-3.5" />, label: "Suggest Tests", prompt: "Suggest test cases for this code." },
];

/** Render markdown to HTML with code block support */
function renderMarkdown(text: string): string {
  // Escape HTML first
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Code blocks: ```lang\ncode\n```
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_match, lang, code) => {
    const langLabel = lang ? `<span class="code-block-lang">${lang}</span>` : "";
    return `<div class="code-block-wrapper">${langLabel}<pre class="code-block"><code>${code.trim()}</code></pre></div>`;
  });

  // Inline code: `code`
  html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

  // Bold: **text**
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  // Italic: *text*
  html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");

  // Bullet lists: • or - at line start
  html = html.replace(/^[•\-]\s+(.+)$/gm, '<li class="ml-3">$1</li>');

  // Numbered lists: 1. text
  html = html.replace(/^\d+\.\s+(.+)$/gm, '<li class="ml-3 list-decimal">$1</li>');

  return html;
}

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="absolute top-1.5 right-1.5 p-1 rounded bg-background/50 hover:bg-background/80 text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
      title="Copy code"
    >
      {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
    </button>
  );
};

const MessageBubble = ({ msg }: { msg: Message }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (msg.role !== "assistant" || !containerRef.current) return;

    // Add copy buttons to code blocks after render
    const codeBlocks = containerRef.current.querySelectorAll(".code-block-wrapper");
    codeBlocks.forEach((wrapper) => {
      wrapper.classList.add("group", "relative");
    });
  }, [msg]);

  if (msg.role === "user") {
    return (
      <div className="flex justify-end animate-slide-up">
        <div className="max-w-[90%] rounded-lg px-3 py-2 text-xs leading-relaxed bg-primary text-primary-foreground">
          <div className="whitespace-pre-wrap">{msg.content}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start animate-slide-up">
      <div
        ref={containerRef}
        className="max-w-[95%] rounded-lg px-3 py-2 text-xs leading-relaxed bg-secondary text-secondary-foreground ai-message"
      >
        <div
          className="whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
        />
      </div>
    </div>
  );
};

const AIAssistantPanel = ({ isOpen, onClose, currentCode, language }: AIAssistantPanelProps) => {
  const initialMessage: Message = {
    role: "assistant",
    content:
      "Hi! I'm your AI coding assistant powered by **Gemini**. I can see your code and help you with:\n\n- **Explaining** code logic\n- **Finding bugs** and issues\n- **Optimizing** performance\n- **Suggesting** test cases\n\nHow can I help?",
  };

  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const clearChat = useCallback(() => {
    setMessages([initialMessage]);
  }, []);

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading) return;

    const userMsg: Message = { role: "user", content: messageText };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      // Build history from previous messages (skip the initial greeting)
      const history = updatedMessages
        .slice(1) // skip initial assistant greeting
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch(`${API_BASE}/api/ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageText,
          currentCode,
          language,
          history: history.slice(0, -1), // send all except the current message (backend adds it)
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Request failed (${res.status})`);
      }
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `**Error:** ${err?.message || "AI service unavailable"}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="h-full flex flex-col bg-card border-l border-border">
      {/* Header */}
      <div className="flex items-center justify-between h-9 px-3 bg-panel-header border-b border-border">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-semibold text-foreground">AI Assistant</span>
          <span className="px-1.5 py-0.5 bg-primary/20 text-primary text-[9px] rounded font-mono">GEMINI</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={clearChat}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors rounded"
            title="Clear chat"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground transition-colors rounded">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex gap-1.5 p-2 border-b border-border overflow-x-auto">
        {quickActions.map((action) => (
          <button
            key={action.label}
            onClick={() => handleSend(action.prompt)}
            disabled={isLoading}
            className="flex items-center gap-1 px-2 py-1 bg-secondary text-secondary-foreground text-[10px] font-medium rounded-md hover:bg-muted transition-colors whitespace-nowrap disabled:opacity-50"
          >
            {action.icon}
            {action.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
        {messages.map((msg, i) => (
          <MessageBubble key={i} msg={msg} />
        ))}

        {isLoading && (
          <div className="flex justify-start animate-slide-up">
            <div className="bg-secondary rounded-lg px-3 py-2 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: "0.2s" }} />
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: "0.4s" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-2 border-t border-border">
        <div className="flex items-center gap-2 bg-secondary rounded-lg px-3 py-1.5">
          <MessageSquare className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Ask about your code..."
            className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
            disabled={isLoading}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="p-1 text-primary hover:text-primary/80 disabled:text-muted-foreground/30 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantPanel;
