const DiceColor = require("../../entities/dice_color");

class _ColorRule extends _Rule {
    constructor(color, title, description) {
        super(title, description);
        this._color = color;
        this._score = 1;
    }

    calculateScore(board) {
        let dotCount = 0;

        for (let row = 0; row < DiceBoard.rows; row++) {
            for (let column = 0; column < DiceBoard.columns; column++) {
                const dice = board.get(row, column);
                if (dice === null) {
                    continue;
                }

                if (dice.color === this._color) {
                    dotCount += dice.value;
                }
            }
        }

        return count * this._score;
    }
}

class RedRule extends _ColorRule {
    constructor() {
        super(DiceColor.Red, 'Czerwone', 'Suma oczek czerwonych kostek w całym witrażu');
    }
}

class YellowRule extends _ColorRule {
    constructor() {
        super(DiceColor.Yellow, 'Żółte', 'Suma oczek żółtych kostek w całym witrażu');
    }
}

class GreenRule extends _ColorRule {
    constructor() {
        super(DiceColor.Green, 'Zielone', 'Suma oczek zielonych kostek w całym witrażu');
    }
}

class BlueRule extends _ColorRule {
    constructor() {
        super(DiceColor.Blue, 'Niebieskie', 'Suma oczek niebieskich kostek w całym witrażu');
    }
}

class PurpleRule extends _ColorRule {
    constructor() {
        super(DiceColor.Purple, 'Fioletowe', 'Suma oczek fioletowych kostek w całym witrażu');
    }
}

module.exports = {
    RedRule,
    YellowRule,
    GreenRule,
    BlueRule,
    PurpleRule
};