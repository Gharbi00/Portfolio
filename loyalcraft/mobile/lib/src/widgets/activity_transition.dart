import 'package:flutter/material.dart';
import 'package:flutter_diktup_utilities/extensions.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-quest-activity.graphql.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-quest-quest.graphql.dart';
import 'package:loyalcraft/localizations_delegate/app_localizations.dart';
import 'package:loyalcraft/src/bloc/variable.dart';
import 'package:loyalcraft/src/data/consts.dart';

// ignore: must_be_immutable
class ActivityTransitionWidget extends StatelessWidget {
  ActivityTransitionWidget({
    Key? key,
    required this.valueChanged,
    required this.transition,
    required this.isLoadingCubit,
    required this.quest,
  }) : super(key: key);
  Query$getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated$getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated$objects quest;
  Query$getQuestActivitiesByQuest$getQuestActivitiesByQuest$activity$transition transition;
  VariableCubit<bool> isLoadingCubit;
  ValueChanged<bool> valueChanged;

  @override
  Widget build(BuildContext context) => Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            transition.title ?? translate(context, 'noDataFound'),
            style: Theme.of(context).textTheme.displayMedium!.copyWith(
                  fontSize: 15.0,
                ),
          ),
          if (transition.description.removeNull().isNotEmpty)
            Padding(
              padding: const EdgeInsets.only(top: 16.0),
              child: Text(
                transition.description.removeNull(),
                style: Theme.of(context).textTheme.bodyMedium,
              ),
            ),
          if (isLoadingCubit.state == false && (quest.isAccountLinked ?? false))
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
                onPressed: () {
                  if (quest.isAccountLinked ?? false) {
                    valueChanged(true);
                  }
                },
                child: Text(
                  translate(context, 'gotIt'),
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                        color: Colors.white,
                      ),
                ),
              ),
            ),
        ],
      );
}
