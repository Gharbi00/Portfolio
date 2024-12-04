import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:loyalcraft/localizations_delegate/app_localizations.dart';
import 'package:loyalcraft/src/data/consts.dart';
import 'package:loyalcraft/src/utils/image_cache_manager/shared_image_provider.dart';
import 'package:loyalcraft/src/widgets/flash_animation.dart';
import 'package:qr_code_dart_scan/qr_code_dart_scan.dart';

// ignore: must_be_immutable
class ScanQrCodeWidget extends StatelessWidget {
  ScanQrCodeWidget({
    Key? key,
    required this.refreshTheView,
  }) : super(key: key);

  ValueChanged<String> refreshTheView;

  @override
  Widget build(BuildContext context) {
    var _isRtl = Directionality.of(context) == TextDirection.rtl;
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle.light,
      child: Dismissible(
        onDismissed: (_) => Navigator.pop(context),
        direction: DismissDirection.down,
        key: UniqueKey(),
        child: Scaffold(
          backgroundColor: Colors.black,
          extendBodyBehindAppBar: true,
          extendBody: true,
          body: Stack(
            children: [
              Positioned.fill(
                child: Builder(
                  builder: (builderContext) => QRCodeDartScanView(
                    onCapture: (value) async {
                      refreshTheView(value.text);
                      Navigator.pop(context);
                    },
                  ),
                ),
              ),
              SafeArea(
                child: Align(
                  alignment: Alignment.topRight,
                  child: GestureDetector(
                    onTap: () => Navigator.of(context).pop(),
                    child: Container(
                      margin: const EdgeInsets.all(16.0),
                      height: 30.0,
                      width: 30.0,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(100.0),
                        color: Colors.grey[900],
                      ),
                      child: const Icon(
                        CupertinoIcons.clear,
                        color: Colors.white,
                        size: 18.0,
                      ),
                    ),
                  ),
                ),
              ),
              SafeArea(
                child: Center(
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          translate(context, 'scanQrCodeText1'),
                          textAlign: TextAlign.center,
                          style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                                color: Colors.white,
                              ),
                        ),
                        const SizedBox(height: 16.0),
                        FlashAnimation(
                          duration: const Duration(seconds: 4),
                          infinite: true,
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceAround,
                            children: [
                              SharedImageProviderWidget(
                                imageUrl: _isRtl ? kCornerTopRight : kCornerTopLeft,
                                fit: BoxFit.cover,
                                color: Colors.white,
                                height: 40.0,
                                width: 40.0,
                              ),
                              SizedBox(width: kAppSize.width / 2.0),
                              SharedImageProviderWidget(
                                imageUrl: _isRtl ? kCornerTopLeft : kCornerTopRight,
                                fit: BoxFit.cover,
                                color: Colors.white,
                                height: 40.0,
                                width: 40.0,
                              ),
                            ],
                          ),
                        ),
                        SizedBox(
                          height: kAppSize.width / 2.0,
                        ),
                        FlashAnimation(
                          duration: const Duration(seconds: 4),
                          infinite: true,
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceAround,
                            children: [
                              SharedImageProviderWidget(
                                imageUrl: _isRtl ? kCornerBottomRight : kCornerBottomLeft,
                                fit: BoxFit.cover,
                                color: Colors.white,
                                height: 40.0,
                                width: 40.0,
                              ),
                              SizedBox(width: kAppSize.width / 2.0),
                              SharedImageProviderWidget(
                                imageUrl: _isRtl ? kCornerBottomLeft : kCornerBottomRight,
                                fit: BoxFit.cover,
                                color: Colors.white,
                                height: 40.0,
                                width: 40.0,
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
