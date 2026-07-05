import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import '../models/user_model.dart';

class ApiService extends ChangeNotifier {
  String _baseUrl = 'https://cognihr-backend.onrender.com'; // Production Render Backend
  String? _token;
  UserModel? _currentUser;

  String get baseUrl => _baseUrl;
  set baseUrl(String url) {
    _baseUrl = url;
    notifyListeners();
  }

  bool get isAuthenticated => _token != null;
  UserModel? get currentUser => _currentUser;

  Future<bool> login(String email, String password, String organizationId) async {
    try {
      final response = await http.post(
        Uri.parse('$_baseUrl/auth/login'),
        headers: {
          'Content-Type': 'application/json',
          'Bypass-Tunnel-Reminder': 'true'
        },
        body: jsonEncode({
          'email': email,
          'password': password,
          'organization_id': organizationId
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        _token = data['access_token'];
        
        // Fetch current user details
        final meResponse = await get('/auth/me');
        if (meResponse != null) {
          _currentUser = UserModel.fromJson(meResponse);
        }

        notifyListeners();
        return true;
      }
    } catch (e) {
      debugPrint('Login error: $e');
    }
    return false;
  }

  void logout() {
    _token = null;
    _currentUser = null;
    notifyListeners();
  }

  Future<Map<String, dynamic>?> get(String endpoint) async {
    try {
      final headers = <String, String>{
        'Bypass-Tunnel-Reminder': 'true'
      };
      if (_token != null) {
        headers['Authorization'] = 'Bearer $_token';
      }

      final response = await http.get(
        Uri.parse('$baseUrl$endpoint'),
        headers: headers,
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
    } catch (e) {
      debugPrint('GET error: $e');
    }
    return null;
  }

  Future<List<dynamic>?> getList(String endpoint) async {
    try {
      final headers = <String, String>{
        'Bypass-Tunnel-Reminder': 'true'
      };
      if (_token != null) {
        headers['Authorization'] = 'Bearer $_token';
      }

      final response = await http.get(
        Uri.parse('$baseUrl$endpoint'),
        headers: headers,
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
    } catch (e) {
      debugPrint('GET List error: $e');
    }
    return null;
  }

  Future<Map<String, dynamic>?> post(String endpoint, Map<String, dynamic> body) async {
    try {
      final headers = <String, String>{
        'Content-Type': 'application/json',
        'Bypass-Tunnel-Reminder': 'true'
      };
      if (_token != null) {
        headers['Authorization'] = 'Bearer $_token';
      }

      final response = await http.post(
        Uri.parse('$baseUrl$endpoint'),
        headers: headers,
        body: jsonEncode(body),
      );

      if (response.statusCode >= 200 && response.statusCode < 300) {
        return jsonDecode(response.body);
      } else {
        debugPrint('POST error status: ${response.statusCode} body: ${response.body}');
      }
    } catch (e) {
      debugPrint('POST error: $e');
    }
    return null;
  }

  Future<Map<String, dynamic>?> put(String endpoint, Map<String, dynamic> body) async {
    try {
      final headers = <String, String>{
        'Content-Type': 'application/json',
        'Bypass-Tunnel-Reminder': 'true'
      };
      if (_token != null) {
        headers['Authorization'] = 'Bearer $_token';
      }

      final response = await http.put(
        Uri.parse('$baseUrl$endpoint'),
        headers: headers,
        body: jsonEncode(body),
      );

      if (response.statusCode >= 200 && response.statusCode < 300) {
        return jsonDecode(response.body);
      } else {
        debugPrint('PUT error status: ${response.statusCode} body: ${response.body}');
      }
    } catch (e) {
      debugPrint('PUT error: $e');
    }
    return null;
  }

  // --- Attendance Wrappers ---
  Future<Map<String, dynamic>?> checkIn(double lat, double lng) async {
    return await post('/attendance/checkin', {
      'location_lat': lat,
      'location_lng': lng,
      'ip_address': 'mobile-app',
    });
  }

  Future<Map<String, dynamic>?> checkOut(double lat, double lng) async {
    return await post('/attendance/checkout', {
      'location_lat': lat,
      'location_lng': lng,
      'ip_address': 'mobile-app',
    });
  }

  Future<List<dynamic>?> getMyAttendance() async {
    return await getList('/attendance/me');
  }

  // --- Leave Wrappers ---
  Future<List<dynamic>?> getLeaveBalances() async {
    return await getList('/leave/balance');
  }

  Future<List<dynamic>?> getLeaveRequests() async {
    return await getList('/leave/requests');
  }

  Future<Map<String, dynamic>?> submitLeaveRequest(String type, String start, String end, String reason) async {
    return await post('/leave/request', {
      'leave_type': type,
      'start_date': start,
      'end_date': end,
      'reason': reason,
    });
  }

  Future<Map<String, dynamic>?> updateLeaveStatus(String requestId, String status, String reason) async {
    return await put('/leave/requests/$requestId/action', {
      'status': status,
      'rejection_reason': reason,
    });
  }

  // --- Admin/Manager Wrappers ---
  Future<List<dynamic>?> getEmployees() async {
    return await getList('/employees');
  }

  Future<List<dynamic>?> getAttendanceReport(String dateStr) async {
    return await getList('/attendance/report?date=$dateStr');
  }

  Future<List<dynamic>?> getOpenJobs() async {
    return await getList('/talent/postings');
  }

  // --- Resource Requisitions ---
  Future<List<dynamic>?> getRequisitions() async {
    return await getList('/requisitions');
  }

  Future<Map<String, dynamic>?> createRequisition(Map<String, dynamic> data) async {
    return await post('/requisitions', data);
  }

  Future<Map<String, dynamic>?> submitRequisition(String id) async {
    return await post('/requisitions/$id/submit', {});
  }

  Future<Map<String, dynamic>?> approveRequisitionManager(String id, String notes) async {
    return await post('/requisitions/$id/approve-manager', {'notes': notes});
  }

  Future<Map<String, dynamic>?> approveRequisitionHR(String id, String notes) async {
    return await post('/requisitions/$id/approve-hr', {'notes': notes});
  }

  Future<Map<String, dynamic>?> rejectRequisition(String id, String notes) async {
    return await post('/requisitions/$id/reject', {'notes': notes});
  }

  Future<Map<String, dynamic>?> convertToPosition(String id) async {
    return await post('/requisitions/$id/convert-to-position', {});
  }

  // --- Personal Employee Services ---
  Future<List<dynamic>?> getMyPayslips() async {
    return await getList('/payroll/payslips/me');
  }

  Future<List<dynamic>?> getMyTaxDeclarations() async {
    return await getList('/tax-declarations/me');
  }

  Future<Map<String, dynamic>?> declareTaxes(Map<String, dynamic> data) async {
    return await post('/tax-declarations', data);
  }

  Future<Map<String, dynamic>?> getMyGradeAllowances() async {
    return await get('/grade-allowances/me');
  }

  Future<Map<String, dynamic>?> getMyFBPDeclaration() async {
    return await get('/fbp-declarations/me');
  }

  Future<Map<String, dynamic>?> submitFBPDeclaration(Map<String, dynamic> data) async {
    return await post('/fbp-declarations', data);
  }

  Future<Map<String, dynamic>?> getMyInsurance() async {
    return await get('/insurance/me');
  }

  Future<Map<String, dynamic>?> enrollInsurance(Map<String, dynamic> data) async {
    return await post('/insurance/enroll', data);
  }

  Future<Map<String, dynamic>?> getMyVehicleLease() async {
    return await get('/vehicle-lease/me');
  }

  Future<Map<String, dynamic>?> declareVehicleLease(Map<String, dynamic> data) async {
    return await post('/vehicle-lease', data);
  }

  Future<Map<String, dynamic>?> getMyOffboarding() async {
    return await get('/offboarding/me');
  }

  Future<Map<String, dynamic>?> applyResignation(Map<String, dynamic> data) async {
    return await post('/offboarding/apply', data);
  }

  Future<List<dynamic>?> getMyAssets() async {
    return await getList('/onboarding/assets/me');
  }

  Future<List<dynamic>?> getTenantSupportTickets() async {
    return await getList('/nexus/tickets/tenant');
  }

  Future<Map<String, dynamic>?> raiseSupportTicket(Map<String, dynamic> data) async {
    return await post('/nexus/tickets/tenant', data);
  }

  Future<Map<String, dynamic>?> getFinalSettlement(String requestId) async {
    return await get('/offboarding/requests/$requestId/settlement');
  }

  // --- Talent Acquisition & ATS Wrappers ---
  Future<List<dynamic>?> getTalentProfiles() async {
    return await getList('/talent/profiles');
  }

  Future<Map<String, dynamic>?> createTalentProfile(Map<String, dynamic> data) async {
    return await post('/talent/profiles', data);
  }

  Future<List<dynamic>?> getCandidates() async {
    return await getList('/talent/candidates');
  }

  Future<Map<String, dynamic>?> createCandidate(Map<String, dynamic> data) async {
    return await post('/talent/candidates', data);
  }

  Future<Map<String, dynamic>?> sendCallLetter(String candidateId, String interviewDate) async {
    return await post('/talent/call-letters', {
      'candidate_id': candidateId,
      'interview_date': interviewDate,
    });
  }

  Future<Map<String, dynamic>?> selectCandidate(String candidateId) async {
    return await post('/talent/candidates/$candidateId/select', {});
  }

  Future<Map<String, dynamic>?> rejectCandidate(String candidateId) async {
    return await post('/talent/candidates/$candidateId/reject', {});
  }
}
