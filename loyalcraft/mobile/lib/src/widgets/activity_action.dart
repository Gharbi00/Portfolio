import 'package:flutter/material.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-quest-activity.graphql.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-quest-quest.graphql.dart';
import 'package:flutter_loyalcraft_gql/schema.graphql.dart';
import 'package:loyalcraft/src/bloc/question.dart';
import 'package:loyalcraft/src/bloc/variable.dart';
import 'package:loyalcraft/src/screens/jigsaw_puzzle.dart';
import 'package:loyalcraft/src/widgets/activity_action_api.dart';
import 'package:loyalcraft/src/widgets/activity_action_form.dart';
import 'package:loyalcraft/src/widgets/activity_action_lead.dart';
import 'package:loyalcraft/src/widgets/activity_action_memory_game.dart';
import 'package:loyalcraft/src/widgets/activity_action_quiz_game.dart';
import 'package:loyalcraft/src/widgets/activity_action_sliding_puzzle.dart';
import 'package:loyalcraft/src/widgets/activity_action_social_media.dart';
import 'package:loyalcraft/src/widgets/activity_action_video.dart';

// ignore: must_be_immutable
class ActivityActionWidget extends StatelessWidget {
  ActivityActionWidget({
    required this.getQuestionsbyFormWithResponsesStatsPaginatedCubit,
    required this.formCompletedValueChanged,
    required this.socialMediaValueChanged,
    required this.responseInputListCubit,
    required this.videoValueChanged,
    required this.gamesValueChanged,
    required this.questionPageCubit,
    required this.leadValueChanged,
    required this.formValueChanged,
    required this.apiValueChanged,
    required this.isLoadingCubit,
    required this.questActivity,
    required this.action,
    required this.quest,
    required this.locale,
    required this.themeData,
    Key? key,
  }) : super(key: key);
  Locale locale;
  ThemeData themeData;
  Query$getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated$getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated$objects quest;
  GetQuestionsbyFormWithResponsesStatsPaginatedCubit getQuestionsbyFormWithResponsesStatsPaginatedCubit;
  Query$getQuestActivitiesByQuest$getQuestActivitiesByQuest$activity$action action;
  Query$getQuestActivitiesByQuest$getQuestActivitiesByQuest questActivity;
  ValueChanged<Input$QuestActionActivityWatchedInput> videoValueChanged;
  ValueChanged<Input$QuestActionActivityApiInput> apiValueChanged;
  VariableCubit<List<Input$ResponseInput>> responseInputListCubit;
  ValueChanged<Input$QuestActionGameInput> gamesValueChanged;
  ValueChanged<List<Input$ResponseInput>> formValueChanged;
  ValueChanged<bool> formCompletedValueChanged;
  ValueChanged<bool> socialMediaValueChanged;
  VariableCubit<int> questionPageCubit;
  ValueChanged<bool> leadValueChanged;
  VariableCubit<bool> isLoadingCubit;

  @override
  Widget build(BuildContext context) => Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          if (action.definition?.api != null)
            ActivityActionApiWidget(
              valueChanged: (value) => apiValueChanged(value),
              isLoadingCubit: isLoadingCubit,
              questActivity: questActivity,
              api: action.definition!.api,
              action: action,
              quest: quest,
            ),
          if (action.definition?.form != null)
            ActivityActionFormWidget(
              getQuestionsbyFormWithResponsesStatsPaginatedCubit: getQuestionsbyFormWithResponsesStatsPaginatedCubit,
              formCompletedValueChanged: formCompletedValueChanged,
              responseInputListCubit: responseInputListCubit,
              questionPageCubit: questionPageCubit,
              formValueChanged: formValueChanged,
              isLoadingCubit: isLoadingCubit,
              form: action.definition!.form,
              questActivity: questActivity,
              action: action,
              quest: quest,
              locale: locale,
              themeData: themeData,
            ),
          if ((action.definition?.lead?.url ?? '').isNotEmpty)
            ActivityActionLeadWidget(
              valueChanged: (value) => leadValueChanged(value),
              isLoadingCubit: isLoadingCubit,
              lead: action.definition!.lead!,
              questActivity: questActivity,
              quest: quest,
            ),
          if (action.definition?.game?.sliding != null &&
              action.definition?.game?.gameType == Enum$GameTypeEnum.SLIDING &&
              action.definition?.game?.sliding?.picture?.baseUrl != null &&
              action.definition?.game?.sliding?.picture?.path != null)
            ActivityActionSlidingPuzzleWidget(
              valueChanged: (value) {
                if (quest.isAccountLinked ?? false) {
                  gamesValueChanged(value);
                }
              },
              isLoadingCubit: isLoadingCubit,
              game: action.definition!.game,
              action: action,
              quest: quest,
              questActivity: questActivity,
            ),
          if (action.definition?.game?.memory != null && action.definition?.game?.gameType == Enum$GameTypeEnum.MEMORY_GAME)
            ActivityActionMemoryGameWidget(
              valueChanged: (value) {
                if (quest.isAccountLinked ?? false) {
                  gamesValueChanged(value);
                }
              },
              isLoadingCubit: isLoadingCubit,
              game: action.definition!.game,
              questActivity: questActivity,
              action: action,
              quest: quest,
            ),
          if (action.definition?.game?.jigsaw != null &&
              action.definition?.game?.gameType == Enum$GameTypeEnum.JIGSAW &&
              action.definition?.game?.jigsaw?.picture?.baseUrl != null &&
              action.definition?.game?.jigsaw?.picture?.path != null)
            JigsawPuzzleWidget(
              valueChanged: (value) {
                if (quest.isAccountLinked ?? false) {
                  gamesValueChanged(value);
                }
              },
              isLoadingCubit: isLoadingCubit,
              game: action.definition!.game,
              questActivity: questActivity,
              totalSeconds: 60 * 60,
              numberOfPieces: action.definition!.game!.jigsaw!.pieces ?? 16,
              action: action,
              quest: quest,
            ),
          if (action.definition?.game != null &&
              (action.definition?.game?.gameType == Enum$GameTypeEnum.FIND_HIDDEN_OBJECT ||
                  action.definition?.game?.gameType == Enum$GameTypeEnum.GUESS_MISSING_ELEMENT ||
                  action.definition?.game?.gameType == Enum$GameTypeEnum.GUESS_THE_PRICE ||
                  action.definition?.game?.gameType == Enum$GameTypeEnum.TRIVIA_QUIZ))
            ActivityActionQuizGameWidget(
              valueChanged: (value) => leadValueChanged(value),
              isLoadingCubit: isLoadingCubit,
              game: action.definition!.game,
              questActivity: questActivity,
              action: action,
              quest: quest,
            ),
          if ((action.definition?.socialMedia?.url ?? '').isNotEmpty)
            ActivityActionSocialMediaWidget(
              socialMedia: action.definition!.socialMedia!,
              valueChanged: socialMediaValueChanged,
              isLoadingCubit: isLoadingCubit,
              questActivity: questActivity,
              action: action,
              quest: quest,
            ),
          if ((action.definition?.video?.link ?? '').isNotEmpty)
            ActivityActionVideoWidget(
              valueChanged: (value) => videoValueChanged(value),
              video: action.definition!.video!,
              isLoadingCubit: isLoadingCubit,
              questActivity: questActivity,
              action: action,
              quest: quest,
            ),
        ],
      );
}
