import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../services/api_service.dart';

/// Manager Hub — shown to users with the 'manager' role.
/// Provides team approval capabilities without full admin access.
class ManagerHubScreen extends StatelessWidget {
  const ManagerHubScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final user = context.watch<ApiService>().currentUser;
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
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
        title: Row(
          children: [
            Container(
              width: 30,
              height: 30,
              decoration: BoxDecoration(
                color: theme.colorScheme.primary.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(Icons.supervisor_account_rounded,
                  size: 18, color: theme.colorScheme.primary),
            ),
            const SizedBox(width: 10),
            const Text('Manager Hub'),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.person_outline),
            onPressed: () => context.push('/profile'),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Welcome card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF2563EB), Color(0xFF7C3AED)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF7C3AED).withValues(alpha: 0.22),
                    blurRadius: 16,
                    offset: const Offset(0, 6),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Hello, ${user?.role == "manager" ? "Manager" : "Team Lead"} 👋',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 20,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    'Manage your team requests and approvals here.',
                    style: TextStyle(color: Colors.white70, fontSize: 14),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),
            Text('Team Management', style: theme.textTheme.titleMedium),
            const SizedBox(height: 12),

            // Action cards grid
            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              mainAxisSpacing: 12,
              crossAxisSpacing: 12,
              childAspectRatio: 1.1,
              children: [
                _ActionCard(
                  title: 'Leave Approvals',
                  subtitle: 'Review team requests',
                  icon: Icons.event_available_rounded,
                  color: const Color(0xFF0EA5E9),
                  onTap: () => context.push('/admin-leave-approvals'),
                ),
                _ActionCard(
                  title: 'Attendance Logs',
                  subtitle: 'Track attendance',
                  icon: Icons.access_time_rounded,
                  color: const Color(0xFF10B981),
                  onTap: () => context.push('/admin-attendance-logs'),
                ),
                _ActionCard(
                  title: 'Employee Directory',
                  subtitle: 'View team members',
                  icon: Icons.people_alt_rounded,
                  color: const Color(0xFF8B5CF6),
                  onTap: () => context.push('/admin-directory'),
                ),
                _ActionCard(
                  title: 'Resource Requisitions',
                  subtitle: 'Submit & approve resources',
                  icon: Icons.assignment_ind_rounded,
                  color: const Color(0xFF00A88F),
                  onTap: () => context.push('/requisitions'),
                ),
                _ActionCard(
                  title: 'Reports',
                  subtitle: 'Analytics & insights',
                  icon: Icons.bar_chart_rounded,
                  color: const Color(0xFFF59E0B),
                  onTap: () => context.push(
                    '/web-portal/${Uri.encodeComponent("Reports & Analytics")}',
                  ),
                ),
              ],
            ),

            const SizedBox(height: 24),
            Text('Quick Links', style: theme.textTheme.titleMedium),
            const SizedBox(height: 12),

            _QuickLink(
              icon: Icons.trending_up_rounded,
              label: 'Performance Reviews',
              color: const Color(0xFFEF4444),
              onTap: () => context.push(
                '/web-portal/${Uri.encodeComponent("Performance & Appraisals")}',
              ),
            ),
            const SizedBox(height: 8),
            _QuickLink(
              icon: Icons.auto_awesome_rounded,
              label: 'AI Copilot',
              color: const Color(0xFF6366F1),
              onTap: () => context.push(
                '/web-portal/${Uri.encodeComponent("AI Copilot")}',
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ActionCard extends StatelessWidget {
  final String title;
  final String subtitle;
  final IconData icon;
  final Color color;
  final VoidCallback onTap;

  const _ActionCard({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(16),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFFF1F5F9), width: 1.5),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(icon, color: color, size: 22),
              ),
              const Spacer(),
              Text(
                title,
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF0F172A),
                ),
              ),
              const SizedBox(height: 2),
              Text(
                subtitle,
                style: const TextStyle(
                  fontSize: 11,
                  color: Color(0xFF64748B),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _QuickLink extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  const _QuickLink({
    required this.icon,
    required this.label,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(16),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFFF1F5F9), width: 1.5),
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(icon, color: color, size: 20),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Text(
                  label,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF0F172A),
                  ),
                ),
              ),
              const Icon(Icons.chevron_right_rounded, color: Color(0xFF94A3B8)),
            ],
          ),
        ),
      ),
    );
  }
}
