import 'package:flutter/material.dart';
import 'package:sagrada_app/widgets/dice_widget.dart';

void main() {
  runApp(const SagradaApp());
}

class SagradaApp extends StatelessWidget {
  const SagradaApp({super.key});

  @override
  Widget build(BuildContext context) {
    return const MaterialApp(
      title: 'Sagrada',
      home: Scaffold(
        body: Center(
          child: DiceWidget(),
        ),
      ),
    );
  }
}
