/**
 * Consistency analyzer — measures response time variance and reliability.
 */
export function analyzeConsistency(results) {
  const times = results.filter(r => !r.error).map(r => r.responseTime);
  const errorCount = results.filter(r => r.error).length;
  const totalCount = results.length;

  if (times.length === 0) {
    return {
      score: 0,
      label: 'Flatlined',
      emoji: '💀',
      stats: { stdDev: 0, cv: 0, errorRate: 100, outliers: 0 },
      detail: 'Cannot measure consistency when nothing works.',
    };
  }

  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  const variance = times.reduce((sum, t) => sum + (t - avg) ** 2, 0) / times.length;
  const stdDev = Math.sqrt(variance);
  const cv = avg > 0 ? (stdDev / avg) * 100 : 0; // coefficient of variation as %

  // Detect outliers (> 2 stdDevs from mean)
  const outliers = times.filter(t => Math.abs(t - avg) > 2 * stdDev).length;

  const errorRate = (errorCount / totalCount) * 100;

  const stats = {
    stdDev: Math.round(stdDev),
    cv: Math.round(cv),
    errorRate: Math.round(errorRate),
    outliers,
  };

  // Score: low CV = consistent = high score
  let score;
  if (cv <= 5) score = 100;
  else if (cv <= 10) score = 90;
  else if (cv <= 20) score = 75;
  else if (cv <= 35) score = 55;
  else if (cv <= 50) score = 35;
  else if (cv <= 80) score = 20;
  else score = 5;

  // Penalize for errors
  if (errorRate > 0) score = Math.max(0, score - errorRate * 2);

  // Penalize for outliers
  const outlierRate = (outliers / times.length) * 100;
  if (outlierRate > 20) score = Math.max(0, score - 15);
  else if (outlierRate > 10) score = Math.max(0, score - 8);

  score = Math.round(Math.max(0, Math.min(100, score)));

  const { label, emoji } = getConsistencyLabel(score);

  return {
    score,
    label,
    emoji,
    stats,
    detail: buildConsistencyDetail(stats, label),
  };
}

function getConsistencyLabel(score) {
  if (score >= 90) return { label: 'Rock Solid', emoji: '🪨' };
  if (score >= 75) return { label: 'Steady', emoji: '📏' };
  if (score >= 55) return { label: 'Wavering', emoji: '〰️' };
  if (score >= 35) return { label: 'Mood Swings', emoji: '🎭' };
  if (score >= 15) return { label: 'Unpredictable', emoji: '🎲' };
  return { label: 'Chaotic', emoji: '🌀' };
}

function buildConsistencyDetail(stats, label) {
  if (stats.cv <= 10) return `CV of ${stats.cv}%. Responses are tight. Predictable as sunrise.`;
  if (stats.cv <= 25) return `CV of ${stats.cv}%. Mostly stable with minor wobble.`;
  if (stats.cv <= 50) return `CV of ${stats.cv}%. This API can't make up its mind.`;
  return `CV of ${stats.cv}%. Response times are all over the map. Good luck planning for this.`;
}
