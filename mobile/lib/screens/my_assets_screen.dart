import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../services/api_service.dart';
import '../theme_config.dart';
import '../widgets/premium_components.dart';

class MyAssetsScreen extends StatefulWidget {
  const MyAssetsScreen({super.key});
  @override
  State<MyAssetsScreen> createState() => _MyAssetsScreenState();
}

class _MyAssetsScreenState extends State<MyAssetsScreen> {
  bool _isLoading = true;
  List<dynamic> _assets = [];

  @override
  void initState() { super.initState(); _fetch(); }

  Future<void> _fetch() async {
    setState(() => _isLoading = true);
    try {
      final data = await context.read<ApiService>().getMyAssets();
      if (mounted) setState(() { _assets = data ?? []; _isLoading = false; });
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  IconData _assetIcon(String? type) {
    switch ((type ?? '').toLowerCase()) {
      case 'laptop': case 'computer': return Icons.laptop_rounded;
      case 'phone': case 'mobile': return Icons.smartphone_rounded;
      case 'monitor': case 'display': return Icons.monitor_rounded;
      case 'keyboard': return Icons.keyboard_rounded;
      case 'mouse': return Icons.mouse_rounded;
      case 'headset': case 'headphone': return Icons.headset_rounded;
      case 'tablet': return Icons.tablet_rounded;
      default: return Icons.devices_other_rounded;
    }
  }

  Color _statusColor(String? s) {
    switch ((s ?? '').toLowerCase()) {
      case 'active': case 'assigned': return CogniTheme.emerald700;
      case 'under repair': case 'maintenance': return CogniTheme.amber700;
      case 'lost': case 'damaged': return CogniTheme.rose700;
      default: return CogniTheme.ink500;
    }
  }

  Color _statusBg(String? s) {
    switch ((s ?? '').toLowerCase()) {
      case 'active': case 'assigned': return CogniTheme.emerald100;
      case 'under repair': case 'maintenance': return CogniTheme.amber100;
      case 'lost': case 'damaged': return CogniTheme.rose100;
      default: return CogniTheme.ink100;
    }
  }

  @override
  Widget build(BuildContext context) {
    final grouped = <String, List<dynamic>>{};
    for (final a in _assets) {
      final t = (a['asset_type'] ?? 'Other').toString();
      grouped.putIfAbsent(t, () => []).add(a);
    }

    final total   = _assets.length;
    final active  = _assets.where((a) => (a['status'] ?? '').toString().toLowerCase() == 'active').length;
    final repair  = _assets.where((a) => (a['status'] ?? '').toString().toLowerCase() == 'under repair').length;

    return Scaffold(
      backgroundColor: CogniTheme.ink50,
      appBar: AppBar(
        title: Text('My Assets', style: GoogleFonts.inter(fontWeight: FontWeight.w700)),
        actions: [
          IconButton(icon: const Icon(Icons.refresh_rounded), onPressed: _fetch, tooltip: 'Refresh'),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _fetch, color: CogniTheme.brand700,
              child: _assets.isEmpty
                  ? const EmptyStateWidget(
                      icon: Icons.devices_other_rounded,
                      message: 'You have no company hardware or equipment assigned to you.',
                    )
                  : CustomScrollView(
                      slivers: [
                        SliverToBoxAdapter(
                          child: YtdSummaryCard(
                            title: 'Assets Summary',
                            stats: [
                              YtdStatItem(label: 'Total Assigned', value: '$total'),
                              YtdStatItem(label: 'Active', value: '$active', valueColor: CogniTheme.emerald500),
                              YtdStatItem(label: 'Under Repair', value: '$repair', valueColor: CogniTheme.amber500),
                            ],
                          ),
                        ),
                        ...grouped.entries.map((entry) => SliverToBoxAdapter(
                          child: _buildCategory(entry.key, entry.value),
                        )),
                        const SliverToBoxAdapter(child: SizedBox(height: 32)),
                      ],
                    ),
            ),
    );
  }

  Widget _buildCategory(String type, List<dynamic> items) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(children: [
            Container(padding: const EdgeInsets.all(6), decoration: BoxDecoration(color: CogniTheme.brand100, borderRadius: BorderRadius.circular(8)),
              child: Icon(_assetIcon(type), size: 14, color: CogniTheme.brand700)),
            const SizedBox(width: 8),
            Text(type.toUpperCase(), style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w800, color: CogniTheme.ink500, letterSpacing: 0.7)),
            const SizedBox(width: 8),
            Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
              decoration: BoxDecoration(color: CogniTheme.ink100, borderRadius: BorderRadius.circular(10)),
              child: Text('${items.length}', style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w700, color: CogniTheme.ink700))),
          ]),
          const SizedBox(height: 10),
          ...items.map((a) => _assetTile(a)),
        ],
      ),
    );
  }

  Widget _assetTile(Map<String, dynamic> a) {
    final name    = a['asset_name'] ?? 'Asset';
    final serial  = a['serial_number'] ?? '--';
    final status  = a['status'] ?? 'Active';
    final assigned= FormatUtils.formatShortDate(a['assigned_date']);
    final type    = a['asset_type'] ?? '';

    return PremiumCard(
      leftBorderColor: _statusColor(status),
      child: Row(
        children: [
          Container(
            width: 48, height: 48,
            decoration: BoxDecoration(
              gradient: LinearGradient(colors: [CogniTheme.brand700, CogniTheme.violet700.withValues(alpha: 0.8)], begin: Alignment.topLeft, end: Alignment.bottomRight),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Icon(_assetIcon(type), color: Colors.white, size: 24),
          ),
          const SizedBox(width: 14),
          Expanded(child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(name, style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w700, color: CogniTheme.ink900)),
              const SizedBox(height: 3),
              Text('S/N: $serial', style: GoogleFonts.robotoMono(fontSize: 11, color: CogniTheme.ink500)),
              const SizedBox(height: 3),
              Row(children: [
                const Icon(Icons.calendar_today_outlined, size: 10, color: CogniTheme.ink300),
                const SizedBox(width: 4),
                Text('Assigned $assigned', style: GoogleFonts.inter(fontSize: 11, color: CogniTheme.ink400)),
              ]),
            ],
          )),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
            decoration: BoxDecoration(color: _statusBg(status), borderRadius: BorderRadius.circular(10)),
            child: Text(status.toUpperCase(), style: GoogleFonts.inter(fontSize: 9, fontWeight: FontWeight.w800, color: _statusColor(status))),
          ),
        ],
      ),
    );
  }
}
