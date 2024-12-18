import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class LocaleCubit extends Cubit<Locale> {
  LocaleCubit(Locale locale) : super(locale);

  void setLocale(Locale locale) => emit(locale);
}
