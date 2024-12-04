import 'package:flutter/material.dart';
import 'package:loyalcraft/localizations_delegate/app_localizations.dart';
import 'package:loyalcraft/src/data/consts.dart';
import 'package:loyalcraft/src/screens/referral_point_of_sales.dart';
import 'package:loyalcraft/src/utils/image_cache_manager/shared_image_provider.dart';

// ignore: must_be_immutable
class ReferFriendBannerItemWidget extends StatelessWidget {
  const ReferFriendBannerItemWidget({
    Key? key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) => SizedBox(
        width: kAppSize.width / 1.5,
        height: 170.0,
        child: GestureDetector(
          onTap: () => Navigator.push(context, MaterialPageRoute(builder: (context) => const ReferralPointOfSalesWidget())),
          child: Stack(
            children: [
              SharedImageProviderWidget(
                imageUrl: kReferFriendBanner,
                backgroundColor: Theme.of(context).focusColor,
                borderRadius: BorderRadius.circular(8.0),
                fit: BoxFit.cover,
                width: kAppSize.width / 1.5,
                height: 160.0,
              ),
              Container(
                width: kAppSize.width / 1.5,
                height: 160.0,
                decoration: BoxDecoration(
                  color: Colors.black.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(8.0),
                ),
              ),
              Container(
                margin: const EdgeInsets.all(16.0),
                alignment: Alignment.center,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.center,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      translate(context, 'referFriendsToBrands'),
                      maxLines: 2,
                      style: Theme.of(context).textTheme.displayMedium!.copyWith(
                            color: Colors.white,
                            fontSize: 18.0,
                          ),
                    ),
                    const SizedBox(height: 4.0),
                    Text(
                      translate(context, 'referFriendBannerText2'),
                      maxLines: 2,
                      style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                            color: Colors.white,
                          ),
                    ),
                    const SizedBox(height: 4.0),
                    Container(
                      padding: const EdgeInsets.all(8.0),
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(8.0),
                        color: Colors.white,
                      ),
                      child: Text(
                        translate(context, 'exploreBrands'),
                        style: Theme.of(context).textTheme.bodyMedium!.copyWith(
                              color: Colors.black,
                            ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      );
}
