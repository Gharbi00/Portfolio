import 'dart:async';

import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-wallet-wallet.graphql.dart';
import 'package:loyalcraft/src/data/shared_preferences.dart';
import 'package:loyalcraft/src/repository/wallet.dart';

class GetCurrentUserQuantitativeWalletsCubit extends Cubit<Query$getCurrentUserQuantitativeWallets$getCurrentUserQuantitativeWallets?> {
  GetCurrentUserQuantitativeWalletsCubit(this._walletRepository) : super(null);
  final WalletRepository _walletRepository;

  Future<void> getCurrentUserQuantitativeWallets(
    Variables$Query$getCurrentUserQuantitativeWallets variables,
  ) async {
    final data = await _walletRepository.getCurrentUserQuantitativeWallets(variables);
    emit(data);
  }

  Future<void> addQuantitativeWallets(
    Variables$Query$getCurrentUserQuantitativeWallets variables,
  ) async {
    var oldData = state;
    final newData = await _walletRepository.getCurrentUserQuantitativeWallets(variables);
    emit(newData!.copyWith(objects: [...oldData!.objects, ...newData.objects]));
  }
}

class CurrentUserQuantitativeWalletsCubit extends Cubit<Query$getCurrentUserQuantitativeWallets$getCurrentUserQuantitativeWallets?> {
  CurrentUserQuantitativeWalletsCubit(this._walletRepository) : super(null);
  final WalletRepository _walletRepository;

  Future<void> getCurrentUserQuantitativeWallets(
    Variables$Query$getCurrentUserQuantitativeWallets variables,
  ) async {
    final oldData = await getCurrentUserQuantitativeWalletsFromSP();
    if (oldData != null && oldData.objects.isNotEmpty) {
      emit(oldData);
    }
    final data = await _walletRepository.getCurrentUserQuantitativeWallets(variables);
    if (oldData == null) {
      emit(data);
    } else {
      if (data != null && data.objects.isNotEmpty) {
        emit(data);
      }
      if ((data?.objects ?? []).isEmpty) {
        emit(oldData);
      }
    }
    if (data != null && data.objects.isNotEmpty) {
      await addCurrentUserQuantitativeWalletsToSP(data);
    }
  }

  Future<void> addQuantitativeWallets(
    Variables$Query$getCurrentUserQuantitativeWallets variables,
  ) async {
    var oldData = state;
    final newData = await _walletRepository.getCurrentUserQuantitativeWallets(variables);
    emit(newData!.copyWith(objects: [...oldData!.objects, ...newData.objects]));
  }

  Future<void> setQuantitativeWallets(
    Query$getCurrentUserQuantitativeWallets$getCurrentUserQuantitativeWallets? data,
  ) async {
    emit(data);
  }

  Future<void> setNull() async {
    emit(null);
  }
}

class GetUserWalletWithReputationsCubit extends Cubit<Query$getUserWalletWithReputations$getUserWalletWithReputations?> {
  GetUserWalletWithReputationsCubit(this._walletRepository) : super(null);
  final WalletRepository _walletRepository;

  Future<void> getUserWalletWithReputations(Variables$Query$getUserWalletWithReputations variables) async {
    final data = await _walletRepository.getUserWalletWithReputations(variables);
    emit(data);
  }

  Future<void> setUserWalletWithReputations(Query$getUserWalletWithReputations$getUserWalletWithReputations? data) async {
    emit(data);
  }
}

class GetCurrentUserReputationsLossDateCubit extends Cubit<Query$getCurrentUserReputationsLossDate$getCurrentUserReputationsLossDate?> {
  GetCurrentUserReputationsLossDateCubit(this._walletRepository) : super(null);
  final WalletRepository _walletRepository;

  Future<void> getCurrentUserReputationsLossDate(Variables$Query$getCurrentUserReputationsLossDate variables) async {
    final data = await _walletRepository.getCurrentUserReputationsLossDate(variables);
    emit(data);
  }
}
