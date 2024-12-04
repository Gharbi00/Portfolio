import 'package:flutter/material.dart';
import 'package:flutter_diktup_utilities/extensions.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-quest-activity.graphql.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-quest-quest.graphql.dart';
import 'package:flutter_loyalcraft_gql/schema.graphql.dart';
import 'package:loyalcraft/localizations_delegate/app_localizations.dart';
import 'package:loyalcraft/src/widgets/qualitative_quantitative.dart';

// ignore: must_be_immutable
class ThresholdWidget extends StatelessWidget {
  ThresholdWidget({
    required this.threshold,
    required this.index,
    required this.refreshTheView,
    required this.quest,
    Key? key,
  }) : super(key: key);
  Query$getQuestActivitiesByQuest$getQuestActivitiesByQuest$activity$action$definition$game$sliding$threshold? threshold;
  int index;
  Query$getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated$getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated$objects quest;
  ValueChanged<int> refreshTheView;

  Query$getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated$getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated$objects$remuneration$wallet$coin$picture? _getCointPicture() {
    var exist = (quest.remuneration ?? []).where((e) => e.walletType == Enum$WalletTypeEnum.QUANTITATIVE).isNotEmpty;
    if (exist) {
      var picture = (quest.remuneration ?? []).firstWhere((e) => e.walletType == Enum$WalletTypeEnum.QUANTITATIVE).wallet?.coin?.picture;
      return picture;
    }

    return null;
  }

  @override
  Widget build(BuildContext context) => GestureDetector(
        onTap: () => refreshTheView(index),
        child: Container(
          padding: const EdgeInsets.all(16.0),
          decoration: BoxDecoration(
            color: Theme.of(context).focusColor,
            borderRadius: BorderRadius.circular(8.0),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                translate(context, threshold!.timer!.name),
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.displayMedium!.copyWith(
                      fontSize: 20.0,
                    ),
              ),
              const SizedBox(height: 16.0),
              Wrap(
                crossAxisAlignment: WrapCrossAlignment.center,
                runAlignment: WrapAlignment.center,
                alignment: WrapAlignment.center,
                runSpacing: 8.0,
                spacing: 8.0,
                children: List.generate((threshold!.bonus ?? []).length, (index) {
                  var bonus = threshold!.bonus![index];
                  if (threshold!.bonus!.first.walletType == Enum$WalletTypeEnum.QUALITATIVE) {
                    bonus = threshold!.bonus!.reversed.toList()[index];
                  }
                  return Container(
                    padding: const EdgeInsets.all(6.0),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(100.0),
                      border: Border.all(
                        color: Colors.grey[800]!,
                      ),
                    ),
                    child: QualitativeQuantitativeWidget(
                      baseUrl: bonus.walletType != Enum$WalletTypeEnum.QUANTITATIVE ? '' : _getCointPicture()?.baseUrl,
                      path: bonus.walletType != Enum$WalletTypeEnum.QUANTITATIVE ? '' : _getCointPicture()?.path,
                      walletType: bonus.walletType ?? Enum$WalletTypeEnum.QUANTITATIVE,
                      textStyle: Theme.of(context).textTheme.bodyLarge,
                      amount: bonus.amount.toInteger(),
                      beforeAmount: '+',
                      size: const Size(18.0, 18.0),
                      textAlign: TextAlign.center,
                    ),
                  );
                }),
              ),
              const SizedBox(height: 16.0),
              Container(
                padding: const EdgeInsets.all(8.0),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(8.0),
                  color: index.isEven ? Colors.black : Colors.white,
                ),
                child: Text(
                  translate(context, 'start'),
                  style: Theme.of(context).textTheme.bodyMedium!.copyWith(
                        color: index.isEven ? Colors.white : Colors.black,
                      ),
                ),
              ),
            ],
          ),
        ),
      );
}
