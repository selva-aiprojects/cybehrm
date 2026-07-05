import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../services/api_service.dart';
import '../theme_config.dart';
import '../widgets/premium_components.dart';

class MyExitScreen extends StatefulWidget {
  const MyExitScreen({super.key});
  @override
  State<MyExitScreen> createState() => _MyExitScreenState();
}

class _MyExitScreenState extends State<MyExitScreen> {
  bool _isLoading = true;
  Map<String, dynamic>? _request;
  Map<String, dynamic>? _settlement;

  DateTime _resignDate    = DateTime.now();
  DateTime _relievingDate = DateTime.now().add(const Duration(days: 90));
  final _reasonCtrl       = TextEditingController();

  @override
  void initState() { super.initState(); _fetch(); }

  @override
  void dispose() { _reasonCtrl.dispose(); super.dispose(); }

  Future<void> _fetch() async {
    setState(() => _isLoading = true);
    final api = context.read<ApiService>();
    try {
      final req = await api.getMyOffboarding();
      Map<String, dynamic>? settlement;
      if (req != null && req['id'] != null) {
        try {
          settlement = await api.getFinalSettlement(req['id'].toString());
        } catch (_) {}
      }
      if (mounted) {
        setState(() {
          _request = req;
          _settlement = settlement;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _pickDate(bool isResign) async {
    final picked = await showDatePicker(
      context: context, firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
      initialDate: isResign ? _resignDate : _relievingDate,
    );
    if (picked != null && mounted) {
      setState(() {
        if (isResign) {
          _resignDate = picked;
        } else {
          _relievingDate = picked;
        }
      });
    }
  }

  Future<void> _submitResignation() async {
    if (_reasonCtrl.text.trim().isEmpty) { _err('Please provide a reason for resignation.'); return; }
    setState(() => _isLoading = true);
    final res = await context.read<ApiService>().applyResignation({
      'resignation_date': _resignDate.toIso8601String().substring(0, 10),
      'requested_relieving_date': _relievingDate.toIso8601String().substring(0, 10),
      'reason': _reasonCtrl.text.trim(),
    });
    if (!mounted) return;
    if (res != null) {
      _ok('Resignation submitted successfully.');
      _fetch();
    } else {
      setState(() => _isLoading = false);
      _err('Failed to submit resignation. Please contact HR.');
    }
  }

  void _err(String m) => ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(m), backgroundColor: CogniTheme.rose700));
  void _ok(String m)  => ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(m), backgroundColor: CogniTheme.emerald700));

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: CogniTheme.ink50,
      appBar: AppBar(title: Text('Exit Center', style: GoogleFonts.inter(fontWeight: FontWeight.w700))),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _fetch, color: CogniTheme.brand700,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
                child: _request == null ? _buildResignationForm() : _buildStatus(),
              ),
            ),
    );
  }

  Widget _buildResignationForm() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            gradient: const LinearGradient(colors: [Color(0xFFDC2626), Color(0xFF991B1B)],
              begin: Alignment.topLeft, end: Alignment.bottomRight),
            borderRadius: BorderRadius.circular(20),
            boxShadow: [BoxShadow(color: const Color(0xFFDC2626).withValues(alpha: 0.25), blurRadius: 20, offset: const Offset(0, 8))],
          ),
          child: Row(
            children: [
              Container(padding: const EdgeInsets.all(12), decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.15), shape: BoxShape.circle),
                child: const Icon(Icons.logout_rounded, color: Colors.white, size: 28)),
              const SizedBox(width: 16),
              Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text('Submit Resignation', style: GoogleFonts.inter(color: Colors.white, fontSize: 17, fontWeight: FontWeight.w800)),
                const SizedBox(height: 4),
                Text('This initiates your offboarding. Please read HR policy before proceeding.',
                  style: GoogleFonts.inter(color: Colors.white70, fontSize: 12, height: 1.4)),
              ])),
            ],
          ),
        ),
        const SizedBox(height: 24),
        _formLabel('Resignation Date'),
        _datePicker(_resignDate, () => _pickDate(true)),
        const SizedBox(height: 16),
        _formLabel('Requested Relieving Date'),
        _datePicker(_relievingDate, () => _pickDate(false)),
        const SizedBox(height: 16),
        _formLabel('Reason for Leaving'),
        TextField(
          controller: _reasonCtrl, maxLines: 4,
          decoration: const InputDecoration(hintText: 'Please provide a detailed reason for your resignation...',
            alignLabelWithHint: true),
        ),
        const SizedBox(height: 28),
        SizedBox(width: double.infinity,
          child: ElevatedButton.icon(
            onPressed: _submitResignation,
            style: ElevatedButton.styleFrom(backgroundColor: CogniTheme.rose700),
            icon: const Icon(Icons.send_rounded),
            label: const Text('Submit Resignation'),
          )),
        const SizedBox(height: 12),
        Center(child: Text('This action will notify your manager and HR team.',
          style: GoogleFonts.inter(fontSize: 11, color: CogniTheme.ink500))),
      ],
    );
  }

  Widget _datePicker(DateTime date, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: CogniTheme.ink100)),
        child: Row(
          children: [
            const Icon(Icons.calendar_today_rounded, color: CogniTheme.brand700, size: 18),
            const SizedBox(width: 12),
            Text(DateFormat('dd MMMM yyyy').format(date), style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w600, color: CogniTheme.ink900)),
            const Spacer(),
            const Icon(Icons.edit_calendar_rounded, color: CogniTheme.ink500, size: 16),
          ],
        ),
      ),
    );
  }

  Widget _buildStatus() {
    final status   = (_request?['status'] ?? 'pending').toString().toLowerCase();
    final reason   = _request?['reason'] ?? '--';
    final reDate   = FormatUtils.formatShortDate(_request?['resignation_date']);
    final rlDate   = FormatUtils.formatShortDate(_request?['requested_relieving_date']);
    final it       = (_request?['it_clearance'] as bool?) ?? false;
    final hr       = (_request?['hr_clearance'] as bool?) ?? false;
    final finance  = (_request?['finance_clearance'] as bool?) ?? false;

    Color statusColor = status == 'approved' ? CogniTheme.emerald700 : (status == 'rejected' ? CogniTheme.rose700 : CogniTheme.amber700);
    Color statusBg = status == 'approved' ? CogniTheme.emerald100 : (status == 'rejected' ? CogniTheme.rose100 : CogniTheme.amber100);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        PremiumCard(
          leftBorderColor: statusColor,
          padding: const EdgeInsets.all(20),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(children: [
              Expanded(child: Text('Resignation Request', style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w700, color: CogniTheme.ink900))),
              Container(padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
                decoration: BoxDecoration(color: statusBg, borderRadius: BorderRadius.circular(20)),
                child: Text(status.toUpperCase(), style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w800, color: statusColor))),
            ]),
            const SizedBox(height: 12),
            _statusRow('Resignation Date', reDate),
            _statusRow('Relieving Date', rlDate),
            const SizedBox(height: 8),
            Text('Reason: $reason', style: GoogleFonts.inter(fontSize: 12, color: CogniTheme.ink500, height: 1.4)),
          ]),
        ),
        const SizedBox(height: 22),
        _sectionTitle('CLEARANCE STATUS'),
        const SizedBox(height: 12),
        PremiumCard(
          padding: const EdgeInsets.all(18),
          child: Column(children: [
            _clearanceItem('IT Department', 'Equipment return & account deactivation', it),
            _timelineConnector(),
            _clearanceItem('HR Department', 'Exit interview & documentation', hr),
            _timelineConnector(),
            _clearanceItem('Finance Department', 'F&F settlement & loan clearance', finance),
          ]),
        ),
        if (_settlement != null) ...{
          const SizedBox(height: 22),
          _sectionTitle('FULL & FINAL SETTLEMENT'),
          const SizedBox(height: 12),
          _settlementCard(),
        },
      ],
    );
  }

  Widget _clearanceItem(String dept, String desc, bool cleared) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(width: 32, height: 32,
          decoration: BoxDecoration(
            color: cleared ? CogniTheme.emerald100 : CogniTheme.ink100,
            shape: BoxShape.circle,
            border: Border.all(color: cleared ? CogniTheme.emerald700 : CogniTheme.ink300, width: 2),
          ),
          child: Icon(cleared ? Icons.check_rounded : Icons.hourglass_top_rounded,
            color: cleared ? CogniTheme.emerald700 : CogniTheme.ink400, size: 16)),
        const SizedBox(width: 14),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(dept, style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w700, color: CogniTheme.ink900)),
          const SizedBox(height: 2),
          Text(desc, style: GoogleFonts.inter(fontSize: 11, color: CogniTheme.ink500)),
          Text(cleared ? '✓ Cleared' : 'Pending', style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w700, color: cleared ? CogniTheme.emerald700 : CogniTheme.amber700)),
        ])),
      ],
    );
  }

  Widget _timelineConnector() => Padding(
    padding: const EdgeInsets.only(left: 15, top: 4, bottom: 4),
    child: Container(width: 2, height: 20, color: CogniTheme.ink100),
  );

  Widget _settlementCard() {
    final gratuity  = double.tryParse(_settlement?['gratuity']?.toString() ?? '0') ?? 0;
    final leaveEnc  = double.tryParse(_settlement?['leave_encashment']?.toString() ?? '0') ?? 0;
    final deductions= double.tryParse(_settlement?['deductions']?.toString() ?? '0') ?? 0;
    final netPayable= double.tryParse(_settlement?['net_payable']?.toString() ?? '0') ?? 0;

    return PremiumCard(
      padding: const EdgeInsets.all(18),
      child: Column(
        children: [
          LabelValueRow(label: 'Gratuity Amount', value: FormatUtils.formatCurrency(gratuity), valueColor: CogniTheme.emerald700, isBoldValue: true),
          LabelValueRow(label: 'Leave Encashment', value: FormatUtils.formatCurrency(leaveEnc), valueColor: CogniTheme.brand700, isBoldValue: true),
          LabelValueRow(label: 'Deductions', value: '- ${FormatUtils.formatCurrency(deductions)}', valueColor: CogniTheme.rose700, isBoldValue: true),
          const Divider(height: 20),
          LabelValueRow(label: 'Net Payable to Employee', value: FormatUtils.formatCurrency(netPayable), valueColor: CogniTheme.ink900, isBoldValue: true),
        ],
      ),
    );
  }

  Widget _statusRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(children: [
        Text('$label: ', style: GoogleFonts.inter(fontSize: 12, color: CogniTheme.ink500)),
        Text(value, style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w700, color: CogniTheme.ink900)),
      ]),
    );
  }

  Widget _sectionTitle(String t) => Text(t, style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w800, color: CogniTheme.ink500, letterSpacing: 0.8));

  Widget _formLabel(String label) => Padding(
    padding: const EdgeInsets.only(bottom: 7),
    child: Text(label, style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w700, color: CogniTheme.ink700)),
  );
}
