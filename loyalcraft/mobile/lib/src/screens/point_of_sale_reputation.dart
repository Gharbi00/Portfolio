import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_diktup_utilities/extensions.dart';
import 'package:flutter_diktup_utilities/flutter_diktup_utilities.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-loyalty-settings.graphql.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-wallet-wallet.graphql.dart';
import 'package:flutter_loyalcraft_gql/graphql/point-of-sale.graphql.dart';
import 'package:flutter_loyalcraft_gql/schema.graphql.dart';
import 'package:flutter_widget_from_html/flutter_widget_from_html.dart';
import 'package:loyalcraft/localizations_delegate/app_localizations.dart';
import 'package:loyalcraft/src/bloc/wallet.dart';
import 'package:loyalcraft/src/data/consts.dart';
import 'package:loyalcraft/src/data/graphql_client.dart';
import 'package:loyalcraft/src/data/reputation_utils.dart';
import 'package:loyalcraft/src/repository/wallet.dart';
import 'package:loyalcraft/src/utils/image_cache_manager/shared_image_provider.dart';
import 'package:loyalcraft/src/widgets/empty.dart';
import 'package:loyalcraft/src/widgets/qualitative_quantitative.dart';
import 'package:simple_circular_progress_bar/simple_circular_progress_bar.dart';
import 'package:slide_countdown/slide_countdown.dart';

// ignore: must_be_immutable
class PointOfSaleReputationWidget extends StatefulWidget {
  PointOfSaleReputationWidget({
    Key? key,
    required this.getUserWalletWithReputations,
    required this.findLoyaltySettingsByTarget,
    required this.userToken,
    required this.userID,
    required this.pos,
  }) : super(key: key);
  Query$getUserWalletWithReputations$getUserWalletWithReputations? getUserWalletWithReputations;
  Query$findLoyaltySettingsByTarget$findLoyaltySettingsByTarget? findLoyaltySettingsByTarget;
  Query$pointOfSale$pointOfSale pos;
  String userToken;
  String userID;

  @override
  _PointOfSaleReputationWidget createState() => _PointOfSaleReputationWidget();
}

class _PointOfSaleReputationWidget extends State<PointOfSaleReputationWidget> {
  late GetCurrentUserReputationsLossDateCubit _getCurrentUserReputationsLossDateCubit;
  final SGraphQLClient _sGraphQLClient = SGraphQLClient();

  late WalletRepository _walletRepository;

  Duration? _getCountDownDuration(Query$getCurrentUserReputationsLossDate$getCurrentUserReputationsLossDate? getCurrentUserReputationsLossDate) {
    var loseDate = getCurrentUserReputationsLossDate?.lossDate;
    if (loseDate != null) {
      if (loseDate.toLocal().isAfter(DateTime.now().toLocal())) {
        return loseDate.toLocal().difference(DateTime.now().toLocal());
      }
    }
    return null;
  }

  Future<void> _initState() async {
    _walletRepository = WalletRepository(_sGraphQLClient);

    _getCurrentUserReputationsLossDateCubit = GetCurrentUserReputationsLossDateCubit(_walletRepository);
    _getCurrentUserReputationsLossDateCubit.getCurrentUserReputationsLossDate(
      Variables$Query$getCurrentUserReputationsLossDate(
        userToken: widget.userToken,
      ),
    );
  }

  @override
  void dispose() {
    _getCurrentUserReputationsLossDateCubit.close();
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
          BlocProvider(create: (context) => _getCurrentUserReputationsLossDateCubit),
        ],
        child: BlocBuilder<GetCurrentUserReputationsLossDateCubit, Query$getCurrentUserReputationsLossDate$getCurrentUserReputationsLossDate?>(
          bloc: _getCurrentUserReputationsLossDateCubit,
          builder: (context, getCurrentUserReputationsLossDate) => Scaffold(
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
                      translate(context, 'reputation'),
                      style: Theme.of(context).textTheme.headlineSmall,
                    ),
                  ),
                ],
              ),
            ),
            body: widget.getUserWalletWithReputations == null
                ? const SizedBox()
                : widget.findLoyaltySettingsByTarget?.prelevel == null || (widget.getUserWalletWithReputations?.reputationLevels ?? []).isEmpty
                    ? EmptyWidget(
                        description: translate(context, 'reputationEmptyDescription'),
                        title: translate(context, 'reputationEmptyTitle'),
                        iconData: CupertinoIcons.star_fill,
                        padding: EdgeInsets.zero,
                      )
                    : ListView(
                        padding: const EdgeInsets.all(16.0),
                        shrinkWrap: true,
                        primary: false,
                        children: [
                          Stack(
                            alignment: Alignment.center,
                            clipBehavior: Clip.none,
                            children: [
                              ReputationUtils.isCurrentPreLevel(getUserWalletWithReputations: widget.getUserWalletWithReputations, findLoyaltySettingsByTarget: widget.findLoyaltySettingsByTarget)
                                  ? SimpleCircularProgressBar(
                                      valueNotifier: ValueNotifier<double>(ReputationUtils.getWalletAmount(widget.getUserWalletWithReputations).toDouble()),
                                      maxValue: (widget.getUserWalletWithReputations!.reputationLevels!.first.levelInterval?.max ?? 0).toDouble() -
                                          (widget.getUserWalletWithReputations!.reputationLevels!.first.levelInterval?.min ?? 0),
                                      fullProgressColor: ReputationUtils.getPrelevelColor(findLoyaltySettingsByTarget: widget.findLoyaltySettingsByTarget),
                                      progressColors: [ReputationUtils.getPrelevelColor(findLoyaltySettingsByTarget: widget.findLoyaltySettingsByTarget)],
                                      backColor: Theme.of(context).focusColor,
                                      size: 140.0,
                                    )
                                  : SimpleCircularProgressBar(
                                      maxValue: ReputationUtils.getCurrentLevel(widget.getUserWalletWithReputations)!.levelInterval!.max!.toDouble() -
                                          ReputationUtils.getCurrentLevel(widget.getUserWalletWithReputations)!.levelInterval!.min!.toDouble(),
                                      valueNotifier: ValueNotifier<double>(
                                        ReputationUtils.getLevelAmountByLevel(
                                          getUserWalletWithReputations: widget.getUserWalletWithReputations,
                                          reputationLevels: ReputationUtils.getCurrentLevel(widget.getUserWalletWithReputations),
                                          index: (widget.getUserWalletWithReputations?.reputationLevels ?? [])
                                              .indexWhere((element) => element.id == ReputationUtils.getCurrentLevel(widget.getUserWalletWithReputations)?.id),
                                        ).toDouble(),
                                      ),
                                      fullProgressColor: ReputationUtils.getColorByLevel(
                                        findLoyaltySettingsByTarget: widget.findLoyaltySettingsByTarget,
                                        getUserWalletWithReputations: widget.getUserWalletWithReputations,
                                        reputationLevels: ReputationUtils.getCurrentLevel(widget.getUserWalletWithReputations),
                                        index: (widget.getUserWalletWithReputations?.reputationLevels ?? [])
                                                .indexWhere((element) => element.id == ReputationUtils.getCurrentLevel(widget.getUserWalletWithReputations)?.id) +
                                            1,
                                      ),
                                      progressColors: [
                                        ReputationUtils.getColorByLevel(
                                          findLoyaltySettingsByTarget: widget.findLoyaltySettingsByTarget,
                                          getUserWalletWithReputations: widget.getUserWalletWithReputations,
                                          reputationLevels: ReputationUtils.getCurrentLevel(widget.getUserWalletWithReputations),
                                          index: (widget.getUserWalletWithReputations?.reputationLevels ?? [])
                                                  .indexWhere((element) => element.id == ReputationUtils.getCurrentLevel(widget.getUserWalletWithReputations)?.id) +
                                              1,
                                        ),
                                      ],
                                      backColor: Theme.of(context).focusColor,
                                      size: 140.0,
                                    ),
                              Column(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  RichText(
                                    textAlign: TextAlign.center,
                                    text: TextSpan(
                                      children: [
                                        TextSpan(
                                          text: ReputationUtils.isCurrentPreLevel(
                                            getUserWalletWithReputations: widget.getUserWalletWithReputations,
                                            findLoyaltySettingsByTarget: widget.findLoyaltySettingsByTarget,
                                          )
                                              ? '${ReputationUtils.getWalletAmount(widget.getUserWalletWithReputations)}'
                                              : '${ReputationUtils.getLevelAmountByLevel(
                                                  getUserWalletWithReputations: widget.getUserWalletWithReputations,
                                                  reputationLevels: ReputationUtils.getCurrentLevel(widget.getUserWalletWithReputations),
                                                  index: (widget.getUserWalletWithReputations?.reputationLevels ?? [])
                                                      .indexWhere((element) => element.id == ReputationUtils.getCurrentLevel(widget.getUserWalletWithReputations)?.id),
                                                )}',
                                          style: Theme.of(context).textTheme.displayMedium!.copyWith(
                                                fontSize: 16.0,
                                              ),
                                        ),
                                        TextSpan(
                                          text: ' / ',
                                          style: Theme.of(context).textTheme.bodyMedium,
                                        ),
                                        TextSpan(
                                          text: ReputationUtils.isCurrentPreLevel(
                                            getUserWalletWithReputations: widget.getUserWalletWithReputations,
                                            findLoyaltySettingsByTarget: widget.findLoyaltySettingsByTarget,
                                          )
                                              ? '${widget.getUserWalletWithReputations!.reputationLevels!.first.levelInterval?.max ?? 0}'
                                              : '${ReputationUtils.getCurrentLevel(widget.getUserWalletWithReputations)!.levelInterval!.max! - ReputationUtils.getCurrentLevel(widget.getUserWalletWithReputations)!.levelInterval!.min!}',
                                          style: Theme.of(context).textTheme.displayLarge!.copyWith(
                                                fontSize: 15.0,
                                              ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  const SizedBox(height: 4.0),
                                  Text(
                                    ReputationUtils.isCurrentPreLevel(
                                      getUserWalletWithReputations: widget.getUserWalletWithReputations,
                                      findLoyaltySettingsByTarget: widget.findLoyaltySettingsByTarget,
                                    )
                                        ? widget.findLoyaltySettingsByTarget?.prelevel?.name ?? '-'
                                        : ReputationUtils.getCurrentLevel(widget.getUserWalletWithReputations)!.reputationLevel ?? '',
                                    style: Theme.of(context).textTheme.bodyLarge,
                                  ),
                                ],
                              ),
                            ],
                          ),
                          const SizedBox(height: 16.0),
                          QualitativeQuantitativeWidget(
                            textStyle: Theme.of(context).textTheme.displayMedium,
                            walletType: Enum$WalletTypeEnum.QUALITATIVE,
                            amount:
                                ReputationUtils.isCurrentPreLevel(getUserWalletWithReputations: widget.getUserWalletWithReputations, findLoyaltySettingsByTarget: widget.findLoyaltySettingsByTarget)
                                    ? ReputationUtils.getWalletAmount(widget.getUserWalletWithReputations)
                                    : '${ReputationUtils.getLevelAmountByLevel(
                                        getUserWalletWithReputations: widget.getUserWalletWithReputations,
                                        reputationLevels: ReputationUtils.getCurrentLevel(widget.getUserWalletWithReputations),
                                        index: (widget.getUserWalletWithReputations?.reputationLevels ?? [])
                                            .indexWhere((element) => element.id == ReputationUtils.getCurrentLevel(widget.getUserWalletWithReputations)?.id),
                                      )}'
                                        .toInteger(),
                            size: const Size(26.0, 26.0),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 16.0),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            mainAxisSize: MainAxisSize.min,
                            children: List.generate(
                              widget.getUserWalletWithReputations!.reputationLevels!.length + 1,
                              (index) {
                                Query$getUserWalletWithReputations$getUserWalletWithReputations$reputationLevels? reputationLevels;
                                if (index > 0) {
                                  reputationLevels = widget.getUserWalletWithReputations!.reputationLevels![index - 1];
                                }
                                return index == widget.getUserWalletWithReputations!.reputationLevels!.length
                                    ? Container(
                                        height: ReputationUtils.isLevelPassed(getUserWalletWithReputations: widget.getUserWalletWithReputations, reputationLevels: reputationLevels, index: index)
                                            ? 40.0
                                            : 30.0,
                                        width: ReputationUtils.isLevelPassed(getUserWalletWithReputations: widget.getUserWalletWithReputations, reputationLevels: reputationLevels, index: index)
                                            ? 40.0
                                            : 30.0,
                                        alignment: Alignment.center,
                                        decoration: BoxDecoration(
                                          color: Theme.of(context).focusColor,
                                          shape: BoxShape.circle,
                                        ),
                                        child: SharedImageProviderWidget(
                                          imageUrl: ReputationUtils.isLevelPassed(getUserWalletWithReputations: widget.getUserWalletWithReputations, reputationLevels: reputationLevels, index: index)
                                              ? kTrophy
                                              : kClockWatch,
                                          fit: BoxFit.cover,
                                          height: ReputationUtils.isLevelPassed(getUserWalletWithReputations: widget.getUserWalletWithReputations, reputationLevels: reputationLevels, index: index)
                                              ? 26.0
                                              : 18.0,
                                          width: ReputationUtils.isLevelPassed(getUserWalletWithReputations: widget.getUserWalletWithReputations, reputationLevels: reputationLevels, index: index)
                                              ? 26.0
                                              : 18.0,
                                        ),
                                      )
                                    : Expanded(
                                        child: Row(
                                          children: [
                                            Container(
                                              height: ReputationUtils.isLevelPassed(getUserWalletWithReputations: widget.getUserWalletWithReputations, reputationLevels: reputationLevels, index: index)
                                                  ? 40.0
                                                  : 30.0,
                                              width: ReputationUtils.isLevelPassed(getUserWalletWithReputations: widget.getUserWalletWithReputations, reputationLevels: reputationLevels, index: index)
                                                  ? 40.0
                                                  : 30.0,
                                              alignment: Alignment.center,
                                              decoration: BoxDecoration(
                                                color: Theme.of(context).focusColor,
                                                shape: BoxShape.circle,
                                              ),
                                              child: SharedImageProviderWidget(
                                                imageUrl:
                                                    ReputationUtils.isLevelPassed(getUserWalletWithReputations: widget.getUserWalletWithReputations, reputationLevels: reputationLevels, index: index)
                                                        ? kTrophy
                                                        : kClockWatch,
                                                fit: BoxFit.cover,
                                                height:
                                                    ReputationUtils.isLevelPassed(getUserWalletWithReputations: widget.getUserWalletWithReputations, reputationLevels: reputationLevels, index: index)
                                                        ? 26.0
                                                        : 18.0,
                                                width:
                                                    ReputationUtils.isLevelPassed(getUserWalletWithReputations: widget.getUserWalletWithReputations, reputationLevels: reputationLevels, index: index)
                                                        ? 26.0
                                                        : 18.0,
                                              ),
                                            ),
                                            Expanded(
                                              child: Container(
                                                width: double.infinity,
                                                decoration: DottedBorder(
                                                  borderRadius: BorderRadius.circular(100.0),
                                                  shape: Shape.box,
                                                ),
                                              ),
                                            ),
                                          ],
                                        ),
                                      );
                              },
                            ),
                          ),
                          if (_getCountDownDuration(getCurrentUserReputationsLossDate) != null)
                            Padding(
                              padding: const EdgeInsets.only(top: 16.0),
                              child: Wrap(
                                alignment: WrapAlignment.center,
                                crossAxisAlignment: WrapCrossAlignment.center,
                                children: [
                                  Text(
                                    '${translate(context, 'reputationText1')} ',
                                    style: Theme.of(context).textTheme.bodyMedium,
                                    textAlign: TextAlign.center,
                                  ),
                                  QualitativeQuantitativeWidget(
                                    textStyle: Theme.of(context).textTheme.bodyLarge,
                                    walletType: Enum$WalletTypeEnum.QUALITATIVE,
                                    textAlign: TextAlign.center,
                                    size: const Size(18.0, 18.0),
                                    amount: ReputationUtils.isCurrentPreLevel(
                                      getUserWalletWithReputations: widget.getUserWalletWithReputations,
                                      findLoyaltySettingsByTarget: widget.findLoyaltySettingsByTarget,
                                    )
                                        ? widget.findLoyaltySettingsByTarget?.prelevel?.inactivityCycle ?? 0
                                        : ReputationUtils.getCurrentLevel(widget.getUserWalletWithReputations)?.lossAmount ?? 0,
                                  ),
                                  Text(
                                    ' ${translate(context, 'fromYourReputation')}',
                                    style: Theme.of(context).textTheme.bodyMedium,
                                    textAlign: TextAlign.center,
                                  ),
                                ],
                              ),
                            ),
                          if (_getCountDownDuration(getCurrentUserReputationsLossDate) != null)
                            Center(
                              child: Padding(
                                padding: const EdgeInsets.only(top: 16.0),
                                child: SlideCountdown(
                                  duration: _getCountDownDuration(getCurrentUserReputationsLossDate),
                                  separatorStyle: Theme.of(context).textTheme.displayLarge!,
                                  style: Theme.of(context).textTheme.displayLarge!,
                                  separatorPadding: EdgeInsets.zero,
                                  decoration: const BoxDecoration(),
                                  padding: EdgeInsets.zero,
                                  separator: ' : ',
                                ),
                              ),
                            ),
                          const SizedBox(height: 16.0),
                          Wrap(
                            crossAxisAlignment: WrapCrossAlignment.center,
                            runSpacing: 16.0,
                            spacing: 16.0,
                            children: List.generate(
                              widget.getUserWalletWithReputations!.reputationLevels!.length + 1,
                              (index) {
                                Query$getUserWalletWithReputations$getUserWalletWithReputations$reputationLevels? reputationLevels;
                                if (index > 0) {
                                  reputationLevels = widget.getUserWalletWithReputations!.reputationLevels![index - 1];
                                }
                                return Opacity(
                                  opacity: ((index == 0 &&
                                              ReputationUtils.isCurrentPreLevel(
                                                getUserWalletWithReputations: widget.getUserWalletWithReputations,
                                                findLoyaltySettingsByTarget: widget.findLoyaltySettingsByTarget,
                                              )) ||
                                          (index > 0 && ReputationUtils.getCurrentLevel(widget.getUserWalletWithReputations)?.id == reputationLevels?.id))
                                      ? 1.0
                                      : 0.4,
                                  child: Stack(
                                    alignment: Alignment.topRight,
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.all(16.0),
                                        decoration: BoxDecoration(
                                          borderRadius: BorderRadius.circular(8.0),
                                          color: ReputationUtils.getRealColorByLevel(
                                            findLoyaltySettingsByTarget: widget.findLoyaltySettingsByTarget,
                                            getUserWalletWithReputations: widget.getUserWalletWithReputations,
                                            reputationLevels: reputationLevels,
                                            index: index,
                                          ),
                                        ),
                                        child: index == 0
                                            ? Column(
                                                crossAxisAlignment: CrossAxisAlignment.start,
                                                children: [
                                                  Text(
                                                    widget.findLoyaltySettingsByTarget?.prelevel?.name ?? '',
                                                    style: Theme.of(context).textTheme.displayMedium!.copyWith(
                                                          color: Colors.white,
                                                          fontSize: 15.0,
                                                        ),
                                                  ),
                                                  const SizedBox(height: 4.0),
                                                  (widget.findLoyaltySettingsByTarget?.prelevel?.perks?.description ?? '').isEmpty
                                                      ? Text(
                                                          translate(context, 'emptyPerks'),
                                                          style: Theme.of(context).textTheme.bodyMedium!.copyWith(
                                                                color: Colors.white,
                                                              ),
                                                        )
                                                      : HtmlWidget(
                                                          widget.findLoyaltySettingsByTarget!.prelevel!.perks!.description.removeNull(),
                                                          textStyle: const TextStyle(color: Colors.white),
                                                        ),
                                                ],
                                              )
                                            : Column(
                                                crossAxisAlignment: CrossAxisAlignment.start,
                                                children: [
                                                  Text(
                                                    reputationLevels?.reputationLevel ?? '',
                                                    style: Theme.of(context).textTheme.displayMedium!.copyWith(
                                                          color: Colors.white,
                                                          fontSize: 15.0,
                                                        ),
                                                  ),
                                                  const SizedBox(height: 4.0),
                                                  (reputationLevels?.perks?.description ?? '').isEmpty
                                                      ? Text(
                                                          translate(context, 'emptyPerks'),
                                                          style: Theme.of(context).textTheme.bodyMedium!.copyWith(
                                                                color: Colors.white,
                                                              ),
                                                        )
                                                      : HtmlWidget(
                                                          reputationLevels!.perks!.description.removeNull(),
                                                          textStyle: const TextStyle(color: Colors.white),
                                                        ),
                                                ],
                                              ),
                                      ),
                                      if ((index == 0 &&
                                              ReputationUtils.isCurrentPreLevel(
                                                getUserWalletWithReputations: widget.getUserWalletWithReputations,
                                                findLoyaltySettingsByTarget: widget.findLoyaltySettingsByTarget,
                                              )) ||
                                          (index > 0 && ReputationUtils.getCurrentLevel(widget.getUserWalletWithReputations)?.id == reputationLevels?.id))
                                        Container(
                                          padding: const EdgeInsets.symmetric(vertical: 4.0, horizontal: 8.0),
                                          decoration: BoxDecoration(
                                            borderRadius: BorderRadius.circular(8.0),
                                            color: Colors.white,
                                          ),
                                          child: Text(
                                            translate(context, 'youreHere'),
                                            style: Theme.of(context).textTheme.bodyMedium!.copyWith(
                                                  color: ReputationUtils.getCurrentLevelColor(
                                                    getUserWalletWithReputations: widget.getUserWalletWithReputations,
                                                    findLoyaltySettingsByTarget: widget.findLoyaltySettingsByTarget,
                                                  ),
                                                ),
                                          ),
                                        ),
                                    ],
                                  ),
                                );
                              },
                            ),
                          ),
                        ],
                      ),
          ),
        ),
      );
}
