import 'package:flutter_loyalcraft_gql/graphql/gamification-loyalty-settings.graphql.dart';
import 'package:loyalcraft/src/data/graphql_client.dart';

class LoyaltySettingsRepository {
  LoyaltySettingsRepository(this._sGraphQLClient);
  final SGraphQLClient _sGraphQLClient;

  Future<Query$findLoyaltySettingsByTarget$findLoyaltySettingsByTarget?> findLoyaltySettingsByTarget(
    Variables$Query$findLoyaltySettingsByTarget variables,
  ) async {
    try {
      final result = await _sGraphQLClient.client.query$findLoyaltySettingsByTarget(
        Options$Query$findLoyaltySettingsByTarget(
          variables: variables,
        ),
      );
      return result.parsedData?.findLoyaltySettingsByTarget ?? Query$findLoyaltySettingsByTarget$findLoyaltySettingsByTarget(id: '', createdAt: DateTime.now(), updatedAt: DateTime.now());
    } on Exception {
      return Query$findLoyaltySettingsByTarget$findLoyaltySettingsByTarget(id: '', createdAt: DateTime.now(), updatedAt: DateTime.now());
    }
  }

  Future<Query$getReferralSettingsByTargetWithLinkedAccount$getReferralSettingsByTargetWithLinkedAccount?> getReferralSettingsByTargetWithLinkedAccount(
    Variables$Query$getReferralSettingsByTargetWithLinkedAccount variables,
  ) async {
    try {
      final result = await _sGraphQLClient.client.query$getReferralSettingsByTargetWithLinkedAccount(
        Options$Query$getReferralSettingsByTargetWithLinkedAccount(
          variables: variables,
        ),
      );
      return result.parsedData?.getReferralSettingsByTargetWithLinkedAccount ??
          Query$getReferralSettingsByTargetWithLinkedAccount$getReferralSettingsByTargetWithLinkedAccount(
            isLast: true,
            objects: [],
            count: 0,
          );
    } on Exception {
      return Query$getReferralSettingsByTargetWithLinkedAccount$getReferralSettingsByTargetWithLinkedAccount(
        isLast: true,
        objects: [],
        count: 0,
      );
    }
  }

  Future<Query$getAccelerationSettingsByTargetWithLinkedAccount$getAccelerationSettingsByTargetWithLinkedAccount?> getAccelerationSettingsByTargetWithLinkedAccount(
    Variables$Query$getAccelerationSettingsByTargetWithLinkedAccount variables,
  ) async {
    try {
      final result = await _sGraphQLClient.client.query$getAccelerationSettingsByTargetWithLinkedAccount(
        Options$Query$getAccelerationSettingsByTargetWithLinkedAccount(
          variables: variables,
        ),
      );
      return result.parsedData?.getAccelerationSettingsByTargetWithLinkedAccount ??
          Query$getAccelerationSettingsByTargetWithLinkedAccount$getAccelerationSettingsByTargetWithLinkedAccount(
            isLast: true,
            objects: [],
            count: 0,
          );
    } on Exception {
      return Query$getAccelerationSettingsByTargetWithLinkedAccount$getAccelerationSettingsByTargetWithLinkedAccount(
        isLast: true,
        objects: [],
        count: 0,
      );
    }
  }
}
