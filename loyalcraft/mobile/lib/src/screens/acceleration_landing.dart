import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_diktup_utilities/extensions.dart';
import 'package:flutter_loyalcraft_gql/graphql/corporate-link-account.graphql.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-card-user-card.graphql.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-loyalty-settings.graphql.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-wallet-wallet.graphql.dart';
import 'package:flutter_loyalcraft_gql/schema.graphql.dart';
import 'package:loyalcraft/localizations_delegate/app_localizations.dart';
import 'package:loyalcraft/src/bloc/link_account.dart';
import 'package:loyalcraft/src/bloc/locale.dart';
import 'package:loyalcraft/src/bloc/loyalty_settings.dart';
import 'package:loyalcraft/src/bloc/variable.dart';
import 'package:loyalcraft/src/bloc/wallet.dart';
import 'package:loyalcraft/src/data/consts.dart';
import 'package:loyalcraft/src/data/flutter_messenger.dart';
import 'package:loyalcraft/src/data/graphql_client.dart';
import 'package:loyalcraft/src/data/reputation_utils.dart';
import 'package:loyalcraft/src/repository/link_account.dart';
import 'package:loyalcraft/src/repository/loyalty_settings.dart';
import 'package:loyalcraft/src/repository/user_card.dart';
import 'package:loyalcraft/src/repository/wallet.dart';
import 'package:loyalcraft/src/utils/image_cache_manager/shared_image_provider.dart';
import 'package:loyalcraft/src/widgets/empty.dart';
import 'package:loyalcraft/src/widgets/non_linked_account_banner.dart';
import 'package:loyalcraft/src/widgets/qualitative_quantitative.dart';
import 'package:loyalcraft/src/widgets/shimmers.dart';

// ignore: must_be_immutable
class AccelerationLandingWidget extends StatefulWidget {
  AccelerationLandingWidget({
    Key? key,
    required this.accelerationSettings,
  }) : super(key: key);
  Query$getAccelerationSettingsByTargetWithLinkedAccount$getAccelerationSettingsByTargetWithLinkedAccount$objects accelerationSettings;

  @override
  _AccelerationLandingWidget createState() => _AccelerationLandingWidget();
}

class _AccelerationLandingWidget extends State<AccelerationLandingWidget> with TickerProviderStateMixin {
  late GetCurrentUserLinkedCorporateAccountByTargetCubit _getCurrentUserLinkedCorporateAccountByTargetCubit;
  late GetUserWalletWithReputationsCubit _getUserWalletWithReputationsCubit;
  late FindLoyaltySettingsByTargetCubit _findLoyaltySettingsByTargetCubit;
  late LoyaltySettingsRepository _loyaltySettingsRepository;
  final SGraphQLClient _sGraphQLClient = SGraphQLClient();
  late LinkAccountRepository _linkAccountRepository;
  late AnimationController _animationController2;
  late UserCardRepository _userCardRepository;
  late WalletRepository _walletRepository;
  late VariableCubit<int> _countCubit;
  final List<String> _tabList = [];
  late VariableCubit _tabCubit;

  bool _isSlotHappeningNow({required Enum$DayEnum day, required String from, required String to, required Locale locale}) {
    var now = DateTime.now().toLocal();
    if (now.toEEEE(locale).toLowerCase() != day.name.toLowerCase()) {
      return false;
    }

    var fromTime = DateTime(
      now.year,
      now.month,
      now.day,
      from.split(':').first.toInteger(),
      from.split(':').last.toInteger(),
    );
    var toTime = DateTime(
      now.year,
      now.month,
      now.day,
      to.split(':').first.toInteger(),
      to.split(':').last.toInteger(),
    );

    if (now.isAfter(fromTime) && now.isBefore(toTime)) {
      return true;
    } else {
      return false;
    }
  }

  Future<void> _autoLink({required String token}) async {
    _countCubit.updateValue(1);
    if (token.isEmpty) {
      if (_findLoyaltySettingsByTargetCubit.state!.aggregator?.target?.pos?.id == kPosID) {
        _userCardRepository.linkUserAccount(
          Variables$Mutation$linkUserAccount(
            reference: '${DateTime.now().toLocal().microsecondsSinceEpoch}',
            target: Input$TargetACIInput(
              pos: widget.accelerationSettings.target?.pos?.id ?? '',
            ),
          ),
        );
        _getCurrentUserLinkedCorporateAccountByTargetCubit.getCurrentUserLinkedCorporateAccountByTarget(
          Variables$Query$getCurrentUserLinkedCorporateAccountByTarget(
            target: Input$TargetWithoutUserInput(
              pos: widget.accelerationSettings.target?.pos?.id,
            ),
          ),
        );

        _getUserWalletWithReputationsCubit.getUserWalletWithReputations(
          Variables$Query$getUserWalletWithReputations(
            userToken: token,
          ),
        );
        FlutterMessenger.showSnackbar(context: context, string: translate(context, 'linkAccountDialogSuccessfulDescription'));
      }
    } else {
      _getUserWalletWithReputationsCubit.getUserWalletWithReputations(
        Variables$Query$getUserWalletWithReputations(
          userToken: token,
        ),
      );
    }
  }

  Future<void> _initState() async {
    _tabCubit = VariableCubit(value: 0);
    _walletRepository = WalletRepository(_sGraphQLClient);
    _linkAccountRepository = LinkAccountRepository(_sGraphQLClient);
    _userCardRepository = UserCardRepository(_sGraphQLClient);
    _loyaltySettingsRepository = LoyaltySettingsRepository(_sGraphQLClient);
    _findLoyaltySettingsByTargetCubit = FindLoyaltySettingsByTargetCubit(_loyaltySettingsRepository);
    _getUserWalletWithReputationsCubit = GetUserWalletWithReputationsCubit(_walletRepository);
    _getCurrentUserLinkedCorporateAccountByTargetCubit = GetCurrentUserLinkedCorporateAccountByTargetCubit(_linkAccountRepository);
    _countCubit = VariableCubit(value: 0);
    if ((widget.accelerationSettings.mobile?.enabled ?? false) == true) {
      _tabList.add('mobile');
    }
    if ((widget.accelerationSettings.physical?.enabled ?? false) == true) {
      _tabList.add('onsite');
    }
    if ((widget.accelerationSettings.web?.enabled ?? false) == true) {
      _tabList.add('web');
    }
    _animationController2 = AnimationController(vsync: this, duration: const Duration(milliseconds: 1000));
    _animationController2.repeat(reverse: true);

    _findLoyaltySettingsByTargetCubit.findLoyaltySettingsByTarget(
      Variables$Query$findLoyaltySettingsByTarget(
        target: Input$TargetACIInput(
          pos: widget.accelerationSettings.target?.pos?.id,
        ),
      ),
    );
    _getCurrentUserLinkedCorporateAccountByTargetCubit.getCurrentUserLinkedCorporateAccountByTarget(
      Variables$Query$getCurrentUserLinkedCorporateAccountByTarget(
        target: Input$TargetWithoutUserInput(
          pos: widget.accelerationSettings.target?.pos?.id,
        ),
      ),
    );
  }

  @override
  void dispose() {
    _tabCubit.close();
    _animationController2.dispose();
    _findLoyaltySettingsByTargetCubit.close();
    _getUserWalletWithReputationsCubit.close();
    _getCurrentUserLinkedCorporateAccountByTargetCubit.close();
    _countCubit.close();
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
    final _locale = context.watch<LocaleCubit>().state;

    return MultiBlocProvider(
      providers: [
        BlocProvider(create: (context) => _getCurrentUserLinkedCorporateAccountByTargetCubit),
        BlocProvider(create: (context) => _getUserWalletWithReputationsCubit),
        BlocProvider(create: (context) => _countCubit),
        BlocProvider(create: (context) => _findLoyaltySettingsByTargetCubit),
        BlocProvider(create: (context) => _tabCubit),
      ],
      child: BlocBuilder<VariableCubit, dynamic>(
        bloc: _tabCubit,
        builder: (context, tab) => BlocBuilder<FindLoyaltySettingsByTargetCubit, Query$findLoyaltySettingsByTarget$findLoyaltySettingsByTarget?>(
          bloc: _findLoyaltySettingsByTargetCubit,
          builder: (context, findLoyaltySettingsByTarget) => BlocBuilder<VariableCubit, dynamic>(
            bloc: _countCubit,
            builder: (context, count) =>
                BlocBuilder<GetCurrentUserLinkedCorporateAccountByTargetCubit, Query$getCurrentUserLinkedCorporateAccountByTarget$getCurrentUserLinkedCorporateAccountByTarget?>(
              bloc: _getCurrentUserLinkedCorporateAccountByTargetCubit,
              builder: (context, getCurrentUserLinkedCorporateAccountByTarget) => BlocBuilder<GetUserWalletWithReputationsCubit, Query$getUserWalletWithReputations$getUserWalletWithReputations?>(
                bloc: _getUserWalletWithReputationsCubit,
                builder: (context, getUserWalletWithReputations) {
                  final _prelevelMobile = findLoyaltySettingsByTarget?.prelevel?.onsiteConverter?.mobile;
                  if (getCurrentUserLinkedCorporateAccountByTarget != null && findLoyaltySettingsByTarget != null && count == 0) {
                    _autoLink(
                      token: getCurrentUserLinkedCorporateAccountByTarget.token.removeNull(),
                    );
                  }
                  return Scaffold(
                    appBar: AppBar(
                      automaticallyImplyLeading: false,
                      centerTitle: false,
                      elevation: 0,
                      title: Row(
                        children: [
                          GestureDetector(
                            onTap: () => Navigator.pop(context),
                            child: Container(
                              height: 36.0,
                              width: 36.0,
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(100.0),
                                color: Theme.of(context).focusColor,
                              ),
                              child: Icon(
                                CupertinoIcons.arrow_turn_up_left,
                                color: Theme.of(context).colorScheme.secondary,
                                size: 18.0,
                              ),
                            ),
                          ),
                          const SizedBox(width: 8.0),
                          Expanded(
                            child: Text(
                              translate(context, 'happyHour'),
                              style: Theme.of(context).textTheme.headlineSmall,
                            ),
                          ),
                        ],
                      ),
                    ),
                    body: SafeArea(
                      left: false,
                      top: false,
                      right: false,
                      child: Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: getCurrentUserLinkedCorporateAccountByTarget == null || findLoyaltySettingsByTarget == null || getUserWalletWithReputations == null
                            ? AccelerationLandingShimmer(
                                padding: EdgeInsets.zero,
                              )
                            : findLoyaltySettingsByTarget.id.isEmpty || _prelevelMobile == null || (getUserWalletWithReputations.reputationLevels ?? []).isEmpty
                                ? EmptyWidget(
                                    description: translate(context, 'reputationEmptyDescription'),
                                    title: translate(context, 'reputationEmptyTitle'),
                                    iconData: CupertinoIcons.star_fill,
                                    padding: EdgeInsets.zero,
                                  )
                                : Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Expanded(
                                        child: ListView(
                                          padding: EdgeInsets.zero,
                                          shrinkWrap: true,
                                          primary: false,
                                          children: [
                                            if (findLoyaltySettingsByTarget.aggregator?.target?.pos?.id != kPosID && getCurrentUserLinkedCorporateAccountByTarget.token.removeNull().isEmpty)
                                              NonLinkedAccountBannerWidget(
                                                posID: widget.accelerationSettings.target?.pos?.id ?? '',
                                              ),
                                            Center(
                                              child:
                                                  ((widget.accelerationSettings.target?.pos?.picture?.baseUrl ?? '').isEmpty || (widget.accelerationSettings.target?.pos?.picture?.path ?? '').isEmpty)
                                                      ? Hero(
                                                          tag: kEmptyPicture,
                                                          child: Container(
                                                            height: 140.0,
                                                            width: 140.0,
                                                            alignment: Alignment.center,
                                                            padding: const EdgeInsets.all(8.0),
                                                            decoration: BoxDecoration(
                                                              borderRadius: BorderRadius.circular(100.0),
                                                              color: Theme.of(context).focusColor,
                                                            ),
                                                            child: SharedImageProviderWidget(
                                                              imageUrl: kEmptyPicture,
                                                              color: Theme.of(context).colorScheme.secondary,
                                                              height: 140.0,
                                                              width: 140.0,
                                                              fit: BoxFit.cover,
                                                            ),
                                                          ),
                                                        )
                                                      : Hero(
                                                          tag: '${widget.accelerationSettings.target?.pos?.picture!.baseUrl}/${widget.accelerationSettings.target?.pos?.picture!.path}',
                                                          child: SharedImageProviderWidget(
                                                            imageUrl: '${widget.accelerationSettings.target?.pos?.picture!.baseUrl}/${widget.accelerationSettings.target?.pos?.picture!.path}',
                                                            color: Theme.of(context).colorScheme.secondary,
                                                            backgroundColor: Theme.of(context).focusColor,
                                                            borderRadius: BorderRadius.circular(100.0),
                                                            fit: BoxFit.cover,
                                                            height: 140.0,
                                                            width: 140.0,
                                                          ),
                                                        ),
                                            ),
                                            const SizedBox(height: 16.0),
                                            Text(
                                              widget.accelerationSettings.target?.pos?.title ?? translate(context, 'noDataFound'),
                                              textAlign: TextAlign.center,
                                              style: Theme.of(context).textTheme.displayMedium,
                                            ),
                                            const SizedBox(height: 16.0),
                                            Text(
                                              translate(context, 'accelerationText1'),
                                              textAlign: TextAlign.center,
                                              style: Theme.of(context).textTheme.bodyMedium,
                                            ),
                                            const SizedBox(height: 16.0),
                                            Row(
                                              children: List.generate(
                                                _tabList.length,
                                                (index) => Expanded(
                                                  child: GestureDetector(
                                                    onTap: () => _tabCubit.updateValue(index),
                                                    child: Container(
                                                      margin: EdgeInsets.only(left: index == 0 ? 0.0 : 8.0),
                                                      padding: const EdgeInsets.all(8.0),
                                                      decoration: BoxDecoration(
                                                        color: index == tab ? kAppColor : Theme.of(context).focusColor,
                                                        borderRadius: BorderRadius.circular(8.0),
                                                      ),
                                                      child: Text(
                                                        translate(context, _tabList[index]),
                                                        textAlign: TextAlign.center,
                                                        style: Theme.of(context).textTheme.bodyMedium!.copyWith(
                                                              color: index == tab ? Colors.white : Theme.of(context).colorScheme.secondary,
                                                            ),
                                                      ),
                                                    ),
                                                  ),
                                                ),
                                              ),
                                            ),
                                            const SizedBox(height: 16.0),
                                            Text(
                                              translate(context, 'availableOnTheseDays'),
                                              style: Theme.of(context).textTheme.bodyLarge,
                                            ),
                                            const SizedBox(height: 16.0),
                                            (tab == 0 &&
                                                    (widget.accelerationSettings.mobile?.enabled ?? false) == true &&
                                                    (findLoyaltySettingsByTarget.onsiteConverter?.mobile?.remunerations ?? []).isNotEmpty &&
                                                    (widget.accelerationSettings.mobile!.slots ?? []).isNotEmpty)
                                                ? Column(
                                                    crossAxisAlignment: CrossAxisAlignment.start,
                                                    mainAxisSize: MainAxisSize.min,
                                                    children: List.generate(
                                                      widget.accelerationSettings.mobile!.slots!.length,
                                                      (index) {
                                                        final slot = widget.accelerationSettings.mobile!.slots![index];
                                                        return getCurrentUserLinkedCorporateAccountByTarget.token.removeNull().isEmpty
                                                            ? _guestUserSlotWidget(
                                                                remunerations: findLoyaltySettingsByTarget.onsiteConverter?.mobile?.remunerations ?? [],
                                                                from: slot.period!.from!,
                                                                day: slot.period!.day!,
                                                                to: slot.period!.to!,
                                                                ratio: slot.ratio!,
                                                                index: index,
                                                                isHappeningNow: _isSlotHappeningNow(
                                                                  day: slot.period!.day!,
                                                                  from: slot.period!.from!,
                                                                  to: slot.period!.to!,
                                                                  locale: _locale,
                                                                ),
                                                              )
                                                            : _slotWidget(
                                                                remunerations: findLoyaltySettingsByTarget.onsiteConverter?.mobile?.remunerations ?? [],
                                                                getUserWalletWithReputations: getUserWalletWithReputations,
                                                                findLoyaltySettingsByTarget: findLoyaltySettingsByTarget,
                                                                prelevelMobile: _prelevelMobile,
                                                                from: slot.period!.from!,
                                                                day: slot.period!.day!,
                                                                to: slot.period!.to!,
                                                                ratio: slot.ratio!,
                                                                index: index,
                                                                isHappeningNow: _isSlotHappeningNow(
                                                                  day: slot.period!.day!,
                                                                  from: slot.period!.from!,
                                                                  to: slot.period!.to!,
                                                                  locale: _locale,
                                                                ),
                                                              );
                                                      },
                                                    ),
                                                  )
                                                : (tab == 1 &&
                                                        (widget.accelerationSettings.physical?.enabled ?? false) == true &&
                                                        (findLoyaltySettingsByTarget.onsiteConverter?.mobile?.remunerations ?? []).isNotEmpty &&
                                                        (widget.accelerationSettings.physical!.slots ?? []).isNotEmpty)
                                                    ? Column(
                                                        crossAxisAlignment: CrossAxisAlignment.start,
                                                        mainAxisSize: MainAxisSize.min,
                                                        children: List.generate(
                                                          widget.accelerationSettings.physical!.slots!.length,
                                                          (index) {
                                                            final slot = widget.accelerationSettings.physical!.slots![index];
                                                            return getCurrentUserLinkedCorporateAccountByTarget.token.removeNull().isEmpty
                                                                ? _guestUserSlotWidget(
                                                                    remunerations: findLoyaltySettingsByTarget.onsiteConverter?.mobile?.remunerations ?? [],
                                                                    from: slot.period!.from!,
                                                                    day: slot.period!.day!,
                                                                    to: slot.period!.to!,
                                                                    ratio: slot.ratio!,
                                                                    index: index,
                                                                    isHappeningNow: _isSlotHappeningNow(
                                                                      day: slot.period!.day!,
                                                                      from: slot.period!.from!,
                                                                      to: slot.period!.to!,
                                                                      locale: _locale,
                                                                    ),
                                                                  )
                                                                : _slotWidget(
                                                                    remunerations: findLoyaltySettingsByTarget.onsiteConverter?.mobile?.remunerations ?? [],
                                                                    getUserWalletWithReputations: getUserWalletWithReputations,
                                                                    findLoyaltySettingsByTarget: findLoyaltySettingsByTarget,
                                                                    prelevelMobile: _prelevelMobile,
                                                                    from: slot.period!.from!,
                                                                    day: slot.period!.day!,
                                                                    to: slot.period!.to!,
                                                                    ratio: slot.ratio!,
                                                                    index: index,
                                                                    isHappeningNow: _isSlotHappeningNow(
                                                                      day: slot.period!.day!,
                                                                      from: slot.period!.from!,
                                                                      to: slot.period!.to!,
                                                                      locale: _locale,
                                                                    ),
                                                                  );
                                                          },
                                                        ),
                                                      )
                                                    : (tab == 2 &&
                                                            (widget.accelerationSettings.web?.enabled ?? false) == true &&
                                                            (findLoyaltySettingsByTarget.onsiteConverter?.mobile?.remunerations ?? []).isNotEmpty &&
                                                            (widget.accelerationSettings.web!.slots ?? []).isNotEmpty)
                                                        ? Column(
                                                            crossAxisAlignment: CrossAxisAlignment.start,
                                                            mainAxisSize: MainAxisSize.min,
                                                            children: List.generate(
                                                              widget.accelerationSettings.web!.slots!.length,
                                                              (index) {
                                                                final slot = widget.accelerationSettings.web!.slots![index];
                                                                return getCurrentUserLinkedCorporateAccountByTarget.token.removeNull().isEmpty
                                                                    ? _guestUserSlotWidget(
                                                                        remunerations: findLoyaltySettingsByTarget.onsiteConverter?.mobile?.remunerations ?? [],
                                                                        from: slot.period!.from!,
                                                                        day: slot.period!.day!,
                                                                        to: slot.period!.to!,
                                                                        ratio: slot.ratio!,
                                                                        index: index,
                                                                        isHappeningNow: _isSlotHappeningNow(
                                                                          day: slot.period!.day!,
                                                                          from: slot.period!.from!,
                                                                          to: slot.period!.to!,
                                                                          locale: _locale,
                                                                        ),
                                                                      )
                                                                    : _slotWidget(
                                                                        remunerations: findLoyaltySettingsByTarget.onsiteConverter?.mobile?.remunerations ?? [],
                                                                        getUserWalletWithReputations: getUserWalletWithReputations,
                                                                        findLoyaltySettingsByTarget: findLoyaltySettingsByTarget,
                                                                        prelevelMobile: _prelevelMobile,
                                                                        from: slot.period!.from!,
                                                                        day: slot.period!.day!,
                                                                        to: slot.period!.to!,
                                                                        ratio: slot.ratio!,
                                                                        index: index,
                                                                        isHappeningNow: _isSlotHappeningNow(
                                                                          day: slot.period!.day!,
                                                                          from: slot.period!.from!,
                                                                          to: slot.period!.to!,
                                                                          locale: _locale,
                                                                        ),
                                                                      );
                                                              },
                                                            ),
                                                          )
                                                        : EmptyWidget(
                                                            description: translate(context, 'accelerationEmptyDescription'),
                                                            title: translate(context, 'accelerationEmptyTitle'),
                                                            iconData: CupertinoIcons.tickets_fill,
                                                            padding: const EdgeInsets.all(16.0),
                                                          ),
                                          ],
                                        ),
                                      ),
                                      const SizedBox(height: 16.0),
                                      TextButton(
                                        style: TextButton.styleFrom(
                                          minimumSize: const Size.fromHeight(40.0),
                                          backgroundColor: kAppColor,
                                          shape: RoundedRectangleBorder(
                                            borderRadius: BorderRadius.circular(8.0),
                                          ),
                                        ),
                                        onPressed: () => Navigator.pop(context),
                                        child: Text(
                                          translate(context, 'gotIt'),
                                          textAlign: TextAlign.center,
                                          style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                                                color: Colors.white,
                                              ),
                                        ),
                                      ),
                                    ],
                                  ),
                      ),
                    ),
                  );
                },
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _slotWidget({
    required List<Query$findLoyaltySettingsByTarget$findLoyaltySettingsByTarget$onsiteConverter$mobile$remunerations> remunerations,
    required Query$findLoyaltySettingsByTarget$findLoyaltySettingsByTarget$prelevel$onsiteConverter$mobile? prelevelMobile,
    required Query$findLoyaltySettingsByTarget$findLoyaltySettingsByTarget? findLoyaltySettingsByTarget,
    required Query$getUserWalletWithReputations$getUserWalletWithReputations? getUserWalletWithReputations,
    required bool isHappeningNow,
    required Enum$DayEnum day,
    required double ratio,
    required String from,
    required String to,
    required int index,
  }) {
    Query$findLoyaltySettingsByTarget$findLoyaltySettingsByTarget$onsiteConverter$mobile$remunerations? remunerationByLevel;
    if (ReputationUtils.isCurrentPreLevel(getUserWalletWithReputations: getUserWalletWithReputations, findLoyaltySettingsByTarget: findLoyaltySettingsByTarget) == false) {
      if (remunerations.where((e) => e.reputationLevel?.id == ReputationUtils.getCurrentLevel(getUserWalletWithReputations)?.id).isNotEmpty) {
        remunerationByLevel = remunerations.firstWhere((e) => e.reputationLevel?.id == ReputationUtils.getCurrentLevel(getUserWalletWithReputations)?.id);
      }
    }
    return Padding(
      padding: EdgeInsets.only(top: index == 0 ? 0 : 0.0),
      child: Row(
        children: [
          Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                alignment: Alignment.center,
                height: 30.0,
                width: 30.0,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(100.0),
                  color: Theme.of(context).focusColor,
                ),
                child: Icon(
                  index.isEven ? CupertinoIcons.gift_alt_fill : CupertinoIcons.gift_fill,
                  color: Theme.of(context).colorScheme.secondary,
                  size: 18.0,
                ),
              ),
              Column(
                children: List.generate(
                  10,
                  (index) => Container(
                    height: 2.0,
                    width: 2.0,
                    margin: const EdgeInsets.symmetric(vertical: 4.0),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(100.0),
                      color: Colors.grey[800],
                    ),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(width: 8.0),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  "${translate(context, day.name)} ${translate(context, 'from')} $from ${translate(context, 'to')} $to",
                  style: Theme.of(context).textTheme.displayMedium!.copyWith(
                        fontSize: 15.0,
                      ),
                ),
                const SizedBox(height: 4.0),
                Wrap(
                  crossAxisAlignment: WrapCrossAlignment.center,
                  runSpacing: 4.0,
                  spacing: 4.0,
                  children: [
                    Text(
                      translate(context, 'accelerationText2'),
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                    if (ReputationUtils.isCurrentPreLevel(getUserWalletWithReputations: getUserWalletWithReputations, findLoyaltySettingsByTarget: findLoyaltySettingsByTarget))
                      Container(
                        padding: const EdgeInsets.symmetric(vertical: 4.0, horizontal: 8.0),
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(100.0),
                          color: Theme.of(context).focusColor,
                        ),
                        child: QualitativeQuantitativeWidget(
                          textStyle: Theme.of(context).textTheme.bodyLarge,
                          walletType: Enum$WalletTypeEnum.QUANTITATIVE,
                          baseUrl: prelevelMobile?.quantitative.wallet?.coin?.picture?.baseUrl,
                          path: prelevelMobile?.quantitative.wallet?.coin?.picture?.path,
                          amount: ((prelevelMobile?.quantitative.amount ?? '0').toInteger() * ratio).toInt(),
                          size: const Size(18.0, 18.0),
                          textAlign: TextAlign.center,
                        ),
                      ),
                    if (ReputationUtils.isCurrentPreLevel(getUserWalletWithReputations: getUserWalletWithReputations, findLoyaltySettingsByTarget: findLoyaltySettingsByTarget))
                      Container(
                        padding: const EdgeInsets.symmetric(vertical: 4.0, horizontal: 8.0),
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(100.0),
                          color: Theme.of(context).focusColor,
                        ),
                        child: QualitativeQuantitativeWidget(
                          textStyle: Theme.of(context).textTheme.bodyLarge,
                          walletType: Enum$WalletTypeEnum.QUALITATIVE,
                          amount: ((prelevelMobile?.qualitative.amount ?? '0').toInteger() * ratio).toInt(),
                          size: const Size(18.0, 18.0),
                          textAlign: TextAlign.center,
                        ),
                      ),
                    if (remunerationByLevel != null)
                      Container(
                        padding: const EdgeInsets.symmetric(vertical: 4.0, horizontal: 8.0),
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(100.0),
                          color: Theme.of(context).focusColor,
                        ),
                        child: QualitativeQuantitativeWidget(
                          textStyle: Theme.of(context).textTheme.bodyMedium,
                          walletType: Enum$WalletTypeEnum.QUANTITATIVE,
                          baseUrl: remunerationByLevel.quantitative.wallet?.coin?.picture?.baseUrl,
                          path: remunerationByLevel.quantitative.wallet?.coin?.picture?.path,
                          amount: remunerationByLevel.qualitative.amount.toInteger() * ratio.toInt(),
                          size: const Size(18.0, 18.0),
                          textAlign: TextAlign.center,
                        ),
                      ),
                    if (remunerationByLevel != null)
                      Container(
                        padding: const EdgeInsets.symmetric(vertical: 4.0, horizontal: 8.0),
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(100.0),
                          color: Theme.of(context).focusColor,
                        ),
                        child: QualitativeQuantitativeWidget(
                          textStyle: Theme.of(context).textTheme.bodyMedium,
                          walletType: Enum$WalletTypeEnum.QUALITATIVE,
                          amount: remunerationByLevel.qualitative.amount.toInteger() * ratio.toInt(),
                          size: const Size(18.0, 18.0),
                          textAlign: TextAlign.center,
                        ),
                      ),
                    Text(
                      translate(context, 'insteadOf'),
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                    if (ReputationUtils.isCurrentPreLevel(getUserWalletWithReputations: getUserWalletWithReputations, findLoyaltySettingsByTarget: findLoyaltySettingsByTarget))
                      Container(
                        padding: const EdgeInsets.symmetric(vertical: 4.0, horizontal: 8.0),
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(100.0),
                          color: Theme.of(context).focusColor,
                        ),
                        child: QualitativeQuantitativeWidget(
                          textStyle: Theme.of(context).textTheme.bodyMedium,
                          walletType: Enum$WalletTypeEnum.QUANTITATIVE,
                          baseUrl: prelevelMobile?.quantitative.wallet?.coin?.picture?.baseUrl,
                          path: prelevelMobile?.quantitative.wallet?.coin?.picture?.path,
                          amount: (prelevelMobile?.quantitative.amount ?? '0').toInteger(),
                          size: const Size(18.0, 18.0),
                          textAlign: TextAlign.center,
                        ),
                      ),
                    if (ReputationUtils.isCurrentPreLevel(getUserWalletWithReputations: getUserWalletWithReputations, findLoyaltySettingsByTarget: findLoyaltySettingsByTarget))
                      Container(
                        padding: const EdgeInsets.symmetric(vertical: 4.0, horizontal: 8.0),
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(100.0),
                          color: Theme.of(context).focusColor,
                        ),
                        child: QualitativeQuantitativeWidget(
                          textStyle: Theme.of(context).textTheme.bodyMedium,
                          walletType: Enum$WalletTypeEnum.QUALITATIVE,
                          amount: (prelevelMobile?.qualitative.amount ?? '0').toInteger(),
                          size: const Size(18.0, 18.0),
                          textAlign: TextAlign.center,
                        ),
                      ),
                    if (remunerationByLevel != null)
                      Container(
                        padding: const EdgeInsets.symmetric(vertical: 4.0, horizontal: 8.0),
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(100.0),
                          color: Theme.of(context).focusColor,
                        ),
                        child: QualitativeQuantitativeWidget(
                          textStyle: Theme.of(context).textTheme.bodyMedium,
                          walletType: Enum$WalletTypeEnum.QUANTITATIVE,
                          baseUrl: remunerationByLevel.quantitative.wallet?.coin?.picture?.baseUrl,
                          path: remunerationByLevel.quantitative.wallet?.coin?.picture?.path,
                          amount: (remunerationByLevel.quantitative.amount ?? '0').toInteger(),
                          size: const Size(18.0, 18.0),
                          textAlign: TextAlign.center,
                        ),
                      ),
                    if (remunerationByLevel != null)
                      Container(
                        padding: const EdgeInsets.symmetric(vertical: 4.0, horizontal: 8.0),
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(100.0),
                          color: Theme.of(context).focusColor,
                        ),
                        child: QualitativeQuantitativeWidget(
                          textStyle: Theme.of(context).textTheme.bodyMedium,
                          walletType: Enum$WalletTypeEnum.QUALITATIVE,
                          amount: remunerationByLevel.qualitative.amount.toInteger(),
                          size: const Size(18.0, 18.0),
                          textAlign: TextAlign.center,
                        ),
                      ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(width: 8.0),
          if (isHappeningNow)
            AnimatedBuilder(
              animation: _animationController2,
              builder: (context, child) => Transform.translate(
                offset: Offset(0.0, 8.0 * _animationController2.value - 6.0),
                child: Container(
                  padding: const EdgeInsets.symmetric(vertical: 3.0, horizontal: 6.0),
                  decoration: BoxDecoration(
                    color: Colors.green[800],
                    borderRadius: BorderRadius.circular(4.0),
                  ),
                  child: Text(
                    translate(context, 'happeningNow').toUpperCase(),
                    style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                          color: Colors.white,
                          fontSize: 12.0,
                        ),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _guestUserSlotWidget({
    required List<Query$findLoyaltySettingsByTarget$findLoyaltySettingsByTarget$onsiteConverter$mobile$remunerations> remunerations,
    required bool isHappeningNow,
    required Enum$DayEnum day,
    required double ratio,
    required String from,
    required String to,
    required int index,
  }) =>
      Padding(
        padding: EdgeInsets.only(top: index == 0 ? 0 : 0.0),
        child: Row(
          children: [
            Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  alignment: Alignment.center,
                  height: 30.0,
                  width: 30.0,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(100.0),
                    color: Theme.of(context).focusColor,
                  ),
                  child: Icon(
                    index.isEven ? CupertinoIcons.gift_alt_fill : CupertinoIcons.gift_fill,
                    color: Theme.of(context).colorScheme.secondary,
                    size: 18.0,
                  ),
                ),
                Column(
                  children: List.generate(
                    10,
                    (index) => Container(
                      height: 2.0,
                      width: 2.0,
                      margin: const EdgeInsets.symmetric(vertical: 4.0),
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(100.0),
                        color: Colors.grey[800],
                      ),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(width: 8.0),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    "${translate(context, day.name)} ${translate(context, 'from')} $from ${translate(context, 'to')} $to",
                    style: Theme.of(context).textTheme.displayMedium!.copyWith(
                          fontSize: 15.0,
                        ),
                  ),
                  const SizedBox(height: 4.0),
                  Wrap(
                    crossAxisAlignment: WrapCrossAlignment.center,
                    runSpacing: 4.0,
                    spacing: 4.0,
                    children: [
                      Text(
                        translate(context, 'accelerationText2'),
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(vertical: 4.0, horizontal: 8.0),
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(100.0),
                          color: Theme.of(context).focusColor,
                        ),
                        child: QualitativeQuantitativeWidget(
                          textStyle: Theme.of(context).textTheme.bodyLarge,
                          walletType: Enum$WalletTypeEnum.QUANTITATIVE,
                          baseUrl: remunerations.last.quantitative.wallet?.coin?.picture?.baseUrl,
                          path: remunerations.last.quantitative.wallet?.coin?.picture?.path,
                          amount: ((remunerations.last.quantitative.amount ?? '0').toInteger() * ratio).toInt(),
                          size: const Size(18.0, 18.0),
                          textAlign: TextAlign.center,
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(vertical: 4.0, horizontal: 8.0),
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(100.0),
                          color: Theme.of(context).focusColor,
                        ),
                        child: QualitativeQuantitativeWidget(
                          textStyle: Theme.of(context).textTheme.bodyLarge,
                          walletType: Enum$WalletTypeEnum.QUALITATIVE,
                          amount: (remunerations.last.qualitative.amount.toInteger() * ratio).toInt(),
                          size: const Size(18.0, 18.0),
                          textAlign: TextAlign.center,
                        ),
                      ),
                      Text(
                        translate(context, 'insteadOf'),
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(vertical: 4.0, horizontal: 8.0),
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(100.0),
                          color: Theme.of(context).focusColor,
                        ),
                        child: QualitativeQuantitativeWidget(
                          textStyle: Theme.of(context).textTheme.bodyLarge,
                          walletType: Enum$WalletTypeEnum.QUANTITATIVE,
                          baseUrl: remunerations.last.quantitative.wallet?.coin?.picture?.baseUrl,
                          path: remunerations.last.quantitative.wallet?.coin?.picture?.path,
                          amount: (remunerations.last.quantitative.amount ?? '0').toInteger(),
                          size: const Size(18.0, 18.0),
                          textAlign: TextAlign.center,
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(vertical: 4.0, horizontal: 8.0),
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(100.0),
                          color: Theme.of(context).focusColor,
                        ),
                        child: QualitativeQuantitativeWidget(
                          textStyle: Theme.of(context).textTheme.bodyLarge,
                          walletType: Enum$WalletTypeEnum.QUALITATIVE,
                          amount: remunerations.last.qualitative.amount.toInteger(),
                          size: const Size(18.0, 18.0),
                          textAlign: TextAlign.center,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8.0),
            if (isHappeningNow)
              AnimatedBuilder(
                animation: _animationController2,
                builder: (context, child) => Transform.translate(
                  offset: Offset(0.0, 8.0 * _animationController2.value - 6.0),
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 3.0, horizontal: 6.0),
                    decoration: BoxDecoration(
                      color: Colors.green[800],
                      borderRadius: BorderRadius.circular(4.0),
                    ),
                    child: Text(
                      translate(context, 'happeningNow').toUpperCase(),
                      style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                            color: Colors.white,
                            fontSize: 12.0,
                          ),
                    ),
                  ),
                ),
              ),
          ],
        ),
      );
}
