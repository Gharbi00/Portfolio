import 'package:flutter/widgets.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-corporate-notification.graphql.dart';
import 'package:flutter_loyalcraft_gql/schema.graphql.dart';
import 'package:loyalcraft/src/bloc/notification.dart';
import 'package:loyalcraft/src/data/consts.dart';
import 'package:loyalcraft/src/data/graphql_client.dart';
import 'package:loyalcraft/src/data/shared_preferences.dart';

class NotificationRepository {
  NotificationRepository(this._sGraphQLClient);
  final SGraphQLClient _sGraphQLClient;

  Future<Query$getCorporateNotificationsForUserWithLinkedAccountsPaginated$getCorporateNotificationsForUserWithLinkedAccountsPaginated?> getCorporateNotificationsForUserWithLinkedAccountsPaginated(
    Variables$Query$getCorporateNotificationsForUserWithLinkedAccountsPaginated variables,
  ) async {
    try {
      final result = await _sGraphQLClient.client.query$getCorporateNotificationsForUserWithLinkedAccountsPaginated(
        Options$Query$getCorporateNotificationsForUserWithLinkedAccountsPaginated(
          variables: variables,
        ),
      );
      return result.parsedData?.getCorporateNotificationsForUserWithLinkedAccountsPaginated ??
          Query$getCorporateNotificationsForUserWithLinkedAccountsPaginated$getCorporateNotificationsForUserWithLinkedAccountsPaginated(
            isLast: true,
            objects: [],
            count: 0,
          );
    } on Exception {
      return null;
    }
  }

  Future<Query$countUnseenCorporateNotificationsByTargetWithLinkedAccounts$countUnseenCorporateNotificationsByTargetWithLinkedAccounts> countUnseenCorporateNotificationsForUser(
    BuildContext context,
  ) async {
    try {
      final result = await _sGraphQLClient.client.query$countUnseenCorporateNotificationsByTargetWithLinkedAccounts(
        Options$Query$countUnseenCorporateNotificationsByTargetWithLinkedAccounts(
          variables: Variables$Query$countUnseenCorporateNotificationsByTargetWithLinkedAccounts(
            target: Input$TargetACIInput(
              pos: kPosID,
            ),
          ),
        ),
      );
      BlocProvider.of<NotificationCountCubit>(context).updateValue(result.parsedData?.countUnseenCorporateNotificationsByTargetWithLinkedAccounts.count ?? 0);
      return result.parsedData?.countUnseenCorporateNotificationsByTargetWithLinkedAccounts ??
          Query$countUnseenCorporateNotificationsByTargetWithLinkedAccounts$countUnseenCorporateNotificationsByTargetWithLinkedAccounts(count: 0);
    } on Exception {
      return Query$countUnseenCorporateNotificationsByTargetWithLinkedAccounts$countUnseenCorporateNotificationsByTargetWithLinkedAccounts(count: 0);
    }
  }

  Future<Mutation$markAllCorporateNotificationsAsSeenForUserWithLinkedAccounts$markAllCorporateNotificationsAsSeenForUserWithLinkedAccounts?>
      markAllCorporateNotificationsAsSeenForUserWithLinkedAccounts(
    Variables$Mutation$markAllCorporateNotificationsAsSeenForUserWithLinkedAccounts variables,
    BuildContext context,
  ) async {
    try {
      final result = await _sGraphQLClient.client.mutate$markAllCorporateNotificationsAsSeenForUserWithLinkedAccounts(
        Options$Mutation$markAllCorporateNotificationsAsSeenForUserWithLinkedAccounts(
          variables: variables,
        ),
      );
      BlocProvider.of<NotificationCountCubit>(context).updateValue(0);
      await addNotificationCountToSP(0);
      return result.parsedData?.markAllCorporateNotificationsAsSeenForUserWithLinkedAccounts;
    } on Exception {
      return null;
    }
  }
}
