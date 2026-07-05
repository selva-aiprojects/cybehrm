import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class AdminHrScreen extends StatelessWidget {
  const AdminHrScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Core HR & Operations'),
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
            title: 'Leave Approvals',
            subtitle: 'Review and approve pending employee leaves',
            icon: Icons.event_available,
            color: const Color(0xFF6C5CE7),
            route: '/admin-leave-approvals',
          ),
          _buildActionCard(
            context,
            title: 'Employee Directory',
            subtitle: 'Manage staff profiles and onboarding',
            icon: Icons.people,
            color: const Color(0xFF00CEC9),
            route: '/admin-directory',
          ),
          _buildActionCard(
            context,
            title: 'Payroll Overview',
            subtitle: 'Process salary runs and view payslips',
            icon: Icons.attach_money,
            color: const Color(0xFFFD79A8),
            route: '/web-portal/Payroll%20Overview',
          ),
          _buildActionCard(
            context,
            title: 'Attendance Logs',
            subtitle: 'Monitor daily check-ins and check-outs',
            icon: Icons.access_time,
            color: const Color(0xFFFDCB6E),
            route: '/admin-attendance-logs',
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
    required String route,
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
          context.push(route);
        },
      ),
    );
  }
}
