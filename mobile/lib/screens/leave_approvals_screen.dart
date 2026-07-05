import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/api_service.dart';
import 'package:intl/intl.dart';

class LeaveApprovalsScreen extends StatefulWidget {
  const LeaveApprovalsScreen({super.key});

  @override
  State<LeaveApprovalsScreen> createState() => _LeaveApprovalsScreenState();
}

class _LeaveApprovalsScreenState extends State<LeaveApprovalsScreen> {
  List<dynamic> _pendingRequests = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchRequests();
  }

  Future<void> _fetchRequests() async {
    final apiService = Provider.of<ApiService>(context, listen: false);
    final data = await apiService.getLeaveRequests();
    if (mounted) {
      setState(() {
        _pendingRequests = (data ?? []).where((req) => req['status'] == 'pending').toList();
        _isLoading = false;
      });
    }
  }

  Future<void> _updateStatus(String requestId, String status) async {
    final apiService = Provider.of<ApiService>(context, listen: false);
    final theme = Theme.of(context);
    
    String rejectionReason = '';
    if (status == 'rejected') {
      final reasonController = TextEditingController();
      final bool? confirm = await showDialog<bool>(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text('Reject Leave'),
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
              style: ElevatedButton.styleFrom(backgroundColor: theme.colorScheme.error),
              onPressed: () => Navigator.pop(context, true),
              child: const Text('Reject'),
            ),
          ],
        ),
      );
      if (confirm != true) return;
      rejectionReason = reasonController.text;
    }

    final response = await apiService.updateLeaveStatus(requestId, status, rejectionReason);
    if (response != null && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Leave request $status successfully')),
      );
      _fetchRequests(); // Refresh the list
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(
        title: const Text('Pending Approvals'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _pendingRequests.isEmpty
              ? const Center(child: Text('No pending leave requests.', style: TextStyle(fontSize: 16)))
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: _pendingRequests.length,
                  itemBuilder: (context, index) {
                    final req = _pendingRequests[index];
                    final String name = req['employee_name'] ?? 'Unknown Employee';
                    final String type = (req['leave_type'] ?? 'Leave').toString().toUpperCase();
                    final String reason = req['reason'] ?? 'No reason provided';
                    final DateTime start = DateTime.parse(req['start_date']);
                    final DateTime end = DateTime.parse(req['end_date']);
                    final double duration = req['duration_days'] != null ? double.parse(req['duration_days'].toString()) : 1.0;
                    
                    final dateStr = '${DateFormat('MMM d, yyyy').format(start)} - ${DateFormat('MMM d, yyyy').format(end)}';

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
                                Text(
                                  name,
                                  style: TextStyle(color: theme.colorScheme.onSurface, fontSize: 16, fontWeight: FontWeight.bold),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: theme.colorScheme.primary.withValues(alpha: 0.12),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Text(
                                    type,
                                    style: TextStyle(color: theme.colorScheme.primary, fontWeight: FontWeight.bold, fontSize: 11),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            Row(
                              children: [
                                const Icon(Icons.date_range, color: Colors.grey, size: 16),
                                const SizedBox(width: 8),
                                Text(dateStr, style: TextStyle(color: Colors.grey.shade700, fontSize: 13)),
                              ],
                            ),
                            const SizedBox(height: 6),
                            Row(
                              children: [
                                const Icon(Icons.access_time, color: Colors.grey, size: 16),
                                const SizedBox(width: 8),
                                Text('$duration day(s)', style: TextStyle(color: Colors.grey.shade700, fontSize: 13)),
                              ],
                            ),
                            const SizedBox(height: 12),
                            Text(
                              'Reason: $reason',
                              style: TextStyle(color: Colors.grey.shade800, fontStyle: FontStyle.italic, fontSize: 13),
                            ),
                            const Divider(height: 24),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.end,
                              children: [
                                OutlinedButton(
                                  style: OutlinedButton.styleFrom(
                                    foregroundColor: theme.colorScheme.error,
                                    side: BorderSide(color: theme.colorScheme.error),
                                  ),
                                  onPressed: () => _updateStatus(req['id'], 'rejected'),
                                  child: const Text('Reject'),
                                ),
                                const SizedBox(width: 12),
                                ElevatedButton(
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: Colors.green,
                                    foregroundColor: Colors.white,
                                  ),
                                  onPressed: () => _updateStatus(req['id'], 'approved'),
                                  child: const Text('Approve'),
                                ),
                              ],
                            )
                          ],
                        ),
                      ),
                    );
                  },
                ),
    );
  }
}
