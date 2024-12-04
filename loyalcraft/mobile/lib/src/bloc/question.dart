import 'dart:async';

import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_loyalcraft_gql/graphql/forms-question.graphql.dart';
import 'package:loyalcraft/src/repository/question.dart';

class GetQuestionsbyFormWithResponsesStatsPaginatedCubit extends Cubit<Query$getQuestionsbyFormWithResponsesStatsPaginated$getQuestionsbyFormWithResponsesStatsPaginated?> {
  GetQuestionsbyFormWithResponsesStatsPaginatedCubit(this._questionRepository) : super(null);
  final QuestionRepository _questionRepository;

  Future<void> getQuestionsbyFormWithResponsesStatsPaginated(Variables$Query$getQuestionsbyFormWithResponsesStatsPaginated variables) async {
    final data = await _questionRepository.getQuestionsbyFormWithResponsesStatsPaginated(variables);
    emit(data);
  }

  Future<void> addQuestions(Variables$Query$getQuestionsbyFormWithResponsesStatsPaginated variables) async {
    var oldData = state;
    final newData = await _questionRepository.getQuestionsbyFormWithResponsesStatsPaginated(variables);
    emit(newData!.copyWith(objects: [...oldData!.objects, ...newData.objects]));
  }
}
