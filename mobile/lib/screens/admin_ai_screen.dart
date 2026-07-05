import 'package:flutter/material.dart';

class AdminAiScreen extends StatelessWidget {
  const AdminAiScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('AI Copilot')),
      body: const Center(
        child: Text('AI Copilot - Coming Soon', style: TextStyle(color: Colors.white, fontSize: 18)),
      ),
    );
  }
}
