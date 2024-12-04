import 'package:flutter/material.dart';

class CommunClass {
  CommunClass({
    this.description,
    required this.selected,
    required this.title,
    this.color,
    this.image,
    this.secondImage,
    this.globalKey,
    this.id,
    this.index,
    this.icon1,
    this.video,
    this.icon2,
  });
  String? id;
  String? secondImage;
  String? description;
  String title;
  String? image;
  GlobalKey? globalKey;
  bool selected;
  Color? color;
  int? index;
  String? video;
  IconData? icon1;
  IconData? icon2;
}
