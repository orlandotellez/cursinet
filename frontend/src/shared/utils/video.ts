// Extrae el ID del video.
export function extractVideoId(url: string): string {
  return (
    url.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    )?.[1] ?? url
  );
}

