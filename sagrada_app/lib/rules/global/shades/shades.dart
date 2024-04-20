import 'dart:math';

import 'package:sagrada_app/entities/dice_board.dart';

import '../../rule.dart';

class LightShades extends _Shades {
  LightShades()
      : super(
          1,
          2,
          'Jasne odcienie',
          'Każdy zestaw kostek o wartościach 1 i 2 w całym witrażu',
        );
}

class MediumShades extends _Shades {
  MediumShades()
      : super(
          3,
          4,
          'Pośrednie odcienie',
          'Każdy zestaw kostek o wartościach 3 i 4 w całym witrażu',
        );
}

class DarkShades extends _Shades {
  DarkShades()
      : super(
          5,
          6,
          'Ciemne odcienie',
          'Każdy zestaw kostek o wartościach 5 i 6 w całym witrażu',
        );
}

class _Shades extends Rule {
  _Shades(int value1, int value2, String title, String description)
      : assert(value1 >= 1 && value1 <= 6, 'Value1 $value1 is out of bounds'),
        assert(value2 >= 1 && value2 <= 6, 'Value2 $value2 is out of bounds'),
        _value1 = value1,
        _value2 = value2,
        super(title: title, description: description);

  final int _value1;
  final int _value2;
  static const int _score = 2;

  @override
  int calculateScore(DiceBoard board) {
    int value1Count = 0;
    int value2Count = 0;

    for (var row = 0; row < DiceBoard.rows; row++) {
      for (var column = 0; column < DiceBoard.columns; column++) {
        final dice = board.get(row, column);
        if (dice == null) {
          continue;
        }

        if (dice.value == _value1) {
          value1Count++;
        } else if (dice.value == _value2) {
          value2Count++;
        }
      }
    }

    return min(value1Count, value2Count) * _score;
  }
}
