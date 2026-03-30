import chalk from 'chalk';
import boxen from 'boxen';
import Table from 'cli-table3';
import { formatBytes } from '../analyzers/size.js';

/**
 * Renders the header box before probing starts.
 */
export function renderHeader(url, requestCount) {
  console.log('');

  const headerContent = [
    '',
    `  ${chalk.bold.hex('#a78bfa')('🔮  vibe-check')}`,
    `  ${chalk.dim('Target:')} ${chalk.cyan(url)}`,
    `  ${chalk.dim(`${requestCount} requests · ${new Date().toLocaleTimeString()}`)}`,
    '',
  ].join('\n');

  console.log(boxen(headerContent, {
    borderStyle: 'round',
    borderColor: '#6d28d9',
    padding: 0,
    margin: { top: 0, bottom: 0, left: 1, right: 1 },
  }));

  console.log('');
}

/**
 * Renders the full report after probing is complete.
 */
export function renderTerminal(report) {
  const { url, analyses, verdict, roast, requestCount } = report;

  console.log('');

  // ── Verdict ──
  const verdictColor = getVerdictColor(verdict.color);
  const bigLabel = verdict.label.toUpperCase().split('').join(' ');

  const verdictContent = [
    '',
    chalk.dim('                 THE VERDICT'),
    '',
    `          ${verdict.emoji}  ${chalk.bold[verdictColor](bigLabel)}`,
    `             ${chalk.dim('Score:')} ${chalk.bold[verdictColor](`${verdict.overallScore}/100`)}`,
    '',
    chalk.italic.dim(`  "${roast}"`),
    '',
  ].join('\n');

  console.log(boxen(verdictContent, {
    borderStyle: 'round',
    borderColor: verdictColor === 'green' ? '#22c55e' :
                 verdictColor === 'cyan' ? '#06b6d4' :
                 verdictColor === 'blue' ? '#3b82f6' :
                 verdictColor === 'yellow' ? '#eab308' :
                 verdictColor === 'red' ? '#ef4444' :
                 verdictColor === 'magenta' ? '#d946ef' : '#f97316',
    padding: { left: 1, right: 1 },
    margin: { left: 1, right: 1 },
  }));

  console.log('');

  // ── Trait Breakdown ──
  const traitTable = new Table({
    chars: {
      'top': '─', 'top-mid': '┬', 'top-left': '┌', 'top-right': '┐',
      'bottom': '─', 'bottom-mid': '┴', 'bottom-left': '└', 'bottom-right': '┘',
      'left': '│', 'left-mid': '├', 'mid': '─', 'mid-mid': '┼',
      'right': '│', 'right-mid': '┤', 'middle': '│',
    },
    style: {
      head: [],
      border: ['gray'],
      compact: false,
    },
    colWidths: [16, 24, 8, 22],
  });

  traitTable.push(
    [chalk.bold.dim('  Trait'), chalk.bold.dim('  Bar'), chalk.bold.dim(' Score'), chalk.bold.dim('  Label')]
  );

  const traitNames = {
    speed: 'Speed',
    consistency: 'Consistency',
    size: 'Size',
    honesty: 'Honesty',
    headers: 'Headers',
  };

  for (const trait of verdict.traits) {
    const name = traitNames[trait.name] || trait.name;
    const bar = renderScoreBar(trait.score, 14);
    const scoreColor = trait.score >= 70 ? 'green' : trait.score >= 40 ? 'yellow' : 'red';
    const scoreStr = chalk[scoreColor](String(trait.score).padStart(3));
    const labelStr = `${trait.emoji} ${trait.label}`;

    traitTable.push([
      `  ${chalk.bold(name)}`,
      `  ${bar}`,
      ` ${scoreStr}`,
      `  ${labelStr}`,
    ]);
  }

  console.log(traitTable.toString());
  console.log('');

  // ── Quick Stats ──
  const speedStats = analyses.speed.stats;
  const sizeStats = analyses.size.stats;
  const honestyStats = analyses.honesty.stats;

  const statusSummary = Object.entries(honestyStats.statusCodes || {})
    .map(([code, count]) => `${code} (${count}/${requestCount})`)
    .join(', ') || 'N/A';

  const statsTable = new Table({
    chars: {
      'top': '─', 'top-mid': '┬', 'top-left': '┌', 'top-right': '┐',
      'bottom': '─', 'bottom-mid': '┴', 'bottom-left': '└', 'bottom-right': '┘',
      'left': '│', 'left-mid': '├', 'mid': '─', 'mid-mid': '┼',
      'right': '│', 'right-mid': '┤', 'middle': '│',
    },
    style: { head: [], border: ['gray'] },
    colWidths: [24, 26, 24],
  });

  statsTable.push(
    [
      `  ${chalk.dim('Avg Response')}  ${chalk.bold(`${speedStats.avg}ms`)}`,
      `  ${chalk.dim('Payload')}     ${chalk.bold(formatBytes(sizeStats.avgSize))}`,
      `  ${chalk.dim('Compressed')}  ${sizeStats.compressed ? chalk.green('✓ Yes') : chalk.red('✗ No')}`,
    ],
    [
      `  ${chalk.dim('P95')}           ${chalk.bold(`${speedStats.p95}ms`)}`,
      `  ${chalk.dim('Min / Max')}   ${formatBytes(sizeStats.minSize)} / ${formatBytes(sizeStats.maxSize)}`,
      `  ${chalk.dim('Status')}  ${statusSummary}`,
    ],
  );

  console.log(statsTable.toString());
  console.log('');

  // ── Footer ──
  if (report.shareUrl) {
    console.log(`  ${chalk.bold('🔗 Share →')} ${chalk.cyan.underline(report.shareUrl)}`);
  }
  console.log(chalk.dim(`  📋 Want a Gist? ${chalk.cyan('vibe-check <url> --gist')}`));
  console.log('');
}

/**
 * Renders a colored bar visualization of a score.
 */
function renderScoreBar(score, width) {
  const filled = Math.round((score / 100) * width);
  const empty = width - filled;

  let barColor;
  if (score >= 70) barColor = chalk.green;
  else if (score >= 40) barColor = chalk.yellow;
  else barColor = chalk.red;

  return barColor('█'.repeat(filled)) + chalk.gray('░'.repeat(empty));
}

function getVerdictColor(color) {
  const map = {
    green: 'green',
    cyan: 'cyan',
    blue: 'blue',
    yellow: 'yellow',
    orange: 'yellow', // chalk doesn't have orange, use yellow
    red: 'red',
    magenta: 'magenta',
  };
  return map[color] || 'white';
}
