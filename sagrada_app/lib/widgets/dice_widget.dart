import 'package:flutter/material.dart';
import 'package:sagrada_app/entities/entities.dart';
import 'package:sagrada_app/widgets/dice_color_extension.dart';

class DiceWidget extends StatefulWidget {
  const DiceWidget({super.key});

  final double size = 100.0;

  @override
  State<DiceWidget> createState() => _DiceWidgetState();
}

class _DiceWidgetState extends State<DiceWidget> {
  Dice _dice = const Dice(value: 1, color: DiceColor.red);
  double _rotationX = 0;
  double _rotationY = 0;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onHorizontalDragEnd: _onHorizontalDragEnd,
      onVerticalDragEnd: _onVerticalDragEnd,
      onHorizontalDragUpdate: _onHorizontalDragUpdate,
      onVerticalDragUpdate: _onVerticalDragUpdate,
      child: Container(
        width: widget.size,
        height: widget.size,
        decoration: BoxDecoration(
          color: _dice?.color.color ?? Colors.grey,
          borderRadius: BorderRadius.circular(widget.size / 8),
          backgroundBlendMode: BlendMode.modulate,
        ),
        transform: Matrix4.rotationX(_rotationX)..rotateY(_rotationY),
        alignment: Alignment.center,
        child: Center(
          child: Text(
            _dice?.value.toString() ?? '',
            style: const TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
      ),
    );
  }

  DiceColor _getNextColor(DiceColor color) {
    return DiceColor.values[(color.index + 1) % DiceColor.values.length];
  }

  DiceColor _getPreviousColor(DiceColor color) {
    return DiceColor.values[
        (color.index - 1 + DiceColor.values.length) % DiceColor.values.length];
  }

  int _getNextValue(int value) {
    return value % 6 + 1;
  }

  int _getPreviousValue(int value) {
    return value == 1 ? 6 : value - 1;
  }

  void _onHorizontalDragUpdate(DragUpdateDetails details) {
    setState(() {
      _rotationY += details.primaryDelta! / 100;
    });
  }

  void _onVerticalDragUpdate(DragUpdateDetails details) {
    setState(() {
      _rotationX -= details.primaryDelta! / 100;
    });
  }

  void _onHorizontalDragEnd(DragEndDetails details) {
    if (details.velocity.pixelsPerSecond.dx > 0) {
      setState(() {
        _dice = Dice(
          value: _getPreviousValue(_dice!.value),
          color: _dice!.color,
        );
      });
    } else {
      setState(() {
        _dice = Dice(
          value: _getNextValue(_dice!.value),
          color: _dice!.color,
        );
      });
    }
  }

  void _onVerticalDragEnd(DragEndDetails details) {
    if (details.velocity.pixelsPerSecond.dy > 0) {
      setState(() {
        _dice = Dice(
          value: _dice!.value,
          color: _getPreviousColor(_dice!.color),
        );
      });
    } else {
      setState(() {
        _dice = Dice(
          value: _dice!.value,
          color: _getNextColor(_dice!.color),
        );
      });
    }
  }
}
