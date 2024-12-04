import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_diktup_utilities/extensions.dart';
import 'package:flutter_loyalcraft_gql/graphql/user.graphql.dart';
import 'package:flutter_loyalcraft_gql/schema.graphql.dart';
import 'package:loyalcraft/localizations_delegate/app_localizations.dart';
import 'package:loyalcraft/src/bloc/user.dart';
import 'package:loyalcraft/src/bloc/variable.dart';
import 'package:loyalcraft/src/data/consts.dart';
import 'package:loyalcraft/src/data/flutter_messenger.dart';
import 'package:loyalcraft/src/data/graphql_client.dart';
import 'package:loyalcraft/src/data/shared_preferences.dart';
import 'package:loyalcraft/src/repository/user.dart';
import 'package:loyalcraft/src/utils/image_cache_manager/shared_image_provider.dart';

// ignore: must_be_immutable
class DeleteAccount2Widget extends StatefulWidget {
  const DeleteAccount2Widget({
    Key? key,
  }) : super(key: key);

  @override
  _DeleteAccount2Widget createState() => _DeleteAccount2Widget();
}

class _DeleteAccount2Widget extends State<DeleteAccount2Widget> {
  final SGraphQLClient _sGraphQLClient = SGraphQLClient();
  late VariableCubit _passwordCubit;
  late VariableCubit _showPasswordCubit;
  late UserRepository _userRepository;
  late VariableCubit<bool> _isLoadingCubit;

  bool _formHasError(String password) => password.isEmpty;

  Future<void> _initState() async {
    _userRepository = UserRepository(_sGraphQLClient);
    _isLoadingCubit = VariableCubit(value: false);
    _passwordCubit = VariableCubit(value: '');
    _showPasswordCubit = VariableCubit(value: true);
  }

  @override
  void dispose() {
    _isLoadingCubit.close();
    _passwordCubit.close();
    _showPasswordCubit.close();
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
    final _user = context.watch<UserCubit>().state;
    return MultiBlocProvider(
      providers: [
        BlocProvider(create: (context) => _passwordCubit),
        BlocProvider(create: (context) => _isLoadingCubit),
        BlocProvider(create: (context) => _showPasswordCubit),
      ],
      child: BlocBuilder<VariableCubit, dynamic>(
        bloc: _passwordCubit,
        builder: (context, password) => BlocBuilder<VariableCubit, dynamic>(
          bloc: _showPasswordCubit,
          builder: (context, showPassword) => BlocBuilder<VariableCubit, dynamic>(
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
                        translate(context, 'procedToDeleteAccount'),
                        style: Theme.of(context).textTheme.headlineSmall,
                      ),
                    ),
                  ],
                ),
              ),
              body: SafeArea(
                top: false,
                left: false,
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
                            Center(
                              child: ((_user?.picture?.baseUrl ?? '').isEmpty || (_user?.picture?.path ?? '').isEmpty)
                                  ? Hero(
                                      tag: kUserAvatar,
                                      child: SharedImageProviderWidget(
                                        imageUrl: kUserAvatar,
                                        backgroundColor: Theme.of(context).focusColor,
                                        borderRadius: BorderRadius.circular(8.0),
                                        fit: BoxFit.cover,
                                        height: 120.0,
                                        width: 120.0,
                                      ),
                                    )
                                  : Hero(
                                      tag: '${_user!.picture!.baseUrl.removeNull()}/${_user.picture!.path.removeNull()}',
                                      child: SharedImageProviderWidget(
                                        imageUrl: '${_user.picture!.baseUrl.removeNull()}/${_user.picture!.path.removeNull()}',
                                        color: Theme.of(context).colorScheme.secondary,
                                        backgroundColor: Theme.of(context).focusColor,
                                        borderRadius: BorderRadius.circular(100.0),
                                        fit: BoxFit.cover,
                                        height: 120.0,
                                        width: 120.0,
                                      ),
                                    ),
                            ),
                            const SizedBox(height: 16.0),
                            Text(
                              '${_user?.firstName ?? ''} ${_user?.lastName ?? ''}',
                              textAlign: TextAlign.center,
                              style: Theme.of(context).textTheme.displayMedium!.copyWith(
                                    fontSize: 20.0,
                                  ),
                            ),
                            const SizedBox(height: 4.0),
                            Text(
                              _user?.email ?? '',
                              style: Theme.of(context).textTheme.bodyLarge,
                              textAlign: TextAlign.center,
                            ),
                            const SizedBox(height: 32.0),
                            Text(
                              translate(context, 'deleteAccountText1'),
                              textAlign: TextAlign.center,
                              style: Theme.of(context).textTheme.displayMedium,
                            ),
                            const SizedBox(height: 16.0),
                            Text(
                              translate(context, 'deleteAccountText2'),
                              style: Theme.of(context).textTheme.bodySmall,
                              textAlign: TextAlign.center,
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
                                      onChanged: _passwordCubit.updateValue,
                                      obscureText: showPassword,
                                      decoration: InputDecoration(
                                        hintStyle: Theme.of(context).textTheme.bodyMedium,
                                        enabledBorder: const UnderlineInputBorder(borderSide: BorderSide.none),
                                        focusedBorder: const UnderlineInputBorder(borderSide: BorderSide.none),
                                        border: const UnderlineInputBorder(borderSide: BorderSide.none),
                                        hintText: translate(context, 'enterYourPassword'),
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 8.0),
                                  GestureDetector(
                                    onTap: () => _showPasswordCubit.updateValue(!showPassword),
                                    child: Container(
                                      height: 30.0,
                                      width: 30.0,
                                      decoration: BoxDecoration(
                                        borderRadius: BorderRadius.circular(100.0),
                                        color: Theme.of(context).focusColor,
                                      ),
                                      child: Icon(
                                        color: Theme.of(context).colorScheme.secondary,
                                        showPassword ? CupertinoIcons.eye : CupertinoIcons.eye_slash,
                                        size: 18.0,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16.0),
                      TextButton(
                        style: TextButton.styleFrom(
                          minimumSize: const Size.fromHeight(40.0),
                          disabledBackgroundColor: kAppColor.withOpacity(0.6),
                          backgroundColor: kAppColor,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8.0),
                          ),
                        ),
                        onPressed: isLoading
                            ? null
                            : () {
                                Navigator.pop(context);
                                Navigator.pop(context);
                              },
                        child: Text(
                          translate(context, 'iveChangedMyMind'),
                          textAlign: TextAlign.center,
                          style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                                color: Colors.white,
                              ),
                        ),
                      ),
                      const SizedBox(height: 16.0),
                      Opacity(
                        opacity: _formHasError(password) || isLoading ? 0.5 : 1.0,
                        child: TextButton(
                          style: TextButton.styleFrom(
                            minimumSize: const Size.fromHeight(40.0),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8.0),
                              side: BorderSide(
                                color: kAppColor,
                              ),
                            ),
                          ),
                          onPressed: _formHasError(password) || isLoading
                              ? null
                              : () async {
                                  _isLoadingCubit.updateValue(true);
                                  final deleteUser = await _userRepository
                                      .deleteUser(
                                    Variables$Mutation$deleteUser(
                                      reason: Enum$DeleteUserReasonEnum.LACK_OF_CONTENT,
                                      password: password,
                                      description: Enum$DeleteUserReasonEnum.LACK_OF_CONTENT.name,
                                      id: kUserID,
                                    ),
                                  )
                                      .catchError((onError) {
                                    _isLoadingCubit.updateValue(false);
                                    return null;
                                  });
                                  _isLoadingCubit.updateValue(false);
                                  if (deleteUser == null) {
                                    FlutterMessenger.showSnackbar(context: context, string: translate(context, 'generalErrorMessage'));
                                  } else {
                                    signOut(context);
                                  }
                                },
                          child: Text(
                            translate(context, 'delete'),
                            textAlign: TextAlign.center,
                            style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                                  color: kAppColor,
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
    );
  }
}
