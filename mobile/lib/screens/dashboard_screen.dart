import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../services/api_service.dart';
import '../theme_config.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen>
    with SingleTickerProviderStateMixin {
  bool _isLoading = true;
  List<dynamic> _leaveBalances = [];
  List<dynamic> _myAttendance = [];
  late AnimationController _animCtrl;
  late Animation<double> _fadeAnim;

  @override
  void initState() {
    super.initState();
    _animCtrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 900));
    _fadeAnim = CurvedAnimation(parent: _animCtrl, curve: Curves.easeOut);
    _fetchDashboardData();
  }

  @override
  void dispose() {
    _animCtrl.dispose();
    super.dispose();
  }

  Future<void> _fetchDashboardData() async {
    if (!mounted) return;
    setState(() => _isLoading = true);
    final api = context.read<ApiService>();
    final user = api.currentUser;
    if (user == null) {
      if (mounted) setState(() => _isLoading = false);
      return;
    }
    try {
      final balances   = await api.getLeaveBalances();
      final attendance = await api.getMyAttendance();
      if (mounted) {
        setState(() {
          _leaveBalances = balances ?? [];
          _myAttendance  = attendance ?? [];
          _isLoading     = false;
        });
        _animCtrl.forward();
      }
    } catch (e) {
      debugPrint('Dashboard error: $e');
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _logout(BuildContext context) {
    context.read<ApiService>().logout();
    context.go('/login');
  }

  String _greeting() {
    final h = DateTime.now().hour;
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }

  // ───────────────────────────── build ────────────────────────────────────────
  @override
  Widget build(BuildContext context) {
    final api  = context.watch<ApiService>();
    final user = api.currentUser;

    if (user == null) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    final firstName = user.email.split('@')[0].split('.')[0];
    final displayName = firstName[0].toUpperCase() + firstName.substring(1);

    return Scaffold(
      backgroundColor: CogniTheme.ink50,
      appBar: _buildAppBar(context, user),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : FadeTransition(
              opacity: _fadeAnim,
              child: RefreshIndicator(
                onRefresh: _fetchDashboardData,
                color: CogniTheme.brand700,
                child: CustomScrollView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  slivers: [
                    SliverToBoxAdapter(child: _buildHeroBanner(context, displayName, user.role)),
                    SliverPadding(
                      padding: const EdgeInsets.fromLTRB(16, 24, 16, 0),
                      sliver: SliverToBoxAdapter(
                        child: _buildSectionHeader('Workspace Services', Icons.apps_rounded),
                      ),
                    ),
                    SliverPadding(
                      padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
                      sliver: SliverToBoxAdapter(child: _buildServicesGrid(context)),
                    ),
                    SliverPadding(
                      padding: const EdgeInsets.fromLTRB(16, 28, 16, 0),
                      sliver: SliverToBoxAdapter(
                        child: _buildSectionHeader('My Leave Balances', Icons.event_available_outlined),
                      ),
                    ),
                    SliverPadding(
                      padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
                      sliver: SliverToBoxAdapter(child: _buildLeaveSection()),
                    ),
                    SliverPadding(
                      padding: const EdgeInsets.fromLTRB(16, 28, 16, 0),
                      sliver: SliverToBoxAdapter(
                        child: _buildSectionHeader('Recent Attendance', Icons.access_time_rounded),
                      ),
                    ),
                    SliverPadding(
                      padding: const EdgeInsets.fromLTRB(16, 12, 16, 28),
                      sliver: SliverToBoxAdapter(child: _buildAttendanceSection()),
                    ),
                  ],
                ),
              ),
            ),
      bottomNavigationBar: _buildNavBar(context),
    );
  }

  // ─── AppBar ──────────────────────────────────────────────────────────────────
  AppBar _buildAppBar(BuildContext context, dynamic user) {
    return AppBar(
      scrolledUnderElevation: 1,
      shadowColor: Colors.black.withValues(alpha: 0.08),
      title: Image.asset('assets/logo.png', height: 36, fit: BoxFit.contain),
      actions: [
        if (['hr_admin', 'super_admin', 'recruiter', 'Talent Team', 'HR Team', 'Resource Mgmt Group'].contains(user.role))
          _actionButton(Icons.admin_panel_settings_outlined, 'Admin', () => context.push('/admin-gateway')),
        if (user.role == 'manager')
          _actionButton(Icons.supervised_user_circle_outlined, 'Team', () => context.push('/manager-hub')),
        _actionButton(Icons.notifications_outlined, 'Notifications', () {}),
        const SizedBox(width: 4),
        GestureDetector(
          onTap: () => _logout(context),
          child: Container(
            margin: const EdgeInsets.only(right: 12),
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: CogniTheme.rose500.withValues(alpha: 0.1),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.logout_rounded, color: CogniTheme.rose500, size: 20),
          ),
        ),
      ],
    );
  }

  Widget _actionButton(IconData icon, String tooltip, VoidCallback onTap) {
    return IconButton(
      icon: Icon(icon, size: 22),
      onPressed: onTap,
      tooltip: tooltip,
      style: IconButton.styleFrom(
        foregroundColor: CogniTheme.ink700,
        highlightColor: CogniTheme.brand100,
      ),
    );
  }

  // ─── Hero Banner ─────────────────────────────────────────────────────────────
  Widget _buildHeroBanner(BuildContext context, String name, String role) {
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: CogniTheme.heroGradient,
        borderRadius: BorderRadius.circular(24),
        boxShadow: CogniTheme.shadowBrand,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '${_greeting()},',
                      style: GoogleFonts.inter(color: Colors.white60, fontSize: 14),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      name,
                      style: GoogleFonts.inter(
                        color: Colors.white,
                        fontSize: 26,
                        fontWeight: FontWeight.w800,
                        height: 1.2,
                      ),
                    ),
                    const SizedBox(height: 10),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.18),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: Colors.white.withValues(alpha: 0.25)),
                      ),
                      child: Text(
                        role.toUpperCase().replaceAll('_', ' '),
                        style: GoogleFonts.inter(
                          color: Colors.white,
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          letterSpacing: 0.8,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              // Avatar circle
              Container(
                width: 60,
                height: 60,
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.2),
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.white.withValues(alpha: 0.3), width: 2),
                ),
                child: Center(
                  child: Text(
                    name[0].toUpperCase(),
                    style: GoogleFonts.inter(color: Colors.white, fontSize: 26, fontWeight: FontWeight.w800),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          // Quick stat pills
          Row(
            children: [
              _heroPill(Icons.calendar_today_outlined, 'Today', _todayDate()),
              const SizedBox(width: 10),
              _heroPill(Icons.circle, '', '', isStatus: true),
            ],
          ),
        ],
      ),
    );
  }

  String _todayDate() {
    final now = DateTime.now();
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    return '${days[now.weekday - 1]}, ${now.day} ${months[now.month - 1]}';
  }

  Widget _heroPill(IconData icon, String label, String value, {bool isStatus = false}) {
    if (isStatus) {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: CogniTheme.emerald500.withValues(alpha: 0.2),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: CogniTheme.emerald500.withValues(alpha: 0.4)),
        ),
        child: Row(
          children: [
            Container(width: 7, height: 7, decoration: const BoxDecoration(color: CogniTheme.emerald500, shape: BoxShape.circle)),
            const SizedBox(width: 6),
            Text('Active', style: GoogleFonts.inter(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600)),
          ],
        ),
      );
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white.withValues(alpha: 0.2)),
      ),
      child: Row(
        children: [
          Icon(icon, color: Colors.white70, size: 13),
          const SizedBox(width: 6),
          Text(value, style: GoogleFonts.inter(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }

  // ─── Section Header ───────────────────────────────────────────────────────────
  Widget _buildSectionHeader(String title, IconData icon) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(7),
          decoration: BoxDecoration(
            color: CogniTheme.brand100,
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, color: CogniTheme.brand700, size: 16),
        ),
        const SizedBox(width: 10),
        Text(
          title,
          style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w700, color: CogniTheme.ink900),
        ),
      ],
    );
  }

  // ─── Services Grid ─────────────────────────────────────────────────────────
  static const _services = [
    {'title': 'Leave',      'icon': Icons.event_available_rounded,       'c1': 0xFF0EA5E9, 'c2': 0xFF0284C7, 'route': '/leave'},
    {'title': 'Payroll',    'icon': Icons.payments_rounded,              'c1': 0xFF10B981, 'c2': 0xFF059669, 'route': '/payroll-history'},
    {'title': 'Tax & FBP',  'icon': Icons.receipt_long_rounded,          'c1': 0xFFF59E0B, 'c2': 0xFFD97706, 'route': '/tax-fbp'},
    {'title': 'Insurance',  'icon': Icons.health_and_safety_rounded,     'c1': 0xFFF43F5E, 'c2': 0xFFE11D48, 'route': '/my-insurance'},
    {'title': 'Car Lease',  'icon': Icons.directions_car_filled_rounded,  'c1': 0xFF6366F1, 'c2': 0xFF4F46E5, 'route': '/my-car-lease'},
    {'title': 'Exit Center','icon': Icons.logout_rounded,                'c1': 0xFFEF4444, 'c2': 0xFFDC2626, 'route': '/my-exit'},
    {'title': 'My Assets',  'icon': Icons.devices_rounded,               'c1': 0xFF8B5CF6, 'c2': 0xFF7C3AED, 'route': '/my-assets'},
    {'title': 'Helpdesk',   'icon': Icons.headset_mic_rounded,           'c1': 0xFF3B82F6, 'c2': 0xFF2563EB, 'route': '/my-helpdesk'},
  ];

  Widget _buildServicesGrid(BuildContext context) {
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 4,
        crossAxisSpacing: 10,
        mainAxisSpacing: 10,
        childAspectRatio: 0.78,
      ),
      itemCount: _services.length,
      itemBuilder: (ctx, i) {
        final s = _services[i];
        return _ServiceTile(
          title:  s['title'] as String,
          icon:   s['icon'] as IconData,
          color1: Color(s['c1'] as int),
          color2: Color(s['c2'] as int),
          onTap:  () => context.push(s['route'] as String),
        );
      },
    );
  }

  // ─── Leave Balances ─────────────────────────────────────────────────────────
  Widget _buildLeaveSection() {
    if (_leaveBalances.isEmpty) {
      return _emptyState(Icons.event_available_outlined, 'No leave allocations found.');
    }
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2, crossAxisSpacing: 12, mainAxisSpacing: 12, childAspectRatio: 2.0,
      ),
      itemCount: _leaveBalances.length,
      itemBuilder: (ctx, i) {
        final b   = _leaveBalances[i];
        final tp  = (b['leave_type'] ?? 'Leave') as String;
        final rem = (b['remaining'] ?? 0) as int;
        final tot = (b['allocated'] ?? 20) as int;
        return _LeaveBalanceCard(leaveType: tp, remaining: rem, total: tot);
      },
    );
  }

  // ─── Attendance ──────────────────────────────────────────────────────────────
  Widget _buildAttendanceSection() {
    if (_myAttendance.isEmpty) {
      return _emptyState(Icons.access_time_outlined, 'No attendance logs this month.');
    }
    final logs = _myAttendance.take(5).toList();
    return Column(
      children: logs.asMap().entries.map((entry) {
        final log = entry.value;
        final date     = log['date'] ?? '';
        final checkIn  = log['check_in'] ?? '--:--';
        final checkOut = log['check_out'] ?? '--:--';
        final status   = (log['status'] ?? 'Absent').toString().toLowerCase();

        Color statusColor;
        IconData statusIcon;
        Color bgColor;
        if (status == 'present') {
          statusColor = CogniTheme.emerald700;
          statusIcon  = Icons.check_circle_rounded;
          bgColor     = CogniTheme.emerald100;
        } else if (status == 'late') {
          statusColor = CogniTheme.amber700;
          statusIcon  = Icons.schedule_rounded;
          bgColor     = CogniTheme.amber100;
        } else {
          statusColor = CogniTheme.rose700;
          statusIcon  = Icons.cancel_rounded;
          bgColor     = CogniTheme.rose100;
        }

        return Container(
          margin: const EdgeInsets.only(bottom: 10),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(14),
            border: const Border(left: BorderSide(width: 0, color: Colors.transparent)),
            boxShadow: CogniTheme.shadowSm,
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(9),
                decoration: BoxDecoration(color: bgColor, shape: BoxShape.circle),
                child: Icon(statusIcon, color: statusColor, size: 18),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(date, style: GoogleFonts.inter(fontWeight: FontWeight.w700, fontSize: 14, color: CogniTheme.ink900)),
                    const SizedBox(height: 3),
                    Text(
                      'In: $checkIn  •  Out: $checkOut',
                      style: GoogleFonts.inter(fontSize: 12, color: CogniTheme.ink500),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(color: bgColor, borderRadius: BorderRadius.circular(10)),
                child: Text(
                  status.toUpperCase(),
                  style: GoogleFonts.inter(color: statusColor, fontSize: 9, fontWeight: FontWeight.w800, letterSpacing: 0.5),
                ),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }

  Widget _emptyState(IconData icon, String msg) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 28, horizontal: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: CogniTheme.ink100),
      ),
      child: Row(
        children: [
          Icon(icon, color: CogniTheme.ink300, size: 28),
          const SizedBox(width: 14),
          Expanded(child: Text(msg, style: GoogleFonts.inter(color: CogniTheme.ink500, fontSize: 13))),
        ],
      ),
    );
  }

  // ─── Bottom Nav ──────────────────────────────────────────────────────────────
  Widget _buildNavBar(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.08), blurRadius: 20, offset: const Offset(0, -4))],
      ),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _navItem(context, Icons.dashboard_rounded, Icons.dashboard_outlined, 'Overview', true, () {}),
              _navItem(context, Icons.person_rounded, Icons.person_outline_rounded, 'Profile', false, () => context.push('/profile')),
              _navItem(context, Icons.access_time_filled_rounded, Icons.access_time_outlined, 'Attendance', false, () => context.push('/attendance')),
              _navItem(context, Icons.event_available_rounded, Icons.event_available_outlined, 'Leave', false, () => context.push('/leave')),
            ],
          ),
        ),
      ),
    );
  }

  Widget _navItem(BuildContext context, IconData activeIcon, IconData inactiveIcon, String label, bool isActive, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 250),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: isActive ? CogniTheme.brand700.withValues(alpha: 0.1) : Colors.transparent,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(isActive ? activeIcon : inactiveIcon, color: isActive ? CogniTheme.brand700 : CogniTheme.ink500, size: 22),
            const SizedBox(height: 3),
            Text(
              label,
              style: GoogleFonts.inter(
                fontSize: 10,
                fontWeight: isActive ? FontWeight.w700 : FontWeight.w500,
                color: isActive ? CogniTheme.brand700 : CogniTheme.ink500,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Service Tile Widget ────────────────────────────────────────────────────────
class _ServiceTile extends StatefulWidget {
  final String title;
  final IconData icon;
  final Color color1;
  final Color color2;
  final VoidCallback onTap;
  const _ServiceTile({required this.title, required this.icon, required this.color1, required this.color2, required this.onTap});
  @override
  State<_ServiceTile> createState() => _ServiceTileState();
}

class _ServiceTileState extends State<_ServiceTile> {
  bool _pressed = false;
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown:   (_) => setState(() => _pressed = true),
      onTapUp:     (_) { setState(() => _pressed = false); widget.onTap(); },
      onTapCancel: ()  => setState(() => _pressed = false),
      child: AnimatedScale(
        scale: _pressed ? 0.93 : 1.0,
        duration: const Duration(milliseconds: 150),
        curve: Curves.easeOut,
        child: Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: const Color(0xFFEFF2F8), width: 1.5),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.03),
                blurRadius: 10,
                offset: const Offset(0, 4),
              )
            ],
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [widget.color1, widget.color2],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(14),
                  boxShadow: [BoxShadow(color: widget.color1.withValues(alpha: 0.35), blurRadius: 10, offset: const Offset(0, 4))],
                ),
                child: Icon(widget.icon, color: Colors.white, size: 22),
              ),
              const SizedBox(height: 8),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 4),
                child: Text(
                  widget.title,
                  textAlign: TextAlign.center,
                  style: GoogleFonts.inter(fontSize: 10.5, fontWeight: FontWeight.w700, color: CogniTheme.ink900, height: 1.2),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ─── Leave Balance Card ─────────────────────────────────────────────────────────
class _LeaveBalanceCard extends StatelessWidget {
  final String leaveType;
  final int remaining;
  final int total;
  const _LeaveBalanceCard({required this.leaveType, required this.remaining, required this.total});

  @override
  Widget build(BuildContext context) {
    Color mainColor;
    Color bgColor;
    IconData icon;
    if (leaveType.toLowerCase().contains('sick')) {
      mainColor = CogniTheme.amber700; bgColor = CogniTheme.amber100; icon = Icons.healing_rounded;
    } else if (leaveType.toLowerCase().contains('casual')) {
      mainColor = CogniTheme.teal700; bgColor = CogniTheme.teal100; icon = Icons.beach_access_rounded;
    } else if (leaveType.toLowerCase().contains('earned') || leaveType.toLowerCase().contains('privilege')) {
      mainColor = CogniTheme.violet700; bgColor = CogniTheme.violet100; icon = Icons.stars_rounded;
    } else {
      mainColor = CogniTheme.brand700; bgColor = CogniTheme.brand100; icon = Icons.work_history_rounded;
    }

    final progress = total > 0 ? remaining / total : 0.0;

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: mainColor.withValues(alpha: 0.15)),
        boxShadow: CogniTheme.shadowSm,
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(9),
            decoration: BoxDecoration(color: bgColor, borderRadius: BorderRadius.circular(12)),
            child: Icon(icon, color: mainColor, size: 18),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  leaveType.toUpperCase(),
                  style: GoogleFonts.inter(fontSize: 9, color: CogniTheme.ink500, fontWeight: FontWeight.w700, letterSpacing: 0.5),
                  maxLines: 1, overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 2),
                Text(
                  '$remaining Days',
                  style: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.w800, color: CogniTheme.ink900),
                ),
                const SizedBox(height: 5),
                ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: LinearProgressIndicator(
                    value: progress.clamp(0.0, 1.0),
                    backgroundColor: bgColor,
                    valueColor: AlwaysStoppedAnimation<Color>(mainColor),
                    minHeight: 4,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
