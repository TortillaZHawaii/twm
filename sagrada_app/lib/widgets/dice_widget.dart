import 'package:flutter/material.dart';
import 'package:sagrada_app/entities/entities.dart';
import 'package:sagrada_app/widgets/dice_color_extension.dart';

class DiceWidget extends StatefulWidget {
  const DiceWidget({super.key});

  double get size => 100.0;
  double get dotDiameter => size / 4;
  double get dotRadius => dotDiameter / 2;

  @override
  State<DiceWidget> createState() => _DiceWidgetState();
}

class _DiceWidgetState extends State<DiceWidget> {
  int value = 1;
  DiceColor? color;

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
          color: color?.color ?? Colors.grey,
          borderRadius: BorderRadius.circular(widget.size / 8),
          backgroundBlendMode: BlendMode.modulate,
        ),
        alignment: Alignment.center,
        child: color != null
            ? _DotsStackWidget(
                size: widget.size,
                diameter: widget.dotDiameter,
                count: value,
              )
            : const SizedBox.shrink(),
      ),
    );
  }

  DiceColor? _getNextColor(DiceColor? color) {
    if (color == null) {
      return DiceColor.values[0];
    }
    if (color == DiceColor.values.last) {
      return null;
    }
    return DiceColor.values[(color.index + 1)];
  }

  DiceColor? _getPreviousColor(DiceColor? color) {
    if (color == null) {
      return DiceColor.values.last;
    }
    if (color == DiceColor.values.first) {
      return null;
    }
    return DiceColor.values[(color.index - 1)];
  }

  int _getNextValue(int value) {
    return value % 6 + 1;
  }

  int _getPreviousValue(int value) {
    return value == 1 ? 6 : value - 1;
  }

  void _onHorizontalDragUpdate(DragUpdateDetails details) {}

  void _onVerticalDragUpdate(DragUpdateDetails details) {}

  void _onHorizontalDragEnd(DragEndDetails details) {
    if (details.velocity.pixelsPerSecond.dx > 0) {
      setState(() {
        value = _getPreviousValue(value);
      });
    } else {
      setState(() {
        value = _getNextValue(value);
      });
    }
  }

  void _onVerticalDragEnd(DragEndDetails details) {
    if (details.velocity.pixelsPerSecond.dy > 0) {
      setState(() {
        color = _getPreviousColor(color);
      });
    } else {
      setState(() {
        color = _getNextColor(color);
      });
    }
  }
}

class _DotsStackWidget extends StatelessWidget {
  const _DotsStackWidget({
    required this.size,
    required this.diameter,
    required this.count,
  }) : radius = diameter / 2;

  final double size;
  final double diameter;
  final double radius;
  final int count;

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: _createDotsForValue(count),
    );
  }

  List<Widget> _createDotsForValue(int value) {
    switch (value) {
      case 1:
        return [
          Positioned(
            left: size / 2 - radius,
            top: size / 2 - radius,
            child: _DotWidget(diameter: diameter),
          )
        ];
      case 2:
        return [
          Positioned(
            left: size / 4 - radius,
            top: size / 4 - radius,
            child: _DotWidget(diameter: diameter),
          ),
          Positioned(
            left: 3 * size / 4 - radius,
            top: 3 * size / 4 - radius,
            child: _DotWidget(diameter: diameter),
          ),
        ];
      case 3:
        return [
          Positioned(
            left: size / 4 - radius,
            top: size / 4 - radius,
            child: _DotWidget(diameter: diameter),
          ),
          Positioned(
            left: size / 2 - radius,
            top: size / 2 - radius,
            child: _DotWidget(diameter: diameter),
          ),
          Positioned(
            left: 3 * size / 4 - radius,
            top: 3 * size / 4 - radius,
            child: _DotWidget(diameter: diameter),
          ),
        ];
      case 4:
        return [
          Positioned(
            left: size / 4 - radius,
            top: size / 4 - radius,
            child: _DotWidget(diameter: diameter),
          ),
          Positioned(
            left: 3 * size / 4 - radius,
            top: 3 * size / 4 - radius,
            child: _DotWidget(diameter: diameter),
          ),
          Positioned(
            left: 3 * size / 4 - radius,
            top: size / 4 - radius,
            child: _DotWidget(diameter: diameter),
          ),
          Positioned(
            left: size / 4 - radius,
            top: 3 * size / 4 - radius,
            child: _DotWidget(diameter: diameter),
          ),
        ];
      case 5:
        return [
          Positioned(
            left: size / 4 - radius,
            top: size / 4 - radius,
            child: _DotWidget(diameter: diameter),
          ),
          Positioned(
            left: 3 * size / 4 - radius,
            top: 3 * size / 4 - radius,
            child: _DotWidget(diameter: diameter),
          ),
          Positioned(
            left: 3 * size / 4 - radius,
            top: size / 4 - radius,
            child: _DotWidget(diameter: diameter),
          ),
          Positioned(
            left: size / 4 - radius,
            top: 3 * size / 4 - radius,
            child: _DotWidget(diameter: diameter),
          ),
          Positioned(
            left: size / 2 - radius,
            top: size / 2 - radius,
            child: _DotWidget(diameter: diameter),
          ),
        ];
      case 6:
        return [
          Positioned(
            left: size / 4 - radius,
            top: size / 4 - radius,
            child: _DotWidget(diameter: diameter),
          ),
          Positioned(
            left: 3 * size / 4 - radius,
            top: 3 * size / 4 - radius,
            child: _DotWidget(diameter: diameter),
          ),
          Positioned(
            left: 3 * size / 4 - radius,
            top: size / 4 - radius,
            child: _DotWidget(diameter: diameter),
          ),
          Positioned(
            left: size / 4 - radius,
            top: 3 * size / 4 - radius,
            child: _DotWidget(diameter: diameter),
          ),
          Positioned(
            left: size / 4 - radius,
            top: size / 2 - radius,
            child: _DotWidget(diameter: diameter),
          ),
          Positioned(
            left: 3 * size / 4 - radius,
            top: size / 2 - radius,
            child: _DotWidget(diameter: diameter),
          ),
        ];
      default:
        return [];
    }
  }
}

class _DotWidget extends StatelessWidget {
  const _DotWidget({required this.diameter});

  final double diameter;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: diameter,
      height: diameter,
      decoration: const BoxDecoration(
        color: Colors.white,
        shape: BoxShape.circle,
      ),
    );
  }
}
