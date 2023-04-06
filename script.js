const maxDepth = 5;
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
  place_chip: function(column) {
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
  reset_game: function() {
    this.board = game_grid.map(col => col.fill(null));
    this.paint_board();

    // Call AI player's move after resetting the game if the AI is the current player
    if (this.currentPlayer.isAI) {
      setTimeout(() => {
        this.make_ai_move();
      }, 500);
    }
  },
//Not used for AI logic
/*  analyze_board: function() {
    const find_winning_move = (player) => {
      for (let col = 0; col < this.board.length; col++) {
        const row = this.board[col].indexOf(null);
        if (row === -1) continue;
        this.board[col][row] = player;
        if (this.check_for_win(col, row)) {
          this.board[col][row] = null;
          return col;
        }
        this.board[col][row] = null;
      }
      return -1;
    };

    // Check for AI's winning move
    const aiWinningMove = find_winning_move(this.currentPlayer);
    if (aiWinningMove !== -1) {
      console.log(`AI found a winning move in column ${aiWinningMove}`);
      return aiWinningMove;
    }

    // Check for human player's winning move to block
    const humanPlayer = this.currentPlayer === player1 ? player2 : player1;
    const humanWinningMove = find_winning_move(humanPlayer);
    if (humanWinningMove !== -1) {
      console.log(`AI found a blocking move in column ${humanWinningMove}`);
      return humanWinningMove;
    }

    // Make a random move if no winning or blocking moves are found
    const availableColumns = this.board
      .map((col, index) => (col.includes(null) ? index : -1))
      .filter(index => index !== -1);
    const randomMove = availableColumns[Math.floor(Math.random() * availableColumns.length)];
    console.log(`AI found no winning or blocking moves and chose a random move in column ${randomMove}`);
    return randomMove;
  }, */

  calculate_weights: function(board, currentPlayer, depth, moveHistory = []) {
    if (depth === 0) return {};
  
    const nextPlayer = currentPlayer === player1 ? player2 : player1;
    const weights = {};
    const availableColumns = board.length;
    const weightFactor = Math.pow(availableColumns, depth - 1);
  
    for (let col = 0; col < availableColumns; col++) {
      const row = board[col].indexOf(null);
      if (row === -1) continue;
  
      board[col][row] = currentPlayer;
      moveHistory.push(col);
  
      if (this.check_for_win(col, row)) {
        let missedWin = false;
        if (depth === maxDepth - 2 && currentPlayer.isAI) {
          const round1Move = moveHistory[0];
          const round3Move = moveHistory[2];
          if (round1Move === round3Move && round1Move !== moveHistory[1]) {
            missedWin = true;
            console.log("Missed win at column", col);
          }
        }
  
        weights[col] = missedWin ? -weightFactor : (currentPlayer.isAI ? weightFactor : -weightFactor);
      } else {
        const childWeights = this.calculate_weights(board, nextPlayer, depth - 1, moveHistory.slice());
        weights[col] = Object.values(childWeights).reduce((sum, weight) => sum + weight, 0);
      }
  
      board[col][row] = null;
      moveHistory.pop();
    }
  
    // Only log the weights array when at the top level of depth (i.e., depth is equal to its initial value)
    if (depth === maxDepth) {
      const weightsTable = Object.keys(weights).map(col => ({
        Depth: depth,
        Column: col,
        Weight: weights[col],
      }));
      console.table(weightsTable);
    }
  
    return weights;
  },

  make_ai_move: function() {
    const depth = maxDepth; // Define the desired depth
    const weights = this.calculate_weights(this.board, this.currentPlayer, depth);
    const maxWeight = Math.max(...Object.values(weights));

    const bestMoves = Object.keys(weights).filter(col => weights[col] === maxWeight);
    const bestMove = parseInt(bestMoves[Math.floor(Math.random() * bestMoves.length)]);

    this.place_chip(bestMove);
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