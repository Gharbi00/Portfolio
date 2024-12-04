import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_diktup_utilities/extensions.dart';
import 'package:flutter_diktup_utilities/flutter_diktup_utilities.dart';
import 'package:flutter_loyalcraft_gql/graphql/corporate-internal-product.graphql.dart';
import 'package:loyalcraft/localizations_delegate/app_localizations.dart';
import 'package:loyalcraft/src/data/consts.dart';
import 'package:loyalcraft/src/utils/image_cache_manager/shared_image_provider.dart';

// ignore: must_be_immutable
class ProductItemWidget extends StatelessWidget {
  ProductItemWidget({
    super.key,
    required this.internalProduct,
  });

  Query$getSimpleProductsWithRatingsWithFavoriteStatusWithFilter$getSimpleProductsWithRatingsWithFavoriteStatusWithFilter$objects internalProduct;

  String _getInternalProductImage() {
    if ((internalProduct.barcodes ?? []).isNotEmpty) {
      if ((internalProduct.barcodes!.first.media?.pictures ?? []).isNotEmpty) {
        if ((internalProduct.barcodes!.first.media!.pictures!.first.baseUrl ?? '').isNotEmpty && (internalProduct.barcodes!.first.media!.pictures!.first.path ?? '').isNotEmpty) {
          return '${internalProduct.barcodes!.first.media!.pictures!.first.baseUrl}/${internalProduct.barcodes!.first.media!.pictures!.first.path}';
        }
      }
    }
    return '';
  }

  @override
  Widget build(BuildContext context) => (internalProduct.barcodes ?? []).isEmpty
      ? const SizedBox()
      : GestureDetector(
          onTap: () {
            openUrl(kLoyalcraftPortal);
          },
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Stack(
                clipBehavior: Clip.none,
                children: [
                  _getInternalProductImage().isEmpty
                      ? Container(
                          width: double.infinity,
                          height: 180.0,
                          padding: const EdgeInsets.all(8.0),
                          alignment: Alignment.center,
                          decoration: BoxDecoration(
                            borderRadius: const BorderRadius.only(topLeft: Radius.circular(16.0), topRight: Radius.circular(16.0)),
                            color: Theme.of(context).focusColor,
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
                          imageUrl: _getInternalProductImage(),
                          borderRadius: const BorderRadius.only(topLeft: Radius.circular(16.0), topRight: Radius.circular(16.0)),
                          backgroundColor: Theme.of(context).focusColor,
                          width: double.infinity,
                          fit: BoxFit.cover,
                          height: 180.0,
                        ),
                  // Positioned(
                  //   top: 8.0,
                  //   left: 8.0,
                  //   child: Container(
                  //     padding: const EdgeInsets.symmetric(vertical: 4.0, horizontal: 8.0),
                  //     decoration: BoxDecoration(
                  //       color: Colors.red[800],
                  //       borderRadius: BorderRadius.circular(100.0),
                  //     ),
                  //     child: Text(
                  //       '30%',
                  //       style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                  //             fontSize: 12.0,
                  //             color: Colors.white,
                  //           ),
                  //     ),
                  //   ),
                  // ),
                  Positioned(
                    top: 8.0,
                    right: 8.0,
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 4.0, horizontal: 8.0),
                      decoration: BoxDecoration(
                        color: Theme.of(context).focusColor.withOpacity(1.0),
                        borderRadius: BorderRadius.circular(100.0),
                      ),
                      child: RichText(
                        text: TextSpan(
                          children: [
                            WidgetSpan(
                              child: Icon(
                                CupertinoIcons.star_fill,
                                color: Theme.of(context).colorScheme.secondary,
                                size: 16.0,
                              ),
                            ),
                            TextSpan(
                              text: ' ${internalProduct.ratings.toDouble().formatDouble()}',
                              style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                                    fontSize: 12.0,
                                  ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                  Positioned(
                    bottom: 8.0,
                    right: 8.0,
                    child: Container(
                      alignment: Alignment.center,
                      height: 40.0,
                      width: 40.0,
                      padding: const EdgeInsets.all(4.0),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(100.0),
                      ),
                      child: const Icon(
                        CupertinoIcons.heart,
                        color: Colors.black,
                        size: 20.0,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 4.0),
              Row(
                children: [
                  // (1 == 0)
                  //     ? Container(
                  //         alignment: Alignment.center,
                  //         width: double.infinity,
                  //         padding: const EdgeInsets.all(8.0),
                  //         decoration: BoxDecoration(
                  //           color: Theme.of(context).focusColor,
                  //         ),
                  //         child: SharedImageProviderWidget(
                  //           imageUrl: kEmptyPicture,
                  //           color: Theme.of(context).colorScheme.secondary,
                  //           fit: BoxFit.cover,
                  //           width: 25.0,
                  //           height: 25.0,
                  //         ),
                  //       )
                  //     : SharedImageProviderWidget(
                  //         enableOnTap: true,
                  //         imageUrl: 'https://mir-s3-cdn-cf.behance.net/projects/404/cfaa9d174980195.Y3JvcCwxOTk5LDE1NjQsMCwyMTc.jpg',
                  //         color: Theme.of(context).colorScheme.secondary,
                  //         backgroundColor: Theme.of(context).focusColor,
                  //         borderRadius: BorderRadius.circular(100.0),
                  //         fit: BoxFit.cover,
                  //         width: 25.0,
                  //         height: 25.0,
                  //       ),
                  // const SizedBox(width: 4.0),
                  Expanded(
                    child: RichText(
                      text: TextSpan(
                        children: [
                          TextSpan(
                            text: '${translate(context, 'soldBy')} ',
                            style: Theme.of(context).textTheme.bodyMedium!.copyWith(fontSize: 12.0),
                          ),
                          TextSpan(
                            text: internalProduct.target.pos?.name ?? '-',
                            style: Theme.of(context).textTheme.displayMedium!.copyWith(fontSize: 12.0),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 4.0),
              Text(
                internalProduct.barcodes!.first.name.removeNull(),
                style: Theme.of(context).textTheme.bodyMedium,
              ),
              const SizedBox(height: 4.0),
              RichText(
                text: TextSpan(
                  children: [
                    TextSpan(
                      text: internalProduct.barcodes!.first.publicPrice.removeNull().formatToPrice('ar_TN', '', 3),
                      style: Theme.of(context).textTheme.displayMedium!.copyWith(
                            fontSize: 16.0,
                          ),
                    ),
                    TextSpan(
                      text: translate(context, 'TND').toUpperCase(),
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
}
