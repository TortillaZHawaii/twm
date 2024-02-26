import 'package:flutter/material.dart';
import 'package:sagrada_app/entities/entities.dart';

extension DiceColorExtension on DiceColor {
  Color get color {
    switch (this) {
      case DiceColor.red:
        return Colors.red;
      case DiceColor.green:
        return Colors.green;
      case DiceColor.blue:
        return Colors.blue;
      case DiceColor.yellow:
        return Colors.yellow;
      case DiceColor.purple:
        return Colors.purple;
    }
  }
}
