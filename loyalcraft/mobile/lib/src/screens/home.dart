import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_loyalcraft_gql/graphql/corporate-partnership-network.graphql.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-card-user-card.graphql.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-quest-quest.graphql.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-wallet-wallet.graphql.dart';
import 'package:flutter_loyalcraft_gql/graphql/point-of-sale.graphql.dart';
import 'package:flutter_loyalcraft_gql/graphql/user.graphql.dart';
import 'package:flutter_loyalcraft_gql/schema.graphql.dart';
import 'package:flutter_staggered_grid_view/flutter_staggered_grid_view.dart';
import 'package:loyalcraft/localizations_delegate/app_localizations.dart';
import 'package:loyalcraft/src/bloc/home_tab_index.dart';
import 'package:loyalcraft/src/bloc/partnership_network.dart';
import 'package:loyalcraft/src/bloc/quest.dart';
import 'package:loyalcraft/src/bloc/variable.dart';
import 'package:loyalcraft/src/data/consts.dart';
import 'package:loyalcraft/src/data/graphql_client.dart';
import 'package:loyalcraft/src/repository/partnership_network.dart';
import 'package:loyalcraft/src/repository/quest.dart';
import 'package:loyalcraft/src/repository/user_card.dart';
import 'package:loyalcraft/src/widgets/loyalty_card_banner_item.dart';
import 'package:loyalcraft/src/widgets/phone_refill_banner_item.dart';
import 'package:loyalcraft/src/widgets/quest_item.dart';
import 'package:loyalcraft/src/widgets/shimmers.dart';
import 'package:loyalcraft/src/widgets/sign_in_on_desktop_banner_item.dart';
import 'package:loyalcraft/src/widgets/tabs_app_bar.dart';

// ignore: must_be_immutable
class HomeWidget extends StatefulWidget {
  HomeWidget({
    Key? key,
    required this.getCorporateUserCardByUserAndTarget,
    required this.notificationCount,
    required this.wallet,
    required this.pos,
    required this.user,
    required this.isRtl,
  }) : super(key: key);
  bool isRtl;
  int notificationCount;
  List<Query$getCorporateUserCardByUserAndTarget$getCorporateUserCardByUserAndTarget> getCorporateUserCardByUserAndTarget;
  Query$getCurrentUserQuantitativeWallets$getCurrentUserQuantitativeWallets$objects? wallet;
  Query$pointOfSale$pointOfSale pos;
  Query$user$user user;
  @override
  _HomeWidget createState() => _HomeWidget();
}

class _HomeWidget extends State<HomeWidget> {
  _HomeWidget() {
    _scrollController.addListener(() async {
      var isEnd = (_scrollController.offset == _scrollController.position.maxScrollExtent);

      if (isEnd) {
        final newData = await _questRepository.getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated(
          _questVariablesCubit.state!.copyWith(pagination: _questVariablesCubit.state!.pagination!.copyWith(page: _page0Cubit.state! + 1)),
        );
        if ((newData?.objects ?? []).isNotEmpty) {
          _getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginatedCubit.addReadyObjects(newData);
          _page0Cubit.updateValue(_page0Cubit.state! + 1);
        }
      }
    });
  }
  late GetQuestsByTargetAndUserAudienceWithLinkedAccountsPaginatedCubit _getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginatedCubit;
  late GetPartnershipNetworksByTargetAndPartnershipPaginationCubit _getPartnershipNetworksByTargetAndPartnershipPaginationCubit;
  late VariableCubit<Variables$Query$getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated> _questVariablesCubit;
  late PartnershipNetworkRepository _partnershipNetworkRepository;
  final ScrollController _scrollController = ScrollController();
  final SGraphQLClient _sGraphQLClient = SGraphQLClient();
  late UserCardRepository _userCardRepository;
  late VariableCubit<bool> _isLoadingCubit;
  late QuestRepository _questRepository;
  late VariableCubit<int> _page0Cubit;

  Future<void> _initState() async {
    _questRepository = QuestRepository(_sGraphQLClient);
    _userCardRepository = UserCardRepository(_sGraphQLClient);
    _isLoadingCubit = VariableCubit(value: false);
    _partnershipNetworkRepository = PartnershipNetworkRepository(_sGraphQLClient);
    _getPartnershipNetworksByTargetAndPartnershipPaginationCubit = GetPartnershipNetworksByTargetAndPartnershipPaginationCubit(_partnershipNetworkRepository);
    _getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginatedCubit = GetQuestsByTargetAndUserAudienceWithLinkedAccountsPaginatedCubit(_questRepository);
    _page0Cubit = VariableCubit(value: 0);

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

    await _getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginatedCubit.getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated(
      addToSP: true,
      variables: _questVariablesCubit.state!,
    );

    // _getPartnershipNetworksByTargetAndPartnershipPaginationCubit.getPartnershipNetworksByTargetAndPartnershipPagination(
    //   Variables$Query$getPartnershipNetworksByTargetAndPartnershipPagination(
    //     partnership: [
    //       Enum$PartnershipTypeEnum.CONVERSION,
    //     ],
    //     target: Input$TargetACIInput(
    //       pos: kPosID,
    //     ),
    //     pagination: Input$PaginationInput(
    //       limit: kPaginationLimit,
    //       page: kPaginationPage,
    //     ),
    //   ),
    // );
  }

  @override
  void dispose() {
    _getPartnershipNetworksByTargetAndPartnershipPaginationCubit.close();
    _getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginatedCubit.close();
    _page0Cubit.close();
    _isLoadingCubit.close();
    _questVariablesCubit.close();
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
          BlocProvider(create: (context) => _getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginatedCubit),
          BlocProvider(create: (context) => _getPartnershipNetworksByTargetAndPartnershipPaginationCubit),
          BlocProvider(create: (context) => _questVariablesCubit),
          BlocProvider(create: (context) => _isLoadingCubit),
          BlocProvider(create: (context) => _page0Cubit),
        ],
        child: BlocBuilder<VariableCubit, dynamic>(
          bloc: _questVariablesCubit,
          builder: (context, data) => BlocBuilder<VariableCubit, dynamic>(
            bloc: _page0Cubit,
            builder: (context, data) => BlocBuilder<GetPartnershipNetworksByTargetAndPartnershipPaginationCubit,
                Query$getPartnershipNetworksByTargetAndPartnershipPagination$getPartnershipNetworksByTargetAndPartnershipPagination?>(
              bloc: _getPartnershipNetworksByTargetAndPartnershipPaginationCubit,
              builder: (context, getPartnershipNetworksByTargetAndPartnershipPagination) => BlocBuilder<GetQuestsByTargetAndUserAudienceWithLinkedAccountsPaginatedCubit,
                  Query$getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated$getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated?>(
                bloc: _getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginatedCubit,
                builder: (context, getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated) => RefreshIndicator(
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
                      controller: _scrollController,
                      primary: false,
                      children: [
                        TabsAppBarWidget(
                          notificationCount: widget.notificationCount,
                          user: widget.user,
                          wallet: widget.wallet,
                          title: '${translate(context, 'hello')}, ${widget.user.firstName}!',
                        ),
                        // const SizedBox(height: 16.0),
                        // SizedBox(
                        //   height: 90.0,
                        //   child: ListView.separated(
                        //     itemBuilder: (context, index) => StoryItemWidget(
                        //       story: kStoryList[index],
                        //       index: index,
                        //     ),
                        //     separatorBuilder: (context, index) => const SizedBox(width: 16.0),
                        //     scrollDirection: Axis.horizontal,
                        //     itemCount: kStoryList.length,
                        //     padding: EdgeInsets.zero,
                        //     shrinkWrap: true,
                        //     primary: false,
                        //   ),
                        // ),
                        const SizedBox(height: 16.0),
                        SizedBox(
                          height: 250.0,
                          child: ListView.separated(
                            itemBuilder: (context, index) => index == 0
                                ? SignInOnDesktopBannerItemWidget(userCardRepository: _userCardRepository)
                                : index == 1
                                    ? const PhoneRefillBannerItemWidget()
                                    : LoyaltyCardBannerItemWidget(
                                        getCorporateUserCardByUserAndTarget: widget.getCorporateUserCardByUserAndTarget,
                                        isLoadingCubit: _isLoadingCubit,
                                        pos: widget.pos,
                                      ),
                            separatorBuilder: (context, index) => const SizedBox(width: 16.0),
                            scrollDirection: Axis.horizontal,
                            padding: EdgeInsets.zero,
                            shrinkWrap: true,
                            primary: false,
                            itemCount: 3,
                          ),
                        ),
                        // const SizedBox(height: 16.0),
                        // SizedBox(
                        //   height: 170.0,
                        //   child: ListView.separated(
                        //     itemBuilder: (context, index) => index == 0 ? const HappyHourBannerItemWidget() : const ReferFriendBannerItemWidget(),
                        //     separatorBuilder: (context, index) => const SizedBox(width: 16.0),
                        //     scrollDirection: Axis.horizontal,
                        //     padding: EdgeInsets.zero,
                        //     shrinkWrap: true,
                        //     primary: false,
                        //     itemCount: 2,
                        //   ),
                        // ),
                        const SizedBox(height: 16.0),
                        Row(
                          children: [
                            Expanded(
                              child: Text(
                                translate(context, 'inMomentQuests'),
                                style: Theme.of(context).textTheme.bodyLarge,
                              ),
                            ),
                            const SizedBox(width: 8.0),
                            GestureDetector(
                              onTap: () => BlocProvider.of<HomeTabIndexCubit>(context).updateValue(2),
                              child: Container(
                                height: 26.0,
                                width: 26.0,
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(100.0),
                                  color: Theme.of(context).focusColor,
                                ),
                                child: Icon(
                                  widget.isRtl ? CupertinoIcons.arrow_left : CupertinoIcons.arrow_right,
                                  color: Theme.of(context).colorScheme.secondary,
                                  size: 13.0,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16.0),
                        getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated == null
                            ? QuestsShimmer(padding: EdgeInsets.zero)
                            : getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated.objects.isEmpty
                                ? const SizedBox()
                                : MasonryGridView.count(
                                    itemBuilder: (context, index) => QuestItemWidget(
                                      quest: getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated.objects[index],
                                      valueChanged: (value) {
                                        _getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginatedCubit.getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated(
                                          addToSP: false,
                                          variables: Variables$Query$getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated(
                                            input: Input$QuestsByTargetAndUserAudienceWithPerformedInput(
                                              reversed: true,
                                              target: Input$TargetACIInput(
                                                pos: kPosID,
                                              ),
                                            ),
                                            pagination: Input$PaginationInput(
                                              limit: kPaginationLimit,
                                              page: kPaginationPage,
                                            ),
                                          ),
                                        );
                                      },
                                    ),
                                    itemCount: getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated.objects.length,
                                    crossAxisSpacing: 16.0,
                                    mainAxisSpacing: 16.0,
                                    padding: EdgeInsets.zero,
                                    physics: const NeverScrollableScrollPhysics(),
                                    crossAxisCount: 2,
                                    shrinkWrap: true,
                                    primary: false,
                                  ),
                        // const SizedBox(height: 16.0),
                        // Row(
                        //   children: [
                        //     Expanded(
                        //       child: Text(
                        //         translate(context, 'partners'),
                        //         style: Theme.of(context).textTheme.bodyLarge,
                        //       ),
                        //     ),
                        //     const SizedBox(width: 8.0),
                        //     GestureDetector(
                        //       onTap: () => Navigator.push(context, MaterialPageRoute(builder: (context) => const PointsOfSaleWidget())),
                        //       child: Container(
                        //         height: 26.0,
                        //         width: 26.0,
                        //         decoration: BoxDecoration(
                        //           borderRadius: BorderRadius.circular(100.0),
                        //           color: Theme.of(context).focusColor,
                        //         ),
                        //         child: Icon(
                        //        widget.isRtl ? CupertinoIcons.arrow_left : CupertinoIcons.arrow_right,
                        //           color: Theme.of(context).colorScheme.secondary,
                        //           size: 14.0,
                        //         ),
                        //       ),
                        //     ),
                        //   ],
                        // ),
                        // const SizedBox(height: 16.0),
                        // SizedBox(
                        //   height: 240.0,
                        //   child: getPartnershipNetworksByTargetAndPartnershipPagination == null
                        //       ? HorizontalPosHomeShimmer(padding: EdgeInsets.zero)
                        //       : getPartnershipNetworksByTargetAndPartnershipPagination.objects.isEmpty
                        //           ? const SizedBox()
                        //           : ListView.separated(
                        //               itemBuilder: (context, index) {
                        //                 final partnershipNetwork = getPartnershipNetworksByTargetAndPartnershipPagination.objects[index];
                        //                 return partnershipNetwork.partner?.pos == null
                        //                     ? const SizedBox()
                        //                     : SizedBox(
                        //                         width: kAppSize.width / 1.2,
                        //                         child: PointOfSaleItemWidget(
                        //                           pos: Query$pointOfSale$pointOfSale.fromJson(partnershipNetwork.partner!.pos!.toJson()),
                        //                         ),
                        //                       );
                        //               },
                        //               itemCount: getPartnershipNetworksByTargetAndPartnershipPagination.objects.length,
                        //               separatorBuilder: (context, index) => const SizedBox(width: 16.0),
                        //               scrollDirection: Axis.horizontal,
                        //               padding: EdgeInsets.zero,
                        //               shrinkWrap: true,
                        //               primary: false,
                        //             ),
                        // ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      );
}
