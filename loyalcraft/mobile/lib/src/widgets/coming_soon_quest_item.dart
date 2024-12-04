import 'package:flutter/material.dart';
import 'package:flutter_diktup_utilities/extensions.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-quest-quest.graphql.dart';
import 'package:flutter_loyalcraft_gql/schema.graphql.dart';
import 'package:loyalcraft/localizations_delegate/app_localizations.dart';
import 'package:loyalcraft/src/data/consts.dart';
import 'package:loyalcraft/src/screens/coming_soon.dart';
import 'package:loyalcraft/src/utils/image_cache_manager/shared_image_provider.dart';
import 'package:loyalcraft/src/widgets/qualitative_quantitative.dart';
import 'package:slide_countdown/slide_countdown.dart';

// ignore: must_be_immutable
class ComingSoonQuestItemWidget extends StatelessWidget {
  ComingSoonQuestItemWidget({
    Key? key,
    required this.quest,
  }) : super(key: key);
  Query$getComingSoonQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated$getComingSoonQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated$objects quest;

  Duration _getDuration() => quest.startDate == null ? Duration.zero : quest.startDate!.toLocal().difference(DateTime.now().toLocal());

  String _getImage() {
    if ((quest.media?.pictures ?? []).isNotEmpty) {
      return '${quest.media!.pictures!.first.baseUrl}/${quest.media!.pictures!.first.path}';
    }
    return '';
  }

  @override
  Widget build(BuildContext context) => GestureDetector(
        onTap: () => showGeneralDialog(
          transitionDuration: const Duration(milliseconds: 1),
          barrierDismissible: true,
          barrierColor: Colors.transparent,
          barrierLabel: '',
          context: context,
          pageBuilder: (context, anim1, anim2) => ComingSoonDialog(
            description: translate(context, 'comingSoonDialogQuestItemDescription'),
            subTitle: translate(context, 'comingSoonDialogQuestItemSubtitle'),
            title: translate(context, 'comingSoonDialogQuestItemTitle'),
            onPressed: Navigator.pop,
            onCancel: Navigator.pop,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            SizedBox(
              height: 160.0,
              width: double.infinity,
              child: Stack(
                fit: StackFit.expand,
                clipBehavior: Clip.none,
                children: [
                  _getImage().isEmpty
                      ? Container(
                          height: 160.0,
                          width: double.infinity,
                          padding: const EdgeInsets.all(8.0),
                          alignment: Alignment.center,
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(8.0),
                            color: Theme.of(context).focusColor,
                          ),
                          child: SharedImageProviderWidget(
                            imageUrl: kEmptyPicture,
                            color: Theme.of(context).colorScheme.secondary,
                            width: 80.0,
                            height: 80.0,
                            fit: BoxFit.cover,
                          ),
                        )
                      : SharedImageProviderWidget(
                          imageUrl: _getImage(),
                          backgroundColor: Theme.of(context).focusColor,
                          borderRadius: BorderRadius.circular(8.0),
                          fit: BoxFit.cover,
                          height: 160.0,
                          width: double.infinity,
                        ),
                  if ((quest.remuneration ?? []).isNotEmpty)
                    Positioned(
                      left: 0.0,
                      top: 0.0,
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 4.0, horizontal: 8.0),
                        decoration: const BoxDecoration(
                          color: Colors.black,
                          borderRadius: BorderRadius.only(
                            topLeft: Radius.circular(8.0),
                            topRight: Radius.circular(8.0),
                            bottomRight: Radius.circular(8.0),
                          ),
                        ),
                        child: Wrap(
                          crossAxisAlignment: WrapCrossAlignment.center,
                          runSpacing: 4.0,
                          spacing: 4.0,
                          children: List.generate(
                            quest.remuneration!.length,
                            (index) {
                              var remuneration = quest.remuneration![index];
                              if (quest.remuneration!.first.walletType == Enum$WalletTypeEnum.QUALITATIVE) {
                                remuneration = quest.remuneration!.reversed.toList()[index];
                              }
                              return QualitativeQuantitativeWidget(
                                textStyle: Theme.of(context).textTheme.bodyLarge,
                                walletType: remuneration.walletType ?? Enum$WalletTypeEnum.QUANTITATIVE,
                                baseUrl: remuneration.wallet?.coin?.picture?.baseUrl,
                                path: remuneration.wallet?.coin?.picture?.path,
                                amount: remuneration.amount.toInteger(),
                                size: const Size(18.0, 18.0),
                                textAlign: TextAlign.center,
                              );
                            },
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),
            const SizedBox(height: 8.0),
            Text(
              quest.title ?? '-',
              style: Theme.of(context).textTheme.displayMedium!.copyWith(
                    fontSize: 15.0,
                  ),
            ),
            const SizedBox(height: 4.0),
            Wrap(
              runSpacing: 4.0,
              spacing: 4.0,
              children: [
                Text(
                  translate(context, 'startsIn'),
                  style: Theme.of(context).textTheme.bodyMedium,
                  textAlign: TextAlign.center,
                ),
                SlideCountdown(
                  separatorStyle: Theme.of(context).textTheme.bodyLarge!,
                  style: Theme.of(context).textTheme.bodyLarge!,
                  separatorPadding: EdgeInsets.zero,
                  decoration: const BoxDecoration(),
                  duration: _getDuration(),
                  padding: EdgeInsets.zero,
                  separator: ' : ',
                ),
              ],
            ),
          ],
        ),
      );
}
