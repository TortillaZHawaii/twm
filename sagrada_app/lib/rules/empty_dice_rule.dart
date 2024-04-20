import 'package:sagrada_app/entities/dice_board.dart';
import 'package:sagrada_app/rules/rule.dart';

class EmptyDiceRule extends Rule {
  EmptyDiceRule()
      : super(
          title: 'Brak kostek',
          description: 'Punkty ujemne za każdą pustą kostkę na planszy.',
        );

  @override
  int calculateScore(DiceBoard board) {
    int emptyDiceCount = 0;

    for (int row = 0; row < DiceBoard.rows; row++) {
      for (int column = 0; column < DiceBoard.columns; column++) {
        if (board.get(row, column) == null) {
          emptyDiceCount++;
        }
      }
    }

    return -emptyDiceCount;
  }
}
