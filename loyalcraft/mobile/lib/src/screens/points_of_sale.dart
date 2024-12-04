import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_loyalcraft_gql/graphql/corporate-partnership-network.graphql.dart';
import 'package:flutter_loyalcraft_gql/graphql/point-of-sale.graphql.dart';
import 'package:flutter_loyalcraft_gql/schema.graphql.dart';
import 'package:loyalcraft/localizations_delegate/app_localizations.dart';
import 'package:loyalcraft/src/bloc/partnership_network.dart';
import 'package:loyalcraft/src/bloc/variable.dart';
import 'package:loyalcraft/src/data/consts.dart';
import 'package:loyalcraft/src/data/graphql_client.dart';
import 'package:loyalcraft/src/repository/partnership_network.dart';
import 'package:loyalcraft/src/widgets/empty.dart';
import 'package:loyalcraft/src/widgets/point_of_sale_item_widget.dart';

// ignore: must_be_immutable
class PointsOfSaleWidget extends StatefulWidget {
  const PointsOfSaleWidget({
    Key? key,
  }) : super(key: key);

  @override
  _PointsOfSaleWidget createState() => _PointsOfSaleWidget();
}

class _PointsOfSaleWidget extends State<PointsOfSaleWidget> {
  _PointsOfSaleWidget() {
    _scrollController.addListener(() async {
      var isEnd = (_scrollController.offset == _scrollController.position.maxScrollExtent);

      if (isEnd) {
        var newPage = _pageCubit.state! + 1;
        await _getPartnershipNetworksByTargetAndPartnershipPaginationCubit.addObjects(
          Variables$Query$getPartnershipNetworksByTargetAndPartnershipPagination(
            partnership: [Enum$PartnershipTypeEnum.CONVERSION],
            target: Input$TargetACIInput(
              pos: kPosID,
            ),
            pagination: Input$PaginationInput(
              limit: kPaginationLimit,
              page: newPage,
            ),
          ),
        );
        _pageCubit.updateValue(newPage);
      }
    });
  }
  late GetPartnershipNetworksByTargetAndPartnershipPaginationCubit _getPartnershipNetworksByTargetAndPartnershipPaginationCubit;
  late PartnershipNetworkRepository _partnershipNetworkRepository;
  final ScrollController _scrollController = ScrollController();
  final SGraphQLClient _sGraphQLClient = SGraphQLClient();
  late VariableCubit<int> _pageCubit;

  void _initState() {
    _pageCubit = VariableCubit(value: 0);
    _partnershipNetworkRepository = PartnershipNetworkRepository(_sGraphQLClient);

    _getPartnershipNetworksByTargetAndPartnershipPaginationCubit = GetPartnershipNetworksByTargetAndPartnershipPaginationCubit(_partnershipNetworkRepository);
    _getPartnershipNetworksByTargetAndPartnershipPaginationCubit.getPartnershipNetworksByTargetAndPartnershipPagination(
      Variables$Query$getPartnershipNetworksByTargetAndPartnershipPagination(
        partnership: [Enum$PartnershipTypeEnum.CONVERSION],
        target: Input$TargetACIInput(
          pos: kPosID,
        ),
        pagination: Input$PaginationInput(
          limit: kPaginationLimit,
          page: _pageCubit.state,
        ),
      ),
    );
  }

  @override
  void dispose() {
    super.dispose();
  }

  @override
  void initState() {
    super.initState();
    if (mounted) {
      _initState();
    }
  }

  @override
  Widget build(BuildContext context) => MultiBlocProvider(
        providers: [
          BlocProvider(create: (context) => _getPartnershipNetworksByTargetAndPartnershipPaginationCubit),
          BlocProvider(create: (context) => _pageCubit),
        ],
        child: BlocBuilder<GetPartnershipNetworksByTargetAndPartnershipPaginationCubit,
            Query$getPartnershipNetworksByTargetAndPartnershipPagination$getPartnershipNetworksByTargetAndPartnershipPagination?>(
          bloc: _getPartnershipNetworksByTargetAndPartnershipPaginationCubit,
          builder: (context, getPartnershipNetworksByTargetAndPartnershipPagination) => BlocBuilder<VariableCubit, dynamic>(
            bloc: _pageCubit,
            builder: (context, page) => Scaffold(
              appBar: AppBar(
                automaticallyImplyLeading: false,
                centerTitle: false,
                elevation: 0,
                title: Row(
                  children: [
                    GestureDetector(
                      onTap: () => Navigator.pop(context),
                      child: Container(
                        height: 36.0,
                        width: 36.0,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(100.0),
                          color: Theme.of(context).focusColor,
                        ),
                        child: Icon(
                          CupertinoIcons.arrow_turn_up_left,
                          color: Theme.of(context).colorScheme.secondary,
                          size: 18.0,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8.0),
                    Expanded(
                      child: Text(
                        translate(context, 'partners'),
                        style: Theme.of(context).textTheme.headlineSmall,
                      ),
                    ),
                  ],
                ),
              ),
              body: SafeArea(
                left: false,
                right: false,
                child: ListView(
                  controller: _scrollController,
                  padding: const EdgeInsets.all(16.0),
                  shrinkWrap: true,
                  primary: false,
                  children: [
                    getPartnershipNetworksByTargetAndPartnershipPagination == null
                        ? const SizedBox()
                        : getPartnershipNetworksByTargetAndPartnershipPagination.objects.isEmpty
                            ? EmptyWidget(
                                description: translate(context, 'pointsOfSaleEmptyDescription'),
                                title: translate(context, 'pointsOfSaleEmptyTitle'),
                                iconData: CupertinoIcons.location_solid,
                                padding: EdgeInsets.zero,
                              )
                            : ListView.separated(
                                itemBuilder: (context, index) {
                                  final partnershipNetwork = getPartnershipNetworksByTargetAndPartnershipPagination.objects[index];
                                  return partnershipNetwork.partner?.pos == null
                                      ? const SizedBox()
                                      : PointOfSaleItemWidget(
                                          pos: Query$pointOfSale$pointOfSale.fromJson(partnershipNetwork.partner!.pos!.toJson()),
                                        );
                                },
                                itemCount: getPartnershipNetworksByTargetAndPartnershipPagination.objects.length,
                                separatorBuilder: (context, index) => const SizedBox(height: 16.0),
                                physics: const NeverScrollableScrollPhysics(),
                                padding: EdgeInsets.zero,
                                shrinkWrap: true,
                                primary: false,
                              ),
                  ],
                ),
              ),
            ),
          ),
        ),
      );
}
