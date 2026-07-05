import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../services/api_service.dart';

class ResourceRequisitionsScreen extends StatefulWidget {
  const ResourceRequisitionsScreen({super.key});

  @override
  State<ResourceRequisitionsScreen> createState() => _ResourceRequisitionsScreenState();
}

class _ResourceRequisitionsScreenState extends State<ResourceRequisitionsScreen> {
  List<dynamic> _requisitions = [];
  bool _isLoading = true;
  List<dynamic> _departments = [];

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  Future<void> _fetchData() async {
    final apiService = Provider.of<ApiService>(context, listen: false);
    setState(() => _isLoading = true);
    try {
      final reqData = await apiService.getRequisitions();
      final deptData = await apiService.getList('/erp/departments');
      setState(() {
        _requisitions = reqData ?? [];
        _departments = deptData ?? [];
        _isLoading = false;
      });
    } catch (e) {
      debugPrint('Error fetching requisitions: $e');
      setState(() => _isLoading = false);
    }
  }

  Future<void> _submit(String id) async {
    final apiService = Provider.of<ApiService>(context, listen: false);
    final res = await apiService.submitRequisition(id);
    if (res != null && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Requisition submitted for manager approval')),
      );
      _fetchData();
    }
  }

  Future<void> _approveManager(String id) async {
    final apiService = Provider.of<ApiService>(context, listen: false);
    final notesController = TextEditingController();
    final bool? confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Manager Approval'),
        content: TextField(
          controller: notesController,
          decoration: const InputDecoration(
            hintText: 'Enter approval notes...',
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Approve'),
          ),
        ],
      ),
    );

    if (confirm == true && mounted) {
      final res = await apiService.approveRequisitionManager(id, notesController.text);
      if (res != null && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Requisition approved by Manager')),
        );
        _fetchData();
      }
    }
  }

  Future<void> _approveHR(String id) async {
    final apiService = Provider.of<ApiService>(context, listen: false);
    final notesController = TextEditingController();
    final bool? confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('HR Approval'),
        content: TextField(
          controller: notesController,
          decoration: const InputDecoration(
            hintText: 'Enter HR approval notes...',
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Approve'),
          ),
        ],
      ),
    );

    if (confirm == true && mounted) {
      final res = await apiService.approveRequisitionHR(id, notesController.text);
      if (res != null && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Requisition approved by HR')),
        );
        _fetchData();
      }
    }
  }

  Future<void> _reject(String id) async {
    final apiService = Provider.of<ApiService>(context, listen: false);
    final reasonController = TextEditingController();
    final bool? confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Reject Requisition'),
        content: TextField(
          controller: reasonController,
          decoration: const InputDecoration(
            hintText: 'Enter reason for rejection...',
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Reject'),
          ),
        ],
      ),
    );

    if (confirm == true && mounted) {
      final res = await apiService.rejectRequisition(id, reasonController.text);
      if (res != null && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Requisition rejected')),
        );
        _fetchData();
      }
    }
  }

  Future<void> _convertToPosition(String id) async {
    final apiService = Provider.of<ApiService>(context, listen: false);
    final res = await apiService.convertToPosition(id);
    if (res != null && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Converted to Recruitment Position successfully!')),
      );
      _fetchData();
    }
  }

  Future<void> _showCreateDialog() async {
    final apiService = Provider.of<ApiService>(context, listen: false);
    final titleController = TextEditingController();
    final positionsController = TextEditingController(text: '1');
    final budgetController = TextEditingController();
    final skillsController = TextEditingController();
    final justificationController = TextEditingController();
    
    String? selectedDeptId = _departments.isNotEmpty ? _departments.first['id'] : null;
    String selectedEmpType = 'permanent';
    DateTime selectedDate = DateTime.now().add(const Duration(days: 30));

    final bool? confirm = await showDialog<bool>(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              title: const Text('Create Requisition'),
              content: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    TextField(
                      controller: titleController,
                      decoration: const InputDecoration(labelText: 'Job Title'),
                    ),
                    const SizedBox(height: 8),
                    if (_departments.isNotEmpty) ...[
                      DropdownButtonFormField<String>(
                        initialValue: selectedDeptId,
                        decoration: const InputDecoration(labelText: 'Department'),
                        items: _departments.map((dept) {
                          return DropdownMenuItem<String>(
                            value: dept['id'],
                            child: Text(dept['name'] ?? 'Dept'),
                          );
                        }).toList(),
                        onChanged: (val) => setDialogState(() => selectedDeptId = val),
                      ),
                      const SizedBox(height: 8),
                    ],
                    TextField(
                      controller: positionsController,
                      decoration: const InputDecoration(labelText: 'Positions Count'),
                      keyboardType: TextInputType.number,
                    ),
                    const SizedBox(height: 8),
                    DropdownButtonFormField<String>(
                      initialValue: selectedEmpType,
                      decoration: const InputDecoration(labelText: 'Employment Type'),
                      items: const [
                        DropdownMenuItem(value: 'permanent', child: Text('Permanent')),
                        DropdownMenuItem(value: 'probation', child: Text('Probation')),
                        DropdownMenuItem(value: 'contract', child: Text('Contract')),
                      ],
                      onChanged: (val) => setDialogState(() => selectedEmpType = val!),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            'Target Joining Date: ${DateFormat('yyyy-MM-dd').format(selectedDate)}',
                          ),
                        ),
                        TextButton(
                          onPressed: () async {
                            final picked = await showDatePicker(
                              context: context,
                              initialDate: selectedDate,
                              firstDate: DateTime.now(),
                              lastDate: DateTime.now().add(const Duration(days: 365)),
                            );
                            if (picked != null) {
                              setDialogState(() => selectedDate = picked);
                            }
                          },
                          child: const Text('Pick Date'),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    TextField(
                      controller: budgetController,
                      decoration: const InputDecoration(labelText: 'Budget Range (e.g. 10L - 15L)'),
                    ),
                    const SizedBox(height: 8),
                    TextField(
                      controller: skillsController,
                      decoration: const InputDecoration(labelText: 'Required Skills (comma separated)'),
                    ),
                    const SizedBox(height: 8),
                    TextField(
                      controller: justificationController,
                      decoration: const InputDecoration(labelText: 'Justification'),
                      maxLines: 2,
                    ),
                  ],
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context, false),
                  child: const Text('Cancel'),
                ),
                ElevatedButton(
                  onPressed: () => Navigator.pop(context, true),
                  child: const Text('Save Draft'),
                ),
              ],
            );
          },
        );
      },
    );

    if (confirm == true && mounted) {
      final payload = {
        'title': titleController.text.trim(),
        'department_id': selectedDeptId,
        'num_positions': int.tryParse(positionsController.text) ?? 1,
        'employment_type': selectedEmpType,
        'justification': justificationController.text.trim(),
        'expected_joining_date': DateFormat('yyyy-MM-dd').format(selectedDate),
        'budget_range': budgetController.text.trim(),
        'skills_required': skillsController.text.trim(),
      };
      
      final res = await apiService.createRequisition(payload);
      if (res != null && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Requisition created successfully as draft')),
        );
        _fetchData();
      }
    }
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'draft':
        return Colors.grey;
      case 'pending_manager':
        return Colors.orange;
      case 'pending_hr':
        return Colors.amber.shade700;
      case 'approved':
        return Colors.green;
      case 'converted':
        return Colors.blue;
      case 'rejected':
        return Colors.red;
      default:
        return Colors.black;
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final user = Provider.of<ApiService>(context, listen: false).currentUser;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Resource Requisitions'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _requisitions.isEmpty
              ? const Center(child: Text('No resource requisitions found.'))
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: _requisitions.length,
                  itemBuilder: (context, index) {
                    final req = _requisitions[index];
                    final String title = req['title'] ?? 'Untitled Position';
                    final String reqNum = req['requisition_number'] ?? 'REQ';
                    final String deptName = req['department_name'] ?? 'General';
                    final int positions = req['num_positions'] ?? 1;
                    final String empType = req['employment_type'] ?? 'permanent';
                    final String status = req['status'] ?? 'draft';
                    final String budget = req['budget_range'] ?? 'Not Specified';
                    final String skills = req['skills_required'] ?? 'None';
                    final String dateStr = req['expected_joining_date'] ?? '';

                    final statusColor = _getStatusColor(status);

                    return Card(
                      margin: const EdgeInsets.only(bottom: 16),
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Expanded(
                                  child: Text(
                                    title,
                                    style: theme.textTheme.titleMedium?.copyWith(
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: statusColor.withValues(alpha: 0.1),
                                    borderRadius: BorderRadius.circular(6),
                                    border: Border.all(color: statusColor, width: 0.5),
                                  ),
                                  child: Text(
                                    status.toUpperCase(),
                                    style: TextStyle(
                                      color: statusColor,
                                      fontSize: 10,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 4),
                            Text(
                              '$reqNum • $deptName • $positions Position(s) • ${empType.toUpperCase()}',
                              style: theme.textTheme.bodySmall,
                            ),
                            const Divider(height: 24),
                            if (dateStr.isNotEmpty) ...[
                              Row(
                                children: [
                                  const Icon(Icons.date_range, size: 14, color: Colors.grey),
                                  const SizedBox(width: 6),
                                  Text('Target Date: $dateStr', style: theme.textTheme.bodyMedium),
                                ],
                              ),
                              const SizedBox(height: 4),
                            ],
                            Row(
                              children: [
                                const Icon(Icons.attach_money, size: 14, color: Colors.grey),
                                const SizedBox(width: 6),
                                Text('Budget: $budget', style: theme.textTheme.bodyMedium),
                              ],
                            ),
                            const SizedBox(height: 4),
                            Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Icon(Icons.psychology, size: 14, color: Colors.grey),
                                const SizedBox(width: 6),
                                Expanded(
                                  child: Text(
                                    'Skills: $skills',
                                    style: theme.textTheme.bodyMedium,
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            // Action buttons
                            Row(
                              mainAxisAlignment: MainAxisAlignment.end,
                              children: [
                                // Submit Button (Draft)
                                if (status == 'draft' && req['requested_by'] == user?.employeeId) ...[
                                  ElevatedButton(
                                    onPressed: () => _submit(req['id']),
                                    child: const Text('Submit'),
                                  ),
                                ],
                                // Manager Approval
                                if (status == 'pending_manager' && (user?.role == 'manager' || user?.role == 'hr_admin')) ...[
                                  OutlinedButton(
                                    onPressed: () => _reject(req['id']),
                                    style: OutlinedButton.styleFrom(foregroundColor: Colors.red),
                                    child: const Text('Reject'),
                                  ),
                                  const SizedBox(width: 8),
                                  ElevatedButton(
                                    onPressed: () => _approveManager(req['id']),
                                    child: const Text('Approve (Mgr)'),
                                  ),
                                ],
                                // HR Approval
                                if (status == 'pending_hr' && user?.role == 'hr_admin') ...[
                                  OutlinedButton(
                                    onPressed: () => _reject(req['id']),
                                    style: OutlinedButton.styleFrom(foregroundColor: Colors.red),
                                    child: const Text('Reject'),
                                  ),
                                  const SizedBox(width: 8),
                                  ElevatedButton(
                                    onPressed: () => _approveHR(req['id']),
                                    child: const Text('Approve (HR)'),
                                  ),
                                ],
                                // Convert to Recruitment Position
                                if (status == 'approved' && user?.role == 'hr_admin') ...[
                                  ElevatedButton(
                                    onPressed: () => _convertToPosition(req['id']),
                                    style: ElevatedButton.styleFrom(backgroundColor: Colors.blue),
                                    child: const Text('Convert to Position'),
                                  ),
                                ],
                              ],
                            )
                          ],
                        ),
                      ),
                    );
                  },
                ),
      floatingActionButton: FloatingActionButton(
        onPressed: _showCreateDialog,
        child: const Icon(Icons.add),
      ),
    );
  }
}
