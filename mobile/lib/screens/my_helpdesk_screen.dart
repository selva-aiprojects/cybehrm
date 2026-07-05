import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../services/api_service.dart';
import '../theme_config.dart';
import '../widgets/premium_components.dart';

class MyHelpdeskScreen extends StatefulWidget {
  const MyHelpdeskScreen({super.key});
  @override
  State<MyHelpdeskScreen> createState() => _MyHelpdeskScreenState();
}

class _MyHelpdeskScreenState extends State<MyHelpdeskScreen> {
  bool _isLoading = true;
  List<dynamic> _tickets = [];

  final _titleCtrl = TextEditingController();
  final _descCtrl = TextEditingController();
  String _category = 'IT';
  String _priority = 'medium';
  bool _showForm = false;
  bool _isSubmitting = false;

  @override
  void initState() { super.initState(); _fetch(); }

  @override
  void dispose() { _titleCtrl.dispose(); _descCtrl.dispose(); super.dispose(); }

  Future<void> _fetch() async {
    setState(() => _isLoading = true);
    try {
      final data = await context.read<ApiService>().getTenantSupportTickets();
      if (mounted) setState(() { _tickets = data ?? []; _isLoading = false; });
    } catch (_) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _submit() async {
    final title = _titleCtrl.text.trim();
    final desc = _descCtrl.text.trim();
    if (title.isEmpty || desc.isEmpty) {
      _msg('Please fill in title and description.', isErr: true);
      return;
    }
    setState(() => _isSubmitting = true);
    final res = await context.read<ApiService>().raiseSupportTicket({'title': title, 'description': desc, 'category': _category, 'priority': _priority});
    if (!mounted) return;
    setState(() => _isSubmitting = false);
    if (res != null) {
      _msg('Ticket submitted successfully!');
      setState(() { _showForm = false; _titleCtrl.clear(); _descCtrl.clear(); _category = 'IT'; _priority = 'medium'; });
      _fetch();
    } else {
      _msg('Failed to submit ticket.', isErr: true);
    }
  }

  void _msg(String m, {bool isErr = false}) => ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(content: Text(m), backgroundColor: isErr ? CogniTheme.rose700 : CogniTheme.emerald700));

  Color _priorityColor(String p) => {
    'critical': CogniTheme.rose700, 'high': CogniTheme.amber700, 'medium': CogniTheme.brand700
  }[p.toLowerCase()] ?? CogniTheme.emerald700;

  Color _statusColor(String s) => {
    'open': CogniTheme.brand700, 'in_progress': CogniTheme.amber700, 'resolved': CogniTheme.emerald700, 'closed': CogniTheme.ink500
  }[s.toLowerCase()] ?? CogniTheme.brand700;

  Color _statusBg(String s) => {
    'open': CogniTheme.brand100, 'in_progress': CogniTheme.amber100, 'resolved': CogniTheme.emerald100, 'closed': CogniTheme.ink100
  }[s.toLowerCase()] ?? CogniTheme.brand100;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: CogniTheme.ink50,
      appBar: AppBar(
        title: Text('Helpdesk', style: GoogleFonts.inter(fontWeight: FontWeight.w700)),
        actions: [
          if (!_showForm && !_isLoading)
            Padding(
              padding: const EdgeInsets.only(right: 12),
              child: ElevatedButton.icon(
                onPressed: () => setState(() => _showForm = true),
                icon: const Icon(Icons.add_rounded, size: 16),
                label: const Text('New Ticket'),
                style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8)),
              ),
            ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : AnimatedSwitcher(duration: const Duration(milliseconds: 250), child: _showForm ? _buildForm() : _buildTicketList()),
    );
  }

  Widget _buildTicketList() {
    if (_tickets.isEmpty) {
      return const EmptyStateWidget(icon: Icons.headset_mic_rounded, message: 'All clear! Tap "New Ticket" to raise a support request.');
    }
    final open = _tickets.where((t) => (t['status'] ?? '').toString().toLowerCase() == 'open').length;
    final resolved = _tickets.where((t) => (t['status'] ?? '').toString().toLowerCase() == 'resolved').length;

    return CustomScrollView(
      slivers: [
        SliverToBoxAdapter(
          child: YtdSummaryCard(
            title: 'Support Tickets Overview',
            stats: [
              YtdStatItem(label: 'Total raised', value: '${_tickets.length}'),
              YtdStatItem(label: 'Open', value: '$open', valueColor: CogniTheme.amber500),
              YtdStatItem(label: 'Resolved', value: '$resolved', valueColor: CogniTheme.emerald500),
            ],
          ),
        ),
        SliverPadding(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 32),
          sliver: SliverList(
            delegate: SliverChildBuilderDelegate((ctx, i) => _buildTicketCard(_tickets[i]), childCount: _tickets.length),
          ),
        ),
      ],
    );
  }

  Widget _buildTicketCard(Map<String, dynamic> t) {
    final title = t['title'] ?? 'Ticket';
    final category = t['category'] ?? 'General';
    final priority = (t['priority'] ?? 'medium').toString().toLowerCase();
    final status = (t['status'] ?? 'open').toString().toLowerCase();
    final desc = t['description'] ?? '';
    final resolution = t['resolution_notes'];
    final date = FormatUtils.formatShortDate(t['created_at']);
    final sColor = _statusColor(status);
    final sBg = _statusBg(status);
    final pColor = _priorityColor(priority);

    return PremiumCard(
      leftBorderColor: pColor, padding: EdgeInsets.zero,
      child: Theme(
        data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
        child: ExpansionTile(
          tilePadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
          childrenPadding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
          leading: Container(width: 40, height: 40, decoration: BoxDecoration(color: sBg, borderRadius: BorderRadius.circular(12)),
            child: Icon(Icons.headset_mic_rounded, color: sColor, size: 20)),
          title: Text(title, style: GoogleFonts.inter(fontWeight: FontWeight.w700, fontSize: 14, color: CogniTheme.ink900)),
          subtitle: Padding(
            padding: const EdgeInsets.only(top: 4),
            child: Row(children: [
              Text(category, style: GoogleFonts.inter(fontSize: 11, color: CogniTheme.ink500, fontWeight: FontWeight.w600)),
              Text('  •  $date', style: GoogleFonts.inter(fontSize: 11, color: CogniTheme.ink400)),
            ]),
          ),
          trailing: Column(mainAxisAlignment: MainAxisAlignment.center, crossAxisAlignment: CrossAxisAlignment.end, children: [
            Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3), decoration: BoxDecoration(color: sBg, borderRadius: BorderRadius.circular(8)),
              child: Text(status.toUpperCase(), style: GoogleFonts.inter(color: sColor, fontSize: 8, fontWeight: FontWeight.w800))),
            const SizedBox(height: 4),
            Text(priority.toUpperCase(), style: GoogleFonts.inter(color: pColor, fontSize: 9, fontWeight: FontWeight.w800)),
          ]),
          children: [
            Container(
              width: double.infinity, padding: const EdgeInsets.all(14), decoration: BoxDecoration(color: CogniTheme.ink50, borderRadius: BorderRadius.circular(12)),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text('Description', style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w700, color: CogniTheme.ink500)),
                const SizedBox(height: 6),
                Text(desc, style: GoogleFonts.inter(fontSize: 13, color: CogniTheme.ink700, height: 1.5)),
                if (resolution != null && resolution.toString().isNotEmpty) ...[
                  const SizedBox(height: 12),
                  Container(
                    width: double.infinity, padding: const EdgeInsets.all(12), decoration: BoxDecoration(color: CogniTheme.emerald100, borderRadius: BorderRadius.circular(10)),
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Row(children: [
                        const Icon(Icons.check_circle_rounded, color: CogniTheme.emerald700, size: 14),
                        const SizedBox(width: 6),
                        Text('Resolution Notes', style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w700, color: CogniTheme.emerald700)),
                      ]),
                      const SizedBox(height: 6),
                      Text(resolution.toString(), style: GoogleFonts.inter(fontSize: 12, color: CogniTheme.emerald700, height: 1.4)),
                    ]),
                  ),
                ],
              ]),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildForm() {
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(16, 20, 16, 40),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(children: [
            GestureDetector(
              onTap: () => setState(() => _showForm = false),
              child: Container(padding: const EdgeInsets.all(8), decoration: BoxDecoration(color: CogniTheme.ink100, borderRadius: BorderRadius.circular(10)),
                child: const Icon(Icons.arrow_back_rounded, size: 18, color: CogniTheme.ink700)),
            ),
            const SizedBox(width: 14),
            Text('Raise Support Ticket', style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.w800, color: CogniTheme.ink900)),
          ]),
          const SizedBox(height: 4),
          Padding(padding: const EdgeInsets.only(left: 42),
            child: Text('Our support team typically responds within 24 hours.', style: GoogleFonts.inter(fontSize: 12, color: CogniTheme.ink500))),
          const SizedBox(height: 24),
          _label('Ticket Title *'),
          TextField(controller: _titleCtrl, decoration: const InputDecoration(hintText: 'Brief summary of your issue')),
          const SizedBox(height: 16),
          Row(children: [
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              _label('Category'),
              DropdownButtonFormField<String>(
                initialValue: _category,
                items: ['IT', 'HR', 'Payroll', 'Facilities', 'General'].map((c) => DropdownMenuItem(value: c, child: Text(c))).toList(),
                onChanged: (v) { if (v != null) setState(() => _category = v); },
              ),
            ])),
            const SizedBox(width: 12),
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              _label('Priority'),
              DropdownButtonFormField<String>(
                initialValue: _priority,
                items: const [
                  DropdownMenuItem(value: 'low', child: Text('Low')),
                  DropdownMenuItem(value: 'medium', child: Text('Medium')),
                  DropdownMenuItem(value: 'high', child: Text('High')),
                  DropdownMenuItem(value: 'critical', child: Text('Critical')),
                ],
                onChanged: (v) { if (v != null) setState(() => _priority = v); },
              ),
            ])),
          ]),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(12), decoration: BoxDecoration(color: _priorityColor(_priority).withValues(alpha: 0.08), borderRadius: BorderRadius.circular(12)),
            child: Row(children: [
              Container(width: 10, height: 10, decoration: BoxDecoration(color: _priorityColor(_priority), shape: BoxShape.circle)),
              const SizedBox(width: 10),
              Text('${_priority[0].toUpperCase()}${_priority.substring(1)} Priority — ', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w700, color: _priorityColor(_priority))),
              Expanded(child: Text(_priorityHint(_priority), style: GoogleFonts.inter(fontSize: 12, color: _priorityColor(_priority).withValues(alpha: 0.8)))),
            ]),
          ),
          const SizedBox(height: 16),
          _label('Describe your issue *'),
          TextField(
            controller: _descCtrl, maxLines: 5,
            decoration: const InputDecoration(hintText: 'Provide details to resolve your issue quickly.', alignLabelWithHint: true),
          ),
          const SizedBox(height: 28),
          SizedBox(width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: _isSubmitting ? null : _submit,
              icon: _isSubmitting ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)) : const Icon(Icons.send_rounded),
              label: Text(_isSubmitting ? 'Submitting...' : 'Submit to Helpdesk'),
            )),
        ],
      ),
    );
  }

  String _priorityHint(String p) => {
    'critical': 'Escalated immediately', 'high': 'Responded within 4 hours', 'medium': 'Responded within 24 hours'
  }[p] ?? 'Responded within 3 days';

  Widget _label(String t) => Padding(
    padding: const EdgeInsets.only(bottom: 6),
    child: Text(t, style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w700, color: CogniTheme.ink700)),
  );
}
