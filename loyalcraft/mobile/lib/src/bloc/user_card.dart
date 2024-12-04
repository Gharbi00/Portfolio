import 'dart:async';

import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-card-user-card.graphql.dart';
import 'package:loyalcraft/src/data/shared_preferences.dart';
import 'package:loyalcraft/src/repository/user_card.dart';

class GetCorporateUserCardByUserAndTargetCubit extends Cubit<List<Query$getCorporateUserCardByUserAndTarget$getCorporateUserCardByUserAndTarget>?> {
  GetCorporateUserCardByUserAndTargetCubit(this._userCardRepository) : super([]);
  final UserCardRepository _userCardRepository;

  Future<void> getCorporateUserCardByUserAndTarget(Variables$Query$getCorporateUserCardByUserAndTarget variables) async {
    final oldData = await getCorporateUserCardByUserAndTargetFromSP();
    if (oldData.isEmpty) {
      final data = await _userCardRepository.getCorporateUserCardByUserAndTarget(variables);
      emit(data);
      await addCorporateUserCardByUserAndTargetToSP(data ?? []);
    } else {
      emit(oldData);
    }
  }

  Future<void> setCorporateUserCardByUserAndTarget(
    List<Query$getCorporateUserCardByUserAndTarget$getCorporateUserCardByUserAndTarget> data,
  ) async {
    if (data.isNotEmpty) {
      emit(data);
    }
  }

  Future<void> setNull() async {
    emit([]);
  }
}
