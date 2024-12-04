import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-quest-activity.graphql.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-quest-quest.graphql.dart';
import 'package:linear_progress_bar/linear_progress_bar.dart';
import 'package:loyalcraft/localizations_delegate/app_localizations.dart';
import 'package:loyalcraft/src/bloc/variable.dart';
import 'package:loyalcraft/src/data/consts.dart';
import 'package:webview_flutter/webview_flutter.dart';

// ignore: must_be_immutable
class ActivityActionLeadWidget extends StatefulWidget {
  ActivityActionLeadWidget({
    Key? key,
    required this.questActivity,
    required this.valueChanged,
    required this.isLoadingCubit,
    required this.lead,
    required this.quest,
  }) : super(key: key);
  Query$getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated$getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated$objects quest;
  Query$getQuestActivitiesByQuest$getQuestActivitiesByQuest$activity$action$definition$lead lead;
  Query$getQuestActivitiesByQuest$getQuestActivitiesByQuest questActivity;
  ValueChanged<bool> valueChanged;
  VariableCubit isLoadingCubit;
  @override
  _ActivityActionLeadWidget createState() => _ActivityActionLeadWidget();
}

class _ActivityActionLeadWidget extends State<ActivityActionLeadWidget> {
  late WebViewController _webViewController;
  late VariableCubit<int> _secondsCubit;
  late VariableCubit<Timer?> _timerCubit;
  final int _totalSeconds = 20;

  bool _formHasError(int seconds) => seconds < _totalSeconds;

  String _getImageQuest() {
    if ((widget.quest.media?.pictures ?? []).isNotEmpty) {
      return '${widget.quest.media!.pictures!.first.baseUrl}/${widget.quest.media!.pictures!.first.path}';
    }
    return '';
  }

  String removeProtocolAndPrefix(String url) {
    // Regular expression to match http://, https://, or www. and remove them.
    final regex = RegExp(r'^(https?:\/\/|www\.)+');
    return url.replaceAll(regex, '');
  }

  Future<void> _initState() async {
    _secondsCubit = VariableCubit(value: 0);
    _timerCubit = VariableCubit();
    _webViewController = WebViewController()
      ..loadRequest(Uri.parse('https://${removeProtocolAndPrefix(widget.lead.url ?? '')}')).then((_) {
        final periodicTimer = Timer.periodic(
          const Duration(seconds: 1),
          (timer) {
            if (_secondsCubit.state! < _totalSeconds) {
              _secondsCubit.updateValue(_secondsCubit.state! + 1);
            } else {}
          },
        );
        _timerCubit.updateValue(periodicTimer);
      });
  }

  @override
  void dispose() {
    _timerCubit.state?.cancel();
    _secondsCubit.close();
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
          BlocProvider(create: (context) => _secondsCubit),
          BlocProvider(create: (context) => _timerCubit),
        ],
        child: BlocBuilder<VariableCubit, dynamic>(
          bloc: _timerCubit,
          builder: (context, timer) => BlocBuilder<VariableCubit, dynamic>(
            bloc: _secondsCubit,
            builder: (context, seconds) => Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // widget.lead.image.removeNull().isNotEmpty
                //     ? SharedImageProviderWidget(
                //         imageUrl: widget.lead.image.removeNull(),
                //         backgroundColor: Theme.of(context).focusColor,
                //         borderRadius: BorderRadius.circular(100.0),
                //         fit: BoxFit.cover,
                //         height: 120.0,
                //         width: 120.0,
                //       )
                //     : _getImageQuest().isNotEmpty
                //         ? SharedImageProviderWidget(
                //             borderRadius: BorderRadius.circular(100.0),
                //             color: Theme.of(context).colorScheme.secondary,
                //             imageUrl: _getImageQuest(),
                //             height: 120.0,
                //             width: 120.0,
                //             fit: BoxFit.cover,
                //           )
                //         : Container(
                //             height: 120.0,
                //             width: 120.0,
                //             padding: const EdgeInsets.all(8.0),
                //             decoration: BoxDecoration(
                //               color: Theme.of(context).focusColor,
                //               borderRadius: BorderRadius.circular(100.0),
                //             ),
                //             child: SharedImageProviderWidget(
                //               imageUrl: kEmptyPicture,
                //               color: Theme.of(context).colorScheme.secondary,
                //               fit: BoxFit.cover,
                //               width: 60.0,
                //               height: 60.0,
                //             ),
                //           ),
                Container(
                  width: double.infinity,
                  height: kAppSize.width * 1.6,
                  decoration: BoxDecoration(
                    color: Colors.black,
                    borderRadius: BorderRadius.circular(8.0),
                  ),
                  child: Stack(
                    fit: StackFit.expand,
                    clipBehavior: Clip.none,
                    children: [
                      ClipRRect(
                        borderRadius: BorderRadius.circular(8.0),
                        child: WebViewWidget(
                          controller: _webViewController,
                        ),
                      ),
                      Align(
                        alignment: Alignment.bottomCenter,
                        child: Padding(
                          padding: const EdgeInsets.all(
                            16.0,
                          ),
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
                                      '$seconds',
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
                                        progressType: LinearProgressBar.progressTypeLinear,
                                        backgroundColor: Colors.grey[400],
                                        progressColor: Colors.grey[900],
                                        maxSteps: _totalSeconds,
                                        currentStep: seconds,
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
                                      '$_totalSeconds ${translate(context, 'sec')}',
                                      style: Theme.of(context).textTheme.bodyMedium!.copyWith(
                                            color: Colors.white,
                                          ),
                                    ),
                                  ),
                                ],
                              ),
                              if ((widget.quest.isAccountLinked ?? false) && _totalSeconds > seconds)
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
                                            text: ' ${_totalSeconds - seconds} ${translate(context, 'sec')}',
                                            style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                                                  color: Colors.white,
                                                ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                ),
                              if ((widget.quest.isAccountLinked ?? false) && _formHasError(_secondsCubit.state!) == false) const SizedBox(height: 16.0),
                              if ((widget.quest.isAccountLinked ?? false) && _formHasError(_secondsCubit.state!) == false)
                                TextButton(
                                  style: TextButton.styleFrom(
                                    backgroundColor: Colors.grey[900],
                                    minimumSize: const Size.fromHeight(40.0),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(8.0),
                                    ),
                                  ),
                                  onPressed: () {
                                    widget.valueChanged(true);
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
              ],
            ),
          ),
        ),
      );
}
