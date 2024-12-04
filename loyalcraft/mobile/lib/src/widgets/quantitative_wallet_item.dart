import 'package:flutter/material.dart';
import 'package:flutter_diktup_utilities/extensions.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-wallet-wallet.graphql.dart';
import 'package:flutter_loyalcraft_gql/schema.graphql.dart';
import 'package:loyalcraft/localizations_delegate/app_localizations.dart';
import 'package:loyalcraft/src/widgets/qualitative_quantitative.dart';

// ignore: must_be_immutable
class QuantitativeWalletWidget extends StatelessWidget {
  QuantitativeWalletWidget({
    Key? key,
    required this.wallet,
  }) : super(key: key);
  Query$getCurrentUserQuantitativeWallets$getCurrentUserQuantitativeWallets$objects wallet;
  @override
  Widget build(BuildContext context) => Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          RichText(
            text: TextSpan(
              children: [
                TextSpan(
                  text: translate(context, 'balance'),
                  style: Theme.of(context).textTheme.bodyLarge,
                ),
                if ((wallet.coin?.name ?? '').isNotEmpty)
                  TextSpan(
                    text: ' ( ${wallet.coin!.name} )',
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
              ],
            ),
          ),
          const SizedBox(height: 16.0),
          QualitativeQuantitativeWidget(
            textStyle: Theme.of(context).textTheme.displayMedium!.copyWith(fontSize: 30.0),
            walletType: Enum$WalletTypeEnum.QUANTITATIVE,
            baseUrl: wallet.coin?.picture?.baseUrl,
            path: wallet.coin?.picture?.path,
            amount: wallet.amount!.toInteger(),
            size: const Size(26.0, 26.0),
            textAlign: TextAlign.center,
          ),
        ],
      );
}
