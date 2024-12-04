import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:loyalcraft/localizations_delegate/app_localizations.dart';

// ignore: must_be_immutable
class SearchBarWidget extends StatelessWidget {
  SearchBarWidget({
    Key? key,
    required this.onChanged,
    required this.search,
  }) : super(key: key);
  void Function(String)? onChanged;
  String search;

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.symmetric(vertical: 4.0, horizontal: 8.0),
        height: 36.0,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(8.0),
          color: Theme.of(context).focusColor,
        ),
        child: Row(
          children: [
            Icon(
              CupertinoIcons.search,
              color: Theme.of(context).colorScheme.secondary.withOpacity(0.6),
              size: 16.0,
            ),
            const SizedBox(width: 8.0),
            Expanded(
              child: TextField(
                onTapOutside: (value) => FocusManager.instance.primaryFocus?.unfocus,
                cursorColor: Theme.of(context).colorScheme.secondary,
                style: Theme.of(context).textTheme.bodyMedium,
                onChanged: onChanged,
                decoration: InputDecoration(
                  enabledBorder: const UnderlineInputBorder(borderSide: BorderSide.none),
                  focusedBorder: const UnderlineInputBorder(borderSide: BorderSide.none),
                  border: const UnderlineInputBorder(borderSide: BorderSide.none),
                  contentPadding: const EdgeInsets.only(bottom: 12.0),
                  hintStyle: Theme.of(context).textTheme.bodyMedium,
                  hintText: translate(context, search),
                ),
              ),
            ),
          ],
        ),
      );
}
