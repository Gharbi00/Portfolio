import 'dart:async';

import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-referral.graphql.dart';
import 'package:loyalcraft/src/repository/referral.dart';

class GetLastReferralCubit extends Cubit<Query$getLastReferral$getLastReferral?> {
  GetLastReferralCubit(this._referralRepository) : super(null);
  final ReferralRepository _referralRepository;

  Future<void> getLastReferral(Variables$Query$getLastReferral variables) async {
    final data = await _referralRepository.getLastReferral(variables);
    emit(data);
  }
}
