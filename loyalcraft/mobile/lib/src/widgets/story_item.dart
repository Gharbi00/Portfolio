import 'package:flutter/material.dart';
import 'package:flutter_diktup_utilities/extensions.dart';
import 'package:loyalcraft/localizations_delegate/app_localizations.dart';
import 'package:loyalcraft/src/data/consts.dart';
import 'package:loyalcraft/src/models/commun_class.dart';
import 'package:loyalcraft/src/screens/story_landing.dart';
import 'package:loyalcraft/src/utils/image_cache_manager/shared_image_provider.dart';

// ignore: must_be_immutable
class StoryItemWidget extends StatelessWidget {
  StoryItemWidget({
    Key? key,
    required this.index,
    required this.story,
  }) : super(key: key);
  int index;
  CommunClass story;

  @override
  Widget build(BuildContext context) => GestureDetector(
        onTap: () => showGeneralDialog(
          pageBuilder: (context, anim1, anim2) => StoryLandingWidget(
            index: index,
            story: story,
          ),
          transitionDuration: const Duration(milliseconds: 1),
          barrierColor: Colors.transparent,
          barrierLabel: '',
          context: context,
        ),
        child: SizedBox(
          width: 60.0,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                alignment: Alignment.center,
                height: 60.0,
                width: 60.0,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(100.0),
                  border: Border.all(
                    color: kAppColor,
                    width: 1.5,
                  ),
                ),
                child: Container(
                  margin: const EdgeInsets.all(5.0),
                  alignment: Alignment.center,
                  height: 60.0,
                  width: 60.0,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(100.0),
                    color: Theme.of(context).scaffoldBackgroundColor,
                  ),
                  child: Container(
                    alignment: Alignment.center,
                    height: 60.0,
                    width: 60.0,
                    decoration: BoxDecoration(
                      color: Theme.of(context).focusColor.withOpacity(1.0),
                      borderRadius: BorderRadius.circular(100.0),
                    ),
                    child: SharedImageProviderWidget(
                      imageUrl: story.image.removeNull(),
                      fit: BoxFit.cover,
                      height: 30.0,
                      width: 30.0,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 4.0),
              Text(
                translate(context, story.title.removeNull()),
                style: Theme.of(context).textTheme.bodyLarge,
                overflow: TextOverflow.ellipsis,
                textAlign: TextAlign.center,
                softWrap: false,
                maxLines: 1,
              ),
            ],
          ),
        ),
      );
}
