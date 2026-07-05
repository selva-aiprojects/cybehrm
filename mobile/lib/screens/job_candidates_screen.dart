import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../services/api_service.dart';
import '../theme_config.dart';
import '../widgets/premium_components.dart';

class JobCandidatesScreen extends StatefulWidget {
  final Map<String, dynamic> jobPosting;

  const JobCandidatesScreen({super.key, required this.jobPosting});

  @override
  State<JobCandidatesScreen> createState() => _JobCandidatesScreenState();
}

class _JobCandidatesScreenState extends State<JobCandidatesScreen> {
  bool _isLoading = true;
  List<dynamic> _candidates = [];

  @override
  void initState() {
    super.initState();
    _fetchCandidates();
  }

  Future<void> _fetchCandidates() async {
    setState(() => _isLoading = true);
    try {
      final data = await context.read<ApiService>().getCandidates();
      if (mounted) {
        final positionId = widget.jobPosting['position_id']?.toString();
        setState(() {
          _candidates = (data ?? [])
              .where((c) => c['position_id']?.toString() == positionId)
              .toList();
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _issueCallLetter(String candidateId) async {
    final picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now().add(const Duration(days: 2)),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 90)),
    );
    if (picked == null || !mounted) return;

    final dateStr = DateFormat('yyyy-MM-dd').format(picked);
    setState(() => _isLoading = true);
    final res = await context.read<ApiService>().sendCallLetter(candidateId, dateStr);
    if (mounted) {
      if (res != null) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Call letter sent successfully!'), backgroundColor: CogniTheme.emerald700));
        _fetchCandidates();
      } else {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Failed to send call letter.'), backgroundColor: CogniTheme.rose700));
      }
    }
  }

  Future<void> _updateStatus(String candidateId, bool approve) async {
    setState(() => _isLoading = true);
    final api = context.read<ApiService>();
    final res = approve ? await api.selectCandidate(candidateId) : await api.rejectCandidate(candidateId);
    if (mounted) {
      if (res != null) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
            content: Text(approve ? 'Candidate selection approved!' : 'Candidate archived.'),
            backgroundColor: approve ? CogniTheme.emerald700 : CogniTheme.amber700));
        _fetchCandidates();
      } else {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Failed to update candidate state.'), backgroundColor: CogniTheme.rose700));
      }
    }
  }

  void _showAddCandidateSheet() {
    final formKey = GlobalKey<FormState>();
    final firstCtrl = TextEditingController();
    final lastCtrl = TextEditingController();
    final emailCtrl = TextEditingController();
    final phoneCtrl = TextEditingController();
    bool isSaving = false;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setSheetState) => Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          ),
          padding: EdgeInsets.fromLTRB(20, 20, 20, MediaQuery.of(ctx).viewInsets.bottom + 24),
          child: Form(
            key: formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Catalog Applicant Screening', style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.bold, color: CogniTheme.ink900)),
                    IconButton(icon: const Icon(Icons.close_rounded), onPressed: () => Navigator.pop(ctx)),
                  ],
                ),
                const Divider(),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: TextFormField(
                        controller: firstCtrl,
                        decoration: const InputDecoration(labelText: 'First Name *'),
                        validator: (v) => v == null || v.trim().isEmpty ? 'Required' : null,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: TextFormField(
                        controller: lastCtrl,
                        decoration: const InputDecoration(labelText: 'Last Name *'),
                        validator: (v) => v == null || v.trim().isEmpty ? 'Required' : null,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: emailCtrl,
                  decoration: const InputDecoration(labelText: 'Email Address *'),
                  keyboardType: TextInputType.emailAddress,
                  validator: (v) => v == null || v.trim().isEmpty ? 'Required' : null,
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: phoneCtrl,
                  decoration: const InputDecoration(labelText: 'Phone Number *'),
                  keyboardType: TextInputType.phone,
                  validator: (v) => v == null || v.trim().isEmpty ? 'Required' : null,
                ),
                const SizedBox(height: 20),
                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: ElevatedButton(
                    onPressed: isSaving ? null : () async {
                      if (formKey.currentState?.validate() ?? false) {
                        setSheetState(() => isSaving = true);
                        final res = await ctx.read<ApiService>().createCandidate({
                          'position_id': widget.jobPosting['position_id']?.toString(),
                          'first_name': firstCtrl.text.trim(),
                          'last_name': lastCtrl.text.trim(),
                          'email': emailCtrl.text.trim(),
                          'phone': phoneCtrl.text.trim(),
                          'skills': '',
                        });
                        if (ctx.mounted) {
                          setSheetState(() => isSaving = false);
                          if (res != null) {
                            Navigator.pop(ctx);
                            ScaffoldMessenger.of(ctx).showSnackBar(const SnackBar(content: Text('Candidate logged successfully!'), backgroundColor: CogniTheme.emerald700));
                            _fetchCandidates();
                          } else {
                            ScaffoldMessenger.of(ctx).showSnackBar(const SnackBar(content: Text('Failed to log candidate.'), backgroundColor: CogniTheme.rose700));
                          }
                        }
                      }
                    },
                    child: isSaving
                        ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                        : const Text('Log Screening Candidate'),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final jobTitle = widget.jobPosting['title'] ?? 'Job Opening';
    return Scaffold(
      backgroundColor: CogniTheme.ink50,
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Candidates Pipeline', style: GoogleFonts.inter(fontWeight: FontWeight.w700, fontSize: 18)),
            Text(jobTitle, style: GoogleFonts.inter(fontSize: 12, color: Colors.white70)),
          ],
        ),
        actions: [
          IconButton(icon: const Icon(Icons.refresh_rounded), onPressed: _fetchCandidates, tooltip: 'Refresh'),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _fetchCandidates,
              color: CogniTheme.brand700,
              child: _candidates.isEmpty
                  ? const EmptyStateWidget(icon: Icons.people_outline_rounded, message: 'No candidate applications screens cataloged for this opening.')
                  : ListView.builder(
                      padding: const EdgeInsets.fromLTRB(16, 16, 16, 80),
                      itemCount: _candidates.length,
                      itemBuilder: (ctx, i) {
                        final c = _candidates[i];
                        final name = '${c['first_name'] ?? ''} ${c['last_name'] ?? ''}';
                        final email = c['email'] ?? '--';
                        final phone = c['phone'] ?? '--';
                        final status = (c['status'] ?? 'applied').toString().toLowerCase();
                        final isAppliedOrSelected = status == 'applied' || status == 'selected';

                        Color badgeColor = status == 'selected'
                            ? CogniTheme.emerald700
                            : (status == 'rejected' ? CogniTheme.rose700 : (status == 'onboarded' ? CogniTheme.brand700 : CogniTheme.amber700));
                        Color badgeBg = status == 'selected'
                            ? CogniTheme.emerald100
                            : (status == 'rejected' ? CogniTheme.rose100 : (status == 'onboarded' ? CogniTheme.brand100 : CogniTheme.amber100));

                        return PremiumCard(
                          leftBorderColor: badgeColor,
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(name, style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.bold, color: CogniTheme.ink900)),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                    decoration: BoxDecoration(color: badgeBg, borderRadius: BorderRadius.circular(8)),
                                    child: Text(status.toUpperCase(), style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.bold, color: badgeColor)),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 6),
                              Text('Email: $email | Phone: $phone', style: GoogleFonts.inter(fontSize: 12, color: CogniTheme.ink500)),
                              const SizedBox(height: 12),
                              Row(
                                children: [
                                  if (isAppliedOrSelected)
                                    Expanded(
                                      child: OutlinedButton.icon(
                                        onPressed: () => _issueCallLetter(c['id']),
                                        icon: const Icon(Icons.mail_outline_rounded, size: 14),
                                        label: const Text('Call Letter', style: TextStyle(fontSize: 11)),
                                        style: OutlinedButton.styleFrom(padding: EdgeInsets.zero),
                                      ),
                                    ),
                                  if (isAppliedOrSelected) const SizedBox(width: 8),
                                  if (status != 'selected' && status != 'rejected' && status != 'onboarded') ...[
                                    Expanded(
                                      child: ElevatedButton.icon(
                                        onPressed: () => _updateStatus(c['id'], true),
                                        icon: const Icon(Icons.check_circle_outline_rounded, size: 14),
                                        label: const Text('Approve', style: TextStyle(fontSize: 11)),
                                        style: ElevatedButton.styleFrom(backgroundColor: CogniTheme.emerald700, foregroundColor: Colors.white, padding: EdgeInsets.zero),
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    Expanded(
                                      child: ElevatedButton.icon(
                                        onPressed: () => _updateStatus(c['id'], false),
                                        icon: const Icon(Icons.archive_outlined, size: 14),
                                        label: const Text('Archive', style: TextStyle(fontSize: 11)),
                                        style: ElevatedButton.styleFrom(backgroundColor: CogniTheme.rose700, foregroundColor: Colors.white, padding: EdgeInsets.zero),
                                      ),
                                    ),
                                  ],
                                ],
                              ),
                            ],
                          ),
                        );
                      },
                    ),
            ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _showAddCandidateSheet,
        backgroundColor: CogniTheme.brand700,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.person_add_alt_1_rounded),
        label: const Text('Log Applicant'),
      ),
    );
  }
}
