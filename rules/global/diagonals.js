class DiagonalsRule extends Rule {
  constructor() {
    super('Diagonale', 'TODO');
  }

  calculateScore(board) {
    let score = 0;

    for (let row = 0; row < DiceBoard.rows; row++) {
      for (let column = 0; column < DiceBoard.columns; column++) {
        // for every P we give 1 point when at least one of the X has the same color
        // if P is null we skip
        // X 0 X
        // 0 P 0
        // X 0 X

        const dice = board.get(row, column);
        if (dice === null) {
          continue;
        }

        const leftTop = row > 0 && column > 0 ? board.get(row - 1, column - 1) : null;
        const leftBottom = row < DiceBoard.rows - 1 && column > 0 ? board.get(row + 1, column - 1) : null;
        const rightTop = row > 0 && column < DiceBoard.columns - 1 ? board.get(row - 1, column + 1) : null;
        const rightBottom = row < DiceBoard.rows - 1 && column < DiceBoard.columns - 1 ? board.get(row + 1, column + 1) : null;

        if (leftTop.color === dice.color || leftBottom.color === dice.color || rightTop.color === dice.color || rightBottom.color === dice.color) {
          score++;
        }
      }
    }

    return score;
  }
}