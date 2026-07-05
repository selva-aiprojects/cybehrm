import 'package:flutter/material.dart';

class AdminSupportScreen extends StatelessWidget {
  const AdminSupportScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Support Desk')),
      body: const Center(
        child: Text('Support Desk - Coming Soon', style: TextStyle(color: Colors.white, fontSize: 18)),
      ),
    );
  }
}
