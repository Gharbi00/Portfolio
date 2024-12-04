import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_diktup_utilities/extensions.dart';
import 'package:flutter_loyalcraft_gql/graphql/corporate-authentication.graphql.dart';
import 'package:flutter_loyalcraft_gql/schema.graphql.dart';
import 'package:loyalcraft/localizations_delegate/app_localizations.dart';
import 'package:loyalcraft/src/bloc/variable.dart';
import 'package:loyalcraft/src/data/consts.dart';
import 'package:loyalcraft/src/data/flutter_messenger.dart';
import 'package:loyalcraft/src/data/graphql_client.dart';
import 'package:loyalcraft/src/repository/corporate_athentication.dart';
import 'package:loyalcraft/src/screens/sign_in.dart';
import 'package:loyalcraft/src/widgets/custom_circular_progress_indicator.dart';

// ignore: must_be_immutable
class ResetPassword2Widget extends StatefulWidget {
  ResetPassword2Widget({
    Key? key,
    required this.token,
  }) : super(key: key);

  String token;

  @override
  _ResetPassword2Widget createState() => _ResetPassword2Widget();
}

class _ResetPassword2Widget extends State<ResetPassword2Widget> {
  final SGraphQLClient _sGraphQLClient = SGraphQLClient();
  late VariableCubit _showConfirmNewPasswordCubit;
  late VariableCubit _confirmNewPasswordCubit;
  late VariableCubit _showNewPasswordCubit;
  late VariableCubit _newPasswordCubit;
  late CorporateAuthenticationRepository _corporateAuthenticationRepository;
  late VariableCubit<bool> _isLoadingCubit;

  bool _formHasError({required String newPassword, required String confirmNewPassword}) =>
      newPassword.trim().isEmpty ||
      (newPassword.trim() != confirmNewPassword.trim() && newPassword.trim().isNotEmpty) ||
      confirmNewPassword.trim().containsLowercase() == false ||
      confirmNewPassword.trim().containsNumber() == false ||
      confirmNewPassword.trim().containsSymbol() == false ||
      confirmNewPassword.trim().length < 8 ||
      confirmNewPassword.trim().containsUppercase() == false;

  Future<void> _initState() async {
    _corporateAuthenticationRepository = CorporateAuthenticationRepository(_sGraphQLClient);
    _showConfirmNewPasswordCubit = VariableCubit(value: false);
    _showNewPasswordCubit = VariableCubit(value: false);
    _newPasswordCubit = VariableCubit(value: '');
    _confirmNewPasswordCubit = VariableCubit(value: '');
    _isLoadingCubit = VariableCubit(value: false);

    final validateLinkOrCodeForTarget = await _corporateAuthenticationRepository.validateLinkOrCodeForTarget(
      Variables$Mutation$validateLinkOrCodeForTarget(
        token: widget.token,
        target: Input$TargetACIInput(
          pos: kPosID,
        ),
      ),
    );
    if (validateLinkOrCodeForTarget?.success != true) {
      FlutterMessenger.showSnackbar(context: context, string: translate(context, 'generalErrorMessage'));
      Navigator.pop(context);
    }
  }

  @override
  void dispose() {
    _showNewPasswordCubit.close();
    _showConfirmNewPasswordCubit.close();
    _newPasswordCubit.close();
    _confirmNewPasswordCubit.close();
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
  Widget build(BuildContext context) => MultiBlocProvider(
        providers: [
          BlocProvider(create: (context) => _showNewPasswordCubit),
          BlocProvider(create: (context) => _showConfirmNewPasswordCubit),
          BlocProvider(create: (context) => _isLoadingCubit),
          BlocProvider(create: (context) => _confirmNewPasswordCubit),
          BlocProvider(create: (context) => _newPasswordCubit),
        ],
        child: BlocBuilder<VariableCubit, dynamic>(
          bloc: _showNewPasswordCubit,
          builder: (context, showNewPassword) => BlocBuilder<VariableCubit, dynamic>(
            bloc: _newPasswordCubit,
            builder: (context, newPassword) => BlocBuilder<VariableCubit, dynamic>(
              bloc: _showConfirmNewPasswordCubit,
              builder: (context, showConfirmNewPassword) => BlocBuilder<VariableCubit, dynamic>(
                bloc: _confirmNewPasswordCubit,
                builder: (context, confirmNewPassword) => Scaffold(
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
                    right: false,
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        children: [
                          Expanded(
                            child: ListView(
                              padding: EdgeInsets.zero,
                              shrinkWrap: true,
                              primary: false,
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 16.0),
                                  decoration: BoxDecoration(
                                    border: Border.all(color: Colors.grey[800]!, width: 0.4),
                                    borderRadius: BorderRadius.circular(8.0),
                                  ),
                                  child: Row(
                                    children: [
                                      Expanded(
                                        child: TextField(
                                          onTapOutside: (value) => FocusManager.instance.primaryFocus?.unfocus,
                                          cursorColor: Theme.of(context).colorScheme.secondary,
                                          style: Theme.of(context).textTheme.bodyMedium,
                                          onChanged: _newPasswordCubit.updateValue,
                                          obscureText: showNewPassword,
                                          decoration: InputDecoration(
                                            hintStyle: Theme.of(context).textTheme.bodyMedium,
                                            enabledBorder: const UnderlineInputBorder(borderSide: BorderSide.none),
                                            focusedBorder: const UnderlineInputBorder(borderSide: BorderSide.none),
                                            border: const UnderlineInputBorder(borderSide: BorderSide.none),
                                            hintText: translate(context, 'enterYourNewPassword'),
                                          ),
                                        ),
                                      ),
                                      const SizedBox(width: 8.0),
                                      GestureDetector(
                                        onTap: () => _showNewPasswordCubit.updateValue(!showNewPassword),
                                        child: Container(
                                          height: 30.0,
                                          width: 30.0,
                                          decoration: BoxDecoration(
                                            borderRadius: BorderRadius.circular(100.0),
                                            color: Theme.of(context).focusColor,
                                          ),
                                          child: Icon(
                                            color: Theme.of(context).colorScheme.secondary,
                                            showNewPassword ? CupertinoIcons.eye : CupertinoIcons.eye_slash,
                                            size: 18.0,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                const SizedBox(height: 16.0),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 16.0),
                                  decoration: BoxDecoration(
                                    border: Border.all(color: Colors.grey[800]!, width: 0.4),
                                    borderRadius: BorderRadius.circular(8.0),
                                  ),
                                  child: Row(
                                    children: [
                                      Expanded(
                                        child: TextField(
                                          onTapOutside: (value) => FocusManager.instance.primaryFocus?.unfocus,
                                          cursorColor: Theme.of(context).colorScheme.secondary,
                                          style: Theme.of(context).textTheme.bodyMedium,
                                          obscureText: showConfirmNewPassword,
                                          onChanged: _confirmNewPasswordCubit.updateValue,
                                          decoration: InputDecoration(
                                            hintStyle: Theme.of(context).textTheme.bodyMedium,
                                            enabledBorder: const UnderlineInputBorder(borderSide: BorderSide.none),
                                            focusedBorder: const UnderlineInputBorder(borderSide: BorderSide.none),
                                            border: const UnderlineInputBorder(borderSide: BorderSide.none),
                                            hintText: translate(context, 'confirmYourNewPassword'),
                                          ),
                                        ),
                                      ),
                                      const SizedBox(width: 8.0),
                                      GestureDetector(
                                        onTap: () => _showConfirmNewPasswordCubit.updateValue(!showConfirmNewPassword),
                                        child: Container(
                                          height: 30.0,
                                          width: 30.0,
                                          decoration: BoxDecoration(
                                            borderRadius: BorderRadius.circular(100.0),
                                            color: Theme.of(context).focusColor,
                                          ),
                                          child: Icon(
                                            color: Theme.of(context).colorScheme.secondary,
                                            showConfirmNewPassword ? CupertinoIcons.eye : CupertinoIcons.eye_slash,
                                            size: 18.0,
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
                                      color: confirmNewPassword.toString().length >= 8 ? Theme.of(context).colorScheme.secondary : Theme.of(context).colorScheme.secondary.withOpacity(0.6),
                                      confirmNewPassword.toString().length >= 8 ? CupertinoIcons.check_mark : CupertinoIcons.clear,
                                      size: 14.0,
                                    ),
                                    const SizedBox(width: 4.0),
                                    Expanded(
                                      child: Text(
                                        translate(context, '8CharacteresOfLength'),
                                        style: Theme.of(context).textTheme.bodyMedium!.copyWith(
                                              color: confirmNewPassword.toString().length >= 8 ? Theme.of(context).colorScheme.secondary : Theme.of(context).colorScheme.secondary.withOpacity(0.6),
                                            ),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 16.0),
                                Row(
                                  children: [
                                    Icon(
                                      color: confirmNewPassword.toString().containsUppercase() ? Theme.of(context).colorScheme.secondary : Theme.of(context).colorScheme.secondary.withOpacity(0.6),
                                      confirmNewPassword.toString().containsUppercase() ? CupertinoIcons.check_mark : CupertinoIcons.clear,
                                      size: 14.0,
                                    ),
                                    const SizedBox(width: 4.0),
                                    Expanded(
                                      child: Text(
                                        translate(context, 'containsAtLeastOneUppercaseLetter'),
                                        style: Theme.of(context).textTheme.bodyMedium!.copyWith(
                                              color: confirmNewPassword.toString().containsUppercase()
                                                  ? Theme.of(context).colorScheme.secondary
                                                  : Theme.of(context).colorScheme.secondary.withOpacity(0.6),
                                            ),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 16.0),
                                Row(
                                  children: [
                                    Icon(
                                      color: confirmNewPassword.toString().containsLowercase() ? Theme.of(context).colorScheme.secondary : Theme.of(context).colorScheme.secondary.withOpacity(0.6),
                                      confirmNewPassword.toString().containsLowercase() ? CupertinoIcons.check_mark : CupertinoIcons.clear,
                                      size: 14.0,
                                    ),
                                    const SizedBox(width: 4.0),
                                    Expanded(
                                      child: Text(
                                        translate(context, 'containsAtLeastOneLowercaseLetter'),
                                        style: Theme.of(context).textTheme.bodyMedium!.copyWith(
                                              color: confirmNewPassword.toString().containsLowercase()
                                                  ? Theme.of(context).colorScheme.secondary
                                                  : Theme.of(context).colorScheme.secondary.withOpacity(0.6),
                                            ),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 16.0),
                                Row(
                                  children: [
                                    Icon(
                                      color: confirmNewPassword.toString().containsSymbol() ? Theme.of(context).colorScheme.secondary : Theme.of(context).colorScheme.secondary.withOpacity(0.6),
                                      confirmNewPassword.toString().containsSymbol() ? CupertinoIcons.check_mark : CupertinoIcons.clear,
                                      size: 14.0,
                                    ),
                                    const SizedBox(width: 4.0),
                                    Expanded(
                                      child: Text(
                                        translate(context, 'containsAtLeastOneSymbol'),
                                        style: Theme.of(context).textTheme.bodyMedium!.copyWith(
                                              color:
                                                  confirmNewPassword.toString().containsSymbol() ? Theme.of(context).colorScheme.secondary : Theme.of(context).colorScheme.secondary.withOpacity(0.6),
                                            ),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 16.0),
                                Row(
                                  children: [
                                    Icon(
                                      color: confirmNewPassword.toString().containsNumber() ? Theme.of(context).colorScheme.secondary : Theme.of(context).colorScheme.secondary.withOpacity(0.6),
                                      confirmNewPassword.toString().containsNumber() ? CupertinoIcons.check_mark : CupertinoIcons.clear,
                                      size: 14.0,
                                    ),
                                    const SizedBox(width: 4.0),
                                    Expanded(
                                      child: Text(
                                        translate(context, 'containsAtLeastOneNumber'),
                                        style: Theme.of(context).textTheme.bodyMedium!.copyWith(
                                              color:
                                                  confirmNewPassword.toString().containsNumber() ? Theme.of(context).colorScheme.secondary : Theme.of(context).colorScheme.secondary.withOpacity(0.6),
                                            ),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 16.0),
                                Row(
                                  children: [
                                    Icon(
                                      color: newPassword == confirmNewPassword && newPassword.toString().isNotEmpty
                                          ? Theme.of(context).colorScheme.secondary
                                          : Theme.of(context).colorScheme.secondary.withOpacity(0.6),
                                      newPassword == confirmNewPassword && newPassword.toString().isNotEmpty ? CupertinoIcons.check_mark : CupertinoIcons.clear,
                                      size: 14.0,
                                    ),
                                    const SizedBox(width: 4.0),
                                    Expanded(
                                      child: Text(
                                        translate(context, 'passwordAndNewPasswordMatch'),
                                        style: Theme.of(context).textTheme.bodyMedium!.copyWith(
                                              color: newPassword == confirmNewPassword && newPassword.toString().isNotEmpty
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
                                      minimumSize: const Size.fromHeight(40.0),
                                      backgroundColor: kAppColor,
                                      disabledBackgroundColor: kAppColor.withOpacity(0.6),
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(8.0),
                                      ),
                                    ),
                                    onPressed: _formHasError(newPassword: newPassword, confirmNewPassword: confirmNewPassword)
                                        ? null
                                        : () async {
                                            _isLoadingCubit.updateValue(true);
                                            final resetPasswordForTarget = await _corporateAuthenticationRepository
                                                .resetPasswordForTarget(
                                              Variables$Mutation$resetPasswordForTarget(
                                                token: widget.token,
                                                password: newPassword,
                                                target: Input$TargetACIInput(
                                                  pos: kPosID,
                                                ),
                                              ),
                                            )
                                                .catchError((onError) {
                                              _isLoadingCubit.updateValue(false);
                                              return null;
                                            });
                                            if (resetPasswordForTarget == null) {
                                              FlutterMessenger.showSnackbar(context: context, string: translate(context, 'generalErrorMessage'));
                                            } else {
                                              FlutterMessenger.showSnackbar(context: context, string: translate(context, 'passwordHasBeenSuccessfullyReset'));
                                              Navigator.of(context).pushNamedAndRemoveUntil('/Onboarding', (route) => false);
                                              Navigator.push(
                                                context,
                                                MaterialPageRoute(
                                                  builder: (context) => SignInWidget(
                                                    emailAddress: resetPasswordForTarget.email,
                                                    password: newPassword,
                                                  ),
                                                ),
                                              );
                                            }
                                            _isLoadingCubit.updateValue(false);
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
