import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:loyalcraft/src/data/consts.dart';
import 'package:loyalcraft/src/utils/theme.dart' as theme_utils;

void showIosDatePickerSheet({
  required ValueChanged<DateTime> refreshTheView,
  required DateTime? initialDateTime,
  required BuildContext context,
  required ThemeData? themeData,
  required Locale locale,
}) {
  showModalBottomSheet(
    backgroundColor: Colors.transparent,
    isScrollControlled: true,
    context: context,
    builder: (builder) => StatefulBuilder(
      builder: (buildContext, setState) => Container(
        padding: const EdgeInsets.all(16.0),
        width: double.infinity,
        decoration: BoxDecoration(
          color: Theme.of(context).scaffoldBackgroundColor,
          borderRadius: const BorderRadius.only(
            topRight: Radius.circular(8.0),
            topLeft: Radius.circular(8.0),
          ),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Center(
              child: Container(
                height: 6.0,
                width: 80.0,
                decoration: BoxDecoration(
                  color: Theme.of(context).focusColor.withOpacity(1.0),
                  borderRadius: BorderRadius.circular(100.0),
                ),
              ),
            ),
            const SizedBox(height: 16.0),
            SizedBox(
              height: 200.0,
              child: CupertinoTheme(
                data: CupertinoThemeData(
                  brightness: themeData == theme_utils.ThemeUtils(locale: locale).lightTheme ? Brightness.light : Brightness.dark,
                  textTheme: CupertinoTextThemeData(
                    dateTimePickerTextStyle: Theme.of(context).textTheme.bodyMedium,
                    navLargeTitleTextStyle: Theme.of(context).textTheme.bodyMedium,
                    navActionTextStyle: Theme.of(context).textTheme.bodyMedium,
                    navTitleTextStyle: Theme.of(context).textTheme.bodyMedium,
                    tabLabelTextStyle: Theme.of(context).textTheme.bodyMedium,
                    actionTextStyle: Theme.of(context).textTheme.bodyMedium,
                    pickerTextStyle: Theme.of(context).textTheme.bodyMedium,
                    textStyle: Theme.of(context).textTheme.bodyMedium,
                    primaryColor: kAppColor,
                  ),
                ),
                child: CupertinoDatePicker(
                  initialDateTime: (initialDateTime ?? DateTime.now()).toLocal(),
                  onDateTimeChanged: (value) => refreshTheView(value.toLocal()),
                  backgroundColor: Theme.of(context).scaffoldBackgroundColor,
                  mode: CupertinoDatePickerMode.date,
                  use24hFormat: true,
                ),
              ),
            ),
          ],
        ),
      ),
    ),
  );
}
