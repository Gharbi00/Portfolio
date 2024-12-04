import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:loyalcraft/localizations_delegate/app_localizations.dart';
import 'package:loyalcraft/src/widgets/empty.dart';

// ignore: must_be_immutable
class ErrorDefaultWidget extends StatelessWidget {
  const ErrorDefaultWidget({
    Key? key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) =>
      // MaterialApp(
      //       debugShowCheckedModeBanner: false,
      //       supportedLocales: kLocaleList,
      //       theme: ThemeUtils(locale: kLocaleList.first).lightTheme,
      //       locale: kLocaleList.first,
      //       localizationsDelegates: [
      //         GlobalCupertinoLocalizations.delegate,
      //         GlobalMaterialLocalizations.delegate,
      //         GlobalWidgetsLocalizations.delegate,
      //         AppLocalizations.delegate,
      //       ],
      //       onGenerateRoute: (routeSettings) {
      //         switch (routeSettings.name) {
      //           default:
      //             return MaterialPageRoute(
      //               builder: (_) =>

      Scaffold(
        appBar: AppBar(
          automaticallyImplyLeading: false,
          centerTitle: false,
          elevation: 0,
          title: Row(
            children: [
              GestureDetector(
                onTap: () => Navigator.pop(context),
                child: Container(
                  height: 36.0,
                  width: 36.0,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(100.0),
                    color: Theme.of(context).focusColor,
                  ),
                  child: Icon(
                    CupertinoIcons.arrow_turn_up_left,
                    color: Theme.of(context).colorScheme.secondary,
                    size: 18.0,
                  ),
                ),
              ),
              const SizedBox(width: 8.0),
              Expanded(
                child: Text(
                  translate(context, 'somethingHappended'),
                  style: Theme.of(context).textTheme.headlineSmall,
                ),
              ),
            ],
          ),
        ),
        body: EmptyWidget(
          description: translate(context, 'emptyRedeemDescription'),
          title: translate(context, 'emptyRedeemTitle'),
          iconData: CupertinoIcons.ticket_fill,
          padding: const EdgeInsets.all(16.0),
        ),
        //         ),
        //       );
        //   }
        // },
      );
}
