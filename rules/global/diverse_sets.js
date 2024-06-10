import { Rule } from "../rule.js";
import DiceBoard from "../../entities/dice_board.js";
import DiceColor from "../../entities/dice_color.js";

class DiverseShadesSet extends Rule {
    constructor() {
        super('Różnorodność odcieni', 'Każdy zestaw kostek o wartościach od 1 do 6 w całym witrażu');
    }

    calculateScore(board) {
        let shadesCount = {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0,
            6: 0
        };

        for (let row = 0; row < DiceBoard.rows; row++) {
            for (let column = 0; column < DiceBoard.columns; column++) {
                const dice = board.get(row, column);
                if (dice === null) {
                    continue;
                }

                shadesCount[dice.value]++;
            }
        }

        let minShades = 20;
        for (let i = 1; i <= 6; i++) {
            minShades = Math.min(minShades, shadesCount[i]);
        }

        let score = 5 * minShades;

        return score;
    }
}

class DiverseColorsSet extends Rule {
    constructor() {
        super('Różnorodność kolorów', 'Zestawy, w których znajdują się kostki wszystkich dostępnych kolorów');
    }

    calculateScore(board) {
        let colorsCount = {
            [DiceColor.Red]: 0,
            [DiceColor.Green]: 0,
            [DiceColor.Blue]: 0,
            [DiceColor.Purple]: 0,
            [DiceColor.Yellow]: 0
        };

        for (let row = 0; row < DiceBoard.rows; row++) {
            for (let column = 0; column < DiceBoard.columns; column++) {
                const dice = board.get(row, column);
                if (dice === null) {
                    continue;
                }

                colorsCount[dice.color]++;
            }
        }

        let minColors = 5;
        for (const color in colorsCount) {
            minColors = Math.min(minColors, colorsCount[color]);
        }

        let score = 6 * minColors;

        return score;
    }
}

export {
    DiverseShadesSet,
    DiverseColorsSet
};