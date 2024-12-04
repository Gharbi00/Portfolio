import 'package:flutter/material.dart';
import 'package:loyalcraft/localizations_delegate/app_localizations.dart';
import 'package:loyalcraft/src/data/consts.dart';
import 'package:loyalcraft/src/screens/accelerations.dart';
import 'package:loyalcraft/src/utils/image_cache_manager/shared_image_provider.dart';

// ignore: must_be_immutable
class HappyHourBannerItemWidget extends StatelessWidget {
  const HappyHourBannerItemWidget({
    Key? key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) => GestureDetector(
        onTap: () => Navigator.push(context, MaterialPageRoute(builder: (context) => const AccelerationsWidget())),
        child: Container(
          width: kAppSize.width / 1.5,
          height: 170.0,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(8.0),
            color: Theme.of(context).focusColor,
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Container(
                  margin: const EdgeInsets.all(16.0),
                  alignment: Alignment.center,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.center,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        translate(context, 'happyHourSpecials'),
                        maxLines: 2,
                        style: Theme.of(context).textTheme.displayMedium!.copyWith(
                              fontSize: 18.0,
                            ),
                      ),
                      const SizedBox(height: 4.0),
                      Text(
                        translate(context, 'happyHourBannerText2'),
                        maxLines: 2,
                        style: Theme.of(context).textTheme.bodyLarge,
                      ),
                      const SizedBox(height: 4.0),
                      Container(
                        padding: const EdgeInsets.all(8.0),
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(8.0),
                          color: Colors.black,
                        ),
                        child: Text(
                          translate(context, 'seeAll'),
                          style: Theme.of(context).textTheme.bodyMedium!.copyWith(
                                color: Colors.white,
                              ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 8.0),
              Stack(
                children: [
                  SharedImageProviderWidget(
                    imageUrl: kAccelerateBanner,
                    backgroundColor: Theme.of(context).focusColor,
                    borderRadius: const BorderRadius.only(
                      bottomRight: Radius.circular(8.0),
                      topRight: Radius.circular(8.0),
                    ),
                    fit: BoxFit.cover,
                    width: 100.0,
                    height: 160.0,
                  ),
                  Positioned(
                    bottom: 8.0,
                    right: 8.0,
                    child: Container(
                      padding: const EdgeInsets.all(4.0),
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(100.0),
                        color: Colors.grey[900]!.withOpacity(0.6),
                      ),
                      child: Text(
                        '#${translate(context, 'happyHour')}',
                        style: Theme.of(context).textTheme.bodyMedium!.copyWith(
                              fontSize: 12.0,
                              color: Colors.white,
                            ),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      );
}
