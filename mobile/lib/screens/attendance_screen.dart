import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:geolocator/geolocator.dart';
import '../services/api_service.dart';

class AttendanceScreen extends StatefulWidget {
  const AttendanceScreen({super.key});

  @override
  State<AttendanceScreen> createState() => _AttendanceScreenState();
}

class _AttendanceScreenState extends State<AttendanceScreen> {
  bool _isLoading = true;
  bool _isCheckedIn = false;
  Map<String, dynamic>? _todayRecord;
  List<dynamic> _history = [];

  @override
  void initState() {
    super.initState();
    _fetchAttendance();
  }

  Future<void> _fetchAttendance() async {
    setState(() => _isLoading = true);
    final api = context.read<ApiService>();
    final results = await api.getMyAttendance();
    
    if (results != null) {
      final todayStr = DateTime.now().toIso8601String().substring(0, 10);
      _history = results;
      
      try {
        _todayRecord = results.firstWhere(
          (record) => record['date'] == todayStr,
        );
        _isCheckedIn = _todayRecord != null && _todayRecord?['check_out'] == null;
      } catch (e) {
        _todayRecord = null;
        _isCheckedIn = false;
      }
    }
    setState(() => _isLoading = false);
  }

  Future<Position?> _determinePosition() async {
    bool serviceEnabled;
    LocationPermission permission;

    serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Location services are disabled.')),
        );
      }
      return null;
    }

    permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Location permissions are denied')),
          );
        }
        return null;
      }
    }
    
    if (permission == LocationPermission.deniedForever) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Location permissions are permanently denied.')),
        );
      }
      return null;
    } 

    return await Geolocator.getCurrentPosition();
  }

  Future<void> _toggleCheckIn() async {
    if (_todayRecord != null && _todayRecord?['check_out'] != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('You have already completed your shift for today!')),
      );
      return;
    }

    setState(() => _isLoading = true);

    // Get GPS
    final position = await _determinePosition();
    if (position == null) {
      if (mounted) {
        setState(() => _isLoading = false);
      }
      return;
    }

    if (!mounted) return;
    final api = context.read<ApiService>();
    Map<String, dynamic>? result;

    if (_isCheckedIn) {
      result = await api.checkOut(position.latitude, position.longitude);
    } else {
      result = await api.checkIn(position.latitude, position.longitude);
    }

    if (!mounted) return;
    if (result != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(_isCheckedIn ? 'Successfully Checked Out!' : 'Successfully Checked In!')),
      );
      await _fetchAttendance();
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Failed to process attendance.')),
      );
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Attendance'),
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
      onRefresh: _fetchAttendance,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const SizedBox(height: 32),
              _buildPunchCircle(),
              const SizedBox(height: 32),
              _buildTodayStats(),
              const SizedBox(height: 32),
              Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  'Recent History',
                  style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
                ),
              ),
              const SizedBox(height: 16),
              ..._history.take(5).map((record) => _buildHistoryItem(record)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPunchCircle() {
    final bool completed = _todayRecord != null && _todayRecord?['check_out'] != null;
    final Color color = completed ? Colors.grey : (_isCheckedIn ? Colors.redAccent : Colors.green);
    final String label = completed ? 'SHIFT ENDED' : (_isCheckedIn ? 'CHECK OUT' : 'CHECK IN');
    final IconData icon = completed ? Icons.check_circle : (_isCheckedIn ? Icons.logout : Icons.login);

    return Container(
      width: 220,
      height: 220,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: color.withValues(alpha: 0.08),
        border: Border.all(color: color, width: 4),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          customBorder: const CircleBorder(),
          onTap: completed ? null : _toggleCheckIn,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, size: 64, color: color),
              const SizedBox(height: 16),
              Text(
                label,
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: color,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTodayStats() {
    final theme = Theme.of(context);
    String status = "Away";
    if (_todayRecord != null) {
      if (_todayRecord?['check_out'] != null) {
        status = "Completed (${_todayRecord?['work_minutes'] ?? 0} mins)";
      } else {
        status = "Working";
      }
    }

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Current Status', style: TextStyle(color: Colors.grey, fontSize: 13)),
                const SizedBox(height: 4),
                Text(
                  status,
                  style: TextStyle(color: theme.colorScheme.onSurface, fontSize: 16, fontWeight: FontWeight.bold),
                ),
              ],
            ),
            if (_todayRecord != null && _todayRecord?['late_minutes'] != null && _todayRecord!['late_minutes'] > 0)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: Colors.orange.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  '${_todayRecord!['late_minutes']}m Late',
                  style: const TextStyle(color: Colors.orange, fontWeight: FontWeight.bold, fontSize: 12),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildHistoryItem(Map<String, dynamic> record) {
    final theme = Theme.of(context);
    final String status = record['status']?.toString() ?? 'absent';
    final Color statusColor = status.toLowerCase() == 'present' ? Colors.green : Colors.orange;

    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        title: Text(
          record['date'],
          style: TextStyle(color: theme.colorScheme.onSurface, fontWeight: FontWeight.bold, fontSize: 14),
        ),
        trailing: Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
          decoration: BoxDecoration(
            color: statusColor.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(6),
          ),
          child: Text(
            status.toUpperCase(),
            style: TextStyle(color: statusColor, fontSize: 11, fontWeight: FontWeight.bold),
          ),
        ),
      ),
    );
  }
}
