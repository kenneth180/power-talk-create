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
    const STYLE_PROMPTS: Record<string, string> = {
      auto: "",
      photoreal: "ultra photorealistic, DSLR photo, 8K, sharp focus, true-to-life skin and textures, natural lighting",
      anime: "anime style, vibrant cel-shading, studio-ghibli inspired, clean linework, expressive eyes",
      cyberpunk: "cyberpunk aesthetic, neon-lit, holographic signage, rain reflections, chromatic aberration, futuristic dystopia",
      cinematic: "cinematic lighting, dramatic chiaroscuro, anamorphic lens, film grain, teal and orange grade",
      "3d": "octane 3D render, PBR materials, ray-traced reflections, subsurface scattering, ultra-detailed shaders, studio HDRI lighting",
      fantasy: "epic fantasy art, painterly, magical atmosphere, volumetric god rays, intricate ornate details",
      watercolor: "soft watercolor painting, pastel washes, paper texture, hand-painted brush strokes",
      pixel: "16-bit pixel art, crisp retro game sprite, limited palette, dithering",
      comic: "western comic book style, bold ink outlines, halftone shading, dynamic action panels",
    };

    const { prompt, imageUrl, styleId } = await req.json();
    if (!prompt || !imageUrl) {
      return new Response(
        JSON.stringify({ error: "Both prompt and imageUrl are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const styleAddon = STYLE_PROMPTS[styleId || "auto"] || "";
    const editInstruction = `Edit this image with surgical precision while preserving the subject's identity. User request: ${prompt}.${styleAddon ? ` Apply this style: ${styleAddon}.` : ""} Enhance shaders, lighting, materials, and fine details. If improving a face, perfect the skin, eyes, hair, and proportions while keeping the person recognizable. No watermarks, no text, no distortions. Output a high-quality 1000x900 pixel result.`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

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
            content: [
              { type: "text", text: editInstruction },
              { type: "image_url", image_url: { url: imageUrl } },
            ],
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
      console.error("AI edit-image error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "Image editing failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const message = data.choices?.[0]?.message;
    const editedImageUrl = message?.images?.[0]?.image_url?.url;
    const text = message?.content || "Here's your edited image!";

    return new Response(
      JSON.stringify({ imageUrl: editedImageUrl, text }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("edit-image error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
