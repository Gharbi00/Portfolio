import 'package:flutter/material.dart';
import 'package:flutter_diktup_utilities/extensions.dart';
import 'package:flutter_loyalcraft_gql/graphql/corporate-partnership-network.graphql.dart';
import 'package:loyalcraft/src/data/consts.dart';
import 'package:loyalcraft/src/utils/image_cache_manager/shared_image_provider.dart';

// ignore: must_be_immutable
class PointOfSaleAsChipWidget extends StatelessWidget {
  PointOfSaleAsChipWidget({
    Key? key,
    required this.selected,
    required this.pos,
    required this.refreshTheView,
  }) : super(key: key);
  Query$getPartnershipNetworksByTargetAndPartnershipPagination$getPartnershipNetworksByTargetAndPartnershipPagination$objects$partner$pos? pos;
  ValueChanged<Query$getPartnershipNetworksByTargetAndPartnershipPagination$getPartnershipNetworksByTargetAndPartnershipPagination$objects$partner$pos?> refreshTheView;
  bool selected;

  @override
  Widget build(BuildContext context) => GestureDetector(
        onTap: () => refreshTheView(pos),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 4.0, horizontal: 8.0),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(100.0),
            color: Theme.of(context).focusColor,
            border: selected == false ? null : Border.all(color: kAppColor),
          ),
          child: Wrap(
            crossAxisAlignment: WrapCrossAlignment.center,
            runSpacing: 4.0,
            spacing: 4.0,
            children: [
              ((pos!.picture?.baseUrl ?? '').isEmpty || (pos!.picture?.path ?? '').isEmpty)
                  ? Container(
                      width: 20.0,
                      height: 20.0,
                      padding: const EdgeInsets.all(4.0),
                      decoration: BoxDecoration(
                        color: Theme.of(context).focusColor,
                        borderRadius: BorderRadius.circular(100.0),
                      ),
                      child: SharedImageProviderWidget(
                        imageUrl: kEmptyPicture,
                        color: Theme.of(context).colorScheme.secondary,
                        width: 20.0,
                        height: 20.0,
                        fit: BoxFit.cover,
                      ),
                    )
                  : SharedImageProviderWidget(
                      imageUrl: '${pos!.picture!.baseUrl}/${pos!.picture!.path}',
                      backgroundColor: Theme.of(context).focusColor,
                      borderRadius: BorderRadius.circular(100.0),
                      fit: BoxFit.cover,
                      width: 20.0,
                      height: 20.0,
                    ),
              Text(
                pos!.title.removeNull(),
                style: Theme.of(context).textTheme.bodyMedium,
              ),
            ],
          ),
        ),
      );
}
