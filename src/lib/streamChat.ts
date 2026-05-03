type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
const IMAGE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-image`;
const EDIT_IMAGE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/edit-image`;

export async function streamChat({
  messages,
  onDelta,
  onDone,
  onError,
}: {
  messages: Msg[];
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (error: string) => void;
}) {
  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages }),
  });

  if (!resp.ok) {
    const data = await resp.json().catch(() => ({ error: "Request failed" }));
    onError(data.error || `Error ${resp.status}`);
    return;
  }

  if (!resp.body) {
    onError("No response stream");
    return;
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let textBuffer = "";
  let streamDone = false;

  while (!streamDone) {
    const { done, value } = await reader.read();
    if (done) break;
    textBuffer += decoder.decode(value, { stream: true });

    let newlineIndex: number;
    while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
      let line = textBuffer.slice(0, newlineIndex);
      textBuffer = textBuffer.slice(newlineIndex + 1);

      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (line.startsWith(":") || line.trim() === "") continue;
      if (!line.startsWith("data: ")) continue;

      const jsonStr = line.slice(6).trim();
      if (jsonStr === "[DONE]") {
        streamDone = true;
        break;
      }

      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch {
        textBuffer = line + "\n" + textBuffer;
        break;
      }
    }
  }

  // Flush remaining
  if (textBuffer.trim()) {
    for (let raw of textBuffer.split("\n")) {
      if (!raw) continue;
      if (raw.endsWith("\r")) raw = raw.slice(0, -1);
      if (raw.startsWith(":") || raw.trim() === "") continue;
      if (!raw.startsWith("data: ")) continue;
      const jsonStr = raw.slice(6).trim();
      if (jsonStr === "[DONE]") continue;
      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch { /* ignore */ }
    }
  }

  onDone();
}

const IMAGE_NOUNS = "(?:image|picture|pic|photo|photograph|illustration|art|artwork|painting|drawing|sketch|render|rendering|banner|logo|icon|graphic|wallpaper|poster|portrait|scene|landscape|avatar|thumbnail|cover|design|visual|emoji|sticker)";
const IMAGE_VERBS = "(?:generate|create|make|draw|design|paint|sketch|render|produce|imagine|visualize|show\\s+me|give\\s+me|build)";

const IMAGE_PATTERNS = [
  // "create an image", "draw a cat", "make me a picture of..."
  new RegExp(`\\b${IMAGE_VERBS}\\b\\s+(?:me\\s+)?(?:a|an|the|some)?\\s*${IMAGE_NOUNS}\\b`, "i"),
  // "image of a cat", "picture showing..."
  new RegExp(`\\b${IMAGE_NOUNS}\\b\\s+(?:of|for|with|about|showing|featuring|depicting)\\b`, "i"),
  // "an image of...", "a photo of..."
  new RegExp(`\\b(?:a|an|the)\\s+${IMAGE_NOUNS}\\b\\s+(?:of|with|about|showing)\\b`, "i"),
  // direct: "draw <subject>", "paint <subject>" without needing the noun
  /\b(?:draw|paint|sketch|illustrate)\s+(?:me\s+)?(?:a|an|the)\s+\w+/i,
];

export function isImageRequest(text: string): boolean {
  return IMAGE_PATTERNS.some((re) => re.test(text));
}

const URL_PATTERNS = [
  /\b(?:go\s+to|open|visit|show\s+me|navigate\s+to|browse)\s+(https?:\/\/[^\s]+)/i,
  /\b(?:go\s+to|open|visit|show\s+me|navigate\s+to|browse)\s+([a-z0-9][-a-z0-9]*(?:\.[a-z]{2,})+(?:\/[^\s]*)?)/i,
];

const SEARCH_PATTERNS = [
  { re: /\b(?:search\s+google|google\s+search|google)\s+(?:for\s+)?(.+)/i, url: (q: string) => `https://www.google.com/search?q=${encodeURIComponent(q)}` },
  { re: /\b(?:search\s+youtube|youtube\s+search|youtube)\s+(?:for\s+)?(.+)/i, url: (q: string) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}` },
  { re: /\b(?:search\s+github|github\s+search|github)\s+(?:for\s+)?(.+)/i, url: (q: string) => `https://github.com/search?q=${encodeURIComponent(q)}` },
  { re: /\b(?:search\s+(?:the\s+)?web|web\s+search|search\s+(?:for|about))\s+(.+)/i, url: (q: string) => `https://www.google.com/search?q=${encodeURIComponent(q)}` },
  { re: /\b(?:look\s+up|find)\s+(.+?)(?:\s+on\s+google)?$/i, url: (q: string) => `https://www.google.com/search?q=${encodeURIComponent(q)}` },
];

export function extractWebUrl(text: string): string | null {
  // Direct URL commands first
  for (const re of URL_PATTERNS) {
    const match = text.match(re);
    if (match?.[1]) {
      let url = match[1];
      if (!/^https?:\/\//i.test(url)) url = "https://" + url;
      return url;
    }
  }
  // Search commands
  for (const { re, url } of SEARCH_PATTERNS) {
    const match = text.match(re);
    if (match?.[1]) {
      return url(match[1].trim());
    }
  }
  return null;
}

export async function generateImage({
  prompt,
  isPro,
  plan,
  onResult,
  onError,
}: {
  prompt: string;
  isPro?: boolean;
  plan?: string;
  onResult: (data: { imageUrl: string; text: string }) => void;
  onError: (error: string) => void;
}) {
  try {
    const resp = await fetch(IMAGE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ prompt, isPro: !!isPro, plan: plan || (isPro ? "pro" : "free") }),
    });

    if (!resp.ok) {
      const data = await resp.json().catch(() => ({ error: "Image generation failed" }));
      onError(data.error || `Error ${resp.status}`);
      return;
    }

    const data = await resp.json();
    if (!data.imageUrl) {
      onError("No image was generated. Please try a different prompt.");
      return;
    }
    onResult(data);
  } catch (e) {
    onError(e instanceof Error ? e.message : "Image generation failed");
  }
}

export async function editImage({
  prompt,
  imageUrl,
  onResult,
  onError,
}: {
  prompt: string;
  imageUrl: string;
  onResult: (data: { imageUrl: string; text: string }) => void;
  onError: (error: string) => void;
}) {
  try {
    const resp = await fetch(EDIT_IMAGE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ prompt: prompt || "Enhance this image", imageUrl }),
    });

    if (!resp.ok) {
      const data = await resp.json().catch(() => ({ error: "Image editing failed" }));
      onError(data.error || `Error ${resp.status}`);
      return;
    }

    const data = await resp.json();
    if (!data.imageUrl) {
      onError("No edited image was returned. Please try again.");
      return;
    }
    onResult(data);
  } catch (e) {
    onError(e instanceof Error ? e.message : "Image editing failed");
  }
}
