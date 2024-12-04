import 'dart:async';

import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-quest-quest.graphql.dart';
import 'package:loyalcraft/src/data/shared_preferences.dart';
import 'package:loyalcraft/src/repository/quest.dart';

class GetQuestsByTargetAndUserAudienceWithLinkedAccountsPaginatedCubit
    extends Cubit<Query$getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated$getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated?> {
  GetQuestsByTargetAndUserAudienceWithLinkedAccountsPaginatedCubit(this._questRepository) : super(null);
  final QuestRepository _questRepository;

  Future<void> getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated({
    required Variables$Query$getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated variables,
    required bool addToSP,
  }) async {
    final oldData = await getQuestsFromSP();
    if (oldData != null && oldData.objects.isNotEmpty && addToSP) {
      emit(oldData);
    }
    final data = await _questRepository.getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated(variables);
    if (addToSP) {
      if (oldData != null && oldData.objects.isNotEmpty && data != null && data.objects.isNotEmpty) {
        emit(data);
      }
      if (oldData == null && data != null && data.objects.isNotEmpty) {
        emit(data);
      }
    } else {
      emit(data);
    }
    if (data != null && data.objects.isNotEmpty && addToSP) {
      addQuestsToSP(data);
    }
  }

  Future<void> addObjects(
    Variables$Query$getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated variables,
  ) async {
    final oldData = state;
    final newData = await _questRepository.getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated(variables);
    emit(newData!.copyWith(objects: [...oldData!.objects, ...newData.objects]));
  }

  void addReadyObjects(
    Query$getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated$getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated? newData,
  ) {
    final oldData = state;
    emit(newData!.copyWith(objects: [...oldData!.objects, ...newData.objects]));
  }

  Future<void> setNull() async {
    emit(null);
  }
}

class GetComingSoonQuestsByTargetAndUserAudienceWithLinkedAccountsPaginatedCubit
    extends Cubit<Query$getComingSoonQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated$getComingSoonQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated?> {
  GetComingSoonQuestsByTargetAndUserAudienceWithLinkedAccountsPaginatedCubit(
    this._questRepository,
  ) : super(null);

  final QuestRepository _questRepository;

  Future<void> getComingSoonQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated(
    Variables$Query$getComingSoonQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated variables,
  ) async {
    final data = await _questRepository.getComingSoonQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated(variables);
    emit(data);
  }

  Future<void> addObjects(
    Variables$Query$getComingSoonQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated variables,
  ) async {
    final oldData = state;
    final newData = await _questRepository.getComingSoonQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated(variables);
    emit(newData!.copyWith(objects: [...oldData!.objects, ...newData.objects]));
  }

  void addReadyObjects(
    Query$getComingSoonQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated$getComingSoonQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated? newData,
  ) {
    final oldData = state;
    emit(newData!.copyWith(objects: [...oldData!.objects, ...newData.objects]));
  }

  Future<void> setNull() async {
    emit(null);
  }
}
