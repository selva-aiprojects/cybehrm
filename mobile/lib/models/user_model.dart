class UserModel {
  final String id;
  final String organizationId;
  final String email;
  final String role;
  final bool isActive;
  final String? organizationName;
  final bool featureTalentMgmt;
  final bool featureHrTeam;
  final bool featureResourceMgmt;
  final String? employeeId;

  UserModel({
    required this.id,
    required this.organizationId,
    required this.email,
    required this.role,
    required this.isActive,
    this.organizationName,
    required this.featureTalentMgmt,
    required this.featureHrTeam,
    required this.featureResourceMgmt,
    this.employeeId,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] ?? '',
      organizationId: json['organization_id'] ?? '',
      email: json['email'] ?? '',
      role: json['role'] ?? '',
      isActive: json['is_active'] ?? false,
      organizationName: json['organization_name'],
      featureTalentMgmt: json['feature_talent_mgmt'] ?? false,
      featureHrTeam: json['feature_hr_team'] ?? false,
      featureResourceMgmt: json['feature_resource_mgmt'] ?? false,
      employeeId: json['employee_id'],
    );
  }
}
