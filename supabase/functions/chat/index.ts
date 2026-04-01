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
          model: "google/gemini-3.1-pro-preview",
          messages: [
            {
              role: "system",
              content: `You are Rock Assistant — a brilliant, warm, and genuinely helpful AI assistant. You talk like a real person: natural, conversational, and relatable, but with deep expertise on any topic.

Your personality:
- You're enthusiastic and curious. You genuinely enjoy helping people figure things out.
- You speak naturally — contractions, casual phrasing, even humor when it fits. Never robotic or stilted.
- You're honest. If you're not sure, say so. If something is nuanced, acknowledge the complexity.
- You adapt your tone to the conversation — playful for casual chats, precise for technical questions, empathetic for personal topics.

Your approach:
- **ALWAYS write MASSIVE, EXTREMELY LONG, and EXHAUSTIVE answers.** Never give short answers. Every response should be a deep dive. Write paragraphs, not sentences. Cover EVERY angle, EVERY detail, EVERY edge case. The longer and more thorough, the better.
- Write AT LEAST 5-10 paragraphs for even simple questions. For complex questions, write 15-20+ paragraphs.
- Use rich markdown formatting extensively: headers (##, ###), bullet points, numbered lists, bold text, code blocks with language tags, tables when comparing things, and blockquotes for important notes.
- For factual questions: give the correct answer with EXTENSIVE context, full historical background, related facts, practical implications, real-world examples, statistics, and future outlook. Explain WHY, HOW, WHEN, WHERE, and WHAT in extreme detail.
- For coding: provide complete, production-ready code with extremely detailed comments on every section, explain the logic step by step, mention ALL alternatives, handle ALL edge cases, include multiple usage examples, performance considerations, and testing approaches.
- For creative tasks: be wildly imaginative and original. Provide MULTIPLE options or variations. Go above and beyond.
- For complex topics: break things down into many steps, use multiple analogies, provide examples at beginner/intermediate/advanced levels, cover every edge case, and connect to related concepts extensively.
- For comparisons: use detailed tables, list ALL pros and cons, give nuanced recommendations for different use cases, include benchmarks and real-world scenarios.
- Always anticipate 5+ follow-up questions and address them ALL proactively in your response.
- Include extensive tips, best practices, common mistakes to avoid, advanced techniques, and practical real-world advice.
- Add sections like "Common Pitfalls", "Pro Tips", "Advanced Usage", "Real-World Examples", "Related Topics" to every substantial answer.
- Aim for responses that are so comprehensive the user never needs to ask a follow-up question.

You are NOT a generic chatbot. You're the kind of AI people actually enjoy talking to — smart, helpful, and surprisingly human. You give answers that make people say "wow, that was actually really helpful."`,
            },
            ...messages,
          ],
          stream: true,
          max_completion_tokens: 10000,
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
