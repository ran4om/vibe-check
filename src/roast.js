/**
 * Roast generator — produces a one-liner roast based on the API's worst trait.
 */

const ROASTS = {
  speed: {
    high: [
      "This API replies before you even finish asking. Respect.",
      "So fast it could outrun your deployment pipeline.",
      "Blink and you'll miss the response. In a good way.",
    ],
    mid: [
      "Neither fast nor slow. The beige sedan of APIs.",
      "It's not slow, it's just... thinking really hard.",
      "Responds like a polite person waiting for the other person to stop talking.",
    ],
    low: [
      "This API responds like it's filling out a government form — in triplicate.",
      "Slower than a git rebase on a Monday morning.",
      "If this API were a person, it'd still be loading the question.",
      "You could compile Chromium faster than this API responds.",
      "This API is on island time. Permanently.",
    ],
  },
  consistency: {
    high: [
      "Consistent as gravity. Every response, same vibe.",
      "You could set your watch to these response times.",
    ],
    mid: [
      "Sometimes fast, sometimes... thinking about it.",
      "Like a cat — you never quite know what you're going to get.",
      "Mostly reliable, with occasional main-character moments.",
    ],
    low: [
      "Every request is a surprise party you didn't ask for.",
      "This API has more mood swings than a Twitter timeline.",
      "Response times are a lottery. And you're not winning.",
      "If chaotic was a response pattern, this is it.",
      "This API needs therapy. The response times are all over the place.",
    ],
  },
  size: {
    high: [
      "Lean responses. This API doesn't waste a byte.",
      "Minimal payloads. Every byte earns its spot.",
    ],
    mid: [
      "Payload size is fine. Not lean, not obese. Like most of us.",
      "Could lose a few bytes, but who are we to judge?",
    ],
    low: [
      "Sends more data than a 4K stream. For a JSON response.",
      "This API's payloads need their own CDN.",
      "The response is so large it has chapters.",
      "Are you returning data or an autobiography?",
      "This API treats bandwidth like it's free. It's not.",
    ],
  },
  honesty: {
    high: [
      "Honest status codes. A rare and beautiful thing.",
      "Says what it means, means what it says. Trustworthy.",
    ],
    mid: [
      "Mostly honest. Just don't look too closely at the edge cases.",
      "Status codes are... roughly correct. Close enough?",
    ],
    low: [
      "200 OK but the body says 'error'. This API gaslit me.",
      "Lies with a straight 200 face. Trust issues unlocked.",
      "This API says 'I'm fine' but the body tells a different story.",
      "Status codes and reality diverged long ago.",
      "The status code says success. The body says pain.",
    ],
  },
  headers: {
    high: [
      "Headers are locked down tight. Security team would be proud.",
      "Clean headers, proper content types, compression. A professional.",
    ],
    mid: [
      "Headers are... present. That's something.",
      "Some headers, some missing. Like a half-finished resume.",
    ],
    low: [
      "Sends more headers than a medieval castle. Most of them are useless.",
      "Leaking server info like it's trying to get hacked.",
      "x-powered-by: please-hack-me. Basically.",
      "No rate limiting, no compression, no shame.",
      "This API's headers have the security posture of an open door.",
    ],
  },
};

export function generateRoast(analyses, verdict) {
  // Roast based on worst trait primarily
  const worstKey = verdict.worstTrait.name;
  const worstScore = verdict.worstTrait.score;

  let tier;
  if (worstScore >= 70) tier = 'high';
  else if (worstScore >= 40) tier = 'mid';
  else tier = 'low';

  const roastPool = ROASTS[worstKey]?.[tier] || ROASTS.speed.mid;
  const roast = roastPool[Math.floor(Math.random() * roastPool.length)];

  return roast;
}
