import 'package:flutter_loyalcraft_gql/graphql/bitaka.graphql.dart';
import 'package:loyalcraft/src/data/graphql_client.dart';

class BitakaRepository {
  BitakaRepository(this._sGraphQLClient);
  final SGraphQLClient _sGraphQLClient;

  Future<Query$pushRechargeToUser$pushRechargeToUser?> pushRechargeToUser(
    Variables$Query$pushRechargeToUser variables,
  ) async {
    try {
      final result = await _sGraphQLClient.client.query$pushRechargeToUser(
        Options$Query$pushRechargeToUser(
          variables: variables,
        ),
      );
      return result.parsedData?.pushRechargeToUser;
    } on Exception {
      return null;
    }
  }
}
