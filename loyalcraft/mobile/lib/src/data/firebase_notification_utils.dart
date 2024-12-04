import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:flutter_diktup_utilities/extensions.dart';
import 'package:flutter_loyalcraft_gql/graphql/user.graphql.dart';
import 'package:flutter_loyalcraft_gql/schema.graphql.dart';
import 'package:loyalcraft/src/data/consts.dart';
import 'package:loyalcraft/src/data/flutter_messenger.dart';
import 'package:loyalcraft/src/data/shared_preferences.dart';
import 'package:loyalcraft/src/repository/user.dart';
import 'package:loyalcraft/src/screens/notifications.dart';

final FirebaseMessaging _firebaseMessaging = FirebaseMessaging.instance;

Future<void> initializeFCMToken({required UserRepository userRepository}) async {
  final fcmToken = await _firebaseMessaging.getToken() ?? '';
  var oldVapIdKey = await userRepository.getVapidKey();
  if (oldVapIdKey != fcmToken) {
    await userRepository.updateVapidKey(
      Variables$Mutation$updateVapidKey(
        input: Input$VapidKeyInput(
          vapidKey: fcmToken,
          userId: kUserID,
        ),
      ),
    );
  }
}

Future<void> requestFCMNotificationPermissions() async {
  var settings = await _firebaseMessaging.requestPermission();
  debugPrint(settings.authorizationStatus.name);
}

Future<void> listenToForegroundNotification() async {
  final locale = await getLocaleFromSP();

  FirebaseMessaging.onMessage.listen((message) {
    if (message.notification != null) {
      FlutterMessenger.showInAppNotification(
        title: message.notification!.title.removeNull(),
        description: message.notification!.body.removeNull(),
        imageUrl: kAppIcon,
        locale: locale,
      );
    }
  });
}

Future<void> listenToBackgroundNotification() async {
  FirebaseMessaging.onBackgroundMessage((handler) => Future.value());
}

Future<void> setupInteractedMessage() async {
  var initialMessage = await FirebaseMessaging.instance.getInitialMessage();

  if (initialMessage != null) {
    _handleMessage(initialMessage);
  }

  FirebaseMessaging.onMessageOpenedApp.listen(_handleMessage);
}

void _handleMessage(RemoteMessage message) {
  if (message.data['type'] == 'chat' && kBuildContext != null) {
    Navigator.push(kBuildContext!, MaterialPageRoute(builder: (context) => const NotificationsWidget()));
  }
}

Future<void> subscribeToTopics() async {
  await FirebaseMessaging.instance.subscribeToTopic(kPosID);
}
