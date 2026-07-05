import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../services/api_service.dart';
import '../theme_config.dart';
import '../widgets/premium_components.dart';

class MyCarLeaseScreen extends StatefulWidget {
  const MyCarLeaseScreen({super.key});
  @override
  State<MyCarLeaseScreen> createState() => _MyCarLeaseScreenState();
}

class _MyCarLeaseScreenState extends State<MyCarLeaseScreen> {
  bool _isLoading = true;
  Map<String, dynamic>? _lease;
  bool _showForm = false;

  String _leaseType = 'Lease';
  final _modelCtrl = TextEditingController();
  final _priceCtrl = TextEditingController();
  String _tenure = '48';
  bool _hasDriver = false;
  double _computedEMI = 0;
  double _cap = 0;
  bool _exceedsCap = false;

  @override
  void initState() { super.initState(); _fetchData(); }

  @override
  void dispose() { _modelCtrl.dispose(); _priceCtrl.dispose(); super.dispose(); }

  Future<void> _fetchData() async {
    setState(() => _isLoading = true);
    final api = context.read<ApiService>();
    try {
      final lease = await api.getMyVehicleLease();
      final grade = await api.getMyGradeAllowances();
      if (mounted) {
        setState(() {
          _lease = lease;
          _cap = double.tryParse(grade?['car_lease_cap']?.toString() ?? '0') ?? 0;
          if (lease == null) _showForm = true;
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _computeEMI() {
    final price = double.tryParse(_priceCtrl.text) ?? 0;
    final emi = price * 0.025;
    if (mounted) setState(() { _computedEMI = emi; _exceedsCap = _cap > 0 && emi > _cap; });
  }

  Future<void> _submitApplication() async {
    final model = _modelCtrl.text.trim();
    final price = double.tryParse(_priceCtrl.text) ?? 0;
    if (model.isEmpty || price <= 0) {
      _msg('Please enter valid model and price.', isErr: true);
      return;
    }
    if (_exceedsCap) {
      _msg('EMI exceeds your cap of ${FormatUtils.formatCurrency(_cap)}.', isErr: true);
      return;
    }
    setState(() => _isLoading = true);
    final res = await context.read<ApiService>().declareVehicleLease({
      'lease_type': _leaseType, 'car_model': model,
      'ex_showroom_price': price, 'tenure_months': int.parse(_tenure),
      'has_driver': _hasDriver,
    });
    if (!mounted) return;
    if (res != null) {
      _msg('Application submitted successfully!');
      setState(() => _showForm = false);
      _fetchData();
    } else {
      setState(() => _isLoading = false);
      _msg('Failed to submit application.', isErr: true);
    }
  }

  void _msg(String m, {bool isErr = false}) => ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(content: Text(m), backgroundColor: isErr ? CogniTheme.rose700 : CogniTheme.emerald700));

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: CogniTheme.ink50,
      appBar: AppBar(
        title: Text('Car Lease Program', style: GoogleFonts.inter(fontWeight: FontWeight.w700)),
        actions: [
          if (_lease != null && !_showForm)
            TextButton.icon(
              onPressed: () => setState(() => _showForm = true),
              icon: const Icon(Icons.add_rounded, size: 16),
              label: const Text('New Application'),
            ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _fetchData, color: CogniTheme.brand700,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (_cap > 0) _capBanner(),
                    if (_lease != null && !_showForm) _buildLeaseCard(),
                    if (_showForm) _buildApplicationForm(),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _capBanner() => Container(
    margin: const EdgeInsets.only(bottom: 16),
    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
    decoration: BoxDecoration(
      color: CogniTheme.brand100, borderRadius: BorderRadius.circular(14),
      border: Border.all(color: CogniTheme.brand700.withValues(alpha: 0.25))),
    child: Row(children: [
      const Icon(Icons.account_balance_wallet_rounded, color: CogniTheme.brand700, size: 20),
      const SizedBox(width: 12),
      Text('Your Grade EMI Cap: ', style: GoogleFonts.inter(fontSize: 13, color: CogniTheme.ink700)),
      Text(FormatUtils.formatCurrency(_cap), style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w800, color: CogniTheme.brand700)),
      Text('/mo', style: GoogleFonts.inter(fontSize: 12, color: CogniTheme.ink500)),
    ]),
  );

  Widget _buildLeaseCard() {
    final model = _lease?['car_model'] ?? 'Vehicle';
    final type = _lease?['lease_type'] ?? 'Lease';
    final tenure = _lease?['tenure_months']?.toString() ?? '--';
    final emi = double.tryParse(_lease?['monthly_emi']?.toString() ?? '0') ?? 0;
    final perk = double.tryParse(_lease?['rule3_perk_value']?.toString() ?? '0') ?? 0;
    final driver = _lease?['has_driver'] as bool? ?? false;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: double.infinity, padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFF1E3A8A), Color(0xFF312E81), Color(0xFF0F172A)],
              begin: Alignment.topLeft, end: Alignment.bottomRight),
            borderRadius: BorderRadius.circular(24), boxShadow: CogniTheme.shadowBrand),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
              Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text('ACTIVE VEHICLE LEASE', style: GoogleFonts.inter(color: Colors.white38, fontSize: 10, fontWeight: FontWeight.w700, letterSpacing: 0.8)),
                const SizedBox(height: 6),
                Text(model, style: GoogleFonts.inter(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w800), overflow: TextOverflow.ellipsis),
              ])),
              Container(padding: const EdgeInsets.all(12), decoration: BoxDecoration(color: Colors.white10, shape: BoxShape.circle),
                child: const Icon(Icons.directions_car_filled_rounded, color: Colors.white, size: 24)),
            ]),
            const SizedBox(height: 20),
            Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
              _leaseStat('Type', type),
              _leaseStat('Tenure', '$tenure Mo'),
              _leaseStat('Driver', driver ? 'Yes' : 'No'),
            ]),
          ]),
        ),
        const SizedBox(height: 16),
        Row(children: [
          Expanded(child: _statTile('Monthly EMI', FormatUtils.formatCurrency(emi), Icons.payments_rounded, CogniTheme.brand700)),
          const SizedBox(width: 12),
          Expanded(child: _statTile('Rule 3 Perk', FormatUtils.formatCurrency(perk), Icons.receipt_rounded, CogniTheme.violet700)),
        ]),
      ],
    );
  }

  Widget _leaseStat(String label, String value) => Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Text(label, style: GoogleFonts.inter(color: Colors.white38, fontSize: 10, fontWeight: FontWeight.w600)),
      const SizedBox(height: 4),
      Text(value, style: GoogleFonts.inter(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w700)),
    ],
  );

  Widget _statTile(String label, String value, IconData icon, Color color) => Container(
    padding: const EdgeInsets.all(14),
    decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16),
      boxShadow: CogniTheme.shadowSm, border: Border.all(color: CogniTheme.ink100)),
    child: Row(children: [
      Container(padding: const EdgeInsets.all(8), decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(10)),
        child: Icon(icon, color: color, size: 16)),
      const SizedBox(width: 10),
      Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(label, style: GoogleFonts.inter(fontSize: 10, color: CogniTheme.ink500, fontWeight: FontWeight.w600)),
        Text(value, style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w800, color: CogniTheme.ink900), overflow: TextOverflow.ellipsis),
      ])),
    ]),
  );

  Widget _buildApplicationForm() {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(color: CogniTheme.brand100, borderRadius: BorderRadius.circular(12), border: Border.all(color: CogniTheme.brand700.withValues(alpha: 0.15))),
        child: Row(children: [
          const Icon(Icons.info_outline_rounded, color: CogniTheme.brand700, size: 18),
          const SizedBox(width: 10),
          Expanded(child: Text('EMI is 2.5% of price & must be <= cap.', style: GoogleFonts.inter(fontSize: 12, color: CogniTheme.brand700))),
        ]),
      ),
      const SizedBox(height: 16),
      _label('Lease Type'),
      Row(children: ['Lease', 'OYT'].map((t) => Expanded(child: Padding(
        padding: EdgeInsets.only(right: t == 'Lease' ? 8 : 0),
        child: _toggleBtn(t, _leaseType == t, () => setState(() => _leaseType = t)),
      ))).toList()),
      const SizedBox(height: 12),
      _label('Car Model / Make'),
      TextField(controller: _modelCtrl, decoration: const InputDecoration(hintText: 'e.g. Maruti Brezza ZXI+')),
      const SizedBox(height: 12),
      _label('Ex-Showroom Price (₹)'),
      TextField(
        controller: _priceCtrl, keyboardType: TextInputType.number,
        decoration: const InputDecoration(prefixText: '₹ ', hintText: '1200000'),
        onChanged: (_) => _computeEMI(),
      ),
      if (_computedEMI > 0) ...[
        const SizedBox(height: 10),
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: _exceedsCap ? CogniTheme.rose100 : CogniTheme.emerald100, borderRadius: BorderRadius.circular(12),
            border: Border.all(color: _exceedsCap ? CogniTheme.rose700 : CogniTheme.emerald700)),
          child: Row(children: [
            Icon(_exceedsCap ? Icons.error_rounded : Icons.check_circle_rounded, color: _exceedsCap ? CogniTheme.rose700 : CogniTheme.emerald700, size: 16),
            const SizedBox(width: 8),
            Expanded(child: Text('Calculated EMI: ${FormatUtils.formatCurrency(_computedEMI)}/mo — ${_exceedsCap ? "EXCEEDS CAP" : "Within cap"}',
              style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600, color: _exceedsCap ? CogniTheme.rose700 : CogniTheme.emerald700))),
          ]),
        ),
      ],
      const SizedBox(height: 12),
      _label('Lease Tenure'),
      DropdownButtonFormField<String>(
        initialValue: _tenure,
        items: const [
          DropdownMenuItem(value: '36', child: Text('36 Months (3 Years)')),
          DropdownMenuItem(value: '48', child: Text('48 Months (4 Years)')),
          DropdownMenuItem(value: '60', child: Text('60 Months (5 Years)')),
        ],
        onChanged: (v) { if (v != null) setState(() => _tenure = v); },
      ),
      const SizedBox(height: 12),
      Container(
        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: CogniTheme.ink100)),
        child: SwitchListTile(
          title: Text('Include Company Driver', style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w600, color: CogniTheme.ink900)),
          subtitle: Text('Subject to policy eligibility', style: GoogleFonts.inter(fontSize: 11, color: CogniTheme.ink500)),
          value: _hasDriver, onChanged: (v) => setState(() => _hasDriver = v), activeThumbColor: CogniTheme.brand700,
        ),
      ),
      const SizedBox(height: 24),
      Row(children: [
        if (_lease != null) ...[
          Expanded(child: OutlinedButton(onPressed: () => setState(() => _showForm = false), child: const Text('Cancel'))),
          const SizedBox(width: 12),
        ],
        Expanded(flex: 2, child: ElevatedButton.icon(
          onPressed: _exceedsCap ? null : _submitApplication,
          icon: const Icon(Icons.directions_car_filled_rounded),
          label: const Text('Submit Application'),
        )),
      ]),
    ]);
  }

  Widget _label(String t) => Padding(
    padding: const EdgeInsets.only(bottom: 6),
    child: Text(t, style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w700, color: CogniTheme.ink700)),
  );

  Widget _toggleBtn(String label, bool active, VoidCallback onTap) => GestureDetector(
    onTap: onTap,
    child: AnimatedContainer(
      duration: const Duration(milliseconds: 150), padding: const EdgeInsets.symmetric(vertical: 10),
      decoration: BoxDecoration(
        color: active ? CogniTheme.brand700 : Colors.white, borderRadius: BorderRadius.circular(12),
        border: Border.all(color: active ? CogniTheme.brand700 : CogniTheme.ink100)),
      alignment: Alignment.center,
      child: Text(label, style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w700, color: active ? Colors.white : CogniTheme.ink500)),
    ),
  );
}
