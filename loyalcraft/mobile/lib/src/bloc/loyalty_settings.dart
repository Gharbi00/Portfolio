import 'dart:async';

import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-loyalty-settings.graphql.dart';
import 'package:loyalcraft/src/data/shared_preferences.dart';
import 'package:loyalcraft/src/repository/loyalty_settings.dart';

class FindLoyaltySettingsByTargetCubit extends Cubit<Query$findLoyaltySettingsByTarget$findLoyaltySettingsByTarget?> {
  FindLoyaltySettingsByTargetCubit(this._loyaltySettingsRepository) : super(null);
  final LoyaltySettingsRepository _loyaltySettingsRepository;

  Future<void> findLoyaltySettingsByTarget(
    Variables$Query$findLoyaltySettingsByTarget variables,
  ) async {
    final data = await _loyaltySettingsRepository.findLoyaltySettingsByTarget(variables);
    emit(data);
  }

  Future<void> setLoyaltySettingsByTarget(Query$findLoyaltySettingsByTarget$findLoyaltySettingsByTarget? loyaltySettingsByTarget) async {
    emit(loyaltySettingsByTarget);
  }
}

class FindCurrentLoyaltySettingsCubit extends Cubit<Query$findLoyaltySettingsByTarget$findLoyaltySettingsByTarget?> {
  FindCurrentLoyaltySettingsCubit(this._loyaltySettingsRepository) : super(null);
  final LoyaltySettingsRepository _loyaltySettingsRepository;

  Future<void> findLoyaltySettingsByTarget(
    Variables$Query$findLoyaltySettingsByTarget variables,
  ) async {
    final data = await _loyaltySettingsRepository.findLoyaltySettingsByTarget(variables);
    emit(data);

    await addLoyaltySettingsToSP(data);
  }

  Future<void> setLoyaltySettingsByTarget(Query$findLoyaltySettingsByTarget$findLoyaltySettingsByTarget? loyaltySettingsByTarget) async {
    emit(loyaltySettingsByTarget);
    await addLoyaltySettingsToSP(loyaltySettingsByTarget);
  }
}

class GetAccelerationSettingsByTargetWithLinkedAccountCubit extends Cubit<Query$getAccelerationSettingsByTargetWithLinkedAccount$getAccelerationSettingsByTargetWithLinkedAccount?> {
  GetAccelerationSettingsByTargetWithLinkedAccountCubit(this._loyaltySettingsRepository) : super(null);
  final LoyaltySettingsRepository _loyaltySettingsRepository;

  Future<void> getAccelerationSettingsByTargetWithLinkedAccount(
    Variables$Query$getAccelerationSettingsByTargetWithLinkedAccount variables,
  ) async {
    final data = await _loyaltySettingsRepository.getAccelerationSettingsByTargetWithLinkedAccount(variables);
    emit(data);
  }

  Future<void> addObjects(
    Variables$Query$getAccelerationSettingsByTargetWithLinkedAccount variables,
  ) async {
    final oldData = state;
    final newData = await _loyaltySettingsRepository.getAccelerationSettingsByTargetWithLinkedAccount(variables);
    emit(newData!.copyWith(objects: [...oldData!.objects, ...newData.objects]));
  }
}

class GetReferralSettingsByTargetWithLinkedAccountCubit extends Cubit<Query$getReferralSettingsByTargetWithLinkedAccount$getReferralSettingsByTargetWithLinkedAccount?> {
  GetReferralSettingsByTargetWithLinkedAccountCubit(this._loyaltySettingsRepository) : super(null);
  final LoyaltySettingsRepository _loyaltySettingsRepository;

  Future<void> getReferralSettingsByTargetWithLinkedAccount(
    Variables$Query$getReferralSettingsByTargetWithLinkedAccount variables,
  ) async {
    final data = await _loyaltySettingsRepository.getReferralSettingsByTargetWithLinkedAccount(variables);
    emit(data);
  }

  Future<void> addObjects(
    Variables$Query$getReferralSettingsByTargetWithLinkedAccount variables,
  ) async {
    final oldData = state;
    final newData = await _loyaltySettingsRepository.getReferralSettingsByTargetWithLinkedAccount(variables);
    emit(newData!.copyWith(objects: [...oldData!.objects, ...newData.objects]));
  }
}
