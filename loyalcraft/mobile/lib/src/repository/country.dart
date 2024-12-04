import 'package:flutter_loyalcraft_gql/graphql/country.graphql.dart';
import 'package:loyalcraft/src/data/graphql_client.dart';

class CountryRepository {
  CountryRepository(this._sGraphQLClient);
  final SGraphQLClient _sGraphQLClient;

  Future<List<Query$getCountries$getCountries>?> getCountries() async {
    try {
      final result = await _sGraphQLClient.client.query$getCountries();

      return result.parsedData?.getCountries ?? [];
    } on Exception {
      return null;
    }
  }
}
