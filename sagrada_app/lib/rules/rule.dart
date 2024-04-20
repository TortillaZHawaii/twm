import 'package:sagrada_app/entities/dice_board.dart';

abstract class Rule {
  final String title;
  final String description;

  Rule({required this.title, required this.description});

  int calculateScore(DiceBoard board);
}
