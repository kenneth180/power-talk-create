import { useState } from "react";
import { ChevronRight, ChevronDown, File, Folder, Plus, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface FileNode {
  name: string;
  type: "file" | "folder";
  children?: FileNode[];
  content?: string;
  language?: string;
}

interface FileExplorerProps {
  files: FileNode[];
  activeFile: string | null;
  onSelectFile: (path: string) => void;
  onCreateFile: (path: string, type: "file" | "folder") => void;
  onDeleteFile: (path: string) => void;
}

function FileTreeItem({
  node,
  path,
  depth,
  activeFile,
  onSelectFile,
  onDeleteFile,
}: {
  node: FileNode;
  path: string;
  depth: number;
  activeFile: string | null;
  onSelectFile: (path: string) => void;
  onDeleteFile: (path: string) => void;
}) {
  const [expanded, setExpanded] = useState(depth < 2);
  const isActive = activeFile === path;
  const isFolder = node.type === "folder";

  const getFileIcon = (name: string) => {
    if (name.endsWith(".tsx") || name.endsWith(".ts")) return "text-blue-400";
    if (name.endsWith(".css")) return "text-purple-400";
    if (name.endsWith(".html")) return "text-orange-400";
    if (name.endsWith(".json")) return "text-yellow-400";
    if (name.endsWith(".py")) return "text-green-400";
    if (name.endsWith(".js") || name.endsWith(".jsx")) return "text-yellow-300";
    return "text-muted-foreground";
  };

  return (
    <div>
      <button
        onClick={() => {
          if (isFolder) setExpanded(!expanded);
          else onSelectFile(path);
        }}
        className={`w-full flex items-center gap-1.5 px-2 py-1 text-xs rounded-md transition-colors group ${
          isActive
            ? "bg-primary/15 text-primary"
            : "text-sidebar-foreground hover:bg-sidebar-accent/50"
        }`}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        {isFolder ? (
          expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />
        ) : (
          <span className="w-3" />
        )}
        {isFolder ? (
          <Folder size={14} className="text-primary/70 shrink-0" />
        ) : (
          <File size={14} className={`shrink-0 ${getFileIcon(node.name)}`} />
        )}
        <span className="truncate flex-1 text-left">{node.name}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDeleteFile(path);
          }}
          className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-destructive transition-opacity"
        >
          <Trash2 size={10} />
        </button>
      </button>

      <AnimatePresence>
        {isFolder && expanded && node.children && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            {node.children.map((child) => (
              <FileTreeItem
                key={child.name}
                node={child}
                path={`${path}/${child.name}`}
                depth={depth + 1}
                activeFile={activeFile}
                onSelectFile={onSelectFile}
                onDeleteFile={onDeleteFile}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FileExplorer({
  files,
  activeFile,
  onSelectFile,
  onCreateFile,
  onDeleteFile,
}: FileExplorerProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 flex items-center justify-between border-b border-sidebar-border">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Explorer
        </span>
        <button
          onClick={() => onCreateFile("", "file")}
          className="p-1 rounded hover:bg-sidebar-accent text-muted-foreground hover:text-foreground transition-colors"
        >
          <Plus size={14} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin py-1">
        {files.map((node) => (
          <FileTreeItem
            key={node.name}
            node={node}
            path={node.name}
            depth={0}
            activeFile={activeFile}
            onSelectFile={onSelectFile}
            onDeleteFile={onDeleteFile}
          />
        ))}
      </div>
    </div>
  );
}
