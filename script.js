const boardEl = document.getElementById('board');
const statusText = document.getElementById('statusText');
const turnLabel = document.getElementById('turnLabel');
const resetBtn = document.getElementById('resetBtn');
const modeSelect = document.getElementById('modeSelect');
const difficulty = document.getElementById('difficulty');

let board = Array(9).fill(null);
let currentPlayer = 'X';
let gameOver = false;

function init() {
  boardEl.innerHTML = '';
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('button');
    cell.className = 'cell';
    cell.dataset.index = i;
    cell.addEventListener('click', onCellClick);
    boardEl.appendChild(cell);
  }
  board = Array(9).fill(null);
  currentPlayer = 'X';
  gameOver = false;
  updateUI();
  statusText.textContent = 'Haz clic en una casilla para jugar.';
}

function updateUI() {
  const cells = boardEl.children;
  for (let i = 0; i < 9; i++) {
    cells[i].textContent = board[i] || '';
    cells[i].classList.remove("x", "o");
    if (board[i] === "X") cells[i].classList.add("x");
    if (board[i] === "O") cells[i].classList.add("o");
    cells[i].disabled = !!board[i] || gameOver;
  }
  turnLabel.textContent = currentPlayer;
}

function onCellClick(e) {
  const idx = Number(e.target.dataset.index);
  if (gameOver || board[idx]) return;

  if (modeSelect.value === 'human-vs-human') {
    makeMove(idx);
    return;
  }

  if (currentPlayer === 'X') {
    makeMove(idx);
    if (!gameOver) setTimeout(aiMove, 250);
  }
}

function makeMove(idx) {
  if (gameOver || board[idx]) return;
  board[idx] = currentPlayer;
  checkEnd();
  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  updateUI();
}

function aiMove() {
  if (gameOver) return;
  let move = null;

  if (difficulty.value === 'easy') {
    const empties = board.map((v,i)=>v?null:i).filter(v=>v!==null);
    move = empties[Math.floor(Math.random()*empties.length)];
  } else {
    move = bestMove(board, 'O');
  }
  makeMove(move);
}

function checkEnd() {
  const winner = computeWinner(board);
  if (winner) {
    gameOver = true;
    statusText.textContent = `Ganador: ${winner}`;
    highlightWinning(winner);
    return;
  }
  if (board.every(Boolean)) {
    gameOver = true;
    statusText.textContent = 'Empate';
  }
}

function computeWinner(brd) {
  const L = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  for (const [a,b,c] of L) {
    if (brd[a] && brd[a] === brd[b] && brd[a] === brd[c]) return brd[a];
  }
  return null;
}

function highlightWinning() {
  const lines = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  for (const [a,b,c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      const cells = boardEl.children;
      cells[a].style.background = '#18384a';
      cells[b].style.background = '#18384a';
      cells[c].style.background = '#18384a';
    }
  }
}

// Minimax
function bestMove(brd, player) {
  const avail = brd.map((v,i)=>v?null:i).filter(v=>v!==null);
  if (avail.length === 9) return 4;

  let bestScore = -Infinity;
  let move = null;
  for (const i of avail) {
    brd[i] = player;
    const score = minimax(brd, 0, false, player);
    brd[i] = null;
    if (score > bestScore) {
      bestScore = score;
      move = i;
    }
  }
  return move;
}

function minimax(brd, depth, isMax, player) {
  const opponent = player === 'X' ? 'O' : 'X';
  const winner = computeWinner(brd);

  if (winner === player) return 10 - depth;
  if (winner === opponent) return depth - 10;
  if (brd.every(Boolean)) return 0;

  const avail = brd.map((v,i)=>v?null:i).filter(v=>v!==null);

  if (isMax) {
    let best = -Infinity;
    for (const i of avail) {
      brd[i] = player;
      const score = minimax(brd, depth+1, false, player);
      brd[i] = null;
      best = Math.max(best, score);
    }
    return best;
  } else {
    let best = Infinity;
    for (const i of avail) {
      brd[i] = opponent;
      const score = minimax(brd, depth+1, true, player);
      brd[i] = null;
      best = Math.min(best, score);
    }
    return best;
  }
}

resetBtn.addEventListener('click', init);
modeSelect.addEventListener('change', init);
difficulty.addEventListener('change', init);

init();
