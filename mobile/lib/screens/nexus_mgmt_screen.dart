import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../services/api_service.dart';

class NexusMgmtScreen extends StatefulWidget {
  const NexusMgmtScreen({super.key});

  @override
  State<NexusMgmtScreen> createState() => _NexusMgmtScreenState();
}

class _NexusMgmtScreenState extends State<NexusMgmtScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(
        title: const Text('Nexus Management'),
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
        bottom: TabBar(
          controller: _tabController,
          labelColor: theme.colorScheme.primary,
          unselectedLabelColor: Colors.grey,
          indicatorColor: theme.colorScheme.primary,
          tabs: const [
            Tab(icon: Icon(Icons.business), text: 'Active Shards'),
            Tab(icon: Icon(Icons.confirmation_number), text: 'Global Tickets'),
            Tab(icon: Icon(Icons.memory), text: 'Infra Telemetry'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: const [
          _ShardsTab(),
          _TicketsTab(),
          _InfraTab(),
        ],
      ),
    );
  }
}

class _ShardsTab extends StatefulWidget {
  const _ShardsTab();
  @override
  State<_ShardsTab> createState() => _ShardsTabState();
}

class _ShardsTabState extends State<_ShardsTab> {
  List<dynamic> shards = [];
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchShards();
  }

  Future<void> _fetchShards() async {
    final api = context.read<ApiService>();
    final data = await api.getList('/nexus/shards');
    if (mounted) {
      setState(() {
        shards = data ?? [];
        isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    if (isLoading) return const Center(child: CircularProgressIndicator());
    if (shards.isEmpty) return const Center(child: Text('No active shards found.'));

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: shards.length,
      itemBuilder: (context, index) {
        final shard = shards[index];
        return Card(
          margin: const EdgeInsets.only(bottom: 12),
          child: ListTile(
            leading: const Icon(Icons.business_center, color: Colors.blueAccent),
            title: Text(shard['name'] ?? 'Unknown', style: TextStyle(fontWeight: FontWeight.bold, color: theme.colorScheme.onSurface)),
            subtitle: Text('Subdomain: ${shard['subdomain']} | Users: ${shard['user_count']}', style: TextStyle(color: Colors.grey.shade700)),
            trailing: Chip(
              label: Text(shard['subscription_plan']?.toString().toUpperCase() ?? 'NONE'),
            ),
          ),
        );
      },
    );
  }
}

class _TicketsTab extends StatefulWidget {
  const _TicketsTab();
  @override
  State<_TicketsTab> createState() => _TicketsTabState();
}

class _TicketsTabState extends State<_TicketsTab> {
  List<dynamic> tickets = [];
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchTickets();
  }

  Future<void> _fetchTickets() async {
    final api = context.read<ApiService>();
    final data = await api.getList('/nexus/tickets');
    if (mounted) {
      setState(() {
        tickets = data ?? [];
        isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    if (isLoading) return const Center(child: CircularProgressIndicator());
    if (tickets.isEmpty) return const Center(child: Text('No global tickets found.'));

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: tickets.length,
      itemBuilder: (context, index) {
        final ticket = tickets[index];
        final isResolved = ticket['status'] == 'resolved';
        return Card(
          margin: const EdgeInsets.only(bottom: 12),
          child: ListTile(
            leading: Icon(
              isResolved ? Icons.check_circle : Icons.warning,
              color: isResolved ? Colors.green : Colors.orange,
            ),
            title: Text(ticket['title'] ?? 'No Title', style: TextStyle(fontWeight: FontWeight.bold, color: theme.colorScheme.onSurface)),
            subtitle: Text('${ticket['organization_name']} | Priority: ${ticket['priority']}', style: TextStyle(color: Colors.grey.shade700)),
            trailing: Text(ticket['status']?.toString().toUpperCase() ?? 'OPEN', style: TextStyle(color: isResolved ? Colors.green : Colors.orange, fontWeight: FontWeight.bold)),
          ),
        );
      },
    );
  }
}

class _InfraTab extends StatefulWidget {
  const _InfraTab();
  @override
  State<_InfraTab> createState() => _InfraTabState();
}

class _InfraTabState extends State<_InfraTab> {
  Map<String, dynamic>? infra;
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchInfra();
  }

  Future<void> _fetchInfra() async {
    final api = context.read<ApiService>();
    final data = await api.get('/nexus/infra-status');
    if (mounted) {
      setState(() {
        infra = data;
        isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (isLoading) return const Center(child: CircularProgressIndicator());
    if (infra == null) return const Center(child: Text('Failed to load infra stats.'));

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        _buildStatCard('System Status', infra!['system_status']?.toString().toUpperCase() ?? 'UNKNOWN', Icons.health_and_safety, Colors.green),
        _buildStatCard('Database Engine', infra!['db_engine'], Icons.storage, Colors.blue),
        _buildStatCard('DB Size (KB)', infra!['db_size_kb'].toString(), Icons.folder, Colors.orange),
        _buildStatCard('Total Shards', infra!['total_shards'].toString(), Icons.business, Colors.purple),
        _buildStatCard('Active Tickets', infra!['active_tickets'].toString(), Icons.confirmation_number, Colors.red),
        _buildStatCard('CPU Load', '${infra!['load_cpu']}%', Icons.memory, Colors.teal),
        _buildStatCard('Memory Load', '${infra!['load_memory']}%', Icons.memory_outlined, Colors.cyan),
      ],
    );
  }

  Widget _buildStatCard(String title, String value, IconData icon, Color color) {
    final theme = Theme.of(context);
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: Icon(icon, color: color, size: 32),
        title: Text(title, style: const TextStyle(color: Colors.grey, fontSize: 13)),
        subtitle: Text(value, style: TextStyle(color: theme.colorScheme.onSurface, fontSize: 16, fontWeight: FontWeight.bold)),
      ),
    );
  }
}
