import 'dart:async';

import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-corporate-notification.graphql.dart';
import 'package:loyalcraft/src/data/shared_preferences.dart';
import 'package:loyalcraft/src/repository/notification.dart';

class GetCorporateNotificationsForUserWithLinkedAccountsPaginatedCubit
    extends Cubit<Query$getCorporateNotificationsForUserWithLinkedAccountsPaginated$getCorporateNotificationsForUserWithLinkedAccountsPaginated?> {
  GetCorporateNotificationsForUserWithLinkedAccountsPaginatedCubit(this._notificationRepository) : super(null);
  final NotificationRepository _notificationRepository;

  Future<void> getCorporateNotificationsForUserPaginated(
    Variables$Query$getCorporateNotificationsForUserWithLinkedAccountsPaginated variables,
  ) async {
    final data = await _notificationRepository.getCorporateNotificationsForUserWithLinkedAccountsPaginated(variables);
    emit(data);
  }

  Future<void> addObjects(
    Variables$Query$getCorporateNotificationsForUserWithLinkedAccountsPaginated variables,
  ) async {
    final oldData = state;
    final newData = await _notificationRepository.getCorporateNotificationsForUserWithLinkedAccountsPaginated(variables);
    emit(newData!.copyWith(objects: [...oldData!.objects, ...newData.objects]));
  }

  void addReadyObjects(
    Query$getCorporateNotificationsForUserWithLinkedAccountsPaginated$getCorporateNotificationsForUserWithLinkedAccountsPaginated? newData,
  ) {
    final oldData = state;
    emit(newData!.copyWith(objects: [...oldData!.objects, ...newData.objects]));
  }
}

class NotificationCountCubit extends Cubit<int> {
  NotificationCountCubit({required int value}) : super(value);

  Future<void> updateValue(int value) async {
    emit(value);
    await addNotificationCountToSP(value);
  }
}
