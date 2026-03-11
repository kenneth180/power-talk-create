import { useState, useCallback } from "react";
import { ArrowLeft, Settings, Play, PanelLeftClose, PanelLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
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
        <h1>🚀 Welcome to PowerChat Builder</h1>
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
        content: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', system-ui, sans-serif;
  background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%);
  color: #e2e8f0;
  min-height: 100vh;
}

.app {
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 20px;
}

header {
  text-align: center;
  margin-bottom: 48px;
}

header h1 {
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #60a5fa, #a78bfa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 8px;
}

header p {
  color: #94a3b8;
  font-size: 1.1rem;
}

.counter-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 32px;
  text-align: center;
  margin-bottom: 40px;
}

.counter-card h2 {
  font-size: 1.25rem;
  margin-bottom: 16px;
  color: #f1f5f9;
}

.count {
  font-size: 4rem;
  font-weight: 800;
  color: #60a5fa;
  margin: 16px 0;
}

.button-group {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.button-group button {
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.15s, opacity 0.15s;
}

.button-group button:hover {
  transform: scale(1.05);
  opacity: 0.9;
}

.features {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.feature-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 24px;
  text-align: center;
}

.emoji {
  font-size: 2rem;
  display: block;
  margin-bottom: 12px;
}

.feature-card h3 {
  font-size: 0.95rem;
  margin-bottom: 6px;
  color: #f1f5f9;
}

.feature-card p {
  font-size: 0.8rem;
  color: #94a3b8;
}`,
      },
      {
        name: "utils.ts",
        type: "file",
        language: "typescript",
        content: `// Utility functions for PowerChat Builder

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay: number
): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  }) as T;
}

export function classNames(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
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
  <title>PowerChat Builder</title>
  <link rel="stylesheet" href="/src/index.css" />
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
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [language, setLanguage] = useState("tsx");
  const [fontSize, setFontSize] = useState(13);
  const [theme, setTheme] = useState("dark");
  const [showPreview, setShowPreview] = useState(true);

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
            ? {
                ...f,
                children: [
                  ...f.children!,
                  { name, type: "file" as const, language: langMap[ext] || ext, content: `// ${name}\n` },
                ],
              }
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
        if (n.name === parts[idx] && n.children) {
          return { ...n, children: remove(n.children, idx + 1) };
        }
        return n;
      });
    }
    setFiles((prev) => remove(prev, 0));
    if (activeFile === path) setActiveFile(null);
  };

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* File Sidebar */}
      {sidebarOpen && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 240, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          className="h-full bg-sidebar border-r border-sidebar-border shrink-0 flex flex-col"
        >
          {/* Sidebar header */}
          <div className="h-10 flex items-center px-3 gap-2 border-b border-sidebar-border">
            <Link
              to="/"
              className="p-1 rounded hover:bg-sidebar-accent text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={14} />
            </Link>
            <span className="text-xs font-bold gradient-text">Builder</span>
            <div className="ml-auto flex items-center gap-1">
              <button
                onClick={() => setSettingsOpen(true)}
                className="p-1 rounded hover:bg-sidebar-accent text-muted-foreground hover:text-foreground transition-colors"
              >
                <Settings size={14} />
              </button>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 rounded hover:bg-sidebar-accent text-muted-foreground hover:text-foreground transition-colors"
              >
                <PanelLeftClose size={14} />
              </button>
            </div>
          </div>
          <FileExplorer
            files={files}
            activeFile={activeFile}
            onSelectFile={setActiveFile}
            onCreateFile={handleCreateFile}
            onDeleteFile={handleDeleteFile}
          />
        </motion.div>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="h-10 border-b border-border flex items-center px-3 gap-2 bg-background shrink-0">
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            >
              <PanelLeft size={16} />
            </button>
          )}
          <span className="text-xs text-muted-foreground">
            {activeFile || "No file selected"}
          </span>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                showPreview
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Play size={12} />
              Preview
            </button>
          </div>
        </div>

        {/* Editor + Preview + Chat */}
        <div className="flex-1 flex min-h-0">
          {/* Code Editor */}
          <div className={`flex-1 min-w-0 ${showPreview ? "border-r border-border" : ""}`}>
            {activeFileData ? (
              <CodeEditor
                code={activeFileData.content}
                language={activeFileData.language}
                fileName={activeFile!.split("/").pop() || ""}
                onChange={handleCodeChange}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-secondary/50 flex items-center justify-center">
                  <Settings size={28} className="text-muted-foreground/50" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Select a file to start editing</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    Use the file explorer or create a new file
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Live Preview */}
          {showPreview && (
            <div className="w-[45%] min-w-[300px] border-r border-border">
              <LivePreview
                code={activeFileData?.content || ""}
                language={activeFileData?.language || "text"}
              />
            </div>
          )}

          {/* AI Chat Panel */}
          <div className="w-[300px] min-w-[250px] shrink-0">
            <BuilderChat onInsertCode={handleInsertCode} />
          </div>
        </div>
      </div>

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
