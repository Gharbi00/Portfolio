import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_diktup_utilities/extensions.dart';
import 'package:flutter_loyalcraft_gql/graphql/point-of-sale.graphql.dart';
import 'package:loyalcraft/localizations_delegate/app_localizations.dart';
import 'package:loyalcraft/src/data/consts.dart';
import 'package:loyalcraft/src/screens/point_of_sale_landing.dart';
import 'package:loyalcraft/src/utils/image_cache_manager/shared_image_provider.dart';

// ignore: must_be_immutable
class PointOfSaleItemWidget extends StatelessWidget {
  PointOfSaleItemWidget({
    Key? key,
    required this.pos,
  }) : super(key: key);

  Query$pointOfSale$pointOfSale pos;
  String _getAddress(Query$pointOfSale$pointOfSale$locations location) {
    var components = <String>[];
    if ((location.address ?? '').isNotEmpty) {
      components.add(location.address!);
    }
    if ((location.country?.name ?? '').isNotEmpty) {
      components.add(location.country!.name);
    }
    if ((location.state?.name ?? '').isNotEmpty) {
      components.add(location.state!.name);
    }
    return components.join(', ');
  }

  @override
  Widget build(BuildContext context) => GestureDetector(
        onTap: () => Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => PointOfSaleLandingWidget(
              pos: pos,
            ),
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            ((pos.picture?.baseUrl ?? '').isEmpty || (pos.picture?.path ?? '').isEmpty)
                ? Hero(
                    tag: kEmptyPicture,
                    child: Container(
                      width: double.infinity,
                      height: 180.0,
                      padding: const EdgeInsets.all(8.0),
                      decoration: BoxDecoration(
                        color: Theme.of(context).focusColor,
                        borderRadius: const BorderRadius.only(
                          topLeft: Radius.circular(8.0),
                          topRight: Radius.circular(8.0),
                        ),
                      ),
                      child: SharedImageProviderWidget(
                        imageUrl: kEmptyPicture,
                        color: Theme.of(context).colorScheme.secondary,
                        width: double.infinity,
                        height: 180.0,
                        fit: BoxFit.cover,
                      ),
                    ),
                  )
                : Hero(
                    tag: '${pos.picture!.baseUrl}/${pos.picture!.path}',
                    child: SharedImageProviderWidget(
                      imageUrl: '${pos.picture!.baseUrl}/${pos.picture!.path}',
                      backgroundColor: Theme.of(context).focusColor,
                      borderRadius: const BorderRadius.only(
                        topLeft: Radius.circular(8.0),
                        topRight: Radius.circular(8.0),
                      ),
                      fit: BoxFit.cover,
                      width: double.infinity,
                      height: 180.0,
                    ),
                  ),
            const SizedBox(height: 8.0),
            Text(
              pos.title.removeNull(),
              overflow: TextOverflow.ellipsis,
              softWrap: false,
              maxLines: 1,
              style: Theme.of(context).textTheme.displayMedium!.copyWith(
                    fontSize: 16.0,
                  ),
            ),
            const SizedBox(height: 4.0),
            Row(
              children: [
                Icon(
                  CupertinoIcons.location_solid,
                  color: Theme.of(context).colorScheme.secondary,
                  size: 18.0,
                ),
                const SizedBox(width: 4.0),
                Expanded(
                  child: Text(
                    (pos.locations ?? []).isEmpty ? translate(context, 'noDataFound') : _getAddress(pos.locations!.first),
                    style: Theme.of(context).textTheme.bodyMedium,
                    overflow: TextOverflow.ellipsis,
                    softWrap: false,
                    maxLines: 1,
                  ),
                ),
              ],
            ),
          ],
        ),
      );
}
