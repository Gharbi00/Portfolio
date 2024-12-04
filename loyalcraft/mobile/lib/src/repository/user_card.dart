import 'package:flutter_loyalcraft_gql/graphql/gamification-card-user-card.graphql.dart';
import 'package:loyalcraft/src/data/graphql_client.dart';

class UserCardRepository {
  UserCardRepository(this._sGraphQLClient);
  final SGraphQLClient _sGraphQLClient;

  Future<List<Query$getCorporateUserCardByUserAndTarget$getCorporateUserCardByUserAndTarget>?> getCorporateUserCardByUserAndTarget(
    Variables$Query$getCorporateUserCardByUserAndTarget variables,
  ) async {
    try {
      final result = await _sGraphQLClient.client.query$getCorporateUserCardByUserAndTarget(
        Options$Query$getCorporateUserCardByUserAndTarget(
          variables: variables,
        ),
      );

      return result.parsedData?.getCorporateUserCardByUserAndTarget ?? [];
    } on Exception {
      return [];
    }
  }

  Future<Mutation$linkUserAccount$linkUserAccount?> linkUserAccount(
    Variables$Mutation$linkUserAccount variables,
  ) async {
    try {
      final result = await _sGraphQLClient.client.mutate$linkUserAccount(
        Options$Mutation$linkUserAccount(
          variables: variables,
        ),
      );
      return result.parsedData?.linkUserAccount;
    } on Exception {
      return null;
    }
  }

  Future<Mutation$onboardUserToTargetLoyalty$onboardUserToTargetLoyalty?> onboardUserToTargetLoyalty(
    Variables$Mutation$onboardUserToTargetLoyalty variables,
  ) async {
    try {
      final result = await _sGraphQLClient.client.mutate$onboardUserToTargetLoyalty(
        Options$Mutation$onboardUserToTargetLoyalty(
          variables: variables,
        ),
      );
      return result.parsedData?.onboardUserToTargetLoyalty;
    } on Exception {
      return null;
    }
  }

  Future<Query$loginWithAppleForTarget$loginWithAppleForTarget?> loginWithAppleForTarget(
    Variables$Query$loginWithAppleForTarget variables,
  ) async {
    try {
      final result = await _sGraphQLClient.client.query$loginWithAppleForTarget(
        Options$Query$loginWithAppleForTarget(
          variables: variables,
        ),
      );

      return result.parsedData?.loginWithAppleForTarget;
    } on Exception {
      return null;
    }
  }

  Future<Query$loginWithFacebookForTarget$loginWithFacebookForTarget?> loginWithFacebookForTarget(
    Variables$Query$loginWithFacebookForTarget variables,
  ) async {
    try {
      final result = await _sGraphQLClient.client.query$loginWithFacebookForTarget(
        Options$Query$loginWithFacebookForTarget(
          variables: variables,
        ),
      );
      return result.parsedData?.loginWithFacebookForTarget;
    } on Exception {
      return null;
    }
  }

  Future<Query$loginWithGoogleForTarget$loginWithGoogleForTarget?> loginWithGoogleForTarget(
    Variables$Query$loginWithGoogleForTarget variables,
  ) async {
    try {
      final result = await _sGraphQLClient.client.query$loginWithGoogleForTarget(
        Options$Query$loginWithGoogleForTarget(
          variables: variables,
        ),
      );
      print(result);
      return result.parsedData?.loginWithGoogleForTarget;
    } on Exception {
      return null;
    }
  }
}
