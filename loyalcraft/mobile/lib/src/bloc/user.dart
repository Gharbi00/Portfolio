import 'dart:async';

import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_loyalcraft_gql/graphql/user.graphql.dart';
import 'package:flutter_loyalcraft_gql/schema.graphql.dart';
import 'package:loyalcraft/src/data/consts.dart';
import 'package:loyalcraft/src/data/shared_preferences.dart';
import 'package:loyalcraft/src/repository/user.dart';
import 'package:loyalcraft/src/utils/utility.dart';

class UserCubit extends Cubit<Query$user$user?> {
  UserCubit(this._userRepository) : super(null);
  final UserRepository _userRepository;

  Future<void> user() async {
    final data = await _userRepository.user();
    if (data != null) {
      emit(data);
      kUserID = data.id;
      await addUserToSP(data);
      await addThemeToSP((data.mobileTheme ?? Enum$MobileThemesEnum.SYSTEM).name.toLowerCase());
      await addLocaleToSP(getLocaleFromString(data.locale ?? ''));
    }
  }

  Future<void> setUser(Query$user$user? data) async {
    if (data != null) {
      emit(data);
      kUserID = data.id;
      await addUserToSP(data);
      await addThemeToSP((data.mobileTheme ?? Enum$MobileThemesEnum.SYSTEM).name.toLowerCase());
      await addLocaleToSP(getLocaleFromString(data.locale ?? ''));
    }
  }

  Future<void> setUserNull() async {
    emit(null);
    kUserID = '';
    await addUserToSP(null);
  }
}
