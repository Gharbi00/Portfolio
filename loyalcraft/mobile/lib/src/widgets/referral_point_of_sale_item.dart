import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_diktup_utilities/extensions.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-loyalty-settings.graphql.dart';
import 'package:flutter_loyalcraft_gql/schema.graphql.dart';
import 'package:loyalcraft/localizations_delegate/app_localizations.dart';
import 'package:loyalcraft/src/data/consts.dart';
import 'package:loyalcraft/src/screens/refer_friend_landing.dart';
import 'package:loyalcraft/src/utils/image_cache_manager/shared_image_provider.dart';
import 'package:loyalcraft/src/widgets/qualitative_quantitative.dart';

// ignore: must_be_immutable
class ReferralPointOfSaleItemWidget extends StatelessWidget {
  ReferralPointOfSaleItemWidget({
    Key? key,
    required this.referralSettings,
  }) : super(key: key);

  Query$getReferralSettingsByTargetWithLinkedAccount$getReferralSettingsByTargetWithLinkedAccount$objects referralSettings;

  @override
  Widget build(BuildContext context) => GestureDetector(
        onTap: () => Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => ReferFriendLandingWidget(
              referralSettings: referralSettings,
            ),
          ),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Stack(
              alignment: Alignment.bottomLeft,
              children: [
                ((referralSettings.target?.pos?.picture?.baseUrl ?? '').isEmpty || (referralSettings.target?.pos?.picture?.path ?? '').isEmpty)
                    ? Container(
                        width: 80.0,
                        height: 80.0,
                        padding: const EdgeInsets.all(8.0),
                        decoration: BoxDecoration(
                          color: Theme.of(context).focusColor,
                          borderRadius: BorderRadius.circular(8.0),
                        ),
                        child: SharedImageProviderWidget(
                          imageUrl: kEmptyPicture,
                          color: Theme.of(context).colorScheme.secondary,
                          width: 80.0,
                          height: 80.0,
                          fit: BoxFit.cover,
                        ),
                      )
                    : SharedImageProviderWidget(
                        imageUrl: '${referralSettings.target!.pos!.picture!.baseUrl}/${referralSettings.target!.pos?.picture!.path}',
                        backgroundColor: Theme.of(context).focusColor,
                        borderRadius: BorderRadius.circular(8.0),
                        fit: BoxFit.cover,
                        width: 80.0,
                        height: 80.0,
                      ),
                Container(
                  padding: const EdgeInsets.all(8.0),
                  margin: const EdgeInsets.all(8.0),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(8.0),
                    color: Theme.of(context).focusColor,
                  ),
                  child: Text(
                    'x${referralSettings.limit?.rate ?? 0}',
                    style: Theme.of(context).textTheme.displayMedium!.copyWith(
                          fontSize: 14.0,
                        ),
                  ),
                ),
              ],
            ),
            const SizedBox(width: 8.0),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    referralSettings.target?.pos?.title ?? translate(context, 'noDataFound'),
                    style: Theme.of(context).textTheme.displayMedium!.copyWith(
                          fontSize: 16.0,
                        ),
                  ),
                  const SizedBox(height: 4.0),
                  Text(
                    '${translate(context, 'youCanReferAMaximumOf')} ${referralSettings.limit?.rate ?? 0} ${translate(context, 'friendsEachDay')}.',
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                  const SizedBox(height: 4.0),
                  Wrap(
                    crossAxisAlignment: WrapCrossAlignment.center,
                    runSpacing: 8.0,
                    spacing: 8.0,
                    children: [
                      if ((referralSettings.remuneration?.referrer?.quantitative?.amount ?? '0').toInteger() > 0)
                        Container(
                          padding: const EdgeInsets.symmetric(vertical: 4.0, horizontal: 8.0),
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(100.0),
                            color: Theme.of(context).focusColor,
                          ),
                          child: QualitativeQuantitativeWidget(
                            textStyle: Theme.of(context).textTheme.bodyLarge,
                            walletType: Enum$WalletTypeEnum.QUANTITATIVE,
                            baseUrl: referralSettings.remuneration?.referrer?.quantitative?.wallet?.coin?.picture?.baseUrl,
                            path: referralSettings.remuneration?.referrer?.quantitative?.wallet?.coin?.picture?.path,
                            amount: (referralSettings.remuneration?.referrer?.quantitative?.amount ?? '0').toInteger(),
                            size: const Size(18.0, 18.0),
                            textAlign: TextAlign.center,
                          ),
                        ),
                      if ((referralSettings.remuneration?.referrer?.qualitative?.amount ?? '0').toInteger() > 0)
                        Container(
                          padding: const EdgeInsets.symmetric(vertical: 4.0, horizontal: 8.0),
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(100.0),
                            color: Theme.of(context).focusColor,
                          ),
                          child: QualitativeQuantitativeWidget(
                            amount: (referralSettings.remuneration?.referrer?.qualitative?.amount ?? '0').toInteger(),
                            walletType: Enum$WalletTypeEnum.QUALITATIVE,
                            size: const Size(18.0, 18.0),
                            textAlign: TextAlign.center,
                            textStyle: Theme.of(context).textTheme.bodyLarge,
                          ),
                        ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8.0),
            GestureDetector(
              onTap: () => Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => ReferFriendLandingWidget(
                    referralSettings: referralSettings,
                  ),
                ),
              ),
              child: Container(
                height: 40.0,
                width: 40.0,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(100.0),
                  color: Theme.of(context).focusColor,
                ),
                child: Icon(
                  CupertinoIcons.share_solid,
                  color: Theme.of(context).colorScheme.secondary,
                  size: 18.0,
                ),
              ),
            ),
          ],
        ),
      );
}
