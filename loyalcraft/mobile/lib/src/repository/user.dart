import 'package:flutter_loyalcraft_gql/graphql/user.graphql.dart';
import 'package:loyalcraft/src/data/consts.dart';
import 'package:loyalcraft/src/data/graphql_client.dart';
import 'package:loyalcraft/src/data/shared_preferences.dart';

class UserRepository {
  UserRepository(this._sGraphQLClient);
  final SGraphQLClient _sGraphQLClient;

  Future<Query$user$user?> user() async {
    try {
      final user = await getUserFromSP();
      final result = await _sGraphQLClient.client.query$user(
        Options$Query$user(
          variables: Variables$Query$user(
            id: user!.id,
          ),
        ),
      );

      return result.parsedData?.user;
    } on Exception {
      return null;
    }
  }

  Future<Mutation$updateUser$updateUser?> updateUser(
    Variables$Mutation$updateUser variables,
  ) async {
    try {
      final result = await _sGraphQLClient.client.mutate$updateUser(
        Options$Mutation$updateUser(
          variables: variables,
        ),
      );
      return result.parsedData?.updateUser;
    } on Exception {
      return null;
    }
  }

  Future<Mutation$updateCurrentUserPassword$updateCurrentUserPassword?> updateCurrentUserPassword(
    Variables$Mutation$updateCurrentUserPassword variables,
  ) async {
    try {
      final result = await _sGraphQLClient.client.mutate$updateCurrentUserPassword(
        Options$Mutation$updateCurrentUserPassword(
          variables: variables,
        ),
      );
      return result.parsedData?.updateCurrentUserPassword;
    } on Exception {
      return null;
    }
  }

  Future<Mutation$updateCurrentUserLogins$updateCurrentUserLogins?> updateCurrentUserLogins(
    Variables$Mutation$updateCurrentUserLogins variables,
  ) async {
    try {
      final result = await _sGraphQLClient.client.mutate$updateCurrentUserLogins(
        Options$Mutation$updateCurrentUserLogins(
          variables: variables,
        ),
      );
      return result.parsedData?.updateCurrentUserLogins;
    } on Exception {
      return null;
    }
  }

  Future<Mutation$deleteUser$deleteUser?> deleteUser(
    Variables$Mutation$deleteUser variables,
  ) async {
    try {
      final result = await _sGraphQLClient.client.mutate$deleteUser(
        Options$Mutation$deleteUser(
          variables: variables,
        ),
      );
      return result.parsedData?.deleteUser;
    } on Exception {
      return null;
    }
  }

  Future<Mutation$updateVapidKey$updateVapidKey?> updateVapidKey(
    Variables$Mutation$updateVapidKey variables,
  ) async {
    try {
      final result = await _sGraphQLClient.client.mutate$updateVapidKey(
        Options$Mutation$updateVapidKey(
          variables: variables,
        ),
      );
      return result.parsedData?.updateVapidKey;
    } on Exception {
      return null;
    }
  }

  Future<String> getVapidKey() async {
    try {
      final result = await _sGraphQLClient.client.query$getVapidKey(
        Options$Query$getVapidKey(
          variables: Variables$Query$getVapidKey(
            userId: kUserID,
          ),
        ),
      );
      return result.parsedData?.getVapidKey.vapidKey ?? '';
    } on Exception {
      return '';
    }
  }
}
