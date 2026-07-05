import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../services/api_service.dart';
import '../theme_config.dart';
import '../widgets/premium_components.dart';

class TalentDatabaseScreen extends StatefulWidget {
  const TalentDatabaseScreen({super.key});
  @override
  State<TalentDatabaseScreen> createState() => _TalentDatabaseScreenState();
}

class _TalentDatabaseScreenState extends State<TalentDatabaseScreen> {
  bool _isLoading = true;
  List<dynamic> _profiles = [];

  @override
  void initState() {
    super.initState();
    _fetchProfiles();
  }

  Future<void> _fetchProfiles() async {
    setState(() => _isLoading = true);
    try {
      final data = await context.read<ApiService>().getTalentProfiles();
      if (mounted) {
        setState(() {
          _profiles = data ?? [];
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _showAddProfileSheet() {
    final formKey = GlobalKey<FormState>();
    final firstCtrl = TextEditingController();
    final lastCtrl = TextEditingController();
    final emailCtrl = TextEditingController();
    final phoneCtrl = TextEditingController();
    final urlCtrl = TextEditingController();
    final skillsCtrl = TextEditingController();
    final summaryCtrl = TextEditingController();
    final refDetailCtrl = TextEditingController();
    String? selectedRefType = 'none';
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
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Ingest Resume Profile', style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.bold, color: CogniTheme.ink900)),
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
                          decoration: const InputDecoration(labelText: 'First Name *', hintText: 'e.g. Sreya'),
                          validator: (v) => v == null || v.trim().isEmpty ? 'Required' : null,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: TextFormField(
                          controller: lastCtrl,
                          decoration: const InputDecoration(labelText: 'Last Name *', hintText: 'e.g. Sengupta'),
                          validator: (v) => v == null || v.trim().isEmpty ? 'Required' : null,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: emailCtrl,
                    decoration: const InputDecoration(labelText: 'Email Address *', hintText: 'sreya@example.com'),
                    keyboardType: TextInputType.emailAddress,
                    validator: (v) => v == null || v.trim().isEmpty ? 'Required' : null,
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: phoneCtrl,
                    decoration: const InputDecoration(labelText: 'Phone Number *', hintText: '+91 98765 43210'),
                    keyboardType: TextInputType.phone,
                    validator: (v) => v == null || v.trim().isEmpty ? 'Required' : null,
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: urlCtrl,
                    decoration: const InputDecoration(labelText: 'Resume URL', hintText: 'https://drive.google.com/...'),
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: skillsCtrl,
                    decoration: const InputDecoration(labelText: 'Skills (comma-separated)', hintText: 'Python, SQL, Django'),
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: summaryCtrl,
                    decoration: const InputDecoration(labelText: 'Experience Summary', hintText: '5 years developer experience...'),
                    maxLines: 2,
                  ),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<String>(
                    initialValue: selectedRefType,
                    decoration: const InputDecoration(labelText: 'Reference Source'),
                    items: const [
                      DropdownMenuItem(value: 'none', child: Text('No Reference (Direct)')),
                      DropdownMenuItem(value: 'advertisement', child: Text('Advertisement / Ref')),
                      DropdownMenuItem(value: 'social_media', child: Text('Social Media')),
                      DropdownMenuItem(value: 'internal_reference', child: Text('Internal Reference')),
                    ],
                    onChanged: (val) {
                      setSheetState(() {
                        selectedRefType = val;
                      });
                    },
                  ),
                  if (selectedRefType != 'none') ...[
                    const SizedBox(height: 12),
                    TextFormField(
                      controller: refDetailCtrl,
                      decoration: InputDecoration(
                        labelText: selectedRefType == 'advertisement'
                            ? 'Advertisement Details *'
                            : (selectedRefType == 'social_media'
                                ? 'Social Media Platform / Handle *'
                                : 'Referring Employee Name *'),
                        hintText: selectedRefType == 'advertisement'
                            ? 'e.g. Newspaper, LinkedIn Ads'
                            : (selectedRefType == 'social_media'
                                ? 'e.g. LinkedIn profile link / handle'
                                : 'e.g. Jane Smith (EMP-1002)'),
                      ),
                      validator: (v) => v == null || v.trim().isEmpty ? 'Required' : null,
                    ),
                  ],
                  const SizedBox(height: 20),
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: ElevatedButton(
                      onPressed: isSaving ? null : () async {
                        if (formKey.currentState?.validate() ?? false) {
                          setSheetState(() => isSaving = true);
                          final res = await ctx.read<ApiService>().createTalentProfile({
                            'first_name': firstCtrl.text.trim(),
                            'last_name': lastCtrl.text.trim(),
                            'email': emailCtrl.text.trim(),
                            'phone': phoneCtrl.text.trim(),
                            'resume_url': urlCtrl.text.trim(),
                            'skills': skillsCtrl.text.trim(),
                            'experience_summary': summaryCtrl.text.trim(),
                            'reference_type': selectedRefType == 'none' ? null : selectedRefType,
                            'reference_detail': selectedRefType == 'none' ? null : refDetailCtrl.text.trim(),
                          });
                          if (ctx.mounted) {
                            setSheetState(() => isSaving = false);
                            if (res != null) {
                              Navigator.pop(ctx);
                              ScaffoldMessenger.of(ctx).showSnackBar(const SnackBar(content: Text('Profile ingested successfully!'), backgroundColor: CogniTheme.emerald700));
                              _fetchProfiles();
                            } else {
                              ScaffoldMessenger.of(ctx).showSnackBar(const SnackBar(content: Text('Failed to ingest profile.'), backgroundColor: CogniTheme.rose700));
                            }
                          }
                        }
                      },
                      child: isSaving
                          ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                          : const Text('Ingest Profile'),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: CogniTheme.ink50,
      appBar: AppBar(
        title: Text('Talent Pool Database', style: GoogleFonts.inter(fontWeight: FontWeight.w700)),
        actions: [
          IconButton(icon: const Icon(Icons.refresh_rounded), onPressed: _fetchProfiles, tooltip: 'Refresh'),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _fetchProfiles,
              color: CogniTheme.brand700,
              child: _profiles.isEmpty
                  ? const EmptyStateWidget(icon: Icons.folder_open_rounded, message: 'No candidate profiles cataloged in database.')
                  : ListView.builder(
                      padding: const EdgeInsets.fromLTRB(16, 16, 16, 80),
                      itemCount: _profiles.length,
                      itemBuilder: (ctx, i) {
                        final p = _profiles[i];
                        final name = '${p['first_name'] ?? ''} ${p['last_name'] ?? ''}';
                        final email = p['email'] ?? '--';
                        final phone = p['phone'] ?? '--';
                        final skills = p['skills'] ?? 'No skills cataloged';
                        return PremiumCard(
                          leftBorderColor: CogniTheme.brand700,
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(name, style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.bold, color: CogniTheme.ink900)),
                              const SizedBox(height: 6),
                              Row(
                                children: [
                                  const Icon(Icons.email_outlined, size: 12, color: CogniTheme.ink500),
                                  const SizedBox(width: 6),
                                  Text(email, style: GoogleFonts.inter(fontSize: 12, color: CogniTheme.ink500)),
                                ],
                              ),
                              const SizedBox(height: 4),
                              Row(
                                children: [
                                  const Icon(Icons.phone_outlined, size: 12, color: CogniTheme.ink500),
                                  const SizedBox(width: 6),
                                  Text(phone, style: GoogleFonts.inter(fontSize: 12, color: CogniTheme.ink500)),
                                ],
                              ),
                              if (p['reference_type'] != null && p['reference_type'] != 'none') ...[
                                const SizedBox(height: 4),
                                Row(
                                  children: [
                                    const Icon(Icons.share_rounded, size: 12, color: CogniTheme.teal700),
                                    const SizedBox(width: 6),
                                    Text(
                                      'Referral: ${(p['reference_type'] as String).replaceAll('_', ' ')} (${p['reference_detail'] ?? ''})',
                                      style: GoogleFonts.inter(fontSize: 12, color: CogniTheme.teal700, fontWeight: FontWeight.w500),
                                    ),
                                  ],
                                ),
                              ],
                              const SizedBox(height: 8),
                              Container(
                                width: double.infinity,
                                padding: const EdgeInsets.all(10),
                                decoration: BoxDecoration(color: CogniTheme.ink100, borderRadius: BorderRadius.circular(10)),
                                child: Text('Skills: $skills', style: GoogleFonts.inter(fontSize: 12, color: CogniTheme.ink700)),
                              ),
                            ],
                          ),
                        );
                      },
                    ),
            ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _showAddProfileSheet,
        backgroundColor: CogniTheme.brand700,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.upload_file_rounded),
        label: const Text('Ingest Resume'),
      ),
    );
  }
}
