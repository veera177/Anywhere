/**
 * fix_mojibake.mjs
 * Fixes corrupted UTF-8 / Windows-1252 mojibake characters in all JSX/JS/CSS files.
 * Run once: node fix_mojibake.mjs
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

// Map of mojibake sequences → correct Unicode replacement
const REPLACEMENTS = [
  // ── Arrows ──
  [/â†'/g,  '→'],
  [/â†/g,   '←'],
  [/â†"/g,  '↓'],
  [/â†'/g,  '↑'],
  [/â‰/g,   '≈'],

  // ── Dashes & punctuation ──
  [/â€"/g,  '—'],   // em dash
  [/â€"/g,  '–'],   // en dash
  [/â€¢/g,  '•'],   // bullet
  [/â€˜/g,  '\u2018'], // left single quote
  [/â€™/g,  '\u2019'], // right single quote
  [/â€œ/g,  '\u201C'], // left double quote
  [/â€/g,  '\u201D'],  // right double quote
  [/Â·/g,   '·'],   // middle dot
  [/Â©/g,   '©'],
  [/Â®/g,   '®'],
  [/Â°/g,   '°'],
  [/Â£/g,   '£'],
  [/â€¦/g,  '…'],   // ellipsis

  // ── Box-drawing (used in comments) ──
  [/â"€/g,  '─'],
  [/â"‚/g,  '│'],
  [/â"/g,   '┌'],
  [/â""/g,  '└'],
  [/â""/g,  '┘'],
  [/â"—/g,  '┗'],
  [/â•/g,   '═'],
  [/â•'/g,  '║'],
  [/â•'/g,  '╒'],
  [/â•š/g,  '╚'],
  [/â••/g,  '╕'],
  [/â•—/g,  '╗'],
  [/â••/g,  '╔'],
  [/â•'/g,  '╟'],
  [/â–/g,   '▐'],

  // ── Stars / ratings ──
  [/â˜…/g,  '★'],
  [/â˜†/g,  '☆'],
  [/â­/g,   '⭐'],

  // ── Checkmarks / X ──
  [/âœ…/g,  '✅'],
  [/âœ"/g,  '✓'],
  [/âœ•/g,  '✕'],
  [/âŒ/g,   '❌'],

  // ── Clock / timer ──
  [/â±/g,   '⏱'],
  [/â¬/g,   '⬤'],

  // ── Food / service emojis ──
  [/ðŸ½ï¸/g, '🍽️'],
  [/ðŸ½/g,  '🍽'],
  [/ðŸ"/g,  '🍔'],
  [/ðŸ›'/g,  '🛒'],
  [/ðŸ'Š/g,  '💊'],
  [/ðŸ"¦/g,  '📦'],
  [/ðŸ"ž/g,  '📞'],
  [/ðŸ"‹/g,  '📋'],
  [/ðŸŽ‰/g,  '🎉'],
  [/ðŸŽ/g,  '🎁'],
  [/ðŸ›µ/g,  '🛵'],
  [/ðŸšµ/g,  '🚵'],
  [/ðŸ"/g,  '📍'],
  [/ðŸ'¨â€ðŸ³/g, '👨‍🍳'],
  [/ðŸ'¨/g,  '👨'],
  [/ðŸ'ðŸ»/g, '👍🏻'],
  [/ðŸ'/g,  '👍'],
  [/ðŸŸ¢/g,  '🟢'],
  [/ðŸŸ /g,  '🟠'],
  [/ðŸŸ¡/g,  '🟡'],
  [/ðŸŸ"/g,  '🟔'],
  [/ðŸ"„/g,  '🔄'],
  [/ðŸ"'/g,  '🔒'],
  [/ðŸ""/g,  '🔓'],
  [/ðŸ"Š/g,  '📊'],
  [/ðŸ"ˆ/g,  '📈'],
  [/ðŸ—º/g,  '🗺'],
  [/ðŸ /g,  '🏠'],
  [/ðŸ¢/g,  '🏢'],
  [/ðŸ¬/g,  '🏬'],
  [/ðŸ'/g,  '🏡'],
  [/ðŸ†˜/g,  '🆘'],
  [/ðŸ¤/g,  '🤝'],
  [/ðŸ'°/g,  '💰'],
  [/ðŸ'³/g,  '💳'],
  [/ðŸ'µ/g,  '💵'],
  [/ðŸ§¾/g,  '🧾'],
  [/ðŸŽ¯/g,  '🎯'],
  [/ðŸ"¬/g,  '🔬'],
  [/ðŸ'‰/g,  '💉'],
  [/ðŸ"/g,  '🔎'],
  [/ðŸ"š/g,  '📚'],
  [/ðŸ"…/g,  '📅'],
  [/ðŸ—"/g,  '🗓'],
  [/â€/g,  '—'],   // catch-all for remaining em-dash fragments
  [/ðŸ'ˆ/g,  '👈'],
  [/ðŸ'‡/g,  '👇'],
  [/ðŸ'†/g,  '👆'],
  [/ðŸ'¡/g,  '💡'],
  [/ðŸ"¡/g,  '📡'],
  [/ðŸ""/g,  '🔔'],
  [/ðŸ"•/g,  '🔕'],
  [/ðŸ"§/g,  '🔧'],
  [/ðŸ"¨/g,  '🔨'],
  [/ðŸ'·/g,  '👷'],
  [/ðŸš€/g,  '🚀'],
  [/ðŸŒ/g,  '🌍'],
  [/ðŸŒ™/g,  '🌙'],
  [/â˜€/g,  '☀'],
  [/ðŸ'™/g,  '💙'],
  [/ðŸ'š/g,  '💚'],
  [/ðŸ'›/g,  '💛'],
  [/ðŸ'œ/g,  '💜'],
  [/ðŸ–¤/g,  '🖤'],
  [/ðŸ¤/g,  '🤍'],

  // ── Rupee / currency ──
  [/â‚¹/g,   '₹'],
  [/Ã¢â‚¬â„¢/g, '\''],

  // ── Subscript/superscript artifacts ──
  [/Ã/g,    ''],   // lone Ã with nothing after it (leftover byte)

  // ── Copyright year artifacts ──
  [/Â© 2026/g, '© 2026'],
  [/Â© 2025/g, '© 2025'],
  [/Â©/g, '©'],
];

const EXTENSIONS = new Set(['.jsx', '.js', '.ts', '.tsx', '.css', '.html']);
let fixedCount = 0;
let fileCount  = 0;

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === '.git' || entry === 'dist') continue;
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) { walk(full); continue; }
    if (!EXTENSIONS.has(extname(full).toLowerCase())) continue;

    const original = readFileSync(full, 'utf8');
    let fixed = original;
    for (const [pattern, replacement] of REPLACEMENTS) {
      fixed = fixed.replace(pattern, replacement);
    }
    if (fixed !== original) {
      writeFileSync(full, fixed, 'utf8');
      fixedCount++;
      console.log(`  fixed: ${full.replace(process.cwd(), '.')}`);
    }
    fileCount++;
  }
}

const SRC = 'C:\\Users\\veera vadivelan\\OneDrive\\Desktop\\react\\my-react-app\\src';
console.log(`Scanning: ${SRC}`);
walk(SRC);
console.log(`\nDone. Scanned ${fileCount} files, fixed ${fixedCount} files.`);
