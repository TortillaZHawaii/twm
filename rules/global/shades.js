import { Rule } from '../rule.js';
import DiceBoard from '../../entities/dice_board.js';

class _Shades extends Rule {
  constructor(value1, value2, title, description) {
    super(title, description);
    this._value1 = value1;
    this._value2 = value2;
    this._score = 2;
  }

  calculateScore(board) {
    let value1Count = 0;
    let value2Count = 0;

    for (let row = 0; row < DiceBoard.rows; row++) {
      for (let column = 0; column < DiceBoard.columns; column++) {
        const dice = board.get(row, column);
        if (dice === null) {
          continue;
        }

        if (dice.value === this._value1) {
          value1Count++;
        } else if (dice.value === this._value2) {
          value2Count++;
        }
      }
    }

    return Math.min(value1Count, value2Count) * this._score;
  }
}
  
class LightShades extends _Shades {
  constructor() {
    super(1, 2, 'Jasne odcienie', 'Każdy zestaw kostek o wartościach 1 i 2 w całym witrażu');
  }
}
  
class MediumShades extends _Shades {
  constructor() {
    super(3, 4, 'Pośrednie odcienie', 'Każdy zestaw kostek o wartościach 3 i 4 w całym witrażu');
  }
}

class DarkShades extends _Shades {
  constructor() {
    super(5, 6, 'Ciemne odcienie', 'Każdy zestaw kostek o wartościach 5 i 6 w całym witrażu');
  }
}

export {
    LightShades,
    MediumShades,
    DarkShades
};
