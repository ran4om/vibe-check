/**
 * Honesty analyzer — checks if the API is truthful about its status codes.
 */
export function analyzeHonesty(results) {
  const successful = results.filter(r => !r.error);

  if (successful.length === 0) {
    return {
      score: 0,
      label: 'Ghost',
      emoji: '👻',
      stats: { statusCodes: {}, dishonestCount: 0, emptyBodies: 0 },
      detail: 'Cannot judge honesty when no one\'s home.',
    };
  }

  // Count status codes
  const statusCodes = {};
  for (const r of successful) {
    statusCodes[r.statusCode] = (statusCodes[r.statusCode] || 0) + 1;
  }

  let dishonestCount = 0;
  let emptyBodies = 0;
  let errorInBody = 0;

  for (const r of successful) {
    // Check for empty bodies on 200 OK
    if (r.statusCode === 200 && r.bodySize === 0) {
      emptyBodies++;
    }

    // Check for error-like content in 200 responses
    if (r.statusCode >= 200 && r.statusCode < 300 && r.body) {
      const lower = r.body.toLowerCase();
      const looksLikeError =
        (lower.includes('"error"') && !lower.includes('"error":null') && !lower.includes('"error": null') && !lower.includes('"error":false')) ||
        (lower.includes('"fault"')) ||
        (lower.includes('"exception"')) ||
        (lower.includes('"status":"fail') && !lower.includes('"status":"false')) ||
        (lower.includes('"success":false') || lower.includes('"success": false')) ||
        (lower.includes('"ok":false') || lower.includes('"ok": false'));

      if (looksLikeError) {
        dishonestCount++;
        errorInBody++;
      }
    }
  }

  const stats = {
    statusCodes,
    dishonestCount,
    emptyBodies,
    errorInBody,
    totalSuccessful: successful.length,
  };

  // Score: fewer dishonest signals = higher score
  const totalIssues = dishonestCount + emptyBodies;
  const issueRate = totalIssues / successful.length;

  let score;
  if (issueRate === 0) score = 100;
  else if (issueRate <= 0.05) score = 85;
  else if (issueRate <= 0.15) score = 65;
  else if (issueRate <= 0.3) score = 45;
  else if (issueRate <= 0.5) score = 25;
  else score = 10;

  // Bonus/penalty based on status code diversity
  const uniqueStatuses = Object.keys(statusCodes).length;
  // If we get a mix of 2xx and 4xx/5xx on the same endpoint, that's suspicious
  const has2xx = Object.keys(statusCodes).some(c => c >= 200 && c < 300);
  const hasError = Object.keys(statusCodes).some(c => c >= 400);
  if (has2xx && hasError) {
    score = Math.max(0, score - 15); // Inconsistent status codes for same request = red flag
  }

  score = Math.round(Math.max(0, Math.min(100, score)));

  const { label, emoji } = getHonestyLabel(score);

  return {
    score,
    label,
    emoji,
    stats,
    detail: buildHonestyDetail(stats, label),
  };
}

function getHonestyLabel(score) {
  if (score >= 90) return { label: 'Transparent', emoji: '🪟' };
  if (score >= 75) return { label: 'Mostly Honest', emoji: '😇' };
  if (score >= 55) return { label: 'Sketchy', emoji: '🤨' };
  if (score >= 35) return { label: 'Two-Faced', emoji: '🎭' };
  if (score >= 15) return { label: 'Gaslighter', emoji: '🔥' };
  return { label: 'Pathological Liar', emoji: '🤥' };
}

function buildHonestyDetail(stats, label) {
  const codes = Object.entries(stats.statusCodes)
    .map(([code, count]) => `${code}×${count}`)
    .join(', ');

  if (stats.dishonestCount === 0 && stats.emptyBodies === 0) {
    return `Status codes: [${codes}]. Clean. Says what it means.`;
  }
  if (stats.errorInBody > 0) {
    return `Says 200 OK but the body screams error. ${stats.errorInBody} dishonest response(s).`;
  }
  if (stats.emptyBodies > 0) {
    return `${stats.emptyBodies} empty 200s. OK... but OK *what*?`;
  }
  return `Status codes: [${codes}]. Something's off.`;
}
