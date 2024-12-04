import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-quest-activity.graphql.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-quest-quest.graphql.dart';
import 'package:flutter_loyalcraft_gql/schema.graphql.dart';
import 'package:loyalcraft/localizations_delegate/app_localizations.dart';
import 'package:loyalcraft/src/bloc/variable.dart';
import 'package:loyalcraft/src/data/consts.dart';

// ignore: must_be_immutable
class ActivityActionApiWidget extends StatefulWidget {
  ActivityActionApiWidget({
    Key? key,
    required this.valueChanged,
    required this.questActivity,
    required this.action,
    required this.isLoadingCubit,
    required this.api,
    required this.quest,
  }) : super(key: key);
  Query$getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated$getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated$objects quest;
  Query$getQuestActivitiesByQuest$getQuestActivitiesByQuest$activity$action$definition$api? api;
  ValueChanged<Input$QuestActionActivityApiInput> valueChanged;
  Query$getQuestActivitiesByQuest$getQuestActivitiesByQuest$activity$action action;
  Query$getQuestActivitiesByQuest$getQuestActivitiesByQuest questActivity;
  VariableCubit isLoadingCubit;
  @override
  _ActivityActionApiWidget createState() => _ActivityActionApiWidget();
}

class _ActivityActionApiWidget extends State<ActivityActionApiWidget> {
  late VariableCubit _questActionActivityApiInputCubit;

  bool _formHasError(
    Input$QuestActionActivityApiInput questActionActivityApiInput,
  ) =>
      (questActionActivityApiInput.params ?? []).where((element) => (element.value ?? '').trim().isEmpty).isNotEmpty;

  Future<void> _initState() async {
    final apiParamsList = (widget.api?.params ?? []).where((element) => (element.user?.enable ?? false) == true).toList();

    _questActionActivityApiInputCubit = VariableCubit(
      value: Input$QuestActionActivityApiInput(
        activity: widget.questActivity.id,
        params: List.generate(apiParamsList.length, (index) => Input$KeyValueInput(key: apiParamsList[index].key ?? '', value: '')),
      ),
    );
  }

  @override
  void dispose() {
    _questActionActivityApiInputCubit.close();
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
    final _apiParamsList = (widget.api?.params ?? []).where((element) => (element.user?.enable ?? false) == true).toList();

    return MultiBlocProvider(
      providers: [
        BlocProvider(create: (context) => _questActionActivityApiInputCubit),
      ],
      child: BlocBuilder<VariableCubit, dynamic>(
        bloc: _questActionActivityApiInputCubit,
        builder: (context, data) {
          var questActionActivityApiInput = Input$QuestActionActivityApiInput.fromJson(data.toJson());
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              if (_apiParamsList.isNotEmpty)
                ...List.generate(
                  _apiParamsList.length,
                  (index) {
                    final params = _apiParamsList[index];
                    return Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        if (index > 0) const SizedBox(height: 16.0),
                        Text(
                          params.user?.label ?? '',
                          style: Theme.of(context).textTheme.bodyLarge,
                        ),
                        const SizedBox(height: 16.0),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16.0),
                          decoration: BoxDecoration(
                            border: Border.all(color: Colors.grey[800]!, width: 0.4),
                            borderRadius: BorderRadius.circular(8.0),
                            color: Theme.of(context).focusColor.withOpacity(0.6),
                          ),
                          child: TextField(
                            onTapOutside: (value) => FocusManager.instance.primaryFocus?.unfocus,
                            onChanged: (value) {
                              var newList = questActionActivityApiInput.params ?? [];
                              if (newList.where((element) => element.key == params.key).isEmpty) {
                                newList.add(Input$KeyValueInput(key: params.key, value: value));
                              } else {
                                newList[index] = Input$KeyValueInput(key: params.key, value: value);
                              }
                              questActionActivityApiInput = questActionActivityApiInput.copyWith(params: newList);
                              _questActionActivityApiInputCubit.updateValue(questActionActivityApiInput);
                            },
                            cursorColor: Theme.of(context).colorScheme.secondary,
                            style: Theme.of(context).textTheme.bodyMedium,
                            keyboardType: TextInputType.text,
                            controller: TextEditingController()
                              ..text = questActionActivityApiInput.params![index].value ?? ''
                              ..selection = TextSelection.collapsed(
                                offset: (questActionActivityApiInput.params![index].value ?? '').length,
                              ),
                            scrollPadding: EdgeInsets.zero,
                            decoration: InputDecoration(
                              enabledBorder: const UnderlineInputBorder(borderSide: BorderSide.none),
                              focusedBorder: const UnderlineInputBorder(borderSide: BorderSide.none),
                              border: const UnderlineInputBorder(borderSide: BorderSide.none),
                              hintStyle: Theme.of(context).textTheme.bodyMedium,
                              hintText: '${translate(context, 'typeHere')} ; ${params.user?.label ?? ''}',
                              contentPadding: EdgeInsets.zero,
                            ),
                          ),
                        ),
                      ],
                    );
                  },
                ),
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
                    onPressed: _formHasError(questActionActivityApiInput) ? null : () => widget.valueChanged(questActionActivityApiInput),
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
        },
      ),
    );
  }
}
