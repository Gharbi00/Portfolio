import 'package:flutter_loyalcraft_gql/graphql/corporate-authentication.graphql.dart';
import 'package:loyalcraft/src/data/graphql_client.dart';

class CorporateAuthenticationRepository {
  CorporateAuthenticationRepository(this._sGraphQLClient);
  final SGraphQLClient _sGraphQLClient;

  Future<Query$loginForTarget$loginForTarget?> loginForTarget(
    Variables$Query$loginForTarget variables,
  ) async {
    try {
      final result = await _sGraphQLClient.client.query$loginForTarget(
        Options$Query$loginForTarget(
          variables: variables,
        ),
      );
      return result.parsedData?.loginForTarget;
    } on Exception {
      return null;
    }
  }

  Future<Mutation$registerForTarget$registerForTarget?> registerForTarget(
    Variables$Mutation$registerForTarget variables,
  ) async {
    try {
      final result = await _sGraphQLClient.client.mutate$registerForTarget(
        Options$Mutation$registerForTarget(
          variables: variables,
        ),
      );
      return result.parsedData?.registerForTarget;
    } on Exception {
      return null;
    }
  }

  Future<bool> isLoginForTargetExist(
    Variables$Query$isLoginForTargetExist variables,
  ) async {
    try {
      final result = await _sGraphQLClient.client.query$isLoginForTargetExist(
        Options$Query$isLoginForTargetExist(
          variables: variables,
        ),
      );
      return result.parsedData?.isLoginForTargetExist.exist ?? false;
    } on Exception {
      return false;
    }
  }

  Future<Mutation$resetPasswordForTarget$resetPasswordForTarget?> resetPasswordForTarget(
    Variables$Mutation$resetPasswordForTarget variables,
  ) async {
    try {
      final result = await _sGraphQLClient.client.mutate$resetPasswordForTarget(
        Options$Mutation$resetPasswordForTarget(
          variables: variables,
        ),
      );
      return result.parsedData?.resetPasswordForTarget;
    } on Exception {
      return null;
    }
  }

  Future<Mutation$validateLinkOrCodeForTarget$validateLinkOrCodeForTarget?> validateLinkOrCodeForTarget(
    Variables$Mutation$validateLinkOrCodeForTarget variables,
  ) async {
    try {
      final result = await _sGraphQLClient.client.mutate$validateLinkOrCodeForTarget(
        Options$Mutation$validateLinkOrCodeForTarget(
          variables: variables,
        ),
      );
      return result.parsedData?.validateLinkOrCodeForTarget ?? Mutation$validateLinkOrCodeForTarget$validateLinkOrCodeForTarget(message: '', success: false);
    } on Exception {
      return Mutation$validateLinkOrCodeForTarget$validateLinkOrCodeForTarget(message: '', success: false);
    }
  }

  Future<Mutation$sendValidationCode$sendValidationCode?> sendValidationCode(
    Variables$Mutation$sendValidationCode variables,
  ) async {
    try {
      final result = await _sGraphQLClient.client.mutate$sendValidationCode(
        Options$Mutation$sendValidationCode(
          variables: variables,
        ),
      );
      print(result);
      return result.parsedData?.sendValidationCode ?? Mutation$sendValidationCode$sendValidationCode(message: '', success: false);
    } on Exception {
      return Mutation$sendValidationCode$sendValidationCode(message: '', success: false);
    }
  }

  Future<Mutation$sendForgotPasswordMailOrSmsToTarget$sendForgotPasswordMailOrSmsToTarget?> sendForgotPasswordMailOrSmsToTarget(
    Variables$Mutation$sendForgotPasswordMailOrSmsToTarget variables,
  ) async {
    try {
      final result = await _sGraphQLClient.client.mutate$sendForgotPasswordMailOrSmsToTarget(
        Options$Mutation$sendForgotPasswordMailOrSmsToTarget(
          variables: variables,
        ),
      );
      return result.parsedData?.sendForgotPasswordMailOrSmsToTarget;
    } on Exception {
      return null;
    }
  }
}
