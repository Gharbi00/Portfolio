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
import 'package:loyalcraft/src/modal_bottom_sheet/pick_image.dart';
import 'package:loyalcraft/src/repository/shared.dart';
import 'package:loyalcraft/src/repository/user.dart';
import 'package:loyalcraft/src/utils/image_cache_manager/shared_image_provider.dart';
import 'package:loyalcraft/src/utils/utility.dart';
import 'package:loyalcraft/src/widgets/custom_circular_progress_indicator.dart';

// ignore: must_be_immutable
class EditUserWidget extends StatefulWidget {
  const EditUserWidget({
    Key? key,
  }) : super(key: key);

  @override
  _EditUserWidget createState() => _EditUserWidget();
}

class _EditUserWidget extends State<EditUserWidget> {
  final TextEditingController _firstNameController = TextEditingController();
  final TextEditingController _lastNameController = TextEditingController();
  final SGraphQLClient _sGraphQLClient = SGraphQLClient();
  late VariableCubit<bool> _isLoadingCubit;
  late SharedRepository _sharedRepository;
  late UserRepository _userRepository;
  late VariableCubit<String> _firstNameCubit;
  late VariableCubit<String> _lastNameCubit;
  late VariableCubit<Enum$Gender?> _genderCubit;
  late VariableCubit<Locale?> _localeCubit;
  late VariableCubit<Enum$MobileThemesEnum?> _themeCubit;

  bool _formHasError({required String firstName, required String lastName}) => firstName.trim().isEmpty || lastName.trim().isEmpty;

  Future<void> _initState() async {
    _userRepository = UserRepository(_sGraphQLClient);
    _firstNameCubit = VariableCubit(value: '');
    _lastNameCubit = VariableCubit(value: '');
    _isLoadingCubit = VariableCubit(value: false);
    _genderCubit = VariableCubit();
    _themeCubit = VariableCubit();
    _sharedRepository = SharedRepository(_sGraphQLClient);
    _localeCubit = VariableCubit();
    final user = await getUserFromSP();
    _firstNameController.text = user!.firstName ?? '';
    _lastNameController.text = user.lastName ?? '';
    _firstNameCubit.updateValue(user.firstName ?? '');
    _lastNameCubit.updateValue(user.lastName ?? '');
    _genderCubit.updateValue(user.gender);
    _themeCubit.updateValue(user.mobileTheme);
    _localeCubit.updateValue(getLocaleFromString(user.locale ?? ''));
  }

  @override
  void dispose() {
    _firstNameController.dispose();
    _themeCubit.close();
    _genderCubit.close();
    _localeCubit.close();
    _lastNameCubit.close();
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
  Widget build(BuildContext context) {
    final _isRtl = Directionality.of(context) == TextDirection.rtl;
    final _user = context.watch<UserCubit>().state;
    return MultiBlocProvider(
      providers: [
        BlocProvider(create: (context) => _isLoadingCubit),
        BlocProvider(create: (context) => _firstNameCubit),
        BlocProvider(create: (context) => _lastNameCubit),
        BlocProvider(create: (context) => _genderCubit),
        BlocProvider(create: (context) => _themeCubit),
        BlocProvider(create: (context) => _localeCubit),
      ],
      child: BlocBuilder<VariableCubit, dynamic>(
        bloc: _firstNameCubit,
        builder: (context, firstName) => BlocBuilder<VariableCubit, dynamic>(
          bloc: _lastNameCubit,
          builder: (context, lastName) => BlocBuilder<VariableCubit, dynamic>(
            bloc: _isLoadingCubit,
            builder: (context, isLoading) => BlocBuilder<VariableCubit, dynamic>(
              bloc: _genderCubit,
              builder: (context, gender) => BlocBuilder<VariableCubit, dynamic>(
                bloc: _themeCubit,
                builder: (context, theme) => BlocBuilder<VariableCubit, dynamic>(
                  bloc: _localeCubit,
                  builder: (context, locale) => Scaffold(
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
                              translate(context, 'editProfile'),
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
                                  Center(
                                    child: GestureDetector(
                                      onTap: isLoading
                                          ? null
                                          : () => showPickImageSheet(
                                                deleteRefreshTheView: ((_user!.picture?.baseUrl ?? '').isEmpty || (_user.picture?.path ?? '').isEmpty)
                                                    ? null
                                                    : (value) async {
                                                        _isLoadingCubit.updateValue(true);
                                                        final uploadFileToAws = await _sharedRepository.deleteFileFromAws(_user.picture!.path.removeNull());
                                                        if (uploadFileToAws.success == false) {
                                                          FlutterMessenger.showSnackbar(context: context, string: translate(context, 'generalErrorMessage'));
                                                        } else {
                                                          final updateUser = await _userRepository.updateUser(
                                                            Variables$Mutation$updateUser(
                                                              id: _user.id,
                                                              input: Input$UserUpdateInput(
                                                                picture: Input$PictureInput(
                                                                  baseUrl: '',
                                                                  path: '',
                                                                ),
                                                              ),
                                                            ),
                                                          );
                                                          if (updateUser == null) {
                                                            FlutterMessenger.showSnackbar(context: context, string: translate(context, 'generalErrorMessage'));
                                                          } else {
                                                            FlutterMessenger.showSnackbar(context: context, string: translate(context, 'deleteProfilePictureToastMessage'));
                                                            BlocProvider.of<UserCubit>(context).setUser(Query$user$user.fromJson(updateUser.toJson()));
                                                          }
                                                        }
                                                        _isLoadingCubit.updateValue(false);
                                                      },
                                                refreshTheView: (value) async {
                                                  _isLoadingCubit.updateValue(true);
                                                  final fileType = value.path.split('.').last;
                                                  final fileName = '${_user.id}-${DateTime.now().millisecondsSinceEpoch}.$fileType';

                                                  var generateS3SignedUrl = await _sharedRepository.generateS3SignedUrl(
                                                    fileName,
                                                    'jpg',
                                                  );
                                                  var uploadS3AwsWithSignature = await _sharedRepository.uploadS3AwsWithSignature(
                                                    signedUrl: generateS3SignedUrl.message,
                                                    fileName: fileName,
                                                    file: value,
                                                  );
                                                  if (generateS3SignedUrl.success == false || uploadS3AwsWithSignature == null) {
                                                    FlutterMessenger.showSnackbar(context: context, string: translate(context, 'generalErrorMessage'));
                                                  } else {
                                                    final updateUser = await _userRepository.updateUser(
                                                      Variables$Mutation$updateUser(
                                                        id: _user.id,
                                                        input: Input$UserUpdateInput(
                                                          picture: Input$PictureInput(
                                                            baseUrl: kS3BaseUrl,
                                                            path: fileName,
                                                          ),
                                                        ),
                                                      ),
                                                    );
                                                    if (updateUser == null) {
                                                      FlutterMessenger.showSnackbar(context: context, string: translate(context, 'generalErrorMessage'));
                                                    } else {
                                                      BlocProvider.of<UserCubit>(context).setUser(Query$user$user.fromJson(updateUser.toJson()));
                                                      FlutterMessenger.showSnackbar(context: context, string: translate(context, 'updateProfilePictureToastMessage'));
                                                    }
                                                  }
                                                  _isLoadingCubit.updateValue(false);
                                                },
                                                context: context,
                                              ),
                                      child: Stack(
                                        clipBehavior: Clip.none,
                                        alignment: Alignment.bottomRight,
                                        children: [
                                          ((_user!.picture?.baseUrl ?? '').isEmpty || (_user.picture?.path ?? '').isEmpty)
                                              ? Hero(
                                                  tag: kUserAvatar,
                                                  child: SharedImageProviderWidget(
                                                    color: Theme.of(context).colorScheme.secondary,
                                                    imageUrl: kUserAvatar,
                                                    fit: BoxFit.cover,
                                                    height: 120.0,
                                                    width: 120.0,
                                                  ),
                                                )
                                              : Hero(
                                                  tag: '${_user.picture!.baseUrl!}/${_user.picture!.path!}',
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
                                          Positioned(
                                            bottom: 8.0,
                                            right: 8.0,
                                            child: Opacity(
                                              opacity: isLoading ? 0.5 : 1.0,
                                              child: Container(
                                                height: 20.0,
                                                width: 20.0,
                                                decoration: BoxDecoration(
                                                  color: Theme.of(context).focusColor.withOpacity(1.0),
                                                  borderRadius: BorderRadius.circular(100.0),
                                                ),
                                                child: Icon(
                                                  CupertinoIcons.add,
                                                  color: Theme.of(context).colorScheme.secondary,
                                                  size: 10.0,
                                                ),
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                  const SizedBox(height: 16.0),
                                  Text(
                                    translate(context, 'firstName'),
                                    style: Theme.of(context).textTheme.bodyLarge,
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
                                  Text(
                                    translate(context, 'lastName'),
                                    style: Theme.of(context).textTheme.bodyLarge,
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
                                  Text(
                                    translate(context, 'gender'),
                                    style: Theme.of(context).textTheme.bodyLarge,
                                  ),
                                  const SizedBox(height: 16.0),
                                  Row(
                                    children: [
                                      Expanded(
                                        child: GestureDetector(
                                          onTap: () => _genderCubit.updateValue(Enum$Gender.MALE),
                                          child: Container(
                                            padding: const EdgeInsets.all(8.0),
                                            decoration: BoxDecoration(
                                              color: gender == Enum$Gender.MALE ? kAppColor : Theme.of(context).focusColor,
                                              borderRadius: _isRtl
                                                  ? const BorderRadius.only(
                                                      topRight: Radius.circular(8.0),
                                                      bottomRight: Radius.circular(8.0),
                                                    )
                                                  : const BorderRadius.only(
                                                      topLeft: Radius.circular(8.0),
                                                      bottomLeft: Radius.circular(8.0),
                                                    ),
                                            ),
                                            child: Text(
                                              translate(context, 'male'),
                                              textAlign: TextAlign.center,
                                              style: Theme.of(context).textTheme.bodyMedium!.copyWith(
                                                    color: gender == Enum$Gender.MALE ? Colors.white : Theme.of(context).colorScheme.secondary,
                                                  ),
                                            ),
                                          ),
                                        ),
                                      ),
                                      const SizedBox(width: 8.0),
                                      Expanded(
                                        child: GestureDetector(
                                          onTap: () => _genderCubit.updateValue(Enum$Gender.FEMALE),
                                          child: Container(
                                            padding: const EdgeInsets.all(8.0),
                                            decoration: BoxDecoration(
                                              color: gender == Enum$Gender.FEMALE ? kAppColor : Theme.of(context).focusColor,
                                              borderRadius: _isRtl
                                                  ? const BorderRadius.only(
                                                      topLeft: Radius.circular(8.0),
                                                      bottomLeft: Radius.circular(8.0),
                                                    )
                                                  : const BorderRadius.only(
                                                      topRight: Radius.circular(8.0),
                                                      bottomRight: Radius.circular(8.0),
                                                    ),
                                            ),
                                            child: Text(
                                              translate(context, 'female'),
                                              textAlign: TextAlign.center,
                                              style: Theme.of(context).textTheme.bodyMedium!.copyWith(
                                                    color: gender == Enum$Gender.FEMALE ? Colors.white : Theme.of(context).colorScheme.secondary,
                                                  ),
                                            ),
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
                                      onPressed: _formHasError(firstName: firstName, lastName: lastName)
                                          ? null
                                          : () async {
                                              _isLoadingCubit.updateValue(true);
                                              final updateUser = await _userRepository
                                                  .updateUser(
                                                Variables$Mutation$updateUser(
                                                  id: _user.id,
                                                  input: Input$UserUpdateInput(
                                                    firstName: firstName,
                                                    mobileTheme: theme,
                                                    lastName: lastName,
                                                    gender: gender,
                                                  ),
                                                ),
                                              )
                                                  .catchError((onError) {
                                                _isLoadingCubit.updateValue(false);
                                                return null;
                                              });
                                              _isLoadingCubit.updateValue(false);
                                              if (updateUser == null) {
                                                FlutterMessenger.showSnackbar(context: context, string: translate(context, 'generalErrorMessage'));
                                              } else {
                                                FlutterMessenger.showSnackbar(context: context, string: translate(context, 'updateProfileToastMessage'));
                                                BlocProvider.of<UserCubit>(context).setUser(Query$user$user.fromJson(updateUser.toJson()));
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
        ),
      ),
    );
  }
}
