import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_diktup_utilities/extensions.dart';
import 'package:flutter_diktup_utilities/flutter_diktup_utilities.dart';
import 'package:flutter_loyalcraft_gql/graphql/corporate-authentication.graphql.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-card-user-card.graphql.dart';
import 'package:flutter_loyalcraft_gql/graphql/point-of-sale.graphql.dart';
import 'package:flutter_loyalcraft_gql/schema.graphql.dart';
import 'package:loyalcraft/localizations_delegate/app_localizations.dart';
import 'package:loyalcraft/src/bloc/home_tab_index.dart';
import 'package:loyalcraft/src/bloc/variable.dart';
import 'package:loyalcraft/src/data/consts.dart';
import 'package:loyalcraft/src/data/flutter_messenger.dart';
import 'package:loyalcraft/src/data/graphql_client.dart';
import 'package:loyalcraft/src/data/shared_preferences.dart';
import 'package:loyalcraft/src/modal_bottom_sheet/confirm_otp.dart';
import 'package:loyalcraft/src/models/dial_code.dart';
import 'package:loyalcraft/src/repository/corporate_athentication.dart';
import 'package:loyalcraft/src/repository/user_card.dart';
import 'package:loyalcraft/src/screens/point_of_sale_landing.dart';
import 'package:loyalcraft/src/screens/points_of_sale.dart';
import 'package:loyalcraft/src/screens/successful.dart';
import 'package:loyalcraft/src/utils/image_cache_manager/shared_image_provider.dart';
import 'package:loyalcraft/src/widgets/custom_circular_progress_indicator.dart';

// ignore: must_be_immutable
class RequestLinkAccountWidget extends StatefulWidget {
  RequestLinkAccountWidget({
    Key? key,
    required this.pos,
  }) : super(key: key);
  Query$pointOfSale$pointOfSale pos;

  @override
  _RequestLinkAccountWidget createState() => _RequestLinkAccountWidget();
}

class _RequestLinkAccountWidget extends State<RequestLinkAccountWidget> {
  final TextEditingController _emailAddressController = TextEditingController();
  final TextEditingController _phoneNumberController = TextEditingController();
  late CorporateAuthenticationRepository _corporateAuthenticationRepository;
  final List<String> _tabList = ['phoneNumber', 'emailAddress'];
  final SGraphQLClient _sGraphQLClient = SGraphQLClient();
  late UserCardRepository _userCardRepository;
  late VariableCubit<DialCode> _dialCodeCubit;
  late VariableCubit<bool> _isLoadingCubit;
  late VariableCubit _emailAddressCubit;
  late VariableCubit _isLoginExistCubit;
  late VariableCubit _phoneNumberCubit;
  late VariableCubit _tabCubit;

  bool _formHasError({required String emailAddress, required String phoneNumber, required int tab, required bool isLoginExist}) {
    if (isLoginExist != false) {
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
    _isLoadingCubit = VariableCubit(value: false);
    _emailAddressCubit = VariableCubit(value: '');
    _userCardRepository = UserCardRepository(_sGraphQLClient);
    _phoneNumberCubit = VariableCubit(value: '');
    _tabCubit = VariableCubit(value: 0);
    _isLoginExistCubit = VariableCubit();
    _dialCodeCubit = VariableCubit(value: kDialCodeList.first);
    final user = await getUserFromSP();
    _emailAddressController.text = user?.email ?? '';
    _emailAddressCubit.updateValue(user?.email ?? '');
    _phoneNumberController.text = user?.phone?.number ?? '';
    _phoneNumberCubit.updateValue(user?.phone?.number ?? '');
    if (user?.phone?.number != null) {
      final result = await _corporateAuthenticationRepository.isLoginForTargetExist(
        Variables$Query$isLoginForTargetExist(
          input: Input$IsLoginForTargetExistInput(
            phone: Input$IPhoneInput(
              countryCode: _dialCodeCubit.state!.dialCode,
              number: user!.phone!.number,
            ),
            target: Input$TargetACIInput(
              pos: widget.pos.id,
            ),
          ),
        ),
      );
      _isLoginExistCubit.updateValue(result);
    }
  }

  @override
  void dispose() {
    _emailAddressController.dispose();
    _phoneNumberController.dispose();
    _tabCubit.close();
    _isLoadingCubit.close();
    _dialCodeCubit.close();
    _phoneNumberCubit.close();
    _isLoginExistCubit.close();
    _emailAddressCubit.close();
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
          BlocProvider(create: (context) => _phoneNumberCubit),
          BlocProvider(create: (context) => _isLoadingCubit),
          BlocProvider(create: (context) => _dialCodeCubit),
          BlocProvider(create: (context) => _isLoginExistCubit),
          BlocProvider(create: (context) => _tabCubit),
        ],
        child: BlocBuilder<VariableCubit, dynamic>(
          bloc: _dialCodeCubit,
          builder: (context, dialCode) => BlocBuilder<VariableCubit, dynamic>(
            bloc: _emailAddressCubit,
            builder: (context, emailAddress) => BlocBuilder<VariableCubit, dynamic>(
              bloc: _isLoginExistCubit,
              builder: (context, isLoginExist) => BlocBuilder<VariableCubit, dynamic>(
                bloc: _isLoadingCubit,
                builder: (context, isLoading) => BlocBuilder<VariableCubit, dynamic>(
                  bloc: _phoneNumberCubit,
                  builder: (context, phoneNumber) => BlocBuilder<VariableCubit, dynamic>(
                    bloc: _tabCubit,
                    builder: (context, tab) => Scaffold(
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
                                translate(context, 'connectToThisPartner'),
                                style: Theme.of(context).textTheme.headlineSmall,
                              ),
                            ),
                          ],
                        ),
                      ),
                      body: GestureDetector(
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
                                      Center(
                                        child: (widget.pos.picture?.baseUrl ?? '').isEmpty || (widget.pos.picture?.path ?? '').isEmpty
                                            ? Container(
                                                height: 80.0,
                                                width: 80.0,
                                                padding: const EdgeInsets.all(4.0),
                                                decoration: BoxDecoration(
                                                  color: Theme.of(context).focusColor,
                                                  borderRadius: BorderRadius.circular(100.0),
                                                ),
                                                child: SharedImageProviderWidget(
                                                  imageUrl: kEmptyPicture,
                                                  color: Theme.of(context).colorScheme.secondary,
                                                  width: 40.0,
                                                  height: 40.0,
                                                  fit: BoxFit.cover,
                                                ),
                                              )
                                            : SharedImageProviderWidget(
                                                imageUrl: '${widget.pos.picture!.baseUrl}/${widget.pos.picture!.path}',
                                                backgroundColor: Theme.of(context).focusColor,
                                                borderRadius: BorderRadius.circular(100.0),
                                                fit: BoxFit.cover,
                                                width: 80.0,
                                                height: 80.0,
                                              ),
                                      ),
                                      const SizedBox(height: 16.0),
                                      Text(
                                        widget.pos.title.removeNull(),
                                        style: Theme.of(context).textTheme.displayMedium,
                                        textAlign: TextAlign.center,
                                      ),
                                      const SizedBox(height: 16.0),
                                      Text(
                                        translate(context, 'requestLinkAccount1Text1'),
                                        style: Theme.of(context).textTheme.bodySmall,
                                        textAlign: TextAlign.center,
                                      ),
                                      const SizedBox(height: 16.0),
                                      Row(
                                        children: List.generate(
                                          _tabList.length,
                                          (index) => Expanded(
                                            child: GestureDetector(
                                              onTap: () async {
                                                _tabCubit.updateValue(index);
                                                if (index == 0) {
                                                  if (phoneNumber.toString().isNotEmpty) {
                                                    final result = await _corporateAuthenticationRepository.isLoginForTargetExist(
                                                      Variables$Query$isLoginForTargetExist(
                                                        input: Input$IsLoginForTargetExistInput(
                                                          phone: Input$IPhoneInput(
                                                            countryCode: _dialCodeCubit.state!.dialCode,
                                                            number: phoneNumber.toString(),
                                                          ),
                                                          target: Input$TargetACIInput(
                                                            pos: widget.pos.id,
                                                          ),
                                                        ),
                                                      ),
                                                    );
                                                    _isLoginExistCubit.updateValue(result);
                                                  }
                                                } else {
                                                  if (emailAddress.toString().isNotEmpty) {
                                                    final result = await _corporateAuthenticationRepository.isLoginForTargetExist(
                                                      Variables$Query$isLoginForTargetExist(
                                                        input: Input$IsLoginForTargetExistInput(
                                                          login: emailAddress.toString(),
                                                          target: Input$TargetACIInput(
                                                            pos: widget.pos.id,
                                                          ),
                                                        ),
                                                      ),
                                                    );
                                                    _isLoginExistCubit.updateValue(result);
                                                  }
                                                }
                                              },
                                              child: Container(
                                                margin: EdgeInsets.only(left: index == 0 ? 0.0 : 8.0),
                                                padding: const EdgeInsets.all(8.0),
                                                decoration: BoxDecoration(
                                                  color: index == tab ? kAppColor : Theme.of(context).focusColor,
                                                  borderRadius: BorderRadius.circular(8.0),
                                                ),
                                                child: Text(
                                                  translate(context, _tabList[index]),
                                                  textAlign: TextAlign.center,
                                                  style: Theme.of(context).textTheme.bodyMedium!.copyWith(
                                                        color: index == tab ? Colors.white : Theme.of(context).colorScheme.secondary,
                                                      ),
                                                ),
                                              ),
                                            ),
                                          ),
                                        ),
                                      ),
                                      const SizedBox(height: 16.0),
                                      tab == 0 ? _phoneNumberWidget(phoneNumber) : _emailAddressWidget(emailAddress),
                                      // if (isLoginExist == false)
                                      //   RequestLinkAccountBannerWidget(
                                      //     pos: widget.pos,
                                      //   ),
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
                                          onPressed: _formHasError(
                                            isLoginExist: isLoginExist ?? true,
                                            emailAddress: emailAddress,
                                            phoneNumber: phoneNumber,
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
                                                          pos: widget.pos.id,
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
                                                          _isLoadingCubit.updateValue(true);
                                                          final linkUserAccount = await _userCardRepository.linkUserAccount(
                                                            Variables$Mutation$linkUserAccount(
                                                              reference: '${DateTime.now().toLocal().microsecondsSinceEpoch}',
                                                              target: Input$TargetACIInput(
                                                                pos: widget.pos.id,
                                                              ),
                                                            ),
                                                          );
                                                          _isLoadingCubit.updateValue(false);
                                                          if (linkUserAccount == null) {
                                                            FlutterMessenger.showSnackbar(context: context, string: translate(context, 'generalErrorMessage'));
                                                          } else {
                                                            addHomeTabIndexToSP(4);
                                                            BlocProvider.of<HomeTabIndexCubit>(context).updateValue(4);
                                                            Navigator.of(context).pushNamedAndRemoveUntil('/Tabs', (route) => false);
                                                            Navigator.push(
                                                              context,
                                                              MaterialPageRoute(
                                                                builder: (context) => const PointsOfSaleWidget(),
                                                              ),
                                                            );
                                                            Navigator.push(
                                                              context,
                                                              MaterialPageRoute(
                                                                builder: (context) => PointOfSaleLandingWidget(
                                                                  pos: widget.pos,
                                                                ),
                                                              ),
                                                            );
                                                            showGeneralDialog(
                                                              transitionDuration: const Duration(milliseconds: 1),
                                                              barrierColor: Colors.transparent,
                                                              barrierLabel: '',
                                                              context: context,
                                                              pageBuilder: (context, anim1, anim2) => SuccessfulDialog(
                                                                description: translate(context, 'linkAccountDialogSuccessfulDescription'),
                                                                subTitle: translate(context, 'linkAccountDialogSuccessfulSubtitle'),
                                                                title: translate(context, 'linkAccountDialogSuccessfulTitle'),
                                                                onCancel: (value) => Navigator.of(context).pop(),
                                                                onPressed: (value) => Navigator.of(context).pop(),
                                                              ),
                                                            );
                                                          }
                                                        },
                                                      );
                                                    }
                                                  }
                                                },
                                          child: Text(
                                            translate(context, 'sendCode'),
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

  Widget _emailAddressWidget(String emailAddress) => Column(
        crossAxisAlignment: CrossAxisAlignment.start,
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
                          pos: widget.pos.id,
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
          const SizedBox(height: 16.0),
          Row(
            children: [
              Icon(
                color: emailAddress.isValidEmailAddress() ? Theme.of(context).colorScheme.secondary : Theme.of(context).colorScheme.secondary.withOpacity(0.6),
                emailAddress.isValidEmailAddress() ? CupertinoIcons.check_mark : CupertinoIcons.clear,
                size: 14.0,
              ),
              const SizedBox(width: 4.0),
              Expanded(
                child: Text(
                  translate(context, 'validEmailAddress'),
                  style: Theme.of(context).textTheme.bodyMedium!.copyWith(
                        color: emailAddress.isValidEmailAddress() ? Theme.of(context).colorScheme.secondary : Theme.of(context).colorScheme.secondary.withOpacity(0.6),
                      ),
                ),
              ),
            ],
          ),
          if (emailAddress.isValidEmailAddress() && _isLoginExistCubit.state != null)
            Padding(
              padding: const EdgeInsets.only(top: 16.0),
              child: Row(
                children: [
                  Icon(
                    color: _isLoginExistCubit.state == false ? Theme.of(context).colorScheme.secondary : Theme.of(context).colorScheme.secondary.withOpacity(0.6),
                    _isLoginExistCubit.state == false ? CupertinoIcons.check_mark : CupertinoIcons.clear,
                    size: 14.0,
                  ),
                  const SizedBox(width: 4.0),
                  Expanded(
                    child: Text(
                      translate(context, _isLoginExistCubit.state == false ? 'emailAddressAvailable' : 'emailAddressNotAvailable'),
                      style: Theme.of(context).textTheme.bodyMedium!.copyWith(
                            color: _isLoginExistCubit.state == false ? Theme.of(context).colorScheme.secondary : Theme.of(context).colorScheme.secondary.withOpacity(0.6),
                          ),
                    ),
                  ),
                ],
              ),
            ),
        ],
      );

  Widget _phoneNumberWidget(String phoneNumber) => Column(
        crossAxisAlignment: CrossAxisAlignment.start,
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
                      _dialCodeCubit.state!.flag,
                      style: Theme.of(context).textTheme.displayMedium!.copyWith(fontSize: 20.0),
                    ),
                  ),
                ),
                const SizedBox(width: 4),
                Text(
                  _dialCodeCubit.state!.dialCode,
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
                const SizedBox(width: 8.0),
                Expanded(
                  child: TextField(
                    onTapOutside: (value) => FocusManager.instance.primaryFocus?.unfocus,
                    cursorColor: Theme.of(context).colorScheme.secondary,
                    inputFormatters: [LengthLimitingTextInputFormatter(8)],
                    style: Theme.of(context).textTheme.bodyMedium,
                    onChanged: (value) async {
                      _phoneNumberCubit.updateValue(value);
                      _isLoginExistCubit.updateValue(null);
                      if (value.isInteger() && value.length == 8) {
                        final result = await _corporateAuthenticationRepository.isLoginForTargetExist(
                          Variables$Query$isLoginForTargetExist(
                            input: Input$IsLoginForTargetExistInput(
                              phone: Input$IPhoneInput(
                                countryCode: _dialCodeCubit.state!.dialCode,
                                number: value,
                              ),
                              target: Input$TargetACIInput(
                                pos: widget.pos.id,
                              ),
                            ),
                          ),
                        );
                        _isLoginExistCubit.updateValue(result);
                      }
                    },
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
                color: phoneNumber.isInteger() && phoneNumber.length == 8 ? Theme.of(context).colorScheme.secondary : Theme.of(context).colorScheme.secondary.withOpacity(0.6),
                phoneNumber.isInteger() && phoneNumber.length == 8 ? CupertinoIcons.check_mark : CupertinoIcons.clear,
                size: 14.0,
              ),
              const SizedBox(width: 4.0),
              Expanded(
                child: Text(
                  translate(context, 'validPhoneNumber'),
                  style: Theme.of(context).textTheme.bodyMedium!.copyWith(
                        color: phoneNumber.isInteger() && phoneNumber.length == 8 ? Theme.of(context).colorScheme.secondary : Theme.of(context).colorScheme.secondary.withOpacity(0.6),
                      ),
                ),
              ),
            ],
          ),
          if (phoneNumber.length == 8 || phoneNumber.isInteger() && _isLoginExistCubit.state != null)
            Padding(
              padding: const EdgeInsets.only(top: 16.0),
              child: Row(
                children: [
                  Icon(
                    color: _isLoginExistCubit.state == false ? Theme.of(context).colorScheme.secondary : Theme.of(context).colorScheme.secondary.withOpacity(0.6),
                    _isLoginExistCubit.state == false ? CupertinoIcons.check_mark : CupertinoIcons.clear,
                    size: 14.0,
                  ),
                  const SizedBox(width: 4.0),
                  Expanded(
                    child: Text(
                      translate(context, _isLoginExistCubit.state == false ? 'phoneNumberAvailable' : 'phoneNumberNotAvailable'),
                      style: Theme.of(context).textTheme.bodyMedium!.copyWith(
                            color: _isLoginExistCubit.state == false ? Theme.of(context).colorScheme.secondary : Theme.of(context).colorScheme.secondary.withOpacity(0.6),
                          ),
                    ),
                  ),
                ],
              ),
            ),
        ],
      );
}
