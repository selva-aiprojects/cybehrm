import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../services/api_service.dart';

class EmployeeDirectoryScreen extends StatefulWidget {
  const EmployeeDirectoryScreen({super.key});

  @override
  State<EmployeeDirectoryScreen> createState() => _EmployeeDirectoryScreenState();
}

class _EmployeeDirectoryScreenState extends State<EmployeeDirectoryScreen> {
  List<dynamic> _employees = [];
  List<dynamic> _filteredEmployees = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchEmployees();
  }

  Future<void> _fetchEmployees() async {
    final apiService = Provider.of<ApiService>(context, listen: false);
    final data = await apiService.getEmployees();
    if (mounted) {
      setState(() {
        _employees = data ?? [];
        _filteredEmployees = _employees;
        _isLoading = false;
      });
    }
  }

  void _filterEmployees(String query) {
    setState(() {
      _filteredEmployees = _employees.where((emp) {
        final name = '${emp['first_name']} ${emp['last_name']}'.toLowerCase();
        final id = '${emp['employee_id']}'.toLowerCase();
        final email = '${emp['email']}'.toLowerCase();
        final searchLower = query.toLowerCase();
        return name.contains(searchLower) || id.contains(searchLower) || email.contains(searchLower);
      }).toList();
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(
        title: const Text('Employee Directory'),
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
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: TextField(
              decoration: const InputDecoration(
                hintText: 'Search by name, ID, or email...',
                prefixIcon: Icon(Icons.search),
              ),
              onChanged: _filterEmployees,
            ),
          ),
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _filteredEmployees.isEmpty
                    ? const Center(child: Text('No employees found.'))
                    : ListView.builder(
                        itemCount: _filteredEmployees.length,
                        itemBuilder: (context, index) {
                          final emp = _filteredEmployees[index];
                          final name = '${emp['first_name']} ${emp['last_name']}';
                          final designation = emp['functional_title']?['name'] ?? 'No Title';
                          final department = emp['department']?['name'] ?? 'N/A';
                          return Card(
                            margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                            child: ListTile(
                              onTap: () => _showEmployeeDetails(context, emp),
                              leading: CircleAvatar(
                                backgroundColor: theme.colorScheme.secondary.withValues(alpha: 0.12),
                                child: Text(
                                  name.substring(0, 1).toUpperCase(),
                                  style: TextStyle(color: theme.colorScheme.secondary, fontWeight: FontWeight.bold),
                                ),
                              ),
                              title: Text(name, style: TextStyle(color: theme.colorScheme.onSurface, fontWeight: FontWeight.bold)),
                              subtitle: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const SizedBox(height: 4),
                                  Text('$designation • $department', style: TextStyle(color: Colors.grey.shade600)),
                                  const SizedBox(height: 2),
                                  Text(emp['email'] ?? emp['phone'] ?? 'No contact info', style: TextStyle(color: Colors.grey.shade500, fontSize: 12)),
                                ],
                              ),
                              trailing: Icon(Icons.chevron_right_rounded, color: Colors.grey.shade400),
                              isThreeLine: true,
                            ),
                          );
                        },
                      ),
          ),
        ],
      ),
    );
  }

  void _showEmployeeDetails(BuildContext context, dynamic emp) {
    final theme = Theme.of(context);
    final name = '${emp['first_name']} ${emp['last_name']}';
    final designation = emp['functional_title']?['name'] ?? 'No Title';
    final department = emp['department']?['name'] ?? 'N/A';
    final email = emp['email'] ?? 'No email';
    final phone = emp['phone'] ?? 'No phone';
    final empId = emp['employee_id'] ?? 'N/A';
    final grade = emp['grade'] ?? 'N/A';
    final empType = emp['employment_type'] ?? 'N/A';
    final status = emp['employment_status'] ?? 'Active';
    final joiningDate = emp['joining_date'] ?? 'N/A';

    final String initials = name.isNotEmpty
        ? name.substring(0, 1).toUpperCase()
        : 'EE';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return Container(
          height: MediaQuery.of(context).size.height * 0.75,
          decoration: BoxDecoration(
            color: theme.scaffoldBackgroundColor,
            borderRadius: const BorderRadius.only(
              topLeft: Radius.circular(24),
              topRight: Radius.circular(24),
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.15),
                blurRadius: 20,
                offset: const Offset(0, -5),
              ),
            ],
          ),
          child: Column(
            children: [
              // Handlebar
              const SizedBox(height: 12),
              Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.grey.shade300,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              const SizedBox(height: 16),
              
              // Header Area with Avatar & Title
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24.0),
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 36,
                      backgroundColor: theme.colorScheme.primary.withValues(alpha: 0.12),
                      child: Text(
                        initials,
                        style: TextStyle(
                          fontSize: 24,
                          color: theme.colorScheme.primary,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            name,
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF0F172A),
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            '$designation • $department',
                            style: const TextStyle(
                              fontSize: 13,
                              color: Color(0xFF64748B),
                            ),
                          ),
                          const SizedBox(height: 6),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: theme.colorScheme.primary.withValues(alpha: 0.08),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              'Grade $grade',
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                color: theme.colorScheme.primary,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close_rounded, color: Colors.grey),
                      onPressed: () => Navigator.pop(context),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              const Divider(color: Color(0xFFF1F5F9), height: 1, thickness: 1),
              
              // Details body
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(24.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Section: General Employee details
                      _buildSectionHeader('Employment Information'),
                      const SizedBox(height: 12),
                      _buildDetailRow('Employee ID', empId),
                      _buildDetailRow('Employment Type', empType.toUpperCase()),
                      _buildDetailRow('Status', status.toUpperCase()),
                      _buildDetailRow('Joining Date', joiningDate),
                      
                      const SizedBox(height: 24),
                      
                      // Section: Contact Details
                      _buildSectionHeader('Contact Information'),
                      const SizedBox(height: 12),
                      _buildDetailRow('Email Address', email),
                      _buildDetailRow('Phone Number', phone),
                    ],
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildSectionHeader(String title) {
    return Text(
      title,
      style: const TextStyle(
        fontSize: 14,
        fontWeight: FontWeight.bold,
        color: Color(0xFF0F172A),
        letterSpacing: 0.5,
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: const TextStyle(
              fontSize: 13,
              color: Color(0xFF64748B),
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Text(
              value,
              textAlign: TextAlign.end,
              style: const TextStyle(
                fontSize: 13,
                color: Color(0xFF0F172A),
                fontWeight: FontWeight.bold,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }
}
