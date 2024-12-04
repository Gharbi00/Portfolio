import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_diktup_utilities/extensions.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-quest-activity.graphql.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-quest-quest.graphql.dart';
import 'package:flutter_loyalcraft_gql/schema.graphql.dart';
import 'package:linear_progress_bar/linear_progress_bar.dart';
import 'package:loyalcraft/localizations_delegate/app_localizations.dart';
import 'package:loyalcraft/src/bloc/variable.dart';
import 'package:loyalcraft/src/data/consts.dart';
import 'package:video_player/video_player.dart';
import 'package:youtube_player_flutter/youtube_player_flutter.dart';

// ignore: must_be_immutable
class ActivityActionVideoWidget extends StatefulWidget {
  ActivityActionVideoWidget({
    Key? key,
    required this.isLoadingCubit,
    required this.questActivity,
    required this.valueChanged,
    required this.action,
    required this.video,
    required this.quest,
  }) : super(key: key);
  Query$getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated$getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated$objects quest;
  Query$getQuestActivitiesByQuest$getQuestActivitiesByQuest$activity$action$definition$video video;
  Query$getQuestActivitiesByQuest$getQuestActivitiesByQuest$activity$action action;
  Query$getQuestActivitiesByQuest$getQuestActivitiesByQuest questActivity;
  ValueChanged<Input$QuestActionActivityWatchedInput> valueChanged;
  VariableCubit<bool> isLoadingCubit;

  @override
  _ActivityActionVideoWidget createState() => _ActivityActionVideoWidget();
}

class _ActivityActionVideoWidget extends State<ActivityActionVideoWidget> {
  late YoutubePlayerController _youtubePlayerController;
  late VideoPlayerController _videoPlayerController;
  late VariableCubit _isPausePlayVideoShownCubit;
  late VariableCubit _isVideoInitializedCubit;
  late VariableCubit _isVideoPlayingCubit;
  late VariableCubit _watchingTimeCubit;

  bool _formHasError(int watchingTime, int minSeconds) => watchingTime < minSeconds;

  Future<void> _initState() async {
    _isPausePlayVideoShownCubit = VariableCubit(value: false);
    _isVideoInitializedCubit = VariableCubit(value: false);
    _isVideoPlayingCubit = VariableCubit(value: false);
    _watchingTimeCubit = VariableCubit(value: 0);
    if (widget.video.source == Enum$QuestActionDefinitionVideo.YOUTUBE) {
      _isVideoInitializedCubit = VariableCubit(value: true);
      _youtubePlayerController = YoutubePlayerController(
        initialVideoId: widget.video.link.removeNull().toYouTubeVideoId(),
        flags: const YoutubePlayerFlags(
          disableDragSeek: true,
          enableCaption: false,
          hideThumbnail: true,
          hideControls: true,
          forceHD: true,
        ),
      )..addListener(() {
          if (_youtubePlayerController.value.isPlaying == true) {
            if (_watchingTimeCubit.state < _youtubePlayerController.metadata.duration.inSeconds) {
              _watchingTimeCubit.updateValue(_youtubePlayerController.value.position.inSeconds);
            }
          }
        });
    } else {
      _videoPlayerController = VideoPlayerController.networkUrl(Uri.parse(widget.video.link.removeNull()))
        ..initialize().then((_) => _isVideoInitializedCubit.updateValue(true))
        ..play().then((_) => _isVideoPlayingCubit.updateValue(true))
        ..addListener(() {
          if (_videoPlayerController.value.isPlaying) {
            if (_watchingTimeCubit.state < _videoPlayerController.value.duration.inSeconds) {
              _watchingTimeCubit.updateValue(_videoPlayerController.value.position.inSeconds);
            }
          }
        });
    }
  }

  @override
  void dispose() {
    _isVideoInitializedCubit.close();
    _isPausePlayVideoShownCubit.close();
    _isVideoPlayingCubit.close();
    _watchingTimeCubit.close();
    if (widget.video.source == Enum$QuestActionDefinitionVideo.YOUTUBE) {
      _youtubePlayerController
        ..pause()
        ..dispose();
    } else {
      _videoPlayerController
        ..pause()
        ..dispose();
    }

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
    final totalSeconds = widget.video.minSeconds ?? 20;
    return MultiBlocProvider(
      providers: [
        BlocProvider(create: (context) => _isPausePlayVideoShownCubit),
        BlocProvider(create: (context) => _isVideoInitializedCubit),
        BlocProvider(create: (context) => _isVideoPlayingCubit),
        BlocProvider(create: (context) => _watchingTimeCubit),
      ],
      child: BlocBuilder<VariableCubit, dynamic>(
        bloc: _isVideoInitializedCubit,
        builder: (context, isVideoInitialized) => BlocBuilder<VariableCubit, dynamic>(
          bloc: _isVideoPlayingCubit,
          builder: (context, isVideoPlaying) => BlocBuilder<VariableCubit, dynamic>(
            bloc: _watchingTimeCubit,
            builder: (context, watchingTime) => BlocBuilder<VariableCubit, dynamic>(
              bloc: _isPausePlayVideoShownCubit,
              builder: (context, isPausePlayVideoShown) => Container(
                width: double.infinity,
                height: kAppSize.width * 1.6,
                decoration: BoxDecoration(
                  color: Colors.black,
                  borderRadius: BorderRadius.circular(8.0),
                ),
                child: isVideoInitialized == false
                    ? const SizedBox()
                    : Stack(
                        clipBehavior: Clip.none,
                        children: [
                          GestureDetector(
                            onTap: () {
                              _isPausePlayVideoShownCubit.updateValue(true);
                              if (widget.video.source == Enum$QuestActionDefinitionVideo.YOUTUBE) {
                                isVideoPlaying ? _youtubePlayerController.pause() : _youtubePlayerController.play();
                              } else {
                                isVideoPlaying ? _videoPlayerController.pause() : _videoPlayerController.play();
                              }
                              _isVideoPlayingCubit.updateValue(!isVideoPlaying);

                              Future.delayed(const Duration(seconds: 3), () => _isPausePlayVideoShownCubit.updateValue(false));
                            },
                            child: Center(
                              child: widget.video.source == Enum$QuestActionDefinitionVideo.YOUTUBE
                                  ? YoutubePlayerBuilder(
                                      builder: (context, widget) => YoutubePlayer(
                                        controller: _youtubePlayerController,
                                        bottomActions: const [],
                                        onEnded: (value) {},
                                        onReady: () {
                                          _isVideoInitializedCubit.updateValue(true);
                                          _isVideoPlayingCubit.updateValue(true);
                                        },
                                        showVideoProgressIndicator: true,
                                        topActions: const [],
                                      ),
                                      player: YoutubePlayer(
                                        controller: _youtubePlayerController,
                                        bottomActions: const [],
                                        thumbnail: const SizedBox(),
                                        onEnded: (value) {},
                                        onReady: () {
                                          _isVideoInitializedCubit.updateValue(true);
                                          _isVideoPlayingCubit.updateValue(true);
                                        },
                                        showVideoProgressIndicator: true,
                                        topActions: const [],
                                      ),
                                    )
                                  : AspectRatio(
                                      aspectRatio: _videoPlayerController.value.aspectRatio,
                                      child: VideoPlayer(
                                        _videoPlayerController,
                                      ),
                                    ),
                            ),
                          ),
                          if (isPausePlayVideoShown)
                            Center(
                              child: AnimatedContainer(
                                duration: const Duration(milliseconds: 500),
                                curve: Curves.bounceInOut,
                                child: Container(
                                  height: 50.0,
                                  width: 50.0,
                                  decoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(100.0),
                                    color: Colors.grey[900],
                                  ),
                                  child: Icon(
                                    isVideoPlaying ? CupertinoIcons.pause : CupertinoIcons.play_arrow,
                                    color: Colors.white,
                                    size: 20.0,
                                  ),
                                ),
                              ),
                            ),
                          Align(
                            alignment: Alignment.bottomCenter,
                            child: Padding(
                              padding: const EdgeInsets.all(16.0),
                              child: Column(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Row(
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.all(4.0),
                                        decoration: BoxDecoration(
                                          borderRadius: BorderRadius.circular(100.0),
                                          color: Colors.grey[900],
                                        ),
                                        child: Text(
                                          '$watchingTime',
                                          style: Theme.of(context).textTheme.bodyMedium!.copyWith(
                                                color: Colors.white,
                                              ),
                                        ),
                                      ),
                                      const SizedBox(width: 8.0),
                                      Expanded(
                                        child: ClipRRect(
                                          borderRadius: BorderRadius.circular(100.0),
                                          child: LinearProgressBar(
                                            currentStep: watchingTime > totalSeconds ? totalSeconds : watchingTime,
                                            progressType: LinearProgressBar.progressTypeLinear,
                                            maxSteps: totalSeconds,
                                            backgroundColor: Colors.grey[400],
                                            progressColor: Colors.grey[900],
                                          ),
                                        ),
                                      ),
                                      const SizedBox(width: 8.0),
                                      Container(
                                        padding: const EdgeInsets.all(4.0),
                                        decoration: BoxDecoration(
                                          borderRadius: BorderRadius.circular(100.0),
                                          color: Colors.grey[900],
                                        ),
                                        child: Text(
                                          '$totalSeconds ${translate(context, 'sec')}',
                                          style: Theme.of(context).textTheme.bodyMedium!.copyWith(
                                                color: Colors.white,
                                              ),
                                        ),
                                      ),
                                    ],
                                  ),
                                  if ((widget.quest.isAccountLinked ?? false) && totalSeconds > watchingTime)
                                    Align(
                                      alignment: Alignment.centerLeft,
                                      child: Container(
                                        padding: const EdgeInsets.symmetric(vertical: 4.0, horizontal: 8.0),
                                        margin: const EdgeInsets.only(top: 16.0),
                                        decoration: BoxDecoration(
                                          borderRadius: BorderRadius.circular(100.0),
                                          color: Colors.grey[900],
                                        ),
                                        child: RichText(
                                          text: TextSpan(
                                            children: [
                                              TextSpan(
                                                text: translate(context, 'rewardIn'),
                                                style: Theme.of(context).textTheme.bodyMedium!.copyWith(
                                                      color: Colors.white,
                                                    ),
                                              ),
                                              TextSpan(
                                                text: ' ${totalSeconds - watchingTime} ${translate(context, 'sec')}',
                                                style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                                                      color: Colors.white,
                                                    ),
                                              ),
                                            ],
                                          ),
                                        ),
                                      ),
                                    ),
                                  if (widget.quest.isAccountLinked ?? false) const SizedBox(height: 16.0),
                                  if ((widget.quest.isAccountLinked ?? false) && _formHasError(watchingTime, totalSeconds) == false)
                                    TextButton(
                                      style: TextButton.styleFrom(
                                        backgroundColor: Colors.grey[900],
                                        minimumSize: const Size.fromHeight(40.0),
                                        shape: RoundedRectangleBorder(
                                          borderRadius: BorderRadius.circular(8.0),
                                        ),
                                      ),
                                      onPressed: () {
                                        widget.valueChanged(
                                          Input$QuestActionActivityWatchedInput(
                                            activity: widget.questActivity.id,
                                            watched: watchingTime,
                                          ),
                                        );
                                      },
                                      child: Text(
                                        translate(context, 'done'),
                                        textAlign: TextAlign.center,
                                        style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                                              color: Colors.white,
                                            ),
                                      ),
                                    ),
                                ],
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
    );
  }
}
