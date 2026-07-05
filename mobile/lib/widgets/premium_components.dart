import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../theme_config.dart';

class FormatUtils {
  static String formatCurrency(dynamic v) {
    if (v == null) return '₹0';
    try {
      return NumberFormat.currency(locale: 'en_IN', symbol: '₹', decimalDigits: 0)
          .format(double.parse(v.toString()));
    } catch (_) {
      return '₹$v';
    }
  }

  static String formatCurrencyDecimals(dynamic v) {
    if (v == null) return '₹0.00';
    try {
      return NumberFormat.currency(locale: 'en_IN', symbol: '₹', decimalDigits: 2)
          .format(double.parse(v.toString()));
    } catch (_) {
      return '₹$v';
    }
  }

  static String formatPeriod(String? s) {
    if (s == null) return 'Period Summary';
    try {
      return DateFormat('MMMM yyyy').format(DateTime.parse(s));
    } catch (_) {
      return 'Period Summary';
    }
  }

  static String formatShortDate(String? s) {
    if (s == null) return 'Date N/A';
    try {
      return DateFormat('dd MMM yyyy').format(DateTime.parse(s));
    } catch (_) {
      return s;
    }
  }
}

class PremiumCard extends StatelessWidget {
  final Widget child;
  final Color? leftBorderColor;
  final double leftBorderWidth;
  final EdgeInsetsGeometry? padding;
  final VoidCallback? onTap;

  const PremiumCard({
    super.key,
    required this.child,
    this.leftBorderColor,
    this.leftBorderWidth = 4.0,
    this.padding,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final decoration = BoxDecoration(
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
    );

    Widget cardContent = child;
    if (leftBorderColor != null) {
      cardContent = IntrinsicHeight(
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Container(
              width: leftBorderWidth,
              decoration: BoxDecoration(
                color: leftBorderColor,
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(16),
                  bottomLeft: Radius.circular(16),
                ),
              ),
            ),
            Expanded(
              child: Padding(
                padding: padding ?? const EdgeInsets.all(16),
                child: child,
              ),
            ),
          ],
        ),
      );
    } else {
      cardContent = Padding(
        padding: padding ?? const EdgeInsets.all(16),
        child: child,
      );
    }

    if (onTap == null) {
      return Container(
        margin: const EdgeInsets.only(bottom: 12),
        decoration: decoration,
        child: cardContent,
      );
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: decoration,
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(18),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(18),
          child: cardContent,
        ),
      ),
    );
  }
}

class EmptyStateWidget extends StatelessWidget {
  final IconData icon;
  final String message;

  const EmptyStateWidget({
    super.key,
    required this.icon,
    required this.message,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 48.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: CogniTheme.brand700.withValues(alpha: 0.05),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: CogniTheme.ink300, size: 44),
            ),
            const SizedBox(height: 16),
            Text(
              message,
              style: GoogleFonts.inter(
                color: CogniTheme.ink500,
                fontSize: 14,
                fontWeight: FontWeight.w500,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}

class LabelValueRow extends StatelessWidget {
  final String label;
  final String value;
  final Color? valueColor;
  final bool isBoldValue;

  const LabelValueRow({
    super.key,
    required this.label,
    required this.value,
    this.valueColor,
    this.isBoldValue = false,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          Expanded(
            flex: 3,
            child: Text(
              label,
              style: GoogleFonts.inter(
                color: CogniTheme.ink500,
                fontSize: 13,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
          Expanded(
            flex: 4,
            child: Text(
              value,
              style: GoogleFonts.inter(
                color: valueColor ?? CogniTheme.ink900,
                fontSize: 13,
                fontWeight: isBoldValue ? FontWeight.bold : FontWeight.w500,
              ),
              textAlign: TextAlign.right,
            ),
          ),
        ],
      ),
    );
  }
}

class YtdSummaryCard extends StatelessWidget {
  final String title;
  final List<YtdStatItem> stats;

  const YtdSummaryCard({
    super.key,
    required this.title,
    required this.stats,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 16, 16, 8),
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        gradient: CogniTheme.heroGradient,
        borderRadius: BorderRadius.circular(22),
        boxShadow: CogniTheme.shadowBrand,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: GoogleFonts.inter(
              color: Colors.white60,
              fontSize: 12,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: stats.asMap().entries.map((entry) {
              final idx = entry.key;
              final stat = entry.value;
              final showDivider = idx < stats.length - 1;

              return Expanded(
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        children: [
                          Text(
                            stat.value,
                            style: GoogleFonts.inter(
                              color: stat.valueColor ?? Colors.white,
                              fontSize: 18,
                              fontWeight: FontWeight.w800,
                            ),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 4),
                          Text(
                            stat.label,
                            style: GoogleFonts.inter(
                              color: Colors.white54,
                              fontSize: 11,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ],
                      ),
                    ),
                    if (showDivider)
                      Container(width: 1, height: 50, color: Colors.white24),
                  ],
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }
}

class YtdStatItem {
  final String label;
  final String value;
  final Color? valueColor;

  const YtdStatItem({
    required this.label,
    required this.value,
    this.valueColor,
  });
}
