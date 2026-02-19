import { useState, useRef, useCallback } from "react";
import { Menu } from "lucide-react";
import { ChatSidebar, ChatItem } from "@/components/ChatSidebar";
import { ChatMessage, Message } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { TypingIndicator } from "@/components/TypingIndicator";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { AnimatePresence } from "framer-motion";
import { streamChat } from "@/lib/streamChat";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const activeMessages = activeChatId ? messages[activeChatId] || [] : [];

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, 50);
  }, []);

  const createNewChat = useCallback((firstMessage?: string) => {
    const id = Date.now().toString();
    const title = firstMessage ? firstMessage.slice(0, 40) + (firstMessage.length > 40 ? "..." : "") : "New Chat";
    const chat: ChatItem = { id, title, lastMessage: "", timestamp: new Date() };
    setChats((prev) => [chat, ...prev]);
    setActiveChatId(id);
    setMessages((prev) => ({ ...prev, [id]: [] }));
    setSidebarOpen(false);
    return id;
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      let chatId = activeChatId;
      if (!chatId) {
        chatId = createNewChat(content);
      }

      const userMsg: Message = { id: Date.now().toString(), role: "user", content, timestamp: new Date() };
      
      setMessages((prev) => ({ ...prev, [chatId!]: [...(prev[chatId!] || []), userMsg] }));
      setChats((prev) =>
        prev.map((c) =>
          c.id === chatId
            ? { ...c, lastMessage: content, title: c.title === "New Chat" ? content.slice(0, 40) : c.title }
            : c
        )
      );
      setIsLoading(true);
      scrollToBottom();

      // Build conversation history for the AI
      const currentMsgs = [...(messages[chatId!] || []), userMsg];
      const apiMessages = currentMsgs.map((m) => ({ role: m.role, content: m.content }));

      let assistantSoFar = "";
      const assistantId = (Date.now() + 1).toString();

      await streamChat({
        messages: apiMessages,
        onDelta: (chunk) => {
          assistantSoFar += chunk;
          setMessages((prev) => {
            const chatMsgs = prev[chatId!] || [];
            const existing = chatMsgs.find((m) => m.id === assistantId);
            if (existing) {
              return {
                ...prev,
                [chatId!]: chatMsgs.map((m) =>
                  m.id === assistantId ? { ...m, content: assistantSoFar } : m
                ),
              };
            }
            return {
              ...prev,
              [chatId!]: [
                ...chatMsgs,
                { id: assistantId, role: "assistant", content: assistantSoFar, timestamp: new Date() },
              ],
            };
          });
          scrollToBottom();
        },
        onDone: () => {
          setIsLoading(false);
        },
        onError: (error) => {
          setIsLoading(false);
          toast({ variant: "destructive", title: "Error", description: error });
        },
      });
    },
    [activeChatId, createNewChat, scrollToBottom, messages, toast]
  );

  const handleNewChat = () => {
    setActiveChatId(null);
    setSidebarOpen(false);
  };

  const handleDeleteChat = (id: string) => {
    setChats((prev) => prev.filter((c) => c.id !== id));
    setMessages((prev) => {
      const n = { ...prev };
      delete n[id];
      return n;
    });
    if (activeChatId === id) setActiveChatId(null);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <ChatSidebar
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={(id) => { setActiveChatId(id); setSidebarOpen(false); }}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border flex items-center px-4 gap-3 bg-background shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
            <Menu size={20} />
          </button>
          <h1 className="text-sm font-semibold gradient-text">PowerChat</h1>
          <span className="text-[10px] text-muted-foreground">GPT-5.2</span>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">
              Free
            </span>
          </div>
        </header>

        {activeMessages.length === 0 && !activeChatId ? (
          <WelcomeScreen onSuggestion={sendMessage} />
        ) : (
          <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin">
            <div className="max-w-3xl mx-auto pb-4">
              {activeMessages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
              <AnimatePresence>
                {isLoading && !activeMessages.some((m) => m.role === "assistant" && m.id === (Date.now() + 1).toString()) && (
                  <TypingIndicator />
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        <ChatInput onSend={sendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default Index;
