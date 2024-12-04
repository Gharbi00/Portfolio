import 'package:flutter_loyalcraft_gql/graphql/corporate-internal-product.graphql.dart';
import 'package:loyalcraft/src/data/graphql_client.dart';

class CorporateInternalProductRepository {
  CorporateInternalProductRepository(this._sGraphQLClient);
  final SGraphQLClient _sGraphQLClient;

  Future<Query$getSimpleProductsWithRatingsWithFavoriteStatusWithFilter$getSimpleProductsWithRatingsWithFavoriteStatusWithFilter?> getSimpleProductsWithRatingsWithFavoriteStatusWithFilter(
    Variables$Query$getSimpleProductsWithRatingsWithFavoriteStatusWithFilter variables,
  ) async {
    try {
      final result = await _sGraphQLClient.client.query$getSimpleProductsWithRatingsWithFavoriteStatusWithFilter(
        Options$Query$getSimpleProductsWithRatingsWithFavoriteStatusWithFilter(
          variables: variables,
        ),
      );
      return result.parsedData?.getSimpleProductsWithRatingsWithFavoriteStatusWithFilter ??
          Query$getSimpleProductsWithRatingsWithFavoriteStatusWithFilter$getSimpleProductsWithRatingsWithFavoriteStatusWithFilter(
            isLast: true,
            objects: [],
            count: 0,
          );
    } on Exception {
      return Query$getSimpleProductsWithRatingsWithFavoriteStatusWithFilter$getSimpleProductsWithRatingsWithFavoriteStatusWithFilter(
        isLast: true,
        objects: [],
        count: 0,
      );
    }
  }
}
