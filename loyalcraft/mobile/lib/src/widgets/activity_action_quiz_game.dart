import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_diktup_utilities/extensions.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-quest-activity.graphql.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-quest-quest.graphql.dart';
import 'package:flutter_loyalcraft_gql/schema.graphql.dart';
import 'package:loyalcraft/localizations_delegate/app_localizations.dart';
import 'package:loyalcraft/src/bloc/variable.dart';
import 'package:loyalcraft/src/data/consts.dart';
import 'package:loyalcraft/src/utils/image_cache_manager/shared_image_provider.dart';

// ignore: must_be_immutable
class ActivityActionQuizGameWidget extends StatefulWidget {
  ActivityActionQuizGameWidget({
    required this.isLoadingCubit,
    required this.questActivity,
    required this.valueChanged,
    required this.action,
    required this.game,
    required this.quest,
    Key? key,
  }) : super(key: key);
  Query$getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated$getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated$objects quest;

  Query$getQuestActivitiesByQuest$getQuestActivitiesByQuest$activity$action$definition$game? game;
  Query$getQuestActivitiesByQuest$getQuestActivitiesByQuest$activity$action action;
  Query$getQuestActivitiesByQuest$getQuestActivitiesByQuest questActivity;
  ValueChanged<bool> valueChanged;
  VariableCubit isLoadingCubit;

  @override
  _ActivityActionQuizGameWidget createState() => _ActivityActionQuizGameWidget();
}

class _ActivityActionQuizGameWidget extends State<ActivityActionQuizGameWidget> {
  late VariableCubit<List<String>> responseListCubit;

  bool _formHasError({required List<String> responseList}) {
    var list1 = (widget.game?.quizz?.choices ?? []).where((e) => (e.correct ?? false) && (e.item ?? '').isNotEmpty).toList().map((e) => e.item ?? '').toList();
    var list2 = responseList.where((e) => e.isNotEmpty).toList();
    var areEqual = Set.from(list1).difference(Set.from(list2)).isEmpty && Set.from(list2).difference(Set.from(list1)).isEmpty;
    return areEqual == false;
  }

  void _initState() {
    responseListCubit = VariableCubit(value: []);
  }

  @override
  void initState() {
    super.initState();
    if (mounted) {
      _initState();
    }
  }

  @override
  Widget build(BuildContext context) => BlocProvider(
        create: (context) => responseListCubit,
        child: BlocBuilder<VariableCubit, dynamic>(
          bloc: responseListCubit,
          builder: (context, responseList) => Column(
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
              const SizedBox(height: 16.0),
              Center(
                child: SharedImageProviderWidget(
                  imageUrl: '${widget.game!.quizz!.picture!.baseUrl}/${widget.game!.quizz!.picture!.path}',
                  backgroundColor: Theme.of(context).focusColor,
                  borderRadius: BorderRadius.circular(8.0),
                  fit: BoxFit.cover,
                  enableOnTap: true,
                  width: double.infinity,
                  height: 300.0,
                ),
              ),
              const SizedBox(height: 16.0),
              if (widget.game?.quizz?.quizzType == Enum$QuestionTypeEnum.MULTIPLE_CHOICE)
                _multipleChoice(
                  responseList: List.of(responseList).map((e) => e.toString()).toList(),
                  responseListCubit: responseListCubit,
                  context: context,
                )
              else if (widget.game?.quizz?.quizzType == Enum$QuestionTypeEnum.SINGLE_CHOICE)
                _signleChoice(
                  responseList: List.of(responseList).map((e) => e.toString()).toList(),
                  responseListCubit: responseListCubit,
                  context: context,
                )
              else
                const SizedBox(),
              if (widget.isLoadingCubit.state == false && (widget.quest.isAccountLinked ?? false))
                Padding(
                  padding: const EdgeInsets.only(top: 16.0),
                  child: TextButton(
                    style: TextButton.styleFrom(
                      minimumSize: const Size.fromHeight(40.0),
                      backgroundColor: kAppColor,
                      disabledBackgroundColor: kAppColor.withOpacity(0.6),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8.0),
                      ),
                    ),
                    onPressed: _formHasError(
                      responseList: List.of(responseList).map((e) => e.toString()).toList(),
                    )
                        ? null
                        : () {
                            widget.valueChanged(true);
                            responseListCubit.updateValue([]);
                          },
                    child: Text(
                      translate(context, 'done'),
                      textAlign: TextAlign.center,
                      style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                            color: Colors.white,
                          ),
                    ),
                  ),
                ),
            ],
          ),
        ),
      );

  Widget _multipleChoice({
    required VariableCubit<List<String>> responseListCubit,
    required BuildContext context,
    required List<String> responseList,
  }) =>
      Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: List.generate((widget.game?.quizz?.choices ?? []).length, (index) {
          var choice = widget.game!.quizz!.choices![index];
          return Padding(
            padding: EdgeInsets.only(top: index == 0 ? 0.0 : 16.0),
            child: Row(
              children: [
                SizedBox(
                  height: 30.0,
                  width: 30.0,
                  child: Checkbox(
                    side: BorderSide(
                      color: kAppColor,
                      width: 2.0,
                    ),
                    onChanged: (value) {
                      var exist = List.of(responseListCubit.state!).where((e) => e == choice.item).isNotEmpty;

                      if (exist == false) {
                        responseListCubit.updateValue([choice.item.removeNull(), ...responseList]);
                      } else {
                        var newList = List.of(responseList)..remove(choice.item);
                        responseListCubit.updateValue(newList);
                      }
                      HapticFeedback.heavyImpact();
                    },
                    value: responseList.contains(choice.item),
                    checkColor: Colors.white,
                    activeColor: kAppColor,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(4.0),
                      side: BorderSide(
                        color: kAppColor,
                        width: 2.0,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 8.0),
                Expanded(
                  child: Text(
                    choice.item ?? '',
                    style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                          color: (choice.correct ?? false) && responseList.contains(choice.item ?? '') ? Colors.green[800] : Theme.of(context).colorScheme.secondary,
                          fontWeight: (choice.correct ?? false) && responseList.contains(choice.item ?? '') ? FontWeight.w600 : FontWeight.w400,
                          fontSize: (choice.correct ?? false) && responseList.contains(choice.item ?? '') ? 16.0 : 14.0,
                        ),
                  ),
                ),
              ],
            ),
          );
        }),
      );

  Widget _signleChoice({
    required VariableCubit responseListCubit,
    required BuildContext context,
    required List<String> responseList,
  }) =>
      Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: List.generate((widget.game!.quizz!.choices ?? []).length, (index) {
          var choice = widget.game!.quizz!.choices![index];
          return Padding(
            padding: EdgeInsets.only(top: index == 0 ? 0.0 : 16.0),
            child: Row(
              children: [
                SizedBox(
                  height: 30.0,
                  width: 30.0,
                  child: Radio(
                    groupValue: widget.game!.quizz!.choices!.indexOf(choice.copyWith(item: responseList.first)),
                    fillColor: WidgetStateProperty.resolveWith<Color>((states) => kAppColor),
                    activeColor: kAppColor,
                    value: index,
                    onChanged: (value) {
                      HapticFeedback.heavyImpact();
                      responseListCubit.updateValue([choice.item]);
                    },
                  ),
                ),
                const SizedBox(width: 8.0),
                Expanded(
                  child: Text(
                    choice.item ?? '',
                    style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                          color: (choice.correct ?? false) && responseList.contains(choice.item ?? '') ? Colors.green[800] : Theme.of(context).colorScheme.secondary,
                          fontWeight: (choice.correct ?? false) && responseList.contains(choice.item ?? '') ? FontWeight.w600 : FontWeight.w400,
                          fontSize: (choice.correct ?? false) && responseList.contains(choice.item ?? '') ? 16.0 : 14.0,
                        ),
                  ),
                ),
              ],
            ),
          );
        }),
      );
}
