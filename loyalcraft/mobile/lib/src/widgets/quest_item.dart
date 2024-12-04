import 'package:flutter/material.dart';
import 'package:flutter_diktup_utilities/extensions.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-quest-quest.graphql.dart';
import 'package:flutter_loyalcraft_gql/schema.graphql.dart';
import 'package:loyalcraft/localizations_delegate/app_localizations.dart';
import 'package:loyalcraft/src/data/consts.dart';
import 'package:loyalcraft/src/screens/already_performed_quest.dart';
import 'package:loyalcraft/src/screens/quest_landing.dart';
import 'package:loyalcraft/src/utils/image_cache_manager/shared_image_provider.dart';
import 'package:loyalcraft/src/widgets/qualitative_quantitative.dart';
import 'package:slide_countdown/slide_countdown.dart';

// ignore: must_be_immutable
class QuestItemWidget extends StatelessWidget {
  QuestItemWidget({
    Key? key,
    required this.valueChanged,
    required this.quest,
    this.isTest = false,
  }) : super(key: key);
  Query$getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated$getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated$objects quest;
  ValueChanged<void> valueChanged;
  Duration _getQuestDuration() => quest.dueDate == null ? Duration.zero : quest.dueDate!.toLocal().difference(DateTime.now().toLocal());
  bool isTest;

  String _getImage() {
    if ((quest.media?.pictures ?? []).isNotEmpty) {
      return '${quest.media!.pictures!.first.baseUrl}/${quest.media!.pictures!.first.path}';
    }
    return '';
  }

  @override
  Widget build(BuildContext context) => GestureDetector(
        onTap: () {
          if (quest.performed ?? false) {
            showGeneralDialog(
              pageBuilder: (context, anim1, anim2) => const AlreadyPerformedQuestDialog(),
              transitionDuration: const Duration(milliseconds: 1),
              barrierColor: Colors.transparent,
              barrierLabel: '',
              context: context,
            );
          } else {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => QuestLandingWidget(
                  isTest: isTest,
                  quest: quest,
                ),
              ),
            );
          }
        },
        child: Stack(
          alignment: Alignment.center,
          children: [
            Opacity(
              opacity: (quest.performed ?? false) || ((quest.isAccountLinked ?? false) == false) ? 0.2 : 1.0,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  SizedBox(
                    height: 160.0,
                    width: double.infinity,
                    child: Stack(
                      clipBehavior: Clip.none,
                      fit: StackFit.expand,
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
                                  (quest.remuneration ?? []).length,
                                  (index) {
                                    var remuneration = quest.remuneration![index];
                                    if (quest.remuneration!.first.walletType == Enum$WalletTypeEnum.QUALITATIVE) {
                                      remuneration = quest.remuneration!.reversed.toList()[index];
                                    }
                                    return QualitativeQuantitativeWidget(
                                      textStyle: Theme.of(context).textTheme.bodyLarge!.copyWith(color: Colors.white),
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
                  const SizedBox(height: 4.0),
                  Text(
                    quest.title ?? translate(context, 'noDataFound'),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    softWrap: false,
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
                        translate(context, 'endsIn'),
                        style: Theme.of(context).textTheme.bodyMedium,
                      ),
                      SlideCountdown(
                        separatorStyle: Theme.of(context).textTheme.bodySmall!,
                        style: Theme.of(context).textTheme.bodySmall!,
                        separatorPadding: EdgeInsets.zero,
                        decoration: const BoxDecoration(),
                        duration: _getQuestDuration(),
                        padding: EdgeInsets.zero,
                        separator: ' : ',
                        onDone: () {
                          valueChanged(() {});
                        },
                      ),
                    ],
                  ),
                ],
              ),
            ),
            if (quest.performed ?? false)
              SharedImageProviderWidget(
                imageUrl: kLordIconChecked,
                borderRadius: BorderRadius.zero,
                fit: BoxFit.cover,
                height: 80.0,
                width: 80.0,
              ),
          ],
        ),
      );
}
