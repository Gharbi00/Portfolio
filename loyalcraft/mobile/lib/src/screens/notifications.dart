import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-corporate-notification.graphql.dart';
import 'package:flutter_loyalcraft_gql/schema.graphql.dart';
import 'package:loyalcraft/localizations_delegate/app_localizations.dart';
import 'package:loyalcraft/src/bloc/locale.dart';
import 'package:loyalcraft/src/bloc/notification.dart';
import 'package:loyalcraft/src/bloc/variable.dart';
import 'package:loyalcraft/src/data/consts.dart';
import 'package:loyalcraft/src/data/graphql_client.dart';
import 'package:loyalcraft/src/repository/notification.dart';
import 'package:loyalcraft/src/widgets/empty.dart';
import 'package:loyalcraft/src/widgets/notification_item.dart';
import 'package:loyalcraft/src/widgets/shimmers.dart';

// ignore: must_be_immutable
class NotificationsWidget extends StatefulWidget {
  const NotificationsWidget({
    Key? key,
  }) : super(key: key);
  @override
  _NotificationsWidget createState() => _NotificationsWidget();
}

class _NotificationsWidget extends State<NotificationsWidget> with TickerProviderStateMixin {
  _NotificationsWidget() {
    _scrollController.addListener(() async {
      var isEnd = (_scrollController.offset == _scrollController.position.maxScrollExtent);

      if (isEnd) {
        if (_getCorporateNotificationsForUserWithLinkedAccountsPaginatedCubit.state?.isLast == false) {
          final newData = await _notificationRepository.getCorporateNotificationsForUserWithLinkedAccountsPaginated(
            Variables$Query$getCorporateNotificationsForUserWithLinkedAccountsPaginated(
              target: Input$TargetACIInput(
                pos: kPosID,
              ),
              pagination: Input$PaginationInput(
                limit: kPaginationLimit,
                page: _pageCubit.state! + 1,
              ),
            ),
          );
          if ((newData?.objects ?? []).isNotEmpty) {
            _getCorporateNotificationsForUserWithLinkedAccountsPaginatedCubit.addReadyObjects(newData);
            _pageCubit.updateValue(_pageCubit.state! + 1);
          }
        }
      }
    });
  }
  late GetCorporateNotificationsForUserWithLinkedAccountsPaginatedCubit _getCorporateNotificationsForUserWithLinkedAccountsPaginatedCubit;
  final ScrollController _scrollController = ScrollController();
  final SGraphQLClient _sGraphQLClient = SGraphQLClient();
  late NotificationRepository _notificationRepository;
  late VariableCubit<bool> _isLoadingCubit;
  late VariableCubit<int> _pageCubit;

  Future<void> _initState() async {
    _notificationRepository = NotificationRepository(_sGraphQLClient);
    _getCorporateNotificationsForUserWithLinkedAccountsPaginatedCubit = GetCorporateNotificationsForUserWithLinkedAccountsPaginatedCubit(
      _notificationRepository,
    );
    _isLoadingCubit = VariableCubit(value: false);
    _pageCubit = VariableCubit(value: 0);
    _notificationRepository.markAllCorporateNotificationsAsSeenForUserWithLinkedAccounts(
      Variables$Mutation$markAllCorporateNotificationsAsSeenForUserWithLinkedAccounts(
        target: Input$TargetACIInput(
          pos: kPosID,
        ),
      ),
      context,
    );

    _getCorporateNotificationsForUserWithLinkedAccountsPaginatedCubit.getCorporateNotificationsForUserPaginated(
      Variables$Query$getCorporateNotificationsForUserWithLinkedAccountsPaginated(
        target: Input$TargetACIInput(
          pos: kPosID,
        ),
        pagination: Input$PaginationInput(
          limit: kPaginationLimit,
          page: _pageCubit.state,
        ),
      ),
    );
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

    return MultiBlocProvider(
      providers: [
        BlocProvider(create: (context) => _getCorporateNotificationsForUserWithLinkedAccountsPaginatedCubit),
        BlocProvider(create: (context) => _isLoadingCubit),
        BlocProvider(create: (context) => _pageCubit),
      ],
      child: BlocBuilder<GetCorporateNotificationsForUserWithLinkedAccountsPaginatedCubit,
          Query$getCorporateNotificationsForUserWithLinkedAccountsPaginated$getCorporateNotificationsForUserWithLinkedAccountsPaginated?>(
        bloc: _getCorporateNotificationsForUserWithLinkedAccountsPaginatedCubit,
        builder: (context, getCorporateNotificationsForUserWithLinkedAccountsPaginated) => BlocBuilder<VariableCubit, dynamic>(
          bloc: _pageCubit,
          builder: (context, page) => Scaffold(
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
                    child: Text(
                      translate(context, 'notifications'),
                      style: Theme.of(context).textTheme.headlineSmall,
                    ),
                  ),
                ],
              ),
            ),
            body: SafeArea(
              right: false,
              left: false,
              top: false,
              child: getCorporateNotificationsForUserWithLinkedAccountsPaginated == null
                  ? ListViewShimmer(padding: const EdgeInsets.all(16.0))
                  : getCorporateNotificationsForUserWithLinkedAccountsPaginated.objects.isEmpty
                      ? EmptyWidget(
                          description: translate(context, 'notificationsEmptyDescription'),
                          title: translate(context, 'notificationsEmptyTitle'),
                          iconData: CupertinoIcons.bell_fill,
                          padding: const EdgeInsets.all(16.0),
                        )
                      : ListView.separated(
                          itemBuilder: (context, index) => NotificationItemWidget(
                            notification: getCorporateNotificationsForUserWithLinkedAccountsPaginated.objects[index],
                            locale: _locale,
                          ),
                          itemCount: getCorporateNotificationsForUserWithLinkedAccountsPaginated.objects.length,
                          separatorBuilder: (context, index) => const SizedBox(height: 16.0),
                          controller: _scrollController,
                          padding: EdgeInsets.zero,
                          shrinkWrap: true,
                          primary: false,
                        ),
            ),
          ),
        ),
      ),
    );
  }
}
