import { Dice } from './dice.js';

class DiceBoard {
    rows = 4;
    columns = 5;

    constructor() {
        this.dices = [];
        for (let i = 0; i < this.rows * this.columns; i++) {
            this.dices.push(null);
        }
    }

    get(row, column) {
        return this.dices[row * this.columns + column];
    }

    set(row, column, dice) {
        this.dices[row * this.columns + column] = dice;
    }
}

module.exports = DiceBoard;
