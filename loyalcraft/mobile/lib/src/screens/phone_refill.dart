import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_diktup_utilities/extensions.dart';
import 'package:flutter_diktup_utilities/flutter_diktup_utilities.dart';
import 'package:flutter_loyalcraft_gql/graphql/bitaka.graphql.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-wallet-wallet.graphql.dart';
import 'package:flutter_loyalcraft_gql/schema.graphql.dart';
import 'package:loyalcraft/localizations_delegate/app_localizations.dart';
import 'package:loyalcraft/src/bloc/home_tab_index.dart';
import 'package:loyalcraft/src/bloc/pos.dart';
import 'package:loyalcraft/src/bloc/variable.dart';
import 'package:loyalcraft/src/bloc/wallet.dart';
import 'package:loyalcraft/src/data/consts.dart';
import 'package:loyalcraft/src/data/flutter_messenger.dart';
import 'package:loyalcraft/src/data/graphql_client.dart';
import 'package:loyalcraft/src/data/shared_preferences.dart';
import 'package:loyalcraft/src/modal_bottom_sheet/confirm_phone_refill.dart';
import 'package:loyalcraft/src/models/commun_class.dart';
import 'package:loyalcraft/src/models/dial_code.dart';
import 'package:loyalcraft/src/repository/bitaka.dart';
import 'package:loyalcraft/src/screens/successful.dart';
import 'package:loyalcraft/src/utils/image_cache_manager/shared_image_provider.dart';
import 'package:loyalcraft/src/widgets/custom_circular_progress_indicator.dart';
import 'package:loyalcraft/src/widgets/empty.dart';
import 'package:loyalcraft/src/widgets/qualitative_quantitative.dart';

// ignore: must_be_immutable
class PhoneRefillWidget extends StatefulWidget {
  const PhoneRefillWidget({
    Key? key,
  }) : super(key: key);

  @override
  _PhoneRefillWidget createState() => _PhoneRefillWidget();
}

class _PhoneRefillWidget extends State<PhoneRefillWidget> with TickerProviderStateMixin {
  final TextEditingController _phoneNumberController = TextEditingController();
  final TextEditingController _amountController = TextEditingController();
  final SGraphQLClient _sGraphQLClient = SGraphQLClient();
  late VariableCubit<double> _selectedAmountCubit;
  late VariableCubit<CommunClass> _operatorCubit;
  late VariableCubit<String> _phoneNumberCubit;
  late VariableCubit<bool> _isLoadingCubit;
  late VariableCubit<String> _amountCubit;
  late BitakaRepository _bitakaRepository;
  late VariableCubit<DialCode> _dialCodeCubit;

  Future<void> _initializeState() async {
    _amountCubit = VariableCubit(value: '');
    _selectedAmountCubit = VariableCubit(value: 0);
    _isLoadingCubit = VariableCubit(value: false);
    _operatorCubit = VariableCubit(value: kOperatorsList.first);
    _phoneNumberCubit = VariableCubit(value: '');
    _dialCodeCubit = VariableCubit(value: kDialCodeList.first);
    _bitakaRepository = BitakaRepository(_sGraphQLClient);
    await BlocProvider.of<CurrentUserQuantitativeWalletsCubit>(context).getCurrentUserQuantitativeWallets(
      Variables$Query$getCurrentUserQuantitativeWallets(
        pagination: Input$PaginationInput(
          page: kPaginationPage,
          limit: kPaginationLimit,
        ),
      ),
    );
    final user = await getUserFromSP();
    if (user?.phone?.number?.isNotEmpty ?? false) {
      _phoneNumberCubit.updateValue(user!.phone!.number);
      _phoneNumberController.text = user.phone!.number.removeNull();
    }
  }

  bool _isFormValid({
    required double amount,
    required int appAmount,
    required double appUnitValue,
    required String phoneNumber,
  }) {
    final isAmountValid = amount.toString().isDouble() == false ||
        appAmount <= _calculateMinimumAmount(appUnitValue) ||
        _hasValidFraction(amount) == false ||
        phoneNumber.length != 8 ||
        phoneNumber.isInteger() == false;
    return isAmountValid;
  }

  double _calculateAmountAfterConversion({required double amount, required double unitValue}) => amount / unitValue;

  int _calculateMinimumAmount(double unitValue) {
    final minAmount = (kMinimumAmountToRefill / unitValue).ceil();
    return minAmount < 1 ? 1 : minAmount;
  }

  bool _hasValidFraction(double amount) {
    if (amount >= 1 && amount <= 50) {
      final fractionalPart = amount % 1;
      return fractionalPart == 0 || fractionalPart == 0.5;
    }
    return false;
  }

  double _roundDown(double number) => number % 1 >= 0.5 ? number.floor() + 0.5 : number.floor().toDouble();

  double _roundUp(double number) {
    final fractionalPart = number % 1;
    if (fractionalPart == 0) {
      return number + 0.5;
    } else {
      return fractionalPart < 0.5 ? number.floor() + 0.5 : number.ceil().toDouble();
    }
  }

  @override
  void dispose() {
    _amountController.dispose();
    _phoneNumberController.dispose();
    _selectedAmountCubit.close();
    _isLoadingCubit.close();
    _operatorCubit.close();
    _phoneNumberCubit.close();
    _amountCubit.close();
    _dialCodeCubit.close();
    super.dispose();
  }

  @override
  void initState() {
    super.initState();
    _initializeState();
  }

  @override
  Widget build(BuildContext context) {
    var _currentUserQuantitativeWallets = context.watch<CurrentUserQuantitativeWalletsCubit>().state;
    var _pos = context.watch<PosCubit>().state;

    Query$getCurrentUserQuantitativeWallets$getCurrentUserQuantitativeWallets$objects$coin? _appCoin;
    var _unitValue = 0.0;
    var _appAmount = 0;

    if ((_currentUserQuantitativeWallets?.objects ?? []).isNotEmpty) {
      _appAmount = _currentUserQuantitativeWallets!.objects.first.amount.toInteger();
      _appCoin = _currentUserQuantitativeWallets.objects.first.coin;
      _unitValue = (_appCoin?.unitValue?.amount ?? '0').toDouble();
    }
    return MultiBlocProvider(
      providers: [
        BlocProvider(create: (context) => _selectedAmountCubit),
        BlocProvider(create: (context) => _phoneNumberCubit),
        BlocProvider(create: (context) => _isLoadingCubit),
        BlocProvider(create: (context) => _operatorCubit),
        BlocProvider(create: (context) => _dialCodeCubit),
        BlocProvider(create: (context) => _amountCubit),
      ],
      child: BlocBuilder<VariableCubit, dynamic>(
        bloc: _dialCodeCubit,
        builder: (context, dialCode) => BlocBuilder<VariableCubit, dynamic>(
          bloc: _amountCubit,
          builder: (context, amount) => BlocBuilder<VariableCubit, dynamic>(
            bloc: _isLoadingCubit,
            builder: (context, isLoading) => BlocBuilder<VariableCubit, dynamic>(
              bloc: _selectedAmountCubit,
              builder: (context, selectedAmount) => BlocBuilder<VariableCubit, dynamic>(
                bloc: _operatorCubit,
                builder: (context, operator) => BlocBuilder<VariableCubit, dynamic>(
                  bloc: _phoneNumberCubit,
                  builder: (context, phoneNumber) => Scaffold(
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
                              translate(context, 'phoneRefill'),
                              style: Theme.of(context).textTheme.headlineSmall,
                            ),
                          ),
                        ],
                      ),
                    ),
                    body: _currentUserQuantitativeWallets == null
                        ? const SizedBox()
                        : _currentUserQuantitativeWallets.objects.isEmpty
                            ? EmptyWidget(
                                description: translate(context, 'walletEmptyDescription'),
                                title: translate(context, 'walletEmptyTitle'),
                                iconData: CupertinoIcons.creditcard_fill,
                                padding: const EdgeInsets.all(16.0),
                              )
                            : GestureDetector(
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
                                              Text(
                                                '${_pos?.title ?? '-'} ${translate(context, 'balance')}',
                                                style: Theme.of(context).textTheme.bodyLarge,
                                              ),
                                              const SizedBox(height: 16.0),
                                              QualitativeQuantitativeWidget(
                                                textStyle: Theme.of(context).textTheme.displayMedium,
                                                walletType: Enum$WalletTypeEnum.QUANTITATIVE,
                                                baseUrl: _appCoin!.picture?.baseUrl,
                                                path: _appCoin.picture?.path,
                                                size: const Size(26.0, 26.0),
                                                textAlign: TextAlign.start,
                                                amount: _appAmount,
                                              ),
                                              if (_appAmount.toString().toDouble() < _calculateMinimumAmount(_unitValue))
                                                Container(
                                                  margin: const EdgeInsets.only(top: 16.0),
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
                                                        child: RichText(
                                                          text: TextSpan(
                                                            children: [
                                                              TextSpan(
                                                                text: '$kAppName ${translate(context, 'phoneRefillText1')} ',
                                                                style: Theme.of(context).textTheme.bodyMedium!.copyWith(
                                                                      color: Colors.red[800],
                                                                    ),
                                                              ),
                                                              WidgetSpan(
                                                                child: QualitativeQuantitativeWidget(
                                                                  textStyle: Theme.of(context).textTheme.bodyLarge!.copyWith(color: Colors.red[800]),
                                                                  walletType: Enum$WalletTypeEnum.QUANTITATIVE,
                                                                  baseUrl: _appCoin.picture?.baseUrl,
                                                                  path: _appCoin.picture?.path,
                                                                  amount: _calculateMinimumAmount(_unitValue),
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
                                                ),
                                              const SizedBox(height: 16.0),
                                              Text(
                                                translate(context, 'operator'),
                                                style: Theme.of(context).textTheme.bodyLarge,
                                              ),
                                              const SizedBox(height: 16.0),
                                              Wrap(
                                                spacing: 8.0,
                                                runSpacing: 8.0,
                                                children: List.generate(
                                                  kOperatorsList.length,
                                                  (index) => GestureDetector(
                                                    onTap: () => _operatorCubit.updateValue(kOperatorsList[index]),
                                                    child: Opacity(
                                                      opacity: operator == kOperatorsList[index] ? 1.0 : 0.5,
                                                      child: Container(
                                                        margin: EdgeInsets.only(left: index == 0 ? 0.0 : 8.0),
                                                        padding: const EdgeInsets.all(8.0),
                                                        decoration: BoxDecoration(
                                                          color: Theme.of(context).focusColor.withOpacity(1.0),
                                                          borderRadius: BorderRadius.circular(8.0),
                                                        ),
                                                        child: Wrap(
                                                          crossAxisAlignment: WrapCrossAlignment.center,
                                                          spacing: 2.0,
                                                          runSpacing: 2.0,
                                                          children: [
                                                            SharedImageProviderWidget(
                                                              imageUrl: kOperatorsList[index].image.removeNull(),
                                                              color: Theme.of(context).colorScheme.secondary,
                                                              backgroundColor: Theme.of(context).focusColor,
                                                              borderRadius: BorderRadius.circular(4.0),
                                                              fit: BoxFit.cover,
                                                              height: 30.0,
                                                              width: 30.0,
                                                            ),
                                                            const SizedBox(width: 8.0),
                                                            Text(
                                                              kOperatorsList[index].title,
                                                              style: Theme.of(context).textTheme.bodyMedium,
                                                            ),
                                                          ],
                                                        ),
                                                      ),
                                                    ),
                                                  ),
                                                ),
                                              ),
                                              const SizedBox(height: 16.0),
                                              Text(
                                                translate(context, 'phoneNumber'),
                                                style: Theme.of(context).textTheme.bodyLarge,
                                              ),
                                              const SizedBox(height: 16.0),
                                              Container(
                                                padding: const EdgeInsets.only(right: 16.0, left: 8.0),
                                                decoration: BoxDecoration(
                                                  border: Border.all(color: Colors.grey[800]!, width: 0.4),
                                                  borderRadius: BorderRadius.circular(8.0),
                                                ),
                                                child: Row(
                                                  children: [
                                                    GestureDetector(
                                                      // onTap: () {
                                                      //   showSelectDialCodeSheet(
                                                      //     refreshTheView: _dialCodeCubit.updateValue,
                                                      //     currentDialCode: _dialCodeCubit.state!,
                                                      //     context: context,
                                                      //   );
                                                      // },
                                                      child: Container(
                                                        alignment: Alignment.center,
                                                        height: 30.0,
                                                        width: 30.0,
                                                        decoration: BoxDecoration(
                                                          color: Theme.of(context).focusColor,
                                                          borderRadius: BorderRadius.circular(100.0),
                                                        ),
                                                        child: Text(
                                                          dialCode.flag,
                                                          style: Theme.of(context).textTheme.displayMedium!.copyWith(fontSize: 20.0),
                                                        ),
                                                      ),
                                                    ),
                                                    const SizedBox(width: 4.0),
                                                    Text(
                                                      dialCode.dialCode,
                                                      style: Theme.of(context).textTheme.bodyMedium,
                                                    ),
                                                    const SizedBox(width: 8.0),
                                                    Expanded(
                                                      child: TextField(
                                                        onTapOutside: (value) => FocusManager.instance.primaryFocus?.unfocus,
                                                        cursorColor: Theme.of(context).colorScheme.secondary,
                                                        inputFormatters: [LengthLimitingTextInputFormatter(8)],
                                                        style: Theme.of(context).textTheme.bodyMedium,
                                                        onChanged: _phoneNumberCubit.updateValue,
                                                        keyboardType: TextInputType.phone,
                                                        controller: _phoneNumberController,
                                                        decoration: InputDecoration(
                                                          enabledBorder: const UnderlineInputBorder(borderSide: BorderSide.none),
                                                          focusedBorder: const UnderlineInputBorder(borderSide: BorderSide.none),
                                                          border: const UnderlineInputBorder(borderSide: BorderSide.none),
                                                          hintStyle: Theme.of(context).textTheme.bodyMedium,
                                                          hintText: translate(context, 'phoneNumber'),
                                                        ),
                                                      ),
                                                    ),
                                                  ],
                                                ),
                                              ),
                                              const SizedBox(height: 16.0),
                                              Row(
                                                children: [
                                                  Icon(
                                                    color: phoneNumber.toString().length == 8 && phoneNumber.toString().isInteger()
                                                        ? Theme.of(context).colorScheme.secondary
                                                        : Theme.of(context).colorScheme.secondary.withOpacity(0.6),
                                                    phoneNumber.toString().length == 8 && phoneNumber.toString().isInteger() ? CupertinoIcons.check_mark : CupertinoIcons.clear,
                                                    size: 18.0,
                                                  ),
                                                  const SizedBox(width: 4.0),
                                                  Expanded(
                                                    child: RichText(
                                                      text: TextSpan(
                                                        children: [
                                                          TextSpan(
                                                            text: translate(context, 'phoneNumberIsValid'),
                                                            style: Theme.of(context).textTheme.bodyMedium!.copyWith(
                                                                  color: phoneNumber.toString().length == 8 && phoneNumber.toString().isInteger()
                                                                      ? Theme.of(context).colorScheme.secondary
                                                                      : Theme.of(context).colorScheme.secondary.withOpacity(0.6),
                                                                ),
                                                          ),
                                                        ],
                                                      ),
                                                    ),
                                                  ),
                                                ],
                                              ),
                                              const SizedBox(height: 16.0),
                                              Text(
                                                translate(context, 'amountToRefill'),
                                                style: Theme.of(context).textTheme.bodyLarge,
                                              ),
                                              const SizedBox(height: 16.0),
                                              Text(
                                                translate(context, 'phoneRefillText2'),
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
                                                        keyboardType: const TextInputType.numberWithOptions(signed: true, decimal: true),
                                                        controller: _amountController,
                                                        inputFormatters: [LengthLimitingTextInputFormatter(4)],
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
                                                  Text(
                                                    translate(context, 'TND').toUpperCase(),
                                                    style: Theme.of(context).textTheme.headlineSmall,
                                                  ),
                                                ],
                                              ),
                                              if (amount.toString().isDouble() &&
                                                  amount.toString().toDouble() >= 1 &&
                                                  amount.toString().toDouble() <= 50 &&
                                                  _hasValidFraction(amount.toString().toDouble()) == false)
                                                Padding(
                                                  padding: const EdgeInsets.only(top: 16.0),
                                                  child: Column(
                                                    crossAxisAlignment: CrossAxisAlignment.start,
                                                    mainAxisSize: MainAxisSize.min,
                                                    children: [
                                                      Text(
                                                        translate(context, 'phoneRefillText3'),
                                                        style: Theme.of(context).textTheme.bodyMedium,
                                                      ),
                                                      const SizedBox(height: 16.0),
                                                      Row(
                                                        children: [
                                                          Expanded(
                                                            child: GestureDetector(
                                                              onTap: () {
                                                                _selectedAmountCubit.updateValue(_roundDown(amount.toString().toDouble()));
                                                                _amountController.text = '${_roundDown(amount.toString().toDouble())}';
                                                                _amountCubit.updateValue('${_roundUp(amount.toString().toDouble())}');
                                                              },
                                                              child: Container(
                                                                alignment: Alignment.center,
                                                                padding: const EdgeInsets.symmetric(vertical: 8.0, horizontal: 16.0),
                                                                decoration: BoxDecoration(
                                                                  color: selectedAmount == amount.toString().toDouble() ? kAppColor : Theme.of(context).focusColor,
                                                                  borderRadius: BorderRadius.circular(8.0),
                                                                ),
                                                                child: Text(
                                                                  '${_roundDown(amount.toString().toDouble())}',
                                                                  textAlign: TextAlign.center,
                                                                  style: Theme.of(context).textTheme.displayLarge!.copyWith(
                                                                        color: selectedAmount == amount.toString().toDouble() ? Colors.white : Theme.of(context).colorScheme.secondary,
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
                                                              onTap: _calculateAmountAfterConversion(amount: amount.toString().toDouble(), unitValue: _unitValue) > _appAmount
                                                                  ? null
                                                                  : () {
                                                                      _selectedAmountCubit.updateValue(_roundUp(amount.toString().toDouble()));
                                                                      _amountController.text = '${_roundUp(amount.toString().toDouble())}';
                                                                      _amountCubit.updateValue('${_roundUp(amount.toString().toDouble())}');
                                                                    },
                                                              child: Container(
                                                                alignment: Alignment.center,
                                                                padding: const EdgeInsets.symmetric(vertical: 8.0, horizontal: 16.0),
                                                                decoration: BoxDecoration(
                                                                  color: _calculateAmountAfterConversion(amount: amount.toString().toDouble(), unitValue: _unitValue) > _appAmount
                                                                      ? Colors.grey
                                                                      : selectedAmount == amount.toString().toDouble()
                                                                          ? kAppColor
                                                                          : Theme.of(context).focusColor,
                                                                  borderRadius: BorderRadius.circular(8.0),
                                                                ),
                                                                child: Text(
                                                                  '${_roundUp(amount.toString().toDouble())}',
                                                                  textAlign: TextAlign.center,
                                                                  style: Theme.of(context).textTheme.displayLarge!.copyWith(
                                                                        color: selectedAmount == amount.toString().toDouble() ? Colors.white : Theme.of(context).colorScheme.secondary,
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
                                              const SizedBox(height: 16.0),
                                              Row(
                                                children: [
                                                  Icon(
                                                    color: amount.toString().isDouble() && _calculateAmountAfterConversion(amount: amount.toString().toDouble(), unitValue: _unitValue) <= _appAmount
                                                        ? Theme.of(context).colorScheme.secondary
                                                        : Theme.of(context).colorScheme.secondary.withOpacity(0.6),
                                                    amount.toString().isDouble() && _calculateAmountAfterConversion(amount: amount.toString().toDouble(), unitValue: _unitValue) <= _appAmount
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
                                                            text: '${translate(context, 'enough')} ',
                                                            style: Theme.of(context).textTheme.bodyMedium!.copyWith(
                                                                  color: amount.toString().isDouble() &&
                                                                          _calculateAmountAfterConversion(amount: amount.toString().toDouble(), unitValue: _unitValue) <= _appAmount
                                                                      ? Theme.of(context).colorScheme.secondary
                                                                      : Theme.of(context).colorScheme.secondary.withOpacity(0.6),
                                                                ),
                                                          ),
                                                          WidgetSpan(
                                                            child: QualitativeQuantitativeWidget(
                                                              textStyle: null,
                                                              walletType: Enum$WalletTypeEnum.QUANTITATIVE,
                                                              baseUrl: _appCoin.picture?.baseUrl,
                                                              path: _appCoin.picture?.path,
                                                              amount: null,
                                                              size: const Size(26.0, 26.0),
                                                              textAlign: TextAlign.center,
                                                            ),
                                                          ),
                                                          TextSpan(
                                                            text: ' ${translate(context, 'toRefill')}',
                                                            style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                                                                  color: amount.toString().isDouble() &&
                                                                          _calculateAmountAfterConversion(amount: amount.toString().toDouble(), unitValue: _unitValue) <= _appAmount
                                                                      ? Theme.of(context).colorScheme.secondary
                                                                      : Theme.of(context).colorScheme.secondary.withOpacity(0.6),
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
                                                    color: amount.toString().isDouble() && amount.toString().toDouble() >= 1 && amount.toString().toDouble() <= 50
                                                        ? Theme.of(context).colorScheme.secondary
                                                        : Theme.of(context).colorScheme.secondary.withOpacity(0.6),
                                                    amount.toString().isDouble() && amount.toString().toDouble() >= 1 && amount.toString().toDouble() <= 50
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
                                                            text: '${translate(context, 'amountIsBetween')} ',
                                                            style: Theme.of(context).textTheme.bodyMedium!.copyWith(
                                                                  color: amount.toString().isDouble() && amount.toString().toDouble() >= 1 && amount.toString().toDouble() <= 50
                                                                      ? Theme.of(context).colorScheme.secondary
                                                                      : Theme.of(context).colorScheme.secondary.withOpacity(0.6),
                                                                ),
                                                          ),
                                                          TextSpan(
                                                            text: '1',
                                                            style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                                                                  color: amount.toString().isDouble() && amount.toString().toDouble() >= 1 && amount.toString().toDouble() <= 50
                                                                      ? Theme.of(context).colorScheme.secondary
                                                                      : Theme.of(context).colorScheme.secondary.withOpacity(0.6),
                                                                ),
                                                          ),
                                                          TextSpan(
                                                            text: ' ${translate(context, 'and')} ',
                                                            style: Theme.of(context).textTheme.bodyMedium!.copyWith(
                                                                  color: amount.toString().isDouble() && amount.toString().toDouble() >= 1 && amount.toString().toDouble() <= 50
                                                                      ? Theme.of(context).colorScheme.secondary
                                                                      : Theme.of(context).colorScheme.secondary.withOpacity(0.6),
                                                                ),
                                                          ),
                                                          TextSpan(
                                                            text: '50',
                                                            style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                                                                  color: amount.toString().isDouble() && amount.toString().toDouble() >= 1 && amount.toString().toDouble() <= 50
                                                                      ? Theme.of(context).colorScheme.secondary
                                                                      : Theme.of(context).colorScheme.secondary.withOpacity(0.6),
                                                                ),
                                                          ),
                                                          TextSpan(
                                                            text: ' ${translate(context, 'TND')}',
                                                            style: Theme.of(context).textTheme.bodyMedium!.copyWith(
                                                                  color: amount.toString().isDouble() && amount.toString().toDouble() >= 1 && amount.toString().toDouble() <= 50
                                                                      ? Theme.of(context).colorScheme.secondary
                                                                      : Theme.of(context).colorScheme.secondary.withOpacity(0.6),
                                                                ),
                                                          ),
                                                        ],
                                                      ),
                                                    ),
                                                  ),
                                                ],
                                              ),
                                              if (_isFormValid(
                                                        appUnitValue: _unitValue,
                                                        amount: amount.toString().toDouble(),
                                                        appAmount: _appAmount,
                                                        phoneNumber: phoneNumber,
                                                      ) ==
                                                      false &&
                                                  amount.toString().isDouble() &&
                                                  _calculateAmountAfterConversion(amount: amount.toString().toDouble(), unitValue: _unitValue) <= _appAmount)
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
                                              if (_isFormValid(
                                                        appUnitValue: _unitValue,
                                                        amount: amount.toString().toDouble(),
                                                        appAmount: _appAmount,
                                                        phoneNumber: phoneNumber,
                                                      ) ==
                                                      false &&
                                                  amount.toString().isDouble() &&
                                                  _calculateAmountAfterConversion(amount: amount.toString().toDouble(), unitValue: _unitValue) <= _appAmount)
                                                Padding(
                                                  padding: const EdgeInsets.only(top: 16.0),
                                                  child: Wrap(
                                                    crossAxisAlignment: WrapCrossAlignment.center,
                                                    alignment: WrapAlignment.center,
                                                    children: [
                                                      Text(
                                                        '${translate(context, 'remaining')} $kAppName ${translate(context, 'balance')} ',
                                                        style: Theme.of(context).textTheme.bodyMedium,
                                                      ),
                                                      QualitativeQuantitativeWidget(
                                                        textStyle: Theme.of(context).textTheme.bodyLarge,
                                                        walletType: Enum$WalletTypeEnum.QUANTITATIVE,
                                                        baseUrl: _appCoin.picture?.baseUrl,
                                                        path: _appCoin.picture?.path,
                                                        amount: _appAmount -
                                                            _calculateAmountAfterConversion(
                                                              amount: amount.toString().toDouble(),
                                                              unitValue: _unitValue,
                                                            ).toString().toInteger(),
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
                                                  onPressed: _isFormValid(
                                                    amount: amount.toString().toDouble(),
                                                    appUnitValue: _unitValue,
                                                    phoneNumber: phoneNumber,
                                                    appAmount: _appAmount,
                                                  )
                                                      ? null
                                                      : () async => showConfirmPhoneRefillSheet(
                                                            phoneNumber: phoneNumber,
                                                            operator: operator,
                                                            context: context,
                                                            dialCode: dialCode,
                                                            amount: amount.toString().toDouble(),
                                                            refreshTheView: (value) async {
                                                              _isLoadingCubit.updateValue(true);
                                                              final pushRechargeToUser = await _bitakaRepository.pushRechargeToUser(
                                                                Variables$Query$pushRechargeToUser(
                                                                  wallet: _currentUserQuantitativeWallets.objects.first.id,
                                                                  $operator: operator.id,
                                                                  number: phoneNumber,
                                                                  amount: '${amount.toString().toDouble() * kTunisiaDinarValue}',
                                                                  points: _calculateAmountAfterConversion(
                                                                    amount: amount.toString().toDouble(),
                                                                    unitValue: _unitValue,
                                                                  ).toInt().toString(),
                                                                ),
                                                              );
                                                              await BlocProvider.of<CurrentUserQuantitativeWalletsCubit>(context).getCurrentUserQuantitativeWallets(
                                                                Variables$Query$getCurrentUserQuantitativeWallets(
                                                                  pagination: Input$PaginationInput(
                                                                    limit: kPaginationLimit,
                                                                    page: kPaginationPage,
                                                                  ),
                                                                ),
                                                              );
                                                              _isLoadingCubit.updateValue(false);
                                                              if (pushRechargeToUser == null) {
                                                                FlutterMessenger.showSnackbar(context: context, string: translate(context, 'generalErrorMessage'));
                                                              } else {
                                                                Navigator.pop(context);
                                                                addHomeTabIndexToSP(0);
                                                                BlocProvider.of<HomeTabIndexCubit>(context).updateValue(0);
                                                                Navigator.of(context).pushNamedAndRemoveUntil('/Tabs', (route) => false);

                                                                showGeneralDialog(
                                                                  transitionDuration: const Duration(milliseconds: 1),
                                                                  barrierColor: Colors.transparent,
                                                                  barrierLabel: '',
                                                                  context: context,
                                                                  pageBuilder: (context, anim1, anim2) => SuccessfulDialog(
                                                                    description: translate(context, 'phoneRefillDialogSuccessfulDescription'),
                                                                    subTitle: translate(context, 'phoneRefillDialogSuccessfulSubtitle'),
                                                                    title: translate(context, 'phoneRefillDialogSuccessfulTitle'),
                                                                    onCancel: (value) => Navigator.pop(context),
                                                                    onPressed: (value) => Navigator.pop(context),
                                                                  ),
                                                                );
                                                              }
                                                            },
                                                          ),
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
          ),
        ),
      ),
    );
  }
}
