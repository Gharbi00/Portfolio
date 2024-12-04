import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
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
import 'package:loyalcraft/src/repository/corporate_athentication.dart';
import 'package:loyalcraft/src/repository/user.dart';
import 'package:loyalcraft/src/widgets/custom_circular_progress_indicator.dart';

// ignore: must_be_immutable
class EditEmailAddressWidget extends StatefulWidget {
  const EditEmailAddressWidget({
    Key? key,
  }) : super(key: key);

  @override
  _EditEmailAddressWidget createState() => _EditEmailAddressWidget();
}

class _EditEmailAddressWidget extends State<EditEmailAddressWidget> {
  final TextEditingController _emailAddressController = TextEditingController();
  late CorporateAuthenticationRepository _corporateAuthenticationRepository;
  late UserRepository _userRepository;
  final SGraphQLClient _sGraphQLClient = SGraphQLClient();
  late VariableCubit _emailAddressCubit;
  late VariableCubit _isLoginExistCubit;
  late VariableCubit<bool> _isLoadingCubit;

  bool _formHasError({required String emailAddress, required bool isLoginExist}) => emailAddress.isValidEmailAddress() == false || isLoginExist == true;

  Future<void> _initState() async {
    _corporateAuthenticationRepository = CorporateAuthenticationRepository(_sGraphQLClient);
    _userRepository = UserRepository(_sGraphQLClient);
    _emailAddressCubit = VariableCubit(value: '');
    _isLoginExistCubit = VariableCubit(value: true);
    _isLoadingCubit = VariableCubit(value: false);
    final user = await getUserFromSP();
    _emailAddressController.text = user?.email ?? '';
    _emailAddressCubit.updateValue(user?.email ?? '');
  }

  @override
  void dispose() {
    _emailAddressController.dispose();
    _isLoginExistCubit.close();
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
          BlocProvider(create: (context) => _isLoginExistCubit),
          BlocProvider(create: (context) => _isLoadingCubit),
        ],
        child: BlocBuilder<VariableCubit, dynamic>(
          bloc: _emailAddressCubit,
          builder: (context, emailAddress) => BlocBuilder<VariableCubit, dynamic>(
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
                          translate(context, 'editEmailAddress'),
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
                              if (emailAddress.toString().isValidEmailAddress() && isLoginExist != null)
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
                                          translate(context, isLoginExist == false ? 'emailAddressAvailable' : 'emailAddressNotAvailable'),
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
                                    color: emailAddress.toString().isValidEmailAddress() ? Theme.of(context).colorScheme.secondary : Theme.of(context).colorScheme.secondary.withOpacity(0.6),
                                    emailAddress.toString().isValidEmailAddress() ? CupertinoIcons.check_mark : CupertinoIcons.clear,
                                    size: 14.0,
                                  ),
                                  const SizedBox(width: 4.0),
                                  Expanded(
                                    child: Text(
                                      translate(context, 'validEmailAddress'),
                                      style: Theme.of(context).textTheme.bodyMedium!.copyWith(
                                            color: emailAddress.toString().isValidEmailAddress() ? Theme.of(context).colorScheme.secondary : Theme.of(context).colorScheme.secondary.withOpacity(0.6),
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
                                  onPressed: _formHasError(emailAddress: emailAddress, isLoginExist: isLoginExist ?? true)
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
                                                email: emailAddress,
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
                                                emailAddress: emailAddress,
                                                isPhoneNumber: false,
                                                valueChanged: (value) async {
                                                  _isLoadingCubit.updateValue(true);
                                                  final updateCurrentUserEmail = await _userRepository
                                                      .updateCurrentUserLogins(
                                                    Variables$Mutation$updateCurrentUserLogins(
                                                      email: emailAddress,
                                                    ),
                                                  )
                                                      .catchError((onError) {
                                                    _isLoadingCubit.updateValue(false);
                                                    return null;
                                                  });
                                                  _isLoadingCubit.updateValue(false);
                                                  if (updateCurrentUserEmail?.user == null) {
                                                    FlutterMessenger.showSnackbar(context: context, string: translate(context, 'generalErrorMessage'));
                                                  } else {
                                                    addAccessTokenToSP(updateCurrentUserEmail!.accessToken);
                                                    BlocProvider.of<UserCubit>(context).setUser(Query$user$user.fromJson(updateCurrentUserEmail.user.toJson()));
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
      );
}
