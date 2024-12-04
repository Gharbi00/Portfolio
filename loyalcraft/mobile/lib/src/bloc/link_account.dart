import 'dart:async';

import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_loyalcraft_gql/graphql/corporate-link-account.graphql.dart';
import 'package:loyalcraft/src/repository/link_account.dart';

class GetCurrentUserLinkedCorporateAccountByTargetCubit extends Cubit<Query$getCurrentUserLinkedCorporateAccountByTarget$getCurrentUserLinkedCorporateAccountByTarget?> {
  GetCurrentUserLinkedCorporateAccountByTargetCubit(this._linkAccountRepository) : super(null);
  final LinkAccountRepository _linkAccountRepository;

  Future<void> getCurrentUserLinkedCorporateAccountByTarget(
    Variables$Query$getCurrentUserLinkedCorporateAccountByTarget variables,
  ) async {
    final data = await _linkAccountRepository.getCurrentUserLinkedCorporateAccountByTarget(variables);
    emit(data);
  }
}
