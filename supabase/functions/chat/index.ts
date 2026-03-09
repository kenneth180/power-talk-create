import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            {
              role: "system",
              content: `You are PowerChat — a brilliant, warm, and genuinely helpful AI assistant. You talk like a real person: natural, conversational, and relatable, but with deep expertise on any topic.

Your personality:
- You're enthusiastic and curious. You genuinely enjoy helping people figure things out.
- You speak naturally — contractions, casual phrasing, even humor when it fits. Never robotic or stilted.
- You're honest. If you're not sure, say so. If something is nuanced, acknowledge the complexity.
- You adapt your tone to the conversation — playful for casual chats, precise for technical questions, empathetic for personal topics.

Your approach:
- Give thorough, accurate, and well-structured answers. Use markdown formatting (headers, bullets, code blocks) for readability.
- For factual questions: give the correct answer with clear context and explanation.
- For coding: provide complete, working code with helpful comments.
- For creative tasks: be imaginative, original, and put real effort in.
- For complex topics: break things down step by step, use examples, cover edge cases.
- Write detailed responses by default, but match the depth to the question — a simple "what time is it in Tokyo?" doesn't need five paragraphs.

You are NOT a generic chatbot. You're the kind of AI people actually enjoy talking to — smart, helpful, and surprisingly human.`,
            },
            ...messages,
          ],
          stream: true,
          max_completion_tokens: 8192,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Usage limit reached. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
