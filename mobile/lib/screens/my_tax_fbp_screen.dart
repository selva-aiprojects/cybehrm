import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../services/api_service.dart';
import '../theme_config.dart';
import '../widgets/premium_components.dart';

class MyTaxFbpScreen extends StatefulWidget {
  const MyTaxFbpScreen({super.key});
  @override
  State<MyTaxFbpScreen> createState() => _MyTaxFbpScreenState();
}

class _MyTaxFbpScreenState extends State<MyTaxFbpScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  bool _isLoading = true;

  // FBP
  Map<String, dynamic>? _gradeAllowances;
  final _fuelCtrl = TextEditingController(text: '0');
  final _ltaCtrl = TextEditingController(text: '0');
  final _phoneCtrl = TextEditingController(text: '0');
  final _foodCtrl = TextEditingController(text: '0');

  // Tax
  List<dynamic> _taxDeclarations = [];
  String _selYear = '2025-2026';
  String _selRegime = 'new';
  final _controller80c = TextEditingController(text: '0');
  final _controller80d = TextEditingController(text: '0');
  final _rentCtrl = TextEditingController(text: '0');
  final _landlordPanCtrl = TextEditingController();
  final _landlordNameCtrl = TextEditingController();
  final _evidenceCtrl = TextEditingController();
  bool _showLandlord = false;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _fetchData();
    _rentCtrl.addListener(() {
      final r = double.tryParse(_rentCtrl.text) ?? 0;
      if (mounted) setState(() => _showLandlord = r > 100000);
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    _fuelCtrl.dispose(); _ltaCtrl.dispose(); _phoneCtrl.dispose(); _foodCtrl.dispose();
    _controller80c.dispose(); _controller80d.dispose();
    _rentCtrl.dispose(); _landlordPanCtrl.dispose(); _landlordNameCtrl.dispose(); _evidenceCtrl.dispose();
    super.dispose();
  }

  Future<void> _fetchData() async {
    setState(() => _isLoading = true);
    final api = context.read<ApiService>();
    try {
      final allowances = await api.getMyGradeAllowances();
      final fbp = await api.getMyFBPDeclaration();
      final declarations = await api.getMyTaxDeclarations();
      if (mounted) {
        setState(() {
          _gradeAllowances = allowances;
          _taxDeclarations = declarations ?? [];
          if (fbp != null) {
            _fuelCtrl.text = (double.tryParse(fbp['fuel_amount'].toString()) ?? 0).toStringAsFixed(0);
            _ltaCtrl.text = (double.tryParse(fbp['lta_amount'].toString()) ?? 0).toStringAsFixed(0);
            _phoneCtrl.text = (double.tryParse(fbp['phone_amount'].toString()) ?? 0).toStringAsFixed(0);
            _foodCtrl.text = (double.tryParse(fbp['food_amount'].toString()) ?? 0).toStringAsFixed(0);
          }
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _submitFBP() async {
    final api = context.read<ApiService>();
    final fuel = double.tryParse(_fuelCtrl.text) ?? 0;
    final lta = double.tryParse(_ltaCtrl.text) ?? 0;
    final phone = double.tryParse(_phoneCtrl.text) ?? 0;
    final food = double.tryParse(_foodCtrl.text) ?? 0;

    if (_gradeAllowances != null) {
      if (fuel > (double.tryParse(_gradeAllowances!['fuel_cap']?.toString() ?? '0') ?? 0)) { _msg('Fuel exceeds cap.', isErr: true); return; }
      if (lta > (double.tryParse(_gradeAllowances!['lta_cap']?.toString() ?? '0') ?? 0)) { _msg('LTA exceeds cap.', isErr: true); return; }
      if (phone > (double.tryParse(_gradeAllowances!['phone_cap']?.toString() ?? '0') ?? 0)) { _msg('Phone exceeds cap.', isErr: true); return; }
      if (food > (double.tryParse(_gradeAllowances!['food_cap']?.toString() ?? '0') ?? 0)) { _msg('Food exceeds cap.', isErr: true); return; }
    }

    setState(() => _isLoading = true);
    final res = await api.submitFBPDeclaration({'fuel_amount': fuel, 'lta_amount': lta, 'phone_amount': phone, 'food_amount': food});
    if (!mounted) return;
    if (res != null) { _msg('FBP restructuring saved!'); _fetchData(); }
    else { setState(() => _isLoading = false); _msg('Failed to save FBP.', isErr: true); }
  }

  Future<void> _submitTax() async {
    final api = context.read<ApiService>();
    final s80c = double.tryParse(_controller80c.text) ?? 0;
    final s80d = double.tryParse(_controller80d.text) ?? 0;
    final rent = double.tryParse(_rentCtrl.text) ?? 0;
    final pan = _landlordPanCtrl.text.trim();
    final lname = _landlordNameCtrl.text.trim();
    final evidence = _evidenceCtrl.text.trim();

    if (_selRegime == 'old' && rent > 100000) {
      if (pan.length != 10) { _msg('Valid 10-char landlord PAN required.', isErr: true); return; }
      if (lname.isEmpty) { _msg('Landlord name required.', isErr: true); return; }
    }

    setState(() => _isLoading = true);
    final res = await api.declareTaxes({
      'financial_year': _selYear,
      'regime': _selRegime,
      'section_80c': _selRegime == 'old' ? s80c : 0.0,
      'section_80d': _selRegime == 'old' ? s80d : 0.0,
      'hra_rent_paid': _selRegime == 'old' ? rent : 0.0,
      'landlord_pan': _selRegime == 'old' && rent > 100000 ? pan : null,
      'landlord_name': _selRegime == 'old' && rent > 100000 ? lname : null,
      'evidence_url': evidence.isNotEmpty ? evidence : null,
    });
    if (!mounted) return;
    if (res != null) {
      Navigator.of(context).pop();
      _msg('Tax declaration filed!');
      _fetchData();
    } else {
      setState(() => _isLoading = false);
      _msg('Failed to submit tax declaration.', isErr: true);
    }
  }

  void _msg(String m, {bool isErr = false}) => ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(content: Text(m), backgroundColor: isErr ? CogniTheme.rose700 : CogniTheme.emerald700));

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: CogniTheme.ink50,
      appBar: AppBar(
        title: Text('Taxation & FBP', style: GoogleFonts.inter(fontWeight: FontWeight.w700)),
        bottom: TabBar(controller: _tabController, tabs: const [Tab(text: 'FBP Restructure'), Tab(text: 'Tax Declarations')]),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : TabBarView(controller: _tabController, children: [_buildFBPTab(), _buildTaxTab()]),
    );
  }

  Widget _buildFBPTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          if (_gradeAllowances != null)
            PremiumCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Your Grade Caps (${_gradeAllowances!['grade']})', style: GoogleFonts.inter(fontWeight: FontWeight.bold, fontSize: 14)),
                  const Divider(height: 16),
                  LabelValueRow(label: 'Fuel Allowance Cap', value: FormatUtils.formatCurrency(_gradeAllowances!['fuel_cap'])),
                  LabelValueRow(label: 'LTA Cap', value: FormatUtils.formatCurrency(_gradeAllowances!['lta_cap'])),
                  LabelValueRow(label: 'Phone Cap', value: FormatUtils.formatCurrency(_gradeAllowances!['phone_cap'])),
                  LabelValueRow(label: 'Food Cap', value: FormatUtils.formatCurrency(_gradeAllowances!['food_cap'])),
                ],
              ),
            ),
          const SizedBox(height: 16),
          Text('Configure Your Monthly Declaration', style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          _inputCard('Fuel Amount', _fuelCtrl),
          _inputCard('LTA Amount', _ltaCtrl),
          _inputCard('Phone Amount', _phoneCtrl),
          _inputCard('Food Amount', _foodCtrl),
          const SizedBox(height: 24),
          ElevatedButton(onPressed: _submitFBP, child: const Text('Save Structure Selection')),
        ],
      ),
    );
  }

  Widget _inputCard(String label, TextEditingController ctrl) => PremiumCard(
    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
    child: Row(children: [
      Expanded(child: Text(label, style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w600))),
      SizedBox(
        width: 120,
        child: TextField(
          controller: ctrl, keyboardType: TextInputType.number, textAlign: TextAlign.right,
          decoration: const InputDecoration(border: InputBorder.none, prefixText: '₹ ', filled: false),
          style: GoogleFonts.robotoMono(fontSize: 14, fontWeight: FontWeight.bold),
        ),
      )
    ]),
  );

  Widget _buildTaxTab() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('Historical Declarations', style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.bold)),
            OutlinedButton.icon(
              onPressed: _showNewDeclarationDialog, icon: const Icon(Icons.add, size: 16), label: const Text('New Declaration'),
              style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6)),
            ),
          ],
        ),
        const SizedBox(height: 12),
        if (_taxDeclarations.isEmpty)
          const EmptyStateWidget(icon: Icons.receipt_long_outlined, message: 'No tax declarations submitted yet.')
        else
          ..._taxDeclarations.map((d) {
            final isAppr = d['status']?.toString().toLowerCase() == 'approved';
            return PremiumCard(
              leftBorderColor: isAppr ? CogniTheme.emerald700 : CogniTheme.amber700,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('FY ${d['financial_year']}', style: GoogleFonts.inter(fontWeight: FontWeight.bold, fontSize: 14)),
                      Text((d['status'] ?? 'pending').toString().toUpperCase(),
                          style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.bold, color: isAppr ? CogniTheme.emerald700 : CogniTheme.amber700)),
                    ],
                  ),
                  const Divider(height: 16),
                  LabelValueRow(label: 'Regime', value: d['regime'].toString().toUpperCase()),
                  LabelValueRow(label: '80C Investment', value: FormatUtils.formatCurrency(d['section_80c'])),
                  LabelValueRow(label: '80D (Medical)', value: FormatUtils.formatCurrency(d['section_80d'])),
                  LabelValueRow(label: 'HRA Rent Paid', value: FormatUtils.formatCurrency(d['hra_rent_paid'])),
                ],
              ),
            );
          }),
      ],
    );
  }

  void _showNewDeclarationDialog() {
    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (c, setS) => AlertDialog(
          title: const Text('File Tax Declaration'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                DropdownButtonFormField<String>(
                  initialValue: _selYear,
                  items: const [DropdownMenuItem(value: '2025-2026', child: Text('FY 2025-2026'))],
                  onChanged: (v) => setS(() => _selYear = v!),
                  decoration: const InputDecoration(labelText: 'Financial Year'),
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  initialValue: _selRegime,
                  items: const [DropdownMenuItem(value: 'new', child: Text('New Tax Regime')), DropdownMenuItem(value: 'old', child: Text('Old Tax Regime'))],
                  onChanged: (v) => setS(() => _selRegime = v!),
                  decoration: const InputDecoration(labelText: 'Tax Regime'),
                ),
                if (_selRegime == 'old') ...[
                  const SizedBox(height: 12),
                  TextField(controller: _controller80c, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Section 80C')),
                  const SizedBox(height: 12),
                  TextField(controller: _controller80d, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Section 80D')),
                  const SizedBox(height: 12),
                  TextField(controller: _rentCtrl, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Rent Paid Annually')),
                  if (_showLandlord) ...[
                    const SizedBox(height: 12),
                    TextField(controller: _landlordPanCtrl, decoration: const InputDecoration(labelText: 'Landlord PAN (10 chars)')),
                    const SizedBox(height: 12),
                    TextField(controller: _landlordNameCtrl, decoration: const InputDecoration(labelText: 'Landlord Name')),
                  ],
                  const SizedBox(height: 12),
                  TextField(controller: _evidenceCtrl, decoration: const InputDecoration(labelText: 'Evidence URL')),
                ],
              ],
            ),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
            ElevatedButton(onPressed: _submitTax, child: const Text('Submit')),
          ],
        ),
      ),
    );
  }
}
