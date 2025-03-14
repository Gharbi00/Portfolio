import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class ThemeCubit extends Cubit<ThemeData> {
  ThemeCubit(ThemeData themeData) : super(themeData);

  void setTheme(ThemeData themeData) => emit(themeData);
}
