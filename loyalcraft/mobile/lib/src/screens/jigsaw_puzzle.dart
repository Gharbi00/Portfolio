import 'dart:async';
import 'dart:math' as math;
import 'dart:math';
import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_diktup_utilities/extensions.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-quest-activity.graphql.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-quest-quest.graphql.dart';
import 'package:flutter_loyalcraft_gql/schema.graphql.dart';
import 'package:image/image.dart' as ui;
import 'package:loyalcraft/localizations_delegate/app_localizations.dart';
import 'package:loyalcraft/src/bloc/variable.dart';
import 'package:loyalcraft/src/data/consts.dart';
import 'package:loyalcraft/src/data/flutter_messenger.dart';
import 'package:loyalcraft/src/screens/picture_preview.dart';
import 'package:loyalcraft/src/utils/navigation_service.dart';

// ignore: must_be_immutable
class JigsawPuzzleWidget extends StatefulWidget {
  JigsawPuzzleWidget({
    required this.isLoadingCubit,
    required this.numberOfPieces,
    required this.questActivity,
    required this.valueChanged,
    required this.totalSeconds,
    required this.action,
    required this.game,
    Key? key,
    required this.quest,
  }) : super(key: key);
  Query$getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated$getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated$objects quest;
  Query$getQuestActivitiesByQuest$getQuestActivitiesByQuest$activity$action$definition$game? game;
  Query$getQuestActivitiesByQuest$getQuestActivitiesByQuest$activity$action action;
  Query$getQuestActivitiesByQuest$getQuestActivitiesByQuest questActivity;
  ValueChanged<Input$QuestActionGameInput> valueChanged;
  VariableCubit isLoadingCubit;
  int numberOfPieces;
  int totalSeconds;

  @override
  _JigsawPuzzleWidget createState() => _JigsawPuzzleWidget();
}

class _JigsawPuzzleWidget extends State<JigsawPuzzleWidget> {
  late VariableCubit<List<List<BlockClass>>> _listOfImagesCubit;
  late VariableCubit<List<BlockClass>> _blockNotDoneCubit;
  late VariableCubit<List<BlockClass>> _blockDoneCubit;
  late VariableCubit<ui.Image?> _imageFromWidgetCubit;
  late VariableCubit<BlockClass?> _currentBlockCubit;
  late VariableCubit<int> _numberOfMovesCubit;
  final GlobalKey _globalKey = GlobalKey();
  late VariableCubit<Size> _containerSize;
  late VariableCubit<int> _secondsCubit;
  late VariableCubit<Timer?> _timerCubit;
  late VariableCubit<bool> _isStartedCubit;

  void _startTimer() {
    _numberOfMovesCubit.updateValue(0);
    _secondsCubit.updateValue(0);
    var timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if ((_secondsCubit.state ?? 0) < widget.totalSeconds) {
        _secondsCubit.updateValue((_secondsCubit.state ?? 0) + 1);
      } else {
        _resetJigsaw();
        FlutterMessenger.showSnackbar(context: context, string: translate(context, 'gameCountdownOver'));
      }
    });
    _timerCubit.updateValue(timer);
  }

  Future<ui.Image?> _getImageFromWidget() async {
    var boundary = _globalKey.currentContext?.findRenderObject() as RenderRepaintBoundary?;
    if (boundary != null) {
      _containerSize.updateValue(boundary.size);
      var img = await boundary.toImage();
      var byteData = await img.toByteData(format: ImageByteFormat.png);
      var pngBytes = byteData!.buffer.asUint8List();
      return ui.decodeImage(pngBytes);
    }
    return null;
  }

  void _resetJigsaw() {
    _listOfImagesCubit.updateValue([]);
    _currentBlockCubit.updateValue(null);
    _blockDoneCubit.updateValue([]);
    _blockNotDoneCubit.updateValue([]);
    _timerCubit.state?.cancel();
    _secondsCubit.updateValue(widget.totalSeconds);
    _isStartedCubit.updateValue(false);
    _numberOfMovesCubit.updateValue(0);
  }

  Future<void> _generaJigsawCropImage() async {
    if (_imageFromWidgetCubit.state == null) {
      var fullImage = await _getImageFromWidget();
      _imageFromWidgetCubit.updateValue(fullImage);
    }
    var tempImage = _imageFromWidgetCubit.state;
    var xSplitCount = widget.numberOfPieces;
    var ySplitCount = widget.numberOfPieces;

    var widthPerBlock = (_imageFromWidgetCubit.state?.width ?? 100) / xSplitCount;
    var heightPerBlock = (_imageFromWidgetCubit.state?.height ?? 100) / ySplitCount;

    for (var y = 0; y < ySplitCount; y++) {
      var tempImages = <BlockClass>[];
      var newList1 = (_listOfImagesCubit.state ?? [])..add(tempImages);
      if (_listOfImagesCubit.state!.isNotEmpty && _imageFromWidgetCubit.state != null) {
        for (var x = 0; x < xSplitCount; x++) {
          var randomPosRow = math.Random().nextInt(2).isEven ? 1 : -1;
          var randomPosCol = math.Random().nextInt(2).isEven ? 1 : -1;

          var offsetCenter = Offset(widthPerBlock / 2, heightPerBlock / 2);

          var jigsawPosSide = ClassJigsawPos(
            bottom: y == ySplitCount - 1 ? 0 : randomPosCol,
            left: x == 0 ? 0 : -_listOfImagesCubit.state![y][x - 1].jigsawBlockWidget.imageBox.posSide.right,
            right: x == xSplitCount - 1 ? 0 : randomPosRow,
            top: y == 0 ? 0 : -_listOfImagesCubit.state![y - 1][x].jigsawBlockWidget.imageBox.posSide.bottom,
          );

          var xAxis = widthPerBlock * x;
          var yAxis = heightPerBlock * y;

          var minSize = math.min(widthPerBlock, heightPerBlock) / 15 * 4;

          offsetCenter = Offset(
            (widthPerBlock / 2) + (jigsawPosSide.left == 1 ? minSize : 0),
            (heightPerBlock / 2) + (jigsawPosSide.top == 1 ? minSize : 0),
          );

          xAxis -= jigsawPosSide.left == 1 ? minSize : 0;
          yAxis -= jigsawPosSide.top == 1 ? minSize : 0;

          var widthPerBlockTemp = widthPerBlock + (jigsawPosSide.left == 1 ? minSize : 0) + (jigsawPosSide.right == 1 ? minSize : 0);
          var heightPerBlockTemp = heightPerBlock + (jigsawPosSide.top == 1 ? minSize : 0) + (jigsawPosSide.bottom == 1 ? minSize : 0);

          tempImage = ui.copyCrop(
            _imageFromWidgetCubit.state!,
            x: xAxis.round(),
            y: yAxis.round(),
            width: widthPerBlockTemp.round(),
            height: heightPerBlockTemp.round(),
          );

          var offset = Offset(
            (_containerSize.state!.width) / 2 - widthPerBlockTemp / 2,
            (_containerSize.state!.height) / 2 - heightPerBlockTemp / 2,
          );

          var imageBox = ImageBox(
            image: Image.memory(
              ui.encodePng(tempImage),
              fit: BoxFit.cover,
            ),
            isDone: false,
            offsetCenter: offsetCenter,
            radiusPoint: minSize,
            size: Size(widthPerBlockTemp, heightPerBlockTemp),
            posSide: jigsawPosSide,
          );
          newList1[y].add(
            BlockClass(
              timestamp: DateTime.now().microsecondsSinceEpoch,
              jigsawBlockWidget: JigsawBlockWidget(
                borderColor: Colors.green[800]!,
                imageBox: imageBox,
              ),
              dx: offset.dx,
              dy: offset.dy,
              offsetDefault: Offset(xAxis, yAxis),
            ),
          );
          _listOfImagesCubit.updateValue(newList1);
        }
      }
      _isStartedCubit.updateValue(true);
    }

    var newList1 = _listOfImagesCubit.state!.expand((toElements) => toElements).where((block) => block.jigsawBlockWidget.imageBox.isDone == false).toList();
    var newList2 = _listOfImagesCubit.state!.expand((toElements) => toElements).where((block) => block.jigsawBlockWidget.imageBox.isDone).toList();
    newList1
      ..shuffle(Random())
      ..shuffle(Random());
    newList2
      ..shuffle(Random())
      ..shuffle(Random());
    _blockNotDoneCubit.updateValue(newList1);
    _blockDoneCubit.updateValue(newList2);
    if (_blockNotDoneCubit.state!.isNotEmpty) {
      _currentBlockCubit.updateValue(_blockNotDoneCubit.state!.first);
    }
    _startTimer();
  }

  String _getTimerText({required int currentSeconds}) {
    var minutes = currentSeconds ~/ 60;
    var seconds = currentSeconds % 60;
    return '${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}';
  }

  void _initState() {
    _containerSize = VariableCubit(value: const Size(50.0, 50.0));
    _numberOfMovesCubit = VariableCubit(value: 0);
    _listOfImagesCubit = VariableCubit(value: []);
    _blockNotDoneCubit = VariableCubit(value: []);

    _blockDoneCubit = VariableCubit(value: []);
    _secondsCubit = VariableCubit(value: 0);
    _isStartedCubit = VariableCubit(value: false);
    _currentBlockCubit = VariableCubit();
    _imageFromWidgetCubit = VariableCubit();
    _timerCubit = VariableCubit();
  }

  @override
  void dispose() {
    _timerCubit.state?.cancel();
    _timerCubit.close();
    _secondsCubit.close();
    _numberOfMovesCubit.close();
    _listOfImagesCubit.close();
    _imageFromWidgetCubit.close();
    _blockDoneCubit.close();
    _isStartedCubit.close();
    _blockNotDoneCubit.close();
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
          BlocProvider(create: (context) => _listOfImagesCubit),
          BlocProvider(create: (context) => _blockNotDoneCubit),
          BlocProvider(create: (context) => _currentBlockCubit),
          BlocProvider(create: (context) => _blockDoneCubit),
          BlocProvider(create: (context) => _containerSize),
          BlocProvider(create: (context) => _secondsCubit),
          BlocProvider(create: (context) => _isStartedCubit),
          BlocProvider(create: (context) => _timerCubit),
          BlocProvider(create: (context) => _imageFromWidgetCubit),
        ],
        child: BlocBuilder<VariableCubit, dynamic>(
          bloc: _imageFromWidgetCubit,
          builder: (context, imageFromWidget) => BlocBuilder<VariableCubit, dynamic>(
            bloc: _timerCubit,
            builder: (context, timer) => BlocBuilder<VariableCubit, dynamic>(
              bloc: _numberOfMovesCubit,
              builder: (context, numberOfMoves) => BlocBuilder<VariableCubit, dynamic>(
                bloc: _secondsCubit,
                builder: (context, seconds) => BlocBuilder<VariableCubit, dynamic>(
                  bloc: _listOfImagesCubit,
                  builder: (context, data) => BlocBuilder<VariableCubit, dynamic>(
                    bloc: _blockDoneCubit,
                    builder: (context, data) => BlocBuilder<VariableCubit, dynamic>(
                      bloc: _blockNotDoneCubit,
                      builder: (context, data) => BlocBuilder<VariableCubit, dynamic>(
                        bloc: _currentBlockCubit,
                        builder: (context, data) => BlocBuilder<VariableCubit, dynamic>(
                          bloc: _containerSize,
                          builder: (context, containerSize) => BlocBuilder<VariableCubit, dynamic>(
                            bloc: _isStartedCubit,
                            builder: (context, isStarted) => Column(
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
                                Container(
                                  padding: const EdgeInsets.all(16.0),
                                  decoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(8.0),
                                    color: Theme.of(context).focusColor,
                                  ),
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
                                              '$numberOfMoves ${translate(context, 'clicks')}',
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
                                      SizedBox(
                                        height: kAppSize.width,
                                        child: Stack(
                                          children: [
                                            if (_listOfImagesCubit.state!.isEmpty) ...[
                                              RepaintBoundary(
                                                key: _globalKey,
                                                child: Image(
                                                  height: double.maxFinite,
                                                  width: double.maxFinite,
                                                  fit: BoxFit.cover,
                                                  image: NetworkImage(
                                                    '${widget.game!.jigsaw!.picture!.baseUrl}/${widget.game!.jigsaw!.picture!.path}',
                                                  ),
                                                ),
                                              ),
                                            ],
                                            if (_listOfImagesCubit.state!.expand((toElements) => toElements).toList().isNotEmpty)
                                              SizedBox(
                                                width: containerSize.width,
                                                height: containerSize.height,
                                                child: Stack(
                                                  children: [
                                                    CustomPaint(
                                                      painter: JigsawPainterBackground(_listOfImagesCubit.state!.expand((toElements) => toElements).toList()),
                                                      child: Stack(
                                                        clipBehavior: Clip.none,
                                                        children: [
                                                          if (_blockDoneCubit.state!.isNotEmpty)
                                                            ..._blockDoneCubit.state!.map(
                                                              (map) => Positioned(
                                                                left: map.dx,
                                                                top: map.dy,
                                                                child: Container(
                                                                  child: map.jigsawBlockWidget,
                                                                ),
                                                              ),
                                                            ),
                                                        ],
                                                      ),
                                                    ),
                                                    ...List.generate(_blockNotDoneCubit.state!.where((e) => e.jigsawBlockWidget.imageBox.isDone).toList().length, (index) {
                                                      final block = _blockNotDoneCubit.state!.where((e) => e.jigsawBlockWidget.imageBox.isDone).toList()[index];
                                                      return Positioned(
                                                        left: block.offsetDefault.dx,
                                                        top: block.offsetDefault.dy,
                                                        child: block.jigsawBlockWidget,
                                                      );
                                                    }),
                                                    if (_currentBlockCubit.state != null)
                                                      Positioned(
                                                        left: _currentBlockCubit.state!.dx,
                                                        top: _currentBlockCubit.state!.dy,
                                                        child: GestureDetector(
                                                          onPanStart: (details) {
                                                            _numberOfMovesCubit.updateValue(numberOfMoves + 1);
                                                          },
                                                          onPanEnd: (details) {
                                                            _currentBlockCubit.updateValue(
                                                              _currentBlockCubit.state!.copyWith(
                                                                jigsawBlockWidget: JigsawBlockWidget(
                                                                  imageBox: _currentBlockCubit.state!.jigsawBlockWidget.imageBox.copyWith(isDone: false),
                                                                  borderColor: _currentBlockCubit.state!.jigsawBlockWidget.borderColor,
                                                                ),
                                                              ),
                                                            );
                                                            if ((Offset(_currentBlockCubit.state!.dx, _currentBlockCubit.state!.dy) - _currentBlockCubit.state!.offsetDefault).distance < 50) {
                                                              var newList1 = _blockNotDoneCubit.state ?? [];
                                                              newList1.firstWhere((e) => e.timestamp == _currentBlockCubit.state!.timestamp).jigsawBlockWidget.imageBox.isDone = true;
                                                              _blockNotDoneCubit.updateValue(newList1);
                                                              _currentBlockCubit
                                                                ..updateValue(
                                                                  _currentBlockCubit.state!.copyWith(
                                                                    dx: _currentBlockCubit.state!.offsetDefault.dx,
                                                                    dy: _currentBlockCubit.state!.offsetDefault.dy,
                                                                    jigsawBlockWidget: JigsawBlockWidget(
                                                                      borderColor: Theme.of(context).colorScheme.secondary,
                                                                      imageBox: _currentBlockCubit.state!.jigsawBlockWidget.imageBox.copyWith(isDone: true),
                                                                    ),
                                                                  ),
                                                                )
                                                                ..updateValue(null);

                                                              final newList2 = _blockNotDoneCubit.state!.where((e) => e.jigsawBlockWidget.imageBox.isDone == false).toList();
                                                              if (newList2.isNotEmpty) {
                                                                _currentBlockCubit.updateValue(newList2[Random().nextInt(newList2.length)]);
                                                              }
                                                              HapticFeedback.heavyImpact();
                                                              if (_blockNotDoneCubit.state!.where((e) => e.jigsawBlockWidget.imageBox.isDone == false).toList().isEmpty) {
                                                                widget.valueChanged(
                                                                  Input$QuestActionGameInput(
                                                                    activity: widget.questActivity.id,
                                                                    movesCount: _numberOfMovesCubit.state ?? 0,
                                                                    duration: _secondsCubit.state ?? 0,
                                                                  ),
                                                                );
                                                              }
                                                            }
                                                          },
                                                          onPanUpdate: (details) {
                                                            var newDx = _currentBlockCubit.state!.dx + details.delta.dx;
                                                            var newDy = _currentBlockCubit.state!.dy + details.delta.dy;

                                                            var puzzleLeft = 0.0;
                                                            var puzzleTop = 0.0;
                                                            var puzzleRight = _containerSize.state!.width - _currentBlockCubit.state!.jigsawBlockWidget.imageBox.size.width;
                                                            var puzzleBottom = _containerSize.state!.height - _currentBlockCubit.state!.jigsawBlockWidget.imageBox.size.height;

                                                            newDx = newDx.clamp(puzzleLeft, puzzleRight);
                                                            newDy = newDy.clamp(puzzleTop, puzzleBottom);

                                                            _currentBlockCubit.state!.dx = newDx;
                                                            _currentBlockCubit.state!.dy = newDy;

                                                            _currentBlockCubit.updateValue(_currentBlockCubit.state!.copyWith(dx: newDx, dy: newDy));
                                                          },
                                                          child: _currentBlockCubit.state!.jigsawBlockWidget,
                                                        ),
                                                      ),
                                                  ],
                                                ),
                                              ),
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
                                                  _resetJigsaw();
                                                } else {
                                                  _generaJigsawCropImage();
                                                }
                                              },
                                              child: Container(
                                                padding: const EdgeInsets.all(8.0),
                                                decoration: BoxDecoration(
                                                  borderRadius: BorderRadius.circular(8.0),
                                                  color: Colors.white,
                                                ),
                                                child: Text(
                                                  translate(context, isStarted ? 'clear' : 'play'),
                                                  textAlign: TextAlign.center,
                                                  style: Theme.of(context).textTheme.bodyMedium!.copyWith(
                                                        color: Colors.black,
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
                                                  url: '${widget.game!.jigsaw!.picture!.baseUrl}/${widget.game!.jigsaw!.picture!.path}',
                                                ),
                                              ),
                                              child: Container(
                                                padding: const EdgeInsets.all(8.0),
                                                decoration: BoxDecoration(
                                                  borderRadius: BorderRadius.circular(8.0),
                                                  color: Colors.black,
                                                ),
                                                child: Text(
                                                  translate(context, 'seeThePicture'),
                                                  textAlign: TextAlign.center,
                                                  style: Theme.of(context).textTheme.bodyMedium!.copyWith(
                                                        color: Colors.white,
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
          ),
        ),
      );
}

// ignore: must_be_immutable
class JigsawBlockWidget extends StatelessWidget {
  JigsawBlockWidget({Key? key, required this.imageBox, required this.borderColor}) : super(key: key);
  ImageBox imageBox;
  Color borderColor;

  @override
  Widget build(BuildContext context) => ClipPath(
        clipper: PuzzlePieceClipper(imageBox: imageBox),
        child: CustomPaint(
          foregroundPainter: JigsawBlokPainter(
            imageBox: imageBox,
            borderColor: borderColor,
          ),
          child: imageBox.image,
        ),
      );
}

class JigsawPainterBackground extends CustomPainter {
  JigsawPainterBackground(this.blocks);
  List<BlockClass> blocks;

  @override
  void paint(Canvas canvas, Size size) {
    var buildContext = NavigationService().navigatorKey.currentState?.context;
    var paint = Paint()
      ..style = PaintingStyle.stroke
      ..color = buildContext == null ? Colors.grey[800]! : Theme.of(buildContext).colorScheme.secondary
      ..strokeWidth = 1
      ..strokeCap = StrokeCap.round;
    var path = Path();

    for (final element in blocks) {
      var pathTemp = getPiecePath(
        element.jigsawBlockWidget.imageBox.size,
        element.jigsawBlockWidget.imageBox.radiusPoint,
        element.jigsawBlockWidget.imageBox.offsetCenter,
        element.jigsawBlockWidget.imageBox.posSide,
      );

      path.addPath(pathTemp, element.offsetDefault);
    }

    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}

class BlockClass {
  BlockClass({
    required this.jigsawBlockWidget,
    required this.offsetDefault,
    required this.dx,
    required this.dy,
    required this.timestamp,
  });

  JigsawBlockWidget jigsawBlockWidget;
  Offset offsetDefault;
  double dx;
  double dy;
  int timestamp;

  BlockClass copyWith({
    JigsawBlockWidget? jigsawBlockWidget,
    Offset? offsetDefault,
    double? dx,
    double? dy,
    int? timestamp,
  }) =>
      BlockClass(
        jigsawBlockWidget: jigsawBlockWidget ?? this.jigsawBlockWidget,
        offsetDefault: offsetDefault ?? this.offsetDefault,
        dx: dx ?? this.dx,
        dy: dy ?? this.dy,
        timestamp: timestamp ?? this.timestamp,
      );
}

class ImageBox {
  ImageBox({
    required this.offsetCenter,
    required this.radiusPoint,
    required this.posSide,
    required this.isDone,
    required this.image,
    required this.size,
  });

  ClassJigsawPos posSide;
  Offset offsetCenter;
  double radiusPoint;
  Widget image;
  bool isDone;
  Size size;

  ImageBox copyWith({
    ClassJigsawPos? posSide,
    Offset? offsetCenter,
    double? radiusPoint,
    Widget? image,
    bool? isDone,
    Size? size,
  }) =>
      ImageBox(
        posSide: posSide ?? this.posSide,
        offsetCenter: offsetCenter ?? this.offsetCenter,
        radiusPoint: radiusPoint ?? this.radiusPoint,
        image: image ?? this.image,
        isDone: isDone ?? this.isDone,
        size: size ?? this.size,
      );
}

class ClassJigsawPos {
  ClassJigsawPos({
    required this.top,
    required this.bottom,
    required this.left,
    required this.right,
  });

  int top;
  int bottom;
  int left;
  int right;

  ClassJigsawPos copyWith({
    int? top,
    int? bottom,
    int? left,
    int? right,
  }) =>
      ClassJigsawPos(
        top: top ?? this.top,
        bottom: bottom ?? this.bottom,
        left: left ?? this.left,
        right: right ?? this.right,
      );
}

class JigsawBlokPainter extends CustomPainter {
  JigsawBlokPainter({
    required this.imageBox,
    required this.borderColor,
  });
  ImageBox imageBox;
  Color borderColor;
  @override
  void paint(Canvas canvas, Size size) {
    var paint = Paint()
      ..color = borderColor
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1;

    canvas.drawPath(
      getPiecePath(
        size,
        imageBox.radiusPoint,
        imageBox.offsetCenter,
        imageBox.posSide,
      ),
      paint,
    );

    if (imageBox.isDone) {
      var paintDone = Paint()
        ..color = Colors.transparent
        ..style = PaintingStyle.fill
        ..strokeWidth = 1;
      canvas.drawPath(
        getPiecePath(
          size,
          imageBox.radiusPoint,
          imageBox.offsetCenter,
          imageBox.posSide,
        ),
        paintDone,
      );
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class PuzzlePieceClipper extends CustomClipper<Path> {
  PuzzlePieceClipper({
    required this.imageBox,
  });
  ImageBox imageBox;
  @override
  Path getClip(Size size) => getPiecePath(
        size,
        imageBox.radiusPoint,
        imageBox.offsetCenter,
        imageBox.posSide,
      );

  @override
  bool shouldReclip(covariant CustomClipper<Path> oldClipper) => true;
}

Path getPiecePath(
  Size size,
  double radiusPoint,
  Offset offsetCenter,
  ClassJigsawPos posSide,
) {
  var path = Path();

  var topLeft = Offset.zero;
  var topRight = Offset(size.width, 0);
  var bottomLeft = Offset(0, size.height);
  var bottomRight = Offset(size.width, size.height);

  topLeft = Offset(posSide.left > 0 ? radiusPoint : 0, (posSide.top > 0) ? radiusPoint : 0) + topLeft;
  topRight = Offset(posSide.right > 0 ? -radiusPoint : 0, (posSide.top > 0) ? radiusPoint : 0) + topRight;
  bottomRight = Offset(posSide.right > 0 ? -radiusPoint : 0, (posSide.bottom > 0) ? -radiusPoint : 0) + bottomRight;
  bottomLeft = Offset(posSide.left > 0 ? radiusPoint : 0, (posSide.bottom > 0) ? -radiusPoint : 0) + bottomLeft;

  var topMiddle = posSide.top == 0 ? topRight.dy : (posSide.top > 0 ? topRight.dy - radiusPoint : topRight.dy + radiusPoint);
  var bottomMiddle = posSide.bottom == 0 ? bottomRight.dy : (posSide.bottom > 0 ? bottomRight.dy + radiusPoint : bottomRight.dy - radiusPoint);
  var leftMiddle = posSide.left == 0 ? topLeft.dx : (posSide.left > 0 ? topLeft.dx - radiusPoint : topLeft.dx + radiusPoint);
  var rightMiddle = posSide.right == 0 ? topRight.dx : (posSide.right > 0 ? topRight.dx + radiusPoint : topRight.dx - radiusPoint);

  path.moveTo(topLeft.dx, topLeft.dy);
  if (posSide.top != 0) {
    path.extendWithPath(
      calculatePoint(
        Axis.horizontal,
        topLeft.dy,
        Offset(offsetCenter.dx, topMiddle),
        radiusPoint,
      ),
      Offset.zero,
    );
  }
  path.lineTo(topRight.dx, topRight.dy);
  if (posSide.right != 0) {
    path.extendWithPath(
      calculatePoint(
        Axis.vertical,
        topRight.dx,
        Offset(rightMiddle, offsetCenter.dy),
        radiusPoint,
      ),
      Offset.zero,
    );
  }
  path.lineTo(bottomRight.dx, bottomRight.dy);
  if (posSide.bottom != 0) {
    path.extendWithPath(
      calculatePoint(
        Axis.horizontal,
        bottomRight.dy,
        Offset(offsetCenter.dx, bottomMiddle),
        -radiusPoint,
      ),
      Offset.zero,
    );
  }
  path.lineTo(bottomLeft.dx, bottomLeft.dy);
  if (posSide.left != 0) {
    path.extendWithPath(
      calculatePoint(
        Axis.vertical,
        bottomLeft.dx,
        Offset(leftMiddle, offsetCenter.dy),
        -radiusPoint,
      ),
      Offset.zero,
    );
  }
  path
    ..lineTo(topLeft.dx, topLeft.dy)
    ..close();

  return path;
}

Path calculatePoint(Axis axis, double fromPoint, Offset point, double radiusPoint) {
  var path = Path();

  if (axis == Axis.horizontal) {
    path
      ..moveTo(point.dx - radiusPoint / 2, fromPoint)
      ..lineTo(point.dx - radiusPoint / 2, point.dy)
      ..lineTo(point.dx + radiusPoint / 2, point.dy)
      ..lineTo(point.dx + radiusPoint / 2, fromPoint);
  } else if (axis == Axis.vertical) {
    path
      ..moveTo(fromPoint, point.dy - radiusPoint / 2)
      ..lineTo(point.dx, point.dy - radiusPoint / 2)
      ..lineTo(point.dx, point.dy + radiusPoint / 2)
      ..lineTo(fromPoint, point.dy + radiusPoint / 2);
  }

  return path;
}
