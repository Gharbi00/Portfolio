import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_loyalcraft_gql/graphql/point-of-sale.graphql.dart';
import 'package:loyalcraft/src/data/consts.dart';
import 'package:loyalcraft/src/models/dial_code.dart';

class AppUtils {
  AppUtils();
  UniqueKey uniqueKey = UniqueKey();

  static String getPosCurrency(Query$pointOfSale$pointOfSale? pos) => '€';

  static Future<void> initDialCodeList() async {
    var string = await rootBundle.loadString('countries/dial_codes.json');
    final List<dynamic> jsonList = jsonDecode(string);
    kDialCodeList = jsonList.map((jsonItem) => DialCode.fromJson(jsonItem as Map<String, dynamic>)).toList();
  }
}
