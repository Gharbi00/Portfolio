import 'package:flutter_loyalcraft_gql/graphql/gamification-quest-activity.graphql.dart';
import 'package:loyalcraft/src/data/graphql_client.dart';

class QuestActivityRepository {
  QuestActivityRepository(this._sGraphQLClient);
  final SGraphQLClient _sGraphQLClient;

  Future<List<Query$getQuestActivitiesByQuest$getQuestActivitiesByQuest>?> getQuestActivitiesByQuest(
    Variables$Query$getQuestActivitiesByQuest variables,
  ) async {
    try {
      final result = await _sGraphQLClient.client.query$getQuestActivitiesByQuest(
        Options$Query$getQuestActivitiesByQuest(
          variables: variables,
        ),
      );
      return result.parsedData?.getQuestActivitiesByQuest ?? [];
    } on Exception {
      return null;
    }
  }
}
