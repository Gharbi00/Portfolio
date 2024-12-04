import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_loyalcraft_gql/graphql/forms-question.graphql.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-quest-activity.graphql.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-quest-quest.graphql.dart';
import 'package:flutter_loyalcraft_gql/schema.graphql.dart';
import 'package:loyalcraft/localizations_delegate/app_localizations.dart';
import 'package:loyalcraft/src/bloc/question.dart';
import 'package:loyalcraft/src/bloc/variable.dart';
import 'package:loyalcraft/src/data/consts.dart';
import 'package:loyalcraft/src/widgets/activity_action_form_question.dart';
import 'package:loyalcraft/src/widgets/see_more.dart';

// ignore: must_be_immutable
class ActivityActionFormWidget extends StatelessWidget {
  ActivityActionFormWidget({
    Key? key,
    required this.getQuestionsbyFormWithResponsesStatsPaginatedCubit,
    required this.formCompletedValueChanged,
    required this.responseInputListCubit,
    required this.questionPageCubit,
    required this.formValueChanged,
    required this.isLoadingCubit,
    required this.questActivity,
    required this.action,
    required this.quest,
    required this.form,
    required this.locale,
    required this.themeData,
  }) : super(key: key);

  Query$getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated$getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated$objects quest;
  GetQuestionsbyFormWithResponsesStatsPaginatedCubit getQuestionsbyFormWithResponsesStatsPaginatedCubit;
  Query$getQuestActivitiesByQuest$getQuestActivitiesByQuest$activity$action$definition$form? form;
  Query$getQuestActivitiesByQuest$getQuestActivitiesByQuest$activity$action action;
  Query$getQuestActivitiesByQuest$getQuestActivitiesByQuest questActivity;
  VariableCubit<List<Input$ResponseInput>> responseInputListCubit;
  ValueChanged<List<Input$ResponseInput>> formValueChanged;
  ValueChanged<bool> formCompletedValueChanged;
  VariableCubit<int> questionPageCubit;
  VariableCubit isLoadingCubit;
  ThemeData themeData;
  Locale locale;

  bool _formHasError({
    required List<Query$getQuestionsbyFormWithResponsesStatsPaginated$getQuestionsbyFormWithResponsesStatsPaginated$objects> questionList,
    required bool isLast,
    required BuildContext context,
  }) =>
      questionList.isEmpty || ((context.watch<VariableCubit<List<Input$ResponseInput>>>().state ?? []).length != questionList.length && isLast);

  @override
  Widget build(BuildContext context) => Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          getQuestionsbyFormWithResponsesStatsPaginatedCubit.state == null
              ? const SizedBox()
              : getQuestionsbyFormWithResponsesStatsPaginatedCubit.state!.objects.isEmpty
                  ? const SizedBox()
                  : ListView.separated(
                      itemCount: getQuestionsbyFormWithResponsesStatsPaginatedCubit.state!.objects.length,
                      separatorBuilder: (context, index) => const SizedBox(height: 16.0),
                      physics: const NeverScrollableScrollPhysics(),
                      padding: EdgeInsets.zero,
                      shrinkWrap: true,
                      primary: false,
                      itemBuilder: (context, index) => ActivityActionFormQuestionWidget(
                        question: getQuestionsbyFormWithResponsesStatsPaginatedCubit.state!.objects[index],
                        responseInputListCubit: responseInputListCubit,
                        valueChanged: formValueChanged,
                        themeData: themeData,
                        locale: locale,
                        quest: quest,
                      ),
                    ),
          if ((getQuestionsbyFormWithResponsesStatsPaginatedCubit.state?.isLast ?? true) == false)
            BlocBuilder<VariableCubit, dynamic>(
              bloc: questionPageCubit,
              builder: (context, data) => SeeMoreWidget(
                isLoading: isLoadingCubit.state,
                onTap: () async {
                  isLoadingCubit.updateValue(true);
                  await getQuestionsbyFormWithResponsesStatsPaginatedCubit.getQuestionsbyFormWithResponsesStatsPaginated(
                    Variables$Query$getQuestionsbyFormWithResponsesStatsPaginated(
                      id: form!.form!.id,
                      pagination: Input$PaginationInput(
                        limit: kPaginationLimit,
                        page: questionPageCubit.state! + 1,
                      ),
                    ),
                  );
                  questionPageCubit.updateValue(questionPageCubit.state! + 1);
                  isLoadingCubit.updateValue(false);
                },
              ),
            ),
          if (isLoadingCubit.state == false && (quest.isAccountLinked ?? false))
            Padding(
              padding: const EdgeInsets.only(top: 16.0),
              child: TextButton(
                style: TextButton.styleFrom(
                  disabledBackgroundColor: kAppColor.withOpacity(0.6),
                  minimumSize: const Size.fromHeight(40.0),
                  backgroundColor: kAppColor,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8.0),
                  ),
                ),
                onPressed: _formHasError(
                  questionList: getQuestionsbyFormWithResponsesStatsPaginatedCubit.state?.objects ?? [],
                  isLast: getQuestionsbyFormWithResponsesStatsPaginatedCubit.state?.isLast ?? true,
                  context: context,
                )
                    ? null
                    : () {
                        formValueChanged(responseInputListCubit.state!);
                        formCompletedValueChanged(true);
                      },
                child: Text(
                  translate(context, 'confirm'),
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
