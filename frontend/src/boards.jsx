/**
 * boards.jsx
 * - loadBoards(html): parse boards.html or fallback to generated boards
 * - getBoard(id): return board array (25 entries) or null
 *
 * Improvements:
 * - fallback generation expanded to 1..200
 * - on-demand generation if a requested board id is missing (fixes "Board 53 not found")
 */

const BOARDS_CACHE = {};
let initialized = false;

function parseBoardsFromHtml(html) {
  const container = document.createElement("div");
  container.innerHTML = html;
  const boardNodes = Array.from(container.querySelectorAll(".bingo-board"));
  const result = {};

  for (const node of boardNodes) {
    const title = node.querySelector(".board-title")?.textContent?.trim() || "";
    const match = title.match(/Board\s+(\d+)/i);
    const id = match ? Number(match[1]) : NaN;
    const cells = Array.from(node.querySelectorAll(".cell")).map((el) => {
      const he = el;
      if (he.classList.contains("free") || /free/i.test(he.textContent || "")) return -1;
      const txt = (he.textContent || "").trim();
      const n = Number(txt.replace(/[^\d-]/g, ""));
      return Number.isFinite(n) ? n : 0;
    });
    if (!Number.isNaN(id) && cells.length === 25) {
      result[id] = cells;
    }
  }
  return result;
}

function generateBoard(seed = 1) {
  const pool = Array.from({ length: 75 }, (_, i) => i + 1);
  let s = (seed >>> 0) || 1;
  const rnd = () => {
    s = (s * 16807) % 2147483647;
    return (s % 1000) / 1000;
  };
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const board = pool.slice(0, 25);
  board[12] = -1; // center free
  return board;
}

export function loadBoards(html) {
  try {
    if (typeof html === "string" && html.trim()) {
      const parsed = parseBoardsFromHtml(html);
      if (Object.keys(parsed).length > 0) {
        for (const k of Object.keys(parsed)) BOARDS_CACHE[Number(k)] = parsed[k];
        initialized = true;
        console.log(`Loaded ${Object.keys(parsed).length} boards from HTML`);
        return;
      }
    }
  } catch (e) {
    console.warn("Failed to parse boards.html, falling back to generated boards", e);
  }

  // fallback generate boards 1..200 (was 1..50 previously)
  for (let id = 1; id <= 200; id++) {
    BOARDS_CACHE[id] = generateBoard(id);
  }
  initialized = true;
  console.log(`Generated ${Object.keys(BOARDS_CACHE).length} fallback boards`);
}

export function getBoard(id) {
  if (!initialized) {
    // lazy initialize fallback
    for (let i = 1; i <= 200; i++) BOARDS_CACHE[i] = generateBoard(i);
    initialized = true;
  }
  if (!id && id !== 0) return null;
  const n = Number(id);
  if (!Number.isFinite(n)) return null;

  // If this id is not present, generate boards up to that id (on-demand)
  if (!BOARDS_CACHE[n]) {
    // generate up to the requested id (cap growth to avoid runaway)
    const cap = Math.max(n, 200);
    for (let i = 1; i <= cap; i++) {
      if (!BOARDS_CACHE[i]) BOARDS_CACHE[i] = generateBoard(i);
    }
  }

  return BOARDS_CACHE[n] || null;
}

export default { loadBoards, getBoard };