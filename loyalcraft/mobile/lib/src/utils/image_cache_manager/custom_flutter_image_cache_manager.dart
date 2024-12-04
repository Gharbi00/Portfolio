import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:http/http.dart' as http;
import 'package:path/path.dart' as path;
import 'package:path_provider/path_provider.dart';

class CustomFlutterImageCacheManager {
  CustomFlutterImageCacheManager(this.uniqueKey);
  final UniqueKey uniqueKey;

  // Get the local file path for caching
  static Future<File?> _getLocalFile(String fileName) async {
    Directory? directory;
    try {
      directory = await getApplicationDocumentsDirectory();
      return File('${directory.path}/$fileName');
    } on Exception {
      return null;
    }
  }

  // Cache an image from the network or a local file path
  static Future<File?> cacheImageFromNetworkAndLocal(String urlOrPath) async {
    final fileName = path.basename(urlOrPath);
    final file = await _getLocalFile(fileName);
    if (file == null) {
      return null;
    }
    final exists = file.existsSync();

    // If the file already exists in local storage, return it
    if (exists) {
      return file;
    }

    // Determine if the URL or Path is a network URL or a local file path
    if (urlOrPath.startsWith('http') || urlOrPath.startsWith('https')) {
      // It's a network image
      final response = await http.get(Uri.parse(urlOrPath));
      if (response.statusCode == 200) {
        await file.writeAsBytes(response.bodyBytes);
      }
    } else if (urlOrPath.startsWith('img/')) {
      // It's an asset path
      final byteData = await rootBundle.load(urlOrPath);
      await file.writeAsBytes(byteData.buffer.asUint8List());
    } else {
      // It's a local file path
      final localFile = File(urlOrPath);
      if (localFile.existsSync()) {
        await file.writeAsBytes(localFile.readAsBytesSync());
      }
    }

    // Return the newly cached file
    return file;
  }

  // Cache a video from the network and save it locally
  static Future<File?> cacheVideoFromNetwork(String url) async {
    final fileName = path.basename(url);
    final file = await _getLocalFile(fileName);
    if (file == null) {
      return null;
    }
    final exists = file.existsSync();

    // If the video file already exists, return it
    if (exists) {
      return file;
    }

    // Download the video from the network and save it locally
    final response = await http.get(Uri.parse(url));
    if (response.statusCode == 200) {
      await file.writeAsBytes(response.bodyBytes);
      return file;
    }

    return null; // Return null if the video could not be cached
  }

// Clear cache for files older than 7 days
  static Future<void> clearOldCache({Duration? duration}) async {
    final directory = await getApplicationDocumentsDirectory();
    final files = directory.listSync(); // List all files in the cache directory
    final deleteDuration = DateTime.now().toLocal().subtract(duration ?? const Duration(days: 7));
    for (final file in files) {
      if (file is File) {
        final fileStat = file.statSync();
        if (fileStat.modified.isBefore(deleteDuration)) {
          await file.delete();
          // If the file is older than 7 days, delete it
        }
      }
    }
  }
}
