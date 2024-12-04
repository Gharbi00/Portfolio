import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_loyalcraft_gql/graphql/user.graphql.dart';
import 'package:flutter_loyalcraft_gql/schema.graphql.dart';
import 'package:loyalcraft/localizations_delegate/app_localizations.dart';
import 'package:loyalcraft/src/bloc/locale.dart';
import 'package:loyalcraft/src/bloc/user.dart';
import 'package:loyalcraft/src/bloc/variable.dart';
import 'package:loyalcraft/src/data/consts.dart';
import 'package:loyalcraft/src/data/flutter_messenger.dart';
import 'package:loyalcraft/src/data/graphql_client.dart';
import 'package:loyalcraft/src/data/shared_preferences.dart';
import 'package:loyalcraft/src/repository/user.dart';
import 'package:loyalcraft/src/utils/utility.dart';
import 'package:loyalcraft/src/widgets/custom_circular_progress_indicator.dart';

// ignore: must_be_immutable
class EditLocaleWidget extends StatefulWidget {
  const EditLocaleWidget({
    Key? key,
  }) : super(key: key);

  @override
  _EditLocaleWidget createState() => _EditLocaleWidget();
}

class _EditLocaleWidget extends State<EditLocaleWidget> {
  final SGraphQLClient _sGraphQLClient = SGraphQLClient();
  late UserRepository _userRepository;
  late VariableCubit<bool> _isLoadingCubit;
  late VariableCubit _localeCubit;

  bool _formHasError({required theme}) => theme == null || theme == Enum$MobileThemesEnum.$unknown;

  Future<void> _initState() async {
    _userRepository = UserRepository(_sGraphQLClient);

    _isLoadingCubit = VariableCubit(value: false);
    _localeCubit = VariableCubit();
    final user = await getUserFromSP();

    _localeCubit.updateValue(getLocaleFromString(user!.locale ?? ''));
  }

  @override
  void dispose() {
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
        BlocProvider(create: (context) => _isLoadingCubit),
        BlocProvider(create: (context) => _localeCubit),
      ],
      child: BlocBuilder<VariableCubit, dynamic>(
        bloc: _isLoadingCubit,
        builder: (context, isLoading) => BlocBuilder<VariableCubit, dynamic>(
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
                      translate(context, 'editApplicationLanguage'),
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
                          Wrap(
                            runSpacing: 8.0,
                            spacing: 8.0,
                            children: List.generate(
                              kLocaleList.length,
                              (index) => GestureDetector(
                                onTap: () => _localeCubit.updateValue(kLocaleList[index]),
                                child: Container(
                                  padding: const EdgeInsets.symmetric(vertical: 8.0, horizontal: 16.0),
                                  decoration: BoxDecoration(
                                    color: locale == kLocaleList[index] ? kAppColor : Theme.of(context).focusColor,
                                    borderRadius: BorderRadius.circular(8.0),
                                  ),
                                  child: Text(
                                    AppLocalizations.of(context)!.translate('${kLocaleList[index].languageCode}_${kLocaleList[index].countryCode}'),
                                    textAlign: TextAlign.center,
                                    style: Theme.of(context).textTheme.bodyMedium!.copyWith(
                                          color: locale == kLocaleList[index] ? Colors.white : Theme.of(context).colorScheme.secondary,
                                        ),
                                  ),
                                ),
                              ),
                            ),
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
                              onPressed: _formHasError(theme: locale)
                                  ? null
                                  : () async {
                                      _isLoadingCubit.updateValue(true);
                                      final updateUser = await _userRepository
                                          .updateUser(
                                        Variables$Mutation$updateUser(
                                          id: _user!.id,
                                          input: Input$UserUpdateInput(
                                            locale: '${locale.languageCode}_${locale.countryCode}',
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
                                        BlocProvider.of<UserCubit>(context).setUser(Query$user$user.fromJson(updateUser.toJson()));
                                        BlocProvider.of<LocaleCubit>(context).setLocale(locale);
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
    );
  }
}
