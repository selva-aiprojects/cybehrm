import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../services/api_service.dart';

class LeaveManagementScreen extends StatefulWidget {
  const LeaveManagementScreen({super.key});

  @override
  State<LeaveManagementScreen> createState() => _LeaveManagementScreenState();
}

class _LeaveManagementScreenState extends State<LeaveManagementScreen> {
  bool _isLoading = true;
  List<dynamic> _balances = [];
  List<dynamic> _requests = [];

  @override
  void initState() {
    super.initState();
    _fetchLeaveData();
  }

  Future<void> _fetchLeaveData() async {
    setState(() => _isLoading = true);
    final api = context.read<ApiService>();
    
    final balances = await api.getLeaveBalances();
    final requests = await api.getLeaveRequests();
    
    setState(() {
      _balances = balances ?? [];
      _requests = requests ?? [];
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Leave Management'),
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
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator())
        : _buildContent(),
    );
  }

  Widget _buildContent() {
    final theme = Theme.of(context);
    return RefreshIndicator(
      onRefresh: _fetchLeaveData,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Leave Balances',
              style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            if (_balances.isEmpty)
              const Padding(
                padding: EdgeInsets.all(16.0),
                child: Text("No leave allocations found for this year.", style: TextStyle(color: Colors.grey)),
              ),
            ..._buildBalanceGrid(),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                minimumSize: const Size(double.infinity, 50),
              ),
              onPressed: () async {
                final result = await context.push('/leave/request');
                if (result == true) {
                  _fetchLeaveData(); // refresh data if new request submitted
                }
              },
              icon: const Icon(Icons.add),
              label: const Text('Request New Leave'),
            ),
            const SizedBox(height: 32),
            Text(
              'Recent Requests',
              style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            if (_requests.isEmpty)
              const Padding(
                padding: EdgeInsets.all(16.0),
                child: Text("No leave requests found.", style: TextStyle(color: Colors.grey)),
              ),
            ..._requests.map((req) => _buildLeaveHistoryItem(req)),
          ],
        ),
      ),
    );
  }

  List<Widget> _buildBalanceGrid() {
    List<Widget> rows = [];
    for (int i = 0; i < _balances.length; i += 2) {
      rows.add(
        Padding(
          padding: const EdgeInsets.only(bottom: 12.0),
          child: Row(
            children: [
              Expanded(child: _buildBalanceCard(_balances[i])),
              const SizedBox(width: 12),
              if (i + 1 < _balances.length)
                Expanded(child: _buildBalanceCard(_balances[i + 1]))
              else
                Expanded(child: Container()),
            ],
          ),
        ),
      );
    }
    return rows;
  }

  Widget _buildBalanceCard(Map<String, dynamic> balance) {
    final theme = Theme.of(context);
    // Determine color based on leave type
    Color color = theme.colorScheme.primary;
    if (balance['leave_type'].toString().toLowerCase().contains('sick')) {
      color = Colors.orange;
    } else if (balance['leave_type'].toString().toLowerCase().contains('casual')) {
      color = theme.colorScheme.secondary;
    }

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            Text(
              balance['leave_type'].toString().toUpperCase(),
              style: const TextStyle(color: Colors.grey, fontSize: 11, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text(
              balance['remaining'].toString(),
              style: TextStyle(color: color, fontSize: 32, fontWeight: FontWeight.bold),
            ),
            const Text('Days left', style: TextStyle(color: Colors.grey, fontSize: 11)),
          ],
        ),
      ),
    );
  }

  Widget _buildLeaveHistoryItem(Map<String, dynamic> request) {
    final theme = Theme.of(context);
    Color statusColor = Colors.grey;
    if (request['status'] == 'approved') statusColor = Colors.green;
    if (request['status'] == 'rejected') statusColor = theme.colorScheme.error;
    if (request['status'] == 'pending') statusColor = Colors.orange;

    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  request['leave_type'].toString().toUpperCase(),
                  style: TextStyle(color: theme.colorScheme.onSurface, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 6),
                Text(
                  '${request['start_date']} to ${request['end_date']} (${request['total_days']} days)', 
                  style: TextStyle(color: Colors.grey.shade600, fontSize: 12),
                ),
              ],
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: statusColor.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: statusColor, width: 0.5),
              ),
              child: Text(
                request['status'].toString().toUpperCase(),
                style: TextStyle(color: statusColor, fontSize: 11, fontWeight: FontWeight.bold),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
