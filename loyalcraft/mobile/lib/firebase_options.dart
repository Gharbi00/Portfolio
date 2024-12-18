// File generated by FlutterFire CLI.
// ignore_for_file: type=lint
import 'dart:io';

import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;

/// Default [FirebaseOptions] for use with your Firebase apps.
///
/// Example:
/// ```dart
/// import 'firebase_options.dart';
/// // ...
/// await Firebase.initializeApp(
///   options: DefaultFirebaseOptions.currentPlatform,
/// );
/// ```
class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (Platform.isAndroid)
      return android;
    else
      return ios;
  }

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'AIzaSyAIRIEDkBA-HBuXq6iSCeTWAUblzbZbOgQ',
    appId: '1:414853982494:android:53e5620991c991920c010f',
    messagingSenderId: '414853982494',
    projectId: 'loyalcraftapp',
    storageBucket: 'loyalcraftapp.appspot.com',
  );

  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'AIzaSyAHJCkXSRwQxXy-mw2KC7Kr2mLgtIw14sU',
    appId: '1:414853982494:ios:354e5fe2a116ca230c010f',
    messagingSenderId: '414853982494',
    projectId: 'loyalcraftapp',
    storageBucket: 'loyalcraftapp.appspot.com',
    androidClientId: '414853982494-aapkc8qc7ifuf2ujdi790d480mp47hhs.apps.googleusercontent.com',
    iosClientId: '414853982494-1njtgbg62pa3qc7n29j83okjc8cbgmog.apps.googleusercontent.com',
    iosBundleId: 'com.loyalcraft.master',
  );
}
