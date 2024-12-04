import 'package:flutter/material.dart';
import 'package:flutter_diktup_utilities/extensions.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-quest-activity.graphql.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-quest-quest.graphql.dart';
import 'package:flutter_loyalcraft_gql/schema.graphql.dart';
import 'package:loyalcraft/localizations_delegate/app_localizations.dart';
import 'package:loyalcraft/src/bloc/variable.dart';
import 'package:loyalcraft/src/screens/memory_game.dart';

// ignore: must_be_immutable
class ActivityActionMemoryGameWidget extends StatelessWidget {
  ActivityActionMemoryGameWidget({
    required this.valueChanged,
    required this.action,
    required this.questActivity,
    required this.isLoadingCubit,
    required this.game,
    required this.quest,
    Key? key,
  }) : super(key: key);
  Query$getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated$getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated$objects quest;
  Query$getQuestActivitiesByQuest$getQuestActivitiesByQuest$activity$action$definition$game? game;
  Query$getQuestActivitiesByQuest$getQuestActivitiesByQuest questActivity;
  ValueChanged<Input$QuestActionGameInput> valueChanged;
  Query$getQuestActivitiesByQuest$getQuestActivitiesByQuest$activity$action action;
  VariableCubit isLoadingCubit;

  int _getTotalSeconds() {
    if (game?.memory?.timer != null) {
      if (game?.memory?.timer == Enum$GameTimerEnum.FIVE_MINUTES) {
        return 60 * 5;
      }
      if (game?.memory?.timer == Enum$GameTimerEnum.HALF_MINUTE) {
        return 30;
      }
      if (game?.memory?.timer == Enum$GameTimerEnum.MINUTE) {
        return 60;
      }
      if (game?.memory?.timer == Enum$GameTimerEnum.TWO_MINUTES) {
        return 60 * 2;
      }
    }

    return 60;
  }

  @override
  Widget build(BuildContext context) => Column(
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
                  questActivity.title ?? translate(context, 'noDataFound'),
                  style: Theme.of(context).textTheme.bodyLarge,
                ),
                if (questActivity.description.removeNull().isNotEmpty)
                  Padding(
                    padding: const EdgeInsets.only(top: 16.0),
                    child: Text(
                      questActivity.description ?? '',
                      style: Theme.of(context).textTheme.bodyMedium,
                      overflow: TextOverflow.ellipsis,
                      softWrap: false,
                      maxLines: 2,
                    ),
                  ),
              ],
            ),
          ),
          const SizedBox(height: 16.0),
          MemoryGameWidget(
            shuffledImages: game!.memory!.pictures!.map((e) => '${e.baseUrl.removeNull()}/${e.path.removeNull()}').toList(),
            onSuccess: (value) {
              valueChanged(value);
            },
            questActivity: questActivity,
            game: game,
            totalSeconds: _getTotalSeconds(),
          ),
        ],
      );
}
