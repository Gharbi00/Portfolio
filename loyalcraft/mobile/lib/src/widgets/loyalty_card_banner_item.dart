import 'package:flutter/material.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-card-user-card.graphql.dart';
import 'package:flutter_loyalcraft_gql/graphql/point-of-sale.graphql.dart';
import 'package:loyalcraft/localizations_delegate/app_localizations.dart';
import 'package:loyalcraft/src/bloc/variable.dart';
import 'package:loyalcraft/src/data/consts.dart';
import 'package:loyalcraft/src/modal_bottom_sheet/user_card.dart';
import 'package:loyalcraft/src/utils/image_cache_manager/shared_image_provider.dart';

// ignore: must_be_immutable
class LoyaltyCardBannerItemWidget extends StatelessWidget {
  LoyaltyCardBannerItemWidget({
    Key? key,
    required this.getCorporateUserCardByUserAndTarget,
    required this.isLoadingCubit,
    required this.pos,
  }) : super(key: key);
  Query$pointOfSale$pointOfSale? pos;
  List<Query$getCorporateUserCardByUserAndTarget$getCorporateUserCardByUserAndTarget> getCorporateUserCardByUserAndTarget;
  VariableCubit isLoadingCubit;

  @override
  Widget build(BuildContext context) => GestureDetector(
        onTap: () => showUserCardSheet(
          getCorporateUserCardByUserAndTarget: getCorporateUserCardByUserAndTarget,
          context: context,
          pos: pos,
        ),
        child: Container(
          padding: const EdgeInsets.all(16.0),
          width: kAppSize.width / 1.8,
          alignment: Alignment.center,
          height: 250.0,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(8.0),
            color: Theme.of(context).focusColor,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              SharedImageProviderWidget(
                imageUrl: kLoyaltyCard,
                borderRadius: BorderRadius.zero,
                fit: BoxFit.cover,
                height: 40.0,
                width: 40.0,
              ),
              const SizedBox(height: 8.0),
              Text(
                translate(context, 'loyaltyCardBanner'),
                style: Theme.of(context).textTheme.bodyMedium,
              ),
              const SizedBox(height: 8.0),
              Container(
                padding: const EdgeInsets.all(8.0),
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(8.0),
                  color: Theme.of(context).colorScheme.secondary,
                ),
                child: Text(
                  translate(context, 'card'),
                  overflow: TextOverflow.ellipsis,
                  softWrap: false,
                  maxLines: 1,
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                        color: Theme.of(context).primaryColor,
                      ),
                ),
              ),
            ],
          ),
        ),
      );
}
