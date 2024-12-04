import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
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
import 'package:loyalcraft/src/repository/user.dart';
import 'package:loyalcraft/src/utils/utility.dart';
import 'package:loyalcraft/src/widgets/custom_circular_progress_indicator.dart';

// ignore: must_be_immutable
class EditThemeWidget extends StatefulWidget {
  const EditThemeWidget({
    Key? key,
  }) : super(key: key);

  @override
  _EditThemeWidget createState() => _EditThemeWidget();
}

class _EditThemeWidget extends State<EditThemeWidget> {
  final SGraphQLClient _sGraphQLClient = SGraphQLClient();
  late UserRepository _userRepository;
  late VariableCubit<bool> _isLoadingCubit;
  late VariableCubit _themeCubit;

  bool _formHasError({required theme}) => theme == null || theme == Enum$MobileThemesEnum.$unknown;

  Future<void> _initState() async {
    _userRepository = UserRepository(_sGraphQLClient);

    _isLoadingCubit = VariableCubit(value: false);
    _themeCubit = VariableCubit();
    final user = await getUserFromSP();

    _themeCubit.updateValue(user!.mobileTheme);
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
    final _locale = context.watch<LocaleCubit>().state;

    return MultiBlocProvider(
      providers: [
        BlocProvider(create: (context) => _isLoadingCubit),
        BlocProvider(create: (context) => _themeCubit),
      ],
      child: BlocBuilder<VariableCubit, dynamic>(
        bloc: _isLoadingCubit,
        builder: (context, isLoading) => BlocBuilder<VariableCubit, dynamic>(
          bloc: _themeCubit,
          builder: (context, theme) => Scaffold(
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
                      translate(context, 'editApplicationTheme'),
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
                          Row(
                            children: List.generate(
                              Enum$MobileThemesEnum.values.length,
                              (index) => Enum$MobileThemesEnum.values[index] == Enum$MobileThemesEnum.$unknown
                                  ? const SizedBox()
                                  : Expanded(
                                      child: GestureDetector(
                                        onTap: () => _themeCubit.updateValue(Enum$MobileThemesEnum.values[index]),
                                        child: Container(
                                          margin: EdgeInsets.only(left: index == 0 ? 0.0 : 8.0),
                                          padding: const EdgeInsets.all(8.0),
                                          decoration: BoxDecoration(
                                            color: theme == Enum$MobileThemesEnum.values[index] ? kAppColor : Theme.of(context).focusColor,
                                            borderRadius: BorderRadius.circular(8.0),
                                          ),
                                          child: Text(
                                            AppLocalizations.of(context)!.translate(Enum$MobileThemesEnum.values[index].name),
                                            textAlign: TextAlign.center,
                                            style: Theme.of(context).textTheme.bodyMedium!.copyWith(
                                                  color: theme == Enum$MobileThemesEnum.values[index] ? Colors.white : Theme.of(context).colorScheme.secondary,
                                                ),
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
                              onPressed: _formHasError(theme: theme)
                                  ? null
                                  : () async {
                                      _isLoadingCubit.updateValue(true);
                                      final updateUser = await _userRepository
                                          .updateUser(
                                        Variables$Mutation$updateUser(
                                          id: _user!.id,
                                          input: Input$UserUpdateInput(
                                            mobileTheme: theme,
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
                                        BlocProvider.of<ThemeCubit>(context)
                                            .setTheme(getThemeDataFromString(locale: _locale, theme: (updateUser.mobileTheme?.name ?? Enum$MobileThemesEnum.SYSTEM.name).toLowerCase()));
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
