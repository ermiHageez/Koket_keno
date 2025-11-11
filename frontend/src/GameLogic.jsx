// (JSX version of your GameLogic utilities)
export const checkBingo = (board, markedNumbers) => {
  if (!Array.isArray(board) || board.length !== 25) return false;

  // rows
  for (let r = 0; r < 5; r++) {
    let count = 0;
    for (let c = 0; c < 5; c++) {
      const n = board[r * 5 + c];
      if (n === -1 || markedNumbers.has(n)) count++;
    }
    if (count === 5) return true;
  }

  // cols
  for (let c = 0; c < 5; c++) {
    let count = 0;
    for (let r = 0; r < 5; r++) {
      const n = board[r * 5 + c];
      if (n === -1 || markedNumbers.has(n)) count++;
    }
    if (count === 5) return true;
  }

  // diagonals
  let c1 = 0, c2 = 0;
  for (let i = 0; i < 5; i++) {
    const n1 = board[i * 5 + i];
    const n2 = board[i * 5 + (4 - i)];
    if (n1 === -1 || markedNumbers.has(n1)) c1++;
    if (n2 === -1 || markedNumbers.has(n2)) c2++;
  }
  return c1 === 5 || c2 === 5;
};

export const canBingo = (picks, getBoard, markedNumbers) => {
  if (!Array.isArray(picks)) return false;
  return picks.some((id) => {
    const b = getBoard(id);
    return b ? checkBingo(b, markedNumbers) : false;
  });
};

export const hasBingoIncludingLastCalled = (picks, getBoard, lastCalled, markedNumbers, called, autoAlgoMark, autoMark = false) => {
  if (!lastCalled) return false;
  // if auto-mark (user) or auto-algo marking is enabled, consider 'called' as the effective marks
  const effective = new Set((autoAlgoMark || autoMark) ? called : Array.from(markedNumbers || []));
  for (const id of picks) {
    const grid = getBoard(id);
    if (!grid) continue;
    const lines = [];
    for (let r = 0; r < 5; r++) lines.push([0,1,2,3,4].map(c => grid[r*5 + c]));
    for (let c = 0; c < 5; c++) lines.push([0,1,2,3,4].map(r => grid[r*5 + c]));
    lines.push([0,1,2,3,4].map(i => grid[i*5 + i]));
    lines.push([0,1,2,3,4].map(i => grid[i*5 + (4-i)]));

    for (const line of lines) {
      if (!line.includes(lastCalled)) continue;
      if (line.every(n => n === -1 || effective.has(n))) return true;
    }
  }
  return false;
};

export const numberToLetter = (n) => (n <= 15 ? 'B' : n <= 30 ? 'I' : n <= 45 ? 'N' : n <= 60 ? 'G' : 'O');

export default { checkBingo, canBingo, hasBingoIncludingLastCalled, numberToLetter };