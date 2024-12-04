import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_diktup_utilities/extensions.dart';
import 'package:flutter_diktup_utilities/flutter_diktup_utilities.dart';
import 'package:flutter_loyalcraft_gql/graphql/corporate-link-account.graphql.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-card-user-card.graphql.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-loyalty-settings.graphql.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-wallet-wallet.graphql.dart';
import 'package:flutter_loyalcraft_gql/graphql/point-of-sale.graphql.dart';
import 'package:flutter_loyalcraft_gql/schema.graphql.dart';
import 'package:flutter_widget_from_html/flutter_widget_from_html.dart';
import 'package:loyalcraft/localizations_delegate/app_localizations.dart';
import 'package:loyalcraft/src/bloc/home_tab_index.dart';
import 'package:loyalcraft/src/bloc/link_account.dart';
import 'package:loyalcraft/src/bloc/loyalty_settings.dart';
import 'package:loyalcraft/src/bloc/pos.dart';
import 'package:loyalcraft/src/bloc/user_card.dart';
import 'package:loyalcraft/src/bloc/variable.dart';
import 'package:loyalcraft/src/bloc/wallet.dart';
import 'package:loyalcraft/src/data/consts.dart';
import 'package:loyalcraft/src/data/flutter_messenger.dart';
import 'package:loyalcraft/src/data/graphql_client.dart';
import 'package:loyalcraft/src/data/reputation_utils.dart';
import 'package:loyalcraft/src/data/shared_preferences.dart';
import 'package:loyalcraft/src/modal_bottom_sheet/user_card.dart';
import 'package:loyalcraft/src/repository/link_account.dart';
import 'package:loyalcraft/src/repository/loyalty_settings.dart';
import 'package:loyalcraft/src/repository/user_card.dart';
import 'package:loyalcraft/src/repository/wallet.dart';
import 'package:loyalcraft/src/screens/point_of_sale_reputation.dart';
import 'package:loyalcraft/src/screens/point_of_sale_wallet.dart';
import 'package:loyalcraft/src/screens/request_link_account.dart';
import 'package:loyalcraft/src/utils/image_cache_manager/shared_image_provider.dart';
import 'package:loyalcraft/src/widgets/qualitative_quantitative.dart';
import 'package:loyalcraft/src/widgets/shimmers.dart';
import 'package:share_plus/share_plus.dart';
import 'package:simple_circular_progress_bar/simple_circular_progress_bar.dart';

// ignore: must_be_immutable
class PointOfSaleLandingWidget extends StatefulWidget {
  PointOfSaleLandingWidget({
    Key? key,
    required this.pos,
  }) : super(key: key);
  Query$pointOfSale$pointOfSale pos;

  @override
  _PointOfSaleLandingWidget createState() => _PointOfSaleLandingWidget();
}

class _PointOfSaleLandingWidget extends State<PointOfSaleLandingWidget> {
  late GetCurrentUserLinkedCorporateAccountByTargetCubit _getCurrentUserLinkedCorporateAccountByTargetCubit;
  late LinkAccountRepository _linkAccountRepository;
  late GetCurrentUserQuantitativeWalletsCubit _getCurrentUserQuantitativeWalletsCubit;
  late GetUserWalletWithReputationsCubit _getUserWalletWithReputationsCubit;
  late FindLoyaltySettingsByTargetCubit _findLoyaltySettingsByTargetCubit;
  late LoyaltySettingsRepository _loyaltySettingsRepository;
  final SGraphQLClient _sGraphQLClient = SGraphQLClient();
  late WalletRepository _walletRepository;
  late VariableCubit<bool> _isLoadingCubit;
  late UserCardRepository _userCardRepository;
  late VariableCubit<int> _countCubit;

  String _getSocialImage(Query$pointOfSale$pointOfSale$socialMedia$name? name) {
    if ((name?.images ?? []).isNotEmpty) {
      if ((name?.images!.first.images ?? []).isNotEmpty) {
        if ((name?.images!.last.images!.last.png?.size480?.path ?? '').isNotEmpty) {
          return '${name!.images!.last.images!.last.png!.size480!.baseUrl}/f_auto/${name.images!.last.images!.last.png!.size480!.path}';
        }
      }
    }
    return '';
  }

  String _getAddress(Query$pointOfSale$pointOfSale$locations location) {
    var components = <String>[];
    if ((location.address ?? '').isNotEmpty) {
      components.add(location.address!);
    }
    if ((location.country?.name ?? '').isNotEmpty) {
      components.add(location.country!.name);
    }
    if ((location.state?.name ?? '').isNotEmpty) {
      components.add(location.state!.name);
    }
    return components.join(', ');
  }

  Future<void> _autoLink({required Query$findLoyaltySettingsByTarget$findLoyaltySettingsByTarget? findLoyaltySettingsByTarget, required String token}) async {
    _countCubit.updateValue(1);
    if (token.isEmpty) {
      if (findLoyaltySettingsByTarget!.aggregator?.target?.pos?.id == kPosID) {
        await _userCardRepository.linkUserAccount(
          Variables$Mutation$linkUserAccount(
            target: Input$TargetACIInput(
              pos: widget.pos.id,
            ),
            reference: '${DateTime.now().toLocal().microsecondsSinceEpoch}',
          ),
        );
        await _getCurrentUserLinkedCorporateAccountByTargetCubit.getCurrentUserLinkedCorporateAccountByTarget(
          Variables$Query$getCurrentUserLinkedCorporateAccountByTarget(
            target: Input$TargetWithoutUserInput(
              pos: widget.pos.id,
            ),
          ),
        );
        await _getUserWalletWithReputationsCubit.getUserWalletWithReputations(
          Variables$Query$getUserWalletWithReputations(
            userToken: _getCurrentUserLinkedCorporateAccountByTargetCubit.state?.token,
          ),
        );
        await _getCurrentUserQuantitativeWalletsCubit.getCurrentUserQuantitativeWallets(
          Variables$Query$getCurrentUserQuantitativeWallets(
            userToken: _getCurrentUserLinkedCorporateAccountByTargetCubit.state?.token,
            pagination: Input$PaginationInput(
              limit: kPaginationLimit,
              page: kPaginationPage,
            ),
          ),
        );
        FlutterMessenger.showSnackbar(context: context, string: translate(context, 'linkAccountDialogSuccessfulDescription'));
      }
    } else {
      await _getUserWalletWithReputationsCubit.getUserWalletWithReputations(
        Variables$Query$getUserWalletWithReputations(
          userToken: token,
        ),
      );
      await _getCurrentUserQuantitativeWalletsCubit.getCurrentUserQuantitativeWallets(
        Variables$Query$getCurrentUserQuantitativeWallets(
          userToken: token,
          pagination: Input$PaginationInput(
            limit: kPaginationLimit,
            page: kPaginationPage,
          ),
        ),
      );
    }
  }

  Future<void> _initState() async {
    _walletRepository = WalletRepository(_sGraphQLClient);
    _linkAccountRepository = LinkAccountRepository(_sGraphQLClient);
    _loyaltySettingsRepository = LoyaltySettingsRepository(_sGraphQLClient);
    _findLoyaltySettingsByTargetCubit = FindLoyaltySettingsByTargetCubit(_loyaltySettingsRepository);
    _getUserWalletWithReputationsCubit = GetUserWalletWithReputationsCubit(_walletRepository);
    _getCurrentUserQuantitativeWalletsCubit = GetCurrentUserQuantitativeWalletsCubit(_walletRepository);
    _getCurrentUserLinkedCorporateAccountByTargetCubit = GetCurrentUserLinkedCorporateAccountByTargetCubit(_linkAccountRepository);
    _countCubit = VariableCubit(value: 0);
    _isLoadingCubit = VariableCubit(value: false);
    _userCardRepository = UserCardRepository(_sGraphQLClient);

    await _findLoyaltySettingsByTargetCubit.findLoyaltySettingsByTarget(
      Variables$Query$findLoyaltySettingsByTarget(
        target: Input$TargetACIInput(
          pos: widget.pos.id,
        ),
      ),
    );
    await _getCurrentUserLinkedCorporateAccountByTargetCubit.getCurrentUserLinkedCorporateAccountByTarget(
      Variables$Query$getCurrentUserLinkedCorporateAccountByTarget(
        target: Input$TargetWithoutUserInput(
          pos: widget.pos.id,
        ),
      ),
    );
  }

  @override
  void dispose() {
    _isLoadingCubit.close();
    _countCubit.close();
    _findLoyaltySettingsByTargetCubit.close();
    _getUserWalletWithReputationsCubit.close();
    _getCurrentUserQuantitativeWalletsCubit.close();
    _getCurrentUserLinkedCorporateAccountByTargetCubit.close();
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
    final _appQuantitativeWallet = context.watch<CurrentUserQuantitativeWalletsCubit>().state;
    final _appWallet = (_appQuantitativeWallet?.objects ?? []).isEmpty ? null : _appQuantitativeWallet!.objects.first;
    final _appCorporateUserCard = context.watch<GetCorporateUserCardByUserAndTargetCubit>().state ?? [];
    final _appPos = context.watch<PosCubit>().state;
    return MultiBlocProvider(
      providers: [
        BlocProvider(create: (context) => _getCurrentUserLinkedCorporateAccountByTargetCubit),
        BlocProvider(create: (context) => _getUserWalletWithReputationsCubit),
        BlocProvider(create: (context) => _findLoyaltySettingsByTargetCubit),
        BlocProvider(create: (context) => _getCurrentUserQuantitativeWalletsCubit),
        BlocProvider(create: (context) => _isLoadingCubit),
        BlocProvider(create: (context) => _countCubit),
      ],
      child: BlocBuilder<VariableCubit, dynamic>(
        bloc: _countCubit,
        builder: (context, count) => BlocBuilder<GetCurrentUserQuantitativeWalletsCubit, Query$getCurrentUserQuantitativeWallets$getCurrentUserQuantitativeWallets?>(
          bloc: _getCurrentUserQuantitativeWalletsCubit,
          builder: (context, getCurrentUserQuantitativeWallets) => BlocBuilder<VariableCubit, dynamic>(
            bloc: _isLoadingCubit,
            builder: (context, isLoading) => BlocBuilder<FindLoyaltySettingsByTargetCubit, Query$findLoyaltySettingsByTarget$findLoyaltySettingsByTarget?>(
              bloc: _findLoyaltySettingsByTargetCubit,
              builder: (context, findLoyaltySettingsByTarget) =>
                  BlocBuilder<GetCurrentUserLinkedCorporateAccountByTargetCubit, Query$getCurrentUserLinkedCorporateAccountByTarget$getCurrentUserLinkedCorporateAccountByTarget?>(
                bloc: _getCurrentUserLinkedCorporateAccountByTargetCubit,
                builder: (context, getCurrentUserLinkedCorporateAccountByTarget) => BlocBuilder<GetUserWalletWithReputationsCubit, Query$getUserWalletWithReputations$getUserWalletWithReputations?>(
                  bloc: _getUserWalletWithReputationsCubit,
                  builder: (context, getUserWalletWithReputations) {
                    if (getCurrentUserLinkedCorporateAccountByTarget != null && findLoyaltySettingsByTarget != null && count == 0) {
                      _autoLink(
                        findLoyaltySettingsByTarget: findLoyaltySettingsByTarget,
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
                                widget.pos.title.removeNull(),
                                style: Theme.of(context).textTheme.headlineSmall,
                              ),
                            ),
                            if (_appCorporateUserCard.isNotEmpty && _appPos != null)
                              GestureDetector(
                                onTap: () => showUserCardSheet(
                                  getCorporateUserCardByUserAndTarget: _appCorporateUserCard,
                                  context: context,
                                  pos: _appPos,
                                ),
                                child: Container(
                                  margin: const EdgeInsets.only(left: 8.0),
                                  height: 36.0,
                                  width: 36.0,
                                  decoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(100.0),
                                    color: Theme.of(context).focusColor,
                                  ),
                                  child: Icon(
                                    CupertinoIcons.person_crop_square_fill,
                                    color: Theme.of(context).colorScheme.secondary,
                                    size: 18.0,
                                  ),
                                ),
                              ),
                            const SizedBox(width: 8.0),
                            GestureDetector(
                              onTap: () => Share.share('$kLoyalcraftPortal/m/p/${widget.pos.id}'),
                              child: Container(
                                height: 36.0,
                                width: 36.0,
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(100.0),
                                  color: Theme.of(context).focusColor,
                                ),
                                child: Icon(
                                  CupertinoIcons.share_solid,
                                  color: Theme.of(context).colorScheme.secondary,
                                  size: 18.0,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      body: CustomScrollView(
                        slivers: [
                          SliverAppBar(
                            expandedHeight: kAppSize.width / 1.8,
                            automaticallyImplyLeading: false,
                            centerTitle: false,
                            floating: true,
                            stretch: true,
                            pinned: true,
                            elevation: 0,
                            snap: true,
                            flexibleSpace: FlexibleSpaceBar(
                              background: ((widget.pos.picture?.baseUrl ?? '').isEmpty || (widget.pos.picture?.path ?? '').isEmpty)
                                  ? Hero(
                                      tag: kEmptyPicture,
                                      child: Container(
                                        alignment: Alignment.center,
                                        width: double.infinity,
                                        padding: const EdgeInsets.all(8.0),
                                        decoration: BoxDecoration(
                                          color: Theme.of(context).focusColor,
                                        ),
                                        child: SharedImageProviderWidget(
                                          imageUrl: kEmptyPicture,
                                          color: Theme.of(context).colorScheme.secondary,
                                          width: kAppSize.width / 2.0,
                                          height: kAppSize.width / 2.0,
                                          fit: BoxFit.cover,
                                        ),
                                      ),
                                    )
                                  : Hero(
                                      tag: '${widget.pos.picture!.baseUrl}/${widget.pos.picture!.path}',
                                      child: SharedImageProviderWidget(
                                        enableOnTap: true,
                                        imageUrl: '${widget.pos.picture!.baseUrl}/${widget.pos.picture!.path}',
                                        color: Theme.of(context).colorScheme.secondary,
                                        backgroundColor: Theme.of(context).focusColor,
                                        borderRadius: BorderRadius.zero,
                                        fit: BoxFit.cover,
                                        height: double.infinity,
                                        width: double.infinity,
                                      ),
                                    ),
                            ),
                          ),
                          SliverList(
                            delegate: SliverChildListDelegate([
                              SafeArea(
                                right: false,
                                left: false,
                                top: false,
                                child: Padding(
                                  padding: const EdgeInsets.all(16.0),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      if (findLoyaltySettingsByTarget?.aggregator?.target?.pos != null &&
                                          findLoyaltySettingsByTarget?.aggregator?.target?.pos?.id != kPosID &&
                                          findLoyaltySettingsByTarget?.aggregator?.target?.pos?.id != null &&
                                          (findLoyaltySettingsByTarget?.aggregator?.target?.pos?.id ?? '').isNotEmpty)
                                        Padding(
                                          padding: const EdgeInsets.only(bottom: 16.0),
                                          child: Row(
                                            children: [
                                              ((findLoyaltySettingsByTarget!.aggregator!.target!.pos!.picture?.baseUrl ?? '').isEmpty ||
                                                      (findLoyaltySettingsByTarget.aggregator!.target!.pos!.picture?.path ?? '').isEmpty)
                                                  ? Container(
                                                      alignment: Alignment.center,
                                                      width: double.infinity,
                                                      padding: const EdgeInsets.all(8.0),
                                                      decoration: BoxDecoration(
                                                        color: Theme.of(context).focusColor,
                                                      ),
                                                      child: SharedImageProviderWidget(
                                                        imageUrl: kEmptyPicture,
                                                        color: Theme.of(context).colorScheme.secondary,
                                                        width: 30.0,
                                                        height: 30.0,
                                                        fit: BoxFit.cover,
                                                      ),
                                                    )
                                                  : SharedImageProviderWidget(
                                                      enableOnTap: true,
                                                      imageUrl:
                                                          '${findLoyaltySettingsByTarget.aggregator!.target!.pos!.picture!.baseUrl}/${findLoyaltySettingsByTarget.aggregator!.target!.pos!.picture!.path}',
                                                      color: Theme.of(context).colorScheme.secondary,
                                                      backgroundColor: Theme.of(context).focusColor,
                                                      borderRadius: BorderRadius.circular(100.0),
                                                      fit: BoxFit.cover,
                                                      width: 30.0,
                                                      height: 30.0,
                                                    ),
                                              const SizedBox(width: 8.0),
                                              Expanded(
                                                child: RichText(
                                                  text: TextSpan(
                                                    children: [
                                                      TextSpan(
                                                        text: '${translate(context, 'managedBy')} ',
                                                        style: Theme.of(context).textTheme.bodyLarge,
                                                      ),
                                                      TextSpan(
                                                        text: findLoyaltySettingsByTarget.aggregator!.target!.pos!.title.removeNull(),
                                                        style: Theme.of(context).textTheme.displayMedium!.copyWith(fontSize: 14.0),
                                                      ),
                                                    ],
                                                  ),
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),
                                      Text(
                                        widget.pos.title.removeNull(),
                                        style: Theme.of(context).textTheme.displayMedium,
                                      ),
                                      // Row(
                                      //   children: [
                                      //     Expanded(
                                      //       child: Text(
                                      //         widget.pos.title.removeNull(),
                                      //         style: Theme.of(context).textTheme.displayMedium,
                                      //       ),
                                      //     ),
                                      //     if (_appCorporateUserCard.isNotEmpty && _appPos != null)
                                      //       GestureDetector(
                                      //         onTap: () => showUserCardSheet(
                                      //           getCorporateUserCardByUserAndTarget: _appCorporateUserCard,
                                      //           context: context,
                                      //           pos: _appPos,
                                      //         ),
                                      //         child: Container(
                                      //           padding: const EdgeInsets.symmetric(vertical: 3.0, horizontal: 6.0),
                                      //           margin: const EdgeInsets.only(left: 8.0),
                                      //           decoration: BoxDecoration(
                                      //             borderRadius: BorderRadius.circular(100.0),
                                      //             color: Theme.of(context).focusColor,
                                      //           ),
                                      //           child: Wrap(
                                      //             crossAxisAlignment: WrapCrossAlignment.center,
                                      //             runSpacing: 4.0,
                                      //             spacing: 4.0,
                                      //             children: [
                                      //               Text(
                                      //                 translate(context, 'loyaltyCard'),
                                      //                 style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                                      //                       fontSize: 14.0,
                                      //                     ),
                                      //               ),
                                      //               Icon(
                                      //                 CupertinoIcons.arrow_right,
                                      //                 color: Theme.of(context).colorScheme.secondary,
                                      //                 size: 14.0,
                                      //               ),
                                      //             ],
                                      //           ),
                                      //         ),
                                      //       ),
                                      //   ],
                                      // ),
                                      if (widget.pos.description.removeNull().isNotEmpty)
                                        Padding(
                                          padding: const EdgeInsets.only(top: 16.0),
                                          child: HtmlWidget(
                                            widget.pos.description.removeNull(),
                                          ),
                                        ),
                                      if (findLoyaltySettingsByTarget == null)
                                        LinkedAccountPosLandingShimmer(padding: const EdgeInsets.only(top: 16.0))
                                      else if (findLoyaltySettingsByTarget.aggregator?.target?.pos?.id == kPosID && _appWallet != null)
                                        GestureDetector(
                                          onTap: () async {
                                            BlocProvider.of<HomeTabIndexCubit>(context).updateValue(3);
                                            await addHomeTabIndexToSP(3);
                                            Navigator.pushNamed(context, '/Tabs');
                                          },
                                          child: Container(
                                            margin: const EdgeInsets.only(top: 16.0),
                                            padding: const EdgeInsets.all(16.0),
                                            height: 160.0,
                                            width: 160.0,
                                            decoration: BoxDecoration(
                                              borderRadius: BorderRadius.circular(8.0),
                                              border: Border.all(
                                                color: Theme.of(context).focusColor.withOpacity(1.0),
                                              ),
                                            ),
                                            child: Column(
                                              crossAxisAlignment: CrossAxisAlignment.start,
                                              mainAxisAlignment: MainAxisAlignment.spaceAround,
                                              mainAxisSize: MainAxisSize.min,
                                              children: [
                                                Container(
                                                  height: 50.0,
                                                  width: 50.0,
                                                  decoration: BoxDecoration(
                                                    borderRadius: BorderRadius.circular(100.0),
                                                    color: Theme.of(context).focusColor,
                                                  ),
                                                  child: Icon(
                                                    CupertinoIcons.creditcard_fill,
                                                    color: Theme.of(context).colorScheme.secondary,
                                                    size: 18.0,
                                                  ),
                                                ),
                                                const SizedBox(height: 8.0),
                                                Text(
                                                  translate(context, 'wallet'),
                                                  style: Theme.of(context).textTheme.bodyMedium,
                                                  overflow: TextOverflow.ellipsis,
                                                  softWrap: false,
                                                  maxLines: 1,
                                                ),
                                                const SizedBox(height: 8.0),
                                                QualitativeQuantitativeWidget(
                                                  textStyle: Theme.of(context).textTheme.displayMedium!.copyWith(fontSize: 16.0),
                                                  walletType: Enum$WalletTypeEnum.QUANTITATIVE,
                                                  baseUrl: _appWallet.coin?.picture?.baseUrl,
                                                  path: _appWallet.coin?.picture?.path,
                                                  amount: _appWallet.amount.toInteger(),
                                                  size: const Size(18.0, 18.0),
                                                  textAlign: TextAlign.center,
                                                ),
                                              ],
                                            ),
                                          ),
                                        )
                                      else if (getCurrentUserLinkedCorporateAccountByTarget == null)
                                        LinkedAccountPosLandingShimmer(padding: const EdgeInsets.only(top: 16.0))
                                      else if (getCurrentUserLinkedCorporateAccountByTarget.token.removeNull().isNotEmpty &&
                                          (getUserWalletWithReputations == null || getCurrentUserQuantitativeWallets == null))
                                        LinkedAccountPosLandingShimmer(padding: const EdgeInsets.only(top: 16.0))
                                      else if (getUserWalletWithReputations == null ||
                                          getCurrentUserQuantitativeWallets == null ||
                                          getCurrentUserLinkedCorporateAccountByTarget.token.removeNull().isEmpty ||
                                          (getUserWalletWithReputations.reputationLevels ?? []).isEmpty ||
                                          getCurrentUserQuantitativeWallets.objects.isEmpty)
                                        const SizedBox()
                                      else
                                        Padding(
                                          padding: const EdgeInsets.only(top: 16.0),
                                          child: Row(
                                            children: [
                                              Expanded(
                                                child: GestureDetector(
                                                  onTap: () => Navigator.push(
                                                    context,
                                                    MaterialPageRoute(
                                                      builder: (context) => PointOfSaleReputationWidget(
                                                        userToken: getCurrentUserLinkedCorporateAccountByTarget.token.removeNull(),
                                                        getUserWalletWithReputations: getUserWalletWithReputations,
                                                        userID: getCurrentUserLinkedCorporateAccountByTarget.user.id,
                                                        findLoyaltySettingsByTarget: findLoyaltySettingsByTarget,
                                                        pos: widget.pos,
                                                      ),
                                                    ),
                                                  ),
                                                  child: Container(
                                                    padding: const EdgeInsets.all(16.0),
                                                    alignment: Alignment.centerLeft,
                                                    height: 160.0,
                                                    decoration: BoxDecoration(
                                                      borderRadius: BorderRadius.circular(8.0),
                                                      color: Theme.of(context).focusColor,
                                                    ),
                                                    child: Column(
                                                      crossAxisAlignment: CrossAxisAlignment.start,
                                                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                                                      children: [
                                                        Stack(
                                                          alignment: Alignment.center,
                                                          clipBehavior: Clip.none,
                                                          children: [
                                                            ReputationUtils.isCurrentPreLevel(
                                                              getUserWalletWithReputations: getUserWalletWithReputations,
                                                              findLoyaltySettingsByTarget: findLoyaltySettingsByTarget,
                                                            )
                                                                ? SimpleCircularProgressBar(
                                                                    valueNotifier: ValueNotifier<double>(ReputationUtils.getWalletAmount(getUserWalletWithReputations).toDouble()),
                                                                    maxValue: (getUserWalletWithReputations.reputationLevels!.first.levelInterval?.max ?? 0).toDouble() -
                                                                        (getUserWalletWithReputations.reputationLevels!.first.levelInterval?.min ?? 0),
                                                                    backColor: ReputationUtils.getCurrentLevelColor(
                                                                      getUserWalletWithReputations: getUserWalletWithReputations,
                                                                      findLoyaltySettingsByTarget: findLoyaltySettingsByTarget,
                                                                    ).withOpacity(0.2),
                                                                    progressColors: [
                                                                      ReputationUtils.getCurrentLevelColor(
                                                                        findLoyaltySettingsByTarget: findLoyaltySettingsByTarget,
                                                                        getUserWalletWithReputations: getUserWalletWithReputations,
                                                                      ),
                                                                    ],
                                                                    fullProgressColor: ReputationUtils.getCurrentLevelColor(
                                                                      findLoyaltySettingsByTarget: findLoyaltySettingsByTarget,
                                                                      getUserWalletWithReputations: getUserWalletWithReputations,
                                                                    ),
                                                                    progressStrokeWidth: 8.0,
                                                                    backStrokeWidth: 8.0,
                                                                    size: 50.0,
                                                                  )
                                                                : SimpleCircularProgressBar(
                                                                    maxValue: (ReputationUtils.getCurrentLevel(getUserWalletWithReputations)?.levelInterval?.max ?? 0).toDouble() -
                                                                        (ReputationUtils.getCurrentLevel(getUserWalletWithReputations)?.levelInterval?.min ?? 0).toDouble(),
                                                                    valueNotifier: ValueNotifier<double>(
                                                                      ReputationUtils.getLevelAmountByLevel(
                                                                        getUserWalletWithReputations: getUserWalletWithReputations,
                                                                        reputationLevels: ReputationUtils.getCurrentLevel(getUserWalletWithReputations),
                                                                        index: (getUserWalletWithReputations.reputationLevels ?? []).indexWhere(
                                                                          (element) => element.id == ReputationUtils.getCurrentLevel(getUserWalletWithReputations)?.id,
                                                                        ),
                                                                      ).toDouble(),
                                                                    ),
                                                                    backColor: ReputationUtils.getCurrentLevelColor(
                                                                      findLoyaltySettingsByTarget: findLoyaltySettingsByTarget,
                                                                      getUserWalletWithReputations: getUserWalletWithReputations,
                                                                    ).withOpacity(0.2),
                                                                    progressColors: [
                                                                      ReputationUtils.getCurrentLevelColor(
                                                                        findLoyaltySettingsByTarget: findLoyaltySettingsByTarget,
                                                                        getUserWalletWithReputations: getUserWalletWithReputations,
                                                                      ),
                                                                    ],
                                                                    fullProgressColor: ReputationUtils.getCurrentLevelColor(
                                                                      findLoyaltySettingsByTarget: findLoyaltySettingsByTarget,
                                                                      getUserWalletWithReputations: getUserWalletWithReputations,
                                                                    ),
                                                                    progressStrokeWidth: 8.0,
                                                                    backStrokeWidth: 8.0,
                                                                    size: 50.0,
                                                                  ),
                                                            QualitativeQuantitativeWidget(
                                                              walletType: Enum$WalletTypeEnum.QUALITATIVE,
                                                              size: const Size(26.0, 26.0),
                                                              textAlign: TextAlign.center,
                                                              textStyle: null,
                                                              amount: null,
                                                            ),
                                                          ],
                                                        ),
                                                        const SizedBox(height: 8.0),
                                                        Text(
                                                          ReputationUtils.isCurrentPreLevel(
                                                            findLoyaltySettingsByTarget: findLoyaltySettingsByTarget,
                                                            getUserWalletWithReputations: getUserWalletWithReputations,
                                                          )
                                                              ? findLoyaltySettingsByTarget.prelevel?.name ?? '-'
                                                              : ReputationUtils.getCurrentLevel(getUserWalletWithReputations)?.reputationLevel ?? '-',
                                                          overflow: TextOverflow.ellipsis,
                                                          softWrap: false,
                                                          maxLines: 1,
                                                          style: Theme.of(context).textTheme.bodyMedium,
                                                        ),
                                                        const SizedBox(height: 8.0),
                                                        RichText(
                                                          text: TextSpan(
                                                            children: [
                                                              TextSpan(
                                                                text: ReputationUtils.isCurrentPreLevel(
                                                                  getUserWalletWithReputations: getUserWalletWithReputations,
                                                                  findLoyaltySettingsByTarget: findLoyaltySettingsByTarget,
                                                                )
                                                                    ? '${ReputationUtils.getWalletAmount(getUserWalletWithReputations)}'
                                                                    : '${ReputationUtils.getLevelAmountByLevel(
                                                                        getUserWalletWithReputations: getUserWalletWithReputations,
                                                                        reputationLevels: ReputationUtils.getCurrentLevel(getUserWalletWithReputations),
                                                                        index: (getUserWalletWithReputations.reputationLevels ?? [])
                                                                            .indexWhere((element) => element.id == ReputationUtils.getCurrentLevel(getUserWalletWithReputations)?.id),
                                                                      ).toDouble()}',
                                                                style: Theme.of(context).textTheme.displayMedium!.copyWith(fontSize: 16.0),
                                                              ),
                                                              TextSpan(
                                                                text: ' / ',
                                                                style: Theme.of(context).textTheme.bodyMedium,
                                                              ),
                                                              WidgetSpan(
                                                                child: QualitativeQuantitativeWidget(
                                                                  textStyle: Theme.of(context).textTheme.displayMedium!.copyWith(fontSize: 15.0),
                                                                  walletType: Enum$WalletTypeEnum.QUALITATIVE,
                                                                  amount: ReputationUtils.isCurrentPreLevel(
                                                                    findLoyaltySettingsByTarget: findLoyaltySettingsByTarget,
                                                                    getUserWalletWithReputations: getUserWalletWithReputations,
                                                                  )
                                                                      ? '${getUserWalletWithReputations.reputationLevels!.first.levelInterval?.max ?? 0} '.toInteger()
                                                                      : '${(ReputationUtils.getCurrentLevel(getUserWalletWithReputations)?.levelInterval?.max ?? 0) - (ReputationUtils.getCurrentLevel(getUserWalletWithReputations)?.levelInterval?.min ?? 0)} '
                                                                          .toInteger(),
                                                                  size: const Size(18.0, 18.0),
                                                                  textAlign: TextAlign.center,
                                                                ),
                                                              ),
                                                            ],
                                                          ),
                                                        ),
                                                      ],
                                                    ),
                                                  ),
                                                ),
                                              ),
                                              const SizedBox(width: 16.0),
                                              Expanded(
                                                child: GestureDetector(
                                                  onTap: () {
                                                    Navigator.push(
                                                      context,
                                                      MaterialPageRoute(
                                                        builder: (context) => PointOfSaleWalletWidget(
                                                          userToken: getCurrentUserLinkedCorporateAccountByTarget.token.removeNull(),
                                                          getCurrentUserQuantitativeWallets: getCurrentUserQuantitativeWallets,
                                                          userID: getCurrentUserLinkedCorporateAccountByTarget.user.id,
                                                          getUserWalletWithReputations: getUserWalletWithReputations,
                                                          findLoyaltySettingsByTarget: findLoyaltySettingsByTarget,
                                                          pos: widget.pos,
                                                        ),
                                                      ),
                                                    );
                                                  },
                                                  child: Container(
                                                    padding: const EdgeInsets.all(16.0),
                                                    height: 160.0,
                                                    decoration: BoxDecoration(
                                                      borderRadius: BorderRadius.circular(8.0),
                                                      border: Border.all(
                                                        color: Theme.of(context).focusColor.withOpacity(1.0),
                                                      ),
                                                    ),
                                                    child: Column(
                                                      crossAxisAlignment: CrossAxisAlignment.start,
                                                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                                                      mainAxisSize: MainAxisSize.min,
                                                      children: [
                                                        Container(
                                                          height: 50.0,
                                                          width: 50.0,
                                                          decoration: BoxDecoration(
                                                            borderRadius: BorderRadius.circular(100.0),
                                                            color: Theme.of(context).focusColor,
                                                          ),
                                                          child: Icon(
                                                            CupertinoIcons.creditcard_fill,
                                                            color: Theme.of(context).colorScheme.secondary,
                                                            size: 18.0,
                                                          ),
                                                        ),
                                                        const SizedBox(height: 8.0),
                                                        Text(
                                                          translate(context, 'wallet'),
                                                          style: Theme.of(context).textTheme.bodyMedium,
                                                          overflow: TextOverflow.ellipsis,
                                                          softWrap: false,
                                                          maxLines: 1,
                                                        ),
                                                        const SizedBox(height: 8.0),
                                                        QualitativeQuantitativeWidget(
                                                          baseUrl: getCurrentUserQuantitativeWallets.objects.first.coin?.picture?.baseUrl,
                                                          textStyle: Theme.of(context).textTheme.displayMedium!.copyWith(fontSize: 16.0),
                                                          amount: getCurrentUserQuantitativeWallets.objects.first.amount.toInteger(),
                                                          path: getCurrentUserQuantitativeWallets.objects.first.coin?.picture?.path,
                                                          walletType: Enum$WalletTypeEnum.QUANTITATIVE,
                                                          size: const Size(18.0, 18.0),
                                                          textAlign: TextAlign.center,
                                                        ),
                                                      ],
                                                    ),
                                                  ),
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),
                                      if (findLoyaltySettingsByTarget != null &&
                                          getCurrentUserLinkedCorporateAccountByTarget != null &&
                                          getCurrentUserLinkedCorporateAccountByTarget.token.removeNull().isEmpty &&
                                          findLoyaltySettingsByTarget.aggregator?.target?.pos?.id != kPosID)
                                        Padding(
                                          padding: const EdgeInsets.only(top: 16.0),
                                          child: TextButton(
                                            style: TextButton.styleFrom(
                                              minimumSize: const Size.fromHeight(40.0),
                                              backgroundColor: kAppColor,
                                              shape: RoundedRectangleBorder(
                                                borderRadius: BorderRadius.circular(8.0),
                                              ),
                                            ),
                                            onPressed: () async => Navigator.push(
                                              context,
                                              MaterialPageRoute(
                                                builder: (context) => RequestLinkAccountWidget(
                                                  pos: widget.pos,
                                                ),
                                              ),
                                            ),
                                            child: Text(
                                              translate(context, 'connectToThisPartner'),
                                              textAlign: TextAlign.center,
                                              style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                                                    color: Colors.white,
                                                  ),
                                            ),
                                          ),
                                        ),
                                      const SizedBox(height: 16.0),
                                      Row(
                                        children: [
                                          Container(
                                            height: 32.0,
                                            width: 4.0,
                                            decoration: BoxDecoration(
                                              color: kAppColor,
                                              borderRadius: const BorderRadius.only(
                                                topRight: Radius.circular(8.0),
                                                bottomRight: Radius.circular(8.0),
                                              ),
                                            ),
                                          ),
                                          const SizedBox(width: 8.0),
                                          Expanded(
                                            child: Text(
                                              translate(context, 'information'),
                                              style: Theme.of(context).textTheme.bodyLarge,
                                            ),
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 16.0),
                                      Row(
                                        children: [
                                          Icon(
                                            CupertinoIcons.location_solid,
                                            color: Theme.of(context).colorScheme.secondary,
                                            size: 18.0,
                                          ),
                                          const SizedBox(width: 8.0),
                                          Expanded(
                                            child: Text(
                                              (widget.pos.locations ?? []).isEmpty ? translate(context, 'noDataFound') : _getAddress(widget.pos.locations!.first),
                                              style: Theme.of(context).textTheme.bodyMedium,
                                            ),
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 16.0),
                                      GestureDetector(
                                        onTap: (widget.pos.phone ?? []).isEmpty ? null : () => callNumber(widget.pos.phone!.first),
                                        child: Row(
                                          children: [
                                            Icon(
                                              CupertinoIcons.phone_fill,
                                              color: Theme.of(context).colorScheme.secondary,
                                              size: 18.0,
                                            ),
                                            const SizedBox(width: 8.0),
                                            Expanded(
                                              child: Text(
                                                (widget.pos.phone ?? []).isEmpty ? translate(context, 'noDataFound') : widget.pos.phone!.first,
                                                style: Theme.of(context).textTheme.bodyMedium,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                      const SizedBox(height: 16.0),
                                      Row(
                                        children: [
                                          Icon(
                                            CupertinoIcons.mail_solid,
                                            color: Theme.of(context).colorScheme.secondary,
                                            size: 18.0,
                                          ),
                                          const SizedBox(width: 8.0),
                                          Expanded(
                                            child: Text(
                                              (widget.pos.email ?? []).isEmpty ? translate(context, 'noDataFound') : widget.pos.email!.first,
                                              style: Theme.of(context).textTheme.bodyMedium,
                                            ),
                                          ),
                                        ],
                                      ),
                                      if ((widget.pos.socialMedia ?? []).isNotEmpty)
                                        Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          mainAxisSize: MainAxisSize.min,
                                          children: [
                                            const SizedBox(height: 16.0),
                                            Row(
                                              children: [
                                                Container(
                                                  height: 32.0,
                                                  width: 4.0,
                                                  decoration: BoxDecoration(
                                                    color: kAppColor,
                                                    borderRadius: const BorderRadius.only(
                                                      topRight: Radius.circular(8.0),
                                                      bottomRight: Radius.circular(8.0),
                                                    ),
                                                  ),
                                                ),
                                                const SizedBox(width: 8.0),
                                                Expanded(
                                                  child: Text(
                                                    translate(context, 'socialMedia'),
                                                    style: Theme.of(context).textTheme.bodyLarge,
                                                  ),
                                                ),
                                              ],
                                            ),
                                            const SizedBox(height: 16.0),
                                            Align(
                                              alignment: Alignment.centerLeft,
                                              child: Wrap(
                                                crossAxisAlignment: WrapCrossAlignment.center,
                                                runSpacing: 16.0,
                                                spacing: 16.0,
                                                children: List.generate(
                                                  (widget.pos.socialMedia ?? []).length,
                                                  (index) => GestureDetector(
                                                    onTap: () => openUrl(widget.pos.socialMedia![index].value.removeNull()),
                                                    child: Container(
                                                      padding: const EdgeInsets.all(8.0),
                                                      decoration: BoxDecoration(
                                                        color: Theme.of(context).focusColor,
                                                        borderRadius: BorderRadius.circular(100.0),
                                                      ),
                                                      child: Wrap(
                                                        crossAxisAlignment: WrapCrossAlignment.center,
                                                        runSpacing: 8.0,
                                                        spacing: 8.0,
                                                        children: [
                                                          _getSocialImage(widget.pos.socialMedia![index].name).isEmpty
                                                              ? SharedImageProviderWidget(
                                                                  imageUrl: kEmptyPicture,
                                                                  color: Theme.of(context).colorScheme.secondary,
                                                                  width: 26.0,
                                                                  height: 26.0,
                                                                  fit: BoxFit.cover,
                                                                )
                                                              : SharedImageProviderWidget(
                                                                  imageUrl: _getSocialImage(widget.pos.socialMedia![index].name),
                                                                  borderRadius: BorderRadius.zero,
                                                                  fit: BoxFit.cover,
                                                                  height: 30.0,
                                                                  width: 30.0,
                                                                ),
                                                          Text(
                                                            widget.pos.socialMedia![index].name?.name ?? '',
                                                            style: Theme.of(context).textTheme.bodyMedium,
                                                          ),
                                                        ],
                                                      ),
                                                    ),
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
                            ]),
                          ),
                        ],
                      ),
                    );
                  },
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
