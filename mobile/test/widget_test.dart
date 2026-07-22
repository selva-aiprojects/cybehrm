import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/main.dart';
import 'package:provider/provider.dart';
import 'package:mobile/services/api_service.dart';

void main() {
  testWidgets('App loads smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(
      MultiProvider(
        providers: [
          ChangeNotifierProvider(create: (_) => ApiService()),
        ],
        child: const HRMSEngineApp(),
      ),
    );

    // Verify that the login screen is loaded (SynthalystHRM title should be there)
    expect(find.textContaining('SynthalystHRM'), findsWidgets);
  });
}
