import 'dart:async';

import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_loyalcraft_gql/graphql/state.graphql.dart';
import 'package:loyalcraft/src/repository/state.dart';

class FindStatesByCountryPaginationCubit extends Cubit<Query$findStatesByCountryPagination$findStatesByCountryPagination?> {
  FindStatesByCountryPaginationCubit(this._stateRepository) : super(null);
  final StateRepository _stateRepository;

  Future<void> findStatesByCountryPagination(
    Options$Query$findStatesByCountryPagination variables,
  ) async {
    var data = await _stateRepository.findStatesByCountryPagination(variables);
    emit(data);
  }

  Future<void> addStates(
    Options$Query$findStatesByCountryPagination variables,
  ) async {
    var oldData = state;
    var newData = await _stateRepository.findStatesByCountryPagination(variables);
    emit(newData!.copyWith(objects: [...oldData!.objects, ...newData.objects]));
  }
}
