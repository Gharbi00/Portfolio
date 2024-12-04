import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_diktup_utilities/extensions.dart';
import 'package:flutter_diktup_utilities/flutter_diktup_utilities.dart';
import 'package:flutter_loyalcraft_gql/graphql/corporate-authentication.graphql.dart';
import 'package:flutter_loyalcraft_gql/schema.graphql.dart';
import 'package:loyalcraft/localizations_delegate/app_localizations.dart';
import 'package:loyalcraft/src/bloc/variable.dart';
import 'package:loyalcraft/src/data/consts.dart';
import 'package:loyalcraft/src/data/flutter_messenger.dart';
import 'package:loyalcraft/src/data/graphql_client.dart';
import 'package:loyalcraft/src/data/shared_preferences.dart';
import 'package:loyalcraft/src/models/dial_code.dart';
import 'package:loyalcraft/src/repository/corporate_athentication.dart';

Future<void> showConfirmOtpSheet({
  required ValueChanged<void> valueChanged,
  required BuildContext context,
  required bool isPhoneNumber,
  String? emailAddress,
  DialCode? dialCode,
  String? phoneNumber,
}) async {
  late CorporateAuthenticationRepository _corporateAuthenticationRepository;
  var _codeController = TextEditingController();
  late VariableCubit<int> _resendCodeTimeCubit;
  final _sGraphQLClient = SGraphQLClient();
  late VariableCubit<bool> _isLoadingCubit;
  late VariableCubit<String> _codeCubit;
  late VariableCubit<Timer?> _timerCubit;

  void startTimer() {
    var timer = Timer.periodic(
      const Duration(seconds: 1),
      (timer) {
        if (_resendCodeTimeCubit.state == 0) {
          _timerCubit.state?.cancel();
          _timerCubit.updateValue(null);
        } else {
          _resendCodeTimeCubit.updateValue(_resendCodeTimeCubit.state! - 1);
        }
      },
    );
    _timerCubit.updateValue(timer);
  }

  bool _formHasError() => _codeCubit.state!.length != 4 || _codeCubit.state!.isInteger() == false || _timerCubit.state == null || _resendCodeTimeCubit.state == 0;

  final result = await showModalBottomSheet<bool>(
    backgroundColor: Colors.transparent,
    isScrollControlled: true,
    context: context,
    builder: (builder) => DraggableScrollableSheet(
      initialChildSize: 0.7,
      maxChildSize: 0.9,
      minChildSize: 0.7,
      expand: false,
      builder: (context, scrollController) {
        _resendCodeTimeCubit = VariableCubit(value: 120);
        _timerCubit = VariableCubit();
        _isLoadingCubit = VariableCubit(value: false);
        _codeCubit = VariableCubit(value: '');
        _corporateAuthenticationRepository = CorporateAuthenticationRepository(_sGraphQLClient);
        addLastDateOfMessageSentToSP(DateTime.now().toLocal());
        startTimer();
        return MultiBlocProvider(
          providers: [
            BlocProvider(create: (context) => _resendCodeTimeCubit),
            BlocProvider(create: (context) => _isLoadingCubit),
            BlocProvider(create: (context) => _timerCubit),
            BlocProvider(create: (context) => _codeCubit),
          ],
          child: BlocBuilder<VariableCubit, dynamic>(
            bloc: _timerCubit,
            builder: (context, data) => BlocBuilder<VariableCubit, dynamic>(
              bloc: _isLoadingCubit,
              builder: (context, isLoading) => BlocBuilder<VariableCubit, dynamic>(
                bloc: _codeCubit,
                builder: (context, data) => BlocBuilder<VariableCubit, dynamic>(
                  bloc: _resendCodeTimeCubit,
                  builder: (context, resendCodeTime) => Container(
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
                          translate(context, isPhoneNumber ? 'verifyPhoneNumber' : 'verifyEmailAddress'),
                          style: Theme.of(context).textTheme.displayMedium,
                        ),
                        const SizedBox(height: 16.0),
                        if (dialCode != null && phoneNumber != null && isPhoneNumber)
                          Text(
                            '${dialCode.dialCode}$phoneNumber',
                            style: Theme.of(context).textTheme.bodyLarge,
                          ),
                        const SizedBox(height: 16.0),
                        Text(
                          translate(context, 'confirmOTPText1'),
                          style: Theme.of(context).textTheme.bodyMedium,
                        ),
                        const SizedBox(height: 16.0),
                        Center(
                          child: Container(
                            padding: const EdgeInsets.all(16.0),
                            width: kAppSize.width / 1.5,
                            alignment: Alignment.center,
                            decoration: BoxDecoration(
                              border: Border.all(
                                color: Theme.of(context).focusColor.withOpacity(1.0),
                              ),
                              borderRadius: BorderRadius.circular(8.0),
                            ),
                            child: TextField(
                              onTapOutside: (value) => FocusManager.instance.primaryFocus?.unfocus,
                              textInputAction: _codeCubit.state!.length == 4 ? TextInputAction.done : TextInputAction.next,
                              inputFormatters: [LengthLimitingTextInputFormatter(4)],
                              cursorColor: Theme.of(context).colorScheme.secondary,
                              style: Theme.of(context).textTheme.displayLarge,
                              controller: _codeController,
                              keyboardType: TextInputType.number,
                              autofocus: true,
                              textAlign: TextAlign.center,
                              onChanged: (value) {
                                _codeCubit.updateValue(value);
                                if (value.length == 4) {
                                  closeTheKeyboard(context);
                                }
                              },
                              decoration: InputDecoration(
                                enabledBorder: const UnderlineInputBorder(borderSide: BorderSide.none),
                                focusedBorder: const UnderlineInputBorder(borderSide: BorderSide.none),
                                border: const UnderlineInputBorder(borderSide: BorderSide.none),
                                hintStyle: Theme.of(context).textTheme.bodySmall,
                                hintText: '- - - -'.replaceAll(' ', ' ' * 5),
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(height: 16.0),
                        RichText(
                          textAlign: TextAlign.center,
                          text: TextSpan(
                            children: [
                              TextSpan(
                                text: translate(context, 'reSendCodeIn'),
                                style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                                      fontSize: 15.0,
                                    ),
                              ),
                              TextSpan(
                                text: ' $resendCodeTime ${translate(context, 'sec')}',
                                style: Theme.of(context).textTheme.displayMedium!.copyWith(
                                      fontSize: 15.0,
                                    ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 16.0),
                        Opacity(
                          opacity: isLoading ? 0.5 : 1.0,
                          child: TextButton(
                            style: TextButton.styleFrom(
                              disabledBackgroundColor: kAppColor.withOpacity(0.6),
                              minimumSize: const Size.fromHeight(40.0),
                              backgroundColor: kAppColor,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(8.0),
                              ),
                            ),
                            onPressed: _formHasError()
                                ? null
                                : () async {
                                    final sendValidationCode = await _corporateAuthenticationRepository
                                        .validateLinkOrCodeForTarget(
                                      Variables$Mutation$validateLinkOrCodeForTarget(
                                        code: _codeCubit.state!.toInteger(),
                                        phone: isPhoneNumber == false
                                            ? null
                                            : Input$IPhoneInput(
                                                countryCode: dialCode!.dialCode,
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
                                      FlutterMessenger.showSnackbar(context: context, string: translate(context, 'confirmOTPText2'));
                                    } else {
                                      valueChanged(() {});
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
  if (result == null) {
    _resendCodeTimeCubit.updateValue(0);
    _timerCubit.state?.cancel();
  }
}
