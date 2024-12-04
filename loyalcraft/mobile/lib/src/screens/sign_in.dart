import 'package:flutter/cupertino.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_diktup_utilities/extensions.dart';
import 'package:flutter_loyalcraft_gql/graphql/corporate-authentication.graphql.dart';
import 'package:flutter_loyalcraft_gql/graphql/user.graphql.dart';
import 'package:flutter_loyalcraft_gql/schema.graphql.dart';
import 'package:loyalcraft/localizations_delegate/app_localizations.dart';
import 'package:loyalcraft/src/bloc/home_tab_index.dart';
import 'package:loyalcraft/src/bloc/locale.dart';
import 'package:loyalcraft/src/bloc/theme.dart';
import 'package:loyalcraft/src/bloc/user.dart';
import 'package:loyalcraft/src/bloc/variable.dart';
import 'package:loyalcraft/src/data/consts.dart';
import 'package:loyalcraft/src/data/flutter_messenger.dart';
import 'package:loyalcraft/src/data/graphql_client.dart';
import 'package:loyalcraft/src/data/shared_preferences.dart';
import 'package:loyalcraft/src/models/dial_code.dart';
import 'package:loyalcraft/src/repository/corporate_athentication.dart';
import 'package:loyalcraft/src/screens/reset_password_1.dart';
import 'package:loyalcraft/src/utils/image_cache_manager/shared_image_provider.dart';
import 'package:loyalcraft/src/utils/utility.dart';

// ignore: must_be_immutable
class SignInWidget extends StatefulWidget {
  SignInWidget({
    Key? key,
    this.emailAddress,
    this.phoneNumber,
    this.password,
  }) : super(key: key);

  String? emailAddress;
  String? phoneNumber;
  String? password;

  @override
  _SignInWidget createState() => _SignInWidget();
}

class _SignInWidget extends State<SignInWidget> {
  final TextEditingController _emailAddressController = TextEditingController();
  final TextEditingController _phoneNumberController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  late CorporateAuthenticationRepository _corporateAuthenticationRepository;
  final SGraphQLClient _sGraphQLClient = SGraphQLClient();
  late VariableCubit<String> _emailAddressCubit;
  late VariableCubit<String> _phoneNumberCubit;
  late VariableCubit<DialCode> _dialCodeCubit;
  late VariableCubit<String> _passwordCubit;
  late VariableCubit<bool> _isLoadingCubit;
  late VariableCubit _showPasswordCubit;
  late VariableCubit<int> _tabCubit;
  final List<String> _tabList = [
    'phoneNumber',
    'emailAddress',
  ];

  bool _formHasError({required String emailAddress, required String phoneNumber, required String password, required int tab}) {
    if (password.isEmpty) {
      return true;
    }
    if (tab == 0 && phoneNumber.isInteger() == false) {
      return true;
    }
    if (tab == 0 && phoneNumber.length != _dialCodeCubit.state!.numberLength) {
      return true;
    }
    if (tab == 1 && emailAddress.isValidEmailAddress() == false) {
      return true;
    }
    return false;
  }

  Future<void> _initState() async {
    _corporateAuthenticationRepository = CorporateAuthenticationRepository(_sGraphQLClient);
    _showPasswordCubit = VariableCubit(value: false);
    _phoneNumberCubit = VariableCubit(value: '');
    _emailAddressCubit = VariableCubit(value: '');
    _passwordCubit = VariableCubit(value: '');
    _tabCubit = VariableCubit(value: 0);
    _dialCodeCubit = VariableCubit(value: kDialCodeList.first);
    _isLoadingCubit = VariableCubit(value: false);

    if (widget.emailAddress.removeNull().isNotEmpty && widget.password.removeNull().isNotEmpty) {
      _emailAddressCubit.updateValue(widget.emailAddress.removeNull());
      _passwordCubit.updateValue(widget.password.removeNull());
      _passwordController.text = widget.password.removeNull();
      _emailAddressController.text = widget.emailAddress.removeNull();
    }
    if (widget.phoneNumber.removeNull().isNotEmpty && widget.password.removeNull().isNotEmpty) {
      _phoneNumberCubit.updateValue(widget.phoneNumber.removeNull());
      _passwordCubit.updateValue(widget.password.removeNull());
      _passwordController.text = widget.password.removeNull();
      _phoneNumberController.text = widget.phoneNumber.removeNull();
    }
  }

  @override
  void dispose() {
    _emailAddressController.dispose();
    _passwordController.dispose();
    _emailAddressCubit.close();
    _showPasswordCubit.close();
    _phoneNumberCubit.close();
    _tabCubit.close();
    _dialCodeCubit.close();
    _isLoadingCubit.close();
    _passwordCubit.close();
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
          BlocProvider(create: (context) => _passwordCubit),
          BlocProvider(create: (context) => _isLoadingCubit),
          BlocProvider(create: (context) => _phoneNumberCubit),
          BlocProvider(create: (context) => _dialCodeCubit),
          BlocProvider(create: (context) => _tabCubit),
        ],
        child: BlocBuilder<VariableCubit, dynamic>(
          bloc: _tabCubit,
          builder: (context, tab) => BlocBuilder<VariableCubit, dynamic>(
            bloc: _dialCodeCubit,
            builder: (context, dialCode) => BlocBuilder<VariableCubit, dynamic>(
              bloc: _isLoadingCubit,
              builder: (context, isLoading) => BlocBuilder<VariableCubit, dynamic>(
                bloc: _phoneNumberCubit,
                builder: (context, phoneNumber) => BlocBuilder<VariableCubit, dynamic>(
                  bloc: _showPasswordCubit,
                  builder: (context, showPassword) => BlocBuilder<VariableCubit, dynamic>(
                    bloc: _emailAddressCubit,
                    builder: (context, emailAddress) => BlocBuilder<VariableCubit, dynamic>(
                      bloc: _passwordCubit,
                      builder: (context, password) => Scaffold(
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
                                  translate(context, 'signIn'),
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
                                      text: translate(context, 'dontHaveAnAccount?'),
                                      style: Theme.of(context).textTheme.bodySmall,
                                    ),
                                    TextSpan(
                                      recognizer: TapGestureRecognizer()..onTap = () => Navigator.pushNamed(context, '/SignUp'),
                                      text: ' ${translate(context, 'signUp')}',
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
                              if (tab == 0)
                                Container(
                                  padding: const EdgeInsets.only(right: 16.0, left: 8.0),
                                  decoration: BoxDecoration(
                                    border: Border.all(color: Colors.grey[800]!, width: 0.4),
                                    borderRadius: BorderRadius.circular(8.0),
                                  ),
                                  child: Row(
                                    children: [
                                      Wrap(
                                        crossAxisAlignment: WrapCrossAlignment.center,
                                        runSpacing: 4.0,
                                        spacing: 4.0,
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
                                          Text(
                                            dialCode.dialCode,
                                            style: Theme.of(context).textTheme.bodyMedium,
                                          ),
                                        ],
                                      ),
                                      const SizedBox(width: 8.0),
                                      Expanded(
                                        child: TextField(
                                          onTapOutside: (value) => FocusManager.instance.primaryFocus?.unfocus,
                                          cursorColor: Theme.of(context).colorScheme.secondary,
                                          style: Theme.of(context).textTheme.bodyMedium,
                                          keyboardType: TextInputType.number,
                                          onChanged: _phoneNumberCubit.updateValue,
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
                                    onChanged: _emailAddressCubit.updateValue,
                                    keyboardType: TextInputType.emailAddress,
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
                              const SizedBox(height: 16.0),
                              Align(
                                alignment: Alignment.centerRight,
                                child: GestureDetector(
                                  onTap: () => Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                      builder: (context) => const ResetPassword1Widget(),
                                    ),
                                  ),
                                  child: Text(
                                    translate(context, 'forgotPassword'),
                                    style: Theme.of(context).textTheme.bodyMedium,
                                    textAlign: TextAlign.right,
                                  ),
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
                                  onPressed: _formHasError(
                                    emailAddress: emailAddress,
                                    phoneNumber: phoneNumber,
                                    password: password,
                                    tab: tab,
                                  )
                                      ? null
                                      : () async {
                                          _isLoadingCubit.updateValue(true);
                                          final loginForTarget = await _corporateAuthenticationRepository
                                              .loginForTarget(
                                            Variables$Query$loginForTarget(
                                              login: tab == 0 ? null : emailAddress,
                                              password: password,
                                              phone: tab == 1
                                                  ? null
                                                  : Input$IPhoneInput(
                                                      countryCode: dialCode.dialCode,
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
                                          if (loginForTarget?.user == null) {
                                            FlutterMessenger.showSnackbar(context: context, string: translate(context, 'generalErrorMessage'));
                                          } else {
                                            addHomeTabIndexToSP(0);
                                            addAccessTokenToSP(loginForTarget!.accessToken);
                                            BlocProvider.of<HomeTabIndexCubit>(context).updateValue(0);
                                            BlocProvider.of<UserCubit>(context).setUser(Query$user$user.fromJson(loginForTarget.user.toJson()));
                                            BlocProvider.of<ThemeCubit>(context)
                                                .setTheme(getThemeDataFromString(locale: getLocaleFromString(loginForTarget.user.locale ?? ''), theme: loginForTarget.user.mobileTheme?.name ?? ''));
                                            BlocProvider.of<LocaleCubit>(context).setLocale(getLocaleFromString(loginForTarget.user.locale ?? ''));
                                            Navigator.of(context).pushNamedAndRemoveUntil('/Tabs', (route) => false);
                                          }
                                        },
                                  child: Text(
                                    translate(context, 'signIn'),
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
      );
}
