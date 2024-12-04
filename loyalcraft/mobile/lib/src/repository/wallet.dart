import 'package:flutter_loyalcraft_gql/graphql/gamification-wallet-wallet.graphql.dart';
import 'package:loyalcraft/src/data/graphql_client.dart';

class WalletRepository {
  WalletRepository(this._sGraphQLClient);
  final SGraphQLClient _sGraphQLClient;
  Future<Query$getUserWalletWithReputations$getUserWalletWithReputations?> getUserWalletWithReputations(Variables$Query$getUserWalletWithReputations variables) async {
    try {
      final result = await _sGraphQLClient.client.query$getUserWalletWithReputations(
        Options$Query$getUserWalletWithReputations(
          variables: variables,
        ),
      );
      return result.parsedData?.getUserWalletWithReputations ??
          Query$getUserWalletWithReputations$getUserWalletWithReputations(
            createdAt: DateTime.now(),
            updatedAt: DateTime.now(),
            reputationLevels: [],
            id: '',
          );
    } on Exception {
      return Query$getUserWalletWithReputations$getUserWalletWithReputations(
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
        reputationLevels: [],
        id: '',
      );
    }
  }

  Future<Query$getCurrentUserQuantitativeWallets$getCurrentUserQuantitativeWallets?> getCurrentUserQuantitativeWallets(
    Variables$Query$getCurrentUserQuantitativeWallets variables,
  ) async {
    try {
      final result = await _sGraphQLClient.client.query$getCurrentUserQuantitativeWallets(
        Options$Query$getCurrentUserQuantitativeWallets(
          variables: variables,
        ),
      );
      return result.parsedData?.getCurrentUserQuantitativeWallets ??
          Query$getCurrentUserQuantitativeWallets$getCurrentUserQuantitativeWallets(
            isLast: true,
            objects: [],
            count: 0,
          );
    } on Exception {
      return Query$getCurrentUserQuantitativeWallets$getCurrentUserQuantitativeWallets(
        isLast: true,
        objects: [],
        count: 0,
      );
    }
  }

  Future<Query$getCurrentUserReputationsLossDate$getCurrentUserReputationsLossDate?> getCurrentUserReputationsLossDate(
    Variables$Query$getCurrentUserReputationsLossDate variables,
  ) async {
    try {
      final result = await _sGraphQLClient.client.query$getCurrentUserReputationsLossDate(
        Options$Query$getCurrentUserReputationsLossDate(
          variables: variables,
        ),
      );
      return result.parsedData?.getCurrentUserReputationsLossDate;
    } on Exception {
      return null;
    }
  }

  Future<Mutation$convertWalletPoints$convertWalletPoints?> convertWalletPoints(
    Variables$Mutation$convertWalletPoints variables,
  ) async {
    try {
      final result = await _sGraphQLClient.client.mutate$convertWalletPoints(
        Options$Mutation$convertWalletPoints(
          variables: variables,
        ),
      );

      return result.parsedData?.convertWalletPoints;
    } on Exception {
      return null;
    }
  }
}
