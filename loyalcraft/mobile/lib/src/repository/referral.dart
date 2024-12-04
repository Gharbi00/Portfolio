import 'package:flutter_loyalcraft_gql/graphql/gamification-referral.graphql.dart';
import 'package:loyalcraft/src/data/graphql_client.dart';

class ReferralRepository {
  ReferralRepository(this._sGraphQLClient);
  final SGraphQLClient _sGraphQLClient;

  Future<Query$getLastReferral$getLastReferral?> getLastReferral(
    Variables$Query$getLastReferral variables,
  ) async {
    try {
      final result = await _sGraphQLClient.client.query$getLastReferral(
        Options$Query$getLastReferral(
          variables: variables,
        ),
      );
      return result.parsedData?.getLastReferral;
    } on Exception {
      return null;
    }
  }
}
