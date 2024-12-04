import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_diktup_utilities/extensions.dart';
import 'package:loyalcraft/src/data/consts.dart';
import 'package:loyalcraft/src/screens/notifications.dart';
import 'package:loyalcraft/src/utils/image_cache_manager/shared_image_provider.dart';

class FlutterMessenger {
  FlutterMessenger();
  UniqueKey uniqueKey = UniqueKey();

  static void showSnackbar({required BuildContext context, required String string, Color? backgroundColor}) {
    final snackBar = SnackBar(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8.0),
      ),
      content: Text(
        string,
        style: const TextStyle(
          color: Colors.white,
          fontSize: 14.0,
        ),
      ),
      behavior: SnackBarBehavior.floating,
      backgroundColor: backgroundColor ?? Colors.grey[800],
    );
    ScaffoldMessenger.of(context).showSnackBar(snackBar);
  }

  static void showToast({required BuildContext context, required String string, Color? backgroundColor}) {
    final overlay = Overlay.of(context);
    final overlayEntry = OverlayEntry(
      builder: (context) => Center(
        child: Material(
          borderOnForeground: false,
          color: backgroundColor ?? Colors.grey[800],
          shadowColor: Colors.transparent,
          type: MaterialType.card,
          surfaceTintColor: Colors.transparent,
          elevation: 1.0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8.0),
          ),
          child: Container(
            padding: const EdgeInsets.all(16.0),
            decoration: BoxDecoration(
              color: backgroundColor ?? Colors.grey[800],
              borderRadius: BorderRadius.circular(8.0),
            ),
            child: Text(
              string,
              textAlign: TextAlign.center,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 14.0,
              ),
            ),
          ),
        ),
      ),
    );

    overlay.insert(overlayEntry);
    Future.delayed(const Duration(seconds: 2), overlayEntry.remove);
  }

  static void showInAppNotification({required String imageUrl, required String title, required String description, required Locale locale}) {
    if (kBuildContext != null) {
      final snackBar = SnackBar(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8.0)),
        behavior: SnackBarBehavior.floating,
        backgroundColor: Colors.grey[800],
        duration: const Duration(seconds: 5),
        clipBehavior: Clip.none,
        padding: const EdgeInsets.all(16.0),
        margin: EdgeInsets.only(bottom: kAppSize.height * 0.7, left: 16.0, right: 16.0, top: 16.0),
        content: GestureDetector(
          onTap: () => Navigator.push(
            kBuildContext!,
            MaterialPageRoute(
              builder: (context) => const NotificationsWidget(),
            ),
          ),
          child: Row(
            children: [
              SharedImageProviderWidget(
                imageUrl: imageUrl,
                backgroundColor: Colors.grey[800],
                borderRadius: BorderRadius.circular(100.0),
                fit: BoxFit.cover,
                height: 40.0,
                width: 40.0,
              ),
              const SizedBox(width: 8.0),
              Expanded(
                child: RichText(
                  text: TextSpan(
                    children: [
                      TextSpan(
                        text: title,
                        style: const TextStyle(
                          fontWeight: FontWeight.w700,
                          color: Colors.white,
                          fontSize: 15.0,
                        ),
                      ),
                      TextSpan(
                        text: ' $description ',
                        style: TextStyle(
                          fontWeight: FontWeight.w600,
                          color: Colors.white.withOpacity(0.5),
                          fontSize: 14.0,
                        ),
                      ),
                      TextSpan(
                        text: DateTime.now().toTimeAgo(locale),
                        style: const TextStyle(
                          fontWeight: FontWeight.w500,
                          color: Colors.white,
                          fontSize: 14.0,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      );
      HapticFeedback.heavyImpact();
      ScaffoldMessenger.of(kBuildContext!).showSnackBar(snackBar);
    }
  }
}
