import 'dart:async';

import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_loyalcraft_gql/graphql/corporate-internal-product.graphql.dart';
import 'package:loyalcraft/src/repository/corporate_internal_product_repository.dart';

class GetSimpleProductsWithRatingsWithFavoriteStatusWithFilterCubit
    extends Cubit<Query$getSimpleProductsWithRatingsWithFavoriteStatusWithFilter$getSimpleProductsWithRatingsWithFavoriteStatusWithFilter?> {
  GetSimpleProductsWithRatingsWithFavoriteStatusWithFilterCubit(this._corporateInternalProductRepository) : super(null);
  final CorporateInternalProductRepository _corporateInternalProductRepository;

  Future<void> getSimpleProductsWithRatingsWithFavoriteStatusWithFilter({
    required Variables$Query$getSimpleProductsWithRatingsWithFavoriteStatusWithFilter variables,
    required bool addToSP,
  }) async {
    final data = await _corporateInternalProductRepository.getSimpleProductsWithRatingsWithFavoriteStatusWithFilter(variables);
    emit(data);
  }

  void addReadyObjects(
    Query$getSimpleProductsWithRatingsWithFavoriteStatusWithFilter$getSimpleProductsWithRatingsWithFavoriteStatusWithFilter? newData,
  ) {
    final oldData = state;
    emit(newData!.copyWith(objects: [...oldData!.objects, ...newData.objects]));
  }

  Future<void> setNull() async {
    emit(null);
  }
}
