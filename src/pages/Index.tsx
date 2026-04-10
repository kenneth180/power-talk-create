import { useState, useRef, useCallback, useEffect } from "react";
import { Menu, LogIn, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { lovable } from "@/integrations/lovable/index";
import { ChatSidebar, ChatItem } from "@/components/ChatSidebar";
import { ChatMessage, Message } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { TypingIndicator } from "@/components/TypingIndicator";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { AnimatePresence } from "framer-motion";
import { UpgradeModal } from "@/components/UpgradeModal";
import { streamChat, isImageRequest, generateImage, editImage } from "@/lib/streamChat";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { getPlan, setPlan, isPaidPlan, planLabel, canEditImage, PlanTier } from "@/lib/plans";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(() => getPlan());
  const isPro = isPaidPlan(currentPlan);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const activeMessages = activeChatId ? messages[activeChatId] || [] : [];

  // Load chats from DB when user signs in
  useEffect(() => {
    if (!user) {
      setChats([]);
      setMessages({});
      setActiveChatId(null);
      return;
    }
    const loadChats = async () => {
      const { data: dbChats } = await supabase
        .from("chats")
        .select("*")
        .order("updated_at", { ascending: false });

      if (!dbChats) return;

      const chatItems: ChatItem[] = dbChats.map((c: any) => ({
        id: c.id,
        title: c.title,
        lastMessage: "",
        timestamp: new Date(c.updated_at),
      }));
      setChats(chatItems);

      // Load all messages
      const { data: dbMessages } = await supabase
        .from("chat_messages")
        .select("*")
        .in("chat_id", dbChats.map((c: any) => c.id))
        .order("created_at", { ascending: true });

      if (dbMessages) {
        const msgMap: Record<string, Message[]> = {};
        for (const m of dbMessages as any[]) {
          if (!msgMap[m.chat_id]) msgMap[m.chat_id] = [];
          msgMap[m.chat_id].push({
            id: m.id,
            role: m.role as "user" | "assistant",
            content: m.content,
            timestamp: new Date(m.created_at),
          });
        }
        setMessages(msgMap);
      }
    };
    loadChats();
  }, [user]);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, 50);
  }, []);

  const createNewChat = useCallback(
    async (firstMessage?: string) => {
      const title = firstMessage
        ? firstMessage.slice(0, 40) + (firstMessage.length > 40 ? "..." : "")
        : "New Chat";

      if (user) {
        const { data, error } = await supabase
          .from("chats")
          .insert({ user_id: user.id, title })
          .select()
          .single();
        if (error || !data) {
          const id = Date.now().toString();
          const chat: ChatItem = { id, title, lastMessage: "", timestamp: new Date() };
          setChats((prev) => [chat, ...prev]);
          setActiveChatId(id);
          setMessages((prev) => ({ ...prev, [id]: [] }));
          setSidebarOpen(false);
          return id;
        }
        const chat: ChatItem = { id: data.id, title, lastMessage: "", timestamp: new Date() };
        setChats((prev) => [chat, ...prev]);
        setActiveChatId(data.id);
        setMessages((prev) => ({ ...prev, [data.id]: [] }));
        setSidebarOpen(false);
        return data.id;
      } else {
        const id = Date.now().toString();
        const chat: ChatItem = { id, title, lastMessage: "", timestamp: new Date() };
        setChats((prev) => [chat, ...prev]);
        setActiveChatId(id);
        setMessages((prev) => ({ ...prev, [id]: [] }));
        setSidebarOpen(false);
        return id;
      }
    },
    [user]
  );

  const sendMessage = useCallback(
    async (content: string, imageBase64?: string) => {
      let chatId = activeChatId;
      if (!chatId) {
        chatId = await createNewChat(content);
      }

      const userMsg: Message = { id: crypto.randomUUID(), role: "user", content, timestamp: new Date() };

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

      // Save user message to DB
      if (user) {
        await supabase.from("chat_messages").insert({
          chat_id: chatId,
          role: "user",
          content,
        });
        // Update chat title if needed
        const chat = chats.find((c) => c.id === chatId);
        if (chat?.title === "New Chat") {
          await supabase.from("chats").update({ title: content.slice(0, 40), updated_at: new Date().toISOString() }).eq("id", chatId);
        } else {
          await supabase.from("chats").update({ updated_at: new Date().toISOString() }).eq("id", chatId);
        }
      }

      const currentMsgs = [...(messages[chatId!] || []), userMsg];
      const apiMessages = currentMsgs.map((m) => ({ role: m.role, content: m.content }));

      // Check if user attached an image for editing
      if (imageBase64) {
        // Only Pro users can edit images
        if (!isPro) {
          setIsLoading(false);
          toast({ variant: "destructive", title: "Pro Feature", description: "Image editing is only available with Rock 6 Pro. Upgrade to edit images!" });
          return;
        }
        const assistantId = crypto.randomUUID();
        setMessages((prev) => ({
          ...prev,
          [chatId!]: [
            ...(prev[chatId!] || []),
            { id: assistantId, role: "assistant" as const, content: "✏️ Editing your image...", timestamp: new Date() },
          ],
        }));
        scrollToBottom();

        await editImage({
          prompt: content || "Enhance this image",
          imageUrl: imageBase64,
          onResult: async ({ imageUrl, text }) => {
            setMessages((prev) => ({
              ...prev,
              [chatId!]: (prev[chatId!] || []).map((m) =>
                m.id === assistantId ? { ...m, content: text, imageUrl } : m
              ),
            }));
            setIsLoading(false);
            if (user) {
              await supabase.from("chat_messages").insert({
                chat_id: chatId,
                role: "assistant",
                content: `[Image Edited] ${text}`,
              });
            }
          },
          onError: (error) => {
            setMessages((prev) => ({
              ...prev,
              [chatId!]: (prev[chatId!] || []).map((m) =>
                m.id === assistantId ? { ...m, content: `❌ ${error}` } : m
              ),
            }));
            setIsLoading(false);
            toast({ variant: "destructive", title: "Image Edit Error", description: error });
          },
        });
      } else if (isImageRequest(content)) {
        const assistantId = crypto.randomUUID();
        setMessages((prev) => ({
          ...prev,
          [chatId!]: [
            ...(prev[chatId!] || []),
            { id: assistantId, role: "assistant" as const, content: "🎨 Generating your image...", timestamp: new Date() },
          ],
        }));
        scrollToBottom();

        await generateImage({
          prompt: content,
          isPro,
          onResult: async ({ imageUrl, text }) => {
            setMessages((prev) => ({
              ...prev,
              [chatId!]: (prev[chatId!] || []).map((m) =>
                m.id === assistantId ? { ...m, content: text, imageUrl } : m
              ),
            }));
            setIsLoading(false);
            if (user) {
              await supabase.from("chat_messages").insert({
                chat_id: chatId,
                role: "assistant",
                content: `[Image Generated] ${text}`,
              });
            }
          },
          onError: (error) => {
            setMessages((prev) => ({
              ...prev,
              [chatId!]: (prev[chatId!] || []).map((m) =>
                m.id === assistantId ? { ...m, content: `❌ ${error}` } : m
              ),
            }));
            setIsLoading(false);
            toast({ variant: "destructive", title: "Image Error", description: error });
          },
        });
      } else {
        let assistantSoFar = "";
        const assistantId = crypto.randomUUID();

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
                  { id: assistantId, role: "assistant" as const, content: assistantSoFar, timestamp: new Date() },
                ],
              };
            });
            scrollToBottom();
          },
          onDone: async () => {
            setIsLoading(false);
            if (user && assistantSoFar) {
              await supabase.from("chat_messages").insert({
                chat_id: chatId,
                role: "assistant",
                content: assistantSoFar,
              });
            }
          },
          onError: (error) => {
            setIsLoading(false);
            toast({ variant: "destructive", title: "Error", description: error });
          },
        });
      }
    },
    [activeChatId, createNewChat, scrollToBottom, messages, toast, user, chats]
  );

  const handleNewChat = () => {
    setActiveChatId(null);
    setSidebarOpen(false);
  };

  const handleDeleteChat = async (id: string) => {
    setChats((prev) => prev.filter((c) => c.id !== id));
    setMessages((prev) => {
      const n = { ...prev };
      delete n[id];
      return n;
    });
    if (activeChatId === id) setActiveChatId(null);
    if (user) {
      await supabase.from("chats").delete().eq("id", id);
    }
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
        isPro={isPro}
        onActivateCoupon={() => {
          navigate("/you-buy-the-rock-6-assistant-perchose-susceful");
        }}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border flex items-center px-4 gap-3 bg-background shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
            <Menu size={35} className="w-[35px] h-[35px] text-base font-serif" />
          </button>
          <h1 className="text-sm font-semibold gradient-text">Rock Assistant</h1>
          <span className="text-[10px] text-muted-foreground">{isPro ? "Rock 6 Pro" : "Rock 5 Pro upgrade for a better ai "}</span>
          <div className="ml-auto flex items-center gap-3">
            {isPro ? (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 border border-yellow-500/30 font-medium">
                Pro
              </span>
            ) : (
              <button
                onClick={() => setShowUpgrade(true)}
                className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border hover:border-yellow-500/50 hover:text-yellow-400 transition-colors"
              >
                Free plan upgrade for better ai
              </button>
            )}
            {user ? (
              <div className="flex items-center gap-2">
                {user.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="" className="w-7 h-7 rounded-full border border-border" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                    {(user.user_metadata?.full_name?.[0] || user.email?.[0] || "?").toUpperCase()}
                  </div>
                )}
                <span className="text-xs text-foreground hidden sm:block max-w-[120px] truncate">
                  {user.user_metadata?.full_name || user.email}
                </span>
                <button onClick={signOut} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors" title="Sign out">
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={async () => {
                  await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg gradient-bg text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity"
              >
                <LogIn size={14} />
                Sign in
              </button>
            )}
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
                {isLoading && !activeMessages.some((m) => m.role === "assistant" && m.content) && (
                  <TypingIndicator />
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        <ChatInput onSend={(msg, img) => sendMessage(msg, img)} isLoading={isLoading} />
      </div>

      <UpgradeModal
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        onActivateCoupon={() => {
          navigate("/you-buy-the-rock-6-assistant-perchose-susceful");
        }}
      />
    </div>
  );
};

export default Index;
