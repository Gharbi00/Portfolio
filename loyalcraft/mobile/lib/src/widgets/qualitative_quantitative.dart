import 'package:flutter/material.dart';
import 'package:flutter_diktup_utilities/extensions.dart';
import 'package:flutter_loyalcraft_gql/schema.graphql.dart';
import 'package:loyalcraft/src/data/consts.dart';
import 'package:loyalcraft/src/utils/image_cache_manager/shared_image_provider.dart';

// ignore: must_be_immutable
class QualitativeQuantitativeWidget extends StatelessWidget {
  QualitativeQuantitativeWidget({
    required this.amount,
    required this.walletType,
    required this.textAlign,
    required this.textStyle,
    required this.size,
    this.beforeAmount = '',
    this.baseUrl = '',
    this.path = '',
    Key? key,
  }) : super(key: key);
  int? amount;
  Enum$WalletTypeEnum walletType;
  Size size;
  TextStyle? textStyle;
  TextAlign textAlign;
  String? baseUrl;
  String? path;
  String? beforeAmount;

  Widget _getCoinPictureWidget() {
    if (walletType == Enum$WalletTypeEnum.QUANTITATIVE) {
      if (baseUrl.removeNull().isNotEmpty && path.removeNull().isNotEmpty) {
        return SharedImageProviderWidget(
          imageUrl: '$baseUrl/$path',
          borderRadius: BorderRadius.zero,
          fit: BoxFit.cover,
          height: size.height,
          width: size.width,
        );
      } else {
        return SharedImageProviderWidget(
          imageUrl: kCoin,
          borderRadius: BorderRadius.zero,
          fit: BoxFit.cover,
          height: size.height,
          width: size.width,
        );
      }
    } else {
      return SharedImageProviderWidget(
        imageUrl: kReputation,
        borderRadius: BorderRadius.zero,
        fit: BoxFit.cover,
        height: size.height,
        width: size.width,
      );
    }
  }

  @override
  Widget build(BuildContext context) => RichText(
        textAlign: textAlign,
        text: TextSpan(
          children: [
            if (amount != null && textStyle != null)
              TextSpan(
                text: '${beforeAmount ?? ''}$amount ',
                style: textStyle,
              ),
            WidgetSpan(
              child: _getCoinPictureWidget(),
            ),
          ],
        ),
      );
}
