/**
 * Roast generator — produces a one-liner roast based on the API's worst trait.
 * Roasts are stored in a flat indexed array (0–29) shared with the web frontend.
 */

export const ROASTS = [
  // Speed — good (0–2)
  "This API replies before you even finish asking. Respect.",
  "So fast it could outrun your deployment pipeline.",
  "Blink and you'll miss the response. In a good way.",
  // Speed — mid (3–4)
  "Neither fast nor slow. The beige sedan of APIs.",
  "It's not slow, it's just... thinking really hard.",
  // Speed — bad (5–9)
  "This API responds like it's filling out a government form — in triplicate.",
  "Slower than a git rebase on a Monday morning.",
  "If this API were a person, it'd still be loading the question.",
  "You could compile Chromium faster than this API responds.",
  "This API is on island time. Permanently.",
  // Consistency — good (10–11)
  "Consistent as gravity. Every response, same vibe.",
  "You could set your watch to these response times.",
  // Consistency — mid (12–13)
  "Sometimes fast, sometimes... thinking about it.",
  "Mostly reliable, with occasional main-character moments.",
  // Consistency — bad (14–17)
  "Every request is a surprise party you didn't ask for.",
  "This API has more mood swings than a Twitter timeline.",
  "Response times are a lottery. And you're not winning.",
  "This API needs therapy. The response times are all over the place.",
  // Size — good (18)
  "Lean responses. This API doesn't waste a byte.",
  // Size — bad (19–20)
  "Sends more data than a 4K stream. For a JSON response.",
  "The response is so large it has chapters.",
  // Honesty — good (21)
  "Honest status codes. A rare and beautiful thing.",
  // Honesty — bad (22–24)
  "200 OK but the body says 'error'. This API gaslit me.",
  "Lies with a straight 200 face. Trust issues unlocked.",
  "The status code says success. The body says pain.",
  // Headers — good (25)
  "Headers are locked down tight. Security team would be proud.",
  // Headers — bad (26–29)
  "Sends more headers than a medieval castle. Most of them are useless.",
  "Leaking server info like it's trying to get hacked.",
  "x-powered-by: please-hack-me. Basically.",
  "No rate limiting, no compression, no shame.",
];
// Total: 30 roasts (indices 0–29)

const ROAST_RANGES = {
  speed:       { high: [0, 2],   mid: [3, 4],   low: [5, 9] },
  consistency: { high: [10, 11], mid: [12, 13], low: [14, 17] },
  size:        { high: [18, 18], mid: [18, 18], low: [19, 20] },
  honesty:     { high: [21, 21], mid: [21, 21], low: [22, 24] },
  headers:     { high: [25, 25], mid: [25, 25], low: [26, 29] },
};

/**
 * Returns { text, index } so the CLI can encode the index in the share URL.
 */
export function generateRoast(analyses, verdict) {
  const worstKey = verdict.worstTrait.name;
  const worstScore = verdict.worstTrait.score;

  let tier;
  if (worstScore >= 70) tier = 'high';
  else if (worstScore >= 40) tier = 'mid';
  else tier = 'low';

  const range = ROAST_RANGES[worstKey]?.[tier] || ROAST_RANGES.speed.mid;
  const [start, end] = range;
  const index = start + Math.floor(Math.random() * (end - start + 1));

  return { text: ROASTS[index], index };
}
