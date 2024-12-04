import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:loyalcraft/src/data/consts.dart';

class ThemeUtils {
  ThemeUtils({required this.locale});
  final Locale locale;

  ThemeData get darkTheme => ThemeData(
        appBarTheme: const AppBarTheme(
          systemOverlayStyle: SystemUiOverlayStyle.light,
          backgroundColor: Colors.black,
          scrolledUnderElevation: 0,
        ),
        focusColor: kAccentDarkColor.withOpacity(0.6),
        scaffoldBackgroundColor: Colors.black,
        primaryColor: Colors.black,
        brightness: Brightness.dark,
        fontFamily: 'Mulish',
        colorScheme: ColorScheme(
          secondaryContainer: Colors.white,
          primaryContainer: Colors.white,
          brightness: Brightness.dark,
          onSecondary: Colors.black,
          secondary: Colors.white,
          onSurface: Colors.black,
          onPrimary: Colors.black,
          error: Colors.red[800]!,
          surface: Colors.white,
          primary: Colors.white,
          onError: Colors.black,
        ),
        textTheme: TextTheme(
          displayMedium: TextStyle(
            fontSize: locale == kLocaleList.last ? 28.0 : 26.0,
            fontWeight: FontWeight.w800,
            color: kMainDarkColor.withOpacity(1.0),
          ),
          headlineSmall: TextStyle(
            fontSize: locale == kLocaleList.last ? 20.0 : 18.0,
            fontWeight: FontWeight.w600,
            color: kMainDarkColor.withOpacity(1.0),
          ),
          displayLarge: TextStyle(
            fontSize: locale == kLocaleList.last ? 30.0 : 28.0,
            fontWeight: FontWeight.w400,
            color: kMainDarkColor.withOpacity(1.0),
          ),
          bodyMedium: TextStyle(
            fontSize: locale == kLocaleList.last ? 17.0 : 16.0,
            fontWeight: FontWeight.w500,
            color: kMainDarkColor.withOpacity(1.0),
          ),
          bodyLarge: TextStyle(
            fontSize: locale == kLocaleList.last ? 17.0 : 16.0,
            fontWeight: FontWeight.w700,
            color: kMainDarkColor.withOpacity(1.0),
          ),
          bodySmall: TextStyle(
            fontSize: locale == kLocaleList.last ? 16.0 : 15.0,
            fontWeight: FontWeight.w600,
            color: kMainDarkColor.withOpacity(0.6),
          ),
        ),
      );
  ThemeData get lightTheme => ThemeData(
        appBarTheme: const AppBarTheme(
          systemOverlayStyle: SystemUiOverlayStyle.dark,
          backgroundColor: Colors.white,
          scrolledUnderElevation: 0,
        ),
        focusColor: kAccentColor.withOpacity(0.6),
        scaffoldBackgroundColor: Colors.white,
        brightness: Brightness.light,
        primaryColor: Colors.white,
        fontFamily: 'Mulish',
        colorScheme: ColorScheme(
          secondaryContainer: Colors.black,
          primaryContainer: Colors.black,
          brightness: Brightness.light,
          onSecondary: Colors.white,
          secondary: Colors.black,
          onSurface: Colors.white,
          onPrimary: Colors.white,
          error: Colors.red[800]!,
          surface: Colors.black,
          primary: Colors.black,
          onError: Colors.white,
        ),
        textTheme: TextTheme(
          displayMedium: TextStyle(
            fontSize: locale == kLocaleList.last ? 28.0 : 26.0,
            fontWeight: FontWeight.w800,
            color: kMainColor.withOpacity(1.0),
          ),
          headlineSmall: TextStyle(
            fontSize: locale == kLocaleList.last ? 20.0 : 18.0,
            fontWeight: FontWeight.w600,
            color: kMainColor.withOpacity(1.0),
          ),
          displayLarge: TextStyle(
            fontSize: locale == kLocaleList.last ? 30.0 : 28.0,
            fontWeight: FontWeight.w400,
            color: kMainColor.withOpacity(1.0),
          ),
          bodyMedium: TextStyle(
            fontSize: locale == kLocaleList.last ? 17.0 : 16.0,
            fontWeight: FontWeight.w500,
            color: kMainColor.withOpacity(1.0),
          ),
          bodyLarge: TextStyle(
            fontSize: locale == kLocaleList.last ? 17.0 : 16.0,
            fontWeight: FontWeight.w700,
            color: kMainColor.withOpacity(1.0),
          ),
          bodySmall: TextStyle(
            fontSize: locale == kLocaleList.last ? 16.0 : 15.0,
            fontWeight: FontWeight.w600,
            color: kMainColor.withOpacity(0.6),
          ),
        ),
      );
}
