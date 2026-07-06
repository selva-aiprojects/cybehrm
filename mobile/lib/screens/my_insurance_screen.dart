import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../services/api_service.dart';
import '../theme_config.dart';
import '../widgets/premium_components.dart';

class MyInsuranceScreen extends StatefulWidget {
  const MyInsuranceScreen({super.key});
  @override
  State<MyInsuranceScreen> createState() => _MyInsuranceScreenState();
}

class _MyInsuranceScreenState extends State<MyInsuranceScreen> {
  bool _isLoading = true;
  Map<String, dynamic>? _enrollment;
  bool _isEditing = false;

  String _tier = 'base';
  bool _hasSpouse = false;
  bool _hasParents = false;
  int _childrenCount = 0;
  final _topUpCtrl = TextEditingController(text: '0');
  double _estimatedSurcharge = 0.0;

  @override
  void initState() {
    super.initState();
    _fetchEnrollment();
    _topUpCtrl.addListener(_updateEstimate);
  }

  @override
  void dispose() { _topUpCtrl.dispose(); super.dispose(); }

  Future<void> _fetchEnrollment() async {
    setState(() => _isLoading = true);
    try {
      final data = await context.read<ApiService>().getMyInsurance();
      if (mounted) {
        setState(() {
          _enrollment = data;
          if (data != null) {
            _tier          = data['tier'] ?? 'base';
            _hasSpouse     = data['has_spouse'] ?? false;
            _hasParents    = data['has_parents'] ?? false;
            _childrenCount = data['children_count'] ?? 0;
            _topUpCtrl.text = (double.tryParse(data['top_up_sum_insured']?.toString() ?? '0') ?? 0).toStringAsFixed(0);
          } else {
            _isEditing = true;
          }
          _updateEstimate();
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() { _isEditing = true; _isLoading = false; });
    }
  }

  void _updateEstimate() {
    double base = _tier == 'silver' ? 500 : _tier == 'gold' ? 1200 : 0;
    final topUp = (double.tryParse(_topUpCtrl.text) ?? 0) * 0.005 / 12;
    if (mounted) {
      setState(() {
        _estimatedSurcharge = base + (_hasSpouse ? 300 : 0) + (_hasParents ? 800 : 0) + (_childrenCount * 200) + topUp;
      });
    }
  }

  Future<void> _submit() async {
    final api   = context.read<ApiService>();
    final topUp = double.tryParse(_topUpCtrl.text) ?? 0;
    setState(() => _isLoading = true);
    final res = await api.enrollInsurance({'tier': _tier, 'has_spouse': _hasSpouse, 'has_parents': _hasParents, 'children_count': _childrenCount, 'top_up_sum_insured': topUp});
    if (!mounted) return;
    if (res != null) {
      _snack(_enrollment == null ? 'Enrolled successfully!' : 'Policy updated!', CogniTheme.emerald700);
      setState(() => _isEditing = false);
      _fetchEnrollment();
    } else {
      setState(() => _isLoading = false);
      _snack('Enrollment failed.', CogniTheme.rose700);
    }
  }

  void _snack(String msg, Color color) => ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg), backgroundColor: color));

  @override
  Widget build(BuildContext context) {
    final email = context.watch<ApiService>().currentUser?.email ?? '';
    return Scaffold(
      backgroundColor: CogniTheme.ink50,
      appBar: AppBar(
        title: Text('Health Insurance', style: GoogleFonts.inter(fontWeight: FontWeight.w700)),
        actions: [
          if (_enrollment != null && !_isEditing)
            TextButton.icon(
              onPressed: () => setState(() => _isEditing = true),
              icon: const Icon(Icons.edit_rounded, size: 16),
              label: const Text('Edit'),
            ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
              child: _isEditing ? _buildForm() : _buildCard(email),
            ),
    );
  }

  Widget _buildCard(String email) {
    final tier      = (_enrollment?['tier'] ?? 'base').toString();
    final cardNo    = _enrollment?['health_card_number'] ?? 'CH-000000';
    final surcharge = double.tryParse(_enrollment?['monthly_surcharge']?.toString() ?? '0') ?? 0;
    final topUp     = double.tryParse(_enrollment?['top_up_sum_insured']?.toString() ?? '0') ?? 0;
    final baseCover = tier == 'gold' ? 700000.0 : tier == 'silver' ? 500000.0 : 300000.0;
    final totalCov  = baseCover + topUp;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(26),
          decoration: BoxDecoration(
            gradient: const LinearGradient(colors: [Color(0xFF0D9488), Color(0xFF0F766E), Color(0xFF134E4A)], begin: Alignment.topLeft, end: Alignment.bottomRight),
            borderRadius: BorderRadius.circular(26),
            boxShadow: [BoxShadow(color: const Color(0xFF0D9488).withValues(alpha: 0.35), blurRadius: 28, offset: const Offset(0, 10))],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text('Group Health Policy', style: GoogleFonts.inter(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.w600)),
                    Text('CYBESURE GHI', style: GoogleFonts.inter(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w900)),
                  ]),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                    decoration: BoxDecoration(color: Colors.white24, borderRadius: BorderRadius.circular(10)),
                    child: Text(tier.toUpperCase(), style: GoogleFonts.inter(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                  )
                ],
              ),
              const SizedBox(height: 38),
              Text(cardNo, style: GoogleFonts.robotoMono(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w700, letterSpacing: 1.5)),
              const SizedBox(height: 20),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text('POLICY HOLDER', style: GoogleFonts.inter(color: Colors.white54, fontSize: 10)),
                    Text(email.split('@')[0].toUpperCase(), style: GoogleFonts.inter(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
                  ]),
                  Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
                    Text('SUM INSURED', style: GoogleFonts.inter(color: Colors.white54, fontSize: 10)),
                    Text(FormatUtils.formatCurrency(totalCov), style: GoogleFonts.inter(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w800)),
                  ])
                ],
              )
            ],
          ),
        ),
        const SizedBox(height: 28),
        Text('Policy Breakdown & Coverage', style: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.bold)),
        const SizedBox(height: 12),
        PremiumCard(
          child: Column(
            children: [
              LabelValueRow(label: 'Base Coverage', value: FormatUtils.formatCurrency(baseCover)),
              LabelValueRow(label: 'Top-Up sum selected', value: FormatUtils.formatCurrency(topUp)),
              LabelValueRow(label: 'Total Coverage', value: FormatUtils.formatCurrency(totalCov), valueColor: const Color(0xFF0D9488), isBoldValue: true),
              const Divider(height: 16),
              LabelValueRow(label: 'Monthly Salary Surcharge', value: FormatUtils.formatCurrencyDecimals(surcharge), valueColor: CogniTheme.rose700, isBoldValue: true),
            ],
          ),
        )
      ],
    );
  }

  Widget _buildForm() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        PremiumCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Step 1: Choose Coverage Tier', style: GoogleFonts.inter(fontWeight: FontWeight.bold, fontSize: 14)),
              DropdownButtonFormField<String>(
                initialValue: _tier,
                items: const [
                  DropdownMenuItem(value: 'base', child: Text('Base Cover (3 Lacs) - ₹0/mo')),
                  DropdownMenuItem(value: 'silver', child: Text('Silver Cover (5 Lacs) - ₹500/mo')),
                  DropdownMenuItem(value: 'gold', child: Text('Gold Cover (7 Lacs) - ₹1200/mo')),
                ],
                onChanged: (v) => setState(() { _tier = v!; _updateEstimate(); }),
                decoration: const InputDecoration(filled: false),
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        PremiumCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Step 2: Add Dependents', style: GoogleFonts.inter(fontWeight: FontWeight.bold, fontSize: 14)),
              SwitchListTile(title: const Text('Add Spouse (+₹300/mo)'), value: _hasSpouse, onChanged: (v) => setState(() { _hasSpouse = v; _updateEstimate(); })),
              SwitchListTile(title: const Text('Add Parents (+₹800/mo)'), value: _hasParents, onChanged: (v) => setState(() { _hasParents = v; _updateEstimate(); })),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Number of Children (+₹200/mo each)'),
                  Row(
                    children: [
                      IconButton(icon: const Icon(Icons.remove), onPressed: _childrenCount > 0 ? () => setState(() { _childrenCount--; _updateEstimate(); }) : null),
                      Text('$_childrenCount', style: const TextStyle(fontWeight: FontWeight.bold)),
                      IconButton(icon: const Icon(Icons.add), onPressed: () => setState(() { _childrenCount++; _updateEstimate(); })),
                    ],
                  )
                ],
              )
            ],
          ),
        ),
        const SizedBox(height: 12),
        PremiumCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Step 3: Optional Voluntary Top-Up', style: GoogleFonts.inter(fontWeight: FontWeight.bold, fontSize: 14)),
              TextField(controller: _topUpCtrl, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Top-Up Sum Insured', prefixText: '₹ ', filled: false)),
              const SizedBox(height: 4),
              const Text('Top-Up cost is calculated dynamically at 0.5% annualized cost divided monthly.', style: TextStyle(fontSize: 11, color: Colors.grey)),
            ],
          ),
        ),
        const SizedBox(height: 20),
        PremiumCard(
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Estimated Monthly Surcharge', style: TextStyle(fontWeight: FontWeight.bold)),
              Text(FormatUtils.formatCurrencyDecimals(_estimatedSurcharge), style: TextStyle(color: CogniTheme.rose700, fontWeight: FontWeight.w900, fontSize: 16)),
            ],
          ),
        ),
        const SizedBox(height: 24),
        ElevatedButton(onPressed: _submit, child: Text(_enrollment == null ? 'Complete Enrollment' : 'Update Policy Coverage')),
        if (_enrollment != null) ...[
          const SizedBox(height: 12),
          TextButton(onPressed: () => setState(() => _isEditing = false), child: const Text('Cancel')),
        ]
      ],
    );
  }
}
