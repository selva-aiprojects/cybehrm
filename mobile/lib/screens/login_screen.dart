import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../services/api_service.dart';
class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _urlController = TextEditingController(text: 'https://cybehrm-backend.onrender.com');
  final _emailController = TextEditingController(text: 'admin@orient-ts.com');
  final _passwordController = TextEditingController(text: 'Password123');
  bool _isLoading = false;
  bool _showSettings = false;
  
  List<dynamic> _organizations = [];
  String? _selectedOrgId;
  bool _isLoadingOrgs = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        _fetchOrganizations();
      }
    });
  }

  Future<void> _fetchOrganizations() async {
    setState(() => _isLoadingOrgs = true);
    try {
      context.read<ApiService>().baseUrl = _urlController.text.trim();
      final orgs = await context.read<ApiService>().getList('/auth/organizations');
      if (orgs != null) {
        setState(() {
          _organizations = orgs;
          if (_organizations.isNotEmpty && _selectedOrgId == null) {
            _selectedOrgId = _organizations.first['id'];
          }
        });
      }
    } catch (e) {
      debugPrint('Error fetching orgs: $e');
    } finally {
      if (mounted) setState(() => _isLoadingOrgs = false);
    }
  }
  Future<void> _login() async {
    setState(() => _isLoading = true);

    if (_selectedOrgId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select an organization'), backgroundColor: Colors.redAccent),
      );
      setState(() => _isLoading = false);
      return;
    }

    // Dynamic Server Base URL Config
    context.read<ApiService>().baseUrl = _urlController.text.trim();

    final success = await context.read<ApiService>().login(
      _emailController.text.trim(),
      _passwordController.text.trim(),
      _selectedOrgId!,
    );

    setState(() => _isLoading = false);

    if (success && mounted) {
      context.go('/dashboard');
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Login failed. Please check your credentials and server config.'),
          backgroundColor: Colors.redAccent,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          color: theme.scaffoldBackgroundColor,
          image: const DecorationImage(
            image: AssetImage('assets/logo.png'),
            opacity: 0.015,
            alignment: Alignment.center,
            scale: 0.5,
          ),
        ),
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 40.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const SizedBox(height: 20),
                // Premium Logo and Platform Title
                Center(
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: theme.primaryColor.withValues(alpha: 0.06),
                          blurRadius: 24,
                          offset: const Offset(0, 8),
                        ),
                      ],
                      border: Border.all(color: const Color(0xFFF1F5F9), width: 1.5),
                    ),
                    child: Image.asset(
                      'assets/logo.png',
                      height: 64,
                      fit: BoxFit.contain,
                    ),
                  ),
                ),
                const SizedBox(height: 24),

                // Main Login Card
                Card(
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                    side: const BorderSide(color: Color(0xFFF1F5F9), width: 1.5),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(24.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Text(
                          'Secure Login',
                          style: theme.textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.w800,
                            letterSpacing: -0.3,
                          ),
                        ),
                        const SizedBox(height: 16),
                        
                        // Organization Dropdown
                        if (_isLoadingOrgs)
                          const Center(
                            child: Padding(
                              padding: EdgeInsets.all(12.0),
                              child: CircularProgressIndicator(strokeWidth: 3),
                            ),
                          )
                        else
                          DropdownButtonFormField<String>(
                            initialValue: _selectedOrgId,
                            decoration: const InputDecoration(
                              labelText: 'Tenant Organization',
                              prefixIcon: Icon(Icons.business_outlined, size: 20),
                            ),
                            style: TextStyle(color: theme.colorScheme.onSurface, fontSize: 13),
                            items: _organizations.map((org) {
                              return DropdownMenuItem<String>(
                                value: org['id'],
                                child: Text(org['name'] ?? 'Unknown'),
                              );
                            }).toList(),
                            onChanged: (val) => setState(() => _selectedOrgId = val),
                          ),
                        const SizedBox(height: 16),

                        // Email Field
                        TextField(
                          controller: _emailController,
                          decoration: const InputDecoration(
                            labelText: 'User Email',
                            prefixIcon: Icon(Icons.email_outlined, size: 20),
                          ),
                          keyboardType: TextInputType.emailAddress,
                          style: const TextStyle(fontSize: 14),
                        ),
                        const SizedBox(height: 16),

                        // Password Field
                        TextField(
                          controller: _passwordController,
                          obscureText: true,
                          decoration: const InputDecoration(
                            labelText: 'Security Password',
                            prefixIcon: Icon(Icons.lock_outline_rounded, size: 20),
                          ),
                          style: const TextStyle(fontSize: 14),
                        ),
                        const SizedBox(height: 24),

                        // Submit Button
                        SizedBox(
                          height: 48,
                          child: ElevatedButton(
                            onPressed: _isLoading ? null : _login,
                            style: ElevatedButton.styleFrom(
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                            child: _isLoading
                                ? const SizedBox(
                                    width: 20,
                                    height: 20,
                                    child: CircularProgressIndicator(
                                      color: Colors.white,
                                      strokeWidth: 2,
                                    ),
                                  )
                                : const Text('Sign In to Workspace'),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 24),

                // Server Settings (collapsible settings at the bottom)
                Card(
                  color: Colors.transparent,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                    side: const BorderSide(color: Color(0xFFF1F5F9), width: 1.5),
                  ),
                  child: Column(
                    children: [
                      ListTile(
                        dense: true,
                        visualDensity: VisualDensity.compact,
                        leading: Icon(Icons.settings_ethernet, color: theme.colorScheme.primary, size: 18),
                        title: Text(
                          'Server Configuration',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 12,
                            color: Colors.grey.shade700,
                          ),
                        ),
                        trailing: Icon(
                          _showSettings ? Icons.expand_less : Icons.expand_more,
                          color: Colors.grey,
                          size: 18,
                        ),
                        onTap: () => setState(() => _showSettings = !_showSettings),
                      ),
                      if (_showSettings)
                        Padding(
                          padding: const EdgeInsets.only(left: 16.0, right: 16.0, bottom: 16.0),
                          child: Row(
                            children: [
                              Expanded(
                                child: TextField(
                                  controller: _urlController,
                                  style: const TextStyle(fontSize: 12),
                                  decoration: const InputDecoration(
                                    labelText: 'Backend Server URL',
                                    contentPadding: EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                                  ),
                                  onSubmitted: (_) => _fetchOrganizations(),
                                ),
                              ),
                              const SizedBox(width: 8),
                              IconButton(
                                icon: Icon(Icons.refresh, color: theme.colorScheme.primary, size: 20),
                                onPressed: _fetchOrganizations,
                                tooltip: 'Refresh Organizations',
                              )
                            ],
                          ),
                        ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
