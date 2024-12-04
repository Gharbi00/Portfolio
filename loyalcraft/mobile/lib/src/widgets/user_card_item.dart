import 'package:flutter/material.dart';
import 'package:flutter_diktup_utilities/extensions.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-card-user-card.graphql.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-loyalty-settings.graphql.dart';
import 'package:flutter_loyalcraft_gql/graphql/user.graphql.dart';
import 'package:flutter_loyalcraft_gql/schema.graphql.dart';
import 'package:loyalcraft/localizations_delegate/app_localizations.dart';
import 'package:loyalcraft/src/data/consts.dart';
import 'package:loyalcraft/src/utils/image_cache_manager/shared_image_provider.dart';

// ignore: must_be_immutable
class UserCardItemWidget extends StatelessWidget {
  UserCardItemWidget({
    Key? key,
    required this.findLoyaltySettingsByTarget,
    required this.userCard,
    required this.locale,
    required this.user,
  }) : super(key: key);
  Query$findLoyaltySettingsByTarget$findLoyaltySettingsByTarget? findLoyaltySettingsByTarget;
  Query$getCorporateUserCardByUserAndTarget$getCorporateUserCardByUserAndTarget? userCard;
  Query$user$user? user;
  Locale locale;

  @override
  Widget build(BuildContext context) => Container(
        margin: const EdgeInsets.symmetric(horizontal: 8.0),
        alignment: Alignment.center,
        width: double.infinity,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(8.0),
          color: kAppColor,
          gradient: LinearGradient(
            colors: [
              kAppColor,
              Colors.deepPurple[800]!,
            ],
            stops: const [
              0.6,
              0.9,
            ],
          ),
        ),
        child: Stack(
          alignment: Alignment.centerRight,
          children: [
            Positioned(
              right: 8.0,
              child: SharedImageProviderWidget(
                imageUrl: kAppIcon,
                fit: BoxFit.cover,
                height: 60.0,
                width: 60.0,
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      SharedImageProviderWidget(
                        imageUrl: kLoyalcraftWhiteText,
                        fit: BoxFit.cover,
                        height: 16.0,
                        width: null,
                      ),
                      if (userCard!.cardType == Enum$CardTypeEnum.VIRTUAL)
                        Padding(
                          padding: const EdgeInsets.only(right: 8.0),
                          child: Text(
                            translate(context, 'virtualCard').toUpperCase(),
                            style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                                  color: Colors.white,
                                  fontSize: 12.0,
                                ),
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 16.0),
                  Text(
                    (userCard?.identifier ?? '').formatToIdentifier(split: 4).toUpperCase(),
                    style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                          color: Colors.white,
                          letterSpacing: 4.0,
                        ),
                  ),
                  const SizedBox(height: 16.0),
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Row(
                              children: [
                                Expanded(
                                  child: Text(
                                    '${user!.firstName} ${user!.lastName}'.toUpperCase(),
                                    style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                                          color: Colors.white,
                                          fontSize: 16.0,
                                        ),
                                  ),
                                ),
                                Text(
                                  '${translate(context, 'validUntil')} ${userCard!.validUntil.toLocal().toMd(locale)}'.toUpperCase(),
                                  style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                                        color: Colors.white,
                                        fontSize: 12.0,
                                      ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      );
}
