import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_diktup_utilities/extensions.dart';
import 'package:flutter_loyalcraft_gql/graphql/user.graphql.dart';
import 'package:loyalcraft/localizations_delegate/app_localizations.dart';
import 'package:loyalcraft/src/bloc/variable.dart';
import 'package:loyalcraft/src/data/consts.dart';
import 'package:loyalcraft/src/data/flutter_messenger.dart';
import 'package:loyalcraft/src/data/graphql_client.dart';
import 'package:loyalcraft/src/repository/user.dart';
import 'package:loyalcraft/src/widgets/custom_circular_progress_indicator.dart';

// ignore: must_be_immutable
class EditPasswordWidget extends StatefulWidget {
  const EditPasswordWidget({
    Key? key,
  }) : super(key: key);

  @override
  _EditPasswordWidget createState() => _EditPasswordWidget();
}

class _EditPasswordWidget extends State<EditPasswordWidget> {
  late UserRepository _userRepository;
  final SGraphQLClient _sGraphQLClient = SGraphQLClient();
  late VariableCubit _showCurrentPasswordCubit;
  late VariableCubit _showConfirmPasswordCubit;
  late VariableCubit<bool> _isLoadingCubit;
  late VariableCubit _currentPasswordCubit;
  late VariableCubit _confirmPasswordCubit;

  bool _formHasError({required String currentPassword, required String confirmPassword}) =>
      currentPassword.trim().isEmpty ||
      (currentPassword.trim() != confirmPassword.trim() && currentPassword.trim().isNotEmpty) ||
      confirmPassword.trim().containsLowercase() == false ||
      confirmPassword.trim().containsNumber() == false ||
      confirmPassword.trim().containsSymbol() == false ||
      confirmPassword.trim().length < 8 ||
      confirmPassword.trim().containsUppercase() == false;

  void _initState() {
    _userRepository = UserRepository(_sGraphQLClient);
    _showConfirmPasswordCubit = VariableCubit(value: false);
    _showCurrentPasswordCubit = VariableCubit(value: false);
    _currentPasswordCubit = VariableCubit(value: '');
    _confirmPasswordCubit = VariableCubit(value: '');
    _isLoadingCubit = VariableCubit(value: false);
  }

  @override
  void dispose() {
    _showCurrentPasswordCubit.close();
    _showConfirmPasswordCubit.close();
    _currentPasswordCubit.close();
    _confirmPasswordCubit.close();
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
          BlocProvider(create: (context) => _showCurrentPasswordCubit),
          BlocProvider(create: (context) => _showConfirmPasswordCubit),
          BlocProvider(create: (context) => _isLoadingCubit),
          BlocProvider(create: (context) => _confirmPasswordCubit),
          BlocProvider(create: (context) => _currentPasswordCubit),
        ],
        child: BlocBuilder<VariableCubit, dynamic>(
          bloc: _showCurrentPasswordCubit,
          builder: (context, showCurrentPassword) => BlocBuilder<VariableCubit, dynamic>(
            bloc: _currentPasswordCubit,
            builder: (context, currentPassword) => BlocBuilder<VariableCubit, dynamic>(
              bloc: _showConfirmPasswordCubit,
              builder: (context, showConfirmPassword) => BlocBuilder<VariableCubit, dynamic>(
                bloc: _confirmPasswordCubit,
                builder: (context, confirmPassword) => Scaffold(
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
                            translate(context, 'editPassword'),
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
                                          onChanged: _currentPasswordCubit.updateValue,
                                          obscureText: showCurrentPassword,
                                          decoration: InputDecoration(
                                            hintStyle: Theme.of(context).textTheme.bodyMedium,
                                            enabledBorder: const UnderlineInputBorder(borderSide: BorderSide.none),
                                            focusedBorder: const UnderlineInputBorder(borderSide: BorderSide.none),
                                            border: const UnderlineInputBorder(borderSide: BorderSide.none),
                                            hintText: translate(context, 'enterYourCurrentPassword'),
                                          ),
                                        ),
                                      ),
                                      const SizedBox(width: 8.0),
                                      GestureDetector(
                                        onTap: () => _showCurrentPasswordCubit.updateValue(!showCurrentPassword),
                                        child: Container(
                                          height: 30.0,
                                          width: 30.0,
                                          decoration: BoxDecoration(
                                            borderRadius: BorderRadius.circular(100.0),
                                            color: Theme.of(context).focusColor,
                                          ),
                                          child: Icon(
                                            color: Theme.of(context).colorScheme.secondary,
                                            showCurrentPassword ? CupertinoIcons.eye : CupertinoIcons.eye_slash,
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
                                          obscureText: showConfirmPassword,
                                          onChanged: _confirmPasswordCubit.updateValue,
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
                                        onTap: () => _showConfirmPasswordCubit.updateValue(!showConfirmPassword),
                                        child: Container(
                                          height: 30.0,
                                          width: 30.0,
                                          decoration: BoxDecoration(
                                            borderRadius: BorderRadius.circular(100.0),
                                            color: Theme.of(context).focusColor,
                                          ),
                                          child: Icon(
                                            color: Theme.of(context).colorScheme.secondary,
                                            showConfirmPassword ? CupertinoIcons.eye : CupertinoIcons.eye_slash,
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
                                      color: confirmPassword.toString().length >= 8 ? Theme.of(context).colorScheme.secondary : Theme.of(context).colorScheme.secondary.withOpacity(0.6),
                                      confirmPassword.toString().length >= 8 ? CupertinoIcons.check_mark : CupertinoIcons.clear,
                                      size: 14.0,
                                    ),
                                    const SizedBox(width: 4.0),
                                    Expanded(
                                      child: Text(
                                        translate(context, '8CharacteresOfLength'),
                                        style: Theme.of(context).textTheme.bodyMedium!.copyWith(
                                              color: confirmPassword.toString().length >= 8 ? Theme.of(context).colorScheme.secondary : Theme.of(context).colorScheme.secondary.withOpacity(0.6),
                                            ),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 16.0),
                                Row(
                                  children: [
                                    Icon(
                                      color: confirmPassword.toString().containsUppercase() ? Theme.of(context).colorScheme.secondary : Theme.of(context).colorScheme.secondary.withOpacity(0.6),
                                      confirmPassword.toString().containsUppercase() ? CupertinoIcons.check_mark : CupertinoIcons.clear,
                                      size: 14.0,
                                    ),
                                    const SizedBox(width: 4.0),
                                    Expanded(
                                      child: Text(
                                        translate(context, 'containsAtLeastOneUppercaseLetter'),
                                        style: Theme.of(context).textTheme.bodyMedium!.copyWith(
                                              color:
                                                  confirmPassword.toString().containsUppercase() ? Theme.of(context).colorScheme.secondary : Theme.of(context).colorScheme.secondary.withOpacity(0.6),
                                            ),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 16.0),
                                Row(
                                  children: [
                                    Icon(
                                      color: confirmPassword.toString().containsLowercase() ? Theme.of(context).colorScheme.secondary : Theme.of(context).colorScheme.secondary.withOpacity(0.6),
                                      confirmPassword.toString().containsLowercase() ? CupertinoIcons.check_mark : CupertinoIcons.clear,
                                      size: 14.0,
                                    ),
                                    const SizedBox(width: 4.0),
                                    Expanded(
                                      child: Text(
                                        translate(context, 'containsAtLeastOneLowercaseLetter'),
                                        style: Theme.of(context).textTheme.bodyMedium!.copyWith(
                                              color:
                                                  confirmPassword.toString().containsLowercase() ? Theme.of(context).colorScheme.secondary : Theme.of(context).colorScheme.secondary.withOpacity(0.6),
                                            ),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 16.0),
                                Row(
                                  children: [
                                    Icon(
                                      color: confirmPassword.toString().containsSymbol() ? Theme.of(context).colorScheme.secondary : Theme.of(context).colorScheme.secondary.withOpacity(0.6),
                                      confirmPassword.toString().containsSymbol() ? CupertinoIcons.check_mark : CupertinoIcons.clear,
                                      size: 14.0,
                                    ),
                                    const SizedBox(width: 4.0),
                                    Expanded(
                                      child: Text(
                                        translate(context, 'containsAtLeastOneSymbol'),
                                        style: Theme.of(context).textTheme.bodyMedium!.copyWith(
                                              color: confirmPassword.toString().containsSymbol() ? Theme.of(context).colorScheme.secondary : Theme.of(context).colorScheme.secondary.withOpacity(0.6),
                                            ),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 16.0),
                                Row(
                                  children: [
                                    Icon(
                                      color: confirmPassword.toString().containsNumber() ? Theme.of(context).colorScheme.secondary : Theme.of(context).colorScheme.secondary.withOpacity(0.6),
                                      confirmPassword.toString().containsNumber() ? CupertinoIcons.check_mark : CupertinoIcons.clear,
                                      size: 14.0,
                                    ),
                                    const SizedBox(width: 4.0),
                                    Expanded(
                                      child: Text(
                                        translate(context, 'containsAtLeastOneNumber'),
                                        style: Theme.of(context).textTheme.bodyMedium!.copyWith(
                                              color: confirmPassword.toString().containsNumber() ? Theme.of(context).colorScheme.secondary : Theme.of(context).colorScheme.secondary.withOpacity(0.6),
                                            ),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 16.0),
                                Row(
                                  children: [
                                    Icon(
                                      color: currentPassword == confirmPassword && currentPassword.toString().isNotEmpty
                                          ? Theme.of(context).colorScheme.secondary
                                          : Theme.of(context).colorScheme.secondary.withOpacity(0.6),
                                      currentPassword == confirmPassword && currentPassword.toString().isNotEmpty ? CupertinoIcons.check_mark : CupertinoIcons.clear,
                                      size: 14.0,
                                    ),
                                    const SizedBox(width: 4.0),
                                    Expanded(
                                      child: Text(
                                        translate(context, 'currentPasswordAndNewPasswordMatch'),
                                        style: Theme.of(context).textTheme.bodyMedium!.copyWith(
                                              color: currentPassword == confirmPassword && currentPassword.toString().isNotEmpty
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
                                    onPressed: _formHasError(currentPassword: currentPassword, confirmPassword: confirmPassword)
                                        ? null
                                        : () async {
                                            _isLoadingCubit.updateValue(true);
                                            final updateCurrentUserPassword = await _userRepository
                                                .updateCurrentUserPassword(
                                              Variables$Mutation$updateCurrentUserPassword(
                                                oldPassword: currentPassword,
                                                newPassword: confirmPassword,
                                              ),
                                            )
                                                .catchError((onError) {
                                              _isLoadingCubit.updateValue(false);
                                              return null;
                                            });
                                            _isLoadingCubit.updateValue(false);
                                            if (updateCurrentUserPassword == null) {
                                              FlutterMessenger.showSnackbar(context: context, string: translate(context, 'generalErrorMessage'));
                                            } else {
                                              FlutterMessenger.showSnackbar(context: context, string: translate(context, 'updateProfileToastMessage'));
                                              Navigator.pop(context);
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
