import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-loyalty-settings.graphql.dart';
import 'package:flutter_loyalcraft_gql/schema.graphql.dart';
import 'package:loyalcraft/localizations_delegate/app_localizations.dart';
import 'package:loyalcraft/src/bloc/loyalty_settings.dart';
import 'package:loyalcraft/src/bloc/variable.dart';
import 'package:loyalcraft/src/data/consts.dart';
import 'package:loyalcraft/src/data/graphql_client.dart';
import 'package:loyalcraft/src/repository/loyalty_settings.dart';
import 'package:loyalcraft/src/widgets/empty.dart';
import 'package:loyalcraft/src/widgets/referral_point_of_sale_item.dart';
import 'package:loyalcraft/src/widgets/shimmers.dart';

// ignore: must_be_immutable
class ReferralPointOfSalesWidget extends StatefulWidget {
  const ReferralPointOfSalesWidget({
    Key? key,
  }) : super(key: key);

  @override
  _ReferralPointOfSalesWidget createState() => _ReferralPointOfSalesWidget();
}

class _ReferralPointOfSalesWidget extends State<ReferralPointOfSalesWidget> {
  _ReferralPointOfSalesWidget() {
    _scrollController.addListener(() async {
      var isEnd = (_scrollController.offset == _scrollController.position.maxScrollExtent);

      if (isEnd) {
        var newPage = _pageCubit.state! + 1;
        await _getReferralSettingsByTargetWithLinkedAccountCubit.addObjects(
          Variables$Query$getReferralSettingsByTargetWithLinkedAccount(
            pagination: Input$PaginationInput(
              limit: kPaginationLimit,
              page: newPage,
            ),
          ),
        );
        _pageCubit.updateValue(newPage);
      }
    });
  }

  final ScrollController _scrollController = ScrollController();
  final SGraphQLClient _sGraphQLClient = SGraphQLClient();
  late GetReferralSettingsByTargetWithLinkedAccountCubit _getReferralSettingsByTargetWithLinkedAccountCubit;
  late LoyaltySettingsRepository _loyaltySettingsRepository;
  late VariableCubit<int> _pageCubit;

  Future<void> _initState() async {
    _loyaltySettingsRepository = LoyaltySettingsRepository(_sGraphQLClient);
    _pageCubit = VariableCubit(value: 0);
    _getReferralSettingsByTargetWithLinkedAccountCubit = GetReferralSettingsByTargetWithLinkedAccountCubit(_loyaltySettingsRepository);
    _getReferralSettingsByTargetWithLinkedAccountCubit.getReferralSettingsByTargetWithLinkedAccount(
      Variables$Query$getReferralSettingsByTargetWithLinkedAccount(
        pagination: Input$PaginationInput(
          limit: kPaginationLimit,
          page: _pageCubit.state,
        ),
      ),
    );
  }

  @override
  void dispose() {
    _scrollController.dispose();
    _pageCubit.close();
    _getReferralSettingsByTargetWithLinkedAccountCubit.close();

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
          BlocProvider(create: (context) => _getReferralSettingsByTargetWithLinkedAccountCubit),
          BlocProvider(create: (context) => _pageCubit),
        ],
        child: BlocBuilder<GetReferralSettingsByTargetWithLinkedAccountCubit, Query$getReferralSettingsByTargetWithLinkedAccount$getReferralSettingsByTargetWithLinkedAccount?>(
          bloc: _getReferralSettingsByTargetWithLinkedAccountCubit,
          builder: (context, getReferralSettingsByTargetWithLinkedAccount) => BlocBuilder<VariableCubit, dynamic>(
            bloc: _pageCubit,
            builder: (context, page) => Scaffold(
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
                        translate(context, 'referralBrands'),
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
                child: ListView(
                  controller: _scrollController,
                  padding: const EdgeInsets.all(16.0),
                  shrinkWrap: true,
                  primary: false,
                  children: [
                    getReferralSettingsByTargetWithLinkedAccount == null
                        ? BigListViewShimmer(padding: EdgeInsets.zero)
                        : getReferralSettingsByTargetWithLinkedAccount.objects.isEmpty
                            ? EmptyWidget(
                                description: translate(context, 'referralPointsOfSalesEmptyDescription'),
                                title: translate(context, 'referralPointsOfSalesEmptyTitle'),
                                iconData: CupertinoIcons.person_3_fill,
                                padding: EdgeInsets.zero,
                              )
                            : ListView.separated(
                                itemBuilder: (context, index) => ReferralPointOfSaleItemWidget(
                                  referralSettings: getReferralSettingsByTargetWithLinkedAccount.objects[index],
                                ),
                                itemCount: getReferralSettingsByTargetWithLinkedAccount.objects.length,
                                separatorBuilder: (context, index) => const SizedBox(height: 16.0),
                                physics: const NeverScrollableScrollPhysics(),
                                padding: EdgeInsets.zero,
                                shrinkWrap: true,
                                primary: false,
                              ),
                  ],
                ),
              ),
            ),
          ),
        ),
      );
}
