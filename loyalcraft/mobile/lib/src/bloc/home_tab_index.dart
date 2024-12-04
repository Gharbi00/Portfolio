import 'package:flutter_bloc/flutter_bloc.dart';

class HomeTabIndexCubit extends Cubit<int> {
  HomeTabIndexCubit({required int value}) : super(value);

  void updateValue(int value) => emit(value);
}
