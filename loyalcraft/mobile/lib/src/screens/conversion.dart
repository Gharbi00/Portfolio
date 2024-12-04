import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_diktup_utilities/extensions.dart';
import 'package:flutter_diktup_utilities/flutter_diktup_utilities.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-wallet-wallet.graphql.dart';
import 'package:flutter_loyalcraft_gql/graphql/point-of-sale.graphql.dart';
import 'package:flutter_loyalcraft_gql/schema.graphql.dart';
import 'package:loyalcraft/localizations_delegate/app_localizations.dart';
import 'package:loyalcraft/src/bloc/home_tab_index.dart';
import 'package:loyalcraft/src/bloc/variable.dart';
import 'package:loyalcraft/src/data/consts.dart';
import 'package:loyalcraft/src/data/flutter_messenger.dart';
import 'package:loyalcraft/src/data/graphql_client.dart';
import 'package:loyalcraft/src/data/shared_preferences.dart';
import 'package:loyalcraft/src/repository/wallet.dart';
import 'package:loyalcraft/src/screens/point_of_sale_landing.dart';
import 'package:loyalcraft/src/screens/points_of_sale.dart';
import 'package:loyalcraft/src/screens/successful.dart';
import 'package:loyalcraft/src/utils/image_cache_manager/shared_image_provider.dart';
import 'package:loyalcraft/src/widgets/custom_circular_progress_indicator.dart';
import 'package:loyalcraft/src/widgets/qualitative_quantitative.dart';

// ignore: must_be_immutable
class ConversionWidget extends StatefulWidget {
  ConversionWidget({
    Key? key,
    required this.getCurrentUserQuantitativeWallets,
    required this.appQuantitativeWallet,
    required this.pos,
  }) : super(key: key);
  Query$getCurrentUserQuantitativeWallets$getCurrentUserQuantitativeWallets? getCurrentUserQuantitativeWallets;
  Query$getCurrentUserQuantitativeWallets$getCurrentUserQuantitativeWallets? appQuantitativeWallet;
  Query$pointOfSale$pointOfSale pos;

  @override
  _ConversionWidget createState() => _ConversionWidget();
}

class _ConversionWidget extends State<ConversionWidget> with TickerProviderStateMixin {
  final TextEditingController _amountController = TextEditingController();
  final SGraphQLClient _sGraphQLClient = SGraphQLClient();
  late AnimationController _animationController;
  late VariableCubit _selectedAmountCubit;
  late WalletRepository _walletRepository;
  late VariableCubit<bool> _isLoadingCubit;
  late VariableCubit<String> _amountCubit;

  bool _formHasError({required int amount, required int appAmount, required double appUnitValue, required double posUnitValue}) =>
      amount < _getMinimumAmountToConvert(appUnitValue, posUnitValue) ||
      amount > appAmount ||
      appAmount <= _getMinimumAmountToConvert(appUnitValue, posUnitValue) ||
      _amountIsMultipleOf20Or00(amount.toString().toInteger()) == false ||
      _getAmountAfterConversion(amount: amount, appUnitValue: appUnitValue, posUnitValue: posUnitValue) < 1;

  double _getAmountAfterConversion({required int amount, required double appUnitValue, required double posUnitValue}) => (amount * appUnitValue) / posUnitValue;

  int _getMinimumAmountToConvert(double appUnitValue, double posUnitValue) => (appUnitValue / posUnitValue).ceil() < 500 ? 500 : (appUnitValue / posUnitValue).ceil();

  bool _amountIsMultipleOf20Or00(int amount) {
    var lastTwoDigits = amount % 100;
    return lastTwoDigits % 20 == 0 || lastTwoDigits == 0;
  }

  int roundDownToNearestMultipleOf20Or00(int number) {
    var lastTwoDigits = number % 100;
    var remainder = lastTwoDigits % 20;
    return number - remainder;
  }

  int roundUpToNearestMultipleOf20Or00(int number) {
    var lastTwoDigits = number % 100;
    var remainder = lastTwoDigits % 20;
    return number + (20 - remainder);
  }

  Future<void> _initState() async {
    _walletRepository = WalletRepository(_sGraphQLClient);
    _amountCubit = VariableCubit(value: '');
    _selectedAmountCubit = VariableCubit(value: 0);
    _isLoadingCubit = VariableCubit(value: false);
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1000),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _amountController.dispose();
    _animationController.dispose();
    _selectedAmountCubit.close();
    _amountCubit.close();
    _isLoadingCubit.close();

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
  Widget build(BuildContext context) {
    final _posAmount = widget.getCurrentUserQuantitativeWallets!.objects.first.amount.toInteger();
    final _appAmount = widget.appQuantitativeWallet!.objects.first.amount.toInteger();
    final _appCoin = widget.appQuantitativeWallet?.objects.first.coin;
    final _posCoin = widget.getCurrentUserQuantitativeWallets?.objects.first.coin;

    return MultiBlocProvider(
      providers: [
        BlocProvider(create: (context) => _isLoadingCubit),
        BlocProvider(create: (context) => _amountCubit),
        BlocProvider(create: (context) => _selectedAmountCubit),
      ],
      child: BlocBuilder<VariableCubit, dynamic>(
        bloc: _amountCubit,
        builder: (context, amount) => BlocBuilder<VariableCubit, dynamic>(
          bloc: _isLoadingCubit,
          builder: (context, isLoading) => BlocBuilder<VariableCubit, dynamic>(
            bloc: _selectedAmountCubit,
            builder: (context, selectedAmount) => Scaffold(
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
                        translate(context, 'conversion'),
                        style: Theme.of(context).textTheme.headlineSmall,
                      ),
                    ),
                  ],
                ),
              ),
              body: GestureDetector(
                onTap: () => closeTheKeyboard(context),
                child: SafeArea(
                  left: false,
                  top: false,
                  right: false,
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Expanded(
                          child: ListView(
                            padding: EdgeInsets.zero,
                            shrinkWrap: true,
                            primary: false,
                            children: [
                              Row(
                                children: [
                                  Expanded(
                                    child: Stack(
                                      alignment: Alignment.topRight,
                                      children: [
                                        Container(
                                          padding: const EdgeInsets.all(16.0),
                                          decoration: BoxDecoration(
                                            borderRadius: BorderRadius.circular(8.0),
                                            color: Theme.of(context).focusColor,
                                          ),
                                          child: Row(
                                            children: [
                                              SharedImageProviderWidget(
                                                imageUrl: kAppIcon,
                                                fit: BoxFit.cover,
                                                height: 40.0,
                                                width: 40.0,
                                              ),
                                              const SizedBox(width: 8.0),
                                              Expanded(
                                                child: Column(
                                                  crossAxisAlignment: CrossAxisAlignment.start,
                                                  mainAxisSize: MainAxisSize.min,
                                                  children: [
                                                    Text(
                                                      '$kAppName ${translate(context, 'balance')}',
                                                      style: Theme.of(context).textTheme.bodyLarge,
                                                    ),
                                                    const SizedBox(height: 4.0),
                                                    QualitativeQuantitativeWidget(
                                                      textStyle: Theme.of(context).textTheme.displayMedium!.copyWith(fontSize: 16.0),
                                                      walletType: Enum$WalletTypeEnum.QUANTITATIVE,
                                                      baseUrl: _appCoin?.picture?.baseUrl,
                                                      path: _appCoin?.picture?.path,
                                                      amount: _appAmount,
                                                      size: const Size(18.0, 18.0),
                                                      textAlign: TextAlign.center,
                                                    ),
                                                  ],
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),
                                        Positioned(
                                          right: 0.0,
                                          top: 0.0,
                                          child: Container(
                                            padding: const EdgeInsets.symmetric(vertical: 4.0, horizontal: 8.0),
                                            decoration: BoxDecoration(
                                              color: Theme.of(context).colorScheme.secondary,
                                              borderRadius: const BorderRadius.only(
                                                topLeft: Radius.circular(8.0),
                                                topRight: Radius.circular(8.0),
                                                bottomLeft: Radius.circular(8.0),
                                              ),
                                            ),
                                            child: Text(
                                              translate(context, 'from'),
                                              style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                                                    color: Theme.of(context).primaryColor,
                                                  ),
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  const SizedBox(width: 8.0),
                                  AnimatedBuilder(
                                    animation: _animationController,
                                    builder: (context, child) => Transform.translate(
                                      offset: Offset(0.0, 20.0 * _animationController.value - 10.0),
                                      child: Container(
                                        height: 26.0,
                                        width: 26.0,
                                        decoration: BoxDecoration(
                                          borderRadius: BorderRadius.circular(100.0),
                                          color: Theme.of(context).focusColor,
                                        ),
                                        child: Icon(
                                          CupertinoIcons.arrow_down,
                                          color: Theme.of(context).colorScheme.secondary,
                                          size: 14.0,
                                        ),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 16.0),
                              Stack(
                                alignment: Alignment.topRight,
                                children: [
                                  Container(
                                    padding: const EdgeInsets.all(16.0),
                                    decoration: BoxDecoration(
                                      borderRadius: BorderRadius.circular(8.0),
                                      color: Theme.of(context).focusColor,
                                    ),
                                    child: Row(
                                      children: [
                                        ((widget.pos.picture?.baseUrl ?? '').isEmpty || (widget.pos.picture?.path ?? '').isEmpty)
                                            ? Hero(
                                                tag: kEmptyPicture,
                                                child: Container(
                                                  alignment: Alignment.center,
                                                  height: 40.0,
                                                  width: 40.0,
                                                  padding: const EdgeInsets.all(4.0),
                                                  decoration: BoxDecoration(
                                                    color: Theme.of(context).focusColor,
                                                    borderRadius: BorderRadius.circular(100.0),
                                                  ),
                                                  child: SharedImageProviderWidget(
                                                    imageUrl: kEmptyPicture,
                                                    color: Theme.of(context).colorScheme.secondary,
                                                    height: 40.0,
                                                    width: 40.0,
                                                    fit: BoxFit.cover,
                                                  ),
                                                ),
                                              )
                                            : Hero(
                                                tag: '${widget.pos.picture!.baseUrl}/${widget.pos.picture!.path}',
                                                child: SharedImageProviderWidget(
                                                  imageUrl: '${widget.pos.picture!.baseUrl}/${widget.pos.picture!.path}',
                                                  color: Theme.of(context).colorScheme.secondary,
                                                  backgroundColor: Theme.of(context).focusColor,
                                                  borderRadius: BorderRadius.circular(100.0),
                                                  fit: BoxFit.cover,
                                                  width: 40.0,
                                                  height: 40.0,
                                                ),
                                              ),
                                        const SizedBox(width: 8.0),
                                        Expanded(
                                          child: Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            mainAxisSize: MainAxisSize.min,
                                            children: [
                                              Text(
                                                '${widget.pos.title} ${translate(context, 'balance')}',
                                                style: Theme.of(context).textTheme.bodyLarge,
                                              ),
                                              const SizedBox(height: 4.0),
                                              QualitativeQuantitativeWidget(
                                                textStyle: Theme.of(context).textTheme.displayMedium!.copyWith(fontSize: 16.0),
                                                walletType: Enum$WalletTypeEnum.QUANTITATIVE,
                                                baseUrl: _posCoin?.picture?.baseUrl,
                                                path: _posCoin?.picture?.path,
                                                amount: _posAmount,
                                                size: const Size(18.0, 18.0),
                                                textAlign: TextAlign.center,
                                              ),
                                            ],
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  Positioned(
                                    right: 0.0,
                                    top: 0.0,
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(vertical: 4.0, horizontal: 8.0),
                                      decoration: BoxDecoration(
                                        color: Theme.of(context).colorScheme.secondary,
                                        borderRadius: const BorderRadius.only(
                                          topLeft: Radius.circular(8.0),
                                          topRight: Radius.circular(8.0),
                                          bottomLeft: Radius.circular(8.0),
                                        ),
                                      ),
                                      child: Text(
                                        translate(context, 'to'),
                                        style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                                              color: Theme.of(context).primaryColor,
                                            ),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 16.0),
                              Text(
                                translate(context, 'amountToConvert'),
                                style: Theme.of(context).textTheme.bodyLarge,
                              ),
                              const SizedBox(height: 16.0),
                              Text(
                                translate(context, 'conversionText1'),
                                style: Theme.of(context).textTheme.bodySmall,
                              ),
                              const SizedBox(height: 16.0),
                              Row(
                                children: [
                                  Expanded(
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 16.0),
                                      decoration: BoxDecoration(
                                        border: Border.all(color: Colors.grey[800]!, width: 0.4),
                                        borderRadius: BorderRadius.circular(8.0),
                                      ),
                                      child: TextField(
                                        onTapOutside: (value) => FocusManager.instance.primaryFocus?.unfocus,
                                        cursorColor: Theme.of(context).colorScheme.secondary,
                                        style: Theme.of(context).textTheme.bodyMedium,
                                        onChanged: _amountCubit.updateValue,
                                        keyboardType: TextInputType.number,
                                        controller: _amountController,
                                        decoration: InputDecoration(
                                          enabledBorder: const UnderlineInputBorder(borderSide: BorderSide.none),
                                          focusedBorder: const UnderlineInputBorder(borderSide: BorderSide.none),
                                          border: const UnderlineInputBorder(borderSide: BorderSide.none),
                                          hintStyle: Theme.of(context).textTheme.bodyMedium,
                                          hintText: translate(context, 'amount'),
                                        ),
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 8.0),
                                  QualitativeQuantitativeWidget(
                                    textStyle: null,
                                    walletType: Enum$WalletTypeEnum.QUANTITATIVE,
                                    baseUrl: _appCoin?.picture?.baseUrl,
                                    path: _appCoin?.picture?.path,
                                    amount: null,
                                    size: const Size(26.0, 26.0),
                                    textAlign: TextAlign.center,
                                  ),
                                ],
                              ),
                              const SizedBox(height: 16.0),
                              Wrap(
                                crossAxisAlignment: WrapCrossAlignment.center,
                                alignment: WrapAlignment.end,
                                children: [
                                  Text(
                                    '${translate(context, 'equal')} ',
                                    style: Theme.of(context).textTheme.bodyMedium,
                                  ),
                                  QualitativeQuantitativeWidget(
                                    textStyle: Theme.of(context).textTheme.bodyMedium,
                                    walletType: Enum$WalletTypeEnum.QUANTITATIVE,
                                    baseUrl: _posCoin?.picture?.baseUrl,
                                    path: _posCoin?.picture?.path,
                                    amount: _getAmountAfterConversion(
                                      amount: amount.toString().toInteger(),
                                      appUnitValue: (_appCoin?.unitValue?.amount ?? '').toDouble(),
                                      posUnitValue: (_posCoin?.unitValue?.amount ?? '').toDouble(),
                                    ).floor(),
                                    size: const Size(18.0, 18.0),
                                    textAlign: TextAlign.center,
                                  ),
                                ],
                              ),
                              const SizedBox(height: 16.0),
                              Center(
                                child: Container(
                                  width: kAppSize.width / 1.6,
                                  decoration: DottedBorder(
                                    borderRadius: BorderRadius.circular(100.0),
                                  ),
                                ),
                              ),
                              if (_amountIsMultipleOf20Or00(amount.toString().toInteger()) == false &&
                                  amount.toString().toInteger() >
                                      _getMinimumAmountToConvert(
                                        (_appCoin?.unitValue?.amount ?? '').toDouble(),
                                        (_posCoin?.unitValue?.amount ?? '').toDouble(),
                                      ))
                                Padding(
                                  padding: const EdgeInsets.only(top: 16.0),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Text(
                                        translate(context, 'conversionText2'),
                                        style: Theme.of(context).textTheme.bodyMedium,
                                      ),
                                      const SizedBox(height: 16.0),
                                      Row(
                                        children: [
                                          Expanded(
                                            child: GestureDetector(
                                              onTap: () {
                                                _selectedAmountCubit.updateValue(roundDownToNearestMultipleOf20Or00(amount.toString().toInteger()));
                                                _amountController.text = '${roundDownToNearestMultipleOf20Or00(amount.toString().toInteger())}';
                                                _amountCubit.updateValue('${roundUpToNearestMultipleOf20Or00(amount.toString().toInteger())}');
                                              },
                                              child: Container(
                                                alignment: Alignment.center,
                                                padding: const EdgeInsets.symmetric(vertical: 8.0, horizontal: 16.0),
                                                decoration: BoxDecoration(
                                                  color: selectedAmount == amount.toString().toInteger() ? kAppColor : Theme.of(context).focusColor,
                                                  borderRadius: BorderRadius.circular(8.0),
                                                ),
                                                child: Text(
                                                  '${roundDownToNearestMultipleOf20Or00(amount.toString().toInteger())}',
                                                  textAlign: TextAlign.center,
                                                  style: Theme.of(context).textTheme.displayLarge!.copyWith(
                                                        color: selectedAmount == amount.toString().toInteger() ? Colors.white : Theme.of(context).colorScheme.secondary,
                                                      ),
                                                ),
                                              ),
                                            ),
                                          ),
                                          const SizedBox(width: 16.0),
                                          Text(
                                            translate(context, 'or'),
                                            style: Theme.of(context).textTheme.bodySmall,
                                          ),
                                          const SizedBox(width: 16.0),
                                          Expanded(
                                            child: GestureDetector(
                                              onTap: () {
                                                _selectedAmountCubit.updateValue(roundUpToNearestMultipleOf20Or00(amount.toString().toInteger()));
                                                _amountController.text = '${roundUpToNearestMultipleOf20Or00(amount.toString().toInteger())}';
                                                _amountCubit.updateValue('${roundUpToNearestMultipleOf20Or00(amount.toString().toInteger())}');
                                              },
                                              child: Container(
                                                alignment: Alignment.center,
                                                padding: const EdgeInsets.symmetric(vertical: 8.0, horizontal: 16.0),
                                                decoration: BoxDecoration(
                                                  color: selectedAmount == amount.toString().toInteger() ? kAppColor : Theme.of(context).focusColor,
                                                  borderRadius: BorderRadius.circular(8.0),
                                                ),
                                                child: Text(
                                                  '${roundUpToNearestMultipleOf20Or00(amount.toString().toInteger())}',
                                                  textAlign: TextAlign.center,
                                                  style: Theme.of(context).textTheme.displayLarge!.copyWith(
                                                        color: selectedAmount == amount.toString().toInteger() ? Colors.white : Theme.of(context).colorScheme.secondary,
                                                      ),
                                                ),
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                              if (_appAmount >
                                  _getMinimumAmountToConvert(
                                    (_appCoin?.unitValue?.amount ?? '').toDouble(),
                                    (_posCoin?.unitValue?.amount ?? '').toDouble(),
                                  ))
                                const SizedBox(height: 16.0),
                              if (_appAmount >
                                  _getMinimumAmountToConvert(
                                    (_appCoin?.unitValue?.amount ?? '').toDouble(),
                                    (_posCoin?.unitValue?.amount ?? '').toDouble(),
                                  ))
                                Opacity(
                                  opacity: amount.toString().toInteger() >=
                                              _getMinimumAmountToConvert(
                                                (_appCoin?.unitValue?.amount ?? '').toDouble(),
                                                (_posCoin?.unitValue?.amount ?? '').toDouble(),
                                              ) &&
                                          amount.toString().toInteger() <= _appAmount
                                      ? 1.0
                                      : 0.5,
                                  child: Row(
                                    children: [
                                      Icon(
                                        color: Theme.of(context).colorScheme.secondary,
                                        amount.toString().toInteger() >=
                                                    _getMinimumAmountToConvert(
                                                      (_appCoin?.unitValue?.amount ?? '').toDouble(),
                                                      (_posCoin?.unitValue?.amount ?? '').toDouble(),
                                                    ) &&
                                                amount.toString().toInteger() <= _appAmount
                                            ? CupertinoIcons.check_mark
                                            : CupertinoIcons.clear,
                                        size: 18.0,
                                      ),
                                      const SizedBox(width: 4.0),
                                      Expanded(
                                        child: Wrap(
                                          spacing: 4.0,
                                          runSpacing: 4.0,
                                          crossAxisAlignment: WrapCrossAlignment.center,
                                          children: [
                                            Text(
                                              '${translate(context, 'amountIsBetween')} ',
                                              style: Theme.of(context).textTheme.bodyMedium,
                                            ),
                                            QualitativeQuantitativeWidget(
                                              textStyle: Theme.of(context).textTheme.bodyLarge,
                                              walletType: Enum$WalletTypeEnum.QUANTITATIVE,
                                              baseUrl: _appCoin?.picture?.baseUrl,
                                              path: _appCoin?.picture?.path,
                                              amount: _getMinimumAmountToConvert(
                                                (_appCoin?.unitValue?.amount ?? '').toDouble(),
                                                (_posCoin?.unitValue?.amount ?? '').toDouble(),
                                              ),
                                              size: const Size(18.0, 18.0),
                                              textAlign: TextAlign.center,
                                            ),
                                            Text(
                                              translate(context, 'and'),
                                              style: Theme.of(context).textTheme.bodyMedium,
                                            ),
                                            QualitativeQuantitativeWidget(
                                              textStyle: Theme.of(context).textTheme.bodyLarge,
                                              walletType: Enum$WalletTypeEnum.QUANTITATIVE,
                                              baseUrl: _appCoin?.picture?.baseUrl,
                                              path: _appCoin?.picture?.path,
                                              amount: _appAmount,
                                              size: const Size(18.0, 18.0),
                                              textAlign: TextAlign.center,
                                            ),
                                          ],
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              const SizedBox(height: 16.0),
                              Row(
                                children: [
                                  Icon(
                                    color: _getAmountAfterConversion(
                                              amount: amount.toString().toInteger(),
                                              appUnitValue: (_appCoin?.unitValue?.amount ?? '').toDouble(),
                                              posUnitValue: (_posCoin?.unitValue?.amount ?? '').toDouble(),
                                            ).floor() >=
                                            1
                                        ? Theme.of(context).colorScheme.secondary
                                        : Theme.of(context).colorScheme.secondary.withOpacity(0.6),
                                    _getAmountAfterConversion(
                                              amount: amount.toString().toInteger(),
                                              appUnitValue: (_appCoin?.unitValue?.amount ?? '').toDouble(),
                                              posUnitValue: (_posCoin?.unitValue?.amount ?? '').toDouble(),
                                            ).floor() >=
                                            1
                                        ? CupertinoIcons.check_mark
                                        : CupertinoIcons.clear,
                                    size: 18.0,
                                  ),
                                  const SizedBox(width: 4.0),
                                  Expanded(
                                    child: RichText(
                                      text: TextSpan(
                                        children: [
                                          TextSpan(
                                            text: '${translate(context, 'amountAfterConversionShouldBeGreaterOrEqualTo')} ',
                                            style: Theme.of(context).textTheme.bodyMedium!.copyWith(
                                                  color: _getAmountAfterConversion(
                                                            amount: amount.toString().toInteger(),
                                                            appUnitValue: (_appCoin?.unitValue?.amount ?? '').toDouble(),
                                                            posUnitValue: (_posCoin?.unitValue?.amount ?? '').toDouble(),
                                                          ).floor() >=
                                                          1
                                                      ? Theme.of(context).colorScheme.secondary
                                                      : Theme.of(context).colorScheme.secondary.withOpacity(0.6),
                                                ),
                                          ),
                                          WidgetSpan(
                                            child: QualitativeQuantitativeWidget(
                                              textStyle: Theme.of(context).textTheme.bodyLarge,
                                              walletType: Enum$WalletTypeEnum.QUANTITATIVE,
                                              baseUrl: _posCoin?.picture?.baseUrl,
                                              path: _posCoin?.picture?.path,
                                              amount: 1,
                                              size: const Size(18.0, 18.0),
                                              textAlign: TextAlign.center,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 16.0),
                              Row(
                                children: [
                                  Icon(
                                    color: _appAmount.toString().toInteger() >=
                                            _getMinimumAmountToConvert(
                                              (_appCoin?.unitValue?.amount ?? '').toDouble(),
                                              (_posCoin?.unitValue?.amount ?? '').toDouble(),
                                            )
                                        ? Theme.of(context).colorScheme.secondary
                                        : Theme.of(context).colorScheme.secondary.withOpacity(0.6),
                                    _appAmount.toString().toInteger() >=
                                            _getMinimumAmountToConvert(
                                              (_appCoin?.unitValue?.amount ?? '').toDouble(),
                                              (_posCoin?.unitValue?.amount ?? '').toDouble(),
                                            )
                                        ? CupertinoIcons.check_mark
                                        : CupertinoIcons.clear,
                                    size: 18.0,
                                  ),
                                  const SizedBox(width: 4.0),
                                  Expanded(
                                    child: RichText(
                                      text: TextSpan(
                                        children: [
                                          TextSpan(
                                            text: '$kAppName ${translate(context, 'balanceIsEqualOrGreaterThan')} ',
                                            style: Theme.of(context).textTheme.bodyMedium!.copyWith(
                                                  color: _appAmount.toString().toInteger() >=
                                                          _getMinimumAmountToConvert(
                                                            (_appCoin?.unitValue?.amount ?? '').toDouble(),
                                                            (_posCoin?.unitValue?.amount ?? '').toDouble(),
                                                          )
                                                      ? Theme.of(context).colorScheme.secondary
                                                      : Theme.of(context).colorScheme.secondary.withOpacity(0.6),
                                                ),
                                          ),
                                          WidgetSpan(
                                            child: QualitativeQuantitativeWidget(
                                              textStyle: Theme.of(context).textTheme.bodyLarge!.copyWith(
                                                    color: _appAmount.toString().toInteger() >=
                                                            _getMinimumAmountToConvert(
                                                              (_appCoin?.unitValue?.amount ?? '').toDouble(),
                                                              (_posCoin?.unitValue?.amount ?? '').toDouble(),
                                                            )
                                                        ? Theme.of(context).colorScheme.secondary
                                                        : Theme.of(context).colorScheme.secondary.withOpacity(0.6),
                                                  ),
                                              walletType: Enum$WalletTypeEnum.QUANTITATIVE,
                                              baseUrl: _appCoin?.picture?.baseUrl,
                                              path: _appCoin?.picture?.path,
                                              amount: _getMinimumAmountToConvert(
                                                (_appCoin?.unitValue?.amount ?? '').toDouble(),
                                                (_posCoin?.unitValue?.amount ?? '').toDouble(),
                                              ),
                                              size: const Size(18.0, 18.0),
                                              textAlign: TextAlign.center,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              if (_formHasError(
                                    appUnitValue: (_appCoin?.unitValue?.amount ?? '').toDouble(),
                                    posUnitValue: (_posCoin?.unitValue?.amount ?? '').toDouble(),
                                    amount: amount.toString().toInteger(),
                                    appAmount: _appAmount,
                                  ) ==
                                  false)
                                Padding(
                                  padding: const EdgeInsets.only(top: 16.0),
                                  child: Center(
                                    child: Container(
                                      width: kAppSize.width / 1.6,
                                      decoration: DottedBorder(
                                        borderRadius: BorderRadius.circular(100.0),
                                      ),
                                    ),
                                  ),
                                ),
                              if (_formHasError(
                                    appUnitValue: (_appCoin?.unitValue?.amount ?? '').toDouble(),
                                    posUnitValue: (_posCoin?.unitValue?.amount ?? '').toDouble(),
                                    amount: amount.toString().toInteger(),
                                    appAmount: _appAmount,
                                  ) ==
                                  false)
                                Padding(
                                  padding: const EdgeInsets.only(top: 16.0),
                                  child: Wrap(
                                    alignment: WrapAlignment.center,
                                    crossAxisAlignment: WrapCrossAlignment.center,
                                    children: [
                                      Text(
                                        '${translate(context, 'remaining')} $kAppName ${translate(context, 'balance')} ',
                                        style: Theme.of(context).textTheme.bodyMedium,
                                      ),
                                      QualitativeQuantitativeWidget(
                                        textStyle: Theme.of(context).textTheme.bodyLarge,
                                        walletType: Enum$WalletTypeEnum.QUANTITATIVE,
                                        baseUrl: _appCoin?.picture?.baseUrl,
                                        path: _appCoin?.picture?.path,
                                        amount: _appAmount - amount.toString().toInteger(),
                                        size: const Size(18.0, 18.0),
                                        textAlign: TextAlign.center,
                                      ),
                                    ],
                                  ),
                                ),
                              if (_formHasError(
                                    appUnitValue: (_appCoin?.unitValue?.amount ?? '').toDouble(),
                                    posUnitValue: (_posCoin?.unitValue?.amount ?? '').toDouble(),
                                    amount: amount.toString().toInteger(),
                                    appAmount: _appAmount,
                                  ) ==
                                  false)
                                Padding(
                                  padding: const EdgeInsets.only(top: 16.0),
                                  child: Wrap(
                                    alignment: WrapAlignment.center,
                                    crossAxisAlignment: WrapCrossAlignment.center,
                                    children: [
                                      Text(
                                        '${translate(context, 'youWillGet')} + ',
                                        style: Theme.of(context).textTheme.bodyMedium,
                                      ),
                                      QualitativeQuantitativeWidget(
                                        textStyle: Theme.of(context).textTheme.bodyLarge,
                                        walletType: Enum$WalletTypeEnum.QUANTITATIVE,
                                        baseUrl: _posCoin?.picture?.baseUrl,
                                        path: _posCoin?.picture?.path,
                                        amount: _getAmountAfterConversion(
                                          amount: amount.toString().toInteger(),
                                          appUnitValue: (_appCoin?.unitValue?.amount ?? '').toDouble(),
                                          posUnitValue: (_posCoin?.unitValue?.amount ?? '').toDouble(),
                                        ).floor(),
                                        size: const Size(18.0, 18.0),
                                        textAlign: TextAlign.center,
                                      ),
                                      Text(
                                        ' ${translate(context, 'inYour')} ${widget.pos.title} ${translate(context, 'balance')}',
                                        style: Theme.of(context).textTheme.bodyMedium,
                                      ),
                                    ],
                                  ),
                                ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 16.0),
                        BlocBuilder<VariableCubit, dynamic>(
                          bloc: _isLoadingCubit,
                          builder: (context, isLoading) => isLoading
                              ? CustomCircularProgressIndicatorWidget(
                                  backgroundColor: Theme.of(context).focusColor,
                                  alignment: Alignment.center,
                                  padding: const EdgeInsets.all(14.0),
                                  color: kAppColor,
                                )
                              : TextButton(
                                  style: TextButton.styleFrom(
                                    disabledBackgroundColor: kAppColor.withOpacity(0.6),
                                    minimumSize: const Size.fromHeight(40.0),
                                    backgroundColor: kAppColor,
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(8.0),
                                    ),
                                  ),
                                  onPressed: _formHasError(
                                    appUnitValue: (_appCoin?.unitValue?.amount ?? '').toDouble(),
                                    posUnitValue: (_posCoin?.unitValue?.amount ?? '').toDouble(),
                                    amount: amount.toString().toInteger(),
                                    appAmount: _appAmount,
                                  )
                                      ? null
                                      : () async {
                                          _isLoadingCubit.updateValue(true);
                                          final convertWalletPoints = await _walletRepository
                                              .convertWalletPoints(
                                            Variables$Mutation$convertWalletPoints(
                                              input: Input$WalletConversionInput(
                                                debitor: Input$WalletConversionEntryInput(
                                                  amount: '$amount',
                                                  wallet: widget.appQuantitativeWallet!.objects.first.id,
                                                ),
                                                receiver: Input$WalletConversionEntryInput(
                                                  amount: _getAmountAfterConversion(
                                                    amount: amount.toString().toInteger(),
                                                    appUnitValue: (_appCoin?.unitValue?.amount ?? '').toDouble(),
                                                    posUnitValue: (_posCoin?.unitValue?.amount ?? '').toDouble(),
                                                  ).floor().toString(),
                                                  wallet: widget.getCurrentUserQuantitativeWallets!.objects.first.id,
                                                ),
                                              ),
                                            ),
                                          )
                                              .catchError((onError) {
                                            _isLoadingCubit.updateValue(false);
                                            return null;
                                          });
                                          if (convertWalletPoints == null) {
                                            FlutterMessenger.showSnackbar(context: context, string: translate(context, 'generalErrorMessage'));
                                          } else {
                                            addHomeTabIndexToSP(4);
                                            BlocProvider.of<HomeTabIndexCubit>(context).updateValue(4);
                                            Navigator.of(context).pushNamedAndRemoveUntil('/Tabs', (route) => false);
                                            Navigator.push(context, MaterialPageRoute(builder: (context) => const PointsOfSaleWidget()));
                                            Navigator.push(
                                              context,
                                              MaterialPageRoute(
                                                builder: (context) => PointOfSaleLandingWidget(
                                                  pos: widget.pos,
                                                ),
                                              ),
                                            );
                                            showGeneralDialog(
                                              transitionDuration: const Duration(milliseconds: 1),
                                              barrierColor: Colors.transparent,
                                              barrierLabel: '',
                                              context: context,
                                              pageBuilder: (context, anim1, anim2) => SuccessfulDialog(
                                                description: translate(context, 'conversionDialogSuccessfulDescription'),
                                                subTitle: translate(context, 'conversionDialogSuccessfulSubtitle'),
                                                title: translate(context, 'conversionDialogSuccessfulTitle'),
                                                onCancel: (value) => Navigator.pop(context),
                                                onPressed: (value) => Navigator.pop(context),
                                              ),
                                            );
                                          }
                                          _isLoadingCubit.updateValue(false);
                                        },
                                  child: Text(
                                    translate(context, 'confirm'),
                                    textAlign: TextAlign.center,
                                    style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                                          color: Colors.white,
                                        ),
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
        ),
      ),
    );
  }
}
