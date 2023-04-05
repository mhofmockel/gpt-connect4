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
  reset_game: function () {
    this.board = game_grid.map((col) => col.fill(null));
    this.paint_board();
  },
   analyze_board: function() {
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
  },

  make_ai_move: function () {
    const bestMove = this.analyze_board();
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
  game.isHumanMove = false;
  setTimeout(() => {
    game.make_random_move();
    game.isHumanMove = true;
  }, 500);
}
