import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class CogniTheme {
  // ─── Brand Palette ──────────────────────────────────────────────────────────
  static const Color brand900   = Color(0xFF0E243D); // CogniHR navy
  static const Color brand800   = Color(0xFF17334F); // Deep navy tint
  static const Color brand700   = Color(0xFF0E243D); // Primary brand
  static const Color brand600   = Color(0xFF123150); // Primary hover
  static const Color brand400   = Color(0xFF2A9D8F); // CogniHR teal
  static const Color brand100   = Color(0xFFE8F3F1); // Teal tint
  static const Color brand50    = Color(0xFFF4F6F8); // Brand off-white

  static const Color teal700    = Color(0xFF23877B);
  static const Color teal500    = Color(0xFF2A9D8F);
  static const Color teal100    = Color(0xFFE6F4F1);

  static const Color violet700  = Color(0xFF7C3AED);
  static const Color violet500  = Color(0xFF8B5CF6);
  static const Color violet100  = Color(0xFFEDE9FE);

  static const Color emerald700 = Color(0xFF059669);
  static const Color emerald500 = Color(0xFF10B981);
  static const Color emerald100 = Color(0xFFD1FAE5);

  static const Color amber700   = Color(0xFFC58F00);
  static const Color amber500   = Color(0xFFFFC107);
  static const Color amber100   = Color(0xFFFFF4CC);

  static const Color rose700    = Color(0xFFBE123C);
  static const Color rose500    = Color(0xFFF43F5E);
  static const Color rose100    = Color(0xFFFFE4E6);

  static const Color ink900     = Color(0xFF0E243D);
  static const Color ink700     = Color(0xFF334155);
  static const Color ink500     = Color(0xFF64748B);
  static const Color ink400     = Color(0xFF94A3B8);
  static const Color ink300     = Color(0xFFCBD5E1);
  static const Color ink100     = Color(0xFFF1F5F9);
  static const Color ink50      = Color(0xFFF8FAFC);

  // Legacy aliases (keep for existing screens)
  static const Color blueLight    = brand50;
  static const Color blueDefault  = brand700;
  static const Color blueDark     = brand900;
  static const Color tealLight    = teal100;
  static const Color tealDefault  = teal700;
  static const Color tealDark     = Color(0xFF134E4A);
  static const Color violetLight  = violet100;
  static const Color violetDefault= violet500;
  static const Color violetDark   = Color(0xFF4C1D95);
  static const Color grayBg       = ink50;
  static const Color grayText     = ink700;

  // ─── Gradient Shortcuts ────────────────────────────────────────────────────
  static const LinearGradient heroGradient = LinearGradient(
    colors: [brand700, Color(0xFF2A9D8F), Color(0xFFFFC107)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient cardGradient = LinearGradient(
    colors: [Colors.white, Color(0xFFF8FAFF)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient navyGradient = LinearGradient(
    colors: [ink900, Color(0xFF17334F)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  // ─── Shadows ────────────────────────────────────────────────────────────────
  static List<BoxShadow> shadowSm = [
    BoxShadow(color: Colors.black.withValues(alpha: 0.06), blurRadius: 8, offset: const Offset(0, 2)),
  ];

  static List<BoxShadow> shadowMd = [
    BoxShadow(color: Colors.black.withValues(alpha: 0.08), blurRadius: 16, offset: const Offset(0, 4)),
    BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 4, offset: const Offset(0, 1)),
  ];

  static List<BoxShadow> shadowLg = [
    BoxShadow(color: Colors.black.withValues(alpha: 0.12), blurRadius: 32, offset: const Offset(0, 8)),
    BoxShadow(color: Colors.black.withValues(alpha: 0.06), blurRadius: 8, offset: const Offset(0, 2)),
  ];

  static List<BoxShadow> shadowBrand = [
    BoxShadow(color: brand700.withValues(alpha: 0.30), blurRadius: 24, offset: const Offset(0, 8)),
  ];

  // ─── Theme ──────────────────────────────────────────────────────────────────
  static ThemeData get lightTheme {
    final base = ThemeData(useMaterial3: true, colorSchemeSeed: brand600);
    final inter = GoogleFonts.interTextTheme(base.textTheme);

    return base.copyWith(
      primaryColor: brand700,
      scaffoldBackgroundColor: ink50,
      colorScheme: const ColorScheme.light(
        primary:   brand700,
        secondary: teal700,
        tertiary:  violet500,
        surface:   Colors.white,
        error:     Color(0xFFEF4444),
        onPrimary: Colors.white,
        onSurface: ink700,
        outline:   ink100,
        surfaceContainerHighest: ink50,
      ),
      textTheme: inter.copyWith(
        displayLarge:  inter.displayLarge?.copyWith(color: ink900, fontWeight: FontWeight.w800),
        headlineLarge: inter.headlineLarge?.copyWith(fontSize: 28, fontWeight: FontWeight.w800, color: ink900),
        headlineMedium:inter.headlineMedium?.copyWith(fontSize: 22, fontWeight: FontWeight.w700, color: ink900),
        titleLarge:    inter.titleLarge?.copyWith(fontSize: 18, fontWeight: FontWeight.w700, color: ink900),
        titleMedium:   inter.titleMedium?.copyWith(fontSize: 16, fontWeight: FontWeight.w600, color: ink900),
        titleSmall:    inter.titleSmall?.copyWith(fontSize: 14, fontWeight: FontWeight.w600, color: ink700),
        bodyLarge:     inter.bodyLarge?.copyWith(fontSize: 15, color: ink700, height: 1.55),
        bodyMedium:    inter.bodyMedium?.copyWith(fontSize: 14, color: ink700, height: 1.5),
        bodySmall:     inter.bodySmall?.copyWith(fontSize: 12, color: ink500),
        labelLarge:    inter.labelLarge?.copyWith(fontSize: 14, fontWeight: FontWeight.w600, color: ink900),
        labelSmall:    inter.labelSmall?.copyWith(fontSize: 10, fontWeight: FontWeight.w700, letterSpacing: 0.8, color: ink500),
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: Colors.white,
        foregroundColor: ink900,
        elevation: 0,
        scrolledUnderElevation: 1,
        shadowColor: Colors.black.withValues(alpha: 0.06),
        surfaceTintColor: Colors.transparent,
        iconTheme: const IconThemeData(color: ink700, size: 22),
        titleTextStyle: GoogleFonts.inter(
          fontSize: 17,
          fontWeight: FontWeight.w700,
          color: ink900,
          letterSpacing: -0.3,
        ),
      ),
      cardTheme: CardThemeData(
        color: Colors.white,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(18),
          side: const BorderSide(color: Color(0xFFEFF2F8), width: 1.5),
        ),
        shadowColor: Colors.black.withValues(alpha: 0.06),
        margin: EdgeInsets.zero,
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: ink50,
        labelStyle: GoogleFonts.inter(color: ink500, fontSize: 13, fontWeight: FontWeight.w500),
        hintStyle: GoogleFonts.inter(color: ink300, fontSize: 14),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFFE2E8F0), width: 1.2),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: brand600, width: 1.8),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFFEF4444), width: 1.2),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFFEF4444), width: 1.8),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        isDense: true,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: brand700,
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          elevation: 0,
          padding: const EdgeInsets.symmetric(vertical: 15, horizontal: 24),
          textStyle: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.w600),
          shadowColor: brand700.withValues(alpha: 0.3),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: brand700,
          side: const BorderSide(color: brand700, width: 1.5),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          padding: const EdgeInsets.symmetric(vertical: 15, horizontal: 24),
          textStyle: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.w600),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: brand600,
          textStyle: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w600),
        ),
      ),
      floatingActionButtonTheme: FloatingActionButtonThemeData(
        backgroundColor: brand700,
        foregroundColor: Colors.white,
        elevation: 4,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      ),
      bottomNavigationBarTheme: BottomNavigationBarThemeData(
        backgroundColor: Colors.white,
        selectedItemColor: brand700,
        unselectedItemColor: ink500,
        elevation: 0,
        type: BottomNavigationBarType.fixed,
        selectedLabelStyle: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w700),
        unselectedLabelStyle: GoogleFonts.inter(fontSize: 11),
      ),
      dividerTheme: const DividerThemeData(color: Color(0xFFEFF2F8), space: 1, thickness: 1),
      chipTheme: ChipThemeData(
        backgroundColor: brand50,
        labelStyle: GoogleFonts.inter(color: brand700, fontSize: 12, fontWeight: FontWeight.w500),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        side: BorderSide.none,
      ),
      checkboxTheme: CheckboxThemeData(
        fillColor: WidgetStateProperty.resolveWith((s) => s.contains(WidgetState.selected) ? brand700 : null),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(5)),
      ),
      tabBarTheme: TabBarThemeData(
        labelColor: brand700,
        unselectedLabelColor: ink500,
        indicator: UnderlineTabIndicator(
          borderSide: const BorderSide(color: brand700, width: 3),
          borderRadius: BorderRadius.circular(2),
        ),
        labelStyle: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w600),
        unselectedLabelStyle: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w500),
        indicatorSize: TabBarIndicatorSize.label,
      ),
    );
  }
}
