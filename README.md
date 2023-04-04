# gpt-connect4 v2
Prompt (source: https://verdantfox.com/blog/view/how-i-built-a-connect-4-ai):
Can you write vanilla JS for a Connect 4 game with these requirements:
4 basic objects:
1. game_grid: a representation of the game board grid in the form of a 2-dimensional array (7 columns, each holding 6 rows)
2. player1: an object representing player 1, tracking at least the player's color
3. player2: an object representing player 2, tracking at least the player's color
4. game: a coordinating object that keeps track of the above 3 objects, whose turn it is, the connections between the JavaScript objects and the HTML/CSS visuals, etc.
basic functions
1. place_chip: A function that places a chip in the bottom space of the chosen column for the current player.
2. change_player: A function that switches the current player.
3. check_for_win: A function that checks if a player wins the game.
4. paint_board: A function that updates the visual board (the HTML/CSS) to reflect the board state in JavaScript.
5. reset_game: A function to reset the game board to the starting state.
make an event where a mouse click in a column of the game board will call the place_chip function. The place_chip function calls the check_for_win, change_player, and paint_board functions. A separate button click will call the reset_game function.