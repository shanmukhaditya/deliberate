import http from 'http';
import { DeliberationResult } from './types.js';
import { Synthesizer } from './synthesizer.js';
import { ADRGenerator } from './adr.js';

export class DashboardServer {
  /**
   * Generates the self-contained HTML/CSS/SVG dashboard string
   */
  static renderHtml(result: DeliberationResult): string {
    const bp = result.blueprint;
    const win = bp.winningArchitecture;
    const scores = win.scores || [];
    const dateStr = new Date().toISOString().split('T')[0];

    // Compute SVG Radar Chart points (5 axes: Performance, DX, Simplicity, Security, Extensibility)
    const criteriaOrder = ['performance', 'dx_ergonomics', 'simplicity', 'security', 'extensibility'];
    const scoreMap = new Map(scores.map((s) => [s.criterion, s.score]));
    const cx = 150;
    const cy = 150;
    const r = 100;

    const points = criteriaOrder.map((crit, i) => {
      const score = scoreMap.get(crit as any) || 8.0;
      const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
      const normalizedR = (score / 10) * r;
      const x = cx + normalizedR * Math.cos(angle);
      const y = cy + normalizedR * Math.sin(angle);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
    const polygonPoints = points.join(' ');

    const jsonRaw = JSON.stringify(result, null, 2);
    const mdRaw = Synthesizer.exportToMarkdown(result);
    const adrRaw = ADRGenerator.generate(result);

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>⚡ Deliberate Dashboard: ${bp.title}</title>
  <style>
    :root {
      --bg: #090d16;
      --card-bg: #111827;
      --card-border: #1f293d;
      --text: #f3f4f6;
      --text-dim: #9ca3af;
      --cyan: #06b6d4;
      --magenta: #d946ef;
      --green: #10b981;
      --red: #ef4444;
      --yellow: #f59e0b;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    body { background: var(--bg); color: var(--text); padding: 32px 20px; line-height: 1.6; }
    .container { max-width: 1100px; margin: 0 auto; }
    header { border-bottom: 1px solid var(--card-border); padding-bottom: 24px; margin-bottom: 32px; display: flex; justify-content: space-between; align-items: center; }
    .logo { font-size: 24px; font-weight: 800; color: var(--cyan); letter-spacing: -0.5px; }
    .meta { font-size: 14px; color: var(--text-dim); }
    .hero-card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 12px; padding: 24px; margin-bottom: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 700; text-transform: uppercase; margin-bottom: 12px; }
    .badge-cyan { background: rgba(6, 182, 212, 0.15); color: var(--cyan); border: 1px solid var(--cyan); }
    .badge-score { background: rgba(16, 185, 129, 0.15); color: var(--green); border: 1px solid var(--green); font-size: 14px; }
    h1 { font-size: 26px; margin-bottom: 8px; color: #fff; }
    .summary { font-size: 16px; color: var(--text-dim); margin-bottom: 16px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
    @media (max-width: 800px) { .grid { grid-template-columns: 1fr; } }
    .radar-box { text-align: center; }
    svg { max-width: 100%; height: auto; }
    .section-title { font-size: 18px; font-weight: 700; margin-bottom: 16px; color: var(--cyan); display: flex; align-items: center; gap: 8px; }
    .item-list { list-style: none; }
    .item-list li { background: rgba(255,255,255,0.02); border-left: 3px solid var(--cyan); padding: 12px 16px; margin-bottom: 8px; border-radius: 0 6px 6px 0; font-size: 14px; }
    .item-list.threat li { border-left-color: var(--red); }
    .persona-card { background: rgba(255,255,255,0.03); border: 1px solid var(--card-border); border-radius: 8px; padding: 16px; margin-bottom: 12px; }
    .persona-name { font-weight: 700; color: var(--yellow); margin-bottom: 6px; }
    pre { background: #05070c; border: 1px solid var(--card-border); border-radius: 8px; padding: 16px; overflow-x: auto; font-family: 'JetBrains Mono', Consolas, monospace; font-size: 13px; color: #38bdf8; }
    .btn-group { display: flex; gap: 12px; margin-top: 16px; }
    button, a.btn { background: #1f293d; color: #fff; text-decoration: none; border: 1px solid #374151; padding: 8px 16px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; transition: background 0.2s; display: inline-flex; align-items: center; gap: 6px; }
    button:hover, a.btn:hover { background: #374151; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="logo">⚡ DELIBERATE</div>
      <div class="meta">Date: ${dateStr} | Execution: ${result.executionTimeMs}ms | Mode: ${result.mode}</div>
    </header>

    <div class="hero-card">
      <div style="display:flex; justify-content:space-between; align-items:flex-start;">
        <div>
          <span class="badge badge-cyan">${win.paradigm}</span>
          <h1>${bp.title}</h1>
          <p class="summary">${bp.executiveSummary}</p>
        </div>
        <span class="badge badge-score">PARETO SCORE: ${win.overallScore}/10</span>
      </div>
      <div class="btn-group">
        <button onclick="downloadFile('blueprint.md', markdownData)">📥 Download Blueprint (.md)</button>
        <button onclick="downloadFile('ADR-0001.md', adrData)">📜 Download ADR (.md)</button>
        <button onclick="downloadFile('blueprint.json', jsonData)">📊 Download JSON</button>
      </div>
    </div>

    <div class="grid">
      <div class="hero-card radar-box">
        <div class="section-title">📊 Pareto Trade-Off Radar</div>
        <svg viewBox="0 0 300 300" width="300" height="300">
          <circle cx="150" cy="150" r="100" fill="none" stroke="#1f293d" stroke-dasharray="4"/>
          <circle cx="150" cy="150" r="70" fill="none" stroke="#1f293d" stroke-dasharray="4"/>
          <circle cx="150" cy="150" r="40" fill="none" stroke="#1f293d" stroke-dasharray="4"/>
          <polygon points="${polygonPoints}" fill="rgba(6, 182, 212, 0.25)" stroke="#06b6d4" stroke-width="2"/>
          <text x="150" y="35" text-anchor="middle" fill="#9ca3af" font-size="11">PERFORMANCE</text>
          <text x="265" y="125" text-anchor="start" fill="#9ca3af" font-size="11">DX</text>
          <text x="220" y="270" text-anchor="middle" fill="#9ca3af" font-size="11">SIMPLICITY</text>
          <text x="80" y="270" text-anchor="middle" fill="#9ca3af" font-size="11">SECURITY</text>
          <text x="35" y="125" text-anchor="end" fill="#9ca3af" font-size="11">EXTENSIBILITY</text>
        </svg>
      </div>

      <div class="hero-card">
        <div class="section-title">🛡️ Hard Architectural Invariants</div>
        <ul class="item-list">
          ${bp.coreInvariants.map((inv) => `<li>${inv}</li>`).join('')}
        </ul>
      </div>
    </div>

    <div class="hero-card">
      <div class="section-title">⚠️ Threat Models & Failure Mitigations</div>
      <ul class="item-list threat">
        ${bp.failureModesAndMitigations.map((fm) => `<li><strong>Threat:</strong> ${fm.failureMode}<br><span style="color:var(--green)">↳ Mitigation:</span> ${fm.mitigation}</li>`).join('')}
      </ul>
    </div>

    <div class="hero-card">
      <div class="section-title">🥊 Adversarial Council Critiques (${result.councilDebates?.length || 0} Personas)</div>
      ${(result.councilDebates || [])
        .map(
          (c) => `
        <div class="persona-card">
          <div class="persona-name">👤 ${c.personaName}</div>
          <div style="font-size:14px; margin-bottom:6px;">${c.coreCritique}</div>
          ${c.requiredInvariants?.length ? `<div style="font-size:12px; color:var(--cyan);">Invariants Demanded: ${c.requiredInvariants.join('; ')}</div>` : ''}
        </div>
      `
        )
        .join('')}
    </div>

    ${
      bp.codeSkeleton
        ? `
    <div class="hero-card">
      <div class="section-title">💻 Typed Architectural Scaffold Contract</div>
      <pre><code>${bp.codeSkeleton.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>
    </div>`
        : ''
    }
  </div>

  <script>
    const markdownData = ${JSON.stringify(mdRaw)};
    const adrData = ${JSON.stringify(adrRaw)};
    const jsonData = ${JSON.stringify(jsonRaw)};

    function downloadFile(filename, content) {
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    }
  </script>
</body>
</html>`;
  }

  /**
   * Starts local dashboard server on an available port
   */
  static async start(result: DeliberationResult, basePort = 3333): Promise<{ port: number; url: string; close: () => void }> {
    return new Promise((resolve, reject) => {
      let currentPort = basePort;

      const attemptListen = () => {
        const server = http.createServer((req, res) => {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(DashboardServer.renderHtml(result));
        });

        server.on('error', (err: any) => {
          if (err.code === 'EADDRINUSE') {
            currentPort++;
            attemptListen();
          } else {
            reject(err);
          }
        });

        server.listen(currentPort, () => {
          const url = `http://localhost:${currentPort}`;
          resolve({
            port: currentPort,
            url,
            close: () => server.close(),
          });
        });
      };

      attemptListen();
    });
  }
}
