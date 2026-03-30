/**
 * Headers analyzer — evaluates header hygiene, security posture, and best practices.
 */
export function analyzeHeaders(results) {
  const successful = results.filter(r => !r.error && Object.keys(r.headers).length > 0);

  if (successful.length === 0) {
    return {
      score: 30,
      label: 'Unknown',
      emoji: '❓',
      stats: { checks: {}, headerCount: 0 },
      detail: 'No headers to analyze.',
    };
  }

  // Use the first successful response's headers as representative
  const headers = successful[0].headers;
  const headerKeys = Object.keys(headers).map(k => k.toLowerCase());

  const checks = {};

  // Security headers
  checks.cors = headerKeys.some(h => h.startsWith('access-control-'));
  checks.hsts = headerKeys.includes('strict-transport-security');
  checks.contentType = headerKeys.includes('content-type');
  checks.csp = headerKeys.includes('content-security-policy');
  checks.xFrameOptions = headerKeys.includes('x-frame-options');
  checks.xContentType = headerKeys.includes('x-content-type-options');

  // Good practices
  checks.cacheControl = headerKeys.includes('cache-control');
  checks.rateLimit = headerKeys.some(h =>
    h.includes('ratelimit') || h.includes('rate-limit') || h.includes('x-ratelimit')
  );
  checks.requestId = headerKeys.some(h =>
    h.includes('request-id') || h.includes('trace-id') || h.includes('correlation-id')
  );
  checks.compression = headerKeys.includes('content-encoding');

  // Bad practices
  checks.serverLeaked = headerKeys.includes('server');
  checks.poweredByLeaked = headerKeys.includes('x-powered-by');

  const serverValue = headers['server'] || '';
  const poweredBy = headers['x-powered-by'] || '';

  // Score calculation
  let score = 50; // baseline

  // Good things (add points)
  if (checks.contentType) score += 5;
  if (checks.cacheControl) score += 5;
  if (checks.compression) score += 8;
  if (checks.rateLimit) score += 8;
  if (checks.requestId) score += 5;
  if (checks.hsts) score += 5;
  if (checks.xContentType) score += 4;

  // Bad things (subtract points)
  if (checks.serverLeaked) score -= 5;
  if (checks.poweredByLeaked) score -= 8;
  if (!checks.contentType) score -= 10;

  score = Math.round(Math.max(0, Math.min(100, score)));

  const stats = {
    checks,
    headerCount: headerKeys.length,
    serverValue: checks.serverLeaked ? serverValue : null,
    poweredBy: checks.poweredByLeaked ? poweredBy : null,
  };

  const { label, emoji } = getHeadersLabel(score);

  return {
    score,
    label,
    emoji,
    stats,
    detail: buildHeadersDetail(stats, label),
  };
}

function getHeadersLabel(score) {
  if (score >= 85) return { label: 'Fort Knox', emoji: '🏰' };
  if (score >= 70) return { label: 'Buttoned Up', emoji: '👔' };
  if (score >= 55) return { label: 'Casual', emoji: '👕' };
  if (score >= 35) return { label: 'Sloppy', emoji: '🩳' };
  if (score >= 15) return { label: 'Reckless', emoji: '😬' };
  return { label: 'Naked', emoji: '🫣' };
}

function buildHeadersDetail(stats, label) {
  const issues = [];
  if (stats.poweredBy) issues.push(`Leaking x-powered-by: "${stats.poweredBy}"`);
  if (stats.serverValue) issues.push(`Server header exposed: "${stats.serverValue}"`);
  if (!stats.checks.compression) issues.push('No compression');
  if (!stats.checks.rateLimit) issues.push('No rate limiting headers');
  if (!stats.checks.contentType) issues.push('Missing content-type');

  if (issues.length === 0) return `${stats.headerCount} headers. Clean setup. Nothing leaking.`;
  if (issues.length <= 2) return issues.join('. ') + '.';
  return `${issues.length} issues: ${issues.slice(0, 2).join(', ')}, and more.`;
}
