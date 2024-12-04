import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

class IPUtils {
  IPUtils();
  UniqueKey uniqueKey = UniqueKey();

  static Future<String?> getCountryFromIP() async {
    final response = await http.get(Uri.parse('https://ipinfo.io/${await getPublicIP()}/json'));

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      return data?['country'];
    } else {
      return '';
    }
  }

  static Future<String> getPublicIP() async {
    final response = await http.get(Uri.parse('https://api.ipify.org'));

    if (response.statusCode == 200) {
      return response.body;
    } else {
      return '';
    }
  }
}
