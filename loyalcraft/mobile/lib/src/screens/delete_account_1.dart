import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_diktup_utilities/extensions.dart';
import 'package:loyalcraft/localizations_delegate/app_localizations.dart';
import 'package:loyalcraft/src/bloc/user.dart';
import 'package:loyalcraft/src/data/consts.dart';
import 'package:loyalcraft/src/data/shared_preferences.dart';
import 'package:loyalcraft/src/screens/delete_account_2.dart';
import 'package:loyalcraft/src/utils/image_cache_manager/shared_image_provider.dart';

// ignore: must_be_immutable
class DeleteAccount1Widget extends StatelessWidget {
  const DeleteAccount1Widget({
    Key? key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final _user = context.watch<UserCubit>().state;
    return Scaffold(
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
                translate(context, 'deleteAccount'),
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
                  ],
                ),
              ),
              const SizedBox(height: 16.0),
              TextButton(
                style: TextButton.styleFrom(
                  minimumSize: const Size.fromHeight(40.0),
                  backgroundColor: kAppColor,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8.0),
                  ),
                ),
                onPressed: () => signOut(context),
                child: Text(
                  translate(context, 'signOutInstead'),
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                        color: Colors.white,
                      ),
                ),
              ),
              const SizedBox(height: 16.0),
              TextButton(
                style: TextButton.styleFrom(
                  minimumSize: const Size.fromHeight(40.0),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8.0),
                    side: BorderSide(
                      color: kAppColor,
                    ),
                  ),
                ),
                onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (context) => const DeleteAccount2Widget())),
                child: Text(
                  translate(context, 'procedToDeleteAccount'),
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                        color: kAppColor,
                      ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
