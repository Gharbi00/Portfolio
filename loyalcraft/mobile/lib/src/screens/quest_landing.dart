import 'dart:math';

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_diktup_utilities/flutter_diktup_utilities.dart';
import 'package:flutter_loyalcraft_gql/graphql/corporate-link-account.graphql.dart';
import 'package:flutter_loyalcraft_gql/graphql/forms-question.graphql.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-card-user-card.graphql.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-loyalty-settings.graphql.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-quest-action.graphql.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-quest-activity.graphql.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-quest-quest.graphql.dart';
import 'package:flutter_loyalcraft_gql/schema.graphql.dart';
import 'package:linear_progress_bar/linear_progress_bar.dart';
import 'package:loyalcraft/localizations_delegate/app_localizations.dart';
import 'package:loyalcraft/src/bloc/home_tab_index.dart';
import 'package:loyalcraft/src/bloc/locale.dart';
import 'package:loyalcraft/src/bloc/loyalty_settings.dart';
import 'package:loyalcraft/src/bloc/quest_activity.dart';
import 'package:loyalcraft/src/bloc/question.dart';
import 'package:loyalcraft/src/bloc/theme.dart';
import 'package:loyalcraft/src/bloc/variable.dart';
import 'package:loyalcraft/src/data/consts.dart';
import 'package:loyalcraft/src/data/flutter_messenger.dart';
import 'package:loyalcraft/src/data/graphql_client.dart';
import 'package:loyalcraft/src/data/shared_preferences.dart';
import 'package:loyalcraft/src/modal_bottom_sheet/quest_info.dart';
import 'package:loyalcraft/src/repository/link_account.dart';
import 'package:loyalcraft/src/repository/loyalty_settings.dart';
import 'package:loyalcraft/src/repository/quest_action.dart';
import 'package:loyalcraft/src/repository/quest_activity.dart';
import 'package:loyalcraft/src/repository/question.dart';
import 'package:loyalcraft/src/repository/user_card.dart';
import 'package:loyalcraft/src/screens/successful.dart';
import 'package:loyalcraft/src/widgets/activity_action.dart';
import 'package:loyalcraft/src/widgets/activity_transition.dart';
import 'package:loyalcraft/src/widgets/custom_circular_progress_indicator.dart';
import 'package:loyalcraft/src/widgets/empty.dart';
import 'package:loyalcraft/src/widgets/non_linked_account_banner.dart';
import 'package:slide_countdown/slide_countdown.dart';

// ignore: must_be_immutable
class QuestLandingWidget extends StatefulWidget {
  QuestLandingWidget({
    Key? key,
    required this.quest,
    this.isTest = false,
  }) : super(key: key);

  Query$getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated$getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated$objects quest;
  bool isTest;

  @override
  _QuestLandingWidget createState() => _QuestLandingWidget();
}

class _QuestLandingWidget extends State<QuestLandingWidget> {
  late GetQuestionsbyFormWithResponsesStatsPaginatedCubit _getQuestionsbyFormWithResponsesStatsPaginatedCubit;
  late VariableCubit<List<Input$QuestActionActivityApiInput>> _questActionActivityApiInputListCubit;
  late VariableCubit<List<Input$QuestActionActivityWatchedInput>> _watchedListCubit;
  late FindLoyaltySettingsByTargetCubit _findLoyaltySettingsByTargetCubit;
  late VariableCubit<List<Input$ResponseInput>> _responseInputListCubit;
  late VariableCubit<List<Input$QuestActionGameInput>> _gamesListCubit;
  late GetQuestActivitiesByQuestCubit _getQuestActivitiesByQuestCubit;
  late LoyaltySettingsRepository _loyaltySettingsRepository;
  final SGraphQLClient _sGraphQLClient = SGraphQLClient();
  late QuestActivityRepository _questActivityRepository;
  late QuestionRepository _questionRepository;
  late UserCardRepository _userCardRepository;
  late VariableCubit<int> _questionPageCubit;
  late VariableCubit<bool> _isLoadingCubit;
  late VariableCubit<int> _countCubit;
  late VariableCubit<int> _stepCubit;
  late LinkAccountRepository _linkAccountRepository;
  late QuestActionRepository _questActionRepository;

  Duration _getQuestDuration() => widget.quest.dueDate == null ? Duration.zero : widget.quest.dueDate!.toLocal().difference(DateTime.now().toLocal());

  Future<void> _getQuestions({required int step}) async {
    await _getQuestionsbyFormWithResponsesStatsPaginatedCubit.getQuestionsbyFormWithResponsesStatsPaginated(
      Variables$Query$getQuestionsbyFormWithResponsesStatsPaginated(
        id: _getQuestActivitiesByQuestCubit.state![step].activity!.action!.definition!.form!.form!.id,
        pagination: Input$PaginationInput(
          page: _questionPageCubit.state,
          limit: kPaginationLimit,
        ),
      ),
    );
    if (_getQuestActivitiesByQuestCubit.state![_stepCubit.state!].activity!.action!.definition?.form?.random ?? false) {
      (_getQuestionsbyFormWithResponsesStatsPaginatedCubit.state?.objects ?? []).shuffle(Random());
    }
  }

  Future<void> _perform() async {
    final getQuestActivitiesByQuest = _getQuestActivitiesByQuestCubit.state ?? [];
    var lastStep = _stepCubit.state!;
    if (widget.quest.isAccountLinked ?? false) {
      if (lastStep + 1 < getQuestActivitiesByQuest.length) {
        _stepCubit.updateValue(lastStep + 1);
        if (getQuestActivitiesByQuest[lastStep + 1].activity?.action?.definition?.form?.form != null) {
          _questionPageCubit.updateValue(0);
          _getQuestions(step: lastStep + 1);
        }
      }
      if (lastStep + 1 == getQuestActivitiesByQuest.length) {
        if (widget.isTest) {
          Navigator.pop(context);
          showGeneralDialog(
            transitionDuration: const Duration(milliseconds: 1),
            barrierColor: Colors.transparent,
            barrierLabel: '',
            context: context,
            pageBuilder: (context, anim1, anim2) => SuccessfulDialog(
              description: translate(context, 'performedTestQuestSuccessfulDialogDescription'),
              subTitle: translate(context, 'performedQuestSuccessfulDialogSubtitle'),
              title: translate(context, 'performedQuestSuccessfulDialogTitle'),
              onPressed: (value) async {
                await addHomeTabIndexToSP(2);
                BlocProvider.of<HomeTabIndexCubit>(context).updateValue(2);
                Navigator.of(context).pushNamedAndRemoveUntil('/Tabs', (route) => false);
              },
              onCancel: (value) async {
                await addHomeTabIndexToSP(2);
                BlocProvider.of<HomeTabIndexCubit>(context).updateValue(2);
                Navigator.of(context).pushNamedAndRemoveUntil('/Tabs', (route) => false);
              },
            ),
          );
        } else {
          _isLoadingCubit.updateValue(true);
          Query$getCurrentUserLinkedCorporateAccountByTarget$getCurrentUserLinkedCorporateAccountByTarget? getCurrentUserLinkedCorporateAccountByTarget;
          if (widget.quest.target.pos?.id != null && widget.quest.target.pos?.id != kPosID) {
            getCurrentUserLinkedCorporateAccountByTarget = await _linkAccountRepository.getCurrentUserLinkedCorporateAccountByTarget(
              Variables$Query$getCurrentUserLinkedCorporateAccountByTarget(
                target: Input$TargetWithoutUserInput(
                  pos: widget.quest.target.pos?.id,
                ),
              ),
            );
          }
          var result = await _questActionRepository.performNonPredefinedQuestByUser(
            Variables$Mutation$performNonPredefinedQuestByUser(
              userToken: getCurrentUserLinkedCorporateAccountByTarget?.token,
              input: Input$PerformNonPredefinedQuestByUserInput(
                quest: widget.quest.id,
                responses: _responseInputListCubit.state,
                watched: _watchedListCubit.state,
                game: _gamesListCubit.state,
                api: _questActionActivityApiInputListCubit.state,
              ),
            ),
          );
          if (result == null) {
            _isLoadingCubit.updateValue(false);
            FlutterMessenger.showSnackbar(context: context, string: translate(context, 'generalErrorMessage'));
            Navigator.pop(context);
          } else {
            _isLoadingCubit.updateValue(false);
            Navigator.pop(context);
            showGeneralDialog(
              transitionDuration: const Duration(milliseconds: 1),
              barrierColor: Colors.transparent,
              barrierLabel: '',
              context: context,
              pageBuilder: (context, anim1, anim2) => SuccessfulDialog(
                description: translate(context, 'performedQuestSuccessfulDialogDescription'),
                subTitle: translate(context, 'performedQuestSuccessfulDialogSubtitle'),
                title: translate(context, 'performedQuestSuccessfulDialogTitle'),
                onPressed: (value) async {
                  await addHomeTabIndexToSP(2);
                  BlocProvider.of<HomeTabIndexCubit>(context).updateValue(2);
                  Navigator.of(context).pushNamedAndRemoveUntil('/Tabs', (route) => false);
                },
                onCancel: (value) async {
                  await addHomeTabIndexToSP(2);
                  BlocProvider.of<HomeTabIndexCubit>(context).updateValue(2);
                  Navigator.of(context).pushNamedAndRemoveUntil('/Tabs', (route) => false);
                },
              ),
            );
          }
        }
      }
    }
  }

  Future<void> _autoLink() async {
    _countCubit.updateValue(1);
    widget.quest = widget.quest.copyWith(isAccountLinked: true);
    final linkUserAccount = await _userCardRepository.linkUserAccount(
      Variables$Mutation$linkUserAccount(
        reference: '${DateTime.now().toLocal().microsecondsSinceEpoch}',
        target: Input$TargetACIInput(
          pos: widget.quest.target.pos?.id ?? '',
        ),
      ),
    );
    debugPrint('$linkUserAccount');
    FlutterMessenger.showSnackbar(context: context, string: translate(context, 'linkAccountDialogSuccessfulDescription'));
  }

  Future<void> _initState() async {
    _loyaltySettingsRepository = LoyaltySettingsRepository(_sGraphQLClient);
    _questActivityRepository = QuestActivityRepository(_sGraphQLClient);
    _questionRepository = QuestionRepository(_sGraphQLClient);
    _userCardRepository = UserCardRepository(_sGraphQLClient);
    _questActionRepository = QuestActionRepository(_sGraphQLClient);
    _linkAccountRepository = LinkAccountRepository(_sGraphQLClient);
    _findLoyaltySettingsByTargetCubit = FindLoyaltySettingsByTargetCubit(_loyaltySettingsRepository);
    _getQuestActivitiesByQuestCubit = GetQuestActivitiesByQuestCubit(_questActivityRepository);
    _questActionActivityApiInputListCubit = VariableCubit(value: []);
    _responseInputListCubit = VariableCubit(value: []);
    _isLoadingCubit = VariableCubit(value: false);
    _watchedListCubit = VariableCubit(value: []);
    _questionPageCubit = VariableCubit(value: 0);
    _gamesListCubit = VariableCubit(value: []);
    _countCubit = VariableCubit(value: 0);
    _stepCubit = VariableCubit(value: 0);
    _getQuestionsbyFormWithResponsesStatsPaginatedCubit = GetQuestionsbyFormWithResponsesStatsPaginatedCubit(
      _questionRepository,
    );
    await _getQuestActivitiesByQuestCubit.getQuestActivitiesByQuest(
      Variables$Query$getQuestActivitiesByQuest(
        quest: widget.quest.id,
      ),
    );
    if ((_getQuestActivitiesByQuestCubit.state ?? []).isNotEmpty) {
      if (_getQuestActivitiesByQuestCubit.state![_stepCubit.state!].activity?.action?.definition?.form?.form != null) {
        _getQuestions(step: _stepCubit.state!);
      }
    }
    if ((widget.quest.isAccountLinked ?? false) == false && widget.isTest == false) {
      _findLoyaltySettingsByTargetCubit.findLoyaltySettingsByTarget(
        Variables$Query$findLoyaltySettingsByTarget(
          target: Input$TargetACIInput(
            pos: widget.quest.target.pos?.id ?? '',
          ),
        ),
      );
    }
  }

  @override
  void didUpdateWidget(covariant QuestLandingWidget oldWidget) {
    widget.quest = oldWidget.quest;
    super.didUpdateWidget(oldWidget);
  }

  @override
  void dispose() {
    _getQuestionsbyFormWithResponsesStatsPaginatedCubit.close();
    _questActionActivityApiInputListCubit.close();
    _getQuestActivitiesByQuestCubit.close();
    _responseInputListCubit.close();
    _questionPageCubit.close();
    _watchedListCubit.close();
    _gamesListCubit.close();
    _isLoadingCubit.close();
    _stepCubit.close();
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
    final _themeData = context.watch<ThemeCubit>().state;
    return MultiBlocProvider(
      providers: [
        BlocProvider(create: (context) => _getQuestionsbyFormWithResponsesStatsPaginatedCubit),
        BlocProvider(create: (context) => _questActionActivityApiInputListCubit),
        BlocProvider(create: (context) => _findLoyaltySettingsByTargetCubit),
        BlocProvider(create: (context) => _getQuestActivitiesByQuestCubit),
        BlocProvider(create: (context) => _responseInputListCubit),
        BlocProvider(create: (context) => _questionPageCubit),
        BlocProvider(create: (context) => _watchedListCubit),
        BlocProvider(create: (context) => _isLoadingCubit),
        BlocProvider(create: (context) => _countCubit),
        BlocProvider(create: (context) => _stepCubit),
      ],
      child: BlocBuilder<FindLoyaltySettingsByTargetCubit, Query$findLoyaltySettingsByTarget$findLoyaltySettingsByTarget?>(
        bloc: _findLoyaltySettingsByTargetCubit,
        builder: (context, findLoyaltySettingsByTarget) => BlocBuilder<GetQuestActivitiesByQuestCubit, List<Query$getQuestActivitiesByQuest$getQuestActivitiesByQuest>?>(
          bloc: _getQuestActivitiesByQuestCubit,
          builder: (context, getQuestActivitiesByQuest) =>
              BlocBuilder<GetQuestionsbyFormWithResponsesStatsPaginatedCubit, Query$getQuestionsbyFormWithResponsesStatsPaginated$getQuestionsbyFormWithResponsesStatsPaginated?>(
            bloc: _getQuestionsbyFormWithResponsesStatsPaginatedCubit,
            builder: (context, getQuestionsbyFormWithResponsesStatsPaginated) => BlocBuilder<VariableCubit, dynamic>(
              bloc: _responseInputListCubit,
              builder: (context, data) => BlocBuilder<VariableCubit, dynamic>(
                bloc: _countCubit,
                builder: (context, count) => BlocBuilder<VariableCubit, dynamic>(
                  bloc: _questActionActivityApiInputListCubit,
                  builder: (context, data) => BlocBuilder<VariableCubit, dynamic>(
                    bloc: _watchedListCubit,
                    builder: (context, data) => BlocBuilder<VariableCubit, dynamic>(
                      bloc: _stepCubit,
                      builder: (context, step) {
                        if ((widget.quest.isAccountLinked ?? false) == false &&
                            widget.isTest == false &&
                            findLoyaltySettingsByTarget != null &&
                            findLoyaltySettingsByTarget.aggregator?.target?.pos?.id == kPosID &&
                            count == 0) {
                          _autoLink();
                        }
                        return Scaffold(
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
                                  child: Wrap(
                                    crossAxisAlignment: WrapCrossAlignment.center,
                                    runSpacing: 4.0,
                                    spacing: 4.0,
                                    children: [
                                      Text(
                                        translate(context, 'endsIn'),
                                        style: Theme.of(context).textTheme.headlineSmall,
                                      ),
                                      SlideCountdown(
                                        separatorStyle: Theme.of(context).textTheme.headlineSmall!,
                                        style: Theme.of(context).textTheme.headlineSmall!,
                                        separatorPadding: EdgeInsets.zero,
                                        decoration: const BoxDecoration(),
                                        duration: _getQuestDuration(),
                                        padding: EdgeInsets.zero,
                                        separator: ' : ',
                                        shouldShowMinutes: (value) => true,
                                        shouldShowSeconds: (value) => true,
                                        shouldShowDays: (value) => true,
                                        shouldShowHours: (value) => true,
                                        onDone: () async {
                                          FlutterMessenger.showSnackbar(context: context, string: translate(context, translate(context, 'questCountDownDoneText')));
                                        },
                                      ),
                                    ],
                                  ),
                                ),
                                const SizedBox(width: 8.0),
                                GestureDetector(
                                  onTap: () => showQuestInfoSheet(context: context, quest: widget.quest, isTest: widget.isTest),
                                  child: Container(
                                    height: 36.0,
                                    width: 36.0,
                                    decoration: BoxDecoration(
                                      borderRadius: BorderRadius.circular(100.0),
                                      color: Theme.of(context).focusColor,
                                    ),
                                    child: Icon(
                                      CupertinoIcons.info,
                                      color: Theme.of(context).colorScheme.secondary,
                                      size: 18.0,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          body: getQuestActivitiesByQuest == null ||
                                  (_getQuestActivitiesByQuestCubit.state![_stepCubit.state!].activity?.action?.definition?.form?.form != null && getQuestionsbyFormWithResponsesStatsPaginated == null)
                              ? CustomCircularProgressIndicatorWidget(
                                  backgroundColor: Theme.of(context).focusColor,
                                  padding: const EdgeInsets.all(16.0),
                                  alignment: Alignment.center,
                                  color: kAppColor,
                                )
                              : getQuestActivitiesByQuest.isEmpty
                                  ? EmptyWidget(
                                      description: translate(context, 'questEmptyDescription'),
                                      title: translate(context, 'questEmptyTitle'),
                                      iconData: CupertinoIcons.play_rectangle_fill,
                                      padding: const EdgeInsets.all(16.0),
                                    )
                                  : GestureDetector(
                                      onTap: () => closeTheKeyboard(context),
                                      child: SafeArea(
                                        left: false,
                                        top: false,
                                        right: false,
                                        child: ListView(
                                          padding: const EdgeInsets.all(16.0),
                                          shrinkWrap: true,
                                          primary: false,
                                          children: [
                                            if (widget.isTest == true)
                                              Padding(
                                                padding: const EdgeInsets.only(bottom: 16.0),
                                                child: Text(
                                                  translate(context, 'questLandingText1'),
                                                  style: Theme.of(context).textTheme.bodySmall,
                                                ),
                                              ),
                                            if (widget.isTest == false &&
                                                (widget.quest.isAccountLinked ?? false) == false &&
                                                findLoyaltySettingsByTarget != null &&
                                                findLoyaltySettingsByTarget.aggregator?.target?.pos?.id != kPosID)
                                              NonLinkedAccountBannerWidget(
                                                posID: widget.quest.target.pos?.id ?? '',
                                              ),
                                            if (getQuestActivitiesByQuest.length > 1)
                                              Padding(
                                                padding: const EdgeInsets.only(bottom: 16.0),
                                                child: ClipRRect(
                                                  borderRadius: BorderRadius.circular(100.0),
                                                  child: LinearProgressBar(
                                                    minHeight: 8.0,
                                                    progressType: LinearProgressBar.progressTypeLinear,
                                                    backgroundColor: kAppColor.withOpacity(0.1),
                                                    maxSteps: getQuestActivitiesByQuest.length,
                                                    progressColor: kAppColor,
                                                    currentStep: step + 1,
                                                  ),
                                                ),
                                              ),
                                            if (getQuestActivitiesByQuest[step].activity?.transition?.title != null)
                                              ActivityTransitionWidget(
                                                transition: getQuestActivitiesByQuest[step].activity!.transition!,
                                                isLoadingCubit: _isLoadingCubit,
                                                quest: widget.quest,
                                                valueChanged: (value) {
                                                  _perform();
                                                },
                                              ),
                                            if (getQuestActivitiesByQuest[step].activity?.action != null)
                                              ActivityActionWidget(
                                                getQuestionsbyFormWithResponsesStatsPaginatedCubit: _getQuestionsbyFormWithResponsesStatsPaginatedCubit,
                                                action: getQuestActivitiesByQuest[step].activity!.action!,
                                                formCompletedValueChanged: (value) => _perform(),
                                                responseInputListCubit: _responseInputListCubit,
                                                questActivity: getQuestActivitiesByQuest[step],
                                                socialMediaValueChanged: (value) => _perform(),
                                                leadValueChanged: (value) => _perform(),
                                                questionPageCubit: _questionPageCubit,
                                                locale: _locale,
                                                themeData: _themeData,
                                                isLoadingCubit: _isLoadingCubit,
                                                quest: widget.quest,
                                                apiValueChanged: (value) {
                                                  var newList = _questActionActivityApiInputListCubit.state ?? [];
                                                  if (newList.where((element) => element.activity == value.activity).isEmpty) {
                                                    newList.add(value);
                                                  } else {
                                                    var index = newList.indexWhere((element) => element.activity == value.activity);
                                                    newList[index] = value;
                                                  }
                                                  _questActionActivityApiInputListCubit.updateValue(newList);
                                                  _perform();
                                                },
                                                videoValueChanged: (value) {
                                                  var newList = _watchedListCubit.state ?? [];

                                                  if (newList.where((element) => element.activity == value.activity).isEmpty) {
                                                    newList.add(value);
                                                  } else {
                                                    var index = newList.indexWhere((element) => element.activity == value.activity);
                                                    newList[index] = value;
                                                  }
                                                  _watchedListCubit.updateValue(newList);

                                                  _perform();
                                                },
                                                gamesValueChanged: (value) {
                                                  var newList = _gamesListCubit.state ?? [];
                                                  if (newList.where((element) => element.activity == value.activity).isEmpty) {
                                                    newList.add(value);
                                                  } else {
                                                    var index = newList.indexWhere((element) => element.activity == value.activity);
                                                    newList[index] = value;
                                                  }
                                                  _gamesListCubit.updateValue(newList);

                                                  _perform();
                                                },
                                                formValueChanged: (value) {
                                                  _responseInputListCubit.updateValue(value);
                                                  // var newList = _responseInputListCubit.state!;
                                                  // for (var i = 0; i < newList.length; i++) {
                                                  //   var response = newList[i];
                                                  //   if (response.answers.paragraph != null) {
                                                  //     if (response.answers.paragraph!.isEmpty) {
                                                  //       newList.removeAt(i);
                                                  //     }
                                                  //   }
                                                  //   if (response.answers.number != null) {
                                                  //     if (response.answers.number.toString().isEmpty) {
                                                  //       newList.removeAt(i);
                                                  //     }
                                                  //   }
                                                  //   if (response.answers.shortAnswer != null) {
                                                  //     if (response.answers.shortAnswer!.isEmpty) {
                                                  //       newList.removeAt(i);
                                                  //     }
                                                  //   }
                                                  //   if (response.answers.multipleChoices != null) {
                                                  //     if (response.answers.multipleChoices!.isEmpty) {
                                                  //       newList.removeAt(i);
                                                  //     }
                                                  //   }
                                                  // }
                                                  // Future.delayed(Duration(seconds: 1),()=>_responseInputListCubit.updateValue(newList));
                                                },
                                              ),
                                            if ((_isLoadingCubit.state ?? false) == true)
                                              BlocBuilder<VariableCubit, dynamic>(
                                                bloc: _isLoadingCubit,
                                                builder: (context, data) => CustomCircularProgressIndicatorWidget(
                                                  backgroundColor: Theme.of(context).focusColor,
                                                  padding: const EdgeInsets.all(14.0),
                                                  alignment: Alignment.center,
                                                  color: kAppColor,
                                                ),
                                              ),
                                          ],
                                        ),
                                      ),
                                    ),
                        );
                      },
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
}
