import 'package:flutter/material.dart';
import 'package:loyalcraft/localizations_delegate/app_localizations.dart';
import 'package:loyalcraft/src/data/consts.dart';
import 'package:loyalcraft/src/utils/image_cache_manager/shared_image_provider.dart';

// ignore: must_be_immutable
class SuccessfulDialog extends StatelessWidget {
  SuccessfulDialog({
    Key? key,
    required this.description,
    required this.onPressed,
    required this.onCancel,
    required this.subTitle,
    required this.title,
    this.testString = '',
  }) : super(key: key);

  ValueChanged<BuildContext> onPressed;
  ValueChanged<BuildContext> onCancel;
  String description;
  String subTitle;
  String title;
  String testString;

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
                        imageUrl: kLordIconConfetti,
                        borderRadius: BorderRadius.zero,
                        fit: BoxFit.cover,
                        height: 120.0,
                        width: 120.0,
                      ),
                    ),
                    const SizedBox(height: 4.0),
                    Text(
                      title,
                      style: Theme.of(context).textTheme.displayMedium,
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 4.0),
                    Text(
                      description,
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
                      onPressed: () => onPressed(context),
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
