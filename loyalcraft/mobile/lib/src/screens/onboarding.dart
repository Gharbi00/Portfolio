import 'dart:io';

import 'package:carousel_slider/carousel_slider.dart' as carousel_slider;
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_diktup_utilities/extensions.dart';
import 'package:flutter_diktup_utilities/flutter_diktup_utilities.dart';
import 'package:flutter_facebook_auth/flutter_facebook_auth.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-card-user-card.graphql.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-loyalty-settings.graphql.dart';
import 'package:flutter_loyalcraft_gql/graphql/point-of-sale.graphql.dart';
import 'package:flutter_loyalcraft_gql/graphql/user.graphql.dart';
import 'package:flutter_loyalcraft_gql/schema.graphql.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:loyalcraft/localizations_delegate/app_localizations.dart';
import 'package:loyalcraft/src/bloc/connectivity.dart';
import 'package:loyalcraft/src/bloc/home_tab_index.dart';
import 'package:loyalcraft/src/bloc/locale.dart';
import 'package:loyalcraft/src/bloc/loyalty_settings.dart';
import 'package:loyalcraft/src/bloc/pos.dart';
import 'package:loyalcraft/src/bloc/theme.dart';
import 'package:loyalcraft/src/bloc/user.dart';
import 'package:loyalcraft/src/bloc/variable.dart';
import 'package:loyalcraft/src/data/app_links_utils.dart';
import 'package:loyalcraft/src/data/app_utils.dart';
import 'package:loyalcraft/src/data/consts.dart';
import 'package:loyalcraft/src/data/firebase_notification_utils.dart';
import 'package:loyalcraft/src/data/flutter_messenger.dart';
import 'package:loyalcraft/src/data/graphql_client.dart';
import 'package:loyalcraft/src/data/shared_preferences.dart';
import 'package:loyalcraft/src/repository/pos.dart';
import 'package:loyalcraft/src/repository/quest.dart';
import 'package:loyalcraft/src/repository/user.dart';
import 'package:loyalcraft/src/repository/user_card.dart';
import 'package:loyalcraft/src/screens/sign_in.dart';
import 'package:loyalcraft/src/screens/tabs.dart';
import 'package:loyalcraft/src/utils/image_cache_manager/custom_flutter_image_cache_manager.dart';
import 'package:loyalcraft/src/utils/image_cache_manager/shared_image_provider.dart';
import 'package:loyalcraft/src/utils/navigation_service.dart';
import 'package:loyalcraft/src/utils/utility.dart';
import 'package:sign_in_with_apple/sign_in_with_apple.dart';

// ignore: must_be_immutable
class OnboardingWidget extends StatefulWidget {
  const OnboardingWidget({
    Key? key,
  }) : super(key: key);

  @override
  _OnboardingWidget createState() => _OnboardingWidget();
}

class _OnboardingWidget extends State<OnboardingWidget> {
  final SGraphQLClient _sGraphQLClient = SGraphQLClient();
  late UserCardRepository _userCardRepository;
  late VariableCubit<bool> _isLoadingCubit;
  late VariableCubit<int> _pageIndexCubit;
  late QuestRepository _questRepository;
  late UserRepository _userRepository;
  late PosRepository _posRepository;

  Future<void> _initState() async {
    _userCardRepository = UserCardRepository(_sGraphQLClient);
    _questRepository = QuestRepository(_sGraphQLClient);
    _userRepository = UserRepository(_sGraphQLClient);
    _posRepository = PosRepository(_sGraphQLClient);
    _isLoadingCubit = VariableCubit(value: false);
    _pageIndexCubit = VariableCubit(value: 0);
    exitTheFullScreen();
    await CustomFlutterImageCacheManager.clearOldCache();
    await AppUtils.initDialCodeList();
    final user = await getUserFromSP();
    BlocProvider.of<ConnectivityCubit>(context).init();
    await BlocProvider.of<PosCubit>(context).pointOfSale(Variables$Query$pointOfSale(id: kPosID));
    await BlocProvider.of<FindCurrentLoyaltySettingsCubit>(context).findLoyaltySettingsByTarget(
      Variables$Query$findLoyaltySettingsByTarget(
        target: Input$TargetACIInput(
          pos: kPosID,
        ),
      ),
    );

    WidgetsBinding.instance.addPostFrameCallback((_) async {
      kBuildContext = NavigationService().navigatorKey.currentContext;
      await listenToUriLinkStrem(
        userCardRepository: _userCardRepository,
        questRepository: _questRepository,
        posRepository: _posRepository,
      );
      if (user != null) {
        await initializeFCMToken(userRepository: _userRepository);
        await listenToBackgroundNotification();
        await listenToForegroundNotification();
        await subscribeToTopics();
        await requestFCMNotificationPermissions();
      }
    });
  }

  @override
  void dispose() {
    _pageIndexCubit.close();

    _isLoadingCubit.close();
    super.dispose();
  }

  @override
  void initState() {
    super.initState();
    if (mounted) {
      _initState();
    }
  }

  @override
  Widget build(BuildContext context) {
    final _user = context.watch<UserCubit>().state;
    kAppSize = MediaQuery.sizeOf(context);
    return _user != null
        ? const TabsWidget()
        : MultiBlocProvider(
            providers: [
              BlocProvider(create: (context) => _pageIndexCubit),
              BlocProvider(create: (context) => _isLoadingCubit),
            ],
            child: BlocBuilder<VariableCubit, dynamic>(
              bloc: _isLoadingCubit,
              builder: (context, isLoading) => BlocBuilder<VariableCubit, dynamic>(
                bloc: _pageIndexCubit,
                builder: (context, pageIndex) => AnnotatedRegion<SystemUiOverlayStyle>(
                  value: SystemUiOverlayStyle.light,
                  child: Scaffold(
                    backgroundColor: kOnboardingList[pageIndex].color,
                    extendBodyBehindAppBar: true,
                    extendBody: true,
                    body: SafeArea(
                      left: false,
                      right: false,
                      child: carousel_slider.CarouselSlider.builder(
                        itemCount: kOnboardingList.length,
                        options: carousel_slider.CarouselOptions(
                          onPageChanged: (index, changedReason) => _pageIndexCubit.updateValue(index),
                          height: double.infinity,
                          viewportFraction: 1.0,
                        ),
                        itemBuilder: (context, itemIndex, pageViewIndex) => Center(
                          child: LayoutBuilder(
                            builder: (context, raints) => SingleChildScrollView(
                              padding: const EdgeInsets.all(16.0),
                              child: ConstrainedBox(
                                constraints: BoxConstraints(minHeight: raints.maxHeight),
                                child: Column(
                                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                                  children: [
                                    Column(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        Wrap(
                                          spacing: 8.0,
                                          runSpacing: 8.0,
                                          crossAxisAlignment: WrapCrossAlignment.center,
                                          runAlignment: WrapAlignment.center,
                                          alignment: WrapAlignment.center,
                                          children: List.generate(
                                            kOnboardingList.length,
                                            (index) => Container(
                                              height: 4.0,
                                              width: 40.0,
                                              decoration: BoxDecoration(
                                                color: pageIndex == index ? Colors.white : Colors.white.withOpacity(0.6),
                                                borderRadius: BorderRadius.circular(100.0),
                                              ),
                                            ),
                                          ),
                                        ),
                                        const SizedBox(height: 8.0),
                                        Text(
                                          translate(context, kOnboardingList[pageIndex].title),
                                          textAlign: TextAlign.center,
                                          style: Theme.of(context).textTheme.displayMedium?.copyWith(
                                                color: Colors.white,
                                                fontSize: 32.0,
                                              ),
                                        ),
                                        const SizedBox(height: 8.0),
                                        Text(
                                          translate(context, kOnboardingList.elementAt(pageIndex).description ?? ''),
                                          textAlign: TextAlign.center,
                                          style: Theme.of(context).textTheme.bodyMedium!.copyWith(
                                                color: Colors.white,
                                              ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 8.0),
                                    SharedImageProviderWidget(
                                      imageUrl: kOnboardingList[itemIndex].image ?? '',
                                      height: kAppSize.width / 2.0,
                                      width: kAppSize.width / 2.0,
                                      fit: BoxFit.cover,
                                    ),
                                    Column(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        if (Platform.isIOS)
                                          Padding(
                                            padding: const EdgeInsets.only(top: 8.0),
                                            child: Opacity(
                                              opacity: isLoading ? 0.5 : 1.0,
                                              child: TextButton(
                                                style: TextButton.styleFrom(
                                                  minimumSize: const Size.fromHeight(40.0),
                                                  backgroundColor: Colors.black,
                                                  shape: RoundedRectangleBorder(
                                                    borderRadius: BorderRadius.circular(8.0),
                                                  ),
                                                ),
                                                onPressed: () async {
                                                  var authorizationCredentialAppleID = await SignInWithApple.getAppleIDCredential(
                                                    scopes: [
                                                      AppleIDAuthorizationScopes.email,
                                                      AppleIDAuthorizationScopes.fullName,
                                                    ],
                                                  );
                                                  _isLoadingCubit.updateValue(true);
                                                  final loginWithAppleForTarget = await _userCardRepository
                                                      .loginWithAppleForTarget(
                                                    Variables$Query$loginWithAppleForTarget(
                                                      authorizationData: Input$AuthorizationDataInput(
                                                        authorizationCode: authorizationCredentialAppleID.authorizationCode.removeNull(),
                                                        userIdentifier: authorizationCredentialAppleID.userIdentifier.removeNull(),
                                                        identityToken: authorizationCredentialAppleID.identityToken.removeNull(),
                                                        familyName: authorizationCredentialAppleID.familyName.removeNull(),
                                                        givenName: authorizationCredentialAppleID.givenName.removeNull(),
                                                        email: authorizationCredentialAppleID.email.removeNull(),
                                                        state: authorizationCredentialAppleID.state.removeNull(),
                                                      ),
                                                      target: Input$TargetACIInput(
                                                        pos: kPosID,
                                                      ),
                                                    ),
                                                  )
                                                      .catchError((onError) {
                                                    _isLoadingCubit.updateValue(false);
                                                    return null;
                                                  });
                                                  _isLoadingCubit.updateValue(false);
                                                  if (loginWithAppleForTarget?.user == null) {
                                                    FlutterMessenger.showSnackbar(context: context, string: translate(context, 'generalErrorMessage'));
                                                  } else {
                                                    addHomeTabIndexToSP(0);
                                                    addAccessTokenToSP(loginWithAppleForTarget!.accessToken);
                                                    BlocProvider.of<HomeTabIndexCubit>(context).updateValue(0);
                                                    BlocProvider.of<UserCubit>(context).setUser(Query$user$user.fromJson(loginWithAppleForTarget.user.toJson()));
                                                    BlocProvider.of<ThemeCubit>(context).setTheme(
                                                      getThemeDataFromString(
                                                        locale: getLocaleFromString(loginWithAppleForTarget.user.locale ?? ''),
                                                        theme: loginWithAppleForTarget.user.mobileTheme?.name ?? '',
                                                      ),
                                                    );
                                                    BlocProvider.of<LocaleCubit>(context).setLocale(getLocaleFromString(loginWithAppleForTarget.user.locale ?? ''));
                                                    Navigator.of(context).pushNamedAndRemoveUntil('/Tabs', (route) => false);
                                                  }
                                                },
                                                child: Wrap(
                                                  crossAxisAlignment: WrapCrossAlignment.center,
                                                  spacing: 4.0,
                                                  runSpacing: 4.0,
                                                  children: [
                                                    SharedImageProviderWidget(
                                                      imageUrl: kApple,
                                                      fit: BoxFit.cover,
                                                      height: 18.0,
                                                      color: Colors.white,
                                                      width: 18.0,
                                                    ),
                                                    Text(
                                                      translate(context, 'continueWithApple'),
                                                      textAlign: TextAlign.center,
                                                      style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                                                            color: Colors.white,
                                                          ),
                                                    ),
                                                  ],
                                                ),
                                              ),
                                            ),
                                          ),
                                        if (Platform.isIOS)
                                          Padding(
                                            padding: const EdgeInsets.only(top: 8.0),
                                            child: Opacity(
                                              opacity: isLoading ? 0.5 : 1.0,
                                              child: TextButton(
                                                style: TextButton.styleFrom(
                                                  minimumSize: const Size.fromHeight(40.0),
                                                  backgroundColor: kFacebookBlueColor,
                                                  shape: RoundedRectangleBorder(
                                                    borderRadius: BorderRadius.circular(8.0),
                                                  ),
                                                ),
                                                onPressed: () async {
                                                  kFacebookAuth.logOut();
                                                  var loginResult = await kFacebookAuth.login(
                                                    permissions: [
                                                      'email',
                                                      'public_profile',
                                                    ],
                                                  );
                                                  if (loginResult.status == LoginStatus.success) {
                                                    _isLoadingCubit.updateValue(true);
                                                    final accessToken = loginResult.accessToken;
                                                    final loginWithFacebookForTarget = await _userCardRepository
                                                        .loginWithFacebookForTarget(
                                                      Variables$Query$loginWithFacebookForTarget(
                                                        token: accessToken?.tokenString ?? '',
                                                        target: Input$TargetACIInput(
                                                          pos: kPosID,
                                                        ),
                                                      ),
                                                    )
                                                        .catchError((onError) {
                                                      _isLoadingCubit.updateValue(false);
                                                      return null;
                                                    });
                                                    _isLoadingCubit.updateValue(false);
                                                    if (loginWithFacebookForTarget?.user == null) {
                                                      FlutterMessenger.showSnackbar(context: context, string: translate(context, 'generalErrorMessage'));
                                                    } else {
                                                      addHomeTabIndexToSP(0);
                                                      addAccessTokenToSP(loginWithFacebookForTarget!.accessToken);
                                                      BlocProvider.of<HomeTabIndexCubit>(context).updateValue(0);
                                                      BlocProvider.of<UserCubit>(context).setUser(Query$user$user.fromJson(loginWithFacebookForTarget.user.toJson()));
                                                      BlocProvider.of<ThemeCubit>(context).setTheme(
                                                        getThemeDataFromString(
                                                          locale: getLocaleFromString(loginWithFacebookForTarget.user.locale ?? ''),
                                                          theme: loginWithFacebookForTarget.user.mobileTheme?.name ?? '',
                                                        ),
                                                      );
                                                      BlocProvider.of<LocaleCubit>(context).setLocale(getLocaleFromString(loginWithFacebookForTarget.user.locale ?? ''));
                                                      Navigator.of(context).pushNamedAndRemoveUntil('/Tabs', (route) => false);
                                                    }
                                                  }
                                                },
                                                child: Wrap(
                                                  crossAxisAlignment: WrapCrossAlignment.center,
                                                  spacing: 4.0,
                                                  runSpacing: 4.0,
                                                  children: [
                                                    SvgPicture.network(
                                                      kFacebook,
                                                      height: 18.0,
                                                      colorFilter: const ColorFilter.mode(
                                                        Colors.white,
                                                        BlendMode.srcIn,
                                                      ),
                                                    ),
                                                    Text(
                                                      translate(context, 'continueWithFacebook'),
                                                      textAlign: TextAlign.center,
                                                      style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                                                            color: Colors.white,
                                                          ),
                                                    ),
                                                  ],
                                                ),
                                              ),
                                            ),
                                          ),
                                        const SizedBox(height: 8.0),
                                        Opacity(
                                          opacity: isLoading ? 0.5 : 1.0,
                                          child: TextButton(
                                            style: TextButton.styleFrom(
                                              minimumSize: const Size.fromHeight(40.0),
                                              backgroundColor: Colors.white,
                                              shape: RoundedRectangleBorder(
                                                borderRadius: BorderRadius.circular(8.0),
                                              ),
                                            ),
                                            onPressed: () async {
                                              await kGoogleSignIn.signOut();
                                              final googleSignInAccount = await kGoogleSignIn.signIn();
                                              final googleSignInAuthentication = await googleSignInAccount?.authentication;
                                              print(googleSignInAuthentication?.accessToken);
                                              print(googleSignInAccount?.displayName);
                                              print(googleSignInAccount?.email);
                                              print(googleSignInAccount?.photoUrl);
                                              if (googleSignInAccount != null && googleSignInAuthentication != null) {
                                                _isLoadingCubit.updateValue(true);
                                                final loginWithGoogleForTarget = await _userCardRepository
                                                    .loginWithGoogleForTarget(
                                                  Variables$Query$loginWithGoogleForTarget(
                                                    token: googleSignInAuthentication.accessToken.removeNull(),
                                                    target: Input$TargetACIInput(
                                                      pos: kPosID,
                                                    ),
                                                  ),
                                                )
                                                    .catchError((onError) {
                                                  _isLoadingCubit.updateValue(false);
                                                  return null;
                                                });
                                                _isLoadingCubit.updateValue(false);
                                                if (loginWithGoogleForTarget?.user == null) {
                                                  FlutterMessenger.showSnackbar(context: context, string: translate(context, 'generalErrorMessage'));
                                                } else {
                                                  addHomeTabIndexToSP(0);
                                                  addAccessTokenToSP(loginWithGoogleForTarget!.accessToken);
                                                  BlocProvider.of<HomeTabIndexCubit>(context).updateValue(0);
                                                  BlocProvider.of<UserCubit>(context).setUser(Query$user$user.fromJson(loginWithGoogleForTarget.user.toJson()));
                                                  BlocProvider.of<ThemeCubit>(context).setTheme(
                                                    getThemeDataFromString(
                                                      locale: getLocaleFromString(loginWithGoogleForTarget.user.locale ?? ''),
                                                      theme: loginWithGoogleForTarget.user.mobileTheme?.name ?? '',
                                                    ),
                                                  );
                                                  BlocProvider.of<LocaleCubit>(context).setLocale(getLocaleFromString(loginWithGoogleForTarget.user.locale ?? ''));
                                                  Navigator.of(context).pushNamedAndRemoveUntil('/Tabs', (route) => false);
                                                }
                                              }
                                            },
                                            child: Wrap(
                                              crossAxisAlignment: WrapCrossAlignment.center,
                                              spacing: 4.0,
                                              runSpacing: 4.0,
                                              children: [
                                                SharedImageProviderWidget(
                                                  imageUrl: kGoogle,
                                                  fit: BoxFit.cover,
                                                  height: 18.0,
                                                  width: 18.0,
                                                ),
                                                Text(
                                                  translate(context, 'continueWithGoogle'),
                                                  textAlign: TextAlign.center,
                                                  style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                                                        color: Colors.black,
                                                      ),
                                                ),
                                              ],
                                            ),
                                          ),
                                        ),
                                        const SizedBox(height: 8.0),
                                        TextButton(
                                          style: TextButton.styleFrom(
                                            minimumSize: const Size.fromHeight(40.0),
                                            backgroundColor: Colors.grey[900],
                                            shape: RoundedRectangleBorder(
                                              borderRadius: BorderRadius.circular(8.0),
                                            ),
                                          ),
                                          onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (context) => SignInWidget())),
                                          child: Wrap(
                                            crossAxisAlignment: WrapCrossAlignment.center,
                                            spacing: 4.0,
                                            runSpacing: 4.0,
                                            children: [
                                              SharedImageProviderWidget(
                                                imageUrl: kAppIcon,
                                                fit: BoxFit.cover,
                                                height: 18.0,
                                                width: 18.0,
                                              ),
                                              Text(
                                                translate(context, 'continueWithLoyalcraft'),
                                                textAlign: TextAlign.center,
                                                style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                                                      color: Colors.white,
                                                    ),
                                              ),
                                            ],
                                          ),
                                        ),
                                        const SizedBox(height: 8.0),
                                        Align(
                                          child: GestureDetector(
                                            child: RichText(
                                              textAlign: TextAlign.center,
                                              text: TextSpan(
                                                children: [
                                                  TextSpan(
                                                    text: '${translate(context, 'ByContinuingIAgreeToThe')} ',
                                                    style: Theme.of(context).textTheme.bodyMedium!.copyWith(
                                                          color: Colors.white,
                                                        ),
                                                  ),
                                                  TextSpan(
                                                    recognizer: TapGestureRecognizer()..onTap = () => openUrl(kTermsOfUseUrl),
                                                    text: translate(context, 'termsOfUse'),
                                                    style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                                                          color: Colors.white,
                                                        ),
                                                  ),
                                                  TextSpan(
                                                    text: ' ${translate(context, 'and')} ',
                                                    style: Theme.of(context).textTheme.bodyMedium!.copyWith(
                                                          color: Colors.white,
                                                        ),
                                                  ),
                                                  TextSpan(
                                                    recognizer: TapGestureRecognizer()..onTap = () => openUrl(kPrivacyPolicyUrl),
                                                    text: translate(context, 'privacyPolicy'),
                                                    style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                                                          color: Colors.white,
                                                        ),
                                                  ),
                                                  TextSpan(
                                                    text: '.',
                                                    style: Theme.of(context).textTheme.bodyMedium!.copyWith(
                                                          color: Colors.white,
                                                        ),
                                                  ),
                                                ],
                                              ),
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ],
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
            ),
          );
  }
}
