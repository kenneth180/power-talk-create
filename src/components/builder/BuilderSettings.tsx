import { X, Globe, Palette, Type } from "lucide-react";
import { motion } from "framer-motion";

interface BuilderSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  language: string;
  onLanguageChange: (lang: string) => void;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  theme: string;
  onThemeChange: (theme: string) => void;
}

const LANGUAGES = [
  { value: "typescript", label: "TypeScript" },
  { value: "javascript", label: "JavaScript" },
  { value: "python", label: "Python" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "json", label: "JSON" },
  { value: "markdown", label: "Markdown" },
  { value: "jsx", label: "JSX" },
  { value: "tsx", label: "TSX" },
  { value: "sql", label: "SQL" },
  { value: "rust", label: "Rust" },
  { value: "go", label: "Go" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "csharp", label: "C#" },
  { value: "ruby", label: "Ruby" },
  { value: "php", label: "PHP" },
  { value: "swift", label: "Swift" },
  { value: "kotlin", label: "Kotlin" },
  { value: "dart", label: "Dart" },
];

const THEMES = [
  { value: "dark", label: "Dark (Default)" },
  { value: "monokai", label: "Monokai" },
  { value: "dracula", label: "Dracula" },
  { value: "github-dark", label: "GitHub Dark" },
];

const FONT_SIZES = [11, 12, 13, 14, 15, 16, 18, 20];

export function BuilderSettings({
  isOpen,
  onClose,
  language,
  onLanguageChange,
  fontSize,
  onFontSizeChange,
  theme,
  onThemeChange,
}: BuilderSettingsProps) {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-background/60 backdrop-blur-sm z-50" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[420px] max-w-[90vw] bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">Builder Settings</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Language */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Globe size={16} className="text-primary" />
              Language
            </label>
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50 transition-colors"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          {/* Font Size */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Type size={16} className="text-primary" />
              Font Size
            </label>
            <div className="flex gap-2 flex-wrap">
              {FONT_SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => onFontSizeChange(size)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    fontSize === size
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {size}px
                </button>
              ))}
            </div>
          </div>

          {/* Theme */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Palette size={16} className="text-primary" />
              Editor Theme
            </label>
            <div className="grid grid-cols-2 gap-2">
              {THEMES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => onThemeChange(t.value)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium text-left transition-colors ${
                    theme === t.value
                      ? "bg-primary/15 border-primary/30 border text-primary"
                      : "bg-secondary border border-border text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
