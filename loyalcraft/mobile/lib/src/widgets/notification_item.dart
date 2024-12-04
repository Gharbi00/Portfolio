import 'dart:math';

import 'package:flutter/material.dart';
import 'package:flutter_diktup_utilities/extensions.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-corporate-notification.graphql.dart';
import 'package:flutter_loyalcraft_gql/schema.graphql.dart';
import 'package:loyalcraft/localizations_delegate/app_localizations.dart';
import 'package:loyalcraft/src/data/consts.dart';
import 'package:loyalcraft/src/utils/image_cache_manager/shared_image_provider.dart';
import 'package:loyalcraft/src/widgets/qualitative_quantitative.dart';

// ignore: must_be_immutable
class NotificationItemWidget extends StatelessWidget {
  NotificationItemWidget({
    Key? key,
    required this.notification,
    required this.locale,
  }) : super(key: key);
  Query$getCorporateNotificationsForUserWithLinkedAccountsPaginated$getCorporateNotificationsForUserWithLinkedAccountsPaginated$objects notification;
  Locale locale;

  String _getNotificationTitle(BuildContext context) {
    if (notification.event == Enum$EventTypeEnum.ADHOC_NOTIFICATION) {
      if ((notification.action?.adhocNotification?.title ?? '').isNotEmpty) {
        return notification.action!.adhocNotification!.title!;
      }
    }
    if (notification.event == Enum$EventTypeEnum.REPUTATION_LOST) {
      return translate(context, 'reputationLost');
    }
    if (notification.event == Enum$EventTypeEnum.REPUTATION_ALMOST_LOST) {
      return translate(context, 'reputationAlmostLost');
    }

    if (notification.event == Enum$EventTypeEnum.PUSH_AMOUNT) {
      return translate(context, 'pushAmount');
    }

    return translate(context, '');
  }

  String _getNotificationPicture() {
    if (notification.event == Enum$EventTypeEnum.ADHOC_NOTIFICATION) {
      if ((notification.action?.adhocNotification?.picture?.baseUrl ?? '').isNotEmpty && (notification.action?.adhocNotification?.picture?.path ?? '').isNotEmpty) {
        return '${notification.action!.adhocNotification!.picture!.baseUrl}/${notification.action!.adhocNotification!.picture!.path}';
      }
    }
    if (notification.event == Enum$EventTypeEnum.REPUTATION_LOST || notification.event == Enum$EventTypeEnum.REPUTATION_ALMOST_LOST) {
      return kLoyalcraftAngryStickerList[Random().nextInt(13)];
    }
    return kLoyalcraftHappyStickerList[Random().nextInt(7)];
  }

  String _getNotificationDescription(BuildContext context) {
    if (notification.event == Enum$EventTypeEnum.ADHOC_NOTIFICATION) {
      if ((notification.action?.adhocNotification?.description ?? '').isNotEmpty) {
        return notification.action!.adhocNotification!.description.removeNull();
      }
    }
    if (notification.event == Enum$EventTypeEnum.REPUTATION_LOST) {
      return translate(context, 'notificationReputationLossDescription');
    }
    if (notification.event == Enum$EventTypeEnum.REPUTATION_ALMOST_LOST) {
      return translate(context, 'notificationReputationAlmostLostDescription');
    }

    if (notification.event == Enum$EventTypeEnum.PUSH_AMOUNT) {
      return translate(context, 'notificationPushAmountDescription');
    }
    return translate(context, 'notificationUnknownDescription');
  }

  @override
  Widget build(BuildContext context) => Container(
        padding: EdgeInsets.symmetric(
          vertical: (notification.seen ?? true) ? 0.0 : 8.0,
          horizontal: 16.0,
        ),
        decoration: BoxDecoration(
          color: (notification.seen ?? true) ? Colors.transparent : Theme.of(context).focusColor.withOpacity(0.6),
        ),
        child: Row(
          children: [
            SharedImageProviderWidget(
              imageUrl: _getNotificationPicture(),
              backgroundColor: Theme.of(context).focusColor,
              borderRadius: notification.event == Enum$EventTypeEnum.ADHOC_NOTIFICATION ? BorderRadius.circular(100.0) : BorderRadius.zero,
              fit: BoxFit.cover,
              height: 40.0,
              width: 40.0,
            ),
            const SizedBox(width: 8.0),
            Expanded(
              child: Wrap(
                spacing: 4.0,
                runSpacing: 4.0,
                crossAxisAlignment: WrapCrossAlignment.center,
                children: [
                  Text(
                    notification.target.pos?.title ?? _getNotificationTitle(context),
                    style: Theme.of(context).textTheme.displayMedium!.copyWith(fontSize: 15.0),
                  ),
                  Text(
                    _getNotificationDescription(context),
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                  Text(
                    notification.executedAt!.toLocal().toTimeAgo(locale),
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                  if (notification.event == Enum$EventTypeEnum.REPUTATION_LOST && notification.action?.reputationLoss != 0)
                    Container(
                      padding: const EdgeInsets.all(8.0),
                      margin: const EdgeInsets.only(left: 8.0),
                      decoration: BoxDecoration(
                        color: Theme.of(context).focusColor.withOpacity(0.6),
                        borderRadius: BorderRadius.circular(100.0),
                      ),
                      child: QualitativeQuantitativeWidget(
                        amount: notification.action!.reputationLoss!.toInt(),
                        walletType: Enum$WalletTypeEnum.QUALITATIVE,
                        size: const Size(18.0, 18.0),
                        beforeAmount: '- ',
                        textAlign: TextAlign.center,
                        textStyle: Theme.of(context).textTheme.displayMedium!.copyWith(
                              color: Colors.red[800],
                              fontSize: 14.0,
                            ),
                      ),
                    ),
                ],
              ),
            ),
          ],
        ),
      );
}
