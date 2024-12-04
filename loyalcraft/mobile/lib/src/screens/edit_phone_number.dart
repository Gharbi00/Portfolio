import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_diktup_utilities/extensions.dart';
import 'package:flutter_loyalcraft_gql/graphql/corporate-authentication.graphql.dart';
import 'package:flutter_loyalcraft_gql/graphql/user.graphql.dart';
import 'package:flutter_loyalcraft_gql/schema.graphql.dart';
import 'package:loyalcraft/localizations_delegate/app_localizations.dart';
import 'package:loyalcraft/src/bloc/user.dart';
import 'package:loyalcraft/src/bloc/variable.dart';
import 'package:loyalcraft/src/data/consts.dart';
import 'package:loyalcraft/src/data/flutter_messenger.dart';
import 'package:loyalcraft/src/data/graphql_client.dart';
import 'package:loyalcraft/src/data/shared_preferences.dart';
import 'package:loyalcraft/src/modal_bottom_sheet/confirm_otp.dart';
import 'package:loyalcraft/src/models/dial_code.dart';
import 'package:loyalcraft/src/repository/corporate_athentication.dart';
import 'package:loyalcraft/src/repository/user.dart';
import 'package:loyalcraft/src/widgets/custom_circular_progress_indicator.dart';

// ignore: must_be_immutable
class EditPhoneNumberWidget extends StatefulWidget {
  const EditPhoneNumberWidget({
    Key? key,
  }) : super(key: key);

  @override
  _EditPhoneNumberWidget createState() => _EditPhoneNumberWidget();
}

class _EditPhoneNumberWidget extends State<EditPhoneNumberWidget> {
  final TextEditingController _phoneNumberController = TextEditingController();
  late CorporateAuthenticationRepository _corporateAuthenticationRepository;
  final SGraphQLClient _sGraphQLClient = SGraphQLClient();
  late VariableCubit _phoneNumberCubit;
  late VariableCubit _isLoginExistCubit;
  late UserRepository _userRepository;
  late VariableCubit<bool> _isLoadingCubit;
  late VariableCubit<DialCode> _dialCodeCubit;

  bool _formHasError({required String phoneNumber, required bool isLoginExist}) => phoneNumber.length != _dialCodeCubit.state!.numberLength || phoneNumber.isInteger() == false || isLoginExist == true;

  Future<void> _initState() async {
    _corporateAuthenticationRepository = CorporateAuthenticationRepository(_sGraphQLClient);
    _userRepository = UserRepository(_sGraphQLClient);
    _phoneNumberCubit = VariableCubit(value: '');
    _isLoginExistCubit = VariableCubit(value: true);
    _isLoadingCubit = VariableCubit(value: false);
    _dialCodeCubit = VariableCubit(value: kDialCodeList.first);
    final user = await getUserFromSP();
    _phoneNumberController.text = user?.phone?.number ?? '';
    _phoneNumberCubit.updateValue(user?.phone?.number ?? '');
  }

  @override
  void dispose() {
    _phoneNumberController.dispose();
    _isLoginExistCubit.close();
    _dialCodeCubit.close();
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
          BlocProvider(create: (context) => _phoneNumberCubit),
          BlocProvider(create: (context) => _isLoginExistCubit),
          BlocProvider(create: (context) => _dialCodeCubit),
          BlocProvider(create: (context) => _isLoadingCubit),
        ],
        child: BlocBuilder<VariableCubit, dynamic>(
          bloc: _dialCodeCubit,
          builder: (context, dialCode) => BlocBuilder<VariableCubit, dynamic>(
            bloc: _phoneNumberCubit,
            builder: (context, phoneNumber) => BlocBuilder<VariableCubit, dynamic>(
              bloc: _isLoadingCubit,
              builder: (context, isLoading) => BlocBuilder<VariableCubit, dynamic>(
                bloc: _isLoginExistCubit,
                builder: (context, isLoginExist) => Scaffold(
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
                            translate(context, 'editPhoneNumber'),
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
                                Container(
                                  padding: const EdgeInsets.only(right: 16.0, left: 8.0),
                                  decoration: BoxDecoration(
                                    border: Border.all(color: Colors.grey[800]!, width: 0.4),
                                    borderRadius: BorderRadius.circular(8.0),
                                  ),
                                  child: Row(
                                    children: [
                                      GestureDetector(
                                        // onTap: () => showSelectDialCodeSheet(
                                        //   refreshTheView: _dialCodeCubit.updateValue,
                                        //   currentDialCode: _dialCodeCubit.state!,
                                        //   context: context,
                                        // ),
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
                                            if (value.length == 8 && value.isInteger()) {
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
                                          inputFormatters: [LengthLimitingTextInputFormatter(dialCode.numberLength)],
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
                                ),
                                if (phoneNumber.toString().length == 8 || phoneNumber.toString().isInteger() && isLoginExist != null)
                                  Padding(
                                    padding: const EdgeInsets.only(top: 16.0),
                                    child: Row(
                                      children: [
                                        Icon(
                                          color: isLoginExist == false ? Theme.of(context).colorScheme.secondary : Theme.of(context).colorScheme.secondary.withOpacity(0.6),
                                          isLoginExist == false ? CupertinoIcons.check_mark : CupertinoIcons.clear,
                                          size: 14.0,
                                        ),
                                        const SizedBox(width: 4.0),
                                        Expanded(
                                          child: Text(
                                            translate(context, isLoginExist == false ? 'phoneNumberAvailable' : 'phoneNumberNotAvailable'),
                                            style: Theme.of(context).textTheme.bodyMedium!.copyWith(
                                                  color: isLoginExist == false ? Theme.of(context).colorScheme.secondary : Theme.of(context).colorScheme.secondary.withOpacity(0.6),
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
                                      size: 14.0,
                                    ),
                                    const SizedBox(width: 4.0),
                                    Expanded(
                                      child: Text(
                                        translate(context, 'validPhoneNumber'),
                                        style: Theme.of(context).textTheme.bodyMedium!.copyWith(
                                              color: phoneNumber.toString().length == 8 && phoneNumber.toString().isInteger()
                                                  ? Theme.of(context).colorScheme.secondary
                                                  : Theme.of(context).colorScheme.secondary.withOpacity(0.6),
                                            ),
                                      ),
                                    ),
                                  ],
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
                                    onPressed: _formHasError(phoneNumber: phoneNumber, isLoginExist: isLoginExist ?? true)
                                        ? null
                                        : () async {
                                            final getLastDateOfMessageSent = await getLastDateOfMessageSentFromSP();

                                            if (getLastDateOfMessageSent != null && DateTime.now().toLocal().difference(getLastDateOfMessageSent).inMinutes < 30) {
                                              FlutterMessenger.showSnackbar(
                                                context: context,
                                                string: translate(
                                                  context,
                                                  "${translate(context, 'errorRequestOTPText1')} ${DateTime.now().toLocal().difference(getLastDateOfMessageSent).inMinutes} ${translate(context, 'errorRequestOTPText2')}",
                                                ),
                                              );
                                            } else {
                                              _isLoadingCubit.updateValue(true);
                                              final sendValidationCode = await _corporateAuthenticationRepository
                                                  .sendValidationCode(
                                                Variables$Mutation$sendValidationCode(
                                                  subject: translate(context, 'validationCode'),
                                                  phone: Input$IPhoneInput(
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
                                              if (sendValidationCode?.success == false) {
                                                FlutterMessenger.showSnackbar(context: context, string: translate(context, 'generalErrorMessage'));
                                              } else {
                                                showConfirmOtpSheet(
                                                  context: context,
                                                  dialCode: _dialCodeCubit.state,
                                                  phoneNumber: phoneNumber,
                                                  isPhoneNumber: true,
                                                  valueChanged: (value) async {
                                                    _isLoadingCubit.updateValue(true);
                                                    final updateCurrentUserLogins = await _userRepository
                                                        .updateCurrentUserLogins(
                                                      Variables$Mutation$updateCurrentUserLogins(
                                                        phone: Input$IPhoneInput(
                                                          countryCode: _dialCodeCubit.state!.dialCode,
                                                          number: phoneNumber,
                                                        ),
                                                      ),
                                                    )
                                                        .catchError((onError) {
                                                      _isLoadingCubit.updateValue(false);
                                                      return null;
                                                    });
                                                    _isLoadingCubit.updateValue(false);
                                                    if (updateCurrentUserLogins?.user == null) {
                                                      FlutterMessenger.showSnackbar(context: context, string: translate(context, 'generalErrorMessage'));
                                                    } else {
                                                      addAccessTokenToSP(updateCurrentUserLogins!.accessToken);
                                                      BlocProvider.of<UserCubit>(context).setUser(Query$user$user.fromJson(updateCurrentUserLogins.user.toJson()));
                                                      FlutterMessenger.showSnackbar(context: context, string: translate(context, 'updateProfileToastMessage'));
                                                      Navigator.pop(context);
                                                    }
                                                  },
                                                );
                                              }
                                            }
                                          },
                                    child: Text(
                                      translate(context, 'save'),
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
