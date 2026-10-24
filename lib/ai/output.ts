// Model output check (P8, spec section 1). Anything that is not one or two plain sentences is
// treated as a provider failure, so the fallback runs and nothing odd reaches the page or cache.

export const MAX_RATIONALE_CHARS = 280;

const LINK = /https?:\/\/|www\.|\b[a-z0-9-]+\.(?:com|vn|net|org|io|shop|store)\b/i;
const MARKDOWN = /[*_`#>[\]|]/;
const EMOJI = /\p{Extended_Pictographic}/u;
const SENTENCE_END = /[.!?…]+(?=\s|$)/g;

/** Returns the trimmed rationale, or null when it breaks the output rules. */
export const checkOutput = (text: string): string | null => {
  const trimmed = text.trim().replace(/\s+/g, ' ');
  if (!trimmed || trimmed.length > MAX_RATIONALE_CHARS) return null;
  if (LINK.test(trimmed) || trimmed.includes('@') || MARKDOWN.test(trimmed)) return null;
  if (EMOJI.test(trimmed)) return null;
  const sentences = trimmed.split(SENTENCE_END).filter((part) => part.trim().length > 0);
  return sentences.length <= 2 ? trimmed : null;
};
