// Select DOM elements for player names, board, cells, messages, buttons, and sliders
const playerXName = document.querySelector('.player-x-name');
const playerOName = document.querySelector('.player-o-name');
const board = document.querySelector(".board");
const cells = document.querySelectorAll(".cell");
const winningMessage = document.getElementById("winningMessage");
const winningText = document.getElementById("winningText");
const okButton = document.getElementById("okButton");
const scoreX = document.querySelector('.score-x');
const scoreO = document.querySelector('.score-o');
const turnMessage = document.getElementById("turnMessage");
const gameModeToggle = document.getElementById("gameModeToggle");
const gameModeLabels = document.querySelectorAll(".toggle-label");
const resetButton = document.getElementById("resetButton");
const difficultySlider = document.getElementById("difficultySlider");
const difficultyValue = document.getElementById("difficultyValue");
const turnNumberDisplay = document.getElementById("turnNumberDisplay");
const searchDepthDisplay = document.getElementById("searchDepthDisplay");
const maxDepthDisplay = document.getElementById("maxDepthDisplay");

// Initialize variables for game depth, wins, current player, and game mode
let MAX_DEPTH = 5; // You can initialize with the default value of 4
difficultySlider.addEventListener("input", handleSliderChange);

let turnNumber = 0;

turnNumberDisplay.textContent = turnNumber;
searchDepthDisplay.textContent = 0; // Initialize with 0 as the initial search depth
maxDepthDisplay.textContent = MAX_DEPTH;

// Update the MAX_DEPTH value when the slider is changed
function handleSliderChange() {
  MAX_DEPTH = difficultySlider.value;
  difficultyValue.textContent = MAX_DEPTH;
  maxDepthDisplay.textContent = MAX_DEPTH;
}

let winsX = 0;
let winsO = 0;
let currentPlayer = "X";
let gameMode = "computer";

// Set up event listeners for game mode toggle, reset button, board clicks, and ok button
gameModeToggle.checked = true;
gameModeToggle.addEventListener("change", handleGameModeChange);
resetButton.addEventListener("click", handleResetButtonClick);
board.addEventListener("click", handleCellClick);
okButton.addEventListener("click", handleOkButtonClick);

// Initialize the game by handling the game mode change, showing the turn message, and updating label colors
handleGameModeChange();
showTurnMessage("X");
updateLabelColors();

// Handle changes in the game mode (computer or player)
function handleGameModeChange() {
  gameMode = gameModeToggle.checked ? "computer" : "player";
  updateLabelColors();

  if (gameMode === "computer" && currentPlayer === "O") {
    computerMove();
    toggleActivePlayer();
    currentPlayer = "X";
    showTurnMessage(currentPlayer);
  } else {
    if (currentPlayer === "O") {
      toggleActivePlayer();
      currentPlayer = "X";
    }
    showTurnMessage(currentPlayer);
  }
}

// Show a message indicating whose turn it is
function showTurnMessage(player) {
  turnMessage.textContent = `Player ${player}'s turn`;

  turnMessage.style.backgroundColor = player === "X" ? "#4e73df" : "#f93154";
  turnMessage.style.animation = "fadeIn 0.5s, fadeOut 0.5s 1.5s";
  turnMessage.style.opacity = "1";

  setTimeout(() => {
    turnMessage.style.opacity = "0";
  }, 2000);
}

// Toggle the active player's name color
function toggleActivePlayer() {
  playerXName.classList.toggle("active-player");
  playerOName.classList.toggle("active-player");
}

// Show the winning message and update the score for the winning player
function showWinningMessage(player) {
  winningMessage.style.display = "flex";
  winningText.textContent = `Player ${player} wins!`;

  if (player === "X") {
    winsX++;
    scoreX.textContent = winsX;
  } else {
    winsO++;
    scoreO.textContent = winsO;
  }
}

// Hide the winning message
function hideWinningMessage() {
  winningMessage.style.display = "none";
}

// Check if the given player has won the game
function checkWin(player) {
  // Check rows
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 4; col++) {
      const index = row * 7 + col;
      if (
        cells[index].getAttribute("data-player") === player &&
        cells[index + 1].getAttribute("data-player") === player &&
        cells[index + 2].getAttribute("data-player") === player &&
        cells[index + 3].getAttribute("data-player") === player
      ) {
        return true;
      }
    }
  }

  // Check columns
  for (let col = 0; col < 7; col++) {
    for (let row = 0; row < 3; row++) {
      const index = row * 7 + col;
      if (
        cells[index].getAttribute("data-player") === player &&
        cells[index + 7].getAttribute("data-player") === player &&
        cells[index + 14].getAttribute("data-player") === player &&
        cells[index + 21].getAttribute("data-player") === player
      ) {
        return true;
      }
    }
  }

  // Check diagonals (top-left to bottom-right)
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 4; col++) {
      const index = row * 7 + col;
      if (
        cells[index].getAttribute("data-player") === player &&
        cells[index + 8].getAttribute("data-player") === player &&
        cells[index + 16].getAttribute("data-player") === player &&
        cells[index + 24].getAttribute("data-player") === player
      ) {
        return true;
      }
    }
  }

  // Check diagonals (top-right to bottom-left)
  for (let row = 0; row < 3; row++) {
    for (let col = 3; col < 7; col++) {
      const index = row * 7 + col;
      if (
        cells[index].getAttribute("data-player") === player &&
        cells[index + 6].getAttribute("data-player") === player &&
        cells[index + 12].getAttribute("data-player") === player &&
        cells[index + 18].getAttribute("data-player") === player
      ) {
        return true;
      }
    }
  }

  return false;
}

// Reset the board by removing all player attributes and content from cells
function resetBoard() {
  cells.forEach((cell) => {
    cell.removeAttribute("data-player");
    cell.textContent = "";
  });
}

function resetTurnNumber() {
  turnNumber = 0;
  turnNumberDisplay.textContent = turnNumber;
}

// Check if the game is a draw
function isDraw() {
  const availableMoves = getAvailableMoves();
  return (
    Array.from(cells).every((cell) => cell.getAttribute("data-player") !== null) &&
    availableMoves.length === 0
  );
}

// Show the draw message
function showDrawMessage() {
  winningMessage.style.display = "flex";
  winningText.textContent = "It's a draw!";
}

// Find the lowest empty cell in a column
function findLowestEmptyCell(col) {
  for (let row = 5; row >= 0; row--) {
    const cell = cells[row * 7 + col];
    if (cell.getAttribute("data-player") === null) {
      return cell;
    }
  }

  return null;
}

// Handle clicking on a cell
function handleCellClick(event) {
  const clickedCell = event.target;
  const col = parseInt(clickedCell.getAttribute("data-col"));
  const cell = findLowestEmptyCell(col);

  if (!cell) return;

  makeMove(cell, currentPlayer);

  // Increment turnNumber and update turnNumberDisplay after a valid move
  turnNumber++;
  turnNumberDisplay.textContent = turnNumber;

  if (checkWin(currentPlayer)) {
    showWinningMessage(currentPlayer);
  } else if (isDraw()) {
    showDrawMessage();
  } else {
    toggleActivePlayer();
    currentPlayer = currentPlayer === "X" ? "O" : "X";

    if (gameMode === "computer" && currentPlayer === "O") {
      // Add a delay before the computer's move to display the player's move first
      setTimeout(() => {
        computerMove();

        if (checkWin(currentPlayer)) {
          showWinningMessage(currentPlayer);
        } else if (isDraw()) {
          showDrawMessage();
        } else {
          toggleActivePlayer();
          currentPlayer = "X";
          showTurnMessage(currentPlayer);
        }
      }, 100); // You can adjust the delay time (in milliseconds) according to your preference
    } else {
      showTurnMessage(currentPlayer);
    }
  }
}

// Handle clicking the OK button after a win or draw
function handleOkButtonClick() {
  hideWinningMessage();
  resetBoard();
  resetTurnNumber();

  if (currentPlayer === "O") {
    toggleActivePlayer();
    currentPlayer = "X";
  }

  showTurnMessage(currentPlayer);
}

// Handle clicking the reset button
function handleResetButtonClick() {
  resetBoard();
  resetScore();
  resetTurnNumber();

  if (currentPlayer === "O") {
    toggleActivePlayer();
    currentPlayer = "X";
  }

  showTurnMessage(currentPlayer);
}

// Reset the scores for both players
function resetScore() {
  winsX = 0;
  winsO = 0;
  scoreX.textContent = winsX;
  scoreO.textContent = winsO;
}

// Check if a cell is empty
function isCellEmpty(cell) {
  return cell.getAttribute("data-player") === null;
}

// Make a move for the computer player
function computerMove() {
  let bestMove = -1;
  let bestValue = -Infinity;
  const startTime = performance.now();
  const timeLimit = 3000; // Modify this value to set the time limit in milliseconds

  let dynamicMaxDepth = parseInt(difficultySlider.value);
  if (getTurnNumber() >= 4) {
    dynamicMaxDepth += 2;
  }

  let depth = 1;

  while (depth <= dynamicMaxDepth) {
    searchDepthDisplay.textContent = depth;
    const result = alphaBetaMove(currentPlayer, -Infinity, Infinity, depth, true);
    const currentValue = result.value;

    if (currentValue > bestValue) {
      bestValue = currentValue;
      bestMove = result.move;
    }

    if (bestValue === Infinity) {
      break;
    }

    const elapsedTime = performance.now() - startTime;
    if (elapsedTime > timeLimit) {
      break;
    }

    depth++;
  }
  console.log(`Selected move: ${bestMove}, Evaluation value: ${bestValue}`);
  
  if (bestMove === -1) {
    const availableMoves = getAvailableMoves();
    if (availableMoves.length > 0) {
      const randomMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
      const randomCell = findLowestEmptyCell(randomMove);
      makeMove(randomCell, currentPlayer);
    }
    return;
  }

  const bestCell = findLowestEmptyCell(bestMove);
  makeMove(bestCell, currentPlayer);
}

// Determine the best move using the alpha-beta pruning algorithm
function alphaBetaMove(player, alpha, beta, depth, isRoot = false) {
  if (depth === 0 || checkWin("X") || checkWin("O")) {
    return { move: -1, value: evaluateBoard() };
  }

  let availableMoves = getAvailableMoves();

  if (availableMoves.length === 0) {
    return { move: -1, value: depth === MAX_DEPTH ? -1 : evaluateBoard() };
  }

  if (isRoot) {
    // Sort available moves based on their heuristic values for the root node
    availableMoves = availableMoves.sort((moveA, moveB) => {
      const cellA = findLowestEmptyCell(moveA);
      const cellB = findLowestEmptyCell(moveB);
      makeMove(cellA, player);
      makeMove(cellB, player);
      const valueA = evaluateBoard();
      const valueB = evaluateBoard();
      undoMove(cellA);
      undoMove(cellB);
      return valueB - valueA;
    });
  }

  let bestMove = -1;

  if (player === "O") {
    let maxEval = -Infinity;
    for (const move of availableMoves) {
      const cell = findLowestEmptyCell(move);
      makeMove(cell, player);
      const result = alphaBetaMove("X", alpha, beta, depth - 1);
      undoMove(cell);
      if (result.value > maxEval) {
        maxEval = result.value;
        bestMove = move;
      }
      alpha = Math.max(alpha, result.value);
      if (beta <= alpha) {
        break;
      }
    }
    return { move: bestMove, value: alpha };
  } else {
    let minEval = Infinity;
    for (const move of availableMoves) {
      const cell = findLowestEmptyCell(move);
      makeMove(cell, player);
      const result = alphaBetaMove("O", alpha, beta, depth - 1);
      undoMove(cell);
      if (result.value < minEval) {
        minEval = result.value;
        bestMove = move;
      }
      beta = Math.min(beta, result.value);
      if (beta <= alpha) {
        break;
      }
    }
    return { move: bestMove, value: beta };
  }
}

// Evaluate the board to determine the score for the current state
function evaluateBoard() {
  const playerXScore = getScore("X");
  const playerOScore = getScore("O");

  const blockingWeight = 1000; // Adjust this value to prioritize blocking the player's winning moves

  if (playerOScore >= 1000) {
    return Infinity;
  } else if (playerXScore >= 1000) {
    return -Infinity;
  } else {
    return playerOScore - blockingWeight * playerXScore;
  }
}

function getScore(player) {
  let score = 0;
  const scoreTable = {
    2: 10,
    3: 100,
    4: 1000,
  };

  // Calculate scores for rows, columns, and diagonals
  const rowScore = getRowScore(player, scoreTable);
  const colScore = getColScore(player, scoreTable);
  const diagScore = getDiagScore(player, scoreTable);

  score = rowScore + colScore + diagScore;

  return score;
}

function getRowScore(player, scoreTable) {
  let score = 0;

  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 4; col++) {
      const index = row * 7 + col;
      const count = countConnectedPieces(index, 1, player);
      if (count in scoreTable) {
        score += scoreTable[count];
      }
    }
  }

  return score;
}

function getColScore(player, scoreTable) {
  let score = 0;

  for (let col = 0; col < 7; col++) {
    for (let row = 0; row < 3; row++) {
      const index = row * 7 + col;
      const count = countConnectedPieces(index, 7, player);
      if (count in scoreTable) {
        score += scoreTable[count];
      }
    }
  }

  return score;
}

function getDiagScore(player, scoreTable) {
  let score = 0;

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 7; col++) {
      const index = row * 7 + col;
      const countLeft = countConnectedPieces(index, 6, player);
      const countRight = countConnectedPieces(index, 8, player);

      if (countLeft in scoreTable) {
        score += scoreTable[countLeft];
      }

      if (countRight in scoreTable) {
        score += scoreTable[countRight];
      }
    }
  }

  return score;
}

function countConnectedPieces(index, step, player) {
  let count = 0;
  let emptySpaces = 0;

  for (let i = 0; i < 4; i++) {
    const currentIndex = index + i * step;
    if (currentIndex < 0 || currentIndex >= cells.length) {
      break;
    }
    const cellPlayer = cells[currentIndex].getAttribute("data-player");
    if (cellPlayer === player) {
      count += 1;
    } else if (cellPlayer === null) {
      emptySpaces += 1;
      break;
    } else {
      break;
    }
  }

  // If there are empty spaces, decrease the count by 1
  if (emptySpaces > 0) {
    count -= 1;
  }

  return count;
}

// Get a list of available moves
function getAvailableMoves() {
  const availableMoves = [];
  for (let col = 0; col < 7; col++) {
    if (findLowestEmptyCell(col)) {
      availableMoves.push(col);
    }
  }

  // Shuffle the available moves array
  for (let i = availableMoves.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [availableMoves[i], availableMoves[j]] = [availableMoves[j], availableMoves[i]];
  }

  return availableMoves;
}

// Make a move by setting the player attribute and adding a colored circle to the cell
function makeMove(cell, player) {
  cell.setAttribute("data-player", player);

  const circle = document.createElement("div");
  circle.classList.add("circle");
  circle.style.backgroundColor = player === "X" ? "#4e73df" : "#f93154";
  cell.appendChild(circle);
}

// Undo a move by removing the player attribute and clearing the cell content
function undoMove(cell) {
  cell.removeAttribute("data-player");
  cell.innerHTML = "";
}

// Update the label colors based on the game mode and active player
function updateLabelColors() {
  gameModeLabels.forEach((label, index) => {
    if (gameModeToggle.checked) {
      label.style.color = index === 0 ? "#ccc" : "#4e73df";
    } else {
      label.style.color = index === 0 ? "#4e73df" : "#ccc";
    }
  });
  if (currentPlayer === "X") {
    playerXName.classList.add("active-player");
    playerOName.classList.remove("active-player");
  } else {
    playerXName.classList.remove("active-player");
    playerOName.classList.add("active-player");
  }
}

function getTurnNumber() {
  let nonEmptyCells = Array.from(cells).filter(
    (cell) => cell.getAttribute("data-player") !== null
  );
  return nonEmptyCells.length;
}