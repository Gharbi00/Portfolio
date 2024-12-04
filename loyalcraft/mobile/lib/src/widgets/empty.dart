import 'package:flutter/material.dart';

// ignore: must_be_immutable
class EmptyWidget extends StatelessWidget {
  EmptyWidget({
    Key? key,
    required this.description,
    required this.padding,
    required this.title,
    required this.iconData,
  }) : super(key: key);

  EdgeInsetsGeometry padding;
  String description;
  IconData iconData;
  String title;

  @override
  Widget build(BuildContext context) => Center(
        child: Padding(
          padding: padding,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                height: 80.0,
                width: 80.0,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(100.0),
                  color: Theme.of(context).focusColor,
                ),
                child: Icon(
                  iconData,
                  color: Theme.of(context).colorScheme.secondary,
                  size: 40.0,
                ),
              ),
              const SizedBox(height: 8.0),
              Text(
                title,
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.displayMedium!.copyWith(
                      fontSize: 22.0,
                    ),
              ),
              const SizedBox(height: 8.0),
              Text(
                description,
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyMedium!.copyWith(
                      color: Theme.of(context).colorScheme.secondary.withOpacity(0.8),
                    ),
              ),
            ],
          ),
        ),
      );
}
