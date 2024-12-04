import 'package:flutter/material.dart';
import 'package:flutter_diktup_utilities/extensions.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-quest-quest.graphql.dart';
import 'package:flutter_loyalcraft_gql/schema.graphql.dart';
import 'package:flutter_widget_from_html/flutter_widget_from_html.dart';
import 'package:loyalcraft/localizations_delegate/app_localizations.dart';
import 'package:loyalcraft/src/data/consts.dart';
import 'package:loyalcraft/src/data/flutter_messenger.dart';
import 'package:loyalcraft/src/utils/image_cache_manager/shared_image_provider.dart';
import 'package:loyalcraft/src/widgets/qualitative_quantitative.dart';
import 'package:slide_countdown/slide_countdown.dart';

void showQuestInfoSheet({
  required Query$getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated$getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated$objects quest,
  required BuildContext context,
  required bool isTest,
}) {
  Duration _getQuestDuration() => quest.dueDate == null ? Duration.zero : quest.dueDate!.toLocal().difference(DateTime.now().toLocal());
  showModalBottomSheet(
    backgroundColor: Colors.transparent,
    isScrollControlled: true,
    context: context,
    builder: (builder) => DraggableScrollableSheet(
      initialChildSize: 0.6,
      maxChildSize: 0.9,
      minChildSize: 0.6,
      expand: false,
      builder: (context, scrollController) => Container(
        padding: const EdgeInsets.all(16.0),
        width: double.infinity,
        decoration: BoxDecoration(
          color: Theme.of(context).scaffoldBackgroundColor,
          borderRadius: const BorderRadius.only(
            topRight: Radius.circular(8.0),
            topLeft: Radius.circular(8.0),
          ),
        ),
        child: ListView(
          controller: scrollController,
          shrinkWrap: true,
          primary: false,
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
            if (isTest == true)
              Padding(
                padding: const EdgeInsets.only(bottom: 16.0),
                child: Text(
                  translate(context, 'questLandingText1'),
                  style: Theme.of(context).textTheme.bodySmall,
                ),
              ),
            Center(
              child: ((quest.target.pos?.picture?.baseUrl ?? '').isEmpty || (quest.target.pos?.picture?.path ?? '').isEmpty)
                  ? Container(
                      alignment: Alignment.center,
                      width: 100.0,
                      height: 100.0,
                      padding: const EdgeInsets.all(8.0),
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(100.0),
                        color: Theme.of(context).focusColor,
                      ),
                      child: SharedImageProviderWidget(
                        imageUrl: kEmptyPicture,
                        color: Theme.of(context).colorScheme.secondary,
                        width: 100.0,
                        borderRadius: BorderRadius.circular(100.0),
                        height: 100.0,
                        fit: BoxFit.cover,
                      ),
                    )
                  : SharedImageProviderWidget(
                      enableOnTap: true,
                      imageUrl: '${quest.target.pos!.picture!.baseUrl}/${quest.target.pos!.picture!.path}',
                      color: Theme.of(context).colorScheme.secondary,
                      backgroundColor: Theme.of(context).focusColor,
                      borderRadius: BorderRadius.circular(100.0),
                      fit: BoxFit.cover,
                      width: 100.0,
                      height: 100.0,
                    ),
            ),
            const SizedBox(height: 16.0),
            Text(
              quest.target.pos?.title ?? translate(context, 'noDataFound'),
              style: Theme.of(context).textTheme.displayMedium,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16.0),
            Text(
              translate(context, 'endsIn'),
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: 16.0),
            SlideCountdown(
              separatorStyle: Theme.of(context).textTheme.displayMedium!.copyWith(fontSize: 18.0),
              style: Theme.of(context).textTheme.displayMedium!.copyWith(fontSize: 18.0),
              separatorPadding: EdgeInsets.zero,
              decoration: const BoxDecoration(),
              duration: _getQuestDuration(),
              padding: EdgeInsets.zero,
              separator: ' : ',
              onDone: () async {
                FlutterMessenger.showSnackbar(context: context, string: translate(context, translate(context, 'questCountDownDoneText')));
              },
            ),
            const SizedBox(height: 16.0),
            Text(
              translate(context, 'youWillEarn'),
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: 16.0),
            Wrap(
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
                  return Container(
                    padding: const EdgeInsets.symmetric(vertical: 4.0, horizontal: 8.0),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(100.0),
                      color: Theme.of(
                        context,
                      ).focusColor,
                    ),
                    child: QualitativeQuantitativeWidget(
                      walletType: remuneration.wallet?.walletType ?? Enum$WalletTypeEnum.QUALITATIVE,
                      textStyle: Theme.of(context).textTheme.displayMedium!.copyWith(fontSize: 18.0),
                      baseUrl: remuneration.wallet?.coin?.picture?.baseUrl,
                      path: remuneration.wallet?.coin?.picture?.path,
                      amount: remuneration.amount.toInteger(),
                      size: const Size(18.0, 18.0),
                      textAlign: TextAlign.center,
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 16.0),
            Text(
              translate(context, 'title'),
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: 16.0),
            Text(
              quest.title ?? translate(context, 'noDataFound'),
              style: Theme.of(context).textTheme.bodyLarge,
            ),
            const SizedBox(height: 16.0),
            Text(
              translate(context, 'description'),
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: 16.0),
            HtmlWidget(
              quest.description.removeNull(),
            ),
            const SizedBox(height: 16.0),
            TextButton(
              style: TextButton.styleFrom(
                disabledBackgroundColor: kAppColor.withOpacity(0.6),
                minimumSize: const Size.fromHeight(40.0),
                backgroundColor: kAppColor,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8.0),
                ),
              ),
              onPressed: () => Navigator.pop(context),
              child: Text(
                translate(context, 'gotIt'),
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                      color: Colors.white,
                    ),
              ),
            ),
          ],
        ),
      ),
    ),
  );
}
