import 'package:flutter_loyalcraft_gql/graphql/gamification-quest-quest.graphql.dart';
import 'package:loyalcraft/src/data/graphql_client.dart';

class QuestRepository {
  QuestRepository(this._sGraphQLClient);
  final SGraphQLClient _sGraphQLClient;

  Future<Query$getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated$getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated?> getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated(
    Variables$Query$getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated variables,
  ) async {
    try {
      final result = await _sGraphQLClient.client.query$getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated(
        Options$Query$getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated(
          variables: variables,
        ),
      );
      return result.parsedData?.getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated ??
          Query$getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated$getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated(
            isLast: true,
            objects: [],
            count: 0,
          );
    } on Exception {
      return null;
    }
  }

  Future<Query$getComingSoonQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated$getComingSoonQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated?>
      getComingSoonQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated(
    Variables$Query$getComingSoonQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated variables,
  ) async {
    try {
      final result = await _sGraphQLClient.client.query$getComingSoonQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated(
        Options$Query$getComingSoonQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated(
          variables: variables,
        ),
      );
      return result.parsedData?.getComingSoonQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated ??
          Query$getComingSoonQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated$getComingSoonQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated(
            isLast: true,
            objects: [],
            count: 0,
          );
    } on Exception {
      return null;
    }
  }

  Future<Query$quest$quest?> quest(
    Variables$Query$quest variables,
  ) async {
    try {
      final result = await _sGraphQLClient.client.query$quest(
        Options$Query$quest(
          variables: variables,
        ),
      );
      return result.parsedData?.quest;
    } on Exception {
      return null;
    }
  }
}
