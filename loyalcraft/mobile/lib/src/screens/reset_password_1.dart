import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_diktup_utilities/extensions.dart';
import 'package:flutter_loyalcraft_gql/graphql/corporate-authentication.graphql.dart';
import 'package:flutter_loyalcraft_gql/schema.graphql.dart';
import 'package:loyalcraft/localizations_delegate/app_localizations.dart';
import 'package:loyalcraft/src/bloc/variable.dart';
import 'package:loyalcraft/src/data/consts.dart';
import 'package:loyalcraft/src/data/flutter_messenger.dart';
import 'package:loyalcraft/src/data/graphql_client.dart';
import 'package:loyalcraft/src/models/dial_code.dart';
import 'package:loyalcraft/src/repository/corporate_athentication.dart';
import 'package:loyalcraft/src/widgets/custom_circular_progress_indicator.dart';

// ignore: must_be_immutable
class ResetPassword1Widget extends StatefulWidget {
  const ResetPassword1Widget({
    Key? key,
  }) : super(key: key);

  @override
  _ResetPassword1Widget createState() => _ResetPassword1Widget();
}

class _ResetPassword1Widget extends State<ResetPassword1Widget> {
  final SGraphQLClient _sGraphQLClient = SGraphQLClient(origin: kLoyalcraftPortal);
  final TextEditingController _emailAddressController = TextEditingController();
  final TextEditingController _phoneNumberController = TextEditingController();
  late CorporateAuthenticationRepository _corporateAuthenticationRepository;
  late VariableCubit<String> _phoneNumberCubit;
  late VariableCubit<DialCode> _dialCodeCubit;
  late VariableCubit<bool> _isLoadingCubit;
  late VariableCubit _emailAddressCubit;
  late VariableCubit _isLoginExistCubit;
  late VariableCubit<int> _tabCubit;
  final List<String> _tabList = [
    'phoneNumber',
    'emailAddress',
  ];
  bool _formHasError({required String emailAddress, required String phoneNumber, required DialCode dialCode, required bool isLoginExist, required int tab}) {
    if (isLoginExist == false) {
      return true;
    }
    if (tab == 0 && phoneNumber.length != dialCode.numberLength) {
      return true;
    }
    if (tab == 1 && emailAddress.isValidEmailAddress() == false) {
      return true;
    }
    return false;
  }

  Future<void> _initState() async {
    _corporateAuthenticationRepository = CorporateAuthenticationRepository(_sGraphQLClient);
    _emailAddressCubit = VariableCubit(value: '');
    _tabCubit = VariableCubit(value: 0);
    _dialCodeCubit = VariableCubit(value: kDialCodeList.first);
    _phoneNumberCubit = VariableCubit(value: '');
    _isLoadingCubit = VariableCubit(value: false);
    _isLoginExistCubit = VariableCubit();
  }

  @override
  void dispose() {
    _emailAddressController.dispose();
    _emailAddressCubit.close();
    _tabCubit.close();
    _isLoginExistCubit.close();
    _isLoadingCubit.close();
    _phoneNumberCubit.close();
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
          BlocProvider(create: (context) => _emailAddressCubit),
          BlocProvider(create: (context) => _isLoadingCubit),
          BlocProvider(create: (context) => _tabCubit),
          BlocProvider(create: (context) => _isLoginExistCubit),
          BlocProvider(create: (context) => _dialCodeCubit),
        ],
        child: BlocBuilder<VariableCubit, dynamic>(
          bloc: _isLoginExistCubit,
          builder: (context, isLoginExist) => BlocBuilder<VariableCubit, dynamic>(
            bloc: _phoneNumberCubit,
            builder: (context, phoneNumber) => BlocBuilder<VariableCubit, dynamic>(
              bloc: _tabCubit,
              builder: (context, tab) => BlocBuilder<VariableCubit, dynamic>(
                bloc: _dialCodeCubit,
                builder: (context, dialCode) => BlocBuilder<VariableCubit, dynamic>(
                  bloc: _emailAddressCubit,
                  builder: (context, emailAddress) => BlocBuilder<VariableCubit, dynamic>(
                    bloc: _isLoadingCubit,
                    builder: (context, isLoading) => Scaffold(
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
                                translate(context, 'resetPassword'),
                                style: Theme.of(context).textTheme.headlineSmall,
                              ),
                            ),
                          ],
                        ),
                      ),
                      body: SafeArea(
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
                                      children: List.generate(
                                        _tabList.length,
                                        (index) => Expanded(
                                          child: GestureDetector(
                                            onTap: () => _tabCubit.updateValue(index),
                                            child: Opacity(
                                              opacity: index == tab ? 1.0 : 0.5,
                                              child: Padding(
                                                padding: EdgeInsets.only(left: index == 0 ? 0.0 : 8.0),
                                                child: Column(
                                                  mainAxisSize: MainAxisSize.min,
                                                  children: [
                                                    Text(
                                                      translate(context, _tabList[index]),
                                                      textAlign: TextAlign.center,
                                                      style: Theme.of(context).textTheme.bodyMedium,
                                                    ),
                                                    const SizedBox(height: 4.0),
                                                    Container(
                                                      height: 2.0,
                                                      width: double.infinity,
                                                      decoration: BoxDecoration(
                                                        color: Theme.of(context).focusColor.withOpacity(1.0),
                                                        borderRadius: BorderRadius.circular(100.0),
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
                                    const SizedBox(height: 16.0),
                                    Text(
                                      translate(context, 'sendForgotPasswordMailText1'),
                                      style: Theme.of(context).textTheme.bodySmall,
                                    ),
                                    const SizedBox(height: 16.0),
                                    if (tab == 0)
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
                                                style: Theme.of(context).textTheme.bodyMedium,
                                                keyboardType: TextInputType.number,
                                                onChanged: (value) async {
                                                  _phoneNumberCubit.updateValue(value);
                                                  _isLoginExistCubit.updateValue(null);
                                                  if (value.isInteger() && value.length == dialCode.numberLength) {
                                                    final result = await _corporateAuthenticationRepository.isLoginForTargetExist(
                                                      Variables$Query$isLoginForTargetExist(
                                                        input: Input$IsLoginForTargetExistInput(
                                                          phone: Input$IPhoneInput(
                                                            countryCode: dialCode.dialCode,
                                                            number: value,
                                                          ),
                                                          target: Input$TargetACIInput(
                                                            pos: kPosID,
                                                          ),
                                                        ),
                                                      ),
                                                    );
                                                    _isLoginExistCubit.updateValue(result);
                                                  }
                                                },
                                                inputFormatters: [LengthLimitingTextInputFormatter(_dialCodeCubit.state!.numberLength)],
                                                controller: _phoneNumberController,
                                                decoration: InputDecoration(
                                                  enabledBorder: const UnderlineInputBorder(borderSide: BorderSide.none),
                                                  focusedBorder: const UnderlineInputBorder(borderSide: BorderSide.none),
                                                  border: const UnderlineInputBorder(borderSide: BorderSide.none),
                                                  hintStyle: Theme.of(context).textTheme.bodyMedium,
                                                  hintText: translate(context, 'enterYourPhoneNumber'),
                                                ),
                                              ),
                                            ),
                                          ],
                                        ),
                                      )
                                    else
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 16.0),
                                        decoration: BoxDecoration(
                                          border: Border.all(color: Colors.grey[800]!, width: 0.4),
                                          borderRadius: BorderRadius.circular(8.0),
                                        ),
                                        child: TextField(
                                          onTapOutside: (value) => FocusManager.instance.primaryFocus?.unfocus,
                                          cursorColor: Theme.of(context).colorScheme.secondary,
                                          style: Theme.of(context).textTheme.bodyMedium,
                                          keyboardType: TextInputType.emailAddress,
                                          onChanged: (value) async {
                                            _emailAddressCubit.updateValue(value);
                                            _isLoginExistCubit.updateValue(null);
                                            if (value.isValidEmailAddress()) {
                                              final result = await _corporateAuthenticationRepository.isLoginForTargetExist(
                                                Variables$Query$isLoginForTargetExist(
                                                  input: Input$IsLoginForTargetExistInput(
                                                    login: value,
                                                    target: Input$TargetACIInput(
                                                      pos: kPosID,
                                                    ),
                                                  ),
                                                ),
                                              );
                                              _isLoginExistCubit.updateValue(result);
                                            }
                                          },
                                          controller: _emailAddressController,
                                          decoration: InputDecoration(
                                            enabledBorder: const UnderlineInputBorder(borderSide: BorderSide.none),
                                            focusedBorder: const UnderlineInputBorder(borderSide: BorderSide.none),
                                            border: const UnderlineInputBorder(borderSide: BorderSide.none),
                                            hintStyle: Theme.of(context).textTheme.bodyMedium,
                                            hintText: translate(context, 'enterYourEmailAddress'),
                                          ),
                                        ),
                                      ),
                                    if (tab == 0 && phoneNumber.toString().isInteger() && phoneNumber.toString().length == dialCode.numberLength && isLoginExist != null)
                                      Padding(
                                        padding: const EdgeInsets.only(top: 16.0),
                                        child: Opacity(
                                          opacity: isLoginExist == true ? 1.0 : 0.5,
                                          child: Row(
                                            children: [
                                              Icon(
                                                color: Theme.of(context).colorScheme.secondary,
                                                isLoginExist == true ? CupertinoIcons.check_mark : CupertinoIcons.clear,
                                                size: 14.0,
                                              ),
                                              const SizedBox(width: 4.0),
                                              Expanded(
                                                child: Text(
                                                  isLoginExist == true ? translate(context, 'phoneNumberAvailable') : translate(context, 'phoneNumberNotAvailable'),
                                                  style: Theme.of(context).textTheme.bodyMedium,
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),
                                      ),
                                    if (tab == 1 && emailAddress.toString().isValidEmailAddress() && isLoginExist != null)
                                      Padding(
                                        padding: const EdgeInsets.only(top: 16.0),
                                        child: Opacity(
                                          opacity: isLoginExist == true ? 1.0 : 0.5,
                                          child: Row(
                                            children: [
                                              Icon(
                                                color: Theme.of(context).colorScheme.secondary,
                                                isLoginExist == true ? CupertinoIcons.check_mark : CupertinoIcons.clear,
                                                size: 14.0,
                                              ),
                                              const SizedBox(width: 4.0),
                                              Expanded(
                                                child: Text(
                                                  isLoginExist == true ? translate(context, 'emailAddressAvailable') : translate(context, 'emailAddressNotAvailable'),
                                                  style: Theme.of(context).textTheme.bodyMedium,
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),
                                      ),
                                    const SizedBox(height: 16.0),
                                    if (tab == 0)
                                      Opacity(
                                        opacity: phoneNumber.toString().isInteger() && phoneNumber.toString().length == dialCode.numberLength ? 1.0 : 0.5,
                                        child: Row(
                                          children: [
                                            Icon(
                                              color: Theme.of(context).colorScheme.secondary,
                                              phoneNumber.toString().isInteger() && phoneNumber.toString().length == dialCode.numberLength ? CupertinoIcons.check_mark : CupertinoIcons.clear,
                                              size: 14.0,
                                            ),
                                            const SizedBox(width: 4.0),
                                            Expanded(
                                              child: Text(
                                                translate(context, 'validPhoneNumber'),
                                                style: Theme.of(context).textTheme.bodyMedium,
                                              ),
                                            ),
                                          ],
                                        ),
                                      )
                                    else
                                      Opacity(
                                        opacity: emailAddress.toString().isValidEmailAddress() ? 1.0 : 0.5,
                                        child: Row(
                                          children: [
                                            Icon(
                                              color: Theme.of(context).colorScheme.secondary,
                                              emailAddress.toString().isValidEmailAddress() ? CupertinoIcons.check_mark : CupertinoIcons.clear,
                                              size: 14.0,
                                            ),
                                            const SizedBox(width: 4.0),
                                            Expanded(
                                              child: Text(
                                                translate(context, 'validEmailAddress'),
                                                style: Theme.of(context).textTheme.bodyMedium,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                  ],
                                ),
                              ),
                              const SizedBox(height: 16.0),
                              isLoading
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
                                        emailAddress: emailAddress,
                                        isLoginExist: isLoginExist ?? false,
                                        phoneNumber: phoneNumber,
                                        dialCode: dialCode,
                                        tab: tab,
                                      )
                                          ? null
                                          : () async {
                                              _isLoadingCubit.updateValue(true);
                                              final sendForgotPasswordMailToTarget = await _corporateAuthenticationRepository
                                                  .sendForgotPasswordMailOrSmsToTarget(
                                                Variables$Mutation$sendForgotPasswordMailOrSmsToTarget(
                                                  subject: translate(context, 'validationCode'),
                                                  email: tab == 0 ? null : emailAddress,
                                                  phone: tab == 1
                                                      ? null
                                                      : Input$IPhoneInput(
                                                          countryCode: _dialCodeCubit.state!.dialCode,
                                                          number: phoneNumber,
                                                        ),
                                                  target: Input$TargetACIInput(
                                                    pos: kPosID,
                                                  ),
                                                ),
                                              )
                                                  .catchError((onError) {
                                                _isLoadingCubit.updateValue(false);
                                                return null;
                                              });
                                              _isLoadingCubit.updateValue(false);
                                              if (sendForgotPasswordMailToTarget == null) {
                                                FlutterMessenger.showSnackbar(context: context, string: translate(context, 'generalErrorMessage'));
                                              } else {
                                                FlutterMessenger.showSnackbar(context: context, string: translate(context, 'sendForgotPasswordMailText2'));
                                                Navigator.pop(context);
                                              }
                                            },
                                      child: Text(
                                        translate(context, 'confirm'),
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
              ),
            ),
          ),
        ),
      );
}
