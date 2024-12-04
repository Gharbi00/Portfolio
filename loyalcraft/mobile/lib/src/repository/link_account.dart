import 'package:flutter_loyalcraft_gql/graphql/corporate-link-account.graphql.dart';
import 'package:flutter_loyalcraft_gql/schema.graphql.dart';
import 'package:loyalcraft/src/data/graphql_client.dart';
import 'package:loyalcraft/src/data/shared_preferences.dart';

class LinkAccountRepository {
  LinkAccountRepository(this._sGraphQLClient);
  final SGraphQLClient _sGraphQLClient;

  Future<Query$getCurrentUserLinkedCorporateAccountByTarget$getCurrentUserLinkedCorporateAccountByTarget?> getCurrentUserLinkedCorporateAccountByTarget(
    Variables$Query$getCurrentUserLinkedCorporateAccountByTarget variables,
  ) async {
    final user = await getUserFromSP();
    try {
      final result = await _sGraphQLClient.client.query$getCurrentUserLinkedCorporateAccountByTarget(
        Options$Query$getCurrentUserLinkedCorporateAccountByTarget(
          variables: variables,
        ),
      );
      return result.parsedData?.getCurrentUserLinkedCorporateAccountByTarget ??
          Query$getCurrentUserLinkedCorporateAccountByTarget$getCurrentUserLinkedCorporateAccountByTarget(
            id: '',
            token: '',
            createdAt: DateTime.now(),
            updatedAt: DateTime.now(),
            status: Enum$LinkAccountStatusEnum.PENDING,
            user: Query$getCurrentUserLinkedCorporateAccountByTarget$getCurrentUserLinkedCorporateAccountByTarget$user.fromJson(user!.toJson()),
          );
    } on Exception {
      return Query$getCurrentUserLinkedCorporateAccountByTarget$getCurrentUserLinkedCorporateAccountByTarget(
        id: '',
        token: '',
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
        status: Enum$LinkAccountStatusEnum.PENDING,
        user: Query$getCurrentUserLinkedCorporateAccountByTarget$getCurrentUserLinkedCorporateAccountByTarget$user.fromJson(user!.toJson()),
      );
    }
  }
}
