class EmptyDiceRule extends Rule {
    constructor() {
        super('Puste pola', 'Każda pusta kostka w całym witrażu -1 punkt');
    }

    calculateScore(board) {
        let emptyCount = 0;

        for (let row = 0; row < DiceBoard.rows; row++) {
            for (let column = 0; column < DiceBoard.columns; column++) {
                const dice = board.get(row, column);
                if (dice === null) {
                    emptyCount++;
                }
            }
        }

        return -emptyCount;
    }
}