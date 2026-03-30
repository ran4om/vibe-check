/**
 * Size analyzer — evaluates response payload size and compression.
 */
export function analyzeSize(results) {
  const successful = results.filter(r => !r.error && r.bodySize > 0);

  if (successful.length === 0) {
    return {
      score: 50,
      label: 'Unknown',
      emoji: '❓',
      stats: { avgSize: 0, minSize: 0, maxSize: 0, compressed: false },
      detail: 'No successful responses to measure size.',
    };
  }

  const sizes = successful.map(r => r.bodySize);
  const avgSize = sizes.reduce((a, b) => a + b, 0) / sizes.length;
  const minSize = Math.min(...sizes);
  const maxSize = Math.max(...sizes);

  // Check for compression via headers
  const sampleHeaders = successful[0].headers;
  const contentEncoding = sampleHeaders['content-encoding'] || '';
  const compressed = /gzip|br|deflate|zstd/i.test(contentEncoding);
  const transferEncoding = sampleHeaders['transfer-encoding'] || '';

  const stats = {
    avgSize: Math.round(avgSize),
    minSize,
    maxSize,
    compressed,
    contentEncoding: contentEncoding || 'none',
  };

  // Score: smaller is better, with bonus for compression
  let score;
  if (avgSize <= 1024) score = 100;          // <= 1KB
  else if (avgSize <= 5120) score = 90;      // <= 5KB
  else if (avgSize <= 20480) score = 75;     // <= 20KB
  else if (avgSize <= 102400) score = 55;    // <= 100KB
  else if (avgSize <= 512000) score = 35;    // <= 500KB
  else if (avgSize <= 1048576) score = 20;   // <= 1MB
  else score = 5;                             // > 1MB

  // Bonus for compression on larger payloads
  if (compressed && avgSize > 5120) score = Math.min(100, score + 10);
  // Penalty for no compression on large payloads
  if (!compressed && avgSize > 20480) score = Math.max(0, score - 10);

  // Check for size consistency (large variance suggests dynamic/unpredictable responses)
  const sizeVariance = maxSize > 0 ? (maxSize - minSize) / maxSize : 0;
  if (sizeVariance > 0.5) score = Math.max(0, score - 5);

  score = Math.round(Math.max(0, Math.min(100, score)));

  const { label, emoji } = getSizeLabel(score);

  return {
    score,
    label,
    emoji,
    stats,
    detail: buildSizeDetail(stats, label),
  };
}

function getSizeLabel(score) {
  if (score >= 90) return { label: 'Lean', emoji: '🥗' };
  if (score >= 75) return { label: 'Fit', emoji: '💪' };
  if (score >= 55) return { label: 'Normal', emoji: '📦' };
  if (score >= 35) return { label: 'Hefty', emoji: '🍔' };
  if (score >= 15) return { label: 'Chunky', emoji: '🧱' };
  return { label: 'Obese', emoji: '🐘' };
}

function buildSizeDetail(stats, label) {
  const formatted = formatBytes(stats.avgSize);
  if (stats.avgSize <= 1024) return `${formatted} average. Minimalist. Efficient. Chef's kiss.`;
  if (stats.avgSize <= 10240) return `${formatted} average. Lean and to the point.`;
  if (stats.avgSize <= 102400) return `${formatted} average. ${stats.compressed ? 'At least it\'s compressed.' : 'And no compression. Bold choice.'}`;
  if (stats.avgSize <= 1048576) return `${formatted} average. That's a lot of JSON. Are you sending a novel?`;
  return `${formatted} average. This API is sending whole databases per request.`;
}

export function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + units[i];
}
