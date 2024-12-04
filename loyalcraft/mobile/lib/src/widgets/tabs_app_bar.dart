import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_diktup_utilities/extensions.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-wallet-wallet.graphql.dart';
import 'package:flutter_loyalcraft_gql/graphql/user.graphql.dart';
import 'package:flutter_loyalcraft_gql/schema.graphql.dart';
import 'package:loyalcraft/src/bloc/home_tab_index.dart';
import 'package:loyalcraft/src/data/consts.dart';
import 'package:loyalcraft/src/data/shared_preferences.dart';
import 'package:loyalcraft/src/screens/notifications.dart';
import 'package:loyalcraft/src/utils/image_cache_manager/shared_image_provider.dart';
import 'package:loyalcraft/src/widgets/qualitative_quantitative.dart';

// ignore: must_be_immutable
class TabsAppBarWidget extends StatelessWidget {
  TabsAppBarWidget({
    required this.notificationCount,
    required this.wallet,
    required this.title,
    required this.user,
    Key? key,
  }) : super(key: key);
  Query$getCurrentUserQuantitativeWallets$getCurrentUserQuantitativeWallets$objects? wallet;
  int notificationCount;
  Query$user$user user;
  String title;

  @override
  Widget build(BuildContext context) => Row(
        children: [
          Expanded(
            child: Text(
              title,
              style: Theme.of(context).textTheme.headlineSmall,
            ),
          ),
          if (wallet != null)
            GestureDetector(
              onTap: () => BlocProvider.of<HomeTabIndexCubit>(context).updateValue(3),
              child: Container(
                margin: const EdgeInsets.only(left: 8.0),
                padding: const EdgeInsets.all(8.0),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(100.0),
                  color: Theme.of(context).focusColor,
                ),
                child: QualitativeQuantitativeWidget(
                  textStyle: Theme.of(context).textTheme.displayMedium!.copyWith(fontSize: 15.0),
                  walletType: Enum$WalletTypeEnum.QUANTITATIVE,
                  baseUrl: wallet?.coin?.picture?.baseUrl,
                  path: wallet?.coin?.picture?.path,
                  amount: (wallet?.amount ?? '0').toInteger(),
                  size: const Size(18.0, 18.0),
                  textAlign: TextAlign.center,
                ),
              ),
            ),
          const SizedBox(width: 8.0),
          Badge.count(
            alignment: Alignment.topRight,
            count: notificationCount.clamp(0, 99),
            isLabelVisible: notificationCount > 0,
            textColor: Colors.white,
            backgroundColor: Colors.red[800],
            textStyle: Theme.of(context).textTheme.bodyLarge!.copyWith(fontSize: 12.0, color: Colors.white),
            child: GestureDetector(
              onTap: () => Navigator.push(context, MaterialPageRoute(builder: (context) => const NotificationsWidget())),
              child: Container(
                height: 36.0,
                width: 36.0,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(100.0),
                  color: Theme.of(context).focusColor,
                ),
                child: Icon(
                  CupertinoIcons.bell_fill,
                  color: Theme.of(context).colorScheme.secondary,
                  size: 18.0,
                ),
              ),
            ),
          ),
          const SizedBox(width: 8.0),
          GestureDetector(
            onTap: () {
              addHomeTabIndexToSP(4);
              BlocProvider.of<HomeTabIndexCubit>(context).updateValue(4);
            },
            child: ((user.picture?.baseUrl ?? '').isEmpty || (user.picture?.path ?? '').isEmpty)
                ? SharedImageProviderWidget(
                    color: Theme.of(context).colorScheme.secondary,
                    imageUrl: kUserAvatar,
                    fit: BoxFit.cover,
                    height: 36.0,
                    width: 36.0,
                  )
                : SharedImageProviderWidget(
                    imageUrl: '${user.picture!.baseUrl!}/${user.picture!.path!}',
                    color: Theme.of(context).colorScheme.secondary,
                    backgroundColor: Theme.of(context).focusColor,
                    borderRadius: BorderRadius.circular(100.0),
                    fit: BoxFit.cover,
                    height: 36.0,
                    width: 36.0,
                  ),
          ),
        ],
      );
}
