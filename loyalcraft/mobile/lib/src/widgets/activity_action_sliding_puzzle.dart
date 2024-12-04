import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_diktup_utilities/extensions.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-quest-activity.graphql.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-quest-quest.graphql.dart';
import 'package:flutter_loyalcraft_gql/schema.graphql.dart';
import 'package:flutter_staggered_grid_view/flutter_staggered_grid_view.dart';
import 'package:loyalcraft/localizations_delegate/app_localizations.dart';
import 'package:loyalcraft/src/bloc/variable.dart';
import 'package:loyalcraft/src/screens/sliding_puzzle.dart';
import 'package:loyalcraft/src/widgets/initial_threshold_item.dart';
import 'package:loyalcraft/src/widgets/threshold_item.dart';

// ignore: must_be_immutable
class ActivityActionSlidingPuzzleWidget extends StatefulWidget {
  ActivityActionSlidingPuzzleWidget({
    required this.isLoadingCubit,
    required this.questActivity,
    required this.valueChanged,
    required this.action,
    required this.game,
    Key? key,
    required this.quest,
  }) : super(key: key);
  Query$getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated$getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated$objects quest;
  Query$getQuestActivitiesByQuest$getQuestActivitiesByQuest$activity$action$definition$game? game;
  Query$getQuestActivitiesByQuest$getQuestActivitiesByQuest$activity$action action;
  Query$getQuestActivitiesByQuest$getQuestActivitiesByQuest questActivity;
  ValueChanged<Input$QuestActionGameInput> valueChanged;
  VariableCubit isLoadingCubit;

  @override
  _ActivityActionSlidingPuzzleWidget createState() => _ActivityActionSlidingPuzzleWidget();
}

class _ActivityActionSlidingPuzzleWidget extends State<ActivityActionSlidingPuzzleWidget> {
  late VariableCubit<int?> _thresholdIndexCubit;
  late VariableCubit<bool> _isReadyCubit;

  void _initState() {
    if ((widget.game?.sliding?.threshold ?? []).isEmpty) {
      _thresholdIndexCubit = VariableCubit();
      _isReadyCubit = VariableCubit(value: true);
    } else {
      _thresholdIndexCubit = VariableCubit();
      _isReadyCubit = VariableCubit(value: false);
    }
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
          BlocProvider(create: (context) => _thresholdIndexCubit),
          BlocProvider(create: (context) => _isReadyCubit),
        ],
        child: BlocBuilder<VariableCubit, dynamic>(
          bloc: _thresholdIndexCubit,
          builder: (context, thresholdIndex) => BlocBuilder<VariableCubit, dynamic>(
            bloc: _isReadyCubit,
            builder: (context, isReady) => Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  padding: const EdgeInsets.all(16.0),
                  decoration: BoxDecoration(
                    color: Theme.of(context).focusColor,
                    borderRadius: BorderRadius.circular(8.0),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        widget.questActivity.title ?? translate(context, 'noDataFound'),
                        style: Theme.of(context).textTheme.bodyLarge,
                      ),
                      if (widget.questActivity.description.removeNull().isNotEmpty)
                        Padding(
                          padding: const EdgeInsets.only(top: 16.0),
                          child: Text(
                            widget.questActivity.description ?? '',
                            style: Theme.of(context).textTheme.bodyMedium,
                            overflow: TextOverflow.ellipsis,
                            softWrap: false,
                            maxLines: 2,
                          ),
                        ),
                    ],
                  ),
                ),
                if ((widget.game?.sliding?.threshold ?? []).isNotEmpty && thresholdIndex == null && isReady == false)
                  Padding(
                    padding: const EdgeInsets.only(top: 16.0),
                    child: MasonryGridView.count(
                      itemBuilder: (context, index) => index == 0
                          ? InitialThresholdWidget(
                              refreshTheView: (value) {
                                _isReadyCubit.updateValue(true);
                              },
                            )
                          : ThresholdWidget(
                              refreshTheView: (value) {
                                _thresholdIndexCubit.updateValue(value);
                                _isReadyCubit.updateValue(true);
                              },
                              quest: widget.quest,
                              threshold: widget.game!.sliding!.threshold![index - 1],
                              index: index - 1,
                            ),
                      itemCount: widget.game!.sliding!.threshold!.length + 1,
                      physics: const NeverScrollableScrollPhysics(),
                      padding: EdgeInsets.zero,
                      crossAxisSpacing: 16.0,
                      mainAxisSpacing: 16.0,
                      crossAxisCount: 2,
                      shrinkWrap: true,
                      primary: false,
                    ),
                  ),
                if (isReady == true)
                  Padding(
                    padding: const EdgeInsets.only(top: 16.0),
                    child: SlidingPuzzleWidget(
                      coverImage: '${widget.game!.sliding!.picture!.baseUrl.removeNull()}/${widget.game!.sliding!.picture!.path.removeNull()}',
                      threshold: thresholdIndex == null
                          ? null
                          : (widget.game?.sliding?.threshold ?? []).isEmpty
                              ? null
                              : widget.game!.sliding!.threshold![thresholdIndex],
                      questActivity: widget.questActivity,
                      valueChanged: (value) {
                        widget.valueChanged(value);
                      },
                      game: widget.game,
                    ),
                  ),
              ],
            ),
          ),
        ),
      );
}
