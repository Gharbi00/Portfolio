import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

// ignore: must_be_immutable
class CircularSeeMoreWidget extends StatelessWidget {
  CircularSeeMoreWidget({
    Key? key,
    required this.isLoading,
    required this.onTap,
  }) : super(key: key);
  bool isLoading;
  void Function()? onTap;

  @override
  Widget build(BuildContext context) => GestureDetector(
        onTap: onTap,
        child: Container(
          margin: const EdgeInsets.only(left: 8.0),
          padding: const EdgeInsets.all(2.0),
          alignment: Alignment.center,
          height: 30.0,
          width: 30.0,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(8.0),
            border: Border.all(
              color: isLoading ? Theme.of(context).colorScheme.secondary.withOpacity(0.6) : Theme.of(context).colorScheme.secondary,
            ),
          ),
          child: Icon(
            CupertinoIcons.ellipsis,
            color: isLoading == true ? Theme.of(context).colorScheme.secondary.withOpacity(0.6) : Theme.of(context).colorScheme.secondary,
            size: 16.0,
          ),
        ),
      );
}
