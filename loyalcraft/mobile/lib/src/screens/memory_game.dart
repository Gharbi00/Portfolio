import 'dart:async';
import 'dart:math';

import 'package:flip_card/flip_card.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-quest-activity.graphql.dart';
import 'package:flutter_loyalcraft_gql/schema.graphql.dart';
import 'package:loyalcraft/localizations_delegate/app_localizations.dart';
import 'package:loyalcraft/src/bloc/variable.dart';
import 'package:loyalcraft/src/data/consts.dart';
import 'package:loyalcraft/src/data/flutter_messenger.dart';
import 'package:loyalcraft/src/utils/image_cache_manager/shared_image_provider.dart';

// ignore: must_be_immutable
class MemoryGameWidget extends StatefulWidget {
  MemoryGameWidget({
    required this.shuffledImages,
    required this.questActivity,
    required this.totalSeconds,
    required this.onSuccess,
    required this.game,
    Key? key,
  }) : super(key: key);

  Query$getQuestActivitiesByQuest$getQuestActivitiesByQuest$activity$action$definition$game? game;
  Query$getQuestActivitiesByQuest$getQuestActivitiesByQuest questActivity;
  ValueChanged<Input$QuestActionGameInput> onSuccess;
  List<String> shuffledImages;
  int totalSeconds;
  @override
  State<MemoryGameWidget> createState() => _MemoryGameWidgetState();
}

class _MemoryGameWidgetState extends State<MemoryGameWidget> {
  late VariableCubit<List<ImagePiece>> _imagePieceListCubit;
  late VariableCubit<ImagePiece?> _previousImagePieceCubit;
  late VariableCubit<int> _numberOfClicksCubit;
  late VariableCubit<int> _numberOfTapsCubit;
  late VariableCubit<bool> _canFlipCubit;
  late VariableCubit<Timer?> _timerCubit;
  late VariableCubit<int> _secondsCubit;
  late VariableCubit<bool> _startCubit;

  void startTimer() {
    _secondsCubit.updateValue(0);
    _startCubit.updateValue(true);
    var timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_secondsCubit.state! < widget.totalSeconds) {
        _secondsCubit.updateValue(_secondsCubit.state! + 1);
      } else {
        FlutterMessenger.showSnackbar(context: context, string: translate(context, 'gameCountdownOver'));
        _timerCubit.state?.cancel();
        _timerCubit.updateValue(null);
        _secondsCubit.updateValue(widget.totalSeconds);
        _numberOfClicksCubit.updateValue(0);
        _numberOfTapsCubit.updateValue(0);
        _startCubit.updateValue(false);
        _previousImagePieceCubit.updateValue(null);
        _canFlipCubit.updateValue(true);
        _imagePieceListCubit.updateValue([]);
        _initializeGameData();
      }
    });
    _timerCubit.updateValue(timer);
  }

  void _initializeGameData() {
    var newList = [...widget.shuffledImages, ...widget.shuffledImages]
      ..sort((a, b) => a.length.compareTo(b.length))
      ..shuffle(Random(Random().nextInt(5 + 1)))
      ..shuffle(Random(Random().nextInt(10 + 1)));
    _imagePieceListCubit.updateValue(
      newList
          .asMap()
          .entries
          .map(
            (e) => ImagePiece(
              flipCardKey: GlobalKey<FlipCardState>(),
              isFliped: false,
              isDone: false,
              index: e.key,
              url: e.value,
            ),
          )
          .toList(),
    );
    Future.delayed(const Duration(seconds: 1), startTimer);
    HapticFeedback.heavyImpact();
  }

  Widget getItem(int index) => Container(
        margin: const EdgeInsets.all(4.0),
        child: SharedImageProviderWidget(
          imageUrl: _imagePieceListCubit.state![index].url,
          borderRadius: BorderRadius.circular(16.0),
          height: double.infinity,
          width: double.infinity,
          fit: BoxFit.cover,
        ),
      );

  Widget _getFront() => Container(
        margin: const EdgeInsets.all(4.0),
        decoration: BoxDecoration(
          color: Theme.of(context).focusColor.withOpacity(1.0),
          borderRadius: BorderRadius.circular(8.0),
        ),
        child: Icon(
          CupertinoIcons.question,
          color: Theme.of(context).colorScheme.secondary,
          size: 26.0,
        ),
      );

  String _getTimerText({required int currentSeconds}) {
    var minutes = currentSeconds ~/ 60;
    var seconds = currentSeconds % 60;
    return '${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}';
  }

  void _initState() {
    _imagePieceListCubit = VariableCubit(value: []);
    _numberOfClicksCubit = VariableCubit(value: 0);
    _numberOfTapsCubit = VariableCubit(value: 0);
    _previousImagePieceCubit = VariableCubit();
    _canFlipCubit = VariableCubit(value: true);
    _startCubit = VariableCubit(value: false);
    _secondsCubit = VariableCubit(value: 0);
    _timerCubit = VariableCubit();

    WidgetsBinding.instance.addPostFrameCallback((_) {
      Future.delayed(const Duration(seconds: 1), _initializeGameData);
    });
  }

  @override
  void dispose() {
    super.dispose();
    _numberOfTapsCubit.close();
    _numberOfClicksCubit.close();
    _timerCubit.state?.cancel();
    _previousImagePieceCubit.close();
    _imagePieceListCubit.close();
    _startCubit.close();
    _canFlipCubit.close();
    _secondsCubit.close();
    _timerCubit.close();
  }

  @override
  void initState() {
    super.initState();
    _initState();
  }

  @override
  Widget build(BuildContext context) => MultiBlocProvider(
        providers: [
          BlocProvider(create: (context) => _previousImagePieceCubit),
          BlocProvider(create: (context) => _numberOfClicksCubit),
          BlocProvider(create: (context) => _imagePieceListCubit),
          BlocProvider(create: (context) => _numberOfTapsCubit),
          BlocProvider(create: (context) => _secondsCubit),
          BlocProvider(create: (context) => _canFlipCubit),
          BlocProvider(create: (context) => _timerCubit),
          BlocProvider(create: (context) => _startCubit),
        ],
        child: BlocBuilder<VariableCubit, dynamic>(
          bloc: _startCubit,
          builder: (context, start) => BlocBuilder<VariableCubit, dynamic>(
            bloc: _previousImagePieceCubit,
            builder: (context, previousImagePiece) => BlocBuilder<VariableCubit, dynamic>(
              bloc: _numberOfTapsCubit,
              builder: (context, numberOfTaps) => BlocBuilder<VariableCubit, dynamic>(
                bloc: _numberOfClicksCubit,
                builder: (context, numberOfClicks) => BlocBuilder<VariableCubit, dynamic>(
                  bloc: _imagePieceListCubit,
                  builder: (context, imagePieceList) => BlocBuilder<VariableCubit, dynamic>(
                    bloc: _timerCubit,
                    builder: (context, timer) => BlocBuilder<VariableCubit, dynamic>(
                      bloc: _secondsCubit,
                      builder: (context, seconds) => imagePieceList.isEmpty
                          ? const SizedBox()
                          : Container(
                              padding: const EdgeInsets.all(16.0),
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(8.0),
                                color: Theme.of(context).focusColor,
                              ),
                              child: Column(
                                mainAxisSize: MainAxisSize.min,
                                children: <Widget>[
                                  Center(
                                    child: Wrap(
                                      crossAxisAlignment: WrapCrossAlignment.center,
                                      runAlignment: WrapAlignment.center,
                                      alignment: WrapAlignment.center,
                                      runSpacing: 8.0,
                                      spacing: 8.0,
                                      children: [
                                        Text(
                                          '$numberOfClicks ${translate(context, 'clicks')}',
                                          style: Theme.of(context).textTheme.bodyMedium,
                                          textAlign: TextAlign.center,
                                        ),
                                        Container(
                                          height: 16.0,
                                          width: 2.0,
                                          decoration: BoxDecoration(
                                            color: kAppColor,
                                            borderRadius: BorderRadius.circular(100.0),
                                          ),
                                        ),
                                        Text(
                                          _getTimerText(currentSeconds: seconds),
                                          style: Theme.of(context).textTheme.bodyMedium,
                                          textAlign: TextAlign.center,
                                        ),
                                      ],
                                    ),
                                  ),
                                  const SizedBox(height: 16.0),
                                  GridView.builder(
                                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 4),
                                    physics: const NeverScrollableScrollPhysics(),
                                    itemCount: imagePieceList.length,
                                    padding: EdgeInsets.zero,
                                    shrinkWrap: true,
                                    itemBuilder: (context, index) => _startCubit.state == false
                                        ? getItem(index)
                                        : FlipCard(
                                            key: _imagePieceListCubit.state![index].flipCardKey,
                                            back: getItem(index),
                                            flipOnTouch: false,
                                            onFlip: () {},
                                            onFlipDone: (value) {
                                              if (numberOfTaps == 2) {
                                                _numberOfTapsCubit.updateValue(0);
                                              }
                                            },
                                            front: GestureDetector(
                                              onTap: numberOfTaps == 2 || _imagePieceListCubit.state![index].isDone || _previousImagePieceCubit.state?.index == _imagePieceListCubit.state![index].index
                                                  ? null
                                                  : () async {
                                                      HapticFeedback.heavyImpact();
                                                      if (numberOfTaps == 0 && _previousImagePieceCubit.state == null) {
                                                        _previousImagePieceCubit.updateValue(_imagePieceListCubit.state![index]);
                                                        _numberOfTapsCubit.updateValue(1);
                                                        await _imagePieceListCubit.state![index].flipCardKey.currentState?.toggleCard();
                                                        _numberOfClicksCubit.updateValue(numberOfClicks + 1);
                                                      }
                                                      if (numberOfTaps == 1) {
                                                        final currentIndex = index;
                                                        final previousIndex = previousImagePiece!.index;
                                                        await _imagePieceListCubit.state![currentIndex].flipCardKey.currentState?.toggleCard();

                                                        // Check if this card matches the previous card
                                                        if (_imagePieceListCubit.state![currentIndex].url == _imagePieceListCubit.state![previousIndex].url) {
                                                          // Cards match
                                                          var newList = _imagePieceListCubit.state ?? [];
                                                          newList[currentIndex].isDone = true;
                                                          newList[previousIndex].isDone = true;
                                                          _imagePieceListCubit.updateValue(newList);
                                                        } else {
                                                          var newList = _imagePieceListCubit.state ?? [];
                                                          newList[currentIndex].isDone = false;
                                                          newList[previousIndex].isDone = false;
                                                          _imagePieceListCubit.updateValue(newList);
                                                          // Use a short delay to allow the flip animation to complete
                                                          Future.delayed(const Duration(seconds: 1), () async {
                                                            // Cards don't match
                                                            await _imagePieceListCubit.state![previousIndex].flipCardKey.currentState?.toggleCard();
                                                            await _imagePieceListCubit.state![currentIndex].flipCardKey.currentState?.toggleCard();
                                                          });
                                                        }
                                                        // Reset click count
                                                        _numberOfTapsCubit.updateValue(2);
                                                        _previousImagePieceCubit.updateValue(null);
                                                        _numberOfClicksCubit.updateValue(numberOfClicks + 1);
                                                        if ((_imagePieceListCubit.state ?? []).where((e) => e.isDone == false).isEmpty) {
                                                          widget.onSuccess(
                                                            Input$QuestActionGameInput(
                                                              timer: widget.game?.memory?.timer ?? Enum$GameTimerEnum.MINUTE,
                                                              movesCount: _numberOfClicksCubit.state!,
                                                              activity: widget.questActivity.id,
                                                              duration: _secondsCubit.state!,
                                                            ),
                                                          );
                                                        }
                                                      }
                                                    },
                                              child: _getFront(),
                                            ),
                                          ),
                                  ),
                                ],
                              ),
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

class ImagePiece {
  ImagePiece({
    required this.flipCardKey,
    required this.isFliped,
    required this.isDone,
    required this.index,
    required this.url,
  });

  GlobalKey<FlipCardState> flipCardKey;
  bool isFliped;
  bool isDone;
  String url;
  int index;

  ImagePiece copyWith({
    GlobalKey<FlipCardState>? flipCardKey,
    bool? isFliped,
    bool? isDone,
    String? url,
    int? index,
  }) =>
      ImagePiece(
        flipCardKey: flipCardKey ?? this.flipCardKey,
        isFliped: isFliped ?? this.isFliped,
        isDone: isDone ?? this.isDone,
        index: index ?? this.index,
        url: url ?? this.url,
      );
}
