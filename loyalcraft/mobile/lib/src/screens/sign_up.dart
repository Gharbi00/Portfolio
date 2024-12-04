import 'package:flutter/cupertino.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_diktup_utilities/extensions.dart';
import 'package:flutter_loyalcraft_gql/graphql/corporate-authentication.graphql.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-card-user-card.graphql.dart';
import 'package:flutter_loyalcraft_gql/graphql/user.graphql.dart';
import 'package:flutter_loyalcraft_gql/schema.graphql.dart';
import 'package:loyalcraft/localizations_delegate/app_localizations.dart';
import 'package:loyalcraft/src/bloc/locale.dart';
import 'package:loyalcraft/src/bloc/theme.dart';
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
import 'package:loyalcraft/src/repository/user_card.dart';
import 'package:loyalcraft/src/utils/image_cache_manager/shared_image_provider.dart';
import 'package:loyalcraft/src/utils/utility.dart';

// ignore: must_be_immutable
class SignUpWidget extends StatefulWidget {
  const SignUpWidget({
    Key? key,
  }) : super(key: key);

  @override
  _SignUpWidget createState() => _SignUpWidget();
}

class _SignUpWidget extends State<SignUpWidget> {
  final TextEditingController _emailAddressController = TextEditingController();
  final TextEditingController _firstNameController = TextEditingController();
  final TextEditingController _lastNameController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  final TextEditingController _phoneNumberController = TextEditingController();
  late VariableCubit<String> _phoneNumberCubit;
  late CorporateAuthenticationRepository _corporateAuthenticationRepository;
  final SGraphQLClient _sGraphQLClient = SGraphQLClient();
  late VariableCubit _showPasswordCubit;
  late VariableCubit _emailAddressCubit;
  late VariableCubit _firstNameCubit;
  late VariableCubit<bool> _isLoadingCubit;
  late VariableCubit _passwordCubit;
  late VariableCubit _lastNameCubit;
  late VariableCubit _isLoginExistCubit;
  late UserRepository _userRepository;
  late UserCardRepository _userCardRepository;

  final List<String> _tabList = [
    'phoneNumber',
    'emailAddress',
  ];
  late VariableCubit<int> _tabCubit;
  late VariableCubit<DialCode> _dialCodeCubit;

  bool _formHasError({
    required String firstName,
    required String lastName,
    required String emailAddress,
    required String password,
    required bool isLoginExist,
    required String phoneNumber,
    required int tab,
    required DialCode dialCode,
  }) {
    if (firstName.trim().isEmpty) {
      return true;
    }
    if (lastName.trim().isEmpty) {
      return true;
    }
    if (tab == 0 && phoneNumber.isInteger() == false) {
      return true;
    }
    if (tab == 0 && phoneNumber.length != dialCode.numberLength) {
      return true;
    }
    if (tab == 1 && emailAddress.isValidEmailAddress() == false) {
      return true;
    }
    if (isLoginExist == true) {
      return true;
    }
    if (password.containsLowercase() == false) {
      return true;
    }
    if (password.containsNumber() == false) {
      return true;
    }
    if (password.containsSymbol() == false) {
      return true;
    }
    if (password.length < 8) {
      return true;
    }
    if (password.containsUppercase() == false) {
      return true;
    }
    return false;
  }

  Future<void> _registerForTarget() async {
    _isLoadingCubit.updateValue(true);
    final registerForTarget = await _corporateAuthenticationRepository
        .registerForTarget(
      Variables$Mutation$registerForTarget(
        input: Input$UserWithTargetInput(
          locale: '${kLocaleList.first.languageCode}_${kLocaleList.first.countryCode}',
          subject: translate(context, 'hello'),
          maritalStatus: Enum$MaritalStatus.PREFER_NOT_TO_SAY,
          mobileTheme: Enum$MobileThemesEnum.SYSTEM,
          gender: Enum$Gender.PREFER_NOT_TO_SAY,
          firstName: _firstNameCubit.state,
          email: _tabCubit.state == 0 ? null : _emailAddressCubit.state,
          phone: _tabCubit.state == 1
              ? null
              : Input$PhoneInput(
                  countryCode: _dialCodeCubit.state!.dialCode,
                  number: _phoneNumberCubit.state,
                ),
          password: _passwordCubit.state,
          lastName: _lastNameCubit.state,
          roles: [
            Enum$UserRole.CONSUMER,
          ],
          target: Input$TargetACIInput(
            pos: kPosID,
          ),
        ),
      ),
    )
        .catchError((onError) {
      _isLoadingCubit.updateValue(false);
      return null;
    });
    if (registerForTarget?.user == null) {
      FlutterMessenger.showSnackbar(context: context, string: translate(context, 'generalErrorMessage'));
      await addAccessTokenToSP('');
    } else {
      await addAccessTokenToSP(registerForTarget!.accessToken);
      final onboardUserToTargetLoyalty = await _userCardRepository
          .onboardUserToTargetLoyalty(
        Variables$Mutation$onboardUserToTargetLoyalty(
          id: registerForTarget.user.id,
          target: Input$TargetACIInput(
            pos: kPosID,
          ),
        ),
      )
          .catchError((onError) async {
        _isLoadingCubit.updateValue(false);
        final deleteUser = await _userRepository.deleteUser(
          Variables$Mutation$deleteUser(
            description: Enum$DeleteUserReasonEnum.LACK_OF_CONTENT.name,
            reason: Enum$DeleteUserReasonEnum.LACK_OF_CONTENT,
            password: _passwordCubit.state,
            id: registerForTarget.user.id,
          ),
        );
        debugPrint('$deleteUser');
        await addAccessTokenToSP('');
        return null;
      });
      if (onboardUserToTargetLoyalty == null) {
        final deleteUser = await _userRepository.deleteUser(
          Variables$Mutation$deleteUser(
            description: Enum$DeleteUserReasonEnum.LACK_OF_CONTENT.name,
            reason: Enum$DeleteUserReasonEnum.LACK_OF_CONTENT,
            password: _passwordCubit.state,
            id: registerForTarget.user.id,
          ),
        );
        debugPrint('$deleteUser');
        await addAccessTokenToSP('');
        FlutterMessenger.showSnackbar(context: context, string: translate(context, 'generalErrorMessage'));
      } else {
        await addAccessTokenToSP(registerForTarget.accessToken);
        BlocProvider.of<UserCubit>(context).setUser(Query$user$user.fromJson(registerForTarget.user.toJson()));
        BlocProvider.of<ThemeCubit>(context).setTheme(getThemeDataFromString(locale: getLocaleFromString(registerForTarget.user.locale ?? ''), theme: registerForTarget.user.mobileTheme?.name ?? ''));
        BlocProvider.of<LocaleCubit>(context).setLocale(getLocaleFromString(registerForTarget.user.locale ?? ''));
        Navigator.of(context).pushNamedAndRemoveUntil('/Tabs', (route) => false);
      }
    }
    _isLoadingCubit.updateValue(false);
  }

  Future<void> _initState() async {
    _corporateAuthenticationRepository = CorporateAuthenticationRepository(_sGraphQLClient);
    _userRepository = UserRepository(_sGraphQLClient);
    _userCardRepository = UserCardRepository(_sGraphQLClient);
    _showPasswordCubit = VariableCubit(value: false);
    _emailAddressCubit = VariableCubit(value: '');
    _passwordCubit = VariableCubit(value: '');
    _phoneNumberCubit = VariableCubit(value: '');
    _lastNameCubit = VariableCubit(value: '');
    _firstNameCubit = VariableCubit(value: '');
    _isLoadingCubit = VariableCubit(value: false);
    _tabCubit = VariableCubit(value: 0);
    _dialCodeCubit = VariableCubit(value: kDialCodeList.first);
    _isLoginExistCubit = VariableCubit(value: true);
  }

  @override
  void dispose() {
    _showPasswordCubit.close();
    _emailAddressCubit.close();
    _passwordCubit.close();
    _lastNameCubit.close();
    _firstNameCubit.close();
    _phoneNumberCubit.close();
    _isLoadingCubit.close();
    _passwordController.dispose();
    _firstNameController.dispose();
    _lastNameController.dispose();
    _tabCubit.close();
    _dialCodeCubit.close();
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
          BlocProvider(create: (context) => _showPasswordCubit),
          BlocProvider(create: (context) => _emailAddressCubit),
          BlocProvider(create: (context) => _firstNameCubit),
          BlocProvider(create: (context) => _isLoadingCubit),
          BlocProvider(create: (context) => _lastNameCubit),
          BlocProvider(create: (context) => _passwordCubit),
          BlocProvider(create: (context) => _isLoginExistCubit),
          BlocProvider(create: (context) => _dialCodeCubit),
          BlocProvider(create: (context) => _phoneNumberCubit),
          BlocProvider(create: (context) => _tabCubit),
        ],
        child: BlocBuilder<VariableCubit, dynamic>(
          bloc: _phoneNumberCubit,
          builder: (context, phoneNumber) => BlocBuilder<VariableCubit, dynamic>(
            bloc: _tabCubit,
            builder: (context, tab) => BlocBuilder<VariableCubit, dynamic>(
              bloc: _dialCodeCubit,
              builder: (context, dialCode) => BlocBuilder<VariableCubit, dynamic>(
                bloc: _isLoadingCubit,
                builder: (context, isLoading) => BlocBuilder<VariableCubit, dynamic>(
                  bloc: _showPasswordCubit,
                  builder: (context, showPassword) => BlocBuilder<VariableCubit, dynamic>(
                    bloc: _emailAddressCubit,
                    builder: (context, emailAddress) => BlocBuilder<VariableCubit, dynamic>(
                      bloc: _passwordCubit,
                      builder: (context, password) => BlocBuilder<VariableCubit, dynamic>(
                        bloc: _firstNameCubit,
                        builder: (context, firstName) => BlocBuilder<VariableCubit, dynamic>(
                          bloc: _lastNameCubit,
                          builder: (context, lastName) => BlocBuilder<VariableCubit, dynamic>(
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
                                        translate(context, 'signUp'),
                                        style: Theme.of(context).textTheme.headlineSmall,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              body: SafeArea(
                                left: false,
                                right: false,
                                child: ListView(
                                  padding: const EdgeInsets.all(16.0),
                                  shrinkWrap: true,
                                  primary: false,
                                  children: [
                                    Center(
                                      child: SharedImageProviderWidget(
                                        imageUrl: kAppIcon,
                                        borderRadius: BorderRadius.circular(4.0),
                                        fit: BoxFit.cover,
                                        height: 100.0,
                                        width: 100.0,
                                      ),
                                    ),
                                    const SizedBox(height: 16.0),
                                    Center(
                                      child: SharedImageProviderWidget(
                                        imageUrl: kLoyalcraftBlackText,
                                        fit: BoxFit.cover,
                                        height: 30.0,
                                        color: Theme.of(context).colorScheme.secondary,
                                        width: 30.0,
                                      ),
                                    ),
                                    const SizedBox(height: 16.0),
                                    RichText(
                                      textAlign: TextAlign.center,
                                      text: TextSpan(
                                        children: [
                                          TextSpan(
                                            text: translate(context, 'AlreadyMember?'),
                                            style: Theme.of(context).textTheme.bodySmall,
                                          ),
                                          TextSpan(
                                            recognizer: TapGestureRecognizer()..onTap = () => Navigator.pushNamed(context, '/SignIn'),
                                            text: ' ${translate(context, 'signIn')}',
                                            style: Theme.of(context).textTheme.bodySmall!.copyWith(
                                                  fontWeight: FontWeight.bold,
                                                  color: Theme.of(context).colorScheme.secondary,
                                                ),
                                          ),
                                        ],
                                      ),
                                    ),
                                    const SizedBox(height: 16.0),
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
                                        keyboardType: TextInputType.text,
                                        onChanged: _firstNameCubit.updateValue,
                                        controller: _firstNameController,
                                        decoration: InputDecoration(
                                          enabledBorder: const UnderlineInputBorder(borderSide: BorderSide.none),
                                          focusedBorder: const UnderlineInputBorder(borderSide: BorderSide.none),
                                          border: const UnderlineInputBorder(borderSide: BorderSide.none),
                                          hintStyle: Theme.of(context).textTheme.bodyMedium,
                                          hintText: translate(context, 'enterYourFirstName'),
                                        ),
                                      ),
                                    ),
                                    const SizedBox(height: 16.0),
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
                                        keyboardType: TextInputType.text,
                                        onChanged: _lastNameCubit.updateValue,
                                        controller: _lastNameController,
                                        decoration: InputDecoration(
                                          enabledBorder: const UnderlineInputBorder(borderSide: BorderSide.none),
                                          focusedBorder: const UnderlineInputBorder(borderSide: BorderSide.none),
                                          border: const UnderlineInputBorder(borderSide: BorderSide.none),
                                          hintStyle: Theme.of(context).textTheme.bodyMedium,
                                          hintText: translate(context, 'enterYourLastName'),
                                        ),
                                      ),
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
                                            const SizedBox(width: 4),
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
                                    if (tab == 0 && phoneNumber.toString().isInteger() && phoneNumber.toString().length == dialCode.numberLength && isLoginExist != null && isLoginExist == true)
                                      Padding(
                                        padding: const EdgeInsets.only(top: 16.0),
                                        child: Row(
                                          children: [
                                            Icon(
                                              color: Theme.of(context).colorScheme.secondary,
                                              CupertinoIcons.clear,
                                              size: 14.0,
                                            ),
                                            const SizedBox(width: 4.0),
                                            Expanded(
                                              child: Text(
                                                translate(context, 'phoneNumberNotAvailable'),
                                                style: Theme.of(context).textTheme.bodyMedium,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    if (tab == 1 && emailAddress.toString().isValidEmailAddress() && isLoginExist != null && isLoginExist == true)
                                      Padding(
                                        padding: const EdgeInsets.only(top: 16.0),
                                        child: Row(
                                          children: [
                                            Icon(
                                              color: Theme.of(context).colorScheme.secondary,
                                              CupertinoIcons.clear,
                                              size: 14.0,
                                            ),
                                            const SizedBox(width: 4.0),
                                            Expanded(
                                              child: Text(
                                                translate(context, 'emailAddressNotAvailable'),
                                                style: Theme.of(context).textTheme.bodyMedium,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    if (tab == 0 && phoneNumber.toString().isNotEmpty && (phoneNumber.toString().isInteger() == false || phoneNumber.toString().length != dialCode.numberLength))
                                      Padding(
                                        padding: const EdgeInsets.only(top: 16.0),
                                        child: Row(
                                          children: [
                                            Icon(
                                              color: Theme.of(context).colorScheme.secondary,
                                              CupertinoIcons.clear,
                                              size: 14.0,
                                            ),
                                            const SizedBox(width: 4.0),
                                            Expanded(
                                              child: Text(
                                                translate(context, 'phoneNumberNotValid'),
                                                style: Theme.of(context).textTheme.bodyMedium,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    if (tab == 1 && emailAddress.toString().isNotEmpty && emailAddress.toString().isValidEmailAddress() == false)
                                      Padding(
                                        padding: const EdgeInsets.only(top: 16.0),
                                        child: Row(
                                          children: [
                                            Icon(
                                              color: Theme.of(context).colorScheme.secondary,
                                              CupertinoIcons.clear,
                                              size: 14.0,
                                            ),
                                            const SizedBox(width: 4.0),
                                            Expanded(
                                              child: Text(
                                                translate(context, 'emailAddressNotValid'),
                                                style: Theme.of(context).textTheme.bodyMedium,
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
                                              obscureText: !showPassword,
                                              onChanged: _passwordCubit.updateValue,
                                              controller: _passwordController,
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
                                                showPassword ? CupertinoIcons.eye : CupertinoIcons.eye_slash,
                                                color: Theme.of(context).colorScheme.secondary,
                                                size: 18.0,
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                    if (password.toString().length < 8 && password.toString().isNotEmpty)
                                      Padding(
                                        padding: const EdgeInsets.only(top: 16.0),
                                        child: Row(
                                          children: [
                                            Icon(
                                              color: Theme.of(context).colorScheme.secondary,
                                              CupertinoIcons.clear,
                                              size: 14.0,
                                            ),
                                            const SizedBox(width: 4.0),
                                            Expanded(
                                              child: Text(
                                                translate(context, '8CharacteresOfLength'),
                                                style: Theme.of(context).textTheme.bodyMedium,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    if (password.toString().containsUppercase() == false && password.toString().isNotEmpty)
                                      Padding(
                                        padding: const EdgeInsets.only(top: 16.0),
                                        child: Row(
                                          children: [
                                            Icon(
                                              color: Theme.of(context).colorScheme.secondary,
                                              CupertinoIcons.clear,
                                              size: 14.0,
                                            ),
                                            const SizedBox(width: 4.0),
                                            Expanded(
                                              child: Text(
                                                translate(context, 'containsAtLeastOneUppercaseLetter'),
                                                style: Theme.of(context).textTheme.bodyMedium,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    if (password.toString().containsLowercase() == false && password.toString().isNotEmpty)
                                      Padding(
                                        padding: const EdgeInsets.only(top: 16.0),
                                        child: Row(
                                          children: [
                                            Icon(
                                              color: Theme.of(context).colorScheme.secondary,
                                              CupertinoIcons.clear,
                                              size: 14.0,
                                            ),
                                            const SizedBox(width: 4.0),
                                            Expanded(
                                              child: Text(
                                                translate(context, 'containsAtLeastOneLowercaseLetter'),
                                                style: Theme.of(context).textTheme.bodyMedium,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    if (password.toString().containsSymbol() == false && password.toString().isNotEmpty)
                                      Padding(
                                        padding: const EdgeInsets.only(top: 16.0),
                                        child: Row(
                                          children: [
                                            Icon(
                                              color: Theme.of(context).colorScheme.secondary,
                                              CupertinoIcons.clear,
                                              size: 14.0,
                                            ),
                                            const SizedBox(width: 4.0),
                                            Expanded(
                                              child: Text(
                                                translate(context, 'containsAtLeastOneSymbol'),
                                                style: Theme.of(context).textTheme.bodyMedium,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    if (password.toString().containsNumber() == false && password.toString().isNotEmpty)
                                      Padding(
                                        padding: const EdgeInsets.only(top: 16.0),
                                        child: Row(
                                          children: [
                                            Icon(
                                              color: Theme.of(context).colorScheme.secondary,
                                              CupertinoIcons.clear,
                                              size: 14.0,
                                            ),
                                            const SizedBox(width: 4.0),
                                            Expanded(
                                              child: Text(
                                                translate(context, 'containsAtLeastOneNumber'),
                                                style: Theme.of(context).textTheme.bodyMedium,
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
                                          minimumSize: const Size.fromHeight(40.0),
                                          backgroundColor: kAppColor,
                                          disabledBackgroundColor: kAppColor.withOpacity(0.6),
                                          shape: RoundedRectangleBorder(
                                            borderRadius: BorderRadius.circular(8.0),
                                          ),
                                        ),
                                        onPressed: _formHasError(
                                          isLoginExist: isLoginExist ?? true,
                                          emailAddress: emailAddress,
                                          phoneNumber: phoneNumber,
                                          firstName: firstName,
                                          lastName: lastName,
                                          dialCode: dialCode,
                                          password: password,
                                          tab: tab,
                                        )
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
                                                      subject: tab == 0 ? null : translate(context, 'validationCode'),
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
                                                  if (sendValidationCode?.success == false) {
                                                    FlutterMessenger.showSnackbar(context: context, string: translate(context, 'generalErrorMessage'));
                                                  } else {
                                                    showConfirmOtpSheet(
                                                      context: context,
                                                      isPhoneNumber: tab == 0,
                                                      dialCode: _dialCodeCubit.state,
                                                      emailAddress: tab == 0 ? null : emailAddress,
                                                      phoneNumber: tab == 1 ? null : phoneNumber,
                                                      valueChanged: (value) async {
                                                        _registerForTarget();
                                                      },
                                                    );
                                                  }
                                                }
                                              },
                                        child: Text(
                                          translate(context, 'signUp'),
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
          ),
        ),
      );
}
