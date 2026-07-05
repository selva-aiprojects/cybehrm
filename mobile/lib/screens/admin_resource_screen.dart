import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class AdminResourceScreen extends StatelessWidget {
  const AdminResourceScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Resource Management'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () {
            if (context.canPop()) {
              context.pop();
            } else {
              context.go('/dashboard');
            }
          },
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16.0),
        children: [
          _buildActionCard(
            context,
            title: 'Project Allocations',
            subtitle: 'Assign staff to clients and monitor bandwidth',
            icon: Icons.account_tree,
            color: const Color(0xFFFD79A8),
          ),
          _buildActionCard(
            context,
            title: 'Asset Management',
            subtitle: 'Track laptops, licenses, and IT equipment',
            icon: Icons.laptop_mac,
            color: const Color(0xFF6C5CE7),
          ),
          _buildActionCard(
            context,
            title: 'Timesheets & Billing',
            subtitle: 'Review billable hours and invoice data',
            icon: Icons.receipt_long,
            color: const Color(0xFF00CEC9),
          ),
        ],
      ),
    );
  }

  Widget _buildActionCard(BuildContext context, {
    required String title,
    required String subtitle,
    required IconData icon,
    required Color color,
  }) {
    final theme = Theme.of(context);
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: ListTile(
        contentPadding: const EdgeInsets.all(16),
        leading: Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.12),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(icon, color: color),
        ),
        title: Text(
          title,
          style: TextStyle(fontWeight: FontWeight.bold, color: theme.colorScheme.onSurface),
        ),
        subtitle: Padding(
          padding: const EdgeInsets.only(top: 6.0),
          child: Text(
            subtitle,
            style: theme.textTheme.bodyMedium?.copyWith(color: Colors.grey.shade600),
          ),
        ),
        trailing: const Icon(Icons.chevron_right, color: Colors.grey),
        onTap: () {
          context.push('/web-portal/${Uri.encodeComponent(title)}');
        },
      ),
    );
  }
}
