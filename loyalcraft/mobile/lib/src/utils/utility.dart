import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_diktup_utilities/extensions.dart';
import 'package:flutter_diktup_utilities/flutter_diktup_utilities.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-card-user-card.graphql.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-loyalty-settings.graphql.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-wallet-wallet.graphql.dart';
import 'package:flutter_loyalcraft_gql/graphql/point-of-sale.graphql.dart';
import 'package:flutter_loyalcraft_gql/graphql/user.graphql.dart';
import 'package:flutter_loyalcraft_gql/schema.graphql.dart';
import 'package:loyalcraft/src/data/consts.dart';
import 'package:loyalcraft/src/utils/theme.dart';

ThemeData getThemeDataFromString({required Locale locale, required String theme}) {
  final themeUtils = ThemeUtils(locale: locale);
  if (theme == Enum$MobileThemesEnum.DARK.name.toLowerCase()) {
    return themeUtils.darkTheme;
  }
  if (theme == Enum$MobileThemesEnum.LIGHT.name.toLowerCase()) {
    return themeUtils.lightTheme;
  }
  return getSystemThemeData(themeUtils.darkTheme, themeUtils.lightTheme);
}

Query$pointOfSale$pointOfSale? getPosFromString(String? string) => string.removeNull().isEmpty ? null : Query$pointOfSale$pointOfSale.fromJson(jsonDecode(string.removeNull()));

Query$user$user? getUserFromString(String? string) => string.removeNull().isEmpty ? null : Query$user$user.fromJson(jsonDecode(string.removeNull()));

Query$findLoyaltySettingsByTarget$findLoyaltySettingsByTarget? getLoyaltySettingsFromString(String? string) =>
    string.removeNull().isEmpty ? null : Query$findLoyaltySettingsByTarget$findLoyaltySettingsByTarget.fromJson(jsonDecode(string.removeNull()));

Query$getCurrentUserQuantitativeWallets$getCurrentUserQuantitativeWallets? getCurrentUserQuantitativeWalletsString(String? string) =>
    string.removeNull().isEmpty ? null : Query$getCurrentUserQuantitativeWallets$getCurrentUserQuantitativeWallets.fromJson(jsonDecode(string.removeNull()));

List<Query$getCorporateUserCardByUserAndTarget$getCorporateUserCardByUserAndTarget> getCorporateUserCardByUserAndTarget(String? string) {
  if (string.removeNull().isEmpty) {
    return [];
  } else {
    List decodedList = jsonDecode(string.removeNull());

    return decodedList
        .map(
          (e) => Query$getCorporateUserCardByUserAndTarget$getCorporateUserCardByUserAndTarget.fromJson(
            e as Map<String, dynamic>,
          ),
        )
        .toList();
  }
}

Locale getLocaleFromString(String string) {
  if (string.isEmpty || string.contains('_') == false) {
    return kLocaleList.first;
  } else {
    var locale = Locale(string.split('_').first, string.split('_').last);
    return kLocaleList.firstWhere(
      (element) => element == locale,
      orElse: () => kLocaleList.first,
    );
  }
}

// void playNotification() => FlutterRingtonePlayer().play(fromAsset: 'sound/notification.mp3', asAlarm: true);
