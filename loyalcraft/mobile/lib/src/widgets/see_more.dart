import 'package:flutter/material.dart';
import 'package:loyalcraft/localizations_delegate/app_localizations.dart';

// ignore: must_be_immutable
class SeeMoreWidget extends StatelessWidget {
  SeeMoreWidget({
    Key? key,
    required this.isLoading,
    required this.onTap,
  }) : super(key: key);
  void Function()? onTap;
  bool isLoading;

  @override
  Widget build(BuildContext context) => Center(
        child: GestureDetector(
          onTap: isLoading ? null : onTap,
          child: Container(
            padding: const EdgeInsets.symmetric(vertical: 4.0, horizontal: 8.0),
            margin: const EdgeInsets.only(top: 16.0),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(8.0),
              border: Border.all(
                color: isLoading ? Theme.of(context).colorScheme.secondary.withOpacity(0.6) : Theme.of(context).colorScheme.secondary,
              ),
            ),
            child: Text(
              translate(context, 'seeMore'),
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyMedium!.copyWith(
                    color: isLoading == true ? Theme.of(context).colorScheme.secondary.withOpacity(0.6) : Theme.of(context).colorScheme.secondary,
                  ),
            ),
          ),
        ),
      );
}
