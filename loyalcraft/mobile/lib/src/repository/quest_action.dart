import 'package:flutter_loyalcraft_gql/graphql/gamification-quest-action.graphql.dart';
import 'package:loyalcraft/src/data/graphql_client.dart';

class QuestActionRepository {
  QuestActionRepository(this._sGraphQLClient);
  final SGraphQLClient _sGraphQLClient;

  Future<Mutation$performNonPredefinedQuestByUser$performNonPredefinedQuestByUser?> performNonPredefinedQuestByUser(
    Variables$Mutation$performNonPredefinedQuestByUser variables,
  ) async {
    try {
      final result = await _sGraphQLClient.client.mutate$performNonPredefinedQuestByUser(
        Options$Mutation$performNonPredefinedQuestByUser(
          variables: variables,
        ),
      );

      return result.parsedData?.performNonPredefinedQuestByUser;
    } on Exception {
      return null;
    }
  }
}
