import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_diktup_utilities/extensions.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-card-user-card.graphql.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-loyalty-settings.graphql.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-quest-quest.graphql.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-wallet-transaction.graphql.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-wallet-wallet.graphql.dart';
import 'package:flutter_loyalcraft_gql/graphql/point-of-sale.graphql.dart';
import 'package:flutter_loyalcraft_gql/graphql/user.graphql.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:loyalcraft/src/bloc/home_tab_index.dart';
import 'package:loyalcraft/src/bloc/notification.dart';
import 'package:loyalcraft/src/data/consts.dart';
import 'package:loyalcraft/src/utils/utility.dart';
import 'package:shared_preferences/shared_preferences.dart';

Future<Locale> getLocaleFromSP() async {
  var sharedPreferences = await SharedPreferences.getInstance();
  var storedString = sharedPreferences.getString('locale') ?? '';
  return storedString.isEmpty ? kLocaleList.first : Locale(storedString.split('_').first, storedString.split('_').last);
}

Future<void> addLocaleToSP(Locale locale) async {
  var sharedPreferences = await SharedPreferences.getInstance();
  sharedPreferences.setString('locale', '${locale.languageCode}_${locale.countryCode}');
}

Future<bool> getIsFirstLoginFromSP() async {
  var sharedPreferences = await SharedPreferences.getInstance();
  return sharedPreferences.getBool('isFirstLogin') ?? true;
}

Future<void> addIsFirstLoginToSP(bool isFirstLogin) async {
  var sharedPreferences = await SharedPreferences.getInstance();
  sharedPreferences.setBool('isFirstLogin', isFirstLogin);
}

Future<String> getAccessTokenFromSP() async {
  var sharedPreferences = await SharedPreferences.getInstance();
  return sharedPreferences.getString('access_token') ?? '';
}

Future<void> addAccessTokenToSP(String accessToken) async {
  var sharedPreferences = await SharedPreferences.getInstance();
  sharedPreferences.setString('access_token', accessToken);
}

Future<DateTime?> getLastDateOfMessageSentFromSP() async {
  var sharedPreferences = await SharedPreferences.getInstance();
  var value = sharedPreferences.getString('lastDateOfMessageSentTo') ?? '';
  return value.isEmpty ? null : value.toDateTime();
}

Future<void> addLastDateOfMessageSentToSP(DateTime? lastDateOfMessageSentTo) async {
  var sharedPreferences = await SharedPreferences.getInstance();
  sharedPreferences.setString('lastDateOfMessageSentTo', '${lastDateOfMessageSentTo ?? ''}');
}

Future<LatLng> getLatLngFromSP() async {
  var sharedPreferences = await SharedPreferences.getInstance();
  final storedString = sharedPreferences.getString('location') ?? '0_0';
  return LatLng(storedString.split('_').first.toDouble(), storedString.split('_').last.toDouble());
}

Future<void> addLatLngToSP(LatLng latLng) async {
  var sharedPreferences = await SharedPreferences.getInstance();
  sharedPreferences.setString('location', '${latLng.latitude}_${latLng.longitude}');
}

Future<ThemeData> getThemeFromSP() async {
  var sharedPreferences = await SharedPreferences.getInstance();
  var string = sharedPreferences.getString('theme') ?? '';
  return getThemeDataFromString(locale: await getLocaleFromSP(), theme: string);
}

Future<void> addThemeToSP(String theme) async {
  var sharedPreferences = await SharedPreferences.getInstance();
  sharedPreferences.setString('theme', theme);
}

Future<int> getNotificationCountFromSP() async {
  var sharedPreferences = await SharedPreferences.getInstance();
  return sharedPreferences.getInt('notification_count') ?? 0;
}

Future<void> addNotificationCountToSP(int notificationCount) async {
  var sharedPreferences = await SharedPreferences.getInstance();
  sharedPreferences.setInt('notification_count', notificationCount);
}

Future<void> addHomeTabIndexToSP(int homeTabIndex) async {
  var sharedPreferences = await SharedPreferences.getInstance();
  sharedPreferences.setInt('home_tab_index', homeTabIndex);
}

Future<int> getHomeTabIndexFromSP() async {
  var sharedPreferences = await SharedPreferences.getInstance();
  return sharedPreferences.getInt('home_tab_index') ?? 0;
}

Future<Query$user$user?> getUserFromSP() async {
  var sharedPreferences = await SharedPreferences.getInstance();
  final storedString = sharedPreferences.getString('user') ?? '';
  return storedString.isEmpty ? null : Query$user$user.fromJson(jsonDecode(storedString));
}

Future<void> addUserToSP(Query$user$user? user) async {
  var sharedPreferences = await SharedPreferences.getInstance();
  kUserID = user?.id ?? '';
  await sharedPreferences.setString('user', user == null ? '' : jsonEncode(user.toJson()));
}

Future<Query$pointOfSale$pointOfSale?> getPosFromSP() async {
  var sharedPreferences = await SharedPreferences.getInstance();
  final storedString = sharedPreferences.getString('pos') ?? '';
  return storedString.isEmpty ? null : Query$pointOfSale$pointOfSale.fromJson(jsonDecode(storedString));
}

Future<void> addPosToSP(Query$pointOfSale$pointOfSale? pos) async {
  var sharedPreferences = await SharedPreferences.getInstance();
  await sharedPreferences.setString('pos', pos == null ? '' : jsonEncode(pos.toJson()));
}

Future<Query$findLoyaltySettingsByTarget$findLoyaltySettingsByTarget?> getLoyaltySettingsFromSP() async {
  var sharedPreferences = await SharedPreferences.getInstance();
  final storedString = sharedPreferences.getString('loyalty_settings');
  return storedString == null ? null : Query$findLoyaltySettingsByTarget$findLoyaltySettingsByTarget.fromJson(jsonDecode(storedString));
}

Future<void> addLoyaltySettingsToSP(
  Query$findLoyaltySettingsByTarget$findLoyaltySettingsByTarget? loyaltySettings,
) async {
  var sharedPreferences = await SharedPreferences.getInstance();
  await sharedPreferences.setString('loyalty_settings', loyaltySettings == null ? '' : jsonEncode(loyaltySettings.toJson()));
}

Future<void> addCurrentUserQuantitativeWalletsToSP(
  Query$getCurrentUserQuantitativeWallets$getCurrentUserQuantitativeWallets? widgetCurrentUserQuantitativeWallet,
) async {
  var sharedPreferences = await SharedPreferences.getInstance();
  await sharedPreferences.setString(
    'current_user_quantitative_wallet',
    widgetCurrentUserQuantitativeWallet == null ? '' : jsonEncode(widgetCurrentUserQuantitativeWallet.toJson()),
  );
}

Future<Query$getCurrentUserQuantitativeWallets$getCurrentUserQuantitativeWallets?> getCurrentUserQuantitativeWalletsFromSP() async {
  var sharedPreferences = await SharedPreferences.getInstance();
  var storedString = sharedPreferences.getString('current_user_quantitative_wallet');
  return storedString == null ? null : Query$getCurrentUserQuantitativeWallets$getCurrentUserQuantitativeWallets.fromJson(jsonDecode(storedString));
}

Future<void> addQuestsToSP(
  Query$getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated$getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated? getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated,
) async {
  var sharedPreferences = await SharedPreferences.getInstance();
  await sharedPreferences.setString(
    'get_quests_by_target_and_user_audience_with_linked_accounts_paginated',
    getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated == null ? '' : jsonEncode(getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated.toJson()),
  );
}

Future<Query$getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated$getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated?> getQuestsFromSP() async {
  var sharedPreferences = await SharedPreferences.getInstance();
  var storedString = sharedPreferences.getString('get_quests_by_target_and_user_audience_with_linked_accounts_paginated') ?? '';
  return storedString.isEmpty ? null : Query$getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated$getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated.fromJson(jsonDecode(storedString));
}

Future<void> addWalletTransactionsByAffectedToSP(
  Query$getWalletTransactionsByAffectedPaginated$getWalletTransactionsByAffectedPaginated? getWalletTransactionsByAffectedPaginated,
) async {
  var sharedPreferences = await SharedPreferences.getInstance();
  await sharedPreferences.setString(
    'get_wallet_transactions_by_affected_paginated',
    getWalletTransactionsByAffectedPaginated == null ? '' : jsonEncode(getWalletTransactionsByAffectedPaginated.toJson()),
  );
}

Future<Query$getWalletTransactionsByAffectedPaginated$getWalletTransactionsByAffectedPaginated?> getWalletTransactionsByAffectedFromSP() async {
  var sharedPreferences = await SharedPreferences.getInstance();
  var storedString = sharedPreferences.getString('get_wallet_transactions_by_affected_paginated') ?? '';
  return storedString.isEmpty ? null : Query$getWalletTransactionsByAffectedPaginated$getWalletTransactionsByAffectedPaginated.fromJson(jsonDecode(storedString));
}

Future<List<Query$getCorporateUserCardByUserAndTarget$getCorporateUserCardByUserAndTarget>> getCorporateUserCardByUserAndTargetFromSP() async {
  var sharedPreferences = await SharedPreferences.getInstance();
  var storedString = sharedPreferences.getString('corporate_user_card_by_user_and_target') ?? '';
  if (storedString.isNotEmpty) {
    List<dynamic> decodedList = jsonDecode(storedString);
    return decodedList.map((e) => Query$getCorporateUserCardByUserAndTarget$getCorporateUserCardByUserAndTarget.fromJson(e as Map<String, dynamic>)).toList();
  } else {
    return [];
  }
}

Future<void> addCorporateUserCardByUserAndTargetToSP(
  List<Query$getCorporateUserCardByUserAndTarget$getCorporateUserCardByUserAndTarget> corporateUserCardByUserAndTarget,
) async {
  var sharedPreferences = await SharedPreferences.getInstance();
  var listOfMaps = corporateUserCardByUserAndTarget.map((e) => e.toJson()).toList();
  await sharedPreferences.setString('corporate_user_card_by_user_and_target', jsonEncode(listOfMaps));
}

Future<void> clearSharedPrefs() async {
  var sharedPreferences = await SharedPreferences.getInstance();
  await sharedPreferences.clear();
}

Future<void> clearSharedPrefsByKey(String key) async {
  var sharedPreferences = await SharedPreferences.getInstance();
  await sharedPreferences.remove(key);
}

Future<void> signOut(BuildContext context) async {
  await addWalletTransactionsByAffectedToSP(null);
  await addNotificationCountToSP(0);
  await kGoogleSignIn.signOut();
  await addAccessTokenToSP('');
  await addHomeTabIndexToSP(0);
  await kFacebookAuth.logOut();
  await addQuestsToSP(null);
  await addUserToSP(null);
  kUserID = '';
  await BlocProvider.of<NotificationCountCubit>(context).updateValue(0);
  BlocProvider.of<HomeTabIndexCubit>(context).updateValue(0);

  Navigator.of(context).pushNamedAndRemoveUntil('/Onboarding', (route) => false);
}
