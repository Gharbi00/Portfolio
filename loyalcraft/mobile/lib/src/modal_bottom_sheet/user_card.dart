import 'package:barcode_widget/barcode_widget.dart';
import 'package:carousel_slider/carousel_slider.dart' as carousel_slider;
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-card-user-card.graphql.dart';
import 'package:flutter_loyalcraft_gql/graphql/point-of-sale.graphql.dart';
import 'package:flutter_loyalcraft_gql/schema.graphql.dart';
import 'package:loyalcraft/localizations_delegate/app_localizations.dart';
import 'package:loyalcraft/src/bloc/locale.dart';
import 'package:loyalcraft/src/bloc/loyalty_settings.dart';
import 'package:loyalcraft/src/bloc/user.dart';
import 'package:loyalcraft/src/bloc/variable.dart';
import 'package:loyalcraft/src/data/consts.dart';
import 'package:loyalcraft/src/utils/image_cache_manager/shared_image_provider.dart';
import 'package:loyalcraft/src/widgets/empty.dart';
import 'package:loyalcraft/src/widgets/qr_bar_code_error.dart';
import 'package:loyalcraft/src/widgets/user_card_item.dart';

Barcode _getBarcodeType(Enum$BarcodeRepresentationTyeEnum? style) {
  if (style == Enum$BarcodeRepresentationTyeEnum.AZTECCODE) {
    return Barcode.aztec();
  }
  if (style == Enum$BarcodeRepresentationTyeEnum.CODABAR) {
    return Barcode.codabar();
  }
  if (style == Enum$BarcodeRepresentationTyeEnum.CODE11) {}
  if (style == Enum$BarcodeRepresentationTyeEnum.CODE128) {
    return Barcode.code128();
  }
  if (style == Enum$BarcodeRepresentationTyeEnum.CODE39) {
    return Barcode.code39();
  }
  if (style == Enum$BarcodeRepresentationTyeEnum.CODE93) {
    return Barcode.code93();
  }
  if (style == Enum$BarcodeRepresentationTyeEnum.DATAMATRIX) {
    return Barcode.dataMatrix();
  }
  if (style == Enum$BarcodeRepresentationTyeEnum.EAN13) {
    return Barcode.ean13();
  }
  if (style == Enum$BarcodeRepresentationTyeEnum.EAN8) {
    return Barcode.ean8();
  }
  if (style == Enum$BarcodeRepresentationTyeEnum.GRIDMATRIX) {
    return Barcode.dataMatrix();
  }
  if (style == Enum$BarcodeRepresentationTyeEnum.GS1) {}
  if (style == Enum$BarcodeRepresentationTyeEnum.ITF14) {
    return Barcode.itf14();
  }
  if (style == Enum$BarcodeRepresentationTyeEnum.MAXICODE) {}
  if (style == Enum$BarcodeRepresentationTyeEnum.PATCHCODE) {}
  if (style == Enum$BarcodeRepresentationTyeEnum.PDF417) {
    return Barcode.pdf417();
  }
  if (style == Enum$BarcodeRepresentationTyeEnum.PHARMACODE) {}
  if (style == Enum$BarcodeRepresentationTyeEnum.UPCA) {
    return Barcode.upcA();
  }
  if (style == Enum$BarcodeRepresentationTyeEnum.UPCE) {
    return Barcode.upcE();
  }
  return Barcode.codabar();
}

void showUserCardSheet({
  required List<Query$getCorporateUserCardByUserAndTarget$getCorporateUserCardByUserAndTarget> getCorporateUserCardByUserAndTarget,
  required Query$pointOfSale$pointOfSale? pos,
  required BuildContext context,
  String? reference,
}) {
  late VariableCubit _cardIndexCubit;

  showModalBottomSheet(
    backgroundColor: Colors.transparent,
    isScrollControlled: true,
    context: context,
    builder: (builder) => DraggableScrollableSheet(
      initialChildSize: 0.7,
      maxChildSize: 0.9,
      snap: true,
      minChildSize: 0.7,
      expand: false,
      builder: (context, scrollController) => StatefulBuilder(
        builder: (buildContext, setState) {
          _cardIndexCubit = VariableCubit(value: 0);
          final _locale = context.watch<LocaleCubit>().state;
          final _user = context.watch<UserCubit>().state;
          final _findLoyaltySettingsByTarget = context.watch<FindCurrentLoyaltySettingsCubit>().state;
          final _isVisualBarcode = _findLoyaltySettingsByTarget?.loyaltyCard?.representation?.visual == Enum$CodeRepresentationEnum.BARCODE;
          var _isRtl = Directionality.of(context) == TextDirection.rtl;
          return MultiBlocProvider(
            providers: [
              BlocProvider(create: (context) => _cardIndexCubit),
            ],
            child: BlocBuilder<VariableCubit, dynamic>(
              bloc: _cardIndexCubit,
              builder: (context, value) => Container(
                padding: const EdgeInsets.all(16.0),
                width: double.infinity,
                decoration: BoxDecoration(
                  borderRadius: const BorderRadius.only(
                    topRight: Radius.circular(8.0),
                    topLeft: Radius.circular(8.0),
                  ),
                  color: Theme.of(context).scaffoldBackgroundColor,
                ),
                child: getCorporateUserCardByUserAndTarget.isEmpty
                    ? EmptyWidget(
                        description: translate(context, 'userCardEmptyDescription'),
                        title: translate(context, 'userCardEmptyTitle'),
                        iconData: CupertinoIcons.person_crop_square_fill,
                        padding: EdgeInsets.zero,
                      )
                    : ListView(
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
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceAround,
                            children: [
                              SharedImageProviderWidget(
                                imageUrl: _isRtl ? kCornerTopRight : kCornerTopLeft,
                                color: Theme.of(context).colorScheme.secondary,
                                height: 40.0,
                                width: 40.0,
                                fit: BoxFit.cover,
                              ),
                              const SizedBox(width: 200.0),
                              SharedImageProviderWidget(
                                imageUrl: _isRtl ? kCornerTopLeft : kCornerTopRight,
                                color: Theme.of(context).colorScheme.secondary,
                                height: 40.0,
                                width: 40.0,
                                fit: BoxFit.cover,
                              ),
                            ],
                          ),
                          const SizedBox(height: 16.0),
                          Center(
                            child: Container(
                              padding: const EdgeInsets.all(8.0),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(4.0),
                              ),
                              child: _isVisualBarcode
                                  ? BarcodeWidget(
                                      data: '${getCorporateUserCardByUserAndTarget[_cardIndexCubit.state].identifier};$kPosID${reference ?? ''}',
                                      barcode: _getBarcodeType(_findLoyaltySettingsByTarget?.loyaltyCard?.representation?.style),
                                      width: kAppSize.width / 1.2,
                                      height: 140.0,
                                      errorBuilder: (context, error) => const QrBarCodeErrorWidget(),
                                      style: Theme.of(context).textTheme.bodyMedium!.copyWith(
                                            color: Colors.white,
                                          ),
                                    )
                                  : BarcodeWidget(
                                      data: '${getCorporateUserCardByUserAndTarget[_cardIndexCubit.state].identifier};$kPosID${reference ?? ''}',
                                      errorBuilder: (context, error) => const QrBarCodeErrorWidget(),
                                      barcode: Barcode.qrCode(),
                                      height: 140.0,
                                      width: 140.0,
                                    ),
                            ),
                          ),
                          const SizedBox(height: 16.0),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceAround,
                            children: [
                              SharedImageProviderWidget(
                                imageUrl: _isRtl ? kCornerBottomRight : kCornerBottomLeft,
                                color: Theme.of(context).colorScheme.secondary,
                                height: 40.0,
                                width: 40.0,
                                fit: BoxFit.cover,
                              ),
                              SizedBox(
                                width: 200.0,
                                child: Text(
                                  translate(context, 'userCardSheetText1'),
                                  style: Theme.of(context).textTheme.bodySmall,
                                  textAlign: TextAlign.center,
                                ),
                              ),
                              SharedImageProviderWidget(
                                imageUrl: _isRtl ? kCornerBottomLeft : kCornerBottomRight,
                                color: Theme.of(context).colorScheme.secondary,
                                height: 40.0,
                                width: 40.0,
                                fit: BoxFit.cover,
                              ),
                            ],
                          ),
                          const SizedBox(height: 16.0),
                          SizedBox(
                            height: 180.0,
                            child: carousel_slider.CarouselSlider.builder(
                              itemCount: getCorporateUserCardByUserAndTarget.length,
                              options: carousel_slider.CarouselOptions(
                                onPageChanged: (index, changedReason) => _cardIndexCubit.updateValue(index),
                                viewportFraction: 1.0,
                                height: 180.0,
                              ),
                              itemBuilder: (context, itemIndex, pageViewIndex) => UserCardItemWidget(
                                findLoyaltySettingsByTarget: _findLoyaltySettingsByTarget,
                                userCard: getCorporateUserCardByUserAndTarget[itemIndex],
                                locale: _locale,
                                user: _user,
                              ),
                            ),
                          ),
                          const SizedBox(height: 16.0),
                          Center(
                            child: Wrap(
                              crossAxisAlignment: WrapCrossAlignment.center,
                              runSpacing: 8.0,
                              spacing: 8.0,
                              children: List.generate(
                                getCorporateUserCardByUserAndTarget.length,
                                (index) => Container(
                                  height: 4.0,
                                  width: 32.0,
                                  decoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(100.0),
                                    color: _cardIndexCubit.state == index ? Theme.of(context).colorScheme.secondary : Theme.of(context).colorScheme.secondary.withOpacity(0.6),
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
              ),
            ),
          );
        },
      ),
    ),
  );
}
