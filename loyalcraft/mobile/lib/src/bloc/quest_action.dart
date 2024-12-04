import 'dart:async';

import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-quest-action.graphql.dart';
import 'package:loyalcraft/src/repository/quest_action.dart';

class PerformNonPredefinedQuestByUserCubit extends Cubit<Mutation$performNonPredefinedQuestByUser$performNonPredefinedQuestByUser?> {
  PerformNonPredefinedQuestByUserCubit(this._questActionRepository) : super(null);
  final QuestActionRepository _questActionRepository;

  Future<void> performNonPredefinedQuestByUser(Variables$Mutation$performNonPredefinedQuestByUser variables) async {
    final data = await _questActionRepository.performNonPredefinedQuestByUser(variables);
    emit(data);
  }
}
