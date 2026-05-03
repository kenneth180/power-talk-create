import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SIZE_MAP: Record<string, string> = {
  free: "1000x1000",
  pro: "1250x1500",
  ultra: "1550x1300",
  team: "1750x1650",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, isPro, plan } = await req.json();
    const tier = plan || (isPro ? "pro" : "free");
    const maxSize = SIZE_MAP[tier] || "1000x1000";

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "No prompt provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Enhance the prompt for best-quality image generation — understands ANY subject
    const enhancedPrompt = `Create a breathtaking, ultra-high-quality, photorealistic masterpiece image at exactly ${maxSize} resolution.

Subject (interpret creatively and bring it to life — characters, objects, scenes, abstract concepts, anything): ${prompt}

Visual treatment: razor-sharp focus, professional cinematic composition, dramatic volumetric lighting, advanced shaders, realistic ray-traced reflections, subsurface scattering, ambient occlusion, bloom and glow effects, rich vibrant colors, intricate fine details on every surface, perfect exposure, beautiful depth of field, atmospheric haze where fitting, PBR materials, 8K detail, award-winning photography or concept art quality. Apply modern shader effects: specular highlights, fresnel rims, soft shadows, color grading. No blur, no artifacts, no watermarks, no text, no extra limbs or distortions. Every pixel polished. If a person is involved, render anatomy perfectly with lifelike skin, eyes, and hair.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3.1-flash-image-preview",
        messages: [
          {
            role: "user",
            content: enhancedPrompt,
          },
        ],
        modalities: ["image", "text"],
      }),
    });

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
      console.error("AI image error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "Image generation failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const message = data.choices?.[0]?.message;
    const imageUrl = message?.images?.[0]?.image_url?.url;
    const text = message?.content || "Here's your generated image!";

    return new Response(
      JSON.stringify({ imageUrl, text }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("generate-image error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
