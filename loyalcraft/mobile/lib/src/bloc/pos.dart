import 'dart:async';

import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_diktup_utilities/extensions.dart';
import 'package:flutter_loyalcraft_gql/graphql/point-of-sale.graphql.dart';
import 'package:loyalcraft/src/data/consts.dart';
import 'package:loyalcraft/src/data/shared_preferences.dart';
import 'package:loyalcraft/src/repository/pos.dart';

class PosCubit extends Cubit<Query$pointOfSale$pointOfSale?> {
  PosCubit(this._posRepository) : super(null);
  final PosRepository _posRepository;

  Future<void> pointOfSale(Variables$Query$pointOfSale variables) async {
    final data = await _posRepository.pointOfSale(variables);
    if (data != null) {
      emit(data);
      kPosID = data.id;
      kAppName = data.title.removeNull();

      await addPosToSP(data);
    }
  }

  Future<void> setPos(Query$pointOfSale$pointOfSale? data) async {
    if (data != null) {
      emit(data);
      await addPosToSP(data);
      kPosID = data.id;
      kAppName = data.title.removeNull();
    }
  }

  Future<void> setPosNull() async {
    emit(null);
    await addPosToSP(null);
  }
}
