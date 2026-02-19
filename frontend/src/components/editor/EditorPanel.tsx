import Editor, { OnMount } from "@monaco-editor/react";
import { Language, getLanguageById } from "@/constants/boilerplates";
import { useRef, useCallback } from "react";

interface EditorPanelProps {
  code: string;
  language: Language;
  onChange: (value: string) => void;
}

const EditorPanel = ({ code, language, onChange }: EditorPanelProps) => {
  const editorRef = useRef<any>(null);
  const langConfig = getLanguageById(language);

  const handleMount: OnMount = useCallback((editor, monaco) => {
    editorRef.current = editor;

    // Define custom theme
    monaco.editor.defineTheme("livecodeplus", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "6a737d", fontStyle: "italic" },
        { token: "keyword", foreground: "56d4dd" },
        { token: "string", foreground: "a8d4a0" },
        { token: "number", foreground: "d4a056" },
        { token: "type", foreground: "c49cde" },
        { token: "function", foreground: "dcdcaa" },
        { token: "variable", foreground: "9cdcfe" },
      ],
      colors: {
        "editor.background": "#181c24",
        "editor.foreground": "#d4d8e0",
        "editorLineNumber.foreground": "#4a5060",
        "editorLineNumber.activeForeground": "#56d4dd",
        "editor.lineHighlightBackground": "#1e2230",
        "editor.selectionBackground": "#56d4dd30",
        "editorCursor.foreground": "#56d4dd",
        "editor.inactiveSelectionBackground": "#56d4dd15",
        "editorIndentGuide.background": "#2a2e3a",
        "editorIndentGuide.activeBackground": "#3a3e4a",
      },
    });

    monaco.editor.setTheme("livecodeplus");
    editor.focus();
  }, []);

  return (
    <div className="h-full flex flex-col bg-editor-bg">
      {/* Tab bar */}
      <div className="flex items-center h-9 bg-panel-header border-b border-border px-2 gap-1">
        <div className="flex items-center gap-1.5 px-3 py-1 bg-editor-bg rounded-t-md border-t-2 border-t-tab-active text-xs">
          <span>{langConfig.icon}</span>
          <span className="text-foreground font-medium">main.{langConfig.id === 'python' ? 'py' : langConfig.id === 'javascript' ? 'js' : langConfig.id === 'java' ? 'java' : langConfig.id === 'cpp' ? 'cpp' : 'c'}</span>
        </div>
        <div className="flex-1" />
        <span className="text-[10px] text-muted-foreground font-mono">
          UTF-8 • {langConfig.label}
        </span>
      </div>

      {/* Editor */}
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          language={langConfig.monacoLang}
          value={code}
          onChange={(v) => onChange(v || "")}
          onMount={handleMount}
          theme="livecodeplus"
          options={{
            fontSize: 14,
            fontFamily: "var(--font-mono)",
            fontLigatures: true,
            lineNumbers: "on",
            minimap: { enabled: true, scale: 1 },
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            renderLineHighlight: "all",
            bracketPairColorization: { enabled: true },
            padding: { top: 12 },
            suggest: {
              showMethods: true,
              showFunctions: true,
              showVariables: true,
            },
            wordWrap: "on",
            tabSize: langConfig.id === 'python' ? 4 : 2,
          }}
          loading={
            <div className="flex items-center justify-center h-full bg-editor-bg">
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">Loading editor...</span>
              </div>
            </div>
          }
        />
      </div>
    </div>
  );
};

export default EditorPanel;
