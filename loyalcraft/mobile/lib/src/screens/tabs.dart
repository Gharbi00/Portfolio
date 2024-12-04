import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-card-user-card.graphql.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-wallet-wallet.graphql.dart';
import 'package:flutter_loyalcraft_gql/schema.graphql.dart';
import 'package:loyalcraft/localizations_delegate/app_localizations.dart';
import 'package:loyalcraft/src/bloc/home_tab_index.dart';
import 'package:loyalcraft/src/bloc/locale.dart';
import 'package:loyalcraft/src/bloc/loyalty_settings.dart';
import 'package:loyalcraft/src/bloc/notification.dart';
import 'package:loyalcraft/src/bloc/pos.dart';
import 'package:loyalcraft/src/bloc/user.dart';
import 'package:loyalcraft/src/bloc/user_card.dart';
import 'package:loyalcraft/src/bloc/wallet.dart';
import 'package:loyalcraft/src/data/consts.dart';
import 'package:loyalcraft/src/data/graphql_client.dart';
import 'package:loyalcraft/src/data/ip_utils.dart';
import 'package:loyalcraft/src/data/shared_preferences.dart';
import 'package:loyalcraft/src/models/commun_class.dart';
import 'package:loyalcraft/src/repository/notification.dart';
import 'package:loyalcraft/src/screens/home.dart';
import 'package:loyalcraft/src/screens/marketplace.dart';
import 'package:loyalcraft/src/screens/profile.dart';
import 'package:loyalcraft/src/screens/quests.dart';
import 'package:loyalcraft/src/screens/tunisian_native_arabic.dart';
import 'package:loyalcraft/src/screens/wallet.dart';

// ignore: must_be_immutable
class TabsWidget extends StatefulWidget {
  const TabsWidget({Key? key}) : super(key: key);

  @override
  TabsWidgetState createState() => TabsWidgetState();
}

class TabsWidgetState extends State<TabsWidget> {
  final SGraphQLClient _sGraphQLClient = SGraphQLClient();
  late NotificationRepository _notificationRepository;
  final List<CommunClass> _tabList = [
    CommunClass(title: 'home', selected: true, icon1: CupertinoIcons.house_fill, icon2: CupertinoIcons.house),
    CommunClass(title: 'shop', selected: true, icon1: CupertinoIcons.cart_fill, icon2: CupertinoIcons.cart),
    CommunClass(title: 'quests', selected: true, icon1: CupertinoIcons.play_rectangle_fill, icon2: CupertinoIcons.play_rectangle),
    CommunClass(title: 'wallet', selected: true, icon1: CupertinoIcons.creditcard_fill, icon2: CupertinoIcons.creditcard),
    CommunClass(title: 'profile', selected: true, icon1: CupertinoIcons.person_fill, icon2: CupertinoIcons.person),
  ];
  Future<void> _initState() async {
    _notificationRepository = NotificationRepository(_sGraphQLClient);
    final user = await getUserFromSP();
    if (user != null) {
      await BlocProvider.of<CurrentUserQuantitativeWalletsCubit>(context).getCurrentUserQuantitativeWallets(
        Variables$Query$getCurrentUserQuantitativeWallets(
          pagination: Input$PaginationInput(
            page: kPaginationPage,
            limit: kPaginationLimit,
          ),
        ),
      );
      await BlocProvider.of<GetCorporateUserCardByUserAndTargetCubit>(context).getCorporateUserCardByUserAndTarget(
        Variables$Query$getCorporateUserCardByUserAndTarget(
          target: Input$TargetACIInput(
            pos: kPosID,
          ),
        ),
      );
      await BlocProvider.of<UserCubit>(context).user();
    }
    await _notificationRepository.countUnseenCorporateNotificationsForUser(context);
    final isFirstLogin = await getIsFirstLoginFromSP();
    final locale = await getLocaleFromSP();
    if (isFirstLogin && locale != kLocaleList.last) {
      if (await IPUtils.getCountryFromIP() == 'TN') {
        await addIsFirstLoginToSP(false);
        showGeneralDialog(
          transitionDuration: const Duration(milliseconds: 1),
          barrierColor: Colors.transparent,
          barrierLabel: '',
          context: context,
          pageBuilder: (context, anim1, anim2) => const TunisianNativeArabicDialog(),
        );
      }
    }
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
    final _pos = context.watch<PosCubit>().state;
    final _locale = context.watch<LocaleCubit>().state;
    final _notificationCount = context.watch<NotificationCountCubit>().state;
    final _currentUserQuantitativeWallet = context.watch<CurrentUserQuantitativeWalletsCubit>().state;
    final _wallet = _currentUserQuantitativeWallet == null
        ? null
        : _currentUserQuantitativeWallet.objects.isEmpty
            ? Query$getCurrentUserQuantitativeWallets$getCurrentUserQuantitativeWallets$objects(id: '', amount: '', fee: 0.0, createdAt: DateTime.now().toLocal(), updatedAt: DateTime.now().toLocal())
            : _currentUserQuantitativeWallet.objects.first;
    final _homeTabIndexCubit = BlocProvider.of<HomeTabIndexCubit>(context);
    final _getCorporateUserCardByUserAndTarget = context.watch<GetCorporateUserCardByUserAndTargetCubit>().state ?? [];
    final _findCurrentLoyaltySettings = context.watch<FindCurrentLoyaltySettingsCubit>().state;
    var _isRtl = Directionality.of(context) == TextDirection.rtl;
    return BlocBuilder<HomeTabIndexCubit, int>(
      builder: (context, homeTabIndex) => Scaffold(
        body: _user == null || _pos == null
            ? const SizedBox()
            : homeTabIndex == 0
                ? HomeWidget(
                    getCorporateUserCardByUserAndTarget: _getCorporateUserCardByUserAndTarget,
                    notificationCount: _notificationCount,
                    wallet: _wallet,
                    user: _user,
                    pos: _pos,
                    isRtl: _isRtl,
                  )
                : homeTabIndex == 1
                    ? MarketplaceWidget(
                        notificationCount: _notificationCount,
                        wallet: _wallet,
                        user: _user,
                        isRtl: _isRtl,
                      )
                    : homeTabIndex == 2
                        ? QuestsWidget(
                            notificationCount: _notificationCount,
                            wallet: _wallet,
                            user: _user,
                            isRtl: _isRtl,
                          )
                        : homeTabIndex == 3
                            ? WalletWidget(
                                getCorporateUserCardByUserAndTarget: _getCorporateUserCardByUserAndTarget,
                                notificationCount: _notificationCount,
                                wallet: _wallet,
                                locale: _locale,
                                user: _user,
                                isRtl: _isRtl,
                                pos: _pos,
                              )
                            : ProfileWidget(
                                getCorporateUserCardByUserAndTarget: _getCorporateUserCardByUserAndTarget,
                                findCurrentLoyaltySettings: _findCurrentLoyaltySettings,
                                notificationCount: _notificationCount,
                                isRtl: _isRtl,
                                wallet: _wallet,
                                user: _user,
                                pos: _pos,
                              ),
        bottomNavigationBar: Theme(
          data: Theme.of(context).copyWith(
            splashColor: Colors.transparent,
            highlightColor: Colors.transparent,
          ),
          child: BottomNavigationBar(
            onTap: (value) async {
              _homeTabIndexCubit.updateValue(value);
              await addHomeTabIndexToSP(value);
            },
            backgroundColor: Theme.of(context).scaffoldBackgroundColor,
            type: BottomNavigationBarType.fixed,
            currentIndex: homeTabIndex,
            unselectedFontSize: 0.0,
            selectedFontSize: 0.0,
            enableFeedback: false,
            elevation: 0,
            items: List.generate(
              _tabList.length,
              (index) => BottomNavigationBarItem(
                backgroundColor: Theme.of(context).scaffoldBackgroundColor,
                label: '',
                icon: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      homeTabIndex == index ? _tabList[index].icon1 : _tabList[index].icon2,
                      color: homeTabIndex == index ? Theme.of(context).colorScheme.secondary : Colors.grey,
                      size: 18.0,
                    ),
                    const SizedBox(height: 4.0),
                    Text(
                      translate(context, _tabList[index].title),
                      style: Theme.of(context).textTheme.displayMedium!.copyWith(
                            color: homeTabIndex == index ? Theme.of(context).colorScheme.secondary : Colors.grey,
                            fontWeight: homeTabIndex == index ? FontWeight.w700 : FontWeight.w400,
                            fontSize: 14.0,
                          ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
