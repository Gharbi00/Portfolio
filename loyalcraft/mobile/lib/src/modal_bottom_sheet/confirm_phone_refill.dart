import 'package:flutter/material.dart';
import 'package:flutter_diktup_utilities/extensions.dart';
import 'package:loyalcraft/localizations_delegate/app_localizations.dart';
import 'package:loyalcraft/src/data/consts.dart';
import 'package:loyalcraft/src/models/commun_class.dart';
import 'package:loyalcraft/src/models/dial_code.dart';
import 'package:loyalcraft/src/utils/image_cache_manager/shared_image_provider.dart';

Future<void> showConfirmPhoneRefillSheet({
  required ValueChanged<void> refreshTheView,
  required CommunClass operator,
  required BuildContext context,
  required String phoneNumber,
  required double amount,
  required DialCode dialCode,
}) =>
    showModalBottomSheet(
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      context: context,
      builder: (builder) => DraggableScrollableSheet(
        initialChildSize: 0.6,
        maxChildSize: 0.9,
        minChildSize: 0.6,
        expand: false,
        builder: (context, scrollController) => StatefulBuilder(
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
            child: ListView(
              controller: scrollController,
              shrinkWrap: true,
              primary: false,
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
                Text(
                  translate(context, 'confirmPhoneRefillSheetText1'),
                  style: Theme.of(context).textTheme.displayMedium,
                ),
                const SizedBox(height: 16.0),
                Text(
                  translate(context, 'confirmPhoneRefillSheetText2'),
                  style: Theme.of(context).textTheme.bodySmall,
                ),
                const SizedBox(height: 16.0),
                Text(
                  translate(context, 'amount'),
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
                const SizedBox(height: 16.0),
                Text(
                  amount.toString().formatToPrice('fr_tn', translate(context, 'TND'), 3),
                  style: Theme.of(context).textTheme.displayMedium!.copyWith(
                        fontSize: 18.0,
                      ),
                ),
                const SizedBox(height: 16.0),
                Text(
                  translate(context, 'phoneNumber'),
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
                const SizedBox(height: 16.0),
                Text(
                  '${dialCode.dialCode}$phoneNumber',
                  style: Theme.of(context).textTheme.displayMedium!.copyWith(
                        fontSize: 18.0,
                      ),
                ),
                const SizedBox(height: 16.0),
                Text(
                  translate(context, 'operator'),
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
                const SizedBox(height: 16.0),
                Wrap(
                  crossAxisAlignment: WrapCrossAlignment.center,
                  runSpacing: 8.0,
                  spacing: 8.0,
                  children: [
                    SharedImageProviderWidget(
                      imageUrl: operator.image.removeNull(),
                      color: Theme.of(context).colorScheme.secondary,
                      backgroundColor: Theme.of(context).focusColor,
                      borderRadius: BorderRadius.circular(4.0),
                      fit: BoxFit.cover,
                      height: 40.0,
                      width: 40.0,
                    ),
                    Text(
                      operator.title,
                      style: Theme.of(context).textTheme.displayMedium!.copyWith(
                            fontSize: 18.0,
                          ),
                    ),
                  ],
                ),
                const SizedBox(height: 16.0),
                TextButton(
                  style: TextButton.styleFrom(
                    disabledBackgroundColor: kAppColor.withOpacity(0.6),
                    minimumSize: const Size.fromHeight(40.0),
                    backgroundColor: kAppColor,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8.0),
                    ),
                  ),
                  onPressed: () async {
                    Navigator.pop(context);
                    refreshTheView(() {});
                  },
                  child: Text(
                    translate(context, 'save'),
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                          color: Colors.white,
                        ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
