import { Command } from 'commander';
import { probe } from './probe.js';
import { analyzeSpeed } from './analyzers/speed.js';
import { analyzeConsistency } from './analyzers/consistency.js';
import { analyzeSize } from './analyzers/size.js';
import { analyzeHonesty } from './analyzers/honesty.js';
import { analyzeHeaders } from './analyzers/headers.js';
import { computeVerdict } from './verdict.js';
import { generateRoast } from './roast.js';
import { renderTerminal, renderHeader } from './ui/terminal.js';
import { generateShareUrl, shareToGist } from './ui/share.js';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const pkg = require('../package.json');

export async function run() {
  const program = new Command();

  program
    .name('@ran4om/vibe-check')
    .description('Give any API a personality report 🔮')
    .version(pkg.version)
    .argument('<url>', 'The API endpoint URL to vibe-check')
    .option('-n, --requests <number>', 'Number of requests to fire', '20')
    .option('-m, --method <method>', 'HTTP method', 'GET')
    .option('-H, --header <header...>', 'Custom headers (format: "Key: Value")')
    .option('-b, --body <json>', 'Request body (JSON string)')
    .option('-t, --timeout <ms>', 'Request timeout in milliseconds', '10000')
    .option('--json', 'Output raw JSON instead of styled terminal')
    .option('--gist', 'Also share your vibe report via GitHub Gist')
    .option('--no-color', 'Disable colored output')
    .action(async (url, options) => {
      try {
        // Validate URL
        let targetUrl;
        try {
          targetUrl = new URL(url.startsWith('http') ? url : `https://${url}`);
        } catch {
          console.error('❌ Invalid URL. Try: npx @ran4om/vibe-check https://api.example.com/endpoint');
          process.exit(1);
        }

        // Parse headers
        const headers = {};
        if (options.header) {
          for (const h of options.header) {
            const colonIdx = h.indexOf(':');
            if (colonIdx === -1) {
              console.error(`❌ Invalid header format: "${h}". Use "Key: Value"`);
              process.exit(1);
            }
            headers[h.slice(0, colonIdx).trim()] = h.slice(colonIdx + 1).trim();
          }
        }

        const requestCount = parseInt(options.requests, 10);
        const timeout = parseInt(options.timeout, 10);

        // Phase 0: Print header (unless JSON mode)
        if (!options.json) {
          renderHeader(targetUrl.href, requestCount);
        }

        // Phase 1: Probe
        const results = await probe(targetUrl.href, {
          count: requestCount,
          method: options.method,
          headers,
          body: options.body,
          timeout,
          silent: !!options.json,
        });

        // Phase 2: Analyze
        const analyses = {
          speed: analyzeSpeed(results),
          consistency: analyzeConsistency(results),
          size: analyzeSize(results),
          honesty: analyzeHonesty(results),
          headers: analyzeHeaders(results),
        };

        // Phase 3: Verdict
        const verdict = computeVerdict(analyses);

        // Phase 4: Roast (returns { text, index })
        const roast = generateRoast(analyses, verdict);

        // Phase 5: Generate share URL
        const shareUrl = generateShareUrl({
          url: targetUrl.href,
          verdict,
          analyses,
          roastIndex: roast.index,
        });

        // Phase 6: Output
        const report = {
          url: targetUrl.href,
          timestamp: new Date().toISOString(),
          requestCount,
          analyses,
          verdict,
          roast: roast.text,
          roastIndex: roast.index,
          shareUrl,
        };

        if (options.json) {
          console.log(JSON.stringify(report, null, 2));
        } else {
          renderTerminal(report);
        }

        // Phase 7: Gist (optional)
        if (options.gist) {
          await shareToGist(report);
        }
      } catch (error) {
        console.error(`\n❌ ${error.message}\n`);
        if (process.env.DEBUG) {
          console.error(error.stack);
        }
        process.exit(1);
      }
    });

  program.parse();
}
