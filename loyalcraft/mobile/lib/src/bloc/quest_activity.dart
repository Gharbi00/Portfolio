import 'dart:async';

import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-quest-activity.graphql.dart';
import 'package:loyalcraft/src/repository/quest_activity.dart';

class GetQuestActivitiesByQuestCubit extends Cubit<List<Query$getQuestActivitiesByQuest$getQuestActivitiesByQuest>?> {
  GetQuestActivitiesByQuestCubit(this._questActivityRepository) : super(null);
  final QuestActivityRepository _questActivityRepository;

  Future<void> getQuestActivitiesByQuest(Variables$Query$getQuestActivitiesByQuest variables) async {
    final data = await _questActivityRepository.getQuestActivitiesByQuest(variables);
    emit(data);
  }
}
