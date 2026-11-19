import { ToolDefinition } from '../types';
import { getLocalizedTool } from '../data/languages';

const SEARCH_STOP_WORDS = new Set([
  'to',
  'into',
  'from',
  'in',
  'for',
  'of',
  'and',
  'the',
  'a',
  'an',
  'tool',
  'tools',
  'converter',
  'convert',
  'online',
  'free'
]);

export interface ToolSearchMatch {
  tool: ToolDefinition;
  score: number;
}

/**
 * Deterministic relevance-ranked tool search across all Mimage tools.
 * Handles exact format pairs ("svg to png", "svg png", "svg-to-png"),
 * localized titles, short/long-tail keywords, and natural-language intents.
 */
export function searchTools(
  rawQuery: string,
  tools: ToolDefinition[],
  lang: string = 'en'
): ToolDefinition[] {
  const trimmed = rawQuery.trim().toLowerCase();
  if (!trimmed) return tools;

  const normalizedPhrase = trimmed.replace(/[→>/_-]+/g, ' ').replace(/\s+/g, ' ').trim();
  const hyphenSlug = normalizedPhrase.replace(/\s+/g, '-');
  const allTokens = normalizedPhrase.split(' ').filter(Boolean);
  const coreTokens = allTokens.filter((tok) => !SEARCH_STOP_WORDS.has(tok));
  const effectiveTokens = coreTokens.length > 0 ? coreTokens : allTokens;

  const scored: ToolSearchMatch[] = [];

  for (const tool of tools) {
    const localized = getLocalizedTool(tool, lang);
    const nameLower = tool.name.toLowerCase();
    const locNameLower = localized.name.toLowerCase();
    const slugLower = tool.slug.toLowerCase();
    const idLower = tool.id.toLowerCase();
    const fromLower = tool.fromFormat.toLowerCase();
    const toLower = tool.toFormat.toLowerCase();
    const descLower = `${localized.shortDescription} ${tool.shortDescription}`.toLowerCase();
    const categoryLower = tool.categoryName.toLowerCase();
    const shortTailJoined = tool.seoKeywords.shortTail.join(' | ').toLowerCase();
    const longTailJoined = tool.seoKeywords.longTail.join(' | ').toLowerCase();

    const fullSearchableCorpus = [
      locNameLower,
      nameLower,
      slugLower.replace(/-/g, ' '),
      fromLower,
      toLower,
      categoryLower,
      descLower,
      shortTailJoined,
      longTailJoined
    ].join(' ');

    let score = 0;

    // 1. Exact slug or ID match (e.g. "svg-to-png" or "svg to png")
    if (slugLower === hyphenSlug || idLower === hyphenSlug || slugLower === trimmed) {
      score += 300;
    }

    // 2. Exact format direction pair match ("svg to png" or "svg png")
    const pairRegex = /^([a-z0-9]+)\s+(?:to|into)?\s*([a-z0-9]+)$/;
    const pairMatch = normalizedPhrase.match(pairRegex);
    if (pairMatch) {
      const [, srcQuery, dstQuery] = pairMatch;
      if (fromLower === srcQuery && toLower === dstQuery) {
        score += 240;
      } else if (
        fromLower.includes(srcQuery) &&
        toLower.includes(dstQuery) &&
        srcQuery !== dstQuery
      ) {
        score += 170;
      } else if (fromLower === dstQuery && toLower === srcQuery) {
        // Reverse direction gets lower fallback score so user still sees inverse converter nearby
        score += 45;
      }
    }

    // 3. Exact or prefix title matches
    if (locNameLower === normalizedPhrase || nameLower === normalizedPhrase) {
      score += 220;
    } else if (locNameLower.startsWith(normalizedPhrase) || nameLower.startsWith(normalizedPhrase)) {
      score += 140;
    } else if (locNameLower.includes(normalizedPhrase) || nameLower.includes(normalizedPhrase)) {
      score += 110;
    }

    // 4. Keyword array & description phrase matches
    if (tool.seoKeywords.shortTail.some((kw) => kw.toLowerCase() === normalizedPhrase)) {
      score += 130;
    } else if (shortTailJoined.includes(normalizedPhrase)) {
      score += 75;
    }

    if (longTailJoined.includes(normalizedPhrase)) {
      score += 55;
    }

    if (descLower.includes(normalizedPhrase)) {
      score += 40;
    }

    // 5. Token-by-token coverage across title, format tags, and corpus
    let matchedCoreTokens = 0;
    let titleTokenMatches = 0;

    for (const tok of effectiveTokens) {
      if (fullSearchableCorpus.includes(tok)) {
        matchedCoreTokens++;
      }
      if (locNameLower.includes(tok) || nameLower.includes(tok) || fromLower === tok || toLower === tok) {
        titleTokenMatches++;
      }
    }

    if (effectiveTokens.length > 0 && matchedCoreTokens === effectiveTokens.length) {
      score += 65 + titleTokenMatches * 22;

      // Extra directional order check for multi-token queries (e.g. "svg png")
      if (effectiveTokens.length >= 2) {
        const firstTok = effectiveTokens[0];
        const lastTok = effectiveTokens[effectiveTokens.length - 1];
        if (fromLower.includes(firstTok) && toLower.includes(lastTok)) {
          score += 75;
        }
      }
    } else if (effectiveTokens.length > 1 && matchedCoreTokens >= Math.ceil(effectiveTokens.length * 0.6)) {
      score += matchedCoreTokens * 12;
    }

    if (score > 0) {
      scored.push({ tool, score });
    }
  }

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const popA = (a.tool.isPopular ? 2 : 0) + (a.tool.isRecommended ? 1 : 0);
    const popB = (b.tool.isPopular ? 2 : 0) + (b.tool.isRecommended ? 1 : 0);
    if (popB !== popA) return popB - popA;
    return a.tool.name.localeCompare(b.tool.name);
  });

  return scored.map((entry) => entry.tool);
}
