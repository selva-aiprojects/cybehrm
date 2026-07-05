import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../services/api_service.dart';
import 'package:intl/intl.dart';

class AttendanceLogsScreen extends StatefulWidget {
  const AttendanceLogsScreen({super.key});

  @override
  State<AttendanceLogsScreen> createState() => _AttendanceLogsScreenState();
}

class _AttendanceLogsScreenState extends State<AttendanceLogsScreen> {
  List<dynamic> _logs = [];
  bool _isLoading = true;
  DateTime _selectedDate = DateTime.now();

  @override
  void initState() {
    super.initState();
    _fetchLogs();
  }

  Future<void> _fetchLogs() async {
    setState(() => _isLoading = true);
    final apiService = Provider.of<ApiService>(context, listen: false);
    final dateStr = DateFormat('yyyy-MM-dd').format(_selectedDate);
    final data = await apiService.getAttendanceReport(dateStr);
    
    if (mounted) {
      setState(() {
        _logs = data ?? [];
        _isLoading = false;
      });
    }
  }

  Future<void> _selectDate(BuildContext context) async {
    final theme = Theme.of(context);
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate,
      firstDate: DateTime(2020),
      lastDate: DateTime.now(),
      builder: (context, child) {
        return Theme(
          data: theme.copyWith(
            colorScheme: theme.colorScheme.copyWith(
              primary: theme.colorScheme.primary,
              onPrimary: Colors.white,
              surface: Colors.white,
              onSurface: theme.colorScheme.onSurface,
            ),
          ),
          child: child!,
        );
      },
    );
    if (picked != null && picked != _selectedDate) {
      setState(() {
        _selectedDate = picked;
      });
      _fetchLogs();
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(
        title: const Text('Daily Attendance Logs'),
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
            icon: const Icon(Icons.calendar_today),
            onPressed: () => _selectDate(context),
          ),
        ],
      ),
      body: Column(
        children: [
          Container(
            padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
            color: theme.colorScheme.primary.withValues(alpha: 0.08),
            width: double.infinity,
            child: Text(
              'Showing logs for: ${DateFormat('MMMM d, yyyy').format(_selectedDate)}',
              style: TextStyle(color: theme.colorScheme.primary, fontWeight: FontWeight.bold),
              textAlign: TextAlign.center,
            ),
          ),
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _logs.isEmpty
                    ? const Center(child: Text('No check-ins recorded for this date.'))
                    : ListView.builder(
                        itemCount: _logs.length,
                        itemBuilder: (context, index) {
                          final log = _logs[index];
                          final name = log['employee'] != null 
                              ? '${log['employee']['first_name']} ${log['employee']['last_name']}' 
                              : 'Employee ID: ${log['employee_id']}';
                          
                          final checkIn = log['check_in'] != null 
                              ? DateFormat('h:mm a').format(DateTime.parse(log['check_in']).toLocal()) 
                              : '--';
                          final checkOut = log['check_out'] != null 
                              ? DateFormat('h:mm a').format(DateTime.parse(log['check_out']).toLocal()) 
                              : '--';
                              
                          final lateMins = log['late_minutes'] ?? 0;
                          final status = log['status'] ?? 'present';
                          
                          Color statusColor = theme.colorScheme.primary;
                          if (lateMins > 0) statusColor = Colors.orange;
                          if (status == 'absent') statusColor = theme.colorScheme.error;

                          return Card(
                            margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                            child: Padding(
                              padding: const EdgeInsets.all(16.0),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        name, 
                                        style: TextStyle(color: theme.colorScheme.onSurface, fontWeight: FontWeight.bold, fontSize: 15),
                                      ),
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                        decoration: BoxDecoration(
                                          color: statusColor.withValues(alpha: 0.12),
                                          borderRadius: BorderRadius.circular(4),
                                        ),
                                        child: Text(
                                          lateMins > 0 ? 'Late ($lateMins min)' : status.toUpperCase(),
                                          style: TextStyle(color: statusColor, fontSize: 10, fontWeight: FontWeight.bold),
                                        ),
                                      ),
                                    ],
                                  ),
                                  const Divider(height: 24),
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      _buildTimeBox(context, 'Check In', checkIn, Icons.login),
                                      _buildTimeBox(context, 'Check Out', checkOut, Icons.logout),
                                      _buildTimeBox(context, 'Work Mins', '${log['work_minutes'] ?? '--'}', Icons.timer),
                                    ],
                                  )
                                ],
                              ),
                            ),
                          );
                        },
                      ),
          ),
        ],
      ),
    );
  }

  Widget _buildTimeBox(BuildContext context, String label, String value, IconData icon) {
    final theme = Theme.of(context);
    return Column(
      children: [
        Icon(icon, color: Colors.grey.shade500, size: 16),
        const SizedBox(height: 4),
        Text(value, style: TextStyle(color: theme.colorScheme.onSurface, fontWeight: FontWeight.bold, fontSize: 13)),
        const SizedBox(height: 2),
        Text(label, style: TextStyle(color: Colors.grey.shade600, fontSize: 10)),
      ],
    );
  }
}
