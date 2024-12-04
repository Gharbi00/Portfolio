import 'dart:async';

import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_loyalcraft_gql/graphql/corporate-partnership-network.graphql.dart';
import 'package:loyalcraft/src/repository/partnership_network.dart';

class GetPartnershipNetworksByTargetAndPartnershipPaginationCubit extends Cubit<Query$getPartnershipNetworksByTargetAndPartnershipPagination$getPartnershipNetworksByTargetAndPartnershipPagination?> {
  GetPartnershipNetworksByTargetAndPartnershipPaginationCubit(this._partnershipNetworkRepository) : super(null);
  final PartnershipNetworkRepository _partnershipNetworkRepository;

  Future<void> getPartnershipNetworksByTargetAndPartnershipPagination(
    Variables$Query$getPartnershipNetworksByTargetAndPartnershipPagination variables,
  ) async {
    final data = await _partnershipNetworkRepository.getPartnershipNetworksByTargetAndPartnershipPagination(variables);
    emit(data);
  }

  Future<void> addObjects(
    Variables$Query$getPartnershipNetworksByTargetAndPartnershipPagination variables,
  ) async {
    final oldData = state;
    final newData = await _partnershipNetworkRepository.getPartnershipNetworksByTargetAndPartnershipPagination(variables);
    emit(newData!.copyWith(objects: [...oldData!.objects, ...newData.objects]));
  }
}
