import 'dart:async';
import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_diktup_utilities/extensions.dart';
import 'package:loyalcraft/src/data/consts.dart';

String translate(BuildContext context, String key) => AppLocalizations.of(context)!.translate(key);

class AppLocalizations {
  AppLocalizations(this.locale);
  final Locale locale;

  static AppLocalizations? of(BuildContext context) => Localizations.of<AppLocalizations>(context, AppLocalizations);

  static LocalizationsDelegate<AppLocalizations> delegate = _AppLocalizationsDelegate();

  late Map<String, String> _localizedStrings;

  Future<bool> load() async {
    var jsonString = await rootBundle.loadString(
      'locale/${locale.languageCode}.json',
      cache: false,
    );

    Map<String, dynamic> jsonMap = jsonDecode(jsonString);
    _localizedStrings = jsonMap.map((key, value) => MapEntry(key, '$value'));
    return true;
  }

  String translate(String? key) {
    var data = _localizedStrings[key] ?? (key ?? '');
    data = _convertToTitleCase(data);
    data = _convertFromUpperSnakeCase(data);
    data = _convertFromUpperCase(data);
    return data;
  }

  String _convertToTitleCase(String input) {
    var isCamelCase = RegExp(r'^[a-z]+(?:[A-Z][a-z]*)*$').hasMatch(input);
    if (isCamelCase) {
      final result = input.replaceAllMapped(RegExp('[A-Z]'), (match) => ' ${match.group(0)}').toLowerCase().trim();
      return result.capitalize();
    } else {
      return input;
    }
  }

  String _convertFromUpperSnakeCase(String input) {
    var isUpperSnakeCase = RegExp(r'^[A-Z0-9_]+$').hasMatch(input);
    if (isUpperSnakeCase) {
      var words = input.split('_');
      var transformed = words.map((e) => e.capitalize()).join(' ');
      return transformed;
    }
    return input;
  }

  String _convertFromUpperCase(String input) {
    if (input == input.toUpperCase()) {
      return input.capitalize();
    }
    return input;
  }
}

class _AppLocalizationsDelegate extends LocalizationsDelegate<AppLocalizations> {
  _AppLocalizationsDelegate();

  @override
  bool isSupported(Locale locale) => kLocaleList.contains(locale);

  @override
  Future<AppLocalizations> load(Locale locale) async {
    var localizations = AppLocalizations(locale);
    await localizations.load();
    return localizations;
  }

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}
