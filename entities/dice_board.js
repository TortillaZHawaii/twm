export default class DiceBoard {
    static rows = 4;
    static columns = 5;

    constructor() {
        this.dices = new Array(this.rows).fill(null)
            .map(() => new Array(this.columns).fill(null));
    }

    get(row, column) {
        if (row < 0 || row >= this.rows) {
            throw new Error('row must be between 0 and 3');
        }
        if (column < 0 || column >= this.columns) {
            throw new Error('column must be between 0 and 4');
        }
        return this.dices[row][column];
    }

    set(row, column, dice) {
        if (row < 0 || row >= this.rows) {
            throw new Error('row must be between 0 and 3');
        }
        if (column < 0 || column >= this.columns) {
            throw new Error('column must be between 0 and 4');
        }
        this.dices[row * this.columns + column] = dice;
    }
}
