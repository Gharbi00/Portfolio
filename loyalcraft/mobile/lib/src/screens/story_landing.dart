import 'dart:async';

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_diktup_utilities/extensions.dart';
import 'package:loyalcraft/src/bloc/pos.dart';
import 'package:loyalcraft/src/bloc/variable.dart';
import 'package:loyalcraft/src/data/consts.dart';
import 'package:loyalcraft/src/models/commun_class.dart';
import 'package:loyalcraft/src/utils/image_cache_manager/custom_flutter_image_cache_manager.dart';
import 'package:loyalcraft/src/utils/image_cache_manager/shared_image_provider.dart';
import 'package:video_player/video_player.dart';

// ignore: must_be_immutable
class StoryLandingWidget extends StatefulWidget {
  StoryLandingWidget({
    Key? key,
    required this.index,
    required this.story,
  }) : super(key: key);
  int index;
  CommunClass story;

  @override
  _StoryLandingWidget createState() => _StoryLandingWidget();
}

class _StoryLandingWidget extends State<StoryLandingWidget> with TickerProviderStateMixin {
  late AnimationController _animationController1;
  VideoPlayerController? _videoPlayerController;
  late VariableCubit _isVideoInitializedCubit;
  late VariableCubit _isVideoPlayingCubit;
  late VariableCubit _storyIndexCubit;

  Future<void> _onTapDown({required TapDownDetails details, required int storyIndex}) async {
    final screenWidth = kAppSize.width;
    final dx = details.globalPosition.dx;

    if (dx < screenWidth / 5.8) {
      if (storyIndex == 0) {
        _videoPlayerController
          ?..seekTo(Duration.zero)
          ..play();
        _animationController1
          ..duration = Duration(seconds: _videoPlayerController?.value.duration.inSeconds ?? 14)
          ..stop()
          ..reset()
          ..forward();
      } else {
        final file = await CustomFlutterImageCacheManager.cacheVideoFromNetwork(kStoryList[storyIndex - 1].video.removeNull());

        if (file != null) {
          _animationController1.value = 0.0;
          _storyIndexCubit.updateValue(storyIndex - 1);
          _videoPlayerController
            ?..pause()
            ..seekTo(Duration.zero);
          _videoPlayerController = VideoPlayerController.file(file)
            ..initialize().then((_) {
              _isVideoInitializedCubit.updateValue(true);
              _animationController1
                ..duration = Duration(seconds: _videoPlayerController?.value.duration.inSeconds ?? 14)
                ..stop()
                ..reset()
                ..forward();
            })
            ..play().then((_) => _isVideoPlayingCubit.updateValue(true))
            ..addListener(() {});
        }
      }
    }
    if (dx > 2 * screenWidth / 2.4) {
      if (storyIndex + 1 == kStoryList.length) {
        _animationController1.stop();
        _videoPlayerController
          ?..setVolume(0)
          ..pause();
        Navigator.pop(context);
      } else {
        final file = await CustomFlutterImageCacheManager.cacheVideoFromNetwork(kStoryList[storyIndex + 1].video.removeNull());

        if (file != null) {
          _animationController1.value = 0.0;
          _storyIndexCubit.updateValue(storyIndex + 1);
          _videoPlayerController
            ?..pause()
            ..seekTo(Duration.zero);
          _videoPlayerController = VideoPlayerController.file(file)
            ..initialize().then((_) {
              _isVideoInitializedCubit.updateValue(true);
              _animationController1
                ..duration = Duration(seconds: _videoPlayerController?.value.duration.inSeconds ?? 14)
                ..stop()
                ..reset()
                ..forward();
            })
            ..play().then((_) => _isVideoPlayingCubit.updateValue(true))
            ..addListener(() {});
        }
      }
    }
  }

  Future<void> _initState() async {
    _animationController1 = AnimationController(vsync: this);

    _isVideoInitializedCubit = VariableCubit(value: false);
    _isVideoPlayingCubit = VariableCubit(value: false);
    _storyIndexCubit = VariableCubit(value: widget.index);
    final file = await CustomFlutterImageCacheManager.cacheVideoFromNetwork(kStoryList[_storyIndexCubit.state].video.removeNull());

    if (file != null) {
      _videoPlayerController = VideoPlayerController.file(file)
        ..initialize().then((_) {
          _isVideoInitializedCubit.updateValue(true);
          _animationController1
            ..duration = Duration(seconds: _videoPlayerController?.value.duration.inSeconds ?? 14)
            ..stop()
            ..reset()
            ..forward();
        })
        ..play().then((_) => _isVideoPlayingCubit.updateValue(true))
        ..addListener(() {});
    }
    _animationController1.addStatusListener((status) async {
      if (status == AnimationStatus.completed) {
        if (_storyIndexCubit.state + 1 < kStoryList.length) {
          final file = await CustomFlutterImageCacheManager.cacheVideoFromNetwork(kStoryList[_storyIndexCubit.state + 1].video.removeNull());
          if (file != null) {
            _animationController1.value = 0.0;
            _storyIndexCubit.updateValue(_storyIndexCubit.state + 1);
            _videoPlayerController
              ?..pause()
              ..seekTo(Duration.zero);
            _videoPlayerController = VideoPlayerController.file(file)
              ..initialize().then((_) {
                _isVideoInitializedCubit.updateValue(true);
                _animationController1
                  ..duration = Duration(seconds: _videoPlayerController?.value.duration.inSeconds ?? 14)
                  ..stop()
                  ..reset()
                  ..forward();
              })
              ..play().then((_) => _isVideoPlayingCubit.updateValue(true))
              ..addListener(() {});
          }
        } else {
          _videoPlayerController
            ?..setVolume(0)
            ..pause();
          Navigator.pop(context);
        }
      }
    });
  }

  @override
  void dispose() {
    _animationController1.dispose();
    _videoPlayerController
      ?..setVolume(0)
      ..pause()
      ..dispose();
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
    final _pos = context.watch<PosCubit>().state;

    return Dismissible(
      onDismissed: (_) {
        _videoPlayerController
          ?..setVolume(0)
          ..pause();
        Navigator.pop(context);
      },
      direction: DismissDirection.down,
      key: UniqueKey(),
      child: AnnotatedRegion<SystemUiOverlayStyle>(
        value: SystemUiOverlayStyle.light,
        child: MultiBlocProvider(
          providers: [
            BlocProvider(create: (context) => _isVideoInitializedCubit),
            BlocProvider(create: (context) => _storyIndexCubit),
          ],
          child: BlocBuilder<VariableCubit, dynamic>(
            bloc: _isVideoInitializedCubit,
            builder: (context, isVideoInitialized) => BlocBuilder<VariableCubit, dynamic>(
              bloc: _storyIndexCubit,
              builder: (context, storyIndex) => Scaffold(
                backgroundColor: Colors.black,
                extendBodyBehindAppBar: true,
                extendBody: true,
                body: GestureDetector(
                  onTapDown: (details) => _onTapDown(details: details, storyIndex: storyIndex),
                  onLongPressEnd: (value) {
                    _animationController1.forward();
                    _videoPlayerController?.play();
                  },
                  onLongPress: () {
                    _animationController1.stop();
                    _videoPlayerController?.pause();
                  },
                  child: SafeArea(
                    left: false,
                    right: false,
                    child: Container(
                      padding: const EdgeInsets.all(16.0),
                      width: double.infinity,
                      height: double.infinity,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(8.0),
                        color: Colors.black,
                      ),
                      child: Stack(
                        fit: StackFit.expand,
                        children: [
                          (_videoPlayerController == null || isVideoInitialized == false)
                              ? Center(
                                  child: SizedBox(
                                    width: 80.0,
                                    height: 80.0,
                                    child: CircularProgressIndicator(
                                      valueColor: AlwaysStoppedAnimation<Color>(kAppColor),
                                      backgroundColor: Theme.of(context).focusColor,
                                      strokeWidth: 2.0,
                                      color: kAppColor,
                                    ),
                                  ),
                                )
                              : Center(
                                  child: AspectRatio(
                                    aspectRatio: _videoPlayerController!.value.aspectRatio,
                                    child: ClipRRect(
                                      borderRadius: BorderRadius.circular(8.0),
                                      child: VideoPlayer(
                                        _videoPlayerController!,
                                      ),
                                    ),
                                  ),
                                ),
                          Positioned(
                            top: 16.0,
                            left: 16.0,
                            right: 16.0,
                            child: Column(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Row(
                                  children: List.generate(
                                    kStoryList.length,
                                    (index) => Expanded(
                                      child: Padding(
                                        padding: EdgeInsets.only(left: index == 0 ? 0.0 : 8.0),
                                        child: LayoutBuilder(
                                          builder: (context, raints) => Stack(
                                            children: [
                                              _buildContainer(
                                                width: double.infinity,
                                                color: Colors.white.withOpacity(0.6),
                                              ),
                                              if (index == storyIndex)
                                                AnimatedBuilder(
                                                  animation: _animationController1,
                                                  builder: (context, child) => _buildContainer(
                                                    width: raints.maxWidth * _animationController1.value,
                                                    color: Colors.white,
                                                  ),
                                                ),
                                            ],
                                          ),
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                                const SizedBox(height: 16.0),
                                Row(
                                  children: [
                                    (_pos!.picture?.baseUrl ?? '').isEmpty || (_pos.picture?.path ?? '').isEmpty
                                        ? Container(
                                            alignment: Alignment.center,
                                            height: 40.0,
                                            width: 40.0,
                                            padding: const EdgeInsets.all(4.0),
                                            decoration: BoxDecoration(
                                              color: Theme.of(context).focusColor,
                                              borderRadius: BorderRadius.circular(100.0),
                                            ),
                                            child: SharedImageProviderWidget(
                                              imageUrl: kEmptyPicture,
                                              color: Theme.of(context).colorScheme.secondary,
                                              width: 40.0,
                                              height: 40.0,
                                              fit: BoxFit.cover,
                                            ),
                                          )
                                        : SharedImageProviderWidget(
                                            imageUrl: '${_pos.picture!.baseUrl}/${_pos.picture!.path}',
                                            backgroundColor: Theme.of(context).focusColor,
                                            borderRadius: BorderRadius.circular(100.0),
                                            fit: BoxFit.cover,
                                            height: 40.0,
                                            width: 40.0,
                                          ),
                                    const SizedBox(width: 8.0),
                                    Expanded(
                                      child: Text(
                                        _pos.title ?? '',
                                        style: Theme.of(context).textTheme.bodyLarge!.copyWith(color: Colors.white),
                                      ),
                                    ),
                                    const SizedBox(width: 8.0),
                                    GestureDetector(
                                      onTap: () {
                                        _videoPlayerController
                                          ?..setVolume(0)
                                          ..pause();
                                        Navigator.pop(context);
                                      },
                                      child: Container(
                                        height: 26.0,
                                        width: 26.0,
                                        decoration: BoxDecoration(
                                          borderRadius: BorderRadius.circular(100.0),
                                          color: Colors.white.withOpacity(0.1),
                                        ),
                                        child: const Icon(
                                          CupertinoIcons.clear,
                                          color: Colors.white,
                                          size: 14.0,
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
    );
  }

  Widget _buildContainer({required double width, required Color color}) => Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(100.0),
          color: color,
        ),
        padding: EdgeInsets.zero,
        width: width,
        height: 3.0,
        child: const SizedBox(),
      );
}
