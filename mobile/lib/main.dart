import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';

import 'services/api_service.dart';
import 'screens/login_screen.dart';
import 'screens/splash_screen.dart';
import 'screens/dashboard_screen.dart';
import 'screens/profile_screen.dart';
import 'screens/attendance_screen.dart';
import 'screens/leave_management_screen.dart';
import 'screens/leave_request_form.dart';
import 'screens/admin_module_selection_screen.dart';
import 'screens/admin_hr_screen.dart';
import 'screens/admin_talent_screen.dart';
import 'screens/admin_resource_screen.dart';
import 'screens/web_portal_redirect_screen.dart';
import 'screens/admin_payroll_screen.dart';
import 'screens/admin_performance_screen.dart';
import 'screens/admin_reports_screen.dart';
import 'screens/admin_support_screen.dart';
import 'screens/admin_ai_screen.dart';
import 'screens/employee_directory_screen.dart';
import 'screens/leave_approvals_screen.dart';
import 'screens/attendance_logs_screen.dart';
import 'screens/talent_jobs_screen.dart';
import 'screens/nexus_mgmt_screen.dart';
import 'screens/manager_hub_screen.dart';
import 'screens/resource_requisition_screen.dart';
import 'screens/my_payroll_screen.dart';
import 'screens/my_tax_fbp_screen.dart';
import 'screens/my_insurance_screen.dart';
import 'screens/my_car_lease_screen.dart';
import 'screens/my_exit_screen.dart';
import 'screens/my_assets_screen.dart';
import 'screens/my_helpdesk_screen.dart';
import 'screens/talent_database_screen.dart';
import 'screens/job_candidates_screen.dart';
import 'theme_config.dart';

void main() {
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => ApiService()),
      ],
      child: const HRMSEngineApp(),
    ),
  );
}

final _router = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) => const SplashScreen(),
    ),
    GoRoute(
      path: '/login',
      builder: (context, state) => const LoginScreen(),
    ),
    GoRoute(
      path: '/dashboard',
      builder: (context, state) => const DashboardScreen(),
    ),
    GoRoute(
      path: '/profile',
      builder: (context, state) => const ProfileScreen(),
    ),
    GoRoute(
      path: '/attendance',
      builder: (context, state) => const AttendanceScreen(),
    ),
    GoRoute(
      path: '/leave',
      builder: (context, state) => const LeaveManagementScreen(),
    ),
    GoRoute(
      path: '/leave/request',
      builder: (context, state) => const LeaveRequestForm(),
    ),
    GoRoute(
      path: '/payroll-history',
      builder: (context, state) => const MyPayrollScreen(),
    ),
    GoRoute(
      path: '/tax-fbp',
      builder: (context, state) => const MyTaxFbpScreen(),
    ),
    GoRoute(
      path: '/my-insurance',
      builder: (context, state) => const MyInsuranceScreen(),
    ),
    GoRoute(
      path: '/my-car-lease',
      builder: (context, state) => const MyCarLeaseScreen(),
    ),
    GoRoute(
      path: '/my-exit',
      builder: (context, state) => const MyExitScreen(),
    ),
    GoRoute(
      path: '/my-assets',
      builder: (context, state) => const MyAssetsScreen(),
    ),
    GoRoute(
      path: '/my-helpdesk',
      builder: (context, state) => const MyHelpdeskScreen(),
    ),
    // Manager Hub — team approvals & directory for manager role
    GoRoute(
      path: '/manager-hub',
      builder: (context, state) => const ManagerHubScreen(),
    ),
    // Admin gateway — hr_admin and super_admin only
    GoRoute(
      path: '/admin-gateway',
      builder: (context, state) => const AdminModuleSelectionScreen(),
    ),
    GoRoute(
      path: '/web-portal/:feature',
      builder: (context, state) => WebPortalRedirectScreen(
        featureName: Uri.decodeComponent(state.pathParameters['feature'] ?? 'Feature'),
      ),
    ),
    GoRoute(
      path: '/admin-directory',
      builder: (context, state) => const EmployeeDirectoryScreen(),
    ),
    GoRoute(
      path: '/admin-leave-approvals',
      builder: (context, state) => const LeaveApprovalsScreen(),
    ),
    GoRoute(
      path: '/admin-attendance-logs',
      builder: (context, state) => const AttendanceLogsScreen(),
    ),
    GoRoute(
      path: '/admin-jobs',
      builder: (context, state) => const TalentJobsScreen(),
    ),
    GoRoute(
      path: '/admin-hr',
      builder: (context, state) => const AdminHrScreen(),
    ),
    GoRoute(
      path: '/admin-talent',
      builder: (context, state) => const AdminTalentScreen(),
    ),
    GoRoute(
      path: '/admin-resource',
      builder: (context, state) => const AdminResourceScreen(),
    ),
    GoRoute(
      path: '/admin-payroll',
      builder: (context, state) => const AdminPayrollScreen(),
    ),
    GoRoute(
      path: '/admin-performance',
      builder: (context, state) => const AdminPerformanceScreen(),
    ),
    GoRoute(
      path: '/admin-reports',
      builder: (context, state) => const AdminReportsScreen(),
    ),
    GoRoute(
      path: '/admin-support',
      builder: (context, state) => const AdminSupportScreen(),
    ),
    GoRoute(
      path: '/admin-ai',
      builder: (context, state) => const AdminAiScreen(),
    ),
    GoRoute(
      path: '/nexus-mgmt',
      builder: (context, state) => const NexusMgmtScreen(),
    ),
    GoRoute(
      path: '/requisitions',
      builder: (context, state) => const ResourceRequisitionsScreen(),
    ),
    GoRoute(
      path: '/talent-database',
      builder: (context, state) => const TalentDatabaseScreen(),
    ),
    GoRoute(
      path: '/job-candidates',
      builder: (context, state) => JobCandidatesScreen(
        jobPosting: state.extra as Map<String, dynamic>,
      ),
    ),
  ],
);

class HRMSEngineApp extends StatelessWidget {
  const HRMSEngineApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'CybeHRM',
      theme: CogniTheme.lightTheme,
      routerConfig: _router,
      debugShowCheckedModeBanner: false,
    );
  }
}
