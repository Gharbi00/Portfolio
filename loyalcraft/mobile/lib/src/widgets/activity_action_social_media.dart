import 'package:flutter/material.dart';
import 'package:flutter_diktup_social_media/enums.dart';
import 'package:flutter_diktup_social_media/flutter_diktup_social_media.dart';
import 'package:flutter_diktup_utilities/extensions.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-quest-activity.graphql.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-quest-quest.graphql.dart';
import 'package:flutter_loyalcraft_gql/schema.graphql.dart';
import 'package:loyalcraft/localizations_delegate/app_localizations.dart';
import 'package:loyalcraft/src/bloc/variable.dart';
import 'package:loyalcraft/src/data/consts.dart';
import 'package:loyalcraft/src/data/enums.dart';
import 'package:loyalcraft/src/data/flutter_messenger.dart';
import 'package:loyalcraft/src/utils/image_cache_manager/shared_image_provider.dart';
import 'package:webview_flutter/webview_flutter.dart';

// ignore: must_be_immutable
class ActivityActionSocialMediaWidget extends StatelessWidget {
  ActivityActionSocialMediaWidget({
    Key? key,
    required this.action,
    required this.valueChanged,
    required this.questActivity,
    required this.isLoadingCubit,
    required this.socialMedia,
    required this.quest,
  }) : super(key: key);
  Query$getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated$getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated$objects quest;
  Query$getQuestActivitiesByQuest$getQuestActivitiesByQuest$activity$action$definition$socialMedia socialMedia;
  ValueChanged<bool> valueChanged;
  Query$getQuestActivitiesByQuest$getQuestActivitiesByQuest$activity$action action;
  Query$getQuestActivitiesByQuest$getQuestActivitiesByQuest questActivity;
  VariableCubit isLoadingCubit;
  @override
  Widget build(BuildContext context) => Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            padding: const EdgeInsets.all(16.0),
            decoration: BoxDecoration(
              color: Theme.of(context).focusColor,
              borderRadius: BorderRadius.circular(8.0),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  questActivity.title ?? translate(context, 'noDataFound'),
                  style: Theme.of(context).textTheme.bodyLarge,
                ),
                if (questActivity.description.removeNull().isNotEmpty)
                  Padding(
                    padding: const EdgeInsets.only(top: 16.0),
                    child: Text(
                      questActivity.description ?? '',
                      style: Theme.of(context).textTheme.bodyMedium,
                      overflow: TextOverflow.ellipsis,
                      softWrap: false,
                      maxLines: 2,
                    ),
                  ),
              ],
            ),
          ),
          if ((Uri.tryParse(socialMedia.url ?? '')?.isAbsolute ?? false) == true) const SizedBox(height: 16.0),
          if ((Uri.tryParse(socialMedia.url ?? '')?.isAbsolute ?? false) == true)
            Container(
              width: double.infinity,
              height: kAppSize.width,
              decoration: BoxDecoration(
                color: Theme.of(context).focusColor,
                border: Border.all(
                  color: Theme.of(context).focusColor,
                ),
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(8.0),
                child: WebViewWidget(
                  controller: WebViewController()..loadRequest(Uri.parse(socialMedia.url ?? '')).then((_) {}),
                ),
              ),
            ),
          if (isLoadingCubit.state == false && (quest.isAccountLinked ?? false))
            Padding(
              padding: const EdgeInsets.only(top: 16.0),
              child: TextButton(
                style: TextButton.styleFrom(
                  minimumSize: const Size.fromHeight(40.0),
                  backgroundColor: Colors.blue[800],
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8.0),
                  ),
                ),
                onPressed: () async {
                  if (socialMedia.action == Enum$SocialActionEnum.SHARE) {
                    if ((socialMedia.socialMedia?.code ?? '').toLowerCase() == CustomSocialMediaCode.fb.name) {
                      if (socialMedia.socialContent == Enum$SocialContentTypeEnum.POST) {
                        final result = await FlutterDiktupSocialMedia.shareLinkToFacebookFeed(
                          //   appID: kFacebookAppID,
                          link: socialMedia.url ?? '',
                          hashtag: socialMedia.hashtag ?? '',
                        );
                        if (result == SocialShareStatus.success) {
                          valueChanged(true);
                        } else {
                          FlutterMessenger.showSnackbar(context: context, string: translate(context, 'facebookShareCancel'));
                        }
                      }
                    }
                  }
                },
                child: Wrap(
                  crossAxisAlignment: WrapCrossAlignment.center,
                  runSpacing: 4.0,
                  spacing: 4.0,
                  children: [
                    SharedImageProviderWidget(
                      imageUrl: kFacebook,
                      color: Colors.white,
                      fit: BoxFit.cover,
                      height: 18.0,
                      width: 18.0,
                    ),
                    Text(
                      translate(context, 'shareOnFacebook'),
                      textAlign: TextAlign.center,
                      style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                            color: Colors.white,
                          ),
                    ),
                  ],
                ),
              ),
            ),
        ],
      );
}
