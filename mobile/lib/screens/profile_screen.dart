import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../services/api_service.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final apiService = context.watch<ApiService>();
    final user = apiService.currentUser;
    final theme = Theme.of(context);

    if (user == null) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    final String initials = user.email.isNotEmpty
        ? user.email.substring(0, 2).toUpperCase()
        : 'US';

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Profile'),
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
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          children: [
            CircleAvatar(
              radius: 46,
              backgroundColor: theme.colorScheme.primary.withValues(alpha: 0.12),
              child: Text(
                initials,
                style: TextStyle(fontSize: 28, color: theme.colorScheme.primary, fontWeight: FontWeight.bold),
              ),
            ),
            const SizedBox(height: 16),
            Text(
              user.email.split('@')[0].toUpperCase(),
              style: theme.textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 4),
            Text(
              user.email,
              style: TextStyle(color: Colors.grey.shade600, fontSize: 14),
            ),
            const SizedBox(height: 32),
            _buildProfileSection(context, 'Account Details', [
              _buildInfoRow(context, 'User ID', user.id),
              _buildInfoRow(context, 'Role', user.role.toUpperCase().replaceAll('_', ' ')),
              _buildInfoRow(context, 'Organization', user.organizationName ?? 'Tenant Org'),
              _buildInfoRow(context, 'Status', user.isActive ? 'Active' : 'Inactive'),
            ]),
            const SizedBox(height: 16),
            _buildProfileSection(context, 'Features Enabled', [
              _buildFeatureRow(context, 'Core HR & Team Management', user.featureHrTeam),
              _buildFeatureRow(context, 'Talent Acquisition & ATS', user.featureTalentMgmt),
              _buildFeatureRow(context, 'Resource Management & Requisitions', user.featureResourceMgmt),
            ]),
          ],
        ),
      ),
    );
  }

  Widget _buildProfileSection(BuildContext context, String title, List<Widget> children) {
    final theme = Theme.of(context);
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: theme.textTheme.titleMedium?.copyWith(
                color: theme.colorScheme.primary,
                fontWeight: FontWeight.bold,
              ),
            ),
            const Divider(height: 24),
            ...children,
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(BuildContext context, String label, String value) {
    final theme = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(color: Colors.grey.shade600, fontWeight: FontWeight.w500)),
          Expanded(
            child: Text(
              value,
              textAlign: TextAlign.end,
              style: TextStyle(color: theme.colorScheme.onSurface, fontWeight: FontWeight.bold),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFeatureRow(BuildContext context, String label, bool isEnabled) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Text(
              label,
              style: TextStyle(color: Colors.grey.shade600, fontWeight: FontWeight.w500),
            ),
          ),
          Icon(
            isEnabled ? Icons.check_circle : Icons.cancel,
            color: isEnabled ? Colors.green : Colors.redAccent,
            size: 20,
          ),
        ],
      ),
    );
  }
}
