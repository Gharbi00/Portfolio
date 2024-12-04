import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:loyalcraft/src/models/dial_code.dart';

// ignore: must_be_immutable
class DialCodeItemWidget extends StatelessWidget {
  DialCodeItemWidget({
    required this.currentDialCode,
    required this.valueChanged,
    required this.dialCode,
    Key? key,
  }) : super(key: key);
  ValueChanged<DialCode> valueChanged;
  DialCode? currentDialCode;
  DialCode dialCode;

  @override
  Widget build(BuildContext context) => GestureDetector(
        onTap: () => valueChanged(dialCode),
        child: Row(
          children: [
            Container(
              alignment: Alignment.center,
              height: 30.0,
              width: 30.0,
              decoration: BoxDecoration(
                color: Theme.of(context).focusColor,
                borderRadius: BorderRadius.circular(100.0),
              ),
              child: Text(
                dialCode.flag,
                style: Theme.of(context).textTheme.displayMedium!.copyWith(fontSize: 20.0),
              ),
            ),
            const SizedBox(width: 8.0),
            Expanded(
              child: Text(
                '(${dialCode.dialCode}) ${dialCode.name}',
                style: dialCode == currentDialCode ? Theme.of(context).textTheme.bodyLarge : Theme.of(context).textTheme.bodySmall,
              ),
            ),
            if (dialCode == currentDialCode)
              Container(
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(100.0),
                  color: Colors.green[800],
                ),
                margin: const EdgeInsets.only(left: 8.0),
                height: 20.0,
                width: 20.0,
                child: const Icon(
                  CupertinoIcons.check_mark,
                  color: Colors.white,
                  size: 10.0,
                ),
              ),
          ],
        ),
      );
}
