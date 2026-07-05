import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../services/api_service.dart';

class AdminModuleSelectionScreen extends StatelessWidget {
  const AdminModuleSelectionScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final user = context.watch<ApiService>().currentUser;
    final theme = Theme.of(context);

    if (user == null) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Admin Modules'),
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
        actions: [
          IconButton(
            icon: const Icon(Icons.person_outline),
            onPressed: () => context.push('/profile'),
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Welcome, ${_getRoleGreeting(user.role)}',
              style: theme.textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text(
              'Select a module to manage your organization.',
              style: TextStyle(color: Colors.grey.shade600, fontSize: 15),
            ),
            const SizedBox(height: 24),
            Expanded(
              child: ListView(
                children: [
                  if (user.featureHrTeam)
                    _buildModuleCard(
                      context,
                      title: 'Core HR & Operations',
                      icon: Icons.business,
                      color: const Color(0xFF6C5CE7),
                      onTap: () {
                        context.push('/admin-hr');
                      },
                    ),
                  if (user.featureTalentMgmt)
                    _buildModuleCard(
                      context,
                      title: 'Talent Management',
                      icon: Icons.star,
                      color: const Color(0xFF00CEC9),
                      onTap: () {
                        context.push('/admin-talent');
                      },
                    ),
                  if (user.featureResourceMgmt)
                    _buildModuleCard(
                      context,
                      title: 'Resource & Projects',
                      icon: Icons.account_tree,
                      color: const Color(0xFFFD79A8),
                      onTap: () {
                        context.push('/admin-resource');
                      },
                    ),
                  // New Modules aligned with Web version
                  _buildModuleCard(
                    context,
                    title: 'Payroll & Benefits',
                    icon: Icons.account_balance_wallet,
                    color: Colors.green,
                    onTap: () {
                      context.push('/web-portal/${Uri.encodeComponent('Payroll & Benefits')}');
                    },
                  ),
                  _buildModuleCard(
                    context,
                    title: 'Performance & Appraisals',
                    icon: Icons.trending_up,
                    color: Colors.orange,
                    onTap: () {
                      context.push('/web-portal/${Uri.encodeComponent('Performance & Appraisals')}');
                    },
                  ),
                  _buildModuleCard(
                    context,
                    title: 'Reports & Analytics',
                    icon: Icons.pie_chart,
                    color: Colors.blue,
                    onTap: () {
                      context.push('/web-portal/${Uri.encodeComponent('Reports & Analytics')}');
                    },
                  ),
                  _buildModuleCard(
                    context,
                    title: 'Support Desk',
                    icon: Icons.headset_mic,
                    color: Colors.redAccent,
                    onTap: () {
                      context.push('/web-portal/${Uri.encodeComponent('Support Desk')}');
                    },
                  ),
                  _buildModuleCard(
                    context,
                    title: 'AI Copilot',
                    icon: Icons.auto_awesome,
                    color: Colors.deepPurpleAccent,
                    onTap: () {
                      context.push('/web-portal/${Uri.encodeComponent('AI Copilot')}');
                    },
                  ),
                  if (user.role == "super_admin")
                    _buildModuleCard(
                      context,
                      title: 'Nexus Management',
                      icon: Icons.admin_panel_settings,
                      color: Colors.red,
                      onTap: () {
                        context.push('/nexus-mgmt');
                      },
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _getRoleGreeting(String role) {
    switch (role) {
      case 'hr_admin': return 'HR Admin';
      case 'super_admin': return 'Super Admin';
      case 'recruiter': return 'Recruiter';
      case 'Talent Team': return 'Talent Specialist';
      case 'HR Team': return 'HR Specialist';
      case 'Resource Mgmt Group': return 'Resource Manager';
      default: return 'Manager';
    }
  }

  Widget _buildModuleCard(BuildContext context, {
    required String title,
    required IconData icon,
    required Color color,
    required VoidCallback onTap,
  }) {
    final theme = Theme.of(context);
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(14),
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(icon, color: color, size: 28),
              ),
              const SizedBox(width: 18),
              Expanded(
                child: Text(
                  title,
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: theme.colorScheme.onSurface),
                ),
              ),
              const Icon(Icons.arrow_forward_ios, color: Colors.grey, size: 16),
            ],
          ),
        ),
      ),
    );
  }
}
