import ora from 'ora';
import chalk from 'chalk';
import { performance } from 'node:perf_hooks';

/**
 * Fire N sequential HTTP requests and collect raw metrics.
 */
export async function probe(url, options = {}) {
  const {
    count = 20,
    method = 'GET',
    headers = {},
    body = undefined,
    timeout = 10000,
    silent = false,
  } = options;

  let spinner = null;
  if (!silent) {
    spinner = ora({
      text: chalk.dim(`  Warming up...`),
      spinner: 'dots12',
      color: 'cyan',
    }).start();
  }

  const results = [];

  for (let i = 0; i < count; i++) {
    if (spinner) {
      const progress = `${String(i + 1).padStart(String(count).length, ' ')}/${count}`;
      const bar = renderBar(i + 1, count, 20);
      spinner.text = chalk.dim(`  ${bar} ${progress}  Probing ${chalk.cyan(truncateUrl(url, 40))}`);
    }

    const result = await fireRequest(url, { method, headers, body, timeout });
    results.push(result);
  }

  if (spinner) {
    spinner.succeed(chalk.dim(`  All ${count} requests complete`));
  }
  return results;
}

async function fireRequest(url, { method, headers, body, timeout }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  const start = performance.now();
  let result;

  try {
    const fetchOptions = {
      method,
      headers: {
        'User-Agent': 'vibe-check/1.0',
        'Accept': 'application/json, text/plain, */*',
        ...headers,
      },
      signal: controller.signal,
    };

    if (body && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
      fetchOptions.body = body;
      if (!headers['Content-Type'] && !headers['content-type']) {
        fetchOptions.headers['Content-Type'] = 'application/json';
      }
    }

    const response = await fetch(url, fetchOptions);
    const elapsed = performance.now() - start;
    const responseBody = await response.text();

    result = {
      statusCode: response.status,
      statusText: response.statusText,
      responseTime: elapsed,
      bodySize: new TextEncoder().encode(responseBody).length,
      body: responseBody,
      headers: Object.fromEntries(response.headers.entries()),
      error: null,
      timedOut: false,
    };
  } catch (err) {
    const elapsed = performance.now() - start;
    result = {
      statusCode: 0,
      statusText: '',
      responseTime: elapsed,
      bodySize: 0,
      body: '',
      headers: {},
      error: err.name === 'AbortError' ? 'Timeout' : err.message,
      timedOut: err.name === 'AbortError',
    };
  } finally {
    clearTimeout(timer);
  }

  return result;
}

function renderBar(current, total, width) {
  const filled = Math.round((current / total) * width);
  const empty = width - filled;
  return chalk.cyan('▓'.repeat(filled)) + chalk.gray('░'.repeat(empty));
}

function truncateUrl(url, maxLen) {
  if (url.length <= maxLen) return url;
  return url.slice(0, maxLen - 3) + '...';
}
