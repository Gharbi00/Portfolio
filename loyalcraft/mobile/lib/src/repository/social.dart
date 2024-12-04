import 'package:flutter_loyalcraft_gql/graphql/socials.graphql.dart';
import 'package:loyalcraft/src/data/graphql_client.dart';

class SocialRepository {
  SocialRepository(this._sGraphQLClient);
  final SGraphQLClient _sGraphQLClient;

  Future<Query$findSocialsPagination$findSocialsPagination?> findSocialsPagination(
    Variables$Query$findSocialsPagination variables,
  ) async {
    try {
      final result = await _sGraphQLClient.client.query$findSocialsPagination(
        Options$Query$findSocialsPagination(
          variables: variables,
        ),
      );
      return result.parsedData?.findSocialsPagination ??
          Query$findSocialsPagination$findSocialsPagination(
            objects: [],
            count: 0,
            isLast: true,
          );
    } on Exception {
      return null;
    }
  }
}
