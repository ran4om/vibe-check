/**
 * Verdict engine — combines all analyzer scores into a final personality profile.
 */

const PERSONALITY_TIERS = [
  { min: 90, label: 'Immaculate',  emoji: '✨', color: 'green',   tagline: 'This API is genuinely elite.' },
  { min: 75, label: 'Snappy',      emoji: '⚡', color: 'cyan',    tagline: 'Fast, reliable, and well-mannered.' },
  { min: 60, label: 'Chill',       emoji: '😎', color: 'blue',    tagline: 'Gets the job done, no drama.' },
  { min: 40, label: 'Mid',         emoji: '🫤', color: 'yellow',  tagline: 'It works... technically.' },
  { min: 25, label: 'Sleepy',      emoji: '😴', color: 'orange',  tagline: 'Needs a coffee and a stern talk.' },
  { min: 10, label: 'Chaotic',     emoji: '🌀', color: 'red',     tagline: 'A gambling experience for your users.' },
  { min: 0,  label: 'Cooked',      emoji: '💀', color: 'magenta', tagline: 'Thoughts and prayers.' },
];

const WEIGHTS = {
  speed: 0.30,
  consistency: 0.25,
  honesty: 0.20,
  size: 0.15,
  headers: 0.10,
};

export function computeVerdict(analyses) {
  // Weighted overall score
  let overallScore = 0;
  for (const [key, weight] of Object.entries(WEIGHTS)) {
    overallScore += (analyses[key]?.score || 0) * weight;
  }
  overallScore = Math.round(overallScore);

  // Find the personality tier
  const tier = PERSONALITY_TIERS.find(t => overallScore >= t.min) || PERSONALITY_TIERS[PERSONALITY_TIERS.length - 1];

  // Find the best and worst traits
  const traitEntries = Object.entries(analyses).map(([key, analysis]) => ({
    name: key,
    score: analysis.score,
    label: analysis.label,
    emoji: analysis.emoji,
  }));

  traitEntries.sort((a, b) => b.score - a.score);
  const bestTrait = traitEntries[0];
  const worstTrait = traitEntries[traitEntries.length - 1];

  return {
    overallScore,
    label: tier.label,
    emoji: tier.emoji,
    color: tier.color,
    tagline: tier.tagline,
    bestTrait,
    worstTrait,
    traits: traitEntries,
  };
}
