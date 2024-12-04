import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-card-user-card.graphql.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-wallet-transaction.graphql.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-wallet-wallet.graphql.dart';
import 'package:flutter_loyalcraft_gql/graphql/point-of-sale.graphql.dart';
import 'package:flutter_loyalcraft_gql/graphql/user.graphql.dart';
import 'package:flutter_loyalcraft_gql/schema.graphql.dart';
import 'package:loyalcraft/localizations_delegate/app_localizations.dart';
import 'package:loyalcraft/src/bloc/home_tab_index.dart';
import 'package:loyalcraft/src/bloc/variable.dart';
import 'package:loyalcraft/src/bloc/wallet_transaction.dart';
import 'package:loyalcraft/src/data/consts.dart';
import 'package:loyalcraft/src/data/graphql_client.dart';
import 'package:loyalcraft/src/modal_bottom_sheet/user_card.dart';
import 'package:loyalcraft/src/repository/wallet_transaction.dart';
import 'package:loyalcraft/src/screens/phone_refill.dart';
import 'package:loyalcraft/src/widgets/empty.dart';
import 'package:loyalcraft/src/widgets/quantitative_wallet_item.dart';
import 'package:loyalcraft/src/widgets/see_more.dart';
import 'package:loyalcraft/src/widgets/shimmers.dart';
import 'package:loyalcraft/src/widgets/tabs_app_bar.dart';
import 'package:loyalcraft/src/widgets/transaction_item.dart';

// ignore: must_be_immutable
class WalletWidget extends StatefulWidget {
  WalletWidget({
    Key? key,
    required this.wallet,
    required this.user,
    required this.pos,
    required this.locale,
    required this.getCorporateUserCardByUserAndTarget,
    required this.notificationCount,
    required this.isRtl,
  }) : super(key: key);
  bool isRtl;
  int notificationCount;
  Query$getCurrentUserQuantitativeWallets$getCurrentUserQuantitativeWallets$objects? wallet;
  Query$user$user user;
  Query$pointOfSale$pointOfSale pos;
  List<Query$getCorporateUserCardByUserAndTarget$getCorporateUserCardByUserAndTarget> getCorporateUserCardByUserAndTarget;
  Locale locale;
  @override
  _WalletWidget createState() => _WalletWidget();
}

class _WalletWidget extends State<WalletWidget> {
  late GetWalletTransactionsByAffectedPaginatedCubit _getWalletTransactionsByAffectedPaginatedCubit;
  late WalletTransactionRepository _walletTransactionRepository;
  final SGraphQLClient _sGraphQLClient = SGraphQLClient();
  late VariableCubit<int> _pageCubit;
  late VariableCubit<bool> _isLoadingCubit;

  Future<void> _initState() async {
    _walletTransactionRepository = WalletTransactionRepository(_sGraphQLClient);
    _getWalletTransactionsByAffectedPaginatedCubit = GetWalletTransactionsByAffectedPaginatedCubit(_walletTransactionRepository);
    _pageCubit = VariableCubit(value: 0);
    _isLoadingCubit = VariableCubit(value: false);

    _getWalletTransactionsByAffectedPaginatedCubit.getWalletTransactionsByAffectedPaginated(
      addToSP: true,
      variables: Variables$Query$getWalletTransactionsByAffectedPaginated(
        pagination: Input$PaginationInput(
          limit: kPaginationLimit,
          page: _pageCubit.state,
        ),
        filter: Input$WalletTransactionsByAffectedFilterInput(
          affected: [
            Input$TargetTransferInput(
              user: kUserID,
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
          BlocProvider(create: (context) => _getWalletTransactionsByAffectedPaginatedCubit),
          BlocProvider(create: (context) => _isLoadingCubit),
          BlocProvider(create: (context) => _pageCubit),
        ],
        child: BlocBuilder<GetWalletTransactionsByAffectedPaginatedCubit, Query$getWalletTransactionsByAffectedPaginated$getWalletTransactionsByAffectedPaginated?>(
          bloc: _getWalletTransactionsByAffectedPaginatedCubit,
          builder: (context, getWalletTransactionsByAffectedPaginated) => BlocBuilder<VariableCubit, dynamic>(
            bloc: _isLoadingCubit,
            builder: (context, isLoading) => RefreshIndicator(
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
                      wallet: widget.wallet,
                      user: widget.user,
                      title: translate(context, 'wallet'),
                    ),
                    const SizedBox(height: 16.0),
                    widget.wallet == null
                        ? QuantitativeWalletShimmer(
                            padding: EdgeInsets.zero,
                          )
                        : QuantitativeWalletWidget(
                            wallet: widget.wallet!,
                          ),
                    const SizedBox(height: 16.0),
                    Wrap(
                      runSpacing: 16.0,
                      spacing: 16.0,
                      children: [
                        SizedBox(
                          width: 60.0,
                          child: Column(
                            children: [
                              GestureDetector(
                                onTap: () => showUserCardSheet(
                                  getCorporateUserCardByUserAndTarget: widget.getCorporateUserCardByUserAndTarget,
                                  context: context,
                                  pos: widget.pos,
                                ),
                                child: Container(
                                  padding: const EdgeInsets.all(2.0),
                                  height: 60.0,
                                  width: 60.0,
                                  decoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(100.0),
                                    border: Border.all(
                                      color: isLoading ? Theme.of(context).focusColor.withOpacity(0.6) : Theme.of(context).focusColor.withOpacity(1.0),
                                    ),
                                  ),
                                  child: Container(
                                    decoration: BoxDecoration(
                                      borderRadius: BorderRadius.circular(100.0),
                                      color: isLoading ? Theme.of(context).focusColor.withOpacity(0.6) : Theme.of(context).focusColor.withOpacity(1.0),
                                    ),
                                    child: Icon(
                                      CupertinoIcons.person_crop_rectangle_fill,
                                      color: isLoading ? Theme.of(context).colorScheme.secondary.withOpacity(0.6) : Theme.of(context).colorScheme.secondary,
                                      size: 18.0,
                                    ),
                                  ),
                                ),
                              ),
                              const SizedBox(height: 4.0),
                              Text(
                                translate(context, 'loyaltyCard').replaceAll(' ', '\n'),
                                textAlign: TextAlign.center,
                                style: Theme.of(context).textTheme.bodyMedium!.copyWith(
                                      color: isLoading ? Theme.of(context).colorScheme.secondary.withOpacity(0.6) : Theme.of(context).colorScheme.secondary,
                                    ),
                              ),
                            ],
                          ),
                        ),
                        SizedBox(
                          width: 60.0,
                          child: Column(
                            children: [
                              GestureDetector(
                                onTap: () {
                                  BlocProvider.of<HomeTabIndexCubit>(context).updateValue(2);
                                },
                                child: Container(
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
                              ),
                              const SizedBox(height: 4.0),
                              Text(
                                translate(context, 'playQuests').replaceAll(' ', '\n'),
                                textAlign: TextAlign.center,
                                style: Theme.of(context).textTheme.bodyMedium,
                              ),
                            ],
                          ),
                        ),
                        SizedBox(
                          width: 60.0,
                          child: Column(
                            children: [
                              GestureDetector(
                                onTap: () => Navigator.push(context, MaterialPageRoute(builder: (context) => const PhoneRefillWidget())),
                                child: Container(
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
                                      CupertinoIcons.square_favorites_alt_fill,
                                      color: Theme.of(context).colorScheme.secondary,
                                      size: 18.0,
                                    ),
                                  ),
                                ),
                              ),
                              const SizedBox(height: 4.0),
                              Text(
                                translate(context, 'phoneRefill').replaceAll(' ', '\n'),
                                textAlign: TextAlign.center,
                                style: Theme.of(context).textTheme.bodyMedium,
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16.0),
                    Text(
                      translate(context, 'transactions'),
                      style: Theme.of(context).textTheme.bodyLarge,
                    ),
                    const SizedBox(height: 16.0),
                    getWalletTransactionsByAffectedPaginated == null
                        ? ListViewShimmer(
                            padding: EdgeInsets.zero,
                          )
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
                                  userId: kUserID,
                                  showQualitative: false,
                                  locale: widget.locale,
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

                            if (_getWalletTransactionsByAffectedPaginatedCubit.state?.isLast == false) {
                              final newData = await _walletTransactionRepository.getWalletTransactionsByAffectedPaginated(
                                Variables$Query$getWalletTransactionsByAffectedPaginated(
                                  pagination: Input$PaginationInput(
                                    limit: kPaginationLimit,
                                    page: _pageCubit.state! + 1,
                                  ),
                                  filter: Input$WalletTransactionsByAffectedFilterInput(
                                    affected: [
                                      Input$TargetTransferInput(
                                        user: kUserID,
                                      ),
                                    ],
                                    walletType: [
                                      Enum$WalletTypeEnum.QUANTITATIVE,
                                    ],
                                  ),
                                ),
                              );
                              if ((newData?.objects ?? []).isNotEmpty) {
                                _getWalletTransactionsByAffectedPaginatedCubit.addReadyObjects(newData);
                                _pageCubit.updateValue(_pageCubit.state! + 1);
                              }
                            }

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
