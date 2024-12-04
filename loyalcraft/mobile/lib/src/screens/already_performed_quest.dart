import 'package:flutter/material.dart';
import 'package:loyalcraft/localizations_delegate/app_localizations.dart';
import 'package:loyalcraft/src/data/consts.dart';
import 'package:loyalcraft/src/utils/image_cache_manager/shared_image_provider.dart';

// ignore: must_be_immutable
class AlreadyPerformedQuestDialog extends StatelessWidget {
  const AlreadyPerformedQuestDialog({
    Key? key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) => Dialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8.0),
        ),
        backgroundColor: Theme.of(context).scaffoldBackgroundColor,
        insetAnimationCurve: Curves.fastOutSlowIn,
        insetPadding: const EdgeInsets.all(16.0),
        elevation: 0,
        child: Container(
          constraints: BoxConstraints(
            minHeight: kAppSize.height / 1.4,
            maxHeight: kAppSize.height / 1.4,
          ),
          decoration: BoxDecoration(
            color: Theme.of(context).scaffoldBackgroundColor,
            borderRadius: BorderRadius.circular(8.0),
            boxShadow: [
              BoxShadow(
                color: Theme.of(context).colorScheme.secondary.withOpacity(0.2),
                spreadRadius: 4.0,
                blurRadius: 4.0,
              ),
            ],
          ),
          child: LayoutBuilder(
            builder: (context, raints) => SingleChildScrollView(
              padding: const EdgeInsets.all(16.0),
              child: ConstrainedBox(
                constraints: BoxConstraints(minHeight: raints.maxHeight),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    Center(
                      child: SharedImageProviderWidget(
                        imageUrl: kLordIconChecked,
                        fit: BoxFit.cover,
                        height: 100.0,
                        width: 100.0,
                      ),
                    ),
                    const SizedBox(height: 4.0),
                    Text(
                      translate(context, 'alreadyPerformedQuestDialogTitle'),
                      style: Theme.of(context).textTheme.displayMedium,
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 4.0),
                    Text(
                      translate(context, 'alreadyPerformedQuestDialogDescription'),
                      style: Theme.of(context).textTheme.bodyMedium,
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 4.0),
                    TextButton(
                      style: TextButton.styleFrom(
                        minimumSize: const Size.fromHeight(40.0),
                        backgroundColor: kAppColor,
                        disabledBackgroundColor: kAppColor.withOpacity(0.6),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8.0),
                        ),
                      ),
                      onPressed: () => Navigator.pop(context),
                      child: Text(
                        translate(context, 'gotIt'),
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
        ),
      );
}
