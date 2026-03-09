import { MessageSquare, Plus, Crown, Trash2, X, Store, LogIn, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { lovable } from "@/integrations/lovable/index";

export interface ChatItem {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
}

interface ChatSidebarProps {
  chats: ChatItem[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onDeleteChat: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function ChatSidebar({
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  isOpen,
  onClose,
}: ChatSidebarProps) {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleGoogleSignIn = async () => {
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (error) console.error("Sign in error:", error);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : -300 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className={`fixed md:relative z-50 md:z-auto top-0 left-0 h-full w-[280px] bg-sidebar border-r border-sidebar-border flex flex-col ${
          !isOpen ? "md:hidden" : ""
        }`}
      >
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-sidebar-border">
          <h2 className="text-lg font-semibold gradient-text">PowerChat</h2>
          <button onClick={onClose} className="md:hidden p-1 rounded-md hover:bg-sidebar-accent text-sidebar-foreground">
            <X size={18} />
          </button>
        </div>

        {/* New Chat */}
        <div className="p-3 space-y-2">
          <button
            onClick={onNewChat}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-secondary hover:bg-surface-hover text-foreground transition-colors text-sm font-medium"
          >
            <Plus size={16} />
            New Chat
          </button>
          <button
            onClick={() => { navigate("/marketplace"); onClose(); }}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-muted hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            <Store size={16} />
            AI Marketplace
          </button>
        </div>

        {/* Auth / Chat list */}
        <div className="flex-1 overflow-y-auto scrollbar-thin px-2 pb-2 space-y-1">
          {!user ? (
            <div className="flex flex-col items-center justify-center mt-12 px-4 text-center space-y-4">
              <p className="text-muted-foreground text-xs">
                Sign in to save your conversations
              </p>
              <button
                onClick={handleGoogleSignIn}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg gradient-bg text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <LogIn size={16} />
                Sign in with Google
              </button>
            </div>
          ) : (
            <>
              {chats.length === 0 && (
                <p className="text-muted-foreground text-xs text-center mt-8 px-4">
                  No conversations yet. Start a new chat!
                </p>
              )}
              {chats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => onSelectChat(chat.id)}
                  className={`w-full group flex items-center gap-2 px-3 py-2.5 rounded-lg text-left text-sm transition-colors ${
                    activeChatId === chat.id
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                  }`}
                >
                  <MessageSquare size={14} className="shrink-0 text-muted-foreground" />
                  <span className="truncate flex-1">{chat.title}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteChat(chat.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-destructive transition-opacity"
                  >
                    <Trash2 size={12} />
                  </button>
                </button>
              ))}
            </>
          )}
        </div>

        {/* User info / Sign out */}
        {user && (
          <div className="p-3 border-t border-sidebar-border">
            <div className="flex items-center gap-2 px-2 mb-2">
              {user.user_metadata?.avatar_url && (
                <img src={user.user_metadata.avatar_url} alt="" className="w-6 h-6 rounded-full" />
              )}
              <span className="text-xs text-sidebar-foreground truncate flex-1">
                {user.user_metadata?.full_name || user.email}
              </span>
              <button onClick={signOut} className="p-1 rounded-md hover:bg-sidebar-accent text-muted-foreground hover:text-foreground transition-colors">
                <LogOut size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Pro Upgrade */}
        <div className="p-3 border-t border-sidebar-border">
          <div className="p-3 rounded-lg bg-sidebar-accent">
            <div className="flex items-center gap-2 mb-1">
              <Crown size={14} style={{ color: "hsl(45, 100%, 55%)" }} />
              <span className="text-sm font-semibold text-foreground">Upgrade to Pro</span>
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              Longer videos, more images & unlimited access
            </p>
            <div className="text-lg font-bold text-foreground">$20<span className="text-xs font-normal text-muted-foreground">/mo</span></div>
          </div>
        </div>

        <div className="px-4 py-3 text-[10px] text-muted-foreground text-center border-t border-sidebar-border">
          Powered by Replit & Google
        </div>
      </motion.aside>
    </>
  );
}
