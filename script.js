const maxDepth = 4;
const game_grid = Array.from({ length: 7 }, () => Array(6).fill(null));

const player1 = {
  color: "red",
  isAI: false
};

const player2 = {
  color: "blue",
  isAI: true
};

const game = {
  board: game_grid,
  currentPlayer: player1,
  place_chip: function (column) {
    const rowIndex = this.board[column].indexOf(null);
    if (rowIndex === -1) return false;
    this.board[column][rowIndex] = this.currentPlayer;
    this.paint_board();
    if (this.check_for_win(column, rowIndex)) {
      setTimeout(() => {
        alert(`Player ${this.currentPlayer.color} wins!`);
        this.reset_game();
      }, 100);
    } else {
      this.change_player();
    }
  },
  change_player: function () {
    this.currentPlayer = this.currentPlayer === player1 ? player2 : player1;
  },
  check_for_win: function (col, row) {
    // Check for win logic
    const directions = [
      [
        [-1, 0],
        [1, 0]
      ], // Horizontal
      [
        [0, -1],
        [0, 1]
      ], // Vertical
      [
        [-1, -1],
        [1, 1]
      ], // Diagonal
      [
        [-1, 1],
        [1, -1]
      ] // Anti-diagonal
    ];

    const player = this.board[col][row];

    for (const direction of directions) {
      let count = 1;
      for (const [dx, dy] of direction) {
        let x = col + dx;
        let y = row + dy;
        while (
          x >= 0 &&
          x < 7 &&
          y >= 0 &&
          y < 6 &&
          this.board[x][y] === player
        ) {
          count++;
          x += dx;
          y += dy;
        }
      }
      if (count >= 4) return true;
    }

    return false;
  },
  paint_board: function () {
    const boardElement = document.getElementById("board");
    boardElement.innerHTML = "";
    this.board.forEach((column, columnIndex) => {
      const columnElement = document.createElement("div");
      columnElement.classList.add("column");
      columnElement.addEventListener("click", () => {
        this.place_chip(columnIndex);
      });

      column.forEach((cell) => {
        const cellElement = document.createElement("div");
        cellElement.classList.add("cell");
        if (cell) {
          cellElement.style.backgroundColor = cell.color;
        }
        columnElement.appendChild(cellElement);
      });

      boardElement.appendChild(columnElement);
    });
  },
  reset_game: function () {
    this.board = game_grid.map((col) => col.fill(null));
    this.paint_board();

    // Call AI player's move after resetting the game if the AI is the current player
    if (this.currentPlayer.isAI) {
      setTimeout(() => {
        this.make_ai_move();
      }, 500);
    }
  },

calculate_weights: function(board, currentPlayer, depth, moveHistory = [], forcedMove = null) {
  if (depth === 0) return {};

  const nextPlayer = currentPlayer === player1 ? player2 : player1;
  const weights = {};
  const availableColumns = board.length;
  const weightFactor = Math.pow(availableColumns, depth - 1);
  let foundForcedMove = false;

  for (let col = 0; col < availableColumns && !foundForcedMove; col++) {
    const row = board[col].indexOf(null);
    if (row === -1) continue;

    board[col][row] = currentPlayer;
    moveHistory.push(col);

    if (this.check_for_win(col, row)) {
      if (depth === maxDepth - 1 && currentPlayer.isAI) {
        console.log("AI win at depth 1, column", col);
        forcedMove = col;
        foundForcedMove = true;
        break;
      }

      weights[col] = currentPlayer.isAI ? weightFactor : -weightFactor;
    } else {
      const childWeights = this.calculate_weights(board, nextPlayer, depth - 1, moveHistory.slice(), forcedMove);
      weights[col] = Object.values(childWeights).reduce((sum, weight) => sum + weight, 0);
    }

    board[col][row] = null;
    moveHistory.pop();
  }

  // Check for the forced move condition at depth 2
  if (depth === maxDepth - 2 && currentPlayer.isAI) {
    const positiveColumns = Object.keys(weights).filter(col => weights[col] > 0);
    if (positiveColumns.length === 1) {
      console.log("AI Block at depth 2, column", positiveColumns[0]);
      forcedMove = parseInt(positiveColumns[0]);
      foundForcedMove = true;
    }
  }

  if (!foundForcedMove) {
    // Check for missed wins at depth 3
    for (const col in weights) {
      if (depth === maxDepth - 2 && currentPlayer.isAI) {
        const round1Move = moveHistory[0];
        const round3Move = moveHistory[2];
        if (round1Move === round3Move && round1Move !== moveHistory[1]) {
          console.log("Missed win at column", col);
          weights[col] = -weightFactor;
        }
      }
    }
  }

  // Only log the weights array when at the top level of depth (i.e., depth is equal to its initial value)
  if (depth === maxDepth && !foundForcedMove) {
    const weightsTable = Object.keys(weights).map(col => ({
      Depth: depth,
      Column: col,
      Weight: weights[col],
    }));
    console.table(weightsTable);
  }

  if (foundForcedMove) {
    weights.forcedMove = forcedMove;
  }

  return weights;
},

  make_ai_move: function () {
    const depth = maxDepth; // Define the desired depth
    const weights = this.calculate_weights(
      this.board,
      this.currentPlayer,
      depth
    );

    if (weights.hasOwnProperty("forcedMove")) {
      this.place_chip(weights.forcedMove);
    } else {
      const maxWeight = Math.max(...Object.values(weights));

      const bestMoves = Object.keys(weights).filter(
        (col) => weights[col] === maxWeight
      );
      const bestMove = parseInt(
        bestMoves[Math.floor(Math.random() * bestMoves.length)]
      );

      this.place_chip(bestMove);
    }
  },

  isHumanMove: true,

  handle_player_move: function (columnIndex) {
    if (!this.isHumanMove) return; // Prevent human from making moves for AI player

    this.place_chip(columnIndex);
    if (this.currentPlayer.isAI) {
      this.isHumanMove = false; // Set flag to false before making AI move
      setTimeout(() => {
        this.make_ai_move();
        this.isHumanMove = true; // Set flag back to true after AI move is completed
      }, 500);
    }
  },

  paint_board: function () {
    const boardElement = document.getElementById("board");
    boardElement.innerHTML = "";
    this.board.forEach((column, columnIndex) => {
      const columnElement = document.createElement("div");
      columnElement.classList.add("column");

      // Modify the column click event listener to call handle_player_move
      columnElement.addEventListener("click", () => {
        this.handle_player_move(columnIndex);
      });

      column.forEach((cell) => {
        const cellElement = document.createElement("div");
        cellElement.classList.add("cell");
        if (cell) {
          cellElement.style.backgroundColor = cell.color;
        }
        columnElement.appendChild(cellElement);
      });

      boardElement.appendChild(columnElement);
    });
  }
};

game.paint_board();

// Call AI player's move after the initial paint_board call if the game starts with an AI player
if (game.currentPlayer.isAI) {
  setTimeout(() => {
    game.make_ai_move();
  }, 500);
}
