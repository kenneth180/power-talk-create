import { useState, useRef, useEffect, useCallback } from "react";
import { Menu } from "lucide-react";
import { ChatSidebar, ChatItem } from "@/components/ChatSidebar";
import { ChatMessage, Message } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { TypingIndicator } from "@/components/TypingIndicator";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { AnimatePresence } from "framer-motion";

// Simulated AI responses
const aiResponses: Record<string, string> = {
  default: "I'm **PowerChat**, your AI assistant! I can help you with:\n\n- 🖼️ **Image generation & editing**\n- 🎬 **Video creation**\n- 💻 **Coding help**\n- 📚 **Homework assistance**\n- 🎤 **Voice conversations**\n- 📞 **Phone calls**\n\nWhat would you like to do today?",
  image: "I'd love to generate that image for you! 🎨\n\n> *Image generation requires the Cloud backend to be enabled. Once set up, I can create stunning images from your descriptions.*\n\nWould you like to describe your image in more detail?",
  code: "Here's a Python script to sort a list:\n\n```python\n# Simple sort\nnumbers = [64, 34, 25, 12, 22, 11, 90]\nnumbers.sort()\nprint(numbers)  # [11, 12, 22, 25, 34, 64, 90]\n\n# Custom sort with key\nwords = ['banana', 'apple', 'cherry']\nwords.sort(key=len)\nprint(words)  # ['apple', 'banana', 'cherry']\n```\n\nWant me to explain how sorting algorithms work?",
  homework: "I'd be happy to help with your homework! 📚\n\nJust share the problem or topic, and I'll:\n1. Explain the concept clearly\n2. Walk through the solution step-by-step\n3. Give you practice problems\n\nWhat subject are you working on?",
  video: "I can create videos for you! 🎬\n\n**Free tier:** Short clips up to 30 seconds\n**Pro ($20/mo):** Videos up to 1 hour, more styles\n\nDescribe what kind of video you'd like to create!",
  voice: "Voice chat is ready! 🎤\n\nClick the **microphone icon** in the input bar to start a voice conversation. I can:\n- Answer questions by voice\n- Have natural conversations\n- Help with pronunciation\n\n*Voice features require Cloud backend.*",
  call: "📞 **Phone Call Feature**\n\nI can make calls for you! Before proceeding:\n\n⚠️ **Terms & Conditions:** By using the calling feature, you agree to our terms of service. All calls are recorded for quality assurance.\n\nWho would you like to call?",
};

function getAIResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes("image") || lower.includes("picture") || lower.includes("photo")) return aiResponses.image;
  if (lower.includes("code") || lower.includes("script") || lower.includes("python") || lower.includes("app")) return aiResponses.code;
  if (lower.includes("homework") || lower.includes("math") || lower.includes("help me")) return aiResponses.homework;
  if (lower.includes("video") || lower.includes("clip")) return aiResponses.video;
  if (lower.includes("voice") || lower.includes("talk") || lower.includes("conversation")) return aiResponses.voice;
  if (lower.includes("call") || lower.includes("phone") || lower.includes("police") || lower.includes("mom")) return aiResponses.call;
  return aiResponses.default;
}

const Index = () => {
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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
    (content: string) => {
      let chatId = activeChatId;
      if (!chatId) {
        chatId = createNewChat(content);
      }

      const userMsg: Message = { id: Date.now().toString(), role: "user", content, timestamp: new Date() };
      setMessages((prev) => ({ ...prev, [chatId!]: [...(prev[chatId!] || []), userMsg] }));
      setChats((prev) => prev.map((c) => (c.id === chatId ? { ...c, lastMessage: content, title: prev.find(ch => ch.id === chatId)?.title === "New Chat" ? content.slice(0, 40) : c.title } : c)));
      setIsLoading(true);
      scrollToBottom();

      // Simulate AI response
      setTimeout(() => {
        const aiContent = getAIResponse(content);
        const aiMsg: Message = { id: (Date.now() + 1).toString(), role: "assistant", content: aiContent, timestamp: new Date() };
        setMessages((prev) => ({ ...prev, [chatId!]: [...(prev[chatId!] || []), aiMsg] }));
        setIsLoading(false);
        scrollToBottom();
      }, 1200 + Math.random() * 800);
    },
    [activeChatId, createNewChat, scrollToBottom]
  );

  const handleNewChat = () => {
    setActiveChatId(null);
    setSidebarOpen(false);
  };

  const handleDeleteChat = (id: string) => {
    setChats((prev) => prev.filter((c) => c.id !== id));
    setMessages((prev) => { const n = { ...prev }; delete n[id]; return n; });
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

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-14 border-b border-border flex items-center px-4 gap-3 bg-background shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
            <Menu size={20} />
          </button>
          <h1 className="text-sm font-semibold gradient-text">PowerChat</h1>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">
              Free
            </span>
          </div>
        </header>

        {/* Messages */}
        {activeMessages.length === 0 && !activeChatId ? (
          <WelcomeScreen onSuggestion={sendMessage} />
        ) : (
          <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin">
            <div className="max-w-3xl mx-auto pb-4">
              {activeMessages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
              <AnimatePresence>
                {isLoading && <TypingIndicator />}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Input */}
        <ChatInput onSend={sendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default Index;
