import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class WebPortalRedirectScreen extends StatelessWidget {
  final String featureName;

  const WebPortalRedirectScreen({super.key, required this.featureName});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(
        title: Text(featureName),
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
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(32.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: theme.colorScheme.primary.withValues(alpha: 0.12),
                  shape: BoxShape.circle,
                ),
                child: Icon(Icons.laptop_chromebook, size: 80, color: theme.colorScheme.primary),
              ),
              const SizedBox(height: 32),
              Text(
                'Web Portal Only',
                style: theme.textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 16),
              Text(
                'For security and complexity reasons, "$featureName" configuration is managed exclusively via the Cogni HRMS Web Portal.',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.grey.shade700, fontSize: 15, height: 1.5),
              ),
              const SizedBox(height: 48),
              ElevatedButton.icon(
                onPressed: () {
                  if (context.canPop()) {
                    context.pop();
                  } else {
                    context.go('/dashboard');
                  }
                },
                icon: const Icon(Icons.arrow_back),
                label: const Text('Go Back'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
