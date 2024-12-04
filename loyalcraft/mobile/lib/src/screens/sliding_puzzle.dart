import 'dart:async';
import 'dart:math';
import 'dart:ui' as ui;

import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_diktup_utilities/extensions.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-quest-activity.graphql.dart';
import 'package:flutter_loyalcraft_gql/schema.graphql.dart';
import 'package:image/image.dart' as image;
import 'package:loyalcraft/localizations_delegate/app_localizations.dart';
import 'package:loyalcraft/src/bloc/variable.dart';
import 'package:loyalcraft/src/data/consts.dart';
import 'package:loyalcraft/src/data/flutter_messenger.dart';
import 'package:loyalcraft/src/screens/picture_preview.dart';
import 'package:loyalcraft/src/widgets/qualitative_quantitative.dart';

// ignore: must_be_immutable
class SlidingPuzzleWidget extends StatefulWidget {
  SlidingPuzzleWidget({
    required this.questActivity,
    required this.valueChanged,
    required this.coverImage,
    required this.threshold,
    required this.game,
    Key? key,
  }) : super(key: key);
  Query$getQuestActivitiesByQuest$getQuestActivitiesByQuest$activity$action$definition$game$sliding$threshold? threshold;
  Query$getQuestActivitiesByQuest$getQuestActivitiesByQuest$activity$action$definition$game? game;
  Query$getQuestActivitiesByQuest$getQuestActivitiesByQuest questActivity;
  ValueChanged<Input$QuestActionGameInput> valueChanged;
  String coverImage;
  @override
  _SlidingPuzzleWidget createState() => _SlidingPuzzleWidget();
}

class _SlidingPuzzleWidget extends State<SlidingPuzzleWidget> {
  late VariableCubit<List<SlideObject>?> _slideObjectsListCubit;
  late VariableCubit<int> _numberOfMovesCubit;
  late VariableCubit<bool> _finishSwapCubit;
  final GlobalKey _globalKey = GlobalKey();
  late VariableCubit<bool> _isStartedCubit;
  late VariableCubit<bool> _successCubit;
  late VariableCubit<Timer?> _timerCubit;
  late VariableCubit<int> _secondsCubit;
  final int _valueSlider = 3;

  // Future<void> reversePuzzle() async {
  //   _numberOfMovesCubit.updateValue(0);
  //   _timerCubit.state?.cancel();
  //   _timerCubit.updateValue(null);
  //   _isStartedCubit.updateValue(true);
  //   _finishSwapCubit.updateValue(true);
  //   await Stream.fromIterable(_processCubit.state.reversed)
  //       .asyncMap(
  //         (event) async => Future.delayed(
  //            Duration(
  //             milliseconds: 50,
  //           ),
  //         ).then(
  //           (value) => changePos(
  //             event,
  //             false,
  //           ),
  //         ),
  //       )
  //       .toList();
  //   _processCubit.updateValue([]);
  // }

  int _getTotalSeconds() {
    if (widget.threshold != null) {
      if (widget.threshold!.timer == Enum$GameTimerEnum.FIVE_MINUTES) {
        return 60 * 5;
      }
      if (widget.threshold!.timer == Enum$GameTimerEnum.HALF_MINUTE) {
        return 30;
      }
      if (widget.threshold!.timer == Enum$GameTimerEnum.MINUTE) {
        return 60;
      }
      if (widget.threshold!.timer == Enum$GameTimerEnum.TWO_MINUTES) {
        return 60 * 2;
      }
    }

    return 60 * 60 * 12;
  }

  Future<image.Image?> _getImageFromWidget() async {
    var buildContext = _globalKey.currentContext;
    RenderRepaintBoundary? boundary;
    if (buildContext != null) {
      boundary = buildContext.findRenderObject() as RenderRepaintBoundary?;
    }

    if (boundary == null) {
      return null;
    }

    image.Image? img;
    try {
      var uiImage = await boundary.toImage();
      var byteData = await uiImage.toByteData(format: ui.ImageByteFormat.png);
      var pngBytes = byteData!.buffer.asUint8List();
      img = image.decodeImage(pngBytes);
    } on Exception catch (e) {
      debugPrint('Error: $e');
    }

    return img;
  }

  Future<void> _generatePuzzle() async {
    HapticFeedback.heavyImpact();
    _startTimer();
    var size = Size(
      (kAppSize.width - 20.0) * 0.9,
      (kAppSize.width - 20.0) * 0.9,
    );

    _numberOfMovesCubit.updateValue(0);
    _finishSwapCubit.updateValue(false);
    var fullImage = await _getImageFromWidget();

    var sizeBox = Size(size.width / _valueSlider, size.width / _valueSlider);

    _slideObjectsListCubit.updateValue(
      List.generate(_valueSlider * _valueSlider, (index) {
        var offsetTemp = Offset(
          index % _valueSlider * sizeBox.width,
          index ~/ _valueSlider * sizeBox.height,
        );

        image.Image? tempCrop;

        if (fullImage != null) {
          tempCrop = image.copyCrop(
            fullImage,
            x: offsetTemp.dx.round(),
            y: offsetTemp.dy.round(),
            width: sizeBox.width.round(),
            height: sizeBox.height.round(),
          );
        }

        return SlideObject(
          posCurrent: offsetTemp,
          posDefault: offsetTemp,
          indexCurrent: index,
          indexDefault: index + 1,
          empty: false,
          size: sizeBox,
          image: tempCrop == null
              ? null
              : Image.memory(
                  image.encodePng(tempCrop),
                  fit: BoxFit.cover,
                  height: sizeBox.height,
                  width: sizeBox.width,
                ),
        );
      }),
    );

    var newList = _slideObjectsListCubit.state ?? [];
    newList.last.empty = true;
    _slideObjectsListCubit.updateValue(newList);
    var swap = true;
    var processNewList = [];
    for (var i = 0; i < _valueSlider * 20; i++) {
      for (var j = 0; j < _valueSlider / 2; j++) {
        var slideObjectEmpty = getEmptyObject();

        var emptyIndex = slideObjectEmpty.indexCurrent;
        processNewList.add(emptyIndex);
        int randKey;

        if (swap) {
          var row = emptyIndex ~/ _valueSlider;
          randKey = row * _valueSlider + Random().nextInt(_valueSlider);
        } else {
          var col = emptyIndex % _valueSlider;
          randKey = _valueSlider * Random().nextInt(_valueSlider) + col;
        }

        changePos(randKey, false);
        swap = !swap;
      }
    }

    _isStartedCubit.updateValue(true);
    _finishSwapCubit.updateValue(true);
  }

  SlideObject getEmptyObject() => (_slideObjectsListCubit.state ?? []).last;

  void changePos(int indexCurrent, bool isSelf) {
    SlideObject? slideObjectEmpty;
    if ((_slideObjectsListCubit.state ?? []).isNotEmpty) {
      slideObjectEmpty = getEmptyObject();
    }
    if (slideObjectEmpty != null) {
      var emptyIndex = slideObjectEmpty.indexCurrent;

      int minIndex = min(indexCurrent, emptyIndex);
      int maxIndex = max(indexCurrent, emptyIndex);

      var rangeMoves = <dynamic>[];

      if (indexCurrent % _valueSlider == emptyIndex % _valueSlider) {
        rangeMoves = (_slideObjectsListCubit.state ?? [])
            .where(
              (element) => element.indexCurrent % _valueSlider == indexCurrent % _valueSlider,
            )
            .toList();
      } else if (indexCurrent ~/ _valueSlider == emptyIndex ~/ _valueSlider) {
        rangeMoves = _slideObjectsListCubit.state ?? [];
      } else {
        rangeMoves = [];
      }

      rangeMoves = rangeMoves
          .where(
            (puzzle) => puzzle.indexCurrent >= minIndex && puzzle.indexCurrent <= maxIndex && puzzle.indexCurrent != emptyIndex,
          )
          .toList();

      if (emptyIndex < indexCurrent) {
        rangeMoves.sort((a, b) => a.indexCurrent < b.indexCurrent ? 1 : 0);
      } else {
        rangeMoves.sort((a, b) => a.indexCurrent < b.indexCurrent ? 0 : 1);
      }

      if (rangeMoves.isNotEmpty) {
        if (isSelf) {
          _numberOfMovesCubit.updateValue(_numberOfMovesCubit.state! + 1);
          HapticFeedback.heavyImpact();
        }
        var tempIndex = rangeMoves[0].indexCurrent;

        var tempPos = rangeMoves[0].posCurrent;

        for (var i = 0; i < rangeMoves.length - 1; i++) {
          rangeMoves[i].indexCurrent = rangeMoves[i + 1].indexCurrent;
          rangeMoves[i].posCurrent = rangeMoves[i + 1].posCurrent;
        }

        rangeMoves.last.indexCurrent = slideObjectEmpty.indexCurrent;
        rangeMoves.last.posCurrent = slideObjectEmpty.posCurrent;

        slideObjectEmpty
          ..indexCurrent = tempIndex
          ..posCurrent = tempPos;
      }

      if ((_slideObjectsListCubit.state ?? []).where((slideObject) => slideObject.indexCurrent == slideObject.indexDefault - 1).length == (_slideObjectsListCubit.state ?? []).length &&
          _finishSwapCubit.state!) {
        _successCubit.updateValue(true);
        widget.valueChanged(
          widget.threshold == null
              ? Input$QuestActionGameInput(
                  activity: widget.questActivity.id,
                  duration: _secondsCubit.state!,
                  movesCount: _numberOfMovesCubit.state!,
                )
              : Input$QuestActionGameInput(
                  activity: widget.questActivity.id,
                  duration: _secondsCubit.state!,
                  movesCount: _numberOfMovesCubit.state!,
                  timer: widget.threshold!.timer,
                ),
        );
      } else {
        _successCubit.updateValue(false);
      }
    }
  }

  String _getTimerText({required int currentSeconds}) {
    var minutes = currentSeconds ~/ 60;
    var seconds = currentSeconds % 60;
    return '${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}';
  }

  void clearPuzzle() {
    HapticFeedback.heavyImpact();
    _timerCubit.state?.cancel();
    _timerCubit.updateValue(null);
    _secondsCubit.updateValue(_getTotalSeconds());
    _numberOfMovesCubit.updateValue(0);
    _isStartedCubit.updateValue(false);
    _slideObjectsListCubit.updateValue(null);
    _successCubit.updateValue(false);
    _finishSwapCubit.updateValue(true);
  }

  void _startTimer() {
    _secondsCubit.updateValue(0);
    var timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_secondsCubit.state! < _getTotalSeconds()) {
        _secondsCubit.updateValue(_secondsCubit.state! + 1);
      } else {
        FlutterMessenger.showSnackbar(context: context, string: translate(context, 'gameCountdownOver'));
        clearPuzzle();
      }
    });
    _timerCubit.updateValue(timer);
  }

  void _initState() {
    _finishSwapCubit = VariableCubit(value: false);
    _numberOfMovesCubit = VariableCubit(value: 0);
    _isStartedCubit = VariableCubit(value: false);
    _successCubit = VariableCubit(value: false);
    _secondsCubit = VariableCubit(value: 0);
    _slideObjectsListCubit = VariableCubit();
    _timerCubit = VariableCubit();
  }

  @override
  void dispose() {
    _timerCubit.state?.cancel();
    _numberOfMovesCubit.close();
    _slideObjectsListCubit.close();
    _finishSwapCubit.close();
    _isStartedCubit.close();
    _secondsCubit.close();
    _successCubit.close();
    _timerCubit.close();
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
  Widget build(BuildContext context) => MultiBlocProvider(
        providers: [
          BlocProvider(create: (context) => _numberOfMovesCubit),
          BlocProvider(create: (context) => _slideObjectsListCubit),
          BlocProvider(create: (context) => _isStartedCubit),
          BlocProvider(create: (context) => _finishSwapCubit),
          BlocProvider(create: (context) => _secondsCubit),
          BlocProvider(create: (context) => _successCubit),
          BlocProvider(create: (context) => _timerCubit),
        ],
        child: BlocBuilder<VariableCubit, dynamic>(
          bloc: _numberOfMovesCubit,
          builder: (context, numberOfMoves) => BlocBuilder<VariableCubit, dynamic>(
            bloc: _slideObjectsListCubit,
            builder: (context, slideObjects) => BlocBuilder<VariableCubit, dynamic>(
              bloc: _isStartedCubit,
              builder: (context, isStarted) => BlocBuilder<VariableCubit, dynamic>(
                bloc: _finishSwapCubit,
                builder: (context, finishSwap) => BlocBuilder<VariableCubit, dynamic>(
                  bloc: _secondsCubit,
                  builder: (context, seconds) => BlocBuilder<VariableCubit, dynamic>(
                    bloc: _successCubit,
                    builder: (context, success) => BlocBuilder<VariableCubit, dynamic>(
                      bloc: _timerCubit,
                      builder: (context, timer) {
                        var tempSlideObjects = slideObjects == null
                            ? null
                            : List.of(slideObjects ?? [])
                                .map(
                                  (e) => SlideObject(
                                    empty: e.empty,
                                    image: e.image,
                                    indexCurrent: e.indexCurrent,
                                    indexDefault: e.indexDefault,
                                    posCurrent: e.posCurrent,
                                    posDefault: e.posDefault,
                                    size: e.size,
                                  ),
                                )
                                .toList();
                        return Container(
                          alignment: Alignment.center,
                          padding: const EdgeInsets.all(16.0),
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(8.0),
                            color: Theme.of(context).focusColor,
                          ),
                          child: LayoutBuilder(
                            builder: (context, raints) => SizedBox(
                              width: raints.biggest.width,
                              child: Column(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Center(
                                    child: Wrap(
                                      crossAxisAlignment: WrapCrossAlignment.center,
                                      runAlignment: WrapAlignment.center,
                                      alignment: WrapAlignment.center,
                                      runSpacing: 8.0,
                                      spacing: 8.0,
                                      children: [
                                        Text(
                                          '$numberOfMoves ${translate(context, 'moves')}',
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
                                        if (widget.threshold != null)
                                          Container(
                                            height: 16.0,
                                            width: 2.0,
                                            decoration: BoxDecoration(
                                              color: kAppColor,
                                              borderRadius: BorderRadius.circular(100.0),
                                            ),
                                          ),
                                        if (widget.threshold != null)
                                          RichText(
                                            textAlign: TextAlign.center,
                                            text: TextSpan(
                                              children: [
                                                TextSpan(
                                                  text: '${translate(context, 'finishTheGameBefore')} ',
                                                  style: Theme.of(context).textTheme.bodyMedium,
                                                ),
                                                TextSpan(
                                                  text: translate(context, widget.threshold!.timer!.name),
                                                  style: Theme.of(context).textTheme.bodyLarge,
                                                ),
                                                TextSpan(
                                                  text: ' ${translate(context, 'toEarnExtra')} ',
                                                  style: Theme.of(context).textTheme.bodyMedium,
                                                ),
                                              ],
                                            ),
                                          ),
                                        if (widget.threshold != null)
                                          Wrap(
                                            crossAxisAlignment: WrapCrossAlignment.center,
                                            runAlignment: WrapAlignment.center,
                                            alignment: WrapAlignment.center,
                                            runSpacing: 4.0,
                                            spacing: 4.0,
                                            children: List.generate((widget.threshold!.bonus ?? []).length, (index) {
                                              var bonus = widget.threshold!.bonus![index];
                                              if (widget.threshold!.bonus!.first.walletType == Enum$WalletTypeEnum.QUALITATIVE) {
                                                bonus = widget.threshold!.bonus!.reversed.toList()[index];
                                              }
                                              return Container(
                                                padding: const EdgeInsets.all(6.0),
                                                decoration: BoxDecoration(
                                                  borderRadius: BorderRadius.circular(100.0),
                                                  border: Border.all(
                                                    color: Colors.grey[800]!,
                                                  ),
                                                ),
                                                child: QualitativeQuantitativeWidget(
                                                  textStyle: Theme.of(context).textTheme.bodyLarge,
                                                  walletType: bonus.walletType ?? Enum$WalletTypeEnum.QUANTITATIVE,
                                                  baseUrl: bonus.wallet?.coin?.picture?.baseUrl,
                                                  path: bonus.wallet?.coin?.picture?.path,
                                                  amount: bonus.amount.toInteger(),
                                                  size: const Size(18.0, 18.0),
                                                  textAlign: TextAlign.center,
                                                ),
                                              );
                                            }),
                                          ),
                                      ],
                                    ),
                                  ),
                                  const SizedBox(height: 16.0),
                                  SizedBox(
                                    width: double.infinity,
                                    height: 320.0,
                                    child: Stack(
                                      children: [
                                        if (tempSlideObjects == null) ...[
                                          RepaintBoundary(
                                            key: _globalKey,
                                            child: ClipRRect(
                                              borderRadius: BorderRadius.circular(8.0),
                                              child: Image(
                                                width: double.infinity,
                                                height: 320.0,
                                                fit: BoxFit.cover,
                                                image: NetworkImage(
                                                  widget.coverImage,
                                                ),
                                              ),
                                            ),
                                          ),
                                        ],
                                        if (tempSlideObjects != null)
                                          ...tempSlideObjects
                                              .where((e) => e.empty)
                                              .map(
                                                (slideObject) => Positioned(
                                                  left: slideObject.posCurrent.dx,
                                                  top: slideObject.posCurrent.dy,
                                                  child: ClipRRect(
                                                    borderRadius: BorderRadius.circular(8.0),
                                                    child: SizedBox(
                                                      width: slideObject.size.width,
                                                      height: slideObject.size.height,
                                                      child: Container(
                                                        alignment: Alignment.center,
                                                        margin: const EdgeInsets.all(2),
                                                        color: Colors.white24,
                                                        child: Stack(
                                                          alignment: Alignment.center,
                                                          clipBehavior: Clip.none,
                                                          children: [
                                                            if (slideObject.image != null) ...[
                                                              Opacity(
                                                                opacity: success ? 1 : 0.3,
                                                                child: slideObject.image,
                                                              ),
                                                            ],
                                                          ],
                                                        ),
                                                      ),
                                                    ),
                                                  ),
                                                ),
                                              )
                                              .toList(),
                                        if (tempSlideObjects != null)
                                          ...tempSlideObjects
                                              .where((slideObject) => !slideObject.empty)
                                              .map(
                                                (slideObject) => AnimatedPositioned(
                                                  duration: const Duration(milliseconds: 200),
                                                  curve: Curves.ease,
                                                  left: slideObject.posCurrent.dx,
                                                  top: slideObject.posCurrent.dy,
                                                  child: GestureDetector(
                                                    onTap: () => changePos(slideObject.indexCurrent, true),
                                                    child: ClipRRect(
                                                      borderRadius: BorderRadius.circular(8.0),
                                                      child: SizedBox(
                                                        width: slideObject.size.width,
                                                        height: slideObject.size.height,
                                                        child: Container(
                                                          alignment: Alignment.center,
                                                          margin: const EdgeInsets.all(2.0),
                                                          child: Stack(
                                                            alignment: Alignment.center,
                                                            clipBehavior: Clip.none,
                                                            children: [
                                                              if (slideObject.image != null) ...[
                                                                slideObject.image!,
                                                              ],
                                                              Center(
                                                                child: Stack(
                                                                  clipBehavior: Clip.none,
                                                                  children: [
                                                                    Text(
                                                                      '${slideObject.indexDefault}',
                                                                      style: Theme.of(context).textTheme.displayMedium!.copyWith(
                                                                            color: kAppColor,
                                                                            fontSize: 30.0,
                                                                          ),
                                                                    ),
                                                                    Text(
                                                                      '${slideObject.indexDefault}',
                                                                      style: Theme.of(context).textTheme.displayMedium!.copyWith(
                                                                            color: Colors.white,
                                                                            fontSize: 28.0,
                                                                          ),
                                                                    ),
                                                                  ],
                                                                ),
                                                              ),
                                                            ],
                                                          ),
                                                        ),
                                                      ),
                                                    ),
                                                  ),
                                                ),
                                              )
                                              .toList(),
                                      ],
                                    ),
                                  ),
                                  const SizedBox(height: 16.0),
                                  Row(
                                    children: [
                                      Expanded(
                                        child: GestureDetector(
                                          onTap: () {
                                            if (isStarted) {
                                              clearPuzzle();
                                            } else {
                                              _generatePuzzle();
                                            }
                                          },
                                          child: Container(
                                            padding: const EdgeInsets.all(8.0),
                                            decoration: BoxDecoration(
                                              borderRadius: BorderRadius.circular(8.0),
                                              color: Colors.black,
                                            ),
                                            child: Text(
                                              translate(context, isStarted ? 'clear' : 'play'),
                                              textAlign: TextAlign.center,
                                              style: Theme.of(context).textTheme.bodyMedium!.copyWith(
                                                    color: Colors.white,
                                                  ),
                                            ),
                                          ),
                                        ),
                                      ),
                                      const SizedBox(width: 16.0),
                                      Expanded(
                                        child: GestureDetector(
                                          onTap: () => showGeneralDialog(
                                            transitionDuration: const Duration(milliseconds: 1),
                                            barrierColor: Colors.transparent,
                                            barrierLabel: '',
                                            context: context,
                                            pageBuilder: (context, anim1, anim2) => PicturePreviewDialog(
                                              url: '${widget.game!.sliding!.picture!.baseUrl}/${widget.game!.sliding!.picture!.path}',
                                            ),
                                          ),
                                          child: Container(
                                            padding: const EdgeInsets.all(8.0),
                                            decoration: BoxDecoration(
                                              borderRadius: BorderRadius.circular(8.0),
                                              color: Colors.white,
                                            ),
                                            child: Text(
                                              translate(context, 'seeThePicture'),
                                              textAlign: TextAlign.center,
                                              style: Theme.of(context).textTheme.bodyMedium!.copyWith(
                                                    color: Colors.black,
                                                  ),
                                            ),
                                          ),
                                        ),
                                      ),
                                    ],
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
      );
}

class SlideObject {
  SlideObject({
    required this.indexCurrent,
    required this.indexDefault,
    required this.posCurrent,
    required this.posDefault,
    required this.image,
    required this.empty,
    required this.size,
  });
  Offset posDefault;
  Offset posCurrent;
  int indexDefault;
  int indexCurrent;
  Image? image;
  bool empty;
  Size size;
}
