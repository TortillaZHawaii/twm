import { Rule } from "../rule.js";
import DiceBoard from "../../entities/dice_board.js";

class DiverseShadesInRow extends Rule {
    constructor() {
        super('Różnorodność odcieni w rzędzie', 'Rzędy z niepowtarzającymi się wartościami kostek');
    }

    calculateScore(board) {
        let score = 0;

        for (let row = 0; row < DiceBoard.rows; row++) {
            const shades = new Set();
            for (let column = 0; column < DiceBoard.columns; column++) {
                const dice = board.get(row, column);
                if (dice === null) {
                    continue;
                }

                shades.add(dice.value);
            }

            if (shades.size === DiceBoard.columns) {
                score += 5;
            }
        }

        return score;
    }
}

class DiverseColorsInRow extends Rule {
    constructor() {
        super('Różnorodność kolorów w rzędzie', 'Rzędy z niepowtarzającymi się kolorami kostek');
    }

    calculateScore(board) {
        let score = 0;

        for (let row = 0; row < DiceBoard.rows; row++) {
            const colors = new Set();
            for (let column = 0; column < DiceBoard.columns; column++) {
                const dice = board.get(row, column);
                if (dice === null) {
                    continue;
                }

                colors.add(dice.color);
            }

            if (colors.size === DiceBoard.columns) {
                score += 6;
            }
        }

        return score;
    }
}

export {
    DiverseShadesInRow,
    DiverseColorsInRow
};