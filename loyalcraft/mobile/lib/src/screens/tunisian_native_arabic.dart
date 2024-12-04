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
import 'package:loyalcraft/src/repository/user.dart';
import 'package:loyalcraft/src/widgets/custom_circular_progress_indicator.dart';

// ignore: must_be_immutable
class TunisianNativeArabicDialog extends StatefulWidget {
  const TunisianNativeArabicDialog({
    Key? key,
  }) : super(key: key);
  @override
  _TunisianNativeArabicDialog createState() => _TunisianNativeArabicDialog();
}

class _TunisianNativeArabicDialog extends State<TunisianNativeArabicDialog> {
  final SGraphQLClient _sGraphQLClient = SGraphQLClient();
  late VariableCubit<bool> _isLoadingCubit;
  late UserRepository _userRepository;

  Future<void> _initState() async {
    _isLoadingCubit = VariableCubit(value: false);
    _userRepository = UserRepository(_sGraphQLClient);
  }

  @override
  void dispose() {
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
          BlocProvider(create: (context) => _isLoadingCubit),
        ],
        child: Dialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8.0),
          ),
          backgroundColor: Theme.of(context).scaffoldBackgroundColor,
          insetAnimationCurve: Curves.fastOutSlowIn,
          insetPadding: const EdgeInsets.all(16.0),
          elevation: 0,
          child: Container(
            alignment: Alignment.center,
            constraints: BoxConstraints(
              minHeight: kAppSize.height / 1.4,
              maxHeight: kAppSize.height / 1.4,
            ),
            decoration: BoxDecoration(
              color: Theme.of(context).scaffoldBackgroundColor,
              borderRadius: BorderRadius.circular(8.0),
              boxShadow: [
                BoxShadow(
                  color: Theme.of(context).colorScheme.secondary.withOpacity(0.2),
                  spreadRadius: 4.0,
                  blurRadius: 4.0,
                ),
              ],
            ),
            child: LayoutBuilder(
              builder: (context, raints) => SingleChildScrollView(
                padding: const EdgeInsets.all(16.0),
                child: ConstrainedBox(
                  constraints: BoxConstraints(minHeight: raints.maxHeight),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      Center(
                        child: Container(
                          alignment: Alignment.center,
                          height: 120.0,
                          width: 120.0,
                          decoration: BoxDecoration(
                            color: Theme.of(context).focusColor,
                            borderRadius: BorderRadius.circular(100.0),
                          ),
                          child: Text(
                            kDialCodeList.isEmpty ? '' : kDialCodeList.first.flag,
                            style: Theme.of(context).textTheme.displayMedium!.copyWith(fontSize: 80.0),
                          ),
                        ),
                      ),
                      const SizedBox(height: 4.0),
                      Text(
                        translate(context, 'tunisianNativeArabicDialogTitle'),
                        style: Theme.of(context).textTheme.displayMedium,
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 4.0),
                      Text(
                        translate(context, 'tunisianNativeArabicDialogSubtitle'),
                        style: Theme.of(context).textTheme.bodyLarge,
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 4.0),
                      Text(
                        translate(context, 'tunisianNativeArabicDialogDescription'),
                        style: Theme.of(context).textTheme.bodyMedium,
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 4.0),
                      Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
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
                                    onPressed: () async {
                                      _isLoadingCubit.updateValue(true);
                                      final updateUser = await _userRepository
                                          .updateUser(
                                        Variables$Mutation$updateUser(
                                          id: kUserID,
                                          input: Input$UserUpdateInput(
                                            locale: '${kLocaleList.last.languageCode}_${kLocaleList.last.countryCode}',
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
                                        BlocProvider.of<LocaleCubit>(context).setLocale(kLocaleList.last);
                                        FlutterMessenger.showSnackbar(context: context, string: translate(context, 'updateProfileToastMessage'));
                                        Navigator.pop(context);
                                      }
                                    },
                                    child: Text(
                                      translate(context, 'confirm'),
                                      textAlign: TextAlign.center,
                                      style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                                            color: Colors.white,
                                          ),
                                    ),
                                  ),
                          ),
                          const SizedBox(height: 4.0),
                          TextButton(
                            style: TextButton.styleFrom(
                              minimumSize: const Size.fromHeight(40.0),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(8.0),
                              ),
                            ),
                            onPressed: () => Navigator.pop(context),
                            child: Text(
                              translate(context, 'cancel'),
                              textAlign: TextAlign.center,
                              style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                                    color: kAppColor,
                                  ),
                            ),
                          ),
                        ],
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
