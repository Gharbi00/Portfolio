import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_diktup_utilities/extensions.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-wallet-transaction.graphql.dart';
import 'package:flutter_loyalcraft_gql/schema.graphql.dart';
import 'package:loyalcraft/localizations_delegate/app_localizations.dart';
import 'package:loyalcraft/src/widgets/qualitative_quantitative.dart';

// ignore: must_be_immutable
class TransactionItemWidget extends StatelessWidget {
  TransactionItemWidget({
    Key? key,
    required this.showQualitative,
    required this.transaction,
    required this.locale,
    required this.userId,
  }) : super(key: key);
  Query$getWalletTransactionsByAffectedPaginated$getWalletTransactionsByAffectedPaginated$objects transaction;
  bool showQualitative;
  Locale locale;
  String userId;

  Color _getColor() => (transaction.debitor?.owner?.user?.id ?? '') == userId ? Colors.red[800]! : Colors.green[800]!;

  IconData _getSignIconData() => (transaction.debitor?.owner?.user?.id ?? '') == userId ? CupertinoIcons.up_arrow : CupertinoIcons.down_arrow;

  String _getSign() => (transaction.debitor?.owner?.user?.id ?? '') == userId && (transaction.receiver?.owner?.user?.id ?? '') != userId ? '- ' : '+ ';

  String _getTransactionTitle(BuildContext context) {
    if (transaction.reason == Enum$TransactionTypeEnum.CONVERSION) {
      return translate(context, 'successfulConversion');
    }
    if (transaction.reason == Enum$TransactionTypeEnum.REDEEM) {
      return translate(context, 'successfulRedeem');
    }
    if (transaction.reason == Enum$TransactionTypeEnum.ORDER_ADDED) {
      return translate(context, 'newOrderPlaced');
    }
    if (transaction.reason == Enum$TransactionTypeEnum.WALLET_TOPUP) {
      return translate(context, 'walletToppedUp');
    }
    if (transaction.reason == Enum$TransactionTypeEnum.MOBILE_ONSITE_ACTIVITY) {
      return translate(context, 'mobileActivityCompleted');
    }
    if (transaction.reason == Enum$TransactionTypeEnum.PHYSICAL_ONSITE_ACTIVITY) {
      return translate(context, 'onsiteActivityCompleted');
    }
    if (transaction.reason == Enum$TransactionTypeEnum.WEB_ONSITE_ACTIVITY) {
      return translate(context, 'webActivityCompleted');
    }
    if (transaction.reason == Enum$TransactionTypeEnum.QUEST_FULFILLED) {
      return translate(context, 'questCompleted');
    }
    if (transaction.reason == Enum$TransactionTypeEnum.REPUTATION_LOST) {
      return translate(context, 'reputationDecreased');
    }
    if (transaction.reason == Enum$TransactionTypeEnum.DEAL_ORDER_ADDED) {
      return translate(context, 'dealOrderPlaced');
    }
    if (transaction.reason == Enum$TransactionTypeEnum.DONATION) {
      return translate(context, 'donationPlaced');
    }
    if (transaction.reason == Enum$TransactionTypeEnum.REFERRAL) {
      return translate(context, 'referral');
    }
    if (transaction.reason == Enum$TransactionTypeEnum.PHONE_RECHARGE) {
      return translate(context, 'phoneRefill');
    }
    if (transaction.reason == Enum$TransactionTypeEnum.WALLET_WITHDRAW) {
      return translate(context, 'balanceWithdraw');
    }
    return translate(context, 'noTransactionAtTheMoment');
  }

  IconData _getIconData() {
    if (transaction.reason == Enum$TransactionTypeEnum.CONVERSION) {
      return CupertinoIcons.arrow_2_circlepath;
    }
    if (transaction.reason == Enum$TransactionTypeEnum.REDEEM) {
      return CupertinoIcons.ticket_fill;
    }
    if (transaction.reason == Enum$TransactionTypeEnum.ORDER_ADDED) {
      return CupertinoIcons.cube_box;
    }
    if (transaction.reason == Enum$TransactionTypeEnum.WALLET_TOPUP) {
      return CupertinoIcons.creditcard_fill;
    }
    if (transaction.reason == Enum$TransactionTypeEnum.MOBILE_ONSITE_ACTIVITY) {
      return CupertinoIcons.device_phone_portrait;
    }
    if (transaction.reason == Enum$TransactionTypeEnum.PHYSICAL_ONSITE_ACTIVITY) {
      return CupertinoIcons.person_fill;
    }
    if (transaction.reason == Enum$TransactionTypeEnum.WEB_ONSITE_ACTIVITY) {
      return CupertinoIcons.device_desktop;
    }
    if (transaction.reason == Enum$TransactionTypeEnum.QUEST_FULFILLED) {
      return CupertinoIcons.play_circle_fill;
    }
    if (transaction.reason == Enum$TransactionTypeEnum.REPUTATION_LOST) {
      return CupertinoIcons.tornado;
    }
    if (transaction.reason == Enum$TransactionTypeEnum.DEAL_ORDER_ADDED) {
      return CupertinoIcons.cube_box_fill;
    }
    if (transaction.reason == Enum$TransactionTypeEnum.DONATION) {
      return CupertinoIcons.gift_fill;
    }
    return CupertinoIcons.question;
  }

  @override
  Widget build(BuildContext context) => Row(
        children: [
          Stack(
            clipBehavior: Clip.none,
            children: [
              Container(
                height: 40.0,
                width: 40.0,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(100.0),
                  color: Theme.of(context).focusColor,
                ),
                child: Icon(
                  _getIconData(),
                  color: Theme.of(context).colorScheme.secondary,
                  size: 18.0,
                ),
              ),
              Positioned(
                top: -4.0,
                right: -4.0,
                child: Container(
                  height: 20.0,
                  width: 20.0,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(100.0),
                    color: _getColor(),
                  ),
                  child: Icon(
                    _getSignIconData(),
                    color: Colors.white,
                    size: 14.0,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(width: 8.0),
          Expanded(
            flex: 2,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  _getTransactionTitle(context),
                  style: Theme.of(context).textTheme.bodyLarge,
                ),
                Text(
                  '${transaction.createdAt.toLocal().toYMEd(locale).convertArabicNumbers()} • ${transaction.createdAt.toLocal().toHm(locale).convertArabicNumbers()}',
                  style: Theme.of(context).textTheme.bodySmall,
                ),
              ],
            ),
          ),
          if (transaction.amount.quantitative.toInteger() != 0)
            QualitativeQuantitativeWidget(
              textStyle: Theme.of(context).textTheme.displayMedium!.copyWith(fontSize: 15.0),
              walletType: Enum$WalletTypeEnum.QUANTITATIVE,
              baseUrl: transaction.debitor?.coin?.picture?.baseUrl,
              beforeAmount: _getSign(),
              path: transaction.debitor?.coin?.picture?.path,
              amount: transaction.amount.quantitative.toInteger(),
              size: const Size(18.0, 18.0),
              textAlign: TextAlign.center,
            ),
          if (showQualitative && transaction.amount.qualitative.toInteger() != 0)
            QualitativeQuantitativeWidget(
              textStyle: Theme.of(context).textTheme.displayMedium!.copyWith(fontSize: 15.0),
              walletType: Enum$WalletTypeEnum.QUALITATIVE,
              beforeAmount: _getSign(),
              amount: transaction.amount.qualitative.toInteger(),
              size: const Size(18.0, 18.0),
              textAlign: TextAlign.center,
            ),
        ],
      );
}
