import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_diktup_utilities/flutter_diktup_utilities.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-card-user-card.graphql.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-loyalty-settings.graphql.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-wallet-wallet.graphql.dart';
import 'package:flutter_loyalcraft_gql/graphql/point-of-sale.graphql.dart';
import 'package:flutter_loyalcraft_gql/graphql/user.graphql.dart';
import 'package:flutter_loyalcraft_gql/schema.graphql.dart';
import 'package:loyalcraft/localizations_delegate/app_localizations.dart';
import 'package:loyalcraft/src/bloc/home_tab_index.dart';
import 'package:loyalcraft/src/bloc/variable.dart';
import 'package:loyalcraft/src/data/consts.dart';
import 'package:loyalcraft/src/data/flutter_messenger.dart';
import 'package:loyalcraft/src/data/graphql_client.dart';
import 'package:loyalcraft/src/data/shared_preferences.dart';
import 'package:loyalcraft/src/repository/user_card.dart';
import 'package:loyalcraft/src/screens/delete_account_1.dart';
import 'package:loyalcraft/src/screens/edit_email_address.dart';
import 'package:loyalcraft/src/screens/edit_locale.dart';
import 'package:loyalcraft/src/screens/edit_password.dart';
import 'package:loyalcraft/src/screens/edit_phone_number.dart';
import 'package:loyalcraft/src/screens/edit_theme.dart';
import 'package:loyalcraft/src/screens/edit_user.dart';
import 'package:loyalcraft/src/screens/notifications.dart';
import 'package:loyalcraft/src/screens/phone_refill.dart';
import 'package:loyalcraft/src/screens/scan_qr_code.dart';
import 'package:loyalcraft/src/utils/image_cache_manager/shared_image_provider.dart';
import 'package:loyalcraft/src/widgets/custom_circular_progress_indicator.dart';
import 'package:loyalcraft/src/widgets/tabs_app_bar.dart';

// ignore: must_be_immutable
class ProfileWidget extends StatefulWidget {
  ProfileWidget({
    Key? key,
    required this.getCorporateUserCardByUserAndTarget,
    required this.findCurrentLoyaltySettings,
    required this.notificationCount,
    required this.wallet,
    required this.user,
    required this.pos,
    required this.isRtl,
  }) : super(key: key);
  bool isRtl;
  int notificationCount;
  List<Query$getCorporateUserCardByUserAndTarget$getCorporateUserCardByUserAndTarget> getCorporateUserCardByUserAndTarget;
  Query$findLoyaltySettingsByTarget$findLoyaltySettingsByTarget? findCurrentLoyaltySettings;
  Query$getCurrentUserQuantitativeWallets$getCurrentUserQuantitativeWallets$objects? wallet;
  Query$pointOfSale$pointOfSale pos;
  Query$user$user user;
  @override
  _ProfileWidget createState() => _ProfileWidget();
}

class _ProfileWidget extends State<ProfileWidget> {
  final SGraphQLClient _sGraphQLClient = SGraphQLClient();
  late UserCardRepository _userCardRepository;
  late VariableCubit<bool> _isLoadingCubit;

  void _initState() {
    _userCardRepository = UserCardRepository(_sGraphQLClient);
    _isLoadingCubit = VariableCubit(value: false);
  }

  @override
  void dispose() {
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
  Widget build(BuildContext context) => MultiBlocProvider(
        providers: [
          BlocProvider(create: (context) => _isLoadingCubit),
        ],
        child: RefreshIndicator(
          backgroundColor: Theme.of(context).primaryColor,
          color: kAppColor,
          onRefresh: () async {
            HapticFeedback.heavyImpact();
          },
          child: SafeArea(
            left: false,
            right: false,
            child: ListView(
              padding: const EdgeInsets.all(16.0),
              shrinkWrap: true,
              primary: false,
              children: [
                TabsAppBarWidget(
                  notificationCount: widget.notificationCount,
                  user: widget.user,
                  wallet: widget.wallet,
                  title: translate(context, 'you'),
                ),
                const SizedBox(height: 16.0),
                Row(
                  children: [
                    if ((widget.user.picture?.baseUrl ?? '').isEmpty || (widget.user.picture?.path ?? '').isEmpty)
                      Hero(
                        tag: kUserAvatar,
                        child: SharedImageProviderWidget(
                          color: Theme.of(context).colorScheme.secondary,
                          imageUrl: kUserAvatar,
                          fit: BoxFit.cover,
                          height: 60.0,
                          width: 60.0,
                        ),
                      )
                    else
                      Hero(
                        tag: '${widget.user.picture!.baseUrl}/${widget.user.picture!.path}',
                        child: SharedImageProviderWidget(
                          enableOnTap: true,
                          imageUrl: '${widget.user.picture!.baseUrl!}/${widget.user.picture!.path!}',
                          color: Theme.of(context).colorScheme.secondary,
                          backgroundColor: Theme.of(context).focusColor,
                          borderRadius: BorderRadius.circular(100.0),
                          fit: BoxFit.cover,
                          height: 60.0,
                          width: 60.0,
                        ),
                      ),
                    const SizedBox(width: 8.0),
                    Expanded(
                      child: Text(
                        '${widget.user.firstName ?? ''} ${widget.user.lastName ?? ''}',
                        style: Theme.of(context).textTheme.displayMedium!.copyWith(
                              fontSize: 18.0,
                            ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16.0),
                Container(
                  padding: const EdgeInsets.all(16.0),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(8.0),
                    color: Theme.of(context).focusColor,
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      GestureDetector(
                        onTap: () => Navigator.push(context, MaterialPageRoute(builder: (context) => const EditUserWidget())),
                        child: Row(
                          children: [
                            Expanded(
                              child: Text(
                                translate(context, 'profile'),
                                style: Theme.of(context).textTheme.bodyLarge,
                              ),
                            ),
                            const SizedBox(width: 8.0),
                            Icon(
                              widget.isRtl ? CupertinoIcons.chevron_left : CupertinoIcons.chevron_right,
                              color: Theme.of(context).colorScheme.secondary,
                              size: 12.0,
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16.0),
                      Container(
                        width: double.infinity,
                        height: 0.2,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(100.0),
                          color: Colors.grey,
                        ),
                      ),
                      const SizedBox(height: 16.0),
                      GestureDetector(
                        onTap: () => Navigator.push(context, MaterialPageRoute(builder: (context) => const EditEmailAddressWidget())),
                        child: Row(
                          children: [
                            Expanded(
                              child: Text(
                                translate(context, 'emailAddress'),
                                style: Theme.of(context).textTheme.bodyLarge,
                              ),
                            ),
                            const SizedBox(width: 8.0),
                            Icon(
                              widget.isRtl ? CupertinoIcons.chevron_left : CupertinoIcons.chevron_right,
                              color: Theme.of(context).colorScheme.secondary,
                              size: 12.0,
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16.0),
                      Container(
                        width: double.infinity,
                        height: 0.2,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(100.0),
                          color: Colors.grey,
                        ),
                      ),
                      const SizedBox(height: 16.0),
                      GestureDetector(
                        onTap: () => Navigator.push(context, MaterialPageRoute(builder: (context) => const EditPhoneNumberWidget())),
                        child: Row(
                          children: [
                            Expanded(
                              child: Text(
                                translate(context, 'phoneNumber'),
                                style: Theme.of(context).textTheme.bodyLarge,
                              ),
                            ),
                            const SizedBox(width: 8.0),
                            Icon(
                              widget.isRtl ? CupertinoIcons.chevron_left : CupertinoIcons.chevron_right,
                              color: Theme.of(context).colorScheme.secondary,
                              size: 12.0,
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16.0),
                      Container(
                        width: double.infinity,
                        height: 0.2,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(100.0),
                          color: Colors.grey,
                        ),
                      ),
                      const SizedBox(height: 16.0),
                      GestureDetector(
                        onTap: () => Navigator.push(context, MaterialPageRoute(builder: (context) => const EditPasswordWidget())),
                        child: Row(
                          children: [
                            Expanded(
                              child: Text(
                                translate(context, 'password'),
                                style: Theme.of(context).textTheme.bodyLarge,
                              ),
                            ),
                            const SizedBox(width: 8.0),
                            Icon(
                              widget.isRtl ? CupertinoIcons.chevron_left : CupertinoIcons.chevron_right,
                              color: Theme.of(context).colorScheme.secondary,
                              size: 12.0,
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16.0),
                      Container(
                        width: double.infinity,
                        height: 0.2,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(100.0),
                          color: Colors.grey,
                        ),
                      ),
                      const SizedBox(height: 16.0),
                      GestureDetector(
                        onTap: () => Navigator.push(context, MaterialPageRoute(builder: (context) => const EditThemeWidget())),
                        child: Row(
                          children: [
                            Expanded(
                              child: Text(
                                translate(context, 'applicationTheme'),
                                style: Theme.of(context).textTheme.bodyLarge,
                              ),
                            ),
                            const SizedBox(width: 8.0),
                            Icon(
                              widget.isRtl ? CupertinoIcons.chevron_left : CupertinoIcons.chevron_right,
                              color: Theme.of(context).colorScheme.secondary,
                              size: 12.0,
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16.0),
                      Container(
                        width: double.infinity,
                        height: 0.2,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(100.0),
                          color: Colors.grey,
                        ),
                      ),
                      const SizedBox(height: 16.0),
                      GestureDetector(
                        onTap: () => Navigator.push(context, MaterialPageRoute(builder: (context) => const EditLocaleWidget())),
                        child: Row(
                          children: [
                            Expanded(
                              child: Text(
                                translate(context, 'applicationLanguage'),
                                style: Theme.of(context).textTheme.bodyLarge,
                              ),
                            ),
                            const SizedBox(width: 8.0),
                            Icon(
                              widget.isRtl ? CupertinoIcons.chevron_left : CupertinoIcons.chevron_right,
                              color: Theme.of(context).colorScheme.secondary,
                              size: 12.0,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16.0),
                Container(
                  padding: const EdgeInsets.all(16.0),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(8.0),
                    color: Theme.of(context).focusColor,
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      GestureDetector(
                        onTap: () => showGeneralDialog(
                          pageBuilder: (context, anim1, anim2) => ScanQrCodeWidget(
                            refreshTheView: (value) async {
                              var uri = Uri.parse(value.startsWith('http://') || value.startsWith('https://') ? value : 'https://$value');
                              var path = uri.path.trim();
                              var index = path.indexOf('/');
                              if (index != -1) {
                                path = path.substring(index + 1);
                              }
                              if (path.contains(kLoginRefIdPath) && path.contains('/') && path.split('/').length >= 3) {
                                path = path.replaceAll(kLoginRefIdPath, '');
                                final pathList = path.split('/');
                                _isLoadingCubit.updateValue(true);
                                final linkUserAccount = await _userCardRepository
                                    .linkUserAccount(
                                  Variables$Mutation$linkUserAccount(
                                    reference: pathList[1],
                                    target: Input$TargetACIInput(
                                      pos: pathList[2],
                                    ),
                                  ),
                                )
                                    .catchError((onError) {
                                  _isLoadingCubit.updateValue(false);
                                  return null;
                                });
                                _isLoadingCubit.updateValue(false);
                                if (linkUserAccount == null) {
                                  if (kBuildContext != null) {
                                    FlutterMessenger.showSnackbar(context: kBuildContext!, string: translate(context, 'generalErrorMessage'));
                                  }
                                } else {
                                  if (kBuildContext != null) {
                                    FlutterMessenger.showSnackbar(context: context, string: translate(context, 'successfullyAccountLinked'));
                                  }
                                }
                              } else {
                                _isLoadingCubit.updateValue(false);
                                if (kBuildContext != null) {
                                  FlutterMessenger.showSnackbar(context: context, string: translate(context, 'generalErrorMessage'));
                                }
                              }
                            },
                          ),
                          transitionDuration: const Duration(milliseconds: 1),
                          barrierColor: Colors.transparent,
                          barrierLabel: '',
                          context: context,
                        ),
                        child: Row(
                          children: [
                            Expanded(
                              child: Text(
                                translate(context, 'signInOnDesktop'),
                                style: Theme.of(context).textTheme.bodyLarge,
                              ),
                            ),
                            const SizedBox(width: 8.0),
                            BlocBuilder<VariableCubit, dynamic>(
                              bloc: _isLoadingCubit,
                              builder: (context, isLoading) => isLoading
                                  ? CustomCircularProgressIndicatorWidget(
                                      backgroundColor: Theme.of(context).focusColor,
                                      alignment: Alignment.center,
                                      padding: EdgeInsets.zero,
                                      color: kAppColor,
                                    )
                                  : Icon(
                                      widget.isRtl ? CupertinoIcons.chevron_left : CupertinoIcons.chevron_right,
                                      color: Theme.of(context).colorScheme.secondary,
                                      size: 12.0,
                                    ),
                            ),
                          ],
                        ),
                      ),

                      // const SizedBox(height: 16.0),
                      // Container(
                      //   width: double.infinity,
                      //   height: 0.2,
                      //   decoration: BoxDecoration(
                      //     borderRadius: BorderRadius.circular(100.0),
                      //     color: Colors.grey,
                      //   ),
                      // ),
                      // const SizedBox(height: 16.0),
                      // GestureDetector(
                      //   onTap: () => Navigator.push(
                      //     context,
                      //     MaterialPageRoute(
                      //       builder: (context) => RedeemWidget(
                      //         content: findCurrentLoyaltySettings?.redeem?.content,
                      //       ),
                      //     ),
                      //   ),
                      //   child: Row(
                      //     children: [
                      //       Expanded(
                      //         child: Text(
                      //           translate(context, 'redeem'),
                      //           style: Theme.of(context).textTheme.bodyLarge,
                      //         ),
                      //       ),
                      //       const SizedBox(width: 8.0),
                      //       Icon(
                      //       widget.isRtl ? CupertinoIcons.chevron_left : CupertinoIcons.chevron_right,
                      //         color: Theme.of(context).colorScheme.secondary,
                      //         size: 12.0,
                      //       ),
                      //     ],
                      //   ),
                      // ),
                      // const SizedBox(height: 16.0),
                      // Container(
                      //   width: double.infinity,
                      //   height: 0.2,
                      //   decoration: BoxDecoration(
                      //     borderRadius: BorderRadius.circular(100.0),
                      //     color: Colors.grey,
                      //   ),
                      // ),
                      // const SizedBox(height: 16.0),
                      // GestureDetector(
                      //   onTap: () => Navigator.push(context, MaterialPageRoute(builder: (context) => const PointsOfSaleWidget())),
                      //   child: Row(
                      //     children: [
                      //       Expanded(
                      //         child: Text(
                      //           translate(context, 'partners'),
                      //           style: Theme.of(context).textTheme.bodyLarge,
                      //         ),
                      //       ),
                      //       const SizedBox(width: 8.0),
                      //       Icon(
                      //         CupertinoIcons.chevron_right,
                      //         color: Theme.of(context).colorScheme.secondary,
                      //         size: 12.0,
                      //       ),
                      //     ],
                      //   ),
                      // ),
                      // const SizedBox(height: 16.0),
                      // Container(
                      //   width: double.infinity,
                      //   height: 0.2,
                      //   decoration: BoxDecoration(
                      //     borderRadius: BorderRadius.circular(100.0),
                      //     color: Colors.grey,
                      //   ),
                      // ),
                      // const SizedBox(height: 16.0),
                      // GestureDetector(
                      //   onTap: () => showUserCardSheet(
                      //     getCorporateUserCardByUserAndTarget: getCorporateUserCardByUserAndTarget,
                      //     context: context,
                      //     pos: pos,
                      //   ),
                      //   child: Row(
                      //     children: [
                      //       Expanded(
                      //         child: Text(
                      //           translate(context, 'loyaltyCard'),
                      //           style: Theme.of(context).textTheme.bodyLarge,
                      //         ),
                      //       ),
                      //       const SizedBox(width: 8.0),
                      //       Icon(
                      //            widget.isRtl ? CupertinoIcons.chevron_left : CupertinoIcons.chevron_right,
                      //         color: Theme.of(context).colorScheme.secondary,
                      //         size: 12.0,
                      //       ),
                      //     ],
                      //   ),
                      // ),

                      const SizedBox(height: 16.0),
                      Container(
                        width: double.infinity,
                        height: 0.2,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(100.0),
                          color: Colors.grey,
                        ),
                      ),
                      const SizedBox(height: 16.0),
                      GestureDetector(
                        onTap: () async {
                          await addHomeTabIndexToSP(3);
                          BlocProvider.of<HomeTabIndexCubit>(context).updateValue(3);
                        },
                        child: Row(
                          children: [
                            Expanded(
                              child: Text(
                                translate(context, 'wallet'),
                                style: Theme.of(context).textTheme.bodyLarge,
                              ),
                            ),
                            const SizedBox(width: 8.0),
                            Icon(
                              widget.isRtl ? CupertinoIcons.chevron_left : CupertinoIcons.chevron_right,
                              color: Theme.of(context).colorScheme.secondary,
                              size: 12.0,
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16.0),
                      Container(
                        width: double.infinity,
                        height: 0.2,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(100.0),
                          color: Colors.grey,
                        ),
                      ),
                      const SizedBox(height: 16.0),
                      GestureDetector(
                        onTap: () => Navigator.push(context, MaterialPageRoute(builder: (context) => const NotificationsWidget())),
                        child: Row(
                          children: [
                            Expanded(
                              child: Text(
                                translate(context, 'notifications'),
                                style: Theme.of(context).textTheme.bodyLarge,
                              ),
                            ),
                            const SizedBox(width: 8.0),
                            Icon(
                              widget.isRtl ? CupertinoIcons.chevron_left : CupertinoIcons.chevron_right,
                              color: Theme.of(context).colorScheme.secondary,
                              size: 12.0,
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16.0),
                      Container(
                        width: double.infinity,
                        height: 0.2,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(100.0),
                          color: Colors.grey,
                        ),
                      ),
                      const SizedBox(height: 16.0),
                      GestureDetector(
                        onTap: () => Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => const PhoneRefillWidget(),
                          ),
                        ),
                        child: Row(
                          children: [
                            Expanded(
                              child: Text(
                                translate(context, 'phoneRefill'),
                                style: Theme.of(context).textTheme.bodyLarge,
                              ),
                            ),
                            const SizedBox(width: 8.0),
                            Icon(
                              widget.isRtl ? CupertinoIcons.chevron_left : CupertinoIcons.chevron_right,
                              color: Theme.of(context).colorScheme.secondary,
                              size: 12.0,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16.0),
                Container(
                  padding: const EdgeInsets.all(16.0),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(8.0),
                    color: Theme.of(context).focusColor,
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      GestureDetector(
                        onTap: () => openUrl(kPrivacyPolicyUrl),
                        child: Row(
                          children: [
                            Expanded(
                              child: Text(
                                translate(context, 'privacyPolicy'),
                                style: Theme.of(context).textTheme.bodyLarge,
                              ),
                            ),
                            const SizedBox(width: 8.0),
                            Icon(
                              widget.isRtl ? CupertinoIcons.chevron_left : CupertinoIcons.chevron_right,
                              color: Theme.of(context).colorScheme.secondary,
                              size: 12.0,
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16.0),
                      Container(
                        width: double.infinity,
                        height: 0.2,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(100.0),
                          color: Colors.grey,
                        ),
                      ),
                      const SizedBox(height: 16.0),
                      GestureDetector(
                        onTap: () => openUrl(kTermsOfUseUrl),
                        child: Row(
                          children: [
                            Expanded(
                              child: Text(
                                translate(context, 'termsOfUse'),
                                style: Theme.of(context).textTheme.bodyLarge,
                              ),
                            ),
                            const SizedBox(width: 8.0),
                            Icon(
                              widget.isRtl ? CupertinoIcons.chevron_left : CupertinoIcons.chevron_right,
                              color: Theme.of(context).colorScheme.secondary,
                              size: 12.0,
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16.0),
                      Container(
                        width: double.infinity,
                        height: 0.2,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(100.0),
                          color: Colors.grey,
                        ),
                      ),
                      const SizedBox(height: 16.0),
                      GestureDetector(
                        onTap: () => Navigator.push(context, MaterialPageRoute(builder: (context) => const DeleteAccount1Widget())),
                        child: Row(
                          children: [
                            Expanded(
                              child: Text(
                                translate(context, 'deleteAccount'),
                                style: Theme.of(context).textTheme.bodyLarge,
                              ),
                            ),
                            const SizedBox(width: 8.0),
                            Icon(
                              widget.isRtl ? CupertinoIcons.chevron_left : CupertinoIcons.chevron_right,
                              color: Theme.of(context).colorScheme.secondary,
                              size: 12.0,
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16.0),
                      Container(
                        width: double.infinity,
                        height: 0.2,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(100.0),
                          color: Colors.grey,
                        ),
                      ),
                      const SizedBox(height: 16.0),
                      GestureDetector(
                        onTap: () => signOut(context),
                        child: Row(
                          children: [
                            Expanded(
                              child: Text(
                                translate(context, 'signOut'),
                                style: Theme.of(context).textTheme.bodyLarge,
                              ),
                            ),
                            const SizedBox(width: 8.0),
                            Icon(
                              widget.isRtl ? CupertinoIcons.chevron_left : CupertinoIcons.chevron_right,
                              color: Theme.of(context).colorScheme.secondary,
                              size: 12.0,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      );
}
