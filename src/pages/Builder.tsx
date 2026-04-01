import { useState, useCallback } from "react";
import { ArrowLeft, Settings, FolderOpen, X, Sparkles, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FileExplorer, FileNode } from "@/components/builder/FileExplorer";
import { CodeEditor } from "@/components/builder/CodeEditor";
import { LivePreview } from "@/components/builder/LivePreview";
import { BuilderChat } from "@/components/builder/BuilderChat";
import { BuilderSettings } from "@/components/builder/BuilderSettings";

const DEFAULT_FILES: FileNode[] = [
  {
    name: "src",
    type: "folder",
    children: [
      {
        name: "App.tsx",
        type: "file",
        language: "tsx",
        content: `import React from 'react';
import { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="app">
      <header>
        <h1>🚀 Welcome to Rock Assistant Builder</h1>
        <p>Start building your next great project</p>
      </header>

      <main>
        <div className="counter-card">
          <h2>Interactive Counter</h2>
          <p className="count">{count}</p>
          <div className="button-group">
            <button onClick={() => setCount(c => c - 1)}>−</button>
            <button onClick={() => setCount(0)}>Reset</button>
            <button onClick={() => setCount(c => c + 1)}>+</button>
          </div>
        </div>

        <div className="features">
          <div className="feature-card">
            <span className="emoji">⚡</span>
            <h3>Fast Development</h3>
            <p>Build and preview in real-time</p>
          </div>
          <div className="feature-card">
            <span className="emoji">🤖</span>
            <h3>AI Powered</h3>
            <p>Get intelligent code suggestions</p>
          </div>
          <div className="feature-card">
            <span className="emoji">🎨</span>
            <h3>Beautiful Design</h3>
            <p>Modern UI out of the box</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;`,
      },
      {
        name: "index.css",
        type: "file",
        language: "css",
        content: `* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: 'Inter', system-ui, sans-serif;
  background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%);
  color: #e2e8f0;
  min-height: 100vh;
}
.app { max-width: 900px; margin: 0 auto; padding: 40px 20px; }
header { text-align: center; margin-bottom: 48px; }
header h1 {
  font-size: 2.5rem; font-weight: 800;
  background: linear-gradient(135deg, #60a5fa, #a78bfa);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
}
header p { color: #94a3b8; font-size: 1.1rem; }
.counter-card {
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
  border-radius: 16px; padding: 32px; text-align: center; margin-bottom: 40px;
}
.count { font-size: 4rem; font-weight: 800; color: #60a5fa; margin: 16px 0; }
.button-group { display: flex; gap: 12px; justify-content: center; }
.button-group button {
  background: linear-gradient(135deg, #3b82f6, #6366f1); color: white; border: none;
  padding: 10px 24px; border-radius: 8px; font-weight: 600; cursor: pointer;
}
.features { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.feature-card {
  background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
  border-radius: 12px; padding: 24px; text-align: center;
}
.emoji { font-size: 2rem; display: block; margin-bottom: 12px; }`,
      },
      {
        name: "utils.ts",
        type: "file",
        language: "typescript",
        content: `export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(date);
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export function debounce<T extends (...args: any[]) => void>(fn: T, delay: number): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: any[]) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); }) as T;
}`,
      },
    ],
  },
  {
    name: "public",
    type: "folder",
    children: [
      {
        name: "index.html",
        type: "file",
        language: "html",
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Rock Assistant Builder</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/App.tsx"></script>
</body>
</html>`,
      },
    ],
  },
  {
    name: "package.json",
    type: "file",
    language: "json",
    content: `{
  "name": "my-project",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  }
}`,
  },
];

function getFileContent(files: FileNode[], path: string): { content: string; language: string } | null {
  const parts = path.split("/");
  let current: FileNode[] = files;
  for (let i = 0; i < parts.length; i++) {
    const node = current.find((f) => f.name === parts[i]);
    if (!node) return null;
    if (i === parts.length - 1 && node.type === "file") {
      return { content: node.content || "", language: node.language || "text" };
    }
    if (node.children) current = node.children;
  }
  return null;
}

function updateFileContent(files: FileNode[], path: string, content: string): FileNode[] {
  const parts = path.split("/");
  function update(nodes: FileNode[], idx: number): FileNode[] {
    return nodes.map((node) => {
      if (node.name !== parts[idx]) return node;
      if (idx === parts.length - 1) return { ...node, content };
      if (node.children) return { ...node, children: update(node.children, idx + 1) };
      return node;
    });
  }
  return update(files, 0);
}

const Builder = () => {
  const [files, setFiles] = useState<FileNode[]>(DEFAULT_FILES);
  const [activeFile, setActiveFile] = useState<string | null>("src/App.tsx");
  const [showFiles, setShowFiles] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [language, setLanguage] = useState("tsx");
  const [fontSize, setFontSize] = useState(13);
  const [theme, setTheme] = useState("dark");

  const activeFileData = activeFile ? getFileContent(files, activeFile) : null;

  const handleCodeChange = useCallback(
    (code: string) => {
      if (!activeFile) return;
      setFiles((prev) => updateFileContent(prev, activeFile, code));
    },
    [activeFile]
  );

  const handleInsertCode = useCallback(
    (code: string) => {
      if (!activeFile || !activeFileData) return;
      setFiles((prev) => updateFileContent(prev, activeFile, activeFileData.content + "\n\n" + code));
    },
    [activeFile, activeFileData]
  );

  const handleCreateFile = () => {
    const name = prompt("Enter file name (e.g. component.tsx):");
    if (!name) return;
    const ext = name.split(".").pop() || "text";
    const langMap: Record<string, string> = {
      ts: "typescript", tsx: "tsx", js: "javascript", jsx: "jsx",
      css: "css", html: "html", json: "json", py: "python", md: "markdown",
    };
    setFiles((prev) => {
      const src = prev.find((f) => f.name === "src");
      if (src && src.children) {
        return prev.map((f) =>
          f.name === "src"
            ? { ...f, children: [...f.children!, { name, type: "file" as const, language: langMap[ext] || ext, content: `// ${name}\n` }] }
            : f
        );
      }
      return [...prev, { name, type: "file", language: langMap[ext] || ext, content: `// ${name}\n` }];
    });
  };

  const handleDeleteFile = (path: string) => {
    if (!confirm(`Delete ${path}?`)) return;
    const parts = path.split("/");
    function remove(nodes: FileNode[], idx: number): FileNode[] {
      if (idx === parts.length - 1) return nodes.filter((n) => n.name !== parts[idx]);
      return nodes.map((n) => {
        if (n.name === parts[idx] && n.children) return { ...n, children: remove(n.children, idx + 1) };
        return n;
      });
    }
    setFiles((prev) => remove(prev, 0));
    if (activeFile === path) setActiveFile(null);
  };

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* ===== LEFT SIDE: AI Chat ===== */}
      <div className="w-[380px] min-w-[320px] shrink-0 flex flex-col border-r border-border bg-sidebar">
        {/* Chat Header */}
        <div className="h-12 flex items-center px-4 gap-3 border-b border-sidebar-border bg-sidebar">
          <Link
            to="/"
            className="p-1.5 rounded-lg hover:bg-sidebar-accent text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={16} />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
              <Sparkles size={14} className="text-primary" />
            </div>
            <div>
              <span className="text-sm font-bold gradient-text">Rock Assistant Builder</span>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-[9px] text-muted-foreground">AI Online</span>
              </div>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <button
              onClick={() => setSettingsOpen(true)}
              className="p-1.5 rounded-lg hover:bg-sidebar-accent text-muted-foreground hover:text-foreground transition-colors"
            >
              <Settings size={15} />
            </button>
          </div>
        </div>

        {/* Chat Body */}
        <div className="flex-1 min-h-0">
          <BuilderChat onInsertCode={handleInsertCode} />
        </div>

        {/* See Files Button */}
        <div className="p-3 border-t border-sidebar-border">
          <button
            onClick={() => setShowFiles(!showFiles)}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              showFiles
                ? "bg-primary text-primary-foreground glow-primary"
                : "bg-secondary border border-border text-foreground hover:bg-secondary/80"
            }`}
          >
            <FolderOpen size={16} />
            {showFiles ? "Hide Files" : "See Files"}
          </button>
        </div>
      </div>

      {/* ===== RIGHT SIDE: Live Preview ===== */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Preview Header */}
        <div className="h-12 border-b border-border flex items-center px-4 gap-3 bg-background shrink-0">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-primary" />
            <span className="text-sm font-semibold text-foreground">Live Preview</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[10px] text-green-400 font-medium">Live</span>
            </div>
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 min-h-0">
          <LivePreview
            code={activeFileData?.content || ""}
            language={activeFileData?.language || "text"}
          />
        </div>
      </div>

      {/* ===== FILES OVERLAY ===== */}
      <AnimatePresence>
        {showFiles && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40"
              onClick={() => setShowFiles(false)}
            />

            {/* Files Panel */}
            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 h-[70vh] bg-card border-t border-border rounded-t-2xl shadow-2xl flex overflow-hidden"
            >
              {/* Close bar */}
              <div className="absolute top-0 left-0 right-0 flex justify-center pt-2 z-10">
                <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
              </div>

              {/* File Explorer */}
              <div className="w-[220px] border-r border-border bg-sidebar shrink-0 pt-6">
                <div className="flex items-center justify-between px-3 mb-2">
                  <span className="text-xs font-bold gradient-text">Files</span>
                  <button
                    onClick={() => setShowFiles(false)}
                    className="p-1 rounded-md hover:bg-sidebar-accent text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
                <FileExplorer
                  files={files}
                  activeFile={activeFile}
                  onSelectFile={(path) => setActiveFile(path)}
                  onCreateFile={handleCreateFile}
                  onDeleteFile={handleDeleteFile}
                />
              </div>

              {/* Code Editor */}
              <div className="flex-1 pt-6">
                {activeFileData ? (
                  <CodeEditor
                    code={activeFileData.content}
                    language={activeFileData.language}
                    fileName={activeFile!.split("/").pop() || ""}
                    onChange={handleCodeChange}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center gap-3">
                    <FolderOpen size={32} className="text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">Select a file to edit</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <BuilderSettings
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        language={language}
        onLanguageChange={setLanguage}
        fontSize={fontSize}
        onFontSizeChange={setFontSize}
        theme={theme}
        onThemeChange={setTheme}
      />
    </div>
  );
};

export default Builder;
