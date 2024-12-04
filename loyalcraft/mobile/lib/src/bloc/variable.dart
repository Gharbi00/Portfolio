import 'package:flutter_bloc/flutter_bloc.dart';

class VariableCubit<T> extends Cubit<T?> {
  VariableCubit({T? value}) : super(value as T);

  void updateValue(T? value) => emit(value);
}
