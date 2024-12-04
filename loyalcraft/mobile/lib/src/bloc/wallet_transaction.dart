import 'dart:async';

import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-wallet-transaction.graphql.dart';
import 'package:loyalcraft/src/data/shared_preferences.dart';
import 'package:loyalcraft/src/repository/wallet_transaction.dart';

class GetWalletTransactionsByAffectedPaginatedCubit extends Cubit<Query$getWalletTransactionsByAffectedPaginated$getWalletTransactionsByAffectedPaginated?> {
  GetWalletTransactionsByAffectedPaginatedCubit(
    this._walletTransactionRepository,
  ) : super(null);
  final WalletTransactionRepository _walletTransactionRepository;

  Future<void> getWalletTransactionsByAffectedPaginated({required Variables$Query$getWalletTransactionsByAffectedPaginated variables, required bool addToSP}) async {
    final oldData = await getWalletTransactionsByAffectedFromSP();
    if (oldData != null && oldData.objects.isNotEmpty && addToSP) {
      emit(oldData);
    }
    final data = await _walletTransactionRepository.getWalletTransactionsByAffectedPaginated(variables);
    emit(data);
    if (data != null && data.objects.isNotEmpty && addToSP) {
      await addWalletTransactionsByAffectedToSP(data);
    }
  }

  Future<void> addObjects(Variables$Query$getWalletTransactionsByAffectedPaginated variables) async {
    var oldData = state;
    final newData = await _walletTransactionRepository.getWalletTransactionsByAffectedPaginated(variables);
    emit(newData!.copyWith(objects: [...oldData!.objects, ...newData.objects]));
  }

  Future<void> setNull() async {
    emit(null);
  }

  void addReadyObjects(
    Query$getWalletTransactionsByAffectedPaginated$getWalletTransactionsByAffectedPaginated? newData,
  ) {
    final oldData = state;
    emit(newData!.copyWith(objects: [...oldData!.objects, ...newData.objects]));
  }

  Future<void> setWalletTransactionsByAffectedPaginated(Query$getWalletTransactionsByAffectedPaginated$getWalletTransactionsByAffectedPaginated? data) async {
    emit(data);
  }
}
