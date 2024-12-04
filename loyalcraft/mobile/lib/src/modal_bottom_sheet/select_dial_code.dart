import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:loyalcraft/localizations_delegate/app_localizations.dart';
import 'package:loyalcraft/src/bloc/variable.dart';
import 'package:loyalcraft/src/data/consts.dart';
import 'package:loyalcraft/src/models/dial_code.dart';
import 'package:loyalcraft/src/widgets/dial_code_item.dart';
import 'package:loyalcraft/src/widgets/search_bar.dart';
import 'package:loyalcraft/src/widgets/see_more.dart';

void showSelectDialCodeSheet({
  required ValueChanged<DialCode> refreshTheView,
  required DialCode currentDialCode,
  required BuildContext context,
}) {
  late VariableCubit<List<DialCode>> _dialCodeList1Cubit;
  late VariableCubit<List<DialCode>> _dialCodeList2Cubit;
  late VariableCubit<List<DialCode>> _filterListCubit;
  late VariableCubit<String> _searchCubit;
  late VariableCubit<int> _countCubit;

  showModalBottomSheet(
    backgroundColor: Colors.transparent,
    isScrollControlled: true,
    context: context,
    builder: (builder) => DraggableScrollableSheet(
      initialChildSize: 0.6,
      maxChildSize: 0.9,
      minChildSize: 0.6,
      expand: false,
      builder: (context, scrollController) {
        _filterListCubit = VariableCubit(value: []);
        _searchCubit = VariableCubit(value: '');
        _countCubit = VariableCubit(value: 0);
        _dialCodeList1Cubit = VariableCubit(value: kDialCodeList);
        _dialCodeList2Cubit = VariableCubit(value: []);
        _countCubit.updateValue(_countCubit.state! + 1);
        kDialCodeList.length > kPaginationLimit ? _dialCodeList2Cubit.updateValue(kDialCodeList.getRange(0, kPaginationLimit).toList()) : _dialCodeList2Cubit.updateValue(kDialCodeList);

        return BlocBuilder<VariableCubit, dynamic>(
          bloc: _dialCodeList1Cubit,
          builder: (context, dialCodeList1) => BlocBuilder<VariableCubit, dynamic>(
            bloc: _dialCodeList2Cubit,
            builder: (context, dialCodeList2) => BlocBuilder<VariableCubit, dynamic>(
              bloc: _filterListCubit,
              builder: (context, filterList) => BlocBuilder<VariableCubit, dynamic>(
                bloc: _searchCubit,
                builder: (context, data) => StatefulBuilder(
                  builder: (buildContext, setState) => Container(
                    padding: const EdgeInsets.all(16.0),
                    width: double.infinity,
                    decoration: BoxDecoration(
                      color: Theme.of(context).scaffoldBackgroundColor,
                      borderRadius: const BorderRadius.only(
                        topRight: Radius.circular(8.0),
                        topLeft: Radius.circular(8.0),
                      ),
                    ),
                    child: ListView(
                      controller: scrollController,
                      shrinkWrap: true,
                      primary: false,
                      children: [
                        Center(
                          child: Container(
                            height: 6.0,
                            width: 80.0,
                            decoration: BoxDecoration(
                              color: Theme.of(context).focusColor.withOpacity(1.0),
                              borderRadius: BorderRadius.circular(100.0),
                            ),
                          ),
                        ),
                        const SizedBox(height: 16.0),
                        SearchBarWidget(
                          search: translate(context, 'search'),
                          onChanged: (value) {
                            _searchCubit.updateValue(value);
                            var list = kDialCodeList.where((element) => element.name.toLowerCase().contains(value.toLowerCase())).toList();
                            _filterListCubit.updateValue(
                              list.length > kPaginationLimit ? list.getRange(0, kPaginationLimit).toList() : list,
                            );
                          },
                        ),
                        const SizedBox(height: 16.0),
                        ListView.separated(
                          separatorBuilder: (context, index) => const SizedBox(height: 16.0),
                          physics: const NeverScrollableScrollPhysics(),
                          itemCount: (_searchCubit.state!.isEmpty ? dialCodeList2 : filterList).length,
                          padding: EdgeInsets.zero,
                          shrinkWrap: true,
                          primary: false,
                          itemBuilder: (context, index) => DialCodeItemWidget(
                            dialCode: (_searchCubit.state!.isEmpty ? dialCodeList2 : filterList)[index],
                            valueChanged: (value) {
                              refreshTheView(value);
                              Navigator.pop(context);
                            },
                            currentDialCode: currentDialCode,
                          ),
                        ),
                        if (_dialCodeList2Cubit.state!.length < kDialCodeList.length && _searchCubit.state!.isEmpty)
                          SeeMoreWidget(
                            isLoading: false,
                            onTap: () {
                              if (dialCodeList1.length > kPaginationLimit) {
                                _dialCodeList2Cubit.updateValue([
                                  ...dialCodeList2,
                                  ...(dialCodeList1 as List).getRange(0, kPaginationLimit).toList(),
                                ]);
                              } else {
                                _dialCodeList2Cubit.updateValue([
                                  ...dialCodeList2,
                                  ...dialCodeList1,
                                ]);
                              }

                              var list = dialCodeList1;
                              list.removeRange(
                                0,
                                dialCodeList1.length > kPaginationLimit ? kPaginationLimit : dialCodeList1.length,
                              );
                              _dialCodeList1Cubit.updateValue(list.toList());
                            },
                          ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        );
      },
    ),
  );
}
