import 'package:flutter_loyalcraft_gql/graphql/corporate-partnership-network.graphql.dart';
import 'package:loyalcraft/src/data/graphql_client.dart';

class PartnershipNetworkRepository {
  PartnershipNetworkRepository(this._sGraphQLClient);
  final SGraphQLClient _sGraphQLClient;

  Future<Query$getPartnershipNetworksByTargetAndPartnershipPagination$getPartnershipNetworksByTargetAndPartnershipPagination?> getPartnershipNetworksByTargetAndPartnershipPagination(
    Variables$Query$getPartnershipNetworksByTargetAndPartnershipPagination variables,
  ) async {
    try {
      final result = await _sGraphQLClient.client.query$getPartnershipNetworksByTargetAndPartnershipPagination(
        Options$Query$getPartnershipNetworksByTargetAndPartnershipPagination(
          variables: variables,
        ),
      );
      return result.parsedData?.getPartnershipNetworksByTargetAndPartnershipPagination ??
          Query$getPartnershipNetworksByTargetAndPartnershipPagination$getPartnershipNetworksByTargetAndPartnershipPagination(
            isLast: true,
            objects: [],
            count: 0,
          );
    } on Exception {
      return null;
    }
  }
}
