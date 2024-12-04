import 'dart:async';

import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_loyalcraft_gql/graphql/country.graphql.dart';
import 'package:loyalcraft/src/repository/country.dart';

class GetCountriesCubit extends Cubit<List<Query$getCountries$getCountries>?> {
  GetCountriesCubit(this._countryRepository) : super(null);
  final CountryRepository _countryRepository;

  Future<void> getCountries() async {
    final data = await _countryRepository.getCountries();
    emit(data);
  }
}
