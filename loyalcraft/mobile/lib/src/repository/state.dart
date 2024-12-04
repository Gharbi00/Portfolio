import 'package:flutter_loyalcraft_gql/graphql/state.graphql.dart';
import 'package:loyalcraft/src/data/graphql_client.dart';

class StateRepository {
  StateRepository(this._sGraphQLClient);
  final SGraphQLClient _sGraphQLClient;

  Future<Query$findStatesByCountryPagination$findStatesByCountryPagination?> findStatesByCountryPagination(
    Options$Query$findStatesByCountryPagination variables,
  ) async {
    try {
      final result = await _sGraphQLClient.client.query$findStatesByCountryPagination(variables);
      return result.parsedData?.findStatesByCountryPagination ??
          Query$findStatesByCountryPagination$findStatesByCountryPagination(
            isLast: true,
            objects: [],
            count: 0,
          );
    } on Exception {
      return null;
    }
  }
}
