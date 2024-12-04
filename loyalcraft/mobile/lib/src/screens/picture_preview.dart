import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:loyalcraft/src/utils/image_cache_manager/shared_image_provider.dart';

// ignore: must_be_immutable
class PicturePreviewDialog extends StatelessWidget {
  PicturePreviewDialog({
    Key? key,
    required this.url,
  }) : super(key: key);
  Matrix4 matrix = Matrix4.identity();
  String url;

  @override
  Widget build(BuildContext context) => Dismissible(
        onDismissed: (_) => Navigator.of(context).pop(),
        direction: DismissDirection.down,
        key: UniqueKey(),
        child: AnnotatedRegion<SystemUiOverlayStyle>(
          value: SystemUiOverlayStyle.light,
          child: Scaffold(
            backgroundColor: Colors.black,
            extendBodyBehindAppBar: true,
            extendBody: true,
            body: SafeArea(
              child: Center(
                child: Padding(
                  padding: const EdgeInsets.all(2.0),
                  child: url.endsWith('.svg')
                      ? SharedImageProviderWidget(
                          imageUrl: url,
                          fit: BoxFit.contain,
                          height: double.infinity,
                          width: double.infinity,
                        )
                      : CachedNetworkImage(
                          imageUrl: url,
                          height: double.infinity,
                          width: double.infinity,
                          fit: BoxFit.contain,
                        ),
                ),
              ),
            ),
          ),
        ),
      );
}
