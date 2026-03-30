/**
 * Speed analyzer — evaluates response time performance.
 */
export function analyzeSpeed(results) {
  const times = results.filter(r => !r.error).map(r => r.responseTime);

  if (times.length === 0) {
    return {
      score: 0,
      label: 'Dead',
      emoji: '💀',
      stats: { avg: 0, min: 0, max: 0, p50: 0, p95: 0 },
      detail: 'All requests failed — this API is unreachable.',
    };
  }

  const sorted = [...times].sort((a, b) => a - b);
  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const p50 = percentile(sorted, 0.5);
  const p95 = percentile(sorted, 0.95);

  const stats = {
    avg: Math.round(avg),
    min: Math.round(min),
    max: Math.round(max),
    p50: Math.round(p50),
    p95: Math.round(p95),
  };

  // Score based on average response time
  let score;
  if (avg <= 100) score = 100;
  else if (avg <= 200) score = 90;
  else if (avg <= 500) score = 75;
  else if (avg <= 1000) score = 55;
  else if (avg <= 2000) score = 35;
  else if (avg <= 5000) score = 15;
  else score = 5;

  // Penalize if p95 is much worse than average
  const p95Ratio = p95 / Math.max(avg, 1);
  if (p95Ratio > 3) score = Math.max(0, score - 15);
  else if (p95Ratio > 2) score = Math.max(0, score - 8);

  const { label, emoji } = getSpeedLabel(score);

  return {
    score,
    label,
    emoji,
    stats,
    detail: buildSpeedDetail(stats, label),
  };
}

function getSpeedLabel(score) {
  if (score >= 90) return { label: 'Lightning', emoji: '⚡' };
  if (score >= 75) return { label: 'Snappy', emoji: '🏎️' };
  if (score >= 55) return { label: 'Acceptable', emoji: '👍' };
  if (score >= 35) return { label: 'Sluggish', emoji: '🐌' };
  if (score >= 15) return { label: 'Drowsy', emoji: '😴' };
  return { label: 'Comatose', emoji: '💀' };
}

function buildSpeedDetail(stats, label) {
  if (stats.avg <= 100) return `Averaging ${stats.avg}ms — this thing is cracked.`;
  if (stats.avg <= 300) return `${stats.avg}ms average, ${stats.p95}ms at p95. Respectable.`;
  if (stats.avg <= 1000) return `${stats.avg}ms on average. Not terrible, not great.`;
  if (stats.avg <= 3000) return `${stats.avg}ms avg. Go make coffee while it thinks.`;
  return `${stats.avg}ms average. This API is contemplating the meaning of life.`;
}

function percentile(sorted, p) {
  const idx = Math.ceil(p * sorted.length) - 1;
  return sorted[Math.max(0, idx)];
}
