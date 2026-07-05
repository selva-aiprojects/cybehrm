import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class AdminTalentScreen extends StatelessWidget {
  const AdminTalentScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Talent Management'),
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
            title: 'Resource Requisitions',
            subtitle: 'Requisitions workflow and approval gates',
            icon: Icons.assignment_ind,
            color: const Color(0xFF00A88F),
            route: '/requisitions',
          ),
          _buildActionCard(
            context,
            title: 'Talent Pool Database',
            subtitle: 'View global database of resume profiles',
            icon: Icons.folder_shared_outlined,
            color: const Color(0xFF0F52BA),
            route: '/talent-database',
          ),
          _buildActionCard(
            context,
            title: 'Recruitment & ATS',
            subtitle: 'Manage job postings, candidates, and offers',
            icon: Icons.work_outline,
            color: const Color(0xFF00CEC9),
            route: '/admin-jobs',
          ),
          _buildActionCard(
            context,
            title: 'Performance Appraisals',
            subtitle: 'Track KRAs, reviews, and 360 feedback',
            icon: Icons.trending_up,
            color: const Color(0xFF6C5CE7),
            route: '/web-portal/Performance%20Appraisals',
          ),
          _buildActionCard(
            context,
            title: 'Training & Development',
            subtitle: 'Organize workshops and skill tracking',
            icon: Icons.school,
            color: const Color(0xFFFDCB6E),
            route: '/web-portal/Training%20%26%20Development',
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
