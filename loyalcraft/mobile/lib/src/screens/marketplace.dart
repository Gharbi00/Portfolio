import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_loyalcraft_gql/graphql/corporate-internal-product.graphql.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-wallet-wallet.graphql.dart';
import 'package:flutter_loyalcraft_gql/graphql/user.graphql.dart';
import 'package:flutter_loyalcraft_gql/schema.graphql.dart';
import 'package:flutter_staggered_grid_view/flutter_staggered_grid_view.dart';
import 'package:loyalcraft/localizations_delegate/app_localizations.dart';
import 'package:loyalcraft/src/bloc/corporate_internal_product.dart';
import 'package:loyalcraft/src/bloc/variable.dart';
import 'package:loyalcraft/src/data/consts.dart';
import 'package:loyalcraft/src/data/graphql_client.dart';
import 'package:loyalcraft/src/repository/corporate_internal_product_repository.dart';
import 'package:loyalcraft/src/widgets/empty.dart';
import 'package:loyalcraft/src/widgets/product_item.dart';
import 'package:loyalcraft/src/widgets/search_bar.dart';
import 'package:loyalcraft/src/widgets/shimmers.dart';
import 'package:loyalcraft/src/widgets/tabs_app_bar.dart';

// ignore: must_be_immutable
class MarketplaceWidget extends StatefulWidget {
  MarketplaceWidget({
    Key? key,
    required this.notificationCount,
    required this.wallet,
    required this.isRtl,
    required this.user,
  }) : super(key: key);
  int notificationCount;
  Query$user$user user;
  bool isRtl;
  Query$getCurrentUserQuantitativeWallets$getCurrentUserQuantitativeWallets$objects? wallet;

  @override
  _MarketplaceWidget createState() => _MarketplaceWidget();
}

class _MarketplaceWidget extends State<MarketplaceWidget> {
  _MarketplaceWidget() {
    _scrollController.addListener(() async {
      var isEnd = (_scrollController.offset == _scrollController.position.maxScrollExtent);

      if (isEnd) {
        if (_getSimpleProductsWithRatingsWithFavoriteStatusWithFilterCubit.state?.isLast == false) {
          final newData = await _corporateInternalProductRepository.getSimpleProductsWithRatingsWithFavoriteStatusWithFilter(
            _queryVariablesCubit.state!.copyWith(pagination: _queryVariablesCubit.state!.pagination!.copyWith(page: _pageCubit.state! + 1)),
          );
          if ((newData?.objects ?? []).isNotEmpty) {
            _getSimpleProductsWithRatingsWithFavoriteStatusWithFilterCubit.addReadyObjects(
              newData,
            );
            _pageCubit.updateValue(_pageCubit.state! + 1);
          }
        }
      }
    });
  }

  late GetSimpleProductsWithRatingsWithFavoriteStatusWithFilterCubit _getSimpleProductsWithRatingsWithFavoriteStatusWithFilterCubit;
  late VariableCubit<Variables$Query$getSimpleProductsWithRatingsWithFavoriteStatusWithFilter> _queryVariablesCubit;
  late CorporateInternalProductRepository _corporateInternalProductRepository;
  final ScrollController _scrollController = ScrollController();
  final SGraphQLClient _sGraphQLClient = SGraphQLClient();
  late VariableCubit<int> _pageCubit;
  late VariableCubit<String> _fitlerTabCubit;

  final List<String> _filterTabList = [
    'alphabetically',
    'mostRecent',
    'priceLowestToHighest',
    'priceHighestToLowest',
  ];

  Future<void> _initState() async {
    _corporateInternalProductRepository = CorporateInternalProductRepository(_sGraphQLClient);
    _getSimpleProductsWithRatingsWithFavoriteStatusWithFilterCubit = GetSimpleProductsWithRatingsWithFavoriteStatusWithFilterCubit(_corporateInternalProductRepository);
    _pageCubit = VariableCubit(value: 0);
    _fitlerTabCubit = VariableCubit(value: '');
    _queryVariablesCubit = VariableCubit(
      value: Variables$Query$getSimpleProductsWithRatingsWithFavoriteStatusWithFilter(
        pagination: Input$PaginationInput(
          limit: kPaginationLimit,
          page: _pageCubit.state,
        ),
        filter: Input$InternalProductFilterInput(
          variety: [Enum$ProductVarietyEnum.PRODUCT],
          status: [Enum$ProductStatusEnum.ACTIVE],
          target: Input$TargetsInput(
            pos: [
              '62a2fb779577aff6c1dde8a5',
            ],
          ),
        ),
      ),
    );

    await _getSimpleProductsWithRatingsWithFavoriteStatusWithFilterCubit.getSimpleProductsWithRatingsWithFavoriteStatusWithFilter(variables: _queryVariablesCubit.state!, addToSP: true);
  }

  @override
  void dispose() {
    _pageCubit.close();
    _fitlerTabCubit.close();
    _queryVariablesCubit.close();
    _getSimpleProductsWithRatingsWithFavoriteStatusWithFilterCubit.close();
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
          BlocProvider(create: (context) => _getSimpleProductsWithRatingsWithFavoriteStatusWithFilterCubit),
          BlocProvider(create: (context) => _queryVariablesCubit),
          BlocProvider(create: (context) => _pageCubit),
          BlocProvider(create: (context) => _fitlerTabCubit),
        ],
        child: BlocBuilder<GetSimpleProductsWithRatingsWithFavoriteStatusWithFilterCubit,
            Query$getSimpleProductsWithRatingsWithFavoriteStatusWithFilter$getSimpleProductsWithRatingsWithFavoriteStatusWithFilter?>(
          bloc: _getSimpleProductsWithRatingsWithFavoriteStatusWithFilterCubit,
          builder: (context, getSimpleProductsWithRatingsWithFavoriteStatusWithFilter) => BlocBuilder<VariableCubit, dynamic>(
            bloc: _queryVariablesCubit,
            builder: (context, data) => BlocBuilder<VariableCubit, dynamic>(
              bloc: _pageCubit,
              builder: (context, data) => RefreshIndicator(
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
                    controller: _scrollController,
                    shrinkWrap: true,
                    primary: false,
                    children: [
                      TabsAppBarWidget(
                        notificationCount: widget.notificationCount,
                        title: translate(context, 'shop'),
                        user: widget.user,
                        wallet: widget.wallet,
                      ),
                      const SizedBox(height: 16.0),
                      Row(
                        children: [
                          Expanded(
                            child: SearchBarWidget(
                              onChanged: (value) async {
                                _pageCubit.updateValue(0);
                                _queryVariablesCubit.updateValue(
                                  _queryVariablesCubit.state!.copyWith(
                                    searchString: value.isEmpty ? null : value,
                                  ),
                                );
                                await _getSimpleProductsWithRatingsWithFavoriteStatusWithFilterCubit.getSimpleProductsWithRatingsWithFavoriteStatusWithFilter(
                                  variables: _queryVariablesCubit.state!,
                                  addToSP: true,
                                );
                              },
                              search: 'search',
                            ),
                          ),
                          const SizedBox(width: 8.0),
                          GestureDetector(
                            onTap: () {},
                            child: Container(
                              height: 30.0,
                              width: 30.0,
                              alignment: Alignment.center,
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(100.0),
                                color: Theme.of(context).focusColor,
                              ),
                              child: Icon(
                                CupertinoIcons.slider_horizontal_3,
                                color: Theme.of(context).colorScheme.secondary,
                                size: 15.0,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16.0),
                      BlocBuilder<VariableCubit, dynamic>(
                        bloc: _fitlerTabCubit,
                        builder: (context, data) => Wrap(
                          runSpacing: 8.0,
                          spacing: 8.0,
                          children: List.generate(
                            _filterTabList.length,
                            (index) => GestureDetector(
                              onTap: () async {
                                _pageCubit.updateValue(0);
                                if (_filterTabList[index] == _fitlerTabCubit.state) {
                                  _fitlerTabCubit.updateValue('');
                                  _queryVariablesCubit.updateValue(_queryVariablesCubit.state!.copyWith(sort: []));
                                } else {
                                  _fitlerTabCubit.updateValue(_filterTabList[index]);

                                  if (index == 0) {
                                    _queryVariablesCubit.updateValue(_queryVariablesCubit.state!.copyWith(sort: [Input$ProductSortInput(name: 1.0)]));
                                  }
                                  if (index == 1) {
                                    _queryVariablesCubit.updateValue(_queryVariablesCubit.state!.copyWith(sort: [Input$ProductSortInput(createdAt: 1.0)]));
                                  }
                                  if (index == 2) {
                                    _queryVariablesCubit.updateValue(_queryVariablesCubit.state!.copyWith(sort: [Input$ProductSortInput(price: 1.0)]));
                                  }
                                  if (index == 3) {
                                    _queryVariablesCubit.updateValue(_queryVariablesCubit.state!.copyWith(sort: [Input$ProductSortInput(price: -1.0)]));
                                  }
                                }
                                _getSimpleProductsWithRatingsWithFavoriteStatusWithFilterCubit.setNull();
                                await _getSimpleProductsWithRatingsWithFavoriteStatusWithFilterCubit.getSimpleProductsWithRatingsWithFavoriteStatusWithFilter(
                                  variables: _queryVariablesCubit.state!,
                                  addToSP: true,
                                );
                              },
                              child: Container(
                                padding: const EdgeInsets.all(8.0),
                                decoration: BoxDecoration(
                                  color: _filterTabList[index] == _fitlerTabCubit.state ? Theme.of(context).focusColor.withOpacity(1.0) : Theme.of(context).focusColor.withOpacity(0.5),
                                  borderRadius: BorderRadius.circular(100.0),
                                ),
                                child: Text(
                                  translate(context, _filterTabList[index]),
                                  style: Theme.of(context).textTheme.bodyMedium!.copyWith(
                                        fontSize: 12.0,
                                        fontWeight: _filterTabList[index] == _fitlerTabCubit.state ? FontWeight.bold : FontWeight.normal,
                                      ),
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 16.0),
                      getSimpleProductsWithRatingsWithFavoriteStatusWithFilter == null
                          ? InternalProductShimmer(padding: EdgeInsets.zero)
                          : getSimpleProductsWithRatingsWithFavoriteStatusWithFilter.objects.isEmpty
                              ? EmptyWidget(
                                  description: translate(context, 'marketplaceEmptyDescription'),
                                  title: translate(context, 'marketplaceEmptyTitle'),
                                  iconData: CupertinoIcons.cart_fill,
                                  padding: EdgeInsets.zero,
                                )
                              : MasonryGridView.count(
                                  itemBuilder: (context, index) => ProductItemWidget(internalProduct: getSimpleProductsWithRatingsWithFavoriteStatusWithFilter.objects[index]),
                                  itemCount: getSimpleProductsWithRatingsWithFavoriteStatusWithFilter.objects.length,
                                  crossAxisSpacing: 16.0,
                                  mainAxisSpacing: 16.0,
                                  padding: EdgeInsets.zero,
                                  physics: const NeverScrollableScrollPhysics(),
                                  crossAxisCount: 2,
                                  shrinkWrap: true,
                                  primary: false,
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
