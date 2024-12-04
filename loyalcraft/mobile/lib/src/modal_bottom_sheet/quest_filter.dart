import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_loyalcraft_gql/graphql/corporate-partnership-network.graphql.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-quest-quest.graphql.dart';
import 'package:flutter_loyalcraft_gql/schema.graphql.dart';
import 'package:loyalcraft/localizations_delegate/app_localizations.dart';
import 'package:loyalcraft/src/bloc/partnership_network.dart';
import 'package:loyalcraft/src/bloc/variable.dart';
import 'package:loyalcraft/src/data/consts.dart';
import 'package:loyalcraft/src/data/graphql_client.dart';
import 'package:loyalcraft/src/repository/partnership_network.dart';
import 'package:loyalcraft/src/widgets/point_of_sale_as_chip.dart';
import 'package:loyalcraft/src/widgets/see_more.dart';

void showQuestFilterSheet({
  required GetPartnershipNetworksByTargetAndPartnershipPaginationCubit getPartnershipNetworksByTargetAndPartnershipPaginationCubit,
  required ValueChanged<dynamic> valueChanged,
  required BuildContext context,
  required int tabIndex,
  required variables,
}) {
  var _isRtl = Directionality.of(context) == TextDirection.rtl;
  late GetPartnershipNetworksByTargetAndPartnershipPaginationCubit _getPartnershipNetworksByTargetAndPartnershipPaginationCubit;
  late PartnershipNetworkRepository _partnershipNetworkRepository;
  late VariableCubit<bool?> _isPerformedCubit;
  late VariableCubit<bool?> _isReversedCubit;
  final _sGraphQLClient = SGraphQLClient();
  late VariableCubit<bool> _isLoadingCubit;
  late VariableCubit<String> _posCubit;
  late VariableCubit<int> _pageCubit;

  showModalBottomSheet(
    backgroundColor: Colors.transparent,
    isScrollControlled: true,
    context: context,
    builder: (builder) => DraggableScrollableSheet(
      initialChildSize: 0.7,
      maxChildSize: 0.9,
      minChildSize: 0.7,
      expand: false,
      builder: (context, scrollController) {
        _posCubit = VariableCubit(value: variables.input.target.pos);
        _isPerformedCubit = VariableCubit(value: tabIndex == 0 ? variables.input.performed : false);
        _pageCubit = VariableCubit(value: 0);
        _isLoadingCubit = VariableCubit(value: false);
        _isReversedCubit = VariableCubit(value: variables.input.reversed);
        _partnershipNetworkRepository = PartnershipNetworkRepository(_sGraphQLClient);
        _getPartnershipNetworksByTargetAndPartnershipPaginationCubit = GetPartnershipNetworksByTargetAndPartnershipPaginationCubit(_partnershipNetworkRepository);
        return MultiBlocProvider(
          providers: [
            BlocProvider(create: (context) => _getPartnershipNetworksByTargetAndPartnershipPaginationCubit),
            BlocProvider(create: (context) => _isPerformedCubit),
            BlocProvider(create: (context) => _isReversedCubit),
            BlocProvider(create: (context) => _isLoadingCubit),
            BlocProvider(create: (context) => _pageCubit),
            BlocProvider(create: (context) => _posCubit),
          ],
          child: BlocBuilder<GetPartnershipNetworksByTargetAndPartnershipPaginationCubit,
              Query$getPartnershipNetworksByTargetAndPartnershipPagination$getPartnershipNetworksByTargetAndPartnershipPagination?>(
            bloc: _getPartnershipNetworksByTargetAndPartnershipPaginationCubit,
            builder: (context, getPartnershipNetworksByTargetAndPartnershipPagination) => BlocBuilder<VariableCubit, dynamic>(
              bloc: _isPerformedCubit,
              builder: (context, isPerformed) => BlocBuilder<VariableCubit, dynamic>(
                bloc: _isReversedCubit,
                builder: (context, isReversed) => BlocBuilder<VariableCubit, dynamic>(
                  bloc: _posCubit,
                  builder: (context, pos) => Container(
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
                        Text(
                          translate(context, 'filterQuests'),
                          style: Theme.of(context).textTheme.displayMedium,
                        ),
                        const SizedBox(height: 16.0),
                        Text(
                          translate(context, 'orderBy'),
                          style: Theme.of(context).textTheme.bodyLarge,
                        ),
                        const SizedBox(height: 16.0),
                        Row(
                          children: [
                            Expanded(
                              child: GestureDetector(
                                onTap: () => _isReversedCubit.updateValue(true),
                                child: Container(
                                  padding: const EdgeInsets.all(8.0),
                                  decoration: BoxDecoration(
                                    color: isReversed == true ? kAppColor : Theme.of(context).focusColor,
                                    borderRadius: _isRtl
                                        ? const BorderRadius.only(
                                            topRight: Radius.circular(8.0),
                                            bottomRight: Radius.circular(8.0),
                                          )
                                        : const BorderRadius.only(
                                            topLeft: Radius.circular(8.0),
                                            bottomLeft: Radius.circular(8.0),
                                          ),
                                  ),
                                  child: Text(
                                    translate(context, 'newestFirst'),
                                    textAlign: TextAlign.center,
                                    style: Theme.of(context).textTheme.bodyMedium!.copyWith(
                                          color: isReversed == true ? Colors.white : Theme.of(context).colorScheme.secondary,
                                        ),
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(width: 8.0),
                            Expanded(
                              child: GestureDetector(
                                onTap: () => _isReversedCubit.updateValue(false),
                                child: Container(
                                  padding: const EdgeInsets.all(8.0),
                                  decoration: BoxDecoration(
                                    color: isReversed == false ? kAppColor : Theme.of(context).focusColor,
                                    borderRadius: _isRtl
                                        ? const BorderRadius.only(
                                            topLeft: Radius.circular(8.0),
                                            bottomLeft: Radius.circular(8.0),
                                          )
                                        : const BorderRadius.only(
                                            topRight: Radius.circular(8.0),
                                            bottomRight: Radius.circular(8.0),
                                          ),
                                  ),
                                  child: Text(
                                    translate(context, 'oldestFirst'),
                                    textAlign: TextAlign.center,
                                    style: Theme.of(context).textTheme.bodyMedium!.copyWith(
                                          color: isReversed == false ? Colors.white : Theme.of(context).colorScheme.secondary,
                                        ),
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                        if (tabIndex == 0) const SizedBox(height: 16.0),
                        if (tabIndex == 0)
                          Text(
                            translate(context, 'kind'),
                            style: Theme.of(context).textTheme.bodyLarge,
                          ),
                        if (tabIndex == 0) const SizedBox(height: 16.0),
                        if (tabIndex == 0)
                          Wrap(
                            runSpacing: 8.0,
                            spacing: 8.0,
                            children: [
                              GestureDetector(
                                onTap: () => _isPerformedCubit.updateValue(null),
                                child: Container(
                                  padding: const EdgeInsets.all(8.0),
                                  decoration: BoxDecoration(
                                    color: isPerformed == null ? kAppColor : Theme.of(context).focusColor,
                                    borderRadius: BorderRadius.circular(100.0),
                                  ),
                                  child: Text(
                                    translate(context, 'all'),
                                    textAlign: TextAlign.center,
                                    style: Theme.of(context).textTheme.bodyMedium!.copyWith(
                                          color: isPerformed == null ? Colors.white : Theme.of(context).colorScheme.secondary,
                                        ),
                                  ),
                                ),
                              ),
                              GestureDetector(
                                onTap: () => _isPerformedCubit.updateValue(true),
                                child: Container(
                                  padding: const EdgeInsets.all(8.0),
                                  decoration: BoxDecoration(
                                    color: isPerformed == true ? kAppColor : Theme.of(context).focusColor,
                                    borderRadius: BorderRadius.circular(100.0),
                                  ),
                                  child: Text(
                                    translate(context, 'alreadyPlayed'),
                                    textAlign: TextAlign.center,
                                    style: Theme.of(context).textTheme.bodyMedium!.copyWith(
                                          color: isPerformed == true ? Colors.white : Theme.of(context).colorScheme.secondary,
                                        ),
                                  ),
                                ),
                              ),
                              GestureDetector(
                                onTap: () => _isPerformedCubit.updateValue(false),
                                child: Container(
                                  padding: const EdgeInsets.all(8.0),
                                  decoration: BoxDecoration(
                                    color: isPerformed == false ? kAppColor : Theme.of(context).focusColor,
                                    borderRadius: BorderRadius.circular(100.0),
                                  ),
                                  child: Text(
                                    translate(context, 'notPlayed'),
                                    textAlign: TextAlign.center,
                                    style: Theme.of(context).textTheme.bodyMedium!.copyWith(
                                          color: isPerformed == false ? Colors.white : Theme.of(context).colorScheme.secondary,
                                        ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        const SizedBox(height: 16.0),
                        Text(
                          translate(context, 'partners'),
                          style: Theme.of(context).textTheme.bodyLarge,
                        ),
                        const SizedBox(height: 16.0),
                        Wrap(
                          runSpacing: 8.0,
                          spacing: 8.0,
                          children: List.generate(
                            (getPartnershipNetworksByTargetAndPartnershipPaginationCubit.state?.objects ?? []).length,
                            (index) {
                              final partner = (getPartnershipNetworksByTargetAndPartnershipPaginationCubit.state?.objects ?? [])[index].partner?.pos;
                              return PointOfSaleAsChipWidget(
                                refreshTheView: (value) => _posCubit.updateValue(value?.id == pos ? kPosID : value?.id),
                                selected: pos == partner?.id,
                                pos: partner,
                              );
                            },
                          ),
                        ),
                        if ((getPartnershipNetworksByTargetAndPartnershipPaginationCubit.state?.isLast ?? true) == false)
                          BlocBuilder<VariableCubit, dynamic>(
                            bloc: _isLoadingCubit,
                            builder: (context, isLoading) => BlocBuilder<VariableCubit, dynamic>(
                              bloc: _pageCubit,
                              builder: (context, page) => SeeMoreWidget(
                                isLoading: isLoading,
                                onTap: () async {
                                  _isLoadingCubit.updateValue(true);
                                  final newPage = (page ?? 0) + 1;
                                  _pageCubit.updateValue(newPage);
                                  await _getPartnershipNetworksByTargetAndPartnershipPaginationCubit.addObjects(
                                    Variables$Query$getPartnershipNetworksByTargetAndPartnershipPagination(
                                      partnership: [
                                        Enum$PartnershipTypeEnum.CONVERSION,
                                      ],
                                      target: Input$TargetACIInput(
                                        pos: kPosID,
                                      ),
                                      pagination: Input$PaginationInput(
                                        limit: kPaginationLimit,
                                        page: newPage,
                                      ),
                                    ),
                                  );

                                  _isLoadingCubit.updateValue(false);
                                },
                              ),
                            ),
                          ),
                        const SizedBox(height: 16.0),
                        TextButton(
                          style: TextButton.styleFrom(
                            disabledBackgroundColor: kAppColor.withOpacity(0.6),
                            minimumSize: const Size.fromHeight(40.0),
                            backgroundColor: kAppColor,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8.0),
                            ),
                          ),
                          onPressed: () async {
                            if (tabIndex == 0) {
                              valueChanged(
                                Variables$Query$getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated(
                                  input: Input$QuestsByTargetAndUserAudienceWithPerformedInput(
                                    target: Input$TargetACIInput(
                                      pos: pos,
                                    ),
                                    performed: isPerformed,
                                    reversed: isReversed,
                                  ),
                                  pagination: Input$PaginationInput(
                                    limit: kPaginationLimit,
                                    page: kPaginationPage,
                                  ),
                                ),
                              );
                            } else {
                              valueChanged(
                                Variables$Query$getComingSoonQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated(
                                  input: Input$QuestsByTargetAndUserAudienceInput(
                                    target: Input$TargetACIInput(
                                      pos: pos,
                                    ),
                                    reversed: isReversed,
                                  ),
                                  pagination: Input$PaginationInput(
                                    limit: kPaginationLimit,
                                    page: kPaginationPage,
                                  ),
                                ),
                              );
                            }
                            Navigator.pop(context);
                          },
                          child: Text(
                            translate(context, 'save'),
                            textAlign: TextAlign.center,
                            style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                                  color: Colors.white,
                                ),
                          ),
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
