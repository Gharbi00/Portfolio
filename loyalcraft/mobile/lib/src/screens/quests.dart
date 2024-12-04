import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_loyalcraft_gql/graphql/corporate-partnership-network.graphql.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-quest-quest.graphql.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-wallet-wallet.graphql.dart';
import 'package:flutter_loyalcraft_gql/graphql/user.graphql.dart';
import 'package:flutter_loyalcraft_gql/schema.graphql.dart';
import 'package:loyalcraft/localizations_delegate/app_localizations.dart';
import 'package:loyalcraft/src/bloc/partnership_network.dart';
import 'package:loyalcraft/src/bloc/quest.dart';
import 'package:loyalcraft/src/bloc/variable.dart';
import 'package:loyalcraft/src/data/consts.dart';
import 'package:loyalcraft/src/data/graphql_client.dart';
import 'package:loyalcraft/src/modal_bottom_sheet/quest_filter.dart';
import 'package:loyalcraft/src/repository/partnership_network.dart';
import 'package:loyalcraft/src/repository/quest.dart';
import 'package:loyalcraft/src/widgets/tab_coming_soon_quest.dart';
import 'package:loyalcraft/src/widgets/tab_quest.dart';
import 'package:loyalcraft/src/widgets/tabs_app_bar.dart';

// ignore: must_be_immutable
class QuestsWidget extends StatefulWidget {
  QuestsWidget({
    Key? key,
    required this.notificationCount,
    required this.wallet,
    required this.isRtl,
    required this.user,
  }) : super(key: key);
  Query$getCurrentUserQuantitativeWallets$getCurrentUserQuantitativeWallets$objects? wallet;
  int notificationCount;
  Query$user$user user;
  bool isRtl;

  @override
  _QuestsWidget createState() => _QuestsWidget();
}

class _QuestsWidget extends State<QuestsWidget> {
  _QuestsWidget() {
    _scrollController.addListener(() async {
      var isEnd = (_scrollController.offset == _scrollController.position.maxScrollExtent);

      if (isEnd) {
        if (_tabIndexCubit.state! == 0 && _getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginatedCubit.state?.isLast == false) {
          final newData = await _questRepository.getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated(
            _questVariablesCubit.state!.copyWith(pagination: _questVariablesCubit.state!.pagination!.copyWith(page: _page0Cubit.state! + 1)),
          );
          if ((newData?.objects ?? []).isNotEmpty) {
            _getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginatedCubit.addReadyObjects(newData);
            _page0Cubit.updateValue(_page0Cubit.state! + 1);
          }
        }

        if (_tabIndexCubit.state! == 1 && _getComingSoonQuestsByTargetAndUserAudienceWithLinkedAccountsPaginatedCubit.state?.isLast == false) {
          final newData = await _questRepository.getComingSoonQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated(
            _comingSoonQuestVariablesCubit.state!.copyWith(pagination: _comingSoonQuestVariablesCubit.state!.pagination!.copyWith(page: _page1Cubit.state! + 1)),
          );
          if ((newData?.objects ?? []).isNotEmpty) {
            _getComingSoonQuestsByTargetAndUserAudienceWithLinkedAccountsPaginatedCubit.addReadyObjects(newData);
            _page1Cubit.updateValue(_page1Cubit.state! + 1);
          }
        }
      }
    });
  }

  late GetComingSoonQuestsByTargetAndUserAudienceWithLinkedAccountsPaginatedCubit _getComingSoonQuestsByTargetAndUserAudienceWithLinkedAccountsPaginatedCubit;
  late VariableCubit<Variables$Query$getComingSoonQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated> _comingSoonQuestVariablesCubit;
  late GetQuestsByTargetAndUserAudienceWithLinkedAccountsPaginatedCubit _getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginatedCubit;
  late GetPartnershipNetworksByTargetAndPartnershipPaginationCubit _getPartnershipNetworksByTargetAndPartnershipPaginationCubit;
  late VariableCubit<Variables$Query$getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated> _questVariablesCubit;
  late PartnershipNetworkRepository _partnershipNetworkRepository;
  final ScrollController _scrollController = ScrollController();
  final SGraphQLClient _sGraphQLClient = SGraphQLClient();
  late VariableCubit<bool> _isLoadingCubit;
  late VariableCubit<int> _tabIndexCubit;
  late QuestRepository _questRepository;
  late VariableCubit<int> _page0Cubit;
  late VariableCubit<int> _page1Cubit;
  final List<String> _tabList = [
    'available',
    'upcoming',
  ];

  int _getBadgeCount({required variables}) {
    var count = 0;
    if (variables.input.target.pos != kPosID) {
      count++;
    }
    if (_tabIndexCubit.state == 0) {
      if (variables.input.performed != null) {
        count++;
      }
    }
    if (variables.input.reversed == false) {
      count++;
    }
    return count;
  }

  Future<void> _initState() async {
    _questRepository = QuestRepository(_sGraphQLClient);
    _partnershipNetworkRepository = PartnershipNetworkRepository(_sGraphQLClient);
    _getComingSoonQuestsByTargetAndUserAudienceWithLinkedAccountsPaginatedCubit = GetComingSoonQuestsByTargetAndUserAudienceWithLinkedAccountsPaginatedCubit(_questRepository);
    _getPartnershipNetworksByTargetAndPartnershipPaginationCubit = GetPartnershipNetworksByTargetAndPartnershipPaginationCubit(_partnershipNetworkRepository);
    _getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginatedCubit = GetQuestsByTargetAndUserAudienceWithLinkedAccountsPaginatedCubit(_questRepository);
    _isLoadingCubit = VariableCubit(value: false);
    _tabIndexCubit = VariableCubit(value: 0);
    _page0Cubit = VariableCubit(value: 0);
    _page1Cubit = VariableCubit(value: 0);
    _questVariablesCubit = VariableCubit(
      value: Variables$Query$getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated(
        input: Input$QuestsByTargetAndUserAudienceWithPerformedInput(
          target: Input$TargetACIInput(
            pos: kPosID,
          ),
          reversed: true,
        ),
        pagination: Input$PaginationInput(
          limit: kPaginationLimit,
          page: _page0Cubit.state,
        ),
      ),
    );
    _comingSoonQuestVariablesCubit = VariableCubit(
      value: Variables$Query$getComingSoonQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated(
        input: Input$QuestsByTargetAndUserAudienceInput(
          reversed: true,
          target: Input$TargetACIInput(
            pos: kPosID,
          ),
        ),
        pagination: Input$PaginationInput(
          limit: kPaginationLimit,
          page: _page1Cubit.state,
        ),
      ),
    );

    _getPartnershipNetworksByTargetAndPartnershipPaginationCubit.getPartnershipNetworksByTargetAndPartnershipPagination(
      Variables$Query$getPartnershipNetworksByTargetAndPartnershipPagination(
        partnership: [
          Enum$PartnershipTypeEnum.CONVERSION,
        ],
        target: Input$TargetACIInput(
          pos: kPosID,
        ),
        pagination: Input$PaginationInput(
          limit: kPaginationLimit,
          page: kPaginationPage,
        ),
      ),
    );
    await _getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginatedCubit.getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated(variables: _questVariablesCubit.state!, addToSP: true);
  }

  @override
  void dispose() {
    _page0Cubit.close();
    _page1Cubit.close();
    _tabIndexCubit.close();
    _isLoadingCubit.close();
    _questVariablesCubit.close();
    _comingSoonQuestVariablesCubit.close();
    _getPartnershipNetworksByTargetAndPartnershipPaginationCubit.close();
    _getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginatedCubit.close();
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
          BlocProvider(create: (context) => _getComingSoonQuestsByTargetAndUserAudienceWithLinkedAccountsPaginatedCubit),
          BlocProvider(create: (context) => _getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginatedCubit),
          BlocProvider(create: (context) => _getPartnershipNetworksByTargetAndPartnershipPaginationCubit),
          BlocProvider(create: (context) => _comingSoonQuestVariablesCubit),
          BlocProvider(create: (context) => _questVariablesCubit),
          BlocProvider(create: (context) => _isLoadingCubit),
          BlocProvider(create: (context) => _tabIndexCubit),
          BlocProvider(create: (context) => _page0Cubit),
          BlocProvider(create: (context) => _page1Cubit),
        ],
        child: BlocBuilder<GetPartnershipNetworksByTargetAndPartnershipPaginationCubit,
            Query$getPartnershipNetworksByTargetAndPartnershipPagination$getPartnershipNetworksByTargetAndPartnershipPagination?>(
          bloc: _getPartnershipNetworksByTargetAndPartnershipPaginationCubit,
          builder: (context, getPartnershipNetworksByTargetAndPartnershipPagination) => BlocBuilder<GetComingSoonQuestsByTargetAndUserAudienceWithLinkedAccountsPaginatedCubit,
              Query$getComingSoonQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated$getComingSoonQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated?>(
            bloc: _getComingSoonQuestsByTargetAndUserAudienceWithLinkedAccountsPaginatedCubit,
            builder: (context, getComingSoonQuestsByTargetAndUserAudiencePaginatedCubit) => BlocBuilder<GetQuestsByTargetAndUserAudienceWithLinkedAccountsPaginatedCubit,
                Query$getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated$getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated?>(
              bloc: _getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginatedCubit,
              builder: (context, getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated) => BlocBuilder<VariableCubit, dynamic>(
                bloc: _comingSoonQuestVariablesCubit,
                builder: (context, comingSoonQuestVariables) => BlocBuilder<VariableCubit, dynamic>(
                  bloc: _tabIndexCubit,
                  builder: (context, tabIndex) => BlocBuilder<VariableCubit, dynamic>(
                    bloc: _questVariablesCubit,
                    builder: (context, questVariables) => RefreshIndicator(
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
                              wallet: widget.wallet,
                              notificationCount: widget.notificationCount,
                              title: translate(context, 'quests'),
                              user: widget.user,
                            ),
                            const SizedBox(height: 16.0),
                            Row(
                              children: List.generate(
                                _tabList.length + 1,
                                (index) => index == _tabList.length
                                    ? ((getPartnershipNetworksByTargetAndPartnershipPagination?.objects ?? []).isEmpty
                                        ? const SizedBox()
                                        : Badge.count(
                                            alignment: Alignment.topRight,
                                            count: _getBadgeCount(variables: tabIndex == 0 ? questVariables : comingSoonQuestVariables),
                                            isLabelVisible: _getBadgeCount(variables: tabIndex == 0 ? questVariables : comingSoonQuestVariables) > 0,
                                            textColor: Colors.white,
                                            backgroundColor: Colors.red[800],
                                            textStyle: Theme.of(context).textTheme.bodyLarge!.copyWith(fontSize: 12.0, color: Colors.white),
                                            child: GestureDetector(
                                              onTap: () => showQuestFilterSheet(
                                                getPartnershipNetworksByTargetAndPartnershipPaginationCubit: _getPartnershipNetworksByTargetAndPartnershipPaginationCubit,
                                                variables: tabIndex == 0 ? _questVariablesCubit.state : _comingSoonQuestVariablesCubit.state,
                                                tabIndex: tabIndex,
                                                context: context,
                                                valueChanged: (value) async {
                                                  _page0Cubit.updateValue(0);
                                                  _page1Cubit.updateValue(0);
                                                  if (tabIndex == 0) {
                                                    _questVariablesCubit.updateValue(value);
                                                    _getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginatedCubit
                                                      ..setNull()
                                                      ..getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated(addToSP: false, variables: value!);
                                                  } else {
                                                    _comingSoonQuestVariablesCubit.updateValue(value);
                                                    _getComingSoonQuestsByTargetAndUserAudienceWithLinkedAccountsPaginatedCubit
                                                      ..setNull()
                                                      ..getComingSoonQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated(value);
                                                  }
                                                },
                                              ),
                                              child: Container(
                                                height: 30.0,
                                                width: 30.0,
                                                alignment: Alignment.center,
                                                margin: Directionality.of(context) == TextDirection.rtl ? EdgeInsets.only(right: index == 0 ? 0 : 8.0) : EdgeInsets.only(left: index == 0 ? 0 : 8.0),
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
                                          ))
                                    : Expanded(
                                        child: Padding(
                                          padding: Directionality.of(context) == TextDirection.rtl ? EdgeInsets.only(right: index == 0 ? 0 : 8.0) : EdgeInsets.only(left: index == 0 ? 0 : 8.0),
                                          child: GestureDetector(
                                            onTap: index == tabIndex
                                                ? null
                                                : () async {
                                                    _tabIndexCubit.updateValue(index);
                                                    _page0Cubit.updateValue(0);
                                                    _page1Cubit.updateValue(0);
                                                    _questVariablesCubit.updateValue(
                                                      Variables$Query$getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated(
                                                        input: Input$QuestsByTargetAndUserAudienceWithPerformedInput(
                                                          target: Input$TargetACIInput(
                                                            pos: kPosID,
                                                          ),
                                                          reversed: true,
                                                        ),
                                                        pagination: Input$PaginationInput(
                                                          limit: kPaginationLimit,
                                                          page: _page0Cubit.state,
                                                        ),
                                                      ),
                                                    );
                                                    _comingSoonQuestVariablesCubit.updateValue(
                                                      Variables$Query$getComingSoonQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated(
                                                        input: Input$QuestsByTargetAndUserAudienceInput(
                                                          reversed: true,
                                                          target: Input$TargetACIInput(
                                                            pos: kPosID,
                                                          ),
                                                        ),
                                                        pagination: Input$PaginationInput(
                                                          limit: kPaginationLimit,
                                                          page: _page1Cubit.state,
                                                        ),
                                                      ),
                                                    );
                                                    if (index == 0) {
                                                      _getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginatedCubit
                                                        ..setNull()
                                                        ..getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated(
                                                          addToSP: false,
                                                          variables: questVariables,
                                                        );
                                                    }
                                                    if (index == 1) {
                                                      _getComingSoonQuestsByTargetAndUserAudienceWithLinkedAccountsPaginatedCubit
                                                        ..setNull()
                                                        ..getComingSoonQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated(
                                                          comingSoonQuestVariables,
                                                        );
                                                    }
                                                  },
                                            child: Column(
                                              mainAxisSize: MainAxisSize.min,
                                              children: [
                                                Text(
                                                  translate(context, _tabList[index]),
                                                  overflow: TextOverflow.ellipsis,
                                                  textAlign: TextAlign.center,
                                                  softWrap: false,
                                                  maxLines: 1,
                                                  style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                                                        fontWeight: tabIndex == index ? FontWeight.bold : FontWeight.normal,
                                                        fontSize: 15.0,
                                                      ),
                                                ),
                                                const SizedBox(height: 8.0),
                                                Container(
                                                  height: 2.0,
                                                  decoration: BoxDecoration(
                                                    color: tabIndex == index ? kAppColor : Theme.of(context).focusColor,
                                                    borderRadius: BorderRadius.circular(100.0),
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ),
                                        ),
                                      ),
                              ),
                            ),
                            const SizedBox(height: 16.0),
                            tabIndex == 0
                                ? TabQuestWidget(
                                    getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginatedCubit: _getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginatedCubit,
                                    valueChanged: (value) {
                                      _page0Cubit.updateValue(0);
                                      _getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginatedCubit.getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated(
                                        variables: _questVariablesCubit.state!,
                                        addToSP: false,
                                      );
                                    },
                                  )
                                : TabComingSoonQuestWidget(
                                    getComingSoonQuestsByTargetAndUserAudienceWithLinkedAccountsPaginatedCubit: _getComingSoonQuestsByTargetAndUserAudienceWithLinkedAccountsPaginatedCubit,
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
      );
}
