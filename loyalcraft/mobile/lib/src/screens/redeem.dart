import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_diktup_utilities/extensions.dart';
import 'package:loyalcraft/localizations_delegate/app_localizations.dart';
import 'package:loyalcraft/src/data/shared_preferences.dart';
import 'package:loyalcraft/src/utils/theme.dart';
import 'package:loyalcraft/src/widgets/empty.dart';
import 'package:webview_flutter/webview_flutter.dart';

// ignore: must_be_immutable
class RedeemWidget extends StatefulWidget {
  RedeemWidget({
    required this.content,
    Key? key,
  }) : super(key: key);

  String? content;

  @override
  _RedeemWidget createState() => _RedeemWidget();
}

class _RedeemWidget extends State<RedeemWidget> {
  late WebViewController _webViewController;

  Future<void> _initState() async {
    if (widget.content.removeNull().isNotEmpty) {
      _webViewController = WebViewController()..loadHtmlString(widget.content.removeNull()).then((_) {});
      final themeData = await getThemeFromSP();
      final locale = await getLocaleFromSP();
      _webViewController.setBackgroundColor(themeData == ThemeUtils(locale: locale).darkTheme ? Colors.black : Colors.white);
    }
  }

  @override
  void dispose() {
    super.dispose();
  }

  @override
  void initState() {
    super.initState();
    if (mounted) {
      _initState();
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
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
                  translate(context, 'redeem'),
                  style: Theme.of(context).textTheme.headlineSmall,
                ),
              ),
            ],
          ),
        ),
        body: widget.content.removeNull().isEmpty
            ? EmptyWidget(
                description: translate(context, 'emptyRedeemDescription'),
                title: translate(context, 'emptyRedeemTitle'),
                iconData: CupertinoIcons.ticket_fill,
                padding: const EdgeInsets.all(16.0),
              )
            : Padding(
                padding: const EdgeInsets.only(top: 16.0),
                child: WebViewWidget(
                  controller: _webViewController,
                ),
              ),
      );
}
