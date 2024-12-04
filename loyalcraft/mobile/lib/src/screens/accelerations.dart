import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-loyalty-settings.graphql.dart';
import 'package:flutter_loyalcraft_gql/schema.graphql.dart';
import 'package:loyalcraft/localizations_delegate/app_localizations.dart';
import 'package:loyalcraft/src/bloc/locale.dart';
import 'package:loyalcraft/src/bloc/loyalty_settings.dart';
import 'package:loyalcraft/src/bloc/variable.dart';
import 'package:loyalcraft/src/data/consts.dart';
import 'package:loyalcraft/src/data/graphql_client.dart';
import 'package:loyalcraft/src/repository/loyalty_settings.dart';
import 'package:loyalcraft/src/widgets/acceleration_item.dart';
import 'package:loyalcraft/src/widgets/empty.dart';
import 'package:loyalcraft/src/widgets/shimmers.dart';

// ignore: must_be_immutable
class AccelerationsWidget extends StatefulWidget {
  const AccelerationsWidget({
    Key? key,
  }) : super(key: key);

  @override
  _AccelerationsWidget createState() => _AccelerationsWidget();
}

class _AccelerationsWidget extends State<AccelerationsWidget> {
  _AccelerationsWidget() {
    _scrollController.addListener(() async {
      var isEnd = (_scrollController.offset == _scrollController.position.maxScrollExtent);

      if (isEnd) {
        var newPage = _pageCubit.state! + 1;
        _getAccelerationSettingsByTargetWithLinkedAccountCubit.addObjects(
          Variables$Query$getAccelerationSettingsByTargetWithLinkedAccount(
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
  late GetAccelerationSettingsByTargetWithLinkedAccountCubit _getAccelerationSettingsByTargetWithLinkedAccountCubit;
  late LoyaltySettingsRepository _loyaltySettingsRepository;
  late VariableCubit<int> _pageCubit;

  Future<void> _initState() async {
    _loyaltySettingsRepository = LoyaltySettingsRepository(_sGraphQLClient);
    _pageCubit = VariableCubit(value: 0);
    _getAccelerationSettingsByTargetWithLinkedAccountCubit = GetAccelerationSettingsByTargetWithLinkedAccountCubit(_loyaltySettingsRepository);
    _getAccelerationSettingsByTargetWithLinkedAccountCubit.getAccelerationSettingsByTargetWithLinkedAccount(
      Variables$Query$getAccelerationSettingsByTargetWithLinkedAccount(
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
    _getAccelerationSettingsByTargetWithLinkedAccountCubit.close();

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
        BlocProvider(create: (context) => _getAccelerationSettingsByTargetWithLinkedAccountCubit),
        BlocProvider(create: (context) => _pageCubit),
      ],
      child: BlocBuilder<GetAccelerationSettingsByTargetWithLinkedAccountCubit, Query$getAccelerationSettingsByTargetWithLinkedAccount$getAccelerationSettingsByTargetWithLinkedAccount?>(
        bloc: _getAccelerationSettingsByTargetWithLinkedAccountCubit,
        builder: (context, getAccelerationSettingsByTargetWithLinkedAccount) => BlocBuilder<VariableCubit, dynamic>(
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
              child: ListView(
                padding: const EdgeInsets.all(16.0),
                controller: _scrollController,
                shrinkWrap: true,
                primary: false,
                children: [
                  getAccelerationSettingsByTargetWithLinkedAccount == null
                      ? BigListViewShimmer(
                          padding: EdgeInsets.zero,
                        )
                      : getAccelerationSettingsByTargetWithLinkedAccount.objects.isEmpty
                          ? EmptyWidget(
                              description: translate(context, 'accelerationEmptyDescription'),
                              title: translate(context, 'accelerationEmptyTitle'),
                              iconData: CupertinoIcons.tickets_fill,
                              padding: EdgeInsets.zero,
                            )
                          : ListView.separated(
                              itemBuilder: (context, index) => AccelerationItemWidget(
                                accelerationSettings: getAccelerationSettingsByTargetWithLinkedAccount.objects[index],
                                locale: _locale,
                              ),
                              separatorBuilder: (context, index) => const SizedBox(height: 16.0),
                              padding: EdgeInsets.zero,
                              physics: const NeverScrollableScrollPhysics(),
                              shrinkWrap: true,
                              primary: false,
                              itemCount: getAccelerationSettingsByTargetWithLinkedAccount.objects.length,
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
