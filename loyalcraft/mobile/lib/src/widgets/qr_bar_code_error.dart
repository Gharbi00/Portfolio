import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:loyalcraft/localizations_delegate/app_localizations.dart';

// ignore: must_be_immutable
class QrBarCodeErrorWidget extends StatelessWidget {
  const QrBarCodeErrorWidget({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) => Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            alignment: Alignment.center,
            height: 30.0,
            width: 30.0,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(100.0),
              color: Colors.red[800]!.withOpacity(0.1),
            ),
            child: Icon(
              CupertinoIcons.question,
              color: Colors.red[800],
              size: 16.0,
            ),
          ),
          const SizedBox(height: 4.0),
          Text(
            translate(context, 'barcodeQrcodeError'),
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                  color: Colors.red[800],
                ),
          ),
        ],
      );
}
