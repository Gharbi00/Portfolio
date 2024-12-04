import 'dart:io';

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

void showPickImageSheet({
  required ValueChanged<void>? deleteRefreshTheView,
  required ValueChanged<File> refreshTheView,
  required BuildContext context,
}) {
  showModalBottomSheet(
    backgroundColor: Colors.transparent,
    isScrollControlled: true,
    context: context,
    builder: (builder) => StatefulBuilder(
      builder: (buildContext, setState) => Container(
        padding: const EdgeInsets.all(16.0),
        width: double.infinity,
        decoration: BoxDecoration(
          color: Theme.of(context).scaffoldBackgroundColor,
          borderRadius: const BorderRadius.only(
            topRight: Radius.circular(8.0),
            topLeft: Radius.circular(8.0),
          ),
        ),
        child: SafeArea(
          left: false,
          right: false,
          top: false,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Center(
                child: Container(
                  height: 6.0,
                  width: 80.0,
                  decoration: BoxDecoration(
                    color: Theme.of(context).focusColor.withOpacity(1.0),
                    borderRadius: BorderRadius.circular(100.0),
                  ),
                ),
              ),
              const SizedBox(height: 16.0),
              GestureDetector(
                onTap: () async {
                  var xFile = await ImagePicker().pickImage(source: ImageSource.camera).catchError((onError) {
                    debugPrint('Should display permission denied.');
                    return null;
                  });
                  if (xFile != null) {
                    refreshTheView(File(xFile.path));
                    Navigator.pop(context);
                  }
                },
                child: Row(
                  children: [
                    Container(
                      height: 40.0,
                      width: 40.0,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(100.0),
                        color: Theme.of(context).focusColor,
                      ),
                      child: Icon(
                        CupertinoIcons.camera_fill,
                        color: Theme.of(context).colorScheme.secondary,
                        size: 18.0,
                      ),
                    ),
                    const SizedBox(width: 8.0),
                    Expanded(
                      child: Text(
                        'Camera',
                        style: Theme.of(context).textTheme.bodyLarge,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16.0),
              GestureDetector(
                onTap: () async {
                  var xFile = await ImagePicker().pickImage(source: ImageSource.gallery).catchError((onError) {
                    debugPrint('Should display permission denied.');
                    return null;
                  });
                  if (xFile != null) {
                    refreshTheView(File(xFile.path));
                    Navigator.pop(context);
                  }
                },
                child: Row(
                  children: [
                    Container(
                      height: 40.0,
                      width: 40.0,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(100.0),
                        color: Theme.of(context).focusColor,
                      ),
                      child: Icon(
                        CupertinoIcons.photo_fill,
                        color: Theme.of(context).colorScheme.secondary,
                        size: 18.0,
                      ),
                    ),
                    const SizedBox(width: 8.0),
                    Expanded(
                      child: Text(
                        'Photos',
                        style: Theme.of(context).textTheme.bodyLarge,
                      ),
                    ),
                  ],
                ),
              ),
              if (deleteRefreshTheView != null)
                Padding(
                  padding: const EdgeInsets.only(top: 16.0),
                  child: GestureDetector(
                    onTap: () {
                      Navigator.pop(context);
                      deleteRefreshTheView(() {});
                    },
                    child: Row(
                      children: [
                        Container(
                          height: 40.0,
                          width: 40.0,
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(100.0),
                            color: Theme.of(context).focusColor,
                          ),
                          child: Icon(
                            CupertinoIcons.trash_fill,
                            color: Theme.of(context).colorScheme.secondary,
                            size: 18.0,
                          ),
                        ),
                        const SizedBox(width: 8.0),
                        Expanded(
                          child: Text(
                            'Delete',
                            style: Theme.of(context).textTheme.bodyLarge,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    ),
  );
}
