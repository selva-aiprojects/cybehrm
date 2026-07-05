import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../services/api_service.dart';

class TalentJobsScreen extends StatefulWidget {
  const TalentJobsScreen({super.key});

  @override
  State<TalentJobsScreen> createState() => _TalentJobsScreenState();
}

class _TalentJobsScreenState extends State<TalentJobsScreen> {
  List<dynamic> _jobs = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchJobs();
  }

  Future<void> _fetchJobs() async {
    final apiService = Provider.of<ApiService>(context, listen: false);
    final data = await apiService.getOpenJobs();
    if (mounted) {
      setState(() {
        _jobs = data ?? [];
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(
        title: const Text('Active Job Postings'),
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
          : _jobs.isEmpty
              ? const Center(child: Text('No active job postings at the moment.'))
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: _jobs.length,
                  itemBuilder: (context, index) {
                    final job = _jobs[index];
                    final String title = job['title'] ?? 'Untitled Position';
                    final String department = job['department']?['name'] ?? 'General';
                    final String location = job['location'] ?? 'Remote';
                    final String type = job['employment_type'] ?? 'full-time';
                    final int positions = job['positions'] ?? 1;

                    return Card(
                      margin: const EdgeInsets.only(bottom: 16),
                      child: InkWell(
                        onTap: () => context.push('/job-candidates', extra: job),
                        borderRadius: BorderRadius.circular(12),
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Container(
                                    padding: const EdgeInsets.all(12),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFF00CEC9).withValues(alpha: 0.12),
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: const Icon(Icons.work, color: Color(0xFF00CEC9)),
                                  ),
                                  const SizedBox(width: 16),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(title, style: TextStyle(color: theme.colorScheme.onSurface, fontSize: 16, fontWeight: FontWeight.bold)),
                                        const SizedBox(height: 4),
                                        Text(department, style: const TextStyle(color: Color(0xFF00CEC9), fontWeight: FontWeight.w600, fontSize: 13)),
                                      ],
                                    ),
                                  )
                                ],
                              ),
                              const Divider(height: 32),
                              Row(
                                children: [
                                  const Icon(Icons.location_on, color: Colors.grey, size: 16),
                                  const SizedBox(width: 6),
                                  Text(location, style: TextStyle(color: Colors.grey.shade600, fontSize: 13)),
                                  const Spacer(),
                                  const Icon(Icons.people, color: Colors.grey, size: 16),
                                  const SizedBox(width: 6),
                                  Text('$positions open', style: TextStyle(color: Colors.grey.shade600, fontSize: 13)),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Row(
                                children: [
                                  const Icon(Icons.access_time, color: Colors.grey, size: 16),
                                  const SizedBox(width: 6),
                                  Text(type.toUpperCase(), style: TextStyle(color: Colors.grey.shade600, fontSize: 13)),
                                ],
                              )
                            ],
                          ),
                        ),
                      ),
                    );
                  },
                ),
    );
  }
}
