const game_grid = Array.from({length: 7}, () => Array(6).fill(null));

const player1 = {
  color: 'red'
};

const player2 = {
  color: 'blue'
};

const game = {
  board: game_grid,
  currentPlayer: player1,
  place_chip: function(column) {
    const rowIndex = this.board[column].indexOf(null);
    if (rowIndex === -1) return false;
    this.board[column][rowIndex] = this.currentPlayer;
    if (this.check_for_win(column, rowIndex)) {
      alert(`Player ${this.currentPlayer.color} wins!`);
      this.reset_game();
    } else {
      this.change_player();
    }
    this.paint_board();
  },
  change_player: function() {
    this.currentPlayer = this.currentPlayer === player1 ? player2 : player1;
  },
  check_for_win: function(col, row) {
    // Check for win logic
    const directions = [
      [[-1, 0], [1, 0]], // Horizontal
      [[0, -1], [0, 1]], // Vertical
      [[-1, -1], [1, 1]], // Diagonal
      [[-1, 1], [1, -1]] // Anti-diagonal
    ];

    const player = this.board[col][row];

    for (const direction of directions) {
      let count = 1;
      for (const [dx, dy] of direction) {
        let x = col + dx;
        let y = row + dy;
        while (x >= 0 && x < 7 && y >= 0 && y < 6 && this.board[x][y] === player) {
          count++;
          x += dx;
          y += dy;
        }
      }
      if (count >= 4) return true;
    }

    return false;
  },
  paint_board: function() {
    const boardElement = document.getElementById('board');
    boardElement.innerHTML = '';
    this.board.forEach((column, columnIndex) => {
      const columnElement = document.createElement('div');
      columnElement.classList.add('column');
      columnElement.addEventListener('click', () => {
        this.place_chip(columnIndex);
      });

      column.forEach(cell => {
        const cellElement = document.createElement('div');
        cellElement.classList.add('cell');
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
  }
};

game.paint_board();