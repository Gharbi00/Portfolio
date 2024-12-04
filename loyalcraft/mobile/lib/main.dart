import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-card-user-card.graphql.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-loyalty-settings.graphql.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-wallet-wallet.graphql.dart';
import 'package:flutter_loyalcraft_gql/graphql/point-of-sale.graphql.dart';
import 'package:flutter_loyalcraft_gql/graphql/user.graphql.dart';
import 'package:loyalcraft/firebase_options.dart';
import 'package:loyalcraft/localizations_delegate/app_localizations.dart';
import 'package:loyalcraft/src/bloc/connectivity.dart';
import 'package:loyalcraft/src/bloc/home_tab_index.dart';
import 'package:loyalcraft/src/bloc/locale.dart';
import 'package:loyalcraft/src/bloc/loyalty_settings.dart';
import 'package:loyalcraft/src/bloc/notification.dart';
import 'package:loyalcraft/src/bloc/pos.dart';
import 'package:loyalcraft/src/bloc/theme.dart';
import 'package:loyalcraft/src/bloc/user.dart';
import 'package:loyalcraft/src/bloc/user_card.dart';
import 'package:loyalcraft/src/bloc/wallet.dart';
import 'package:loyalcraft/src/data/consts.dart';
import 'package:loyalcraft/src/data/graphql_client.dart';
import 'package:loyalcraft/src/repository/loyalty_settings.dart';
import 'package:loyalcraft/src/repository/pos.dart';
import 'package:loyalcraft/src/repository/user.dart';
import 'package:loyalcraft/src/repository/user_card.dart';
import 'package:loyalcraft/src/repository/wallet.dart';
import 'package:loyalcraft/src/screens/error.dart';
import 'package:loyalcraft/src/screens/onboarding.dart';
import 'package:loyalcraft/src/screens/sign_in.dart';
import 'package:loyalcraft/src/screens/sign_up.dart';
import 'package:loyalcraft/src/screens/tabs.dart';
import 'package:loyalcraft/src/utils/navigation_service.dart';
import 'package:loyalcraft/src/utils/utility.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);

  ErrorWidget.builder = (details) => const ErrorDefaultWidget();
  runApp(
    StreamBuilder(
      stream: SharedPreferences.getInstance().asStream(),
      builder: (context, snapshot) {
        final sGraphQLClient = SGraphQLClient();
        final _connectivity = Connectivity();
        var sharedPreferences = snapshot.data;
        final locale = sharedPreferences?.getString('locale') ?? '';
        final theme = sharedPreferences?.getString('theme') ?? '';
        final user = sharedPreferences?.getString('user') ?? '';
        final pos = sharedPreferences?.getString('pos') ?? '';
        final notificationCount = sharedPreferences?.getInt('notification_count') ?? 0;
        final loyaltySettings = sharedPreferences?.getString('loyalty_settings') ?? '';
        final corporateUserCard = sharedPreferences?.getString('corporate_user_card_by_user_and_target') ?? '';
        final currentUserQuantitativeWallet = sharedPreferences?.getString('current_user_quantitative_wallet') ?? '';
        final homeTabIndex = sharedPreferences?.getInt('home_tab_index') ?? 0;
        final loyaltySettingsByTarget = getLoyaltySettingsFromString(loyaltySettings);
        final corporateUserCardByUserAndTarget = getCorporateUserCardByUserAndTarget(corporateUserCard);
        final userQuantitativeWallet = getCurrentUserQuantitativeWalletsString(currentUserQuantitativeWallet);

        return snapshot.hasData == false
            ? const SizedBox()
            : MultiBlocProvider(
                providers: [
                  BlocProvider(create: (context) => FindCurrentLoyaltySettingsCubit(LoyaltySettingsRepository(sGraphQLClient))..setLoyaltySettingsByTarget(loyaltySettingsByTarget)),
                  BlocProvider(create: (context) => CurrentUserQuantitativeWalletsCubit(WalletRepository(sGraphQLClient))..setQuantitativeWallets(userQuantitativeWallet)),
                  BlocProvider(create: (context) => ThemeCubit(getThemeDataFromString(locale: getLocaleFromString(locale), theme: theme))),
                  BlocProvider(create: (context) => UserCubit(UserRepository(sGraphQLClient))..setUser(getUserFromString(user))),
                  BlocProvider(create: (context) => PosCubit(PosRepository(sGraphQLClient))..setPos(getPosFromString(pos))),
                  BlocProvider(create: (context) => NotificationCountCubit(value: notificationCount)),
                  BlocProvider(create: (context) => LocaleCubit(getLocaleFromString(locale))),
                  BlocProvider(create: (context) => ConnectivityCubit(_connectivity)),
                  BlocProvider(create: (context) => HomeTabIndexCubit(value: homeTabIndex)),
                  BlocProvider(
                    create: (context) => GetCorporateUserCardByUserAndTargetCubit(UserCardRepository(sGraphQLClient))..setCorporateUserCardByUserAndTarget(corporateUserCardByUserAndTarget),
                  ),
                ],
                child: BlocBuilder<GetCorporateUserCardByUserAndTargetCubit, List<Query$getCorporateUserCardByUserAndTarget$getCorporateUserCardByUserAndTarget>?>(
                  builder: (context, getCorporateUserCardByUserAndTarget) => BlocBuilder<FindCurrentLoyaltySettingsCubit, Query$findLoyaltySettingsByTarget$findLoyaltySettingsByTarget?>(
                    builder: (context, findLoyaltySettingsByTarget) => BlocBuilder<UserCubit, Query$user$user?>(
                      builder: (context, user) => BlocBuilder<NotificationCountCubit, int>(
                        builder: (context, notificationCount) => BlocBuilder<PosCubit, Query$pointOfSale$pointOfSale?>(
                          builder: (context, pos) => BlocBuilder<ThemeCubit, ThemeData>(
                            builder: (context, themeData) => BlocBuilder<CurrentUserQuantitativeWalletsCubit, Query$getCurrentUserQuantitativeWallets$getCurrentUserQuantitativeWallets?>(
                              builder: (context, currentUserQuantitativeWallet) => BlocBuilder<LocaleCubit, Locale>(
                                builder: (context, locale) => BlocBuilder<ConnectivityCubit, bool>(
                                  builder: (context, data) => MyApp(
                                    themeData: themeData,
                                    locale: locale,
                                    user: user,
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              );
      },
    ),
  );
}

// ignore: must_be_immutable
class MyApp extends StatelessWidget {
  MyApp({
    Key? key,
    required this.themeData,
    required this.locale,
    required this.user,
  }) : super(key: key);

  Query$user$user? user;
  ThemeData themeData;
  Locale locale;

  @override
  Widget build(BuildContext context) => MaterialApp(
        navigatorKey: NavigationService().navigatorKey,
        debugShowCheckedModeBanner: false,
        supportedLocales: kLocaleList,
        theme: themeData,
        locale: locale,
        localizationsDelegates: [
          GlobalCupertinoLocalizations.delegate,
          GlobalMaterialLocalizations.delegate,
          GlobalWidgetsLocalizations.delegate,
          AppLocalizations.delegate,
        ],
        onGenerateRoute: (routeSettings) {
          switch (routeSettings.name) {
            case '/SignIn':
              return MaterialPageRoute(builder: (_) => SignInWidget());
            case '/Onboarding':
              return MaterialPageRoute(builder: (_) => const OnboardingWidget());
            case '/SignUp':
              return MaterialPageRoute(builder: (_) => const SignUpWidget());
            case '/Tabs':
              return MaterialPageRoute(builder: (_) => const TabsWidget());
            default:
              return MaterialPageRoute(builder: (_) => const OnboardingWidget());
          }
        },
      );
}
