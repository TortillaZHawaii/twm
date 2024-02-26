import 'dice.dart';

class DiceBoard {
  DiceBoard()
      : _board = List.generate(rows, (index) => List.filled(columns, null));

  static const int rows = 4;
  static const int columns = 5;

  final List<List<Dice?>> _board;

  void set(int row, int column, Dice dice) {
    assert(row >= 0 && row < rows, 'Row $row is out of bounds');
    assert(column >= 0 && column < columns, 'Column $column is out of bounds');
    _board[row][column] = dice;
  }

  Dice? get(int row, int column) {
    assert(row >= 0 && row < rows, 'Row $row is out of bounds');
    assert(column >= 0 && column < columns, 'Column $column is out of bounds');
    return _board[row][column];
  }
}
