import 'package:flutter_loyalcraft_gql/graphql/gamification-wallet-transaction.graphql.dart';
import 'package:loyalcraft/src/data/graphql_client.dart';

class WalletTransactionRepository {
  WalletTransactionRepository(this._sGraphQLClient);
  final SGraphQLClient _sGraphQLClient;

  Future<Query$getWalletTransactionsByAffectedPaginated$getWalletTransactionsByAffectedPaginated?> getWalletTransactionsByAffectedPaginated(
    Variables$Query$getWalletTransactionsByAffectedPaginated variables,
  ) async {
    try {
      final result = await _sGraphQLClient.client.query$getWalletTransactionsByAffectedPaginated(
        Options$Query$getWalletTransactionsByAffectedPaginated(
          variables: variables,
        ),
      );
      return result.parsedData?.getWalletTransactionsByAffectedPaginated ??
          Query$getWalletTransactionsByAffectedPaginated$getWalletTransactionsByAffectedPaginated(
            isLast: true,
            objects: [],
            count: 0,
          );
    } on Exception {
      return Query$getWalletTransactionsByAffectedPaginated$getWalletTransactionsByAffectedPaginated(
        isLast: true,
        objects: [],
        count: 0,
      );
    }
  }
}
