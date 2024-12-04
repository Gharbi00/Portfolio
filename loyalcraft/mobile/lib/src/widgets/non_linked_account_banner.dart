import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_loyalcraft_gql/graphql/point-of-sale.graphql.dart';
import 'package:loyalcraft/localizations_delegate/app_localizations.dart';
import 'package:loyalcraft/src/bloc/home_tab_index.dart';
import 'package:loyalcraft/src/bloc/variable.dart';
import 'package:loyalcraft/src/data/flutter_messenger.dart';
import 'package:loyalcraft/src/data/graphql_client.dart';
import 'package:loyalcraft/src/data/shared_preferences.dart';
import 'package:loyalcraft/src/repository/pos.dart';
import 'package:loyalcraft/src/screens/point_of_sale_landing.dart';
import 'package:loyalcraft/src/screens/points_of_sale.dart';

// ignore: must_be_immutable
class NonLinkedAccountBannerWidget extends StatefulWidget {
  NonLinkedAccountBannerWidget({
    Key? key,
    required this.posID,
  }) : super(key: key);
  String posID;
  @override
  _NonLinkedAccountBannerWidget createState() => _NonLinkedAccountBannerWidget();
}

class _NonLinkedAccountBannerWidget extends State<NonLinkedAccountBannerWidget> {
  final SGraphQLClient _sGraphQLClient = SGraphQLClient();
  late VariableCubit<bool> _isLoadingCubit;
  late PosRepository _posRepository;

  void _initState() {
    _posRepository = PosRepository(_sGraphQLClient);
    _isLoadingCubit = VariableCubit(value: false);
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
          BlocProvider(create: (context) => _isLoadingCubit),
        ],
        child: BlocBuilder<VariableCubit, dynamic>(
          bloc: _isLoadingCubit,
          builder: (context, isLoading) => Opacity(
            opacity: isLoading ? 0.5 : 1.0,
            child: GestureDetector(
              onTap: isLoading
                  ? null
                  : () async {
                      _isLoadingCubit.updateValue(true);
                      final pos = await _posRepository
                          .pointOfSale(
                        Variables$Query$pointOfSale(
                          id: widget.posID,
                        ),
                      )
                          .catchError((onError) {
                        _isLoadingCubit.updateValue(false);
                        return null;
                      });
                      _isLoadingCubit.updateValue(false);
                      if (pos == null) {
                        FlutterMessenger.showSnackbar(context: context, string: translate(context, 'generalErrorMessage'));
                      } else {
                        addHomeTabIndexToSP(4);
                        BlocProvider.of<HomeTabIndexCubit>(context).updateValue(4);
                        Navigator.of(context).pushNamedAndRemoveUntil('/Tabs', (route) => false);
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => const PointsOfSaleWidget(),
                          ),
                        );
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => PointOfSaleLandingWidget(
                              pos: pos,
                            ),
                          ),
                        );
                      }
                    },
              child: Container(
                margin: const EdgeInsets.only(bottom: 16.0),
                padding: const EdgeInsets.all(16.0),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(8.0),
                  color: Colors.red[800]!.withOpacity(0.1),
                ),
                child: Row(
                  children: [
                    Container(
                      alignment: Alignment.center,
                      height: 30.0,
                      width: 30.0,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(100.0),
                        color: Colors.red[800]!.withOpacity(0.2),
                      ),
                      child: Icon(
                        color: Colors.red[800],
                        CupertinoIcons.exclamationmark,
                        size: 18.0,
                      ),
                    ),
                    const SizedBox(width: 8.0),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            translate(context, 'nonLinkedAccountBanner1'),
                            style: Theme.of(context).textTheme.bodyMedium!.copyWith(
                                  color: Colors.red[800],
                                ),
                          ),
                          const SizedBox(height: 4.0),
                          Container(
                            alignment: Alignment.center,
                            width: double.infinity,
                            height: 30.0,
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(100.0),
                              color: Colors.red[800]!.withOpacity(0.2),
                            ),
                            child: Text(
                              translate(context, 'connectToThisPartner'),
                              style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                                    color: Colors.red[800],
                                  ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      );
}
