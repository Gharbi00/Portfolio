import 'dart:io';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:loyalcraft/src/screens/picture_preview.dart';
import 'package:loyalcraft/src/utils/image_cache_manager/custom_flutter_image_cache_manager.dart';

// ignore: must_be_immutable
class SharedImageProviderWidget extends StatelessWidget {
  SharedImageProviderWidget({
    Key? key,
    required this.imageUrl,
    required this.height,
    required this.width,
    required this.fit,
    this.enableOnLongPress,
    this.backgroundColor,
    this.borderRadius,
    this.enableOnTap,
    this.color,
  }) : super(key: key);
  BorderRadiusGeometry? borderRadius;
  bool? enableOnLongPress;
  Color? backgroundColor;
  bool? enableOnTap;
  String imageUrl;
  double height;
  double? width;
  Color? color;
  BoxFit fit;

  @override
  Widget build(BuildContext context) => GestureDetector(
        onLongPress: enableOnLongPress == null
            ? null
            : () => showGeneralDialog(
                  transitionDuration: const Duration(milliseconds: 1),
                  barrierColor: Colors.transparent,
                  barrierLabel: '',
                  context: context,
                  pageBuilder: (context, anim1, anim2) => PicturePreviewDialog(
                    url: imageUrl,
                  ),
                ),
        onTap: enableOnTap == null
            ? null
            : () => showGeneralDialog(
                  transitionDuration: const Duration(milliseconds: 1),
                  barrierColor: Colors.transparent,
                  barrierLabel: '',
                  context: context,
                  pageBuilder: (context, anim1, anim2) => PicturePreviewDialog(
                    url: imageUrl,
                  ),
                ),
        child: imageUrl.endsWith('.svg')
            ? FutureBuilder<File?>(
                future: CustomFlutterImageCacheManager.cacheImageFromNetworkAndLocal(imageUrl),
                builder: (context, snapshot) {
                  if (snapshot.hasData && snapshot.data != null && snapshot.data!.isAbsolute && snapshot.data!.existsSync() == true) {
                    return ClipRRect(
                      borderRadius: borderRadius ?? BorderRadius.zero,
                      child: SvgPicture.file(
                        snapshot.data!,
                        colorFilter: color == null ? null : ColorFilter.mode(color!, BlendMode.srcIn),
                        clipBehavior: Clip.none,
                        height: height,
                        width: width,
                        fit: fit,
                      ),
                    );
                  }
                  return Container(
                    height: height,
                    width: width,
                    decoration: BoxDecoration(
                      borderRadius: borderRadius ?? BorderRadius.zero,
                      color: Colors.transparent,
                    ),
                  );
                },
              )
            : ClipRRect(
                borderRadius: borderRadius ?? BorderRadius.zero,
                child: CachedNetworkImage(
                  imageUrl: imageUrl,
                  height: height,
                  width: width,
                  // cacheKey: CustomCacheManager.key,
                  // cacheManager: CustomCacheManager.cacheManager,
                  fit: fit,
                ),
              ),
      );
}
