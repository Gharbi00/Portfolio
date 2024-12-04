import 'package:flutter/material.dart';
import 'package:loyalcraft/localizations_delegate/app_localizations.dart';

// ignore: must_be_immutable
class InitialThresholdWidget extends StatelessWidget {
  InitialThresholdWidget({
    required this.refreshTheView,
    Key? key,
  }) : super(key: key);
  ValueChanged<void> refreshTheView;

  @override
  Widget build(BuildContext context) => GestureDetector(
        onTap: () => refreshTheView(() {}),
        child: Container(
          padding: const EdgeInsets.all(16.0),
          decoration: BoxDecoration(
            color: Theme.of(context).focusColor,
            borderRadius: BorderRadius.circular(8.0),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                translate(context, 'unlimitedTime'),
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.displayMedium!.copyWith(
                      fontSize: 20.0,
                    ),
              ),
              const SizedBox(height: 16.0),
              Text(
                translate(context, 'noRewardOffers'),
                style: Theme.of(context).textTheme.bodyLarge,
              ),
              const SizedBox(height: 16.0),
              Container(
                padding: const EdgeInsets.all(8.0),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(8.0),
                  color: Colors.black,
                ),
                child: Text(
                  translate(context, 'start'),
                  style: Theme.of(context).textTheme.bodyMedium!.copyWith(
                        color: Colors.white,
                      ),
                ),
              ),
            ],
          ),
        ),
      );
}
