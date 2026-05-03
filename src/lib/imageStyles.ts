export type ImageStyle = {
  id: string;
  label: string;
  emoji: string;
  prompt: string;
};

export const IMAGE_STYLES: ImageStyle[] = [
  { id: "auto", label: "Auto", emoji: "✨", prompt: "" },
  { id: "photoreal", label: "Photorealistic", emoji: "📷", prompt: "ultra photorealistic, DSLR photo, 8K, sharp focus, true-to-life skin and textures, natural lighting" },
  { id: "anime", label: "Anime", emoji: "🌸", prompt: "anime style, vibrant cel-shading, studio-ghibli inspired, clean linework, expressive eyes, manga aesthetic" },
  { id: "cyberpunk", label: "Cyberpunk", emoji: "🌃", prompt: "cyberpunk aesthetic, neon-lit streets, holographic signage, rain reflections, chromatic aberration, futuristic dystopia, blade runner mood" },
  { id: "cinematic", label: "Cinematic", emoji: "🎬", prompt: "cinematic lighting, dramatic chiaroscuro, anamorphic lens, film grain, teal and orange grade, hollywood blockbuster composition" },
  { id: "3d", label: "3D Render", emoji: "🧊", prompt: "octane 3D render, PBR materials, ray-traced reflections, subsurface scattering, ultra-detailed shaders, studio HDRI lighting" },
  { id: "fantasy", label: "Fantasy", emoji: "🐉", prompt: "epic fantasy art, painterly, magical atmosphere, volumetric god rays, intricate ornate details, mythological mood" },
  { id: "watercolor", label: "Watercolor", emoji: "🎨", prompt: "soft watercolor painting, pastel washes, paper texture, hand-painted brush strokes, dreamy" },
  { id: "pixel", label: "Pixel Art", emoji: "👾", prompt: "16-bit pixel art, crisp retro game sprite, limited palette, dithering, nostalgic SNES vibe" },
  { id: "comic", label: "Comic", emoji: "💥", prompt: "western comic book style, bold ink outlines, halftone shading, dynamic poses, action panels" },
];

export function getStyleById(id?: string): ImageStyle {
  return IMAGE_STYLES.find((s) => s.id === id) || IMAGE_STYLES[0];
}
