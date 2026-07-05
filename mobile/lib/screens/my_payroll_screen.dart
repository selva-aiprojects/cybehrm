import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../services/api_service.dart';
import '../theme_config.dart';
import '../widgets/premium_components.dart';

class MyPayrollScreen extends StatefulWidget {
  const MyPayrollScreen({super.key});
  @override
  State<MyPayrollScreen> createState() => _MyPayrollScreenState();
}

class _MyPayrollScreenState extends State<MyPayrollScreen> {
  bool _isLoading = true;
  List<dynamic> _payslips = [];

  @override
  void initState() {
    super.initState();
    _fetchPayslips();
  }

  Future<void> _fetchPayslips() async {
    setState(() => _isLoading = true);
    try {
      final data = await context.read<ApiService>().getMyPayslips();
      if (mounted) {
        setState(() {
          _payslips = data ?? [];
          _isLoading = false;
        });
      }
    } catch (e) {
      debugPrint('Error: $e');
      if (mounted) setState(() => _isLoading = false);
    }
  }

  double get _ytdGross => _payslips.fold(0.0, (s, p) => s + (double.tryParse(p['gross_salary']?.toString() ?? '0') ?? 0));
  double get _ytdNet   => _payslips.fold(0.0, (s, p) => s + (double.tryParse(p['net_salary']?.toString() ?? '0') ?? 0));

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: CogniTheme.ink50,
      appBar: AppBar(
        title: Text('My Payroll', style: GoogleFonts.inter(fontWeight: FontWeight.w700)),
        actions: [
          IconButton(icon: const Icon(Icons.refresh_rounded), onPressed: _fetchPayslips, tooltip: 'Refresh'),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _fetchPayslips,
              color: CogniTheme.brand700,
              child: CustomScrollView(
                slivers: [
                  if (_payslips.isNotEmpty)
                    SliverToBoxAdapter(
                      child: YtdSummaryCard(
                        title: 'Year-to-Date Summary',
                        stats: [
                          YtdStatItem(label: 'Total Earnings', value: FormatUtils.formatCurrency(_ytdGross), valueColor: CogniTheme.emerald500),
                          YtdStatItem(label: 'Net Take-Home', value: FormatUtils.formatCurrency(_ytdNet), valueColor: CogniTheme.brand400),
                          YtdStatItem(label: 'Payslips', value: '${_payslips.length}', valueColor: Colors.white70),
                        ],
                      ),
                    ),
                  if (_payslips.isEmpty)
                    const SliverFillRemaining(
                      child: EmptyStateWidget(
                        icon: Icons.payments_outlined,
                        message: 'No payslip records found for this academic financial cycle.',
                      ),
                    )
                  else
                    SliverPadding(
                      padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
                      sliver: SliverList(
                        delegate: SliverChildBuilderDelegate(
                          (ctx, i) => _buildItem(_payslips[i]),
                          childCount: _payslips.length,
                        ),
                      ),
                    ),
                ],
              ),
            ),
    );
  }

  Widget _buildItem(Map<String, dynamic> p) {
    final period = FormatUtils.formatPeriod(p['created_at']);
    final isPaid = (p['status']?.toString().toLowerCase() ?? 'unpaid') == 'paid';

    return PremiumCard(
      leftBorderColor: isPaid ? CogniTheme.emerald700 : CogniTheme.amber700,
      onTap: () => _showDetailsSheet(p, period),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(period, style: GoogleFonts.inter(fontWeight: FontWeight.w700, fontSize: 15, color: CogniTheme.ink900)),
                const SizedBox(height: 6),
                Text('Gross: ${FormatUtils.formatCurrency(p['gross_salary'])}  •  Deductions: ${FormatUtils.formatCurrency(p['deductions'])}',
                    style: GoogleFonts.inter(fontSize: 12, color: CogniTheme.ink500)),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(FormatUtils.formatCurrencyDecimals(p['net_salary']),
                  style: GoogleFonts.inter(fontWeight: FontWeight.w800, fontSize: 14, color: CogniTheme.brand700)),
              const SizedBox(height: 4),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: isPaid ? CogniTheme.emerald100 : CogniTheme.amber100,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(isPaid ? 'PAID' : 'PENDING',
                    style: GoogleFonts.inter(color: isPaid ? CogniTheme.emerald700 : CogniTheme.amber700, fontSize: 8.5, fontWeight: FontWeight.w800)),
              ),
            ],
          ),
        ],
      ),
    );
  }

  void _showDetailsSheet(Map<String, dynamic> p, String period) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Payslip Details', style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.w800, color: CogniTheme.ink900)),
            Text(period, style: GoogleFonts.inter(fontSize: 13, color: CogniTheme.ink500)),
            const Divider(height: 24),
            LabelValueRow(label: 'Gross Earnings', value: FormatUtils.formatCurrencyDecimals(p['gross_salary'])),
            LabelValueRow(label: 'Total Deductions', value: '- ${FormatUtils.formatCurrencyDecimals(p['deductions'])}', valueColor: CogniTheme.rose700),
            LabelValueRow(label: 'Employer Provident Fund (PF)', value: FormatUtils.formatCurrencyDecimals(p['pf_deduction'])),
            LabelValueRow(label: 'Professional Tax (PT)', value: FormatUtils.formatCurrencyDecimals(p['pt_deduction'])),
            const Divider(height: 16),
            LabelValueRow(label: 'Net Take-Home Salary', value: FormatUtils.formatCurrencyDecimals(p['net_salary']), valueColor: CogniTheme.emerald700, isBoldValue: true),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton.icon(
                onPressed: () {
                  Navigator.pop(ctx);
                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Downloading payslip PDF...')));
                },
                icon: const Icon(Icons.file_download_rounded, size: 20),
                label: const Text('Download Official PDF'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
