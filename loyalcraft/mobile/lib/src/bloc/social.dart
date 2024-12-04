import 'dart:async';

import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_loyalcraft_gql/graphql/socials.graphql.dart';
import 'package:loyalcraft/src/repository/social.dart';

class FindSocialsPaginationCubit extends Cubit<Query$findSocialsPagination$findSocialsPagination?> {
  FindSocialsPaginationCubit(this._socialRepository) : super(null);
  final SocialRepository _socialRepository;

  Future<void> findSocialsPagination(Variables$Query$findSocialsPagination variables) async {
    final data = await _socialRepository.findSocialsPagination(variables);
    emit(data);
  }
}
