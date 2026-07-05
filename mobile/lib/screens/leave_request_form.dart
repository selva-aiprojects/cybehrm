import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../services/api_service.dart';

class LeaveRequestForm extends StatefulWidget {
  const LeaveRequestForm({super.key});

  @override
  State<LeaveRequestForm> createState() => _LeaveRequestFormState();
}

class _LeaveRequestFormState extends State<LeaveRequestForm> {
  bool _isLoading = false;
  final _reasonController = TextEditingController();
  
  String _selectedType = 'casual';
  DateTime _startDate = DateTime.now();
  DateTime _endDate = DateTime.now();

  Future<void> _selectDate(BuildContext context, bool isStart) async {
    final theme = Theme.of(context);
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: isStart ? _startDate : _endDate,
      firstDate: DateTime.now().subtract(const Duration(days: 30)),
      lastDate: DateTime.now().add(const Duration(days: 365)),
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

    if (picked != null) {
      setState(() {
        if (isStart) {
          _startDate = picked;
          if (_endDate.isBefore(_startDate)) {
            _endDate = _startDate;
          }
        } else {
          _endDate = picked;
          if (_startDate.isAfter(_endDate)) {
            _startDate = _endDate;
          }
        }
      });
    }
  }

  Future<void> _submit() async {
    if (_reasonController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please provide a reason for the leave.')));
      return;
    }

    setState(() => _isLoading = true);

    final api = context.read<ApiService>();
    final result = await api.submitLeaveRequest(
      _selectedType,
      _startDate.toIso8601String().substring(0, 10),
      _endDate.toIso8601String().substring(0, 10),
      _reasonController.text.trim(),
    );

    setState(() => _isLoading = false);

    if (result != null) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Leave request submitted successfully!')));
        context.pop(true); // Return true to signal refresh
      }
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Failed to submit leave request.')));
      }
    }
  }

  @override
  void dispose() {
    _reasonController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(
        title: const Text('Request Leave'),
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
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Leave Type', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            DropdownButtonFormField<String>(
              initialValue: _selectedType,
              isExpanded: true,
              style: TextStyle(color: theme.colorScheme.onSurface),
              items: const [
                DropdownMenuItem(value: 'casual', child: Text('Casual Leave')),
                DropdownMenuItem(value: 'sick', child: Text('Sick Leave')),
                DropdownMenuItem(value: 'earned', child: Text('Earned Leave')),
                DropdownMenuItem(value: 'unpaid', child: Text('Unpaid Leave')),
              ],
              onChanged: (val) {
                if (val != null) setState(() => _selectedType = val);
              },
            ),
            const SizedBox(height: 24),
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Start Date', style: TextStyle(fontWeight: FontWeight.bold)),
                      const SizedBox(height: 8),
                      InkWell(
                        onTap: () => _selectDate(context, true),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF8FAFC),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: const Color(0xFFE5E9F2)),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                _startDate.toIso8601String().substring(0, 10),
                                style: TextStyle(color: theme.colorScheme.onSurface, fontWeight: FontWeight.w500),
                              ),
                              Icon(Icons.calendar_month, color: theme.colorScheme.primary, size: 20),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('End Date', style: TextStyle(fontWeight: FontWeight.bold)),
                      const SizedBox(height: 8),
                      InkWell(
                        onTap: () => _selectDate(context, false),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF8FAFC),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: const Color(0xFFE5E9F2)),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                _endDate.toIso8601String().substring(0, 10),
                                style: TextStyle(color: theme.colorScheme.onSurface, fontWeight: FontWeight.w500),
                              ),
                              Icon(Icons.calendar_month, color: theme.colorScheme.primary, size: 20),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
            const Text('Reason', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            TextField(
              controller: _reasonController,
              maxLines: 4,
              decoration: const InputDecoration(
                hintText: 'Enter reason for leave...',
              ),
            ),
            const SizedBox(height: 40),
            _isLoading
              ? const Center(child: CircularProgressIndicator())
              : ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    minimumSize: const Size(double.infinity, 50),
                  ),
                  onPressed: _submit,
                  child: const Text('Submit Request'),
                ),
          ],
        ),
      ),
    );
  }
}
