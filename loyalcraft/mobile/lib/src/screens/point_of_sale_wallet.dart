import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_diktup_utilities/extensions.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-loyalty-settings.graphql.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-wallet-transaction.graphql.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-wallet-wallet.graphql.dart';
import 'package:flutter_loyalcraft_gql/graphql/point-of-sale.graphql.dart';
import 'package:flutter_loyalcraft_gql/schema.graphql.dart';
import 'package:loyalcraft/localizations_delegate/app_localizations.dart';
import 'package:loyalcraft/src/bloc/home_tab_index.dart';
import 'package:loyalcraft/src/bloc/locale.dart';
import 'package:loyalcraft/src/bloc/variable.dart';
import 'package:loyalcraft/src/bloc/wallet.dart';
import 'package:loyalcraft/src/bloc/wallet_transaction.dart';
import 'package:loyalcraft/src/data/consts.dart';
import 'package:loyalcraft/src/data/graphql_client.dart';
import 'package:loyalcraft/src/repository/wallet_transaction.dart';
import 'package:loyalcraft/src/screens/conversion.dart';
import 'package:loyalcraft/src/utils/image_cache_manager/shared_image_provider.dart';
import 'package:loyalcraft/src/widgets/empty.dart';
import 'package:loyalcraft/src/widgets/quantitative_wallet_item.dart';
import 'package:loyalcraft/src/widgets/see_more.dart';
import 'package:loyalcraft/src/widgets/shimmers.dart';
import 'package:loyalcraft/src/widgets/transaction_item.dart';

// ignore: must_be_immutable
class PointOfSaleWalletWidget extends StatefulWidget {
  PointOfSaleWalletWidget({
    Key? key,
    required this.getCurrentUserQuantitativeWallets,
    required this.userToken,
    required this.findLoyaltySettingsByTarget,
    required this.userID,
    required this.getUserWalletWithReputations,
    required this.pos,
  }) : super(key: key);
  Query$getCurrentUserQuantitativeWallets$getCurrentUserQuantitativeWallets? getCurrentUserQuantitativeWallets;
  Query$pointOfSale$pointOfSale pos;
  String userToken;
  String userID;
  Query$findLoyaltySettingsByTarget$findLoyaltySettingsByTarget? findLoyaltySettingsByTarget;
  Query$getUserWalletWithReputations$getUserWalletWithReputations? getUserWalletWithReputations;
  @override
  _PointOfSaleWalletWidget createState() => _PointOfSaleWalletWidget();
}

class _PointOfSaleWalletWidget extends State<PointOfSaleWalletWidget> {
  late GetWalletTransactionsByAffectedPaginatedCubit _getWalletTransactionsByAffectedPaginatedCubit;
  late WalletTransactionRepository _walletTransactionRepository;
  final SGraphQLClient _sGraphQLClient = SGraphQLClient();
  late VariableCubit<int> _pageCubit;
  late VariableCubit<bool> _isLoadingCubit;
  late VariableCubit _tabIndex;

  Future<void> _initState() async {
    _walletTransactionRepository = WalletTransactionRepository(_sGraphQLClient);
    _getWalletTransactionsByAffectedPaginatedCubit = GetWalletTransactionsByAffectedPaginatedCubit(_walletTransactionRepository);
    _pageCubit = VariableCubit(value: 0);
    _tabIndex = VariableCubit(value: 0);
    _isLoadingCubit = VariableCubit(value: false);
    _getWalletTransactionsByAffectedPaginatedCubit.getWalletTransactionsByAffectedPaginated(
      addToSP: false,
      variables: Variables$Query$getWalletTransactionsByAffectedPaginated(
        pagination: Input$PaginationInput(
          limit: kPaginationLimit,
          page: _pageCubit.state,
        ),
        filter: Input$WalletTransactionsByAffectedFilterInput(
          affected: [
            Input$TargetTransferInput(
              user: widget.userID,
            ),
          ],
          walletType: [
            Enum$WalletTypeEnum.QUANTITATIVE,
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    _tabIndex.close();
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
    final _currentUserQuantitativeWallets = context.watch<CurrentUserQuantitativeWalletsCubit>().state;
    return MultiBlocProvider(
      providers: [
        BlocProvider(create: (context) => _getWalletTransactionsByAffectedPaginatedCubit),
        BlocProvider(create: (context) => _tabIndex),
        BlocProvider(create: (context) => _pageCubit),
        BlocProvider(create: (context) => _isLoadingCubit),
      ],
      child: BlocBuilder<GetWalletTransactionsByAffectedPaginatedCubit, Query$getWalletTransactionsByAffectedPaginated$getWalletTransactionsByAffectedPaginated?>(
        bloc: _getWalletTransactionsByAffectedPaginatedCubit,
        builder: (context, getWalletTransactionsByAffectedPaginated) => BlocBuilder<VariableCubit, dynamic>(
          bloc: _isLoadingCubit,
          builder: (context, isLoading) => BlocBuilder<VariableCubit, dynamic>(
            bloc: _tabIndex,
            builder: (context, tabIndex) => Scaffold(
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
                        translate(context, 'wallet'),
                        style: Theme.of(context).textTheme.headlineSmall,
                      ),
                    ),
                  ],
                ),
              ),
              body: ListView(
                padding: const EdgeInsets.all(16.0),
                shrinkWrap: true,
                primary: false,
                children: [
                  Row(
                    children: [
                      ((widget.pos.picture?.baseUrl ?? '').isEmpty || (widget.pos.picture?.path ?? '').isEmpty)
                          ? Hero(
                              tag: kEmptyPicture,
                              child: Container(
                                width: 40.0,
                                height: 40.0,
                                padding: const EdgeInsets.all(8.0),
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(100.0),
                                  color: Theme.of(context).focusColor,
                                ),
                                child: SharedImageProviderWidget(
                                  imageUrl: kEmptyPicture,
                                  color: Theme.of(context).colorScheme.secondary,
                                  width: 40.0,
                                  height: 40.0,
                                  fit: BoxFit.cover,
                                ),
                              ),
                            )
                          : Hero(
                              tag: '${widget.pos.picture!.baseUrl}/${widget.pos.picture!.path}',
                              child: SharedImageProviderWidget(
                                imageUrl: '${widget.pos.picture!.baseUrl}/${widget.pos.picture!.path}',
                                backgroundColor: Theme.of(context).focusColor,
                                borderRadius: BorderRadius.circular(100.0),
                                fit: BoxFit.cover,
                                width: 40.0,
                                height: 40.0,
                              ),
                            ),
                      const SizedBox(width: 8.0),
                      Expanded(
                        child: Text(
                          widget.pos.title.removeNull(),
                          style: Theme.of(context).textTheme.displayMedium!.copyWith(
                                fontSize: 15.0,
                              ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16.0),
                  QuantitativeWalletWidget(
                    wallet: widget.getCurrentUserQuantitativeWallets!.objects.first,
                  ),
                  const SizedBox(height: 16.0),
                  Wrap(
                    runSpacing: 16.0,
                    spacing: 16.0,
                    children: [
                      GestureDetector(
                        onTap: () {
                          BlocProvider.of<HomeTabIndexCubit>(context).updateValue(2);
                          Navigator.of(context).pushNamedAndRemoveUntil('/Tabs', (route) => false);
                        },
                        child: SizedBox(
                          width: 60.0,
                          child: Column(
                            children: [
                              Container(
                                padding: const EdgeInsets.all(2.0),
                                height: 60.0,
                                width: 60.0,
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(100.0),
                                  border: Border.all(
                                    color: Theme.of(context).focusColor.withOpacity(1.0),
                                  ),
                                ),
                                child: Container(
                                  decoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(100.0),
                                    color: Theme.of(context).focusColor,
                                  ),
                                  child: Icon(
                                    CupertinoIcons.play_rectangle_fill,
                                    color: Theme.of(context).colorScheme.secondary,
                                    size: 18.0,
                                  ),
                                ),
                              ),
                              const SizedBox(height: 4.0),
                              Text(
                                translate(context, 'quests'),
                                maxLines: 1,
                                textAlign: TextAlign.center,
                                overflow: TextOverflow.ellipsis,
                                softWrap: false,
                                style: Theme.of(context).textTheme.bodyMedium,
                              ),
                            ],
                          ),
                        ),
                      ),
                      GestureDetector(
                        onTap: () => Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => ConversionWidget(
                              getCurrentUserQuantitativeWallets: widget.getCurrentUserQuantitativeWallets,
                              appQuantitativeWallet: _currentUserQuantitativeWallets,
                              pos: widget.pos,
                            ),
                          ),
                        ),
                        child: SizedBox(
                          width: 60.0,
                          child: Column(
                            children: [
                              Container(
                                padding: const EdgeInsets.all(2.0),
                                height: 60.0,
                                width: 60.0,
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(100.0),
                                  border: Border.all(
                                    color: Theme.of(context).focusColor.withOpacity(1.0),
                                  ),
                                ),
                                child: Container(
                                  decoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(100.0),
                                    color: Theme.of(context).focusColor,
                                  ),
                                  child: Icon(
                                    CupertinoIcons.arrow_2_circlepath,
                                    color: Theme.of(context).colorScheme.secondary,
                                    size: 18.0,
                                  ),
                                ),
                              ),
                              const SizedBox(height: 4.0),
                              Text(
                                translate(context, 'conversion'),
                                textAlign: TextAlign.center,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                softWrap: false,
                                style: Theme.of(context).textTheme.bodyMedium,
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16.0),
                  Row(
                    children: [
                      Expanded(
                        child: GestureDetector(
                          onTap: () {
                            _pageCubit.updateValue(0);
                            _tabIndex.updateValue(0);
                            _getWalletTransactionsByAffectedPaginatedCubit
                              ..setNull()
                              ..getWalletTransactionsByAffectedPaginated(
                                addToSP: false,
                                variables: Variables$Query$getWalletTransactionsByAffectedPaginated(
                                  pagination: Input$PaginationInput(
                                    limit: kPaginationLimit,
                                    page: _pageCubit.state,
                                  ),
                                  filter: Input$WalletTransactionsByAffectedFilterInput(
                                    affected: [
                                      Input$TargetTransferInput(
                                        user: widget.userID,
                                      ),
                                    ],
                                    walletType: [
                                      Enum$WalletTypeEnum.QUANTITATIVE,
                                    ],
                                  ),
                                ),
                              );
                          },
                          child: Container(
                            padding: const EdgeInsets.all(8.0),
                            decoration: BoxDecoration(
                              color: tabIndex == 0 ? kAppColor : Theme.of(context).focusColor,
                              borderRadius: const BorderRadius.only(
                                topLeft: Radius.circular(8.0),
                                bottomLeft: Radius.circular(8.0),
                              ),
                            ),
                            child: Text(
                              widget.getCurrentUserQuantitativeWallets!.objects.first.coin?.name ?? '',
                              textAlign: TextAlign.center,
                              style: Theme.of(context).textTheme.bodyMedium!.copyWith(
                                    color: tabIndex == 0 ? Colors.white : Theme.of(context).colorScheme.secondary,
                                  ),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8.0),
                      Expanded(
                        child: GestureDetector(
                          onTap: () {
                            _pageCubit.updateValue(0);
                            _tabIndex.updateValue(1);
                            _getWalletTransactionsByAffectedPaginatedCubit
                              ..setNull()
                              ..getWalletTransactionsByAffectedPaginated(
                                addToSP: false,
                                variables: Variables$Query$getWalletTransactionsByAffectedPaginated(
                                  pagination: Input$PaginationInput(
                                    limit: kPaginationLimit,
                                    page: _pageCubit.state,
                                  ),
                                  filter: Input$WalletTransactionsByAffectedFilterInput(
                                    affected: [
                                      Input$TargetTransferInput(
                                        user: widget.userID,
                                      ),
                                    ],
                                    walletType: [
                                      Enum$WalletTypeEnum.QUALITATIVE,
                                    ],
                                  ),
                                ),
                              );
                          },
                          child: Container(
                            padding: const EdgeInsets.all(8.0),
                            decoration: BoxDecoration(
                              color: tabIndex == 1 ? kAppColor : Theme.of(context).focusColor,
                              borderRadius: const BorderRadius.only(
                                topRight: Radius.circular(8.0),
                                bottomRight: Radius.circular(8.0),
                              ),
                            ),
                            child: Text(
                              translate(context, 'points'),
                              textAlign: TextAlign.center,
                              style: Theme.of(context).textTheme.bodyMedium!.copyWith(
                                    color: tabIndex == 1 ? Colors.white : Theme.of(context).colorScheme.secondary,
                                  ),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16.0),
                  getWalletTransactionsByAffectedPaginated == null
                      ? ListViewShimmer(padding: EdgeInsets.zero)
                      : getWalletTransactionsByAffectedPaginated.objects.isEmpty
                          ? EmptyWidget(
                              description: translate(context, 'walletTransactionEmptyDescription'),
                              title: translate(context, 'walletTransactionEmptyTitle'),
                              iconData: CupertinoIcons.creditcard_fill,
                              padding: EdgeInsets.zero,
                            )
                          : ListView.separated(
                              itemBuilder: (context, index) => TransactionItemWidget(
                                transaction: getWalletTransactionsByAffectedPaginated.objects[index],
                                userId: widget.userID,
                                showQualitative: true,
                                locale: _locale,
                              ),
                              itemCount: getWalletTransactionsByAffectedPaginated.objects.length,
                              separatorBuilder: (context, index) => const SizedBox(height: 16.0),
                              physics: const NeverScrollableScrollPhysics(),
                              padding: EdgeInsets.zero,
                              shrinkWrap: true,
                              primary: false,
                            ),
                  if ((getWalletTransactionsByAffectedPaginated?.isLast ?? true) == false)
                    BlocBuilder<VariableCubit, dynamic>(
                      bloc: _pageCubit,
                      builder: (context, page) => SeeMoreWidget(
                        isLoading: isLoading,
                        onTap: () async {
                          _isLoadingCubit.updateValue(true);
                          _pageCubit.updateValue(_pageCubit.state! + 1);
                          await _getWalletTransactionsByAffectedPaginatedCubit.addObjects(
                            Variables$Query$getWalletTransactionsByAffectedPaginated(
                              pagination: Input$PaginationInput(
                                limit: kPaginationLimit,
                                page: _pageCubit.state,
                              ),
                              filter: Input$WalletTransactionsByAffectedFilterInput(
                                affected: [
                                  Input$TargetTransferInput(
                                    user: widget.userID,
                                  ),
                                ],
                                walletType: [
                                  tabIndex == 0 ? Enum$WalletTypeEnum.QUANTITATIVE : Enum$WalletTypeEnum.QUALITATIVE,
                                ],
                              ),
                            ),
                          );

                          _isLoadingCubit.updateValue(false);
                        },
                      ),
                    ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
