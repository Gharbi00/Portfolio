import 'package:flutter/material.dart';
import 'package:flutter_diktup_utilities/extensions.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-loyalty-settings.graphql.dart';
import 'package:loyalcraft/localizations_delegate/app_localizations.dart';
import 'package:loyalcraft/src/data/consts.dart';
import 'package:loyalcraft/src/screens/acceleration_landing.dart';
import 'package:loyalcraft/src/utils/image_cache_manager/shared_image_provider.dart';

// ignore: must_be_immutable
class AccelerationItemWidget extends StatelessWidget {
  AccelerationItemWidget({
    Key? key,
    required this.accelerationSettings,
    required this.locale,
  }) : super(key: key);
  Query$getAccelerationSettingsByTargetWithLinkedAccount$getAccelerationSettingsByTargetWithLinkedAccount$objects accelerationSettings;
  Locale locale;

  int _getAvailableSlotsCount({required Locale locale}) {
    var count = 0;
    var now = DateTime.now().toLocal();
    if ((accelerationSettings.mobile?.slots ?? []).isNotEmpty && (accelerationSettings.mobile?.enabled ?? false) == true) {
      accelerationSettings.mobile!.slots!.map((e) {
        if (now.toEEEE(locale).toLowerCase() == e.period!.day!.name.toLowerCase()) {
          var fromTime = DateTime(
            now.year,
            now.month,
            now.day,
            e.period!.from!.split(':')[0].toInteger(),
            e.period!.from!.split(':')[1].toInteger(),
          );
          var toTime = DateTime(
            now.year,
            now.month,
            now.day,
            e.period!.to!.split(':')[0].toInteger(),
            e.period!.to!.split(':')[1].toInteger(),
          );
          if (now.isAfter(fromTime) && now.isBefore(toTime)) {
            count++;
          }
        }
      }).toList();
    }
    if ((accelerationSettings.physical?.slots ?? []).isNotEmpty && (accelerationSettings.physical?.enabled ?? false) == true) {
      accelerationSettings.physical!.slots!.map((e) {
        if (now.toEEEE(locale).toLowerCase() == e.period!.day!.name.toLowerCase()) {
          var fromTime = DateTime(
            now.year,
            now.month,
            now.day,
            e.period!.from!.split(':')[0].toInteger(),
            e.period!.from!.split(':')[1].toInteger(),
          );
          var toTime = DateTime(
            now.year,
            now.month,
            now.day,
            e.period!.to!.split(':')[0].toInteger(),
            e.period!.to!.split(':')[1].toInteger(),
          );
          if (now.isAfter(fromTime) && now.isBefore(toTime)) {
            count++;
          }
        }
      }).toList();
    }
    if ((accelerationSettings.web?.slots ?? []).isNotEmpty && (accelerationSettings.web?.enabled ?? false) == true) {
      accelerationSettings.web!.slots!.map((e) {
        if (now.toEEEE(locale).toLowerCase() == e.period!.day!.name.toLowerCase()) {
          var fromTime = DateTime(
            now.year,
            now.month,
            now.day,
            e.period!.from!.split(':')[0].toInteger(),
            e.period!.from!.split(':')[1].toInteger(),
          );
          var toTime = DateTime(
            now.year,
            now.month,
            now.day,
            e.period!.to!.split(':')[0].toInteger(),
            e.period!.to!.split(':')[1].toInteger(),
          );
          if (now.isAfter(fromTime) && now.isBefore(toTime)) {
            count++;
          }
        }
      }).toList();
    }
    return count;
  }

  int _getPlatformsEnabledCount() {
    var count = 0;
    if ((accelerationSettings.mobile?.enabled ?? false) == true && (accelerationSettings.mobile?.slots ?? []).isNotEmpty) {
      count++;
    }
    if ((accelerationSettings.web?.enabled ?? false) == true && (accelerationSettings.web?.slots ?? []).isNotEmpty) {
      count++;
    }
    if ((accelerationSettings.physical?.enabled ?? false) == true && (accelerationSettings.physical?.slots ?? []).isNotEmpty) {
      count++;
    }

    return count;
  }

  @override
  Widget build(BuildContext context) => GestureDetector(
        onTap: () => Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => AccelerationLandingWidget(
              accelerationSettings: accelerationSettings,
            ),
          ),
        ),
        child: Row(
          children: [
            Stack(
              alignment: Alignment.bottomLeft,
              children: [
                ((accelerationSettings.target?.pos?.picture?.baseUrl ?? '').isEmpty || (accelerationSettings.target?.pos?.picture?.path ?? '').isEmpty)
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
                        imageUrl: '${accelerationSettings.target!.pos!.picture!.baseUrl}/${accelerationSettings.target!.pos?.picture!.path}',
                        backgroundColor: Theme.of(context).focusColor,
                        borderRadius: BorderRadius.circular(8.0),
                        fit: BoxFit.cover,
                        height: 80.0,
                        width: 80.0,
                      ),
                if (_getPlatformsEnabledCount() > 0)
                  Container(
                    padding: const EdgeInsets.all(8.0),
                    margin: const EdgeInsets.all(8.0),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(8.0),
                      color: Theme.of(context).focusColor,
                    ),
                    child: Text(
                      'x${_getPlatformsEnabledCount()}',
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
                    accelerationSettings.target?.pos?.title ?? translate(context, 'noDataFound'),
                    style: Theme.of(context).textTheme.displayMedium!.copyWith(
                          fontSize: 16.0,
                        ),
                  ),
                  const SizedBox(height: 4.0),
                  Text(
                    _getPlatformsEnabledCount() > 0
                        ? '${translate(context, "YouWillFindAHappyHourIn")} ${_getPlatformsEnabledCount()} ${translate(context, 'platforms')}.'
                        : translate(context, 'thereIsNoHappyHourAvailableRightNow'),
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                  const SizedBox(height: 4.0),
                  Text(
                    '${_getAvailableSlotsCount(locale: locale)} ${translate(context, 'happyHoursHappeningNow')}',
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                ],
              ),
            ),
          ],
        ),
      );
}
