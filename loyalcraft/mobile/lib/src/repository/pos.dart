import 'package:flutter_loyalcraft_gql/graphql/point-of-sale.graphql.dart';
import 'package:loyalcraft/src/data/graphql_client.dart';

class PosRepository {
  PosRepository(this._sGraphQLClient);
  final SGraphQLClient _sGraphQLClient;

  Future<Query$pointOfSale$pointOfSale?> pointOfSale(
    Variables$Query$pointOfSale variables,
  ) async {
    try {
      final result = await _sGraphQLClient.client.query$pointOfSale(
        Options$Query$pointOfSale(
          variables: variables,
        ),
      );
      return result.parsedData?.pointOfSale;
    } on Exception {
      return null;
    }
  }
}
