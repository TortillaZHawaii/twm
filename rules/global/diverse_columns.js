import { Rule } from "../rule.js";
import DiceBoard from "../../entities/dice_board.js";

class DiverseShadesInColumn extends Rule {
    constructor() {
        super('Różnorodność odcieni w kolumnie', 'Kolumny z niepowtarzającymi się wartościami kostek');
    }

    calculateScore(board) {
        let score = 0;

        for (let column = 0; column < DiceBoard.columns; column++) {
            const shades = new Set();
            for (let row = 0; row < DiceBoard.rows; row++) {
                const dice = board.get(row, column);
                if (dice === null) {
                    continue;
                }

                shades.add(dice.value);
            }

            if (shades.size === DiceBoard.rows) {
                score += 4;
            }
        }

        return score;
    }
}

class DiverseColorsInColumn extends Rule {
    constructor() {
        super('Różnorodność kolorów w kolumnie', 'Kolumny z niepowtarzającymi się kolorami kostek');
    }

    calculateScore(board) {
        let score = 0;

        for (let column = 0; column < DiceBoard.columns; column++) {
            const colors = new Set();
            for (let row = 0; row < DiceBoard.rows; row++) {
                const dice = board.get(row, column);
                if (dice === null) {
                    continue;
                }

                colors.add(dice.color);
            }

            if (colors.size === DiceBoard.rows) {
                score += 5;
            }
        }

        return score;
    }
}

export {
    DiverseShadesInColumn,
    DiverseColorsInColumn
};
