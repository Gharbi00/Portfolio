import 'package:flutter_loyalcraft_gql/graphql/forms-question.graphql.dart';
import 'package:loyalcraft/src/data/graphql_client.dart';

class QuestionRepository {
  QuestionRepository(this._sGraphQLClient);
  final SGraphQLClient _sGraphQLClient;

  Future<Query$getQuestionsbyFormWithResponsesStatsPaginated$getQuestionsbyFormWithResponsesStatsPaginated?> getQuestionsbyFormWithResponsesStatsPaginated(
    Variables$Query$getQuestionsbyFormWithResponsesStatsPaginated variables,
  ) async {
    try {
      final result = await _sGraphQLClient.client.query$getQuestionsbyFormWithResponsesStatsPaginated(
        Options$Query$getQuestionsbyFormWithResponsesStatsPaginated(
          variables: variables,
        ),
      );
      return result.parsedData?.getQuestionsbyFormWithResponsesStatsPaginated;
    } on Exception {
      return null;
    }
  }
}
