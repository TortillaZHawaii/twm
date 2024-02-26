import 'dice_color.dart';

class Dice {
  const Dice({required this.value, required this.color})
      : assert(value >= 1 && value <= 6);

  final int value;
  final DiceColor color;
}
