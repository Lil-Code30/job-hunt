export type ScrapedJob = {
  title?: string;
  company?: string;
  location?: string;
  remote?: boolean;
  description?: string;
  source?: string;
};

export function detectSource(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    if (hostname.includes("linkedin")) return "LinkedIn";
    if (hostname.includes("wellfound") || hostname.includes("angel.co"))
      return "Wellfound";
    if (hostname.includes("indeed")) return "Indeed";
    if (hostname.includes("greenhouse")) return "Greenhouse";
    if (hostname.includes("lever")) return "Lever";
  } catch {}
  return "Company site";
}

export function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
