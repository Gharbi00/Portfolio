import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_diktup_utilities/extensions.dart';
import 'package:flutter_loyalcraft_gql/graphql/forms-question.graphql.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-quest-quest.graphql.dart';
import 'package:flutter_loyalcraft_gql/schema.graphql.dart';
import 'package:linear_progress_bar/linear_progress_bar.dart';
import 'package:loyalcraft/localizations_delegate/app_localizations.dart';
import 'package:loyalcraft/src/bloc/variable.dart';
import 'package:loyalcraft/src/data/consts.dart';
import 'package:loyalcraft/src/modal_bottom_sheet/ios_date_picker.dart';
import 'package:loyalcraft/src/utils/image_cache_manager/shared_image_provider.dart';

// ignore: must_be_immutable
class ActivityActionFormQuestionWidget extends StatefulWidget {
  ActivityActionFormQuestionWidget({
    Key? key,
    required this.responseInputListCubit,
    required this.valueChanged,
    required this.themeData,
    required this.question,
    required this.quest,
    required this.locale,
  }) : super(key: key);

  Query$getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated$getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated$objects quest;
  Query$getQuestionsbyFormWithResponsesStatsPaginated$getQuestionsbyFormWithResponsesStatsPaginated$objects question;
  VariableCubit<List<Input$ResponseInput>> responseInputListCubit;
  ValueChanged<List<Input$ResponseInput>> valueChanged;
  ThemeData themeData;
  Locale locale;

  @override
  _ActivityActionFormQuestionWidget createState() => _ActivityActionFormQuestionWidget();
}

class _ActivityActionFormQuestionWidget extends State<ActivityActionFormQuestionWidget> {
  late VariableCubit<dynamic> _tappedDataCubit;

  Query$getQuestionsbyFormWithResponsesStatsPaginated$getQuestionsbyFormWithResponsesStatsPaginated$objects$responses? _getResponseByAnswer(String answer) {
    var exist = (widget.question.responses ?? []).where((e) => (e.answer ?? '') == answer).isNotEmpty;
    if (exist) {
      return (widget.question.responses ?? []).firstWhere((e) => (e.answer ?? '') == answer);
    }
    return null;
  }

  Color _getBorderColor({
    required String string,
    DateTime? from,
    DateTime? to,
  }) {
    var settings = widget.question.settings;

    if (widget.question.type == Enum$QuestionTypeEnum.DATETIME) {
      if (settings?.date?.interval ?? false) {
        if (from != null) {
          Colors.green[800]!;
        }
        if (from != null && to != null) {
          return to.isBefore(from) ? Colors.red[800]! : Colors.green[800]!;
        }
      } else {
        return from == null ? Colors.grey[800]! : Colors.green[800]!;
      }
    } else {
      if (_isInputValid(string: string)) {
        return Colors.green[800]!;
      } else {
        if (string.removeNull().isNotEmpty) {
          return Colors.red[800]!;
        }
      }
    }
    return Colors.grey[800]!;
  }

  bool _isInputValid({required String string}) {
    var settings = widget.question.settings;
    if (string.isNotEmpty) {
      if (widget.question.type == Enum$QuestionTypeEnum.PARAGRAPH) {
        if (settings?.paragraph?.min == null || settings?.paragraph?.max == null) {
          return true;
        } else {
          if (string.length >= settings!.paragraph!.min.toInt() && string.length <= settings.paragraph!.max.toInt()) {
            return true;
          }
        }
      }
      if (widget.question.type == Enum$QuestionTypeEnum.SHORT_ANSWER) {
        if (settings?.shortAnswer?.min == null || settings?.shortAnswer?.max == null) {
          return true;
        } else {
          if (string.length >= settings!.shortAnswer!.min.toInt() && string.length <= settings.shortAnswer!.max.toInt()) {
            return true;
          }
        }
      }
      if (widget.question.type == Enum$QuestionTypeEnum.NUMBER) {
        if (string.isInteger()) {
          if (settings?.number?.minValue == null || settings?.number?.maxValue == null) {
            return true;
          } else {
            if (string.toInteger() >= settings!.number!.minValue! && string.toInteger() <= settings.number!.maxValue!) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  dynamic _getInitialValue() => (widget.question.type == Enum$QuestionTypeEnum.MULTIPLE_CHOICE)
      ? []
      : (widget.question.type == Enum$QuestionTypeEnum.SINGLE_CHOICE)
          ? ''
          : (widget.question.type == Enum$QuestionTypeEnum.SHORT_ANSWER)
              ? ''
              : (widget.question.type == Enum$QuestionTypeEnum.PARAGRAPH)
                  ? ''
                  : (widget.question.type == Enum$QuestionTypeEnum.DATETIME)
                      ? [null, null]
                      : (widget.question.type == Enum$QuestionTypeEnum.NUMBER)
                          ? ''
                          : (widget.question.type == Enum$QuestionTypeEnum.RATING)
                              ? 0
                              : (widget.question.type == Enum$QuestionTypeEnum.SMILEY)
                                  ? null
                                  : '';

  void _initState() {
    _tappedDataCubit = VariableCubit<dynamic>(value: _getInitialValue());
  }

  // @override
  // void didUpdateWidget(covariant ActivityActionFormQuestionWidget oldWidget) {
  //   widget.responseInputListCubit = oldWidget.responseInputListCubit;
  //   super.didUpdateWidget(oldWidget);
  // }

  @override
  void dispose() {
    _tappedDataCubit.close();
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
  Widget build(BuildContext context) => BlocProvider(
        create: (context) => _tappedDataCubit,
        child: BlocBuilder<VariableCubit, dynamic>(
          bloc: _tappedDataCubit,
          builder: (context, tappedData) => Container(
            padding: const EdgeInsets.all(16.0),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(8.0),
              color: Theme.of(context).focusColor,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  widget.question.title.removeNull(),
                  style: Theme.of(context).textTheme.displayMedium!.copyWith(
                        fontSize: 20.0,
                      ),
                ),
                if (widget.question.description.removeNull().isNotEmpty)
                  Padding(
                    padding: const EdgeInsets.only(top: 16.0),
                    child: Text(
                      widget.question.description.removeNull(),
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                  ),
                const SizedBox(height: 16.0),
                (widget.question.type == Enum$QuestionTypeEnum.MULTIPLE_CHOICE)
                    ? _multipleChoice(context: context)
                    : (widget.question.type == Enum$QuestionTypeEnum.SINGLE_CHOICE)
                        ? _signleChoice(context: context, tappedData: tappedData)
                        : (widget.question.type == Enum$QuestionTypeEnum.SHORT_ANSWER)
                            ? _shortAnswer(context: context)
                            : (widget.question.type == Enum$QuestionTypeEnum.PARAGRAPH)
                                ? _paraghraph(context: context)
                                : (widget.question.type == Enum$QuestionTypeEnum.DATETIME)
                                    ? _dateTime(tappedData: tappedData)
                                    : (widget.question.type == Enum$QuestionTypeEnum.NUMBER)
                                        ? _number(context: context)
                                        : (widget.question.type == Enum$QuestionTypeEnum.RATING)
                                            ? _rating(context: context)
                                            : (widget.question.type == Enum$QuestionTypeEnum.SMILEY)
                                                ? _smiley(context: context)
                                                : const SizedBox(),
              ],
            ),
          ),
        ),
      );

  Widget _multipleChoice({
    required BuildContext context,
  }) =>
      Wrap(
        runSpacing: 8.0,
        spacing: 8.0,
        children: List.generate((widget.question.choices ?? []).length, (index) {
          final choice = widget.question.choices![index];
          return Row(
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
                    HapticFeedback.heavyImpact();
                    var exist = List.of(_tappedDataCubit.state).where((e) => e == choice.item).isNotEmpty;
                    if (exist) {
                      var newList = List.of(_tappedDataCubit.state)..remove(choice.item);
                      _tappedDataCubit.updateValue(newList);
                    } else {
                      var newList = List.of(_tappedDataCubit.state)..add(choice.item);
                      _tappedDataCubit.updateValue(newList);
                    }
                    var newList = widget.responseInputListCubit.state!;
                    var responseInput = Input$ResponseInput(
                      target: Input$TargetInput(pos: widget.quest.target.pos?.id ?? ''),
                      answers: Input$ResponseAnswerInput(
                        multipleChoices: (_tappedDataCubit.state as List<dynamic>).map((e) => e.toString()).toList(),
                      ),
                      question: widget.question.id,
                    );
                    if (newList.where((element) => element.question == widget.question.id).isEmpty) {
                      widget.valueChanged([
                        responseInput,
                        ...newList,
                      ]);
                    } else {
                      var index = newList.indexWhere((element) => element.question == widget.question.id);
                      newList[index] = responseInput;
                      widget.valueChanged(newList);
                    }
                  },
                  value: _tappedDataCubit.state.contains(choice.item),
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
              Expanded(
                child: Text(
                  choice.item,
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
              ),
            ],
          );
        }),
      );

  Widget _signleChoice({
    required BuildContext context,
    required tappedData,
  }) =>
      Wrap(
        runSpacing: 8.0,
        spacing: 8.0,
        children: List.generate((widget.question.choices ?? []).length, (index) {
          final choice = widget.question.choices![index];
          final responseByAnswer = _getResponseByAnswer(choice.item);
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                children: [
                  SizedBox(
                    height: 30.0,
                    width: 30.0,
                    child: Radio(
                      groupValue: widget.question.choices!.indexOf(choice.copyWith(item: tappedData.toString())),
                      fillColor: WidgetStateProperty.resolveWith<Color>((states) => kAppColor),
                      activeColor: kAppColor,
                      value: index,
                      onChanged: (value) {
                        HapticFeedback.heavyImpact();
                        _tappedDataCubit.updateValue(choice.item);
                        var newList = widget.responseInputListCubit.state!;
                        var responseInput = Input$ResponseInput(
                          target: Input$TargetInput(pos: widget.quest.target.pos?.id ?? ''),
                          answers: Input$ResponseAnswerInput(
                            singleChoice: choice.item,
                          ),
                          question: widget.question.id,
                        );
                        if (newList.where((element) => element.question == widget.question.id).isEmpty) {
                          widget.valueChanged([
                            responseInput,
                            ...newList,
                          ]);
                        } else {
                          var index = newList.indexWhere((element) => element.question == widget.question.id);
                          newList[index] = responseInput;
                          widget.valueChanged(newList);
                        }
                      },
                    ),
                  ),
                  const SizedBox(height: 4.0),
                  Expanded(
                    child: Text(
                      choice.item,
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                  ),
                  if (responseByAnswer != null &&
                      (responseByAnswer.users ?? []).isNotEmpty &&
                      (widget.question.settings?.singleChoice?.poll ?? false) == true &&
                      _tappedDataCubit.state.toString().isNotEmpty)
                    Padding(
                      padding: const EdgeInsets.only(left: 4.0),
                      child: Wrap(
                        crossAxisAlignment: WrapCrossAlignment.center,
                        runAlignment: WrapAlignment.end,
                        alignment: WrapAlignment.end,
                        runSpacing: 4.0,
                        spacing: 4.0,
                        children: List.generate(
                          (responseByAnswer.users ?? []).length > 3 ? 3 : (responseByAnswer.users ?? []).length,
                          (index) {
                            final user = responseByAnswer.users![index];
                            return ((user.picture?.baseUrl ?? '').isEmpty || (user.picture?.path ?? '').isEmpty)
                                ? SharedImageProviderWidget(
                                    imageUrl: kUserAvatar,
                                    fit: BoxFit.cover,
                                    height: 30.0,
                                    color: Theme.of(context).colorScheme.secondary,
                                    width: 30.0,
                                  )
                                : SharedImageProviderWidget(
                                    imageUrl: '${user.picture!.baseUrl}/${user.picture!.path}',
                                    backgroundColor: Theme.of(context).focusColor,
                                    borderRadius: BorderRadius.circular(100.0),
                                    fit: BoxFit.cover,
                                    height: 30.0,
                                    width: 30.0,
                                  );
                          },
                        ),
                      ),
                    ),
                  if ((widget.question.settings?.singleChoice?.poll ?? false) == true && _tappedDataCubit.state.toString().isNotEmpty)
                    Padding(
                      padding: const EdgeInsets.only(left: 4.0),
                      child: Text(
                        '${responseByAnswer?.count ?? 0}',
                        style: Theme.of(context).textTheme.bodyLarge,
                      ),
                    ),
                ],
              ),
              if ((widget.question.settings?.singleChoice?.poll ?? false) == true && _tappedDataCubit.state.toString().isNotEmpty)
                Padding(
                  padding: const EdgeInsets.only(top: 4.0),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(100.0),
                    child: LinearProgressBar(
                      maxSteps: responseByAnswer?.total ?? 100,
                      progressType: LinearProgressBar.progressTypeLinear,
                      backgroundColor: kAppColor.withOpacity(0.1),
                      progressColor: kAppColor,
                      minHeight: 8.0,
                      currentStep: responseByAnswer?.count ?? 0,
                    ),
                  ),
                ),
            ],
          );
        }),
      );

  Widget _shortAnswer({
    required BuildContext context,
  }) =>
      Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16.0),
            decoration: BoxDecoration(
              border: Border.all(
                color: _getBorderColor(string: _tappedDataCubit.state.toString().trim()),
              ),
              borderRadius: BorderRadius.circular(8.0),
              color: Theme.of(context).focusColor.withOpacity(0.6),
            ),
            child: TextField(
              onTapOutside: (value) => FocusManager.instance.primaryFocus?.unfocus,
              cursorColor: Theme.of(context).colorScheme.secondary,
              controller: TextEditingController()
                ..text = _tappedDataCubit.state.toString()
                ..selection = TextSelection.collapsed(offset: _tappedDataCubit.state.toString().length),
              onChanged: (value) {
                _tappedDataCubit.updateValue(value);
                if (value.trim().isEmpty) {
                  var newList = widget.responseInputListCubit.state!;
                  if (newList.where((element) => element.question == widget.question.id).isEmpty) {
                  } else {
                    var index = newList.indexWhere((element) => element.question == widget.question.id);
                    newList.removeAt(index);
                    widget.valueChanged(newList);
                  }
                }
                if (_isInputValid(string: value.trim())) {
                  var newList = widget.responseInputListCubit.state!;
                  var responseInput = Input$ResponseInput(
                    target: Input$TargetInput(pos: widget.quest.target.pos?.id ?? ''),
                    answers: Input$ResponseAnswerInput(shortAnswer: value),
                    question: widget.question.id,
                  );
                  if (newList.where((element) => element.question == widget.question.id).isEmpty) {
                    widget.valueChanged([
                      responseInput,
                      ...newList,
                    ]);
                  } else {
                    var index = newList.indexWhere((element) => element.question == widget.question.id);
                    newList[index] = responseInput;
                    widget.valueChanged(newList);
                  }
                }
              },
              maxLength: (widget.question.settings?.shortAnswer?.max ?? 20).toInt(),
              style: Theme.of(context).textTheme.bodyMedium,
              buildCounter: (context, {required currentLength, required isFocused, required maxLength}) => const SizedBox(),
              keyboardType: TextInputType.text,
              decoration: InputDecoration(
                enabledBorder: const UnderlineInputBorder(borderSide: BorderSide.none),
                focusedBorder: const UnderlineInputBorder(borderSide: BorderSide.none),
                border: const UnderlineInputBorder(borderSide: BorderSide.none),
                hintStyle: Theme.of(context).textTheme.bodyMedium,
                hintText: '',
              ),
            ),
          ),
          if (widget.question.settings?.shortAnswer?.max != null && _tappedDataCubit.state.toString().isNotEmpty)
            Padding(
              padding: const EdgeInsets.only(top: 8.0),
              child: Text(
                '${translate(context, "maximumLength")} • ${widget.question.settings!.shortAnswer!.max.toInt()} ${translate(context, "characters")}',
                style: Theme.of(context).textTheme.bodySmall,
              ),
            ),
          if (widget.question.settings?.shortAnswer?.min != null && _tappedDataCubit.state.toString().isNotEmpty)
            Padding(
              padding: const EdgeInsets.only(top: 8.0),
              child: Text(
                '${translate(context, "minimumLength")} • ${widget.question.settings!.shortAnswer!.min.toInt()} ${translate(context, "characters")}',
                style: Theme.of(context).textTheme.bodySmall,
              ),
            ),
        ],
      );

  Widget _paraghraph({required BuildContext context}) => Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16.0),
            decoration: BoxDecoration(
              border: Border.all(
                color: _getBorderColor(string: _tappedDataCubit.state.toString().trim()),
              ),
              borderRadius: BorderRadius.circular(8.0),
              color: Theme.of(context).focusColor.withOpacity(0.6),
            ),
            child: TextField(
              onTapOutside: (value) => FocusManager.instance.primaryFocus?.unfocus,
              controller: TextEditingController()
                ..text = _tappedDataCubit.state
                ..selection = TextSelection.collapsed(offset: _tappedDataCubit.state.length),
              onChanged: (value) {
                _tappedDataCubit.updateValue(value);
                var newList = widget.responseInputListCubit.state!;
                if (value.trim().isEmpty) {
                  if (newList.where((element) => element.question == widget.question.id).isEmpty) {
                  } else {
                    var index = newList.indexWhere((element) => element.question == widget.question.id);
                    newList.removeAt(index);
                    widget.valueChanged(newList);
                  }
                }
                if (_isInputValid(string: value.trim())) {
                  var responseInput = Input$ResponseInput(
                    target: Input$TargetInput(pos: widget.quest.target.pos?.id ?? ''),
                    answers: Input$ResponseAnswerInput(paragraph: value),
                    question: widget.question.id,
                  );
                  if (newList.where((element) => element.question == widget.question.id).isEmpty) {
                    widget.valueChanged([
                      responseInput,
                      ...newList,
                    ]);
                  } else {
                    var index = newList.indexWhere((element) => element.question == widget.question.id);
                    newList[index] = responseInput;
                    widget.valueChanged(newList);
                  }
                }
              },
              maxLength: (widget.question.settings?.paragraph?.max ?? 20).toInt(),
              cursorColor: Theme.of(context).colorScheme.secondary,
              style: Theme.of(context).textTheme.bodyMedium,
              buildCounter: (context, {required currentLength, required isFocused, required maxLength}) => const SizedBox(),
              keyboardType: TextInputType.multiline,
              maxLines: null,
              minLines: 4,
              decoration: InputDecoration(
                hintStyle: Theme.of(context).textTheme.bodyMedium,
                enabledBorder: const UnderlineInputBorder(borderSide: BorderSide.none),
                focusedBorder: const UnderlineInputBorder(borderSide: BorderSide.none),
                border: const UnderlineInputBorder(borderSide: BorderSide.none),
                hintText: '',
              ),
            ),
          ),
          if (widget.question.settings?.paragraph?.max != null && _tappedDataCubit.state.toString().isNotEmpty)
            Padding(
              padding: const EdgeInsets.only(top: 8.0),
              child: Text(
                '${translate(context, "maximumLength")} • ${widget.question.settings!.paragraph!.max.toInt()} ${translate(context, "characters")}',
                style: Theme.of(context).textTheme.bodySmall,
              ),
            ),
          if (widget.question.settings?.paragraph?.min != null && _tappedDataCubit.state.toString().isNotEmpty)
            Padding(
              padding: const EdgeInsets.only(top: 8.0),
              child: Text(
                '${translate(context, "minimumLength")} • ${widget.question.settings!.paragraph!.min.toInt()} ${translate(context, "characters")}',
                style: Theme.of(context).textTheme.bodySmall,
              ),
            ),
        ],
      );

  Widget _dateTime({tappedData}) => (widget.question.settings?.date?.interval ?? false)
      ? Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            GestureDetector(
              onTap: () => showIosDatePickerSheet(
                refreshTheView: (value) => _tappedDataCubit.updateValue([value, tappedData.last]),
                initialDateTime: tappedData.first,
                themeData: widget.themeData,
                locale: widget.locale,
                context: context,
              ),
              child: Container(
                decoration: BoxDecoration(
                  border: Border.all(
                    color: _getBorderColor(string: '', from: tappedData.first, to: tappedData.last),
                  ),
                  borderRadius: BorderRadius.circular(8.0),
                  color: Colors.transparent,
                ),
                padding: const EdgeInsets.symmetric(horizontal: 16.0),
                height: 46.0,
                child: Row(
                  children: [
                    Expanded(
                      child: Text(
                        tappedData.first == null ? translate(context, 'selectDate') : (tappedData.first as DateTime).toYMEd(widget.locale),
                        style: Theme.of(context).textTheme.bodyMedium,
                      ),
                    ),
                    const SizedBox(width: 8.0),
                    Icon(
                      CupertinoIcons.chevron_down,
                      color: Theme.of(context).colorScheme.secondary,
                      size: 16.0,
                    ),
                  ],
                ),
              ),
            ),
            if (tappedData.first is DateTime && tappedData.first != null)
              GestureDetector(
                onTap: () => showIosDatePickerSheet(
                  context: context,
                  themeData: widget.themeData,
                  locale: widget.locale,
                  initialDateTime: tappedData.last,
                  refreshTheView: (value) {
                    _tappedDataCubit.updateValue([tappedData.first, value]);
                    var newList = widget.responseInputListCubit.state!;
                    var responseInput = Input$ResponseInput(
                      question: widget.question.id,
                      target: Input$TargetInput(pos: widget.quest.target.pos?.id ?? ''),
                      answers: Input$ResponseAnswerInput(
                        date: Input$TimeFromToInput(
                          from: tappedData.first,
                          to: value,
                        ),
                      ),
                    );
                    if (newList.where((element) => element.question == widget.question.id).isEmpty) {
                      widget.valueChanged([
                        responseInput,
                        ...newList,
                      ]);
                    } else {
                      var index = newList.indexWhere((element) => element.question == widget.question.id);
                      newList[index] = responseInput;
                      widget.valueChanged(newList);
                    }
                  },
                ),
                child: Container(
                  margin: const EdgeInsets.only(top: 16.0),
                  decoration: BoxDecoration(
                    border: Border.all(
                      color: _getBorderColor(string: '', from: tappedData.first, to: tappedData.last),
                    ),
                    borderRadius: BorderRadius.circular(8.0),
                    color: Colors.transparent,
                  ),
                  padding: const EdgeInsets.symmetric(horizontal: 16.0),
                  height: 46.0,
                  child: Row(
                    children: [
                      Expanded(
                        child: Text(
                          tappedData.last == null ? translate(context, 'selectDate') : (tappedData.last as DateTime).toYMEd(widget.locale),
                          style: Theme.of(context).textTheme.bodyMedium,
                        ),
                      ),
                      const SizedBox(width: 8.0),
                      Icon(
                        CupertinoIcons.chevron_down,
                        color: Theme.of(context).colorScheme.secondary,
                        size: 16.0,
                      ),
                    ],
                  ),
                ),
              ),
          ],
        )
      : GestureDetector(
          onTap: () {
            showIosDatePickerSheet(
              themeData: widget.themeData,
              context: context,
              locale: widget.locale,
              initialDateTime: tappedData.first,
              refreshTheView: (value) {
                _tappedDataCubit.updateValue([value, null]);
                var newList = widget.responseInputListCubit.state!;
                var responseInput = Input$ResponseInput(
                  target: Input$TargetInput(
                    pos: widget.quest.target.pos?.id ?? '',
                  ),
                  answers: Input$ResponseAnswerInput(
                    date: Input$TimeFromToInput(
                      from: value,
                    ),
                  ),
                  question: widget.question.id,
                );
                if (newList.where((element) => element.question == widget.question.id).isEmpty) {
                  widget.valueChanged([
                    responseInput,
                    ...newList,
                  ]);
                } else {
                  var index = newList.indexWhere((element) => element.question == widget.question.id);
                  newList[index] = responseInput;
                  widget.valueChanged(newList);
                }
              },
            );
          },
          child: Container(
            decoration: BoxDecoration(
              border: Border.all(
                color: _getBorderColor(string: '', from: tappedData.first),
              ),
              borderRadius: BorderRadius.circular(8.0),
              color: Colors.transparent,
            ),
            padding: const EdgeInsets.symmetric(horizontal: 16.0),
            height: 46.0,
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    tappedData.first == null ? translate(context, 'selectDate') : (tappedData.first as DateTime).toYMEd(widget.locale),
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                ),
                const SizedBox(width: 8.0),
                Icon(
                  CupertinoIcons.chevron_down,
                  color: Theme.of(context).colorScheme.secondary,
                  size: 16.0,
                ),
              ],
            ),
          ),
        );

  Widget _number({required BuildContext context}) => Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16.0),
            decoration: BoxDecoration(
              border: Border.all(
                color: _getBorderColor(string: _tappedDataCubit.state.toString()),
              ),
              borderRadius: BorderRadius.circular(8.0),
              color: Theme.of(context).focusColor.withOpacity(0.6),
            ),
            child: TextField(
              onTapOutside: (value) => FocusManager.instance.primaryFocus?.unfocus,
              cursorColor: Theme.of(context).colorScheme.secondary,
              style: Theme.of(context).textTheme.bodyMedium,
              keyboardType: TextInputType.number,
              controller: TextEditingController()
                ..text = _tappedDataCubit.state.toString()
                ..selection = TextSelection.collapsed(offset: _tappedDataCubit.state.toString().length),
              onChanged: (value) {
                _tappedDataCubit.updateValue(value);
                var newList = widget.responseInputListCubit.state!;
                if (value.trim().isEmpty) {
                  if (newList.where((element) => element.question == widget.question.id).isEmpty) {
                  } else {
                    var index = newList.indexWhere((element) => element.question == widget.question.id);
                    newList.removeAt(index);
                    widget.valueChanged(newList);
                  }
                }
                if (_isInputValid(string: value)) {
                  var responseInput = Input$ResponseInput(
                    target: Input$TargetInput(pos: widget.quest.target.pos?.id ?? ''),
                    answers: Input$ResponseAnswerInput(number: value.toInteger()),
                    question: widget.question.id,
                  );
                  if (newList.where((element) => element.question == widget.question.id).isEmpty) {
                    widget.valueChanged([
                      responseInput,
                      ...newList,
                    ]);
                  } else {
                    var index = newList.indexWhere((element) => element.question == widget.question.id);
                    newList[index] = responseInput;
                    widget.valueChanged(newList);
                  }
                }
              },
              decoration: InputDecoration(
                enabledBorder: const UnderlineInputBorder(borderSide: BorderSide.none),
                focusedBorder: const UnderlineInputBorder(borderSide: BorderSide.none),
                border: const UnderlineInputBorder(borderSide: BorderSide.none),
                hintStyle: Theme.of(context).textTheme.bodyMedium,
                hintText: '',
              ),
            ),
          ),
          if (widget.question.settings?.number?.maxValue != null && _tappedDataCubit.state.toString().isNotEmpty)
            Padding(
              padding: const EdgeInsets.only(top: 8.0),
              child: Text(
                '${translate(context, "maximumValue")} • ${widget.question.settings!.number!.maxValue}',
                style: Theme.of(context).textTheme.bodySmall,
              ),
            ),
          if (widget.question.settings?.number?.minValue != null && _tappedDataCubit.state.toString().isNotEmpty)
            Padding(
              padding: const EdgeInsets.only(top: 8.0),
              child: Text(
                '${translate(context, "minimumValue")} • ${widget.question.settings!.number!.minValue}',
                style: Theme.of(context).textTheme.bodySmall,
              ),
            ),
        ],
      );

  Widget _rating({required BuildContext context}) => Wrap(
        runSpacing: 8.0,
        spacing: 8.0,
        children: List.generate(
          (widget.question.settings?.rating?.levels ?? [5]).isEmpty ? 5 : widget.question.settings!.rating!.levels.first.toString().toInteger(),
          (index) => GestureDetector(
            onTap: () {
              HapticFeedback.heavyImpact();
              _tappedDataCubit.updateValue(index + 1);

              var newList = widget.responseInputListCubit.state!;
              var responseInput = Input$ResponseInput(
                target: Input$TargetInput(pos: widget.quest.target.pos?.id ?? ''),
                answers: Input$ResponseAnswerInput(rating: index + 1),
                question: widget.question.id,
              );
              if (newList.where((element) => element.question == widget.question.id).isEmpty) {
                widget.valueChanged([
                  responseInput,
                  ...newList,
                ]);
              } else {
                var index = newList.indexWhere((element) => element.question == widget.question.id);
                newList[index] = responseInput;
                widget.valueChanged(newList);
              }
            },
            child: Icon(
              CupertinoIcons.star_fill,
              color: index + 1 > _tappedDataCubit.state.toString().toInteger() ? Colors.grey[800] : Colors.amber[800],
              size: 50.0,
            ),
          ),
        ),
      );

  Widget _smiley({required BuildContext context}) => Wrap(
        runSpacing: 8.0,
        spacing: 8.0,
        children: List.generate(
          (widget.question.settings?.smiley?.levels ?? []).length,
          (index) {
            var level = widget.question.settings!.smiley!.levels![index];
            return level.icon.removeNull().isNotEmpty
                ? GestureDetector(
                    onTap: () {
                      HapticFeedback.heavyImpact();
                      _tappedDataCubit.updateValue(level.icon);
                      var newList = widget.responseInputListCubit.state;
                      var responseInput = Input$ResponseInput(
                        target: Input$TargetInput(pos: widget.quest.target.pos?.id ?? ''),
                        answers: Input$ResponseAnswerInput(
                          smiley: Input$ResponseAnswerSmileyObjInput(
                            icon: level.icon.removeNull(),
                          ),
                        ),
                        question: widget.question.id,
                      );
                      if (newList!.where((element) => element.question == widget.question.id).isEmpty) {
                        widget.valueChanged([
                          responseInput,
                          ...newList,
                        ]);
                      } else {
                        var index = newList.indexWhere((element) => element.question == widget.question.id);
                        newList[index] = responseInput;
                        widget.valueChanged(newList);
                      }
                    },
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          level.icon.removeNull(),
                          textAlign: TextAlign.center,
                          style: Theme.of(context).textTheme.displayLarge!.copyWith(
                                fontSize: _tappedDataCubit.state == level.icon ? 60.0 : 40.0,
                              ),
                        ),
                        const SizedBox(height: 8.0),
                        Container(
                          width: 32.0,
                          height: 4.0,
                          decoration: BoxDecoration(
                            color: _tappedDataCubit.state == level.icon ? kAppColor : Colors.grey,
                            borderRadius: const BorderRadius.only(
                              topRight: Radius.circular(4.0),
                              topLeft: Radius.circular(4.0),
                            ),
                          ),
                        ),
                      ],
                    ),
                  )
                : (level.picture?.baseUrl ?? '').isNotEmpty && (level.picture?.path ?? '').isNotEmpty
                    ? GestureDetector(
                        onTap: () {
                          _tappedDataCubit.updateValue(
                            Input$PictureInput(
                              baseUrl: level.picture!.baseUrl!,
                              path: level.picture!.path!,
                            ),
                          );
                          var newList = widget.responseInputListCubit.state!;
                          var responseInput = Input$ResponseInput(
                            target: Input$TargetInput(pos: widget.quest.target.pos?.id ?? ''),
                            question: widget.question.id,
                            answers: Input$ResponseAnswerInput(
                              smiley: Input$ResponseAnswerSmileyObjInput(
                                picture: Input$PictureInput(
                                  baseUrl: level.picture!.baseUrl!,
                                  path: level.picture!.path!,
                                ),
                              ),
                            ),
                          );
                          if (newList.where((element) => element.question == widget.question.id).isEmpty) {
                            widget.valueChanged([
                              responseInput,
                              ...newList,
                            ]);
                          } else {
                            var index = newList.indexWhere((element) => element.question == widget.question.id);
                            newList[index] = responseInput;
                            widget.valueChanged(newList);
                          }
                        },
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            SharedImageProviderWidget(
                              enableOnLongPress: true,
                              imageUrl: '${level.picture!.baseUrl}/${level.picture!.path}',
                              backgroundColor: Theme.of(context).focusColor,
                              borderRadius: BorderRadius.circular(16.0),
                              fit: BoxFit.cover,
                              height: _tappedDataCubit.state ==
                                      Input$PictureInput(
                                        baseUrl: level.picture!.baseUrl!,
                                        path: level.picture!.path!,
                                      )
                                  ? 80.0
                                  : 60.0,
                              width: _tappedDataCubit.state ==
                                      Input$PictureInput(
                                        baseUrl: level.picture!.baseUrl!,
                                        path: level.picture!.path!,
                                      )
                                  ? 80.0
                                  : 60.0,
                            ),
                            const SizedBox(height: 8.0),
                            Container(
                              width: 32.0,
                              height: 4.0,
                              decoration: BoxDecoration(
                                color: _tappedDataCubit.state ==
                                        Input$PictureInput(
                                          baseUrl: level.picture!.baseUrl!,
                                          path: level.picture!.path!,
                                        )
                                    ? kAppColor
                                    : Colors.grey,
                                borderRadius: const BorderRadius.only(
                                  topRight: Radius.circular(4.0),
                                  topLeft: Radius.circular(4.0),
                                ),
                              ),
                            ),
                          ],
                        ),
                      )
                    : const SizedBox();
          },
        ),
      );
}
