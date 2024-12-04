import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_staggered_grid_view/flutter_staggered_grid_view.dart';
import 'package:loyalcraft/src/data/consts.dart';
import 'package:shimmer/shimmer.dart';

// ignore: must_be_immutable
class ListViewShimmer extends StatelessWidget {
  ListViewShimmer({
    Key? key,
    required this.padding,
  }) : super(key: key);

  EdgeInsetsGeometry padding;
  @override
  Widget build(BuildContext context) => Shimmer.fromColors(
        baseColor: Theme.of(context).focusColor,
        highlightColor: Colors.transparent,
        child: ListView.separated(
          separatorBuilder: (context, index) => const SizedBox(height: 16.0),
          physics: const NeverScrollableScrollPhysics(),
          shrinkWrap: true,
          padding: padding,
          primary: false,
          itemCount: 8,
          itemBuilder: (context, index) => Row(
            children: [
              Container(
                height: 40.0,
                width: 40.0,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(100.0),
                  color: Colors.white,
                ),
              ),
              const SizedBox(width: 8.0),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: double.infinity,
                      height: 8.0,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(8.0),
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 8.0),
                    Container(
                      width: kAppSize.width / 2,
                      height: 8.0,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(8.0),
                        color: Colors.white,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      );
}

// ignore: must_be_immutable
class QuestsShimmer extends StatelessWidget {
  QuestsShimmer({
    Key? key,
    required this.padding,
  }) : super(key: key);

  EdgeInsetsGeometry padding;
  @override
  Widget build(BuildContext context) => Shimmer.fromColors(
        baseColor: Theme.of(context).focusColor,
        highlightColor: Colors.transparent,
        child: ListView.separated(
          separatorBuilder: (buildContext, index) => const SizedBox(height: 16.0),
          itemBuilder: (context, index) => Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                height: 160.0,
                width: double.infinity,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(8.0),
                ),
              ),
              const SizedBox(height: 8.0),
              Container(
                width: double.infinity,
                height: 8.0,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(8.0),
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 8.0),
              Container(
                width: 80.0,
                height: 8.0,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(8.0),
                  color: Colors.white,
                ),
              ),
            ],
          ),
          physics: const NeverScrollableScrollPhysics(),
          padding: EdgeInsets.zero,
          shrinkWrap: true,
          primary: false,
          itemCount: 8,
        ),
      );
}

// ignore: must_be_immutable
class BigListViewShimmer extends StatelessWidget {
  BigListViewShimmer({
    Key? key,
    required this.padding,
  }) : super(key: key);

  EdgeInsetsGeometry padding;
  @override
  Widget build(BuildContext context) => Shimmer.fromColors(
        baseColor: Theme.of(context).focusColor,
        highlightColor: Colors.transparent,
        child: ListView.separated(
          separatorBuilder: (context, index) => const SizedBox(height: 16.0),
          physics: const NeverScrollableScrollPhysics(),
          shrinkWrap: true,
          padding: padding,
          primary: false,
          itemCount: 8,
          itemBuilder: (context, index) => Row(
            children: [
              Container(
                width: 80.0,
                height: 80.0,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(8.0),
                  color: Colors.white,
                ),
              ),
              const SizedBox(width: 8.0),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: double.infinity,
                      height: 8.0,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(8.0),
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 8.0),
                    Container(
                      width: kAppSize.width / 2,
                      height: 8.0,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(8.0),
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 8.0),
                    Container(
                      width: double.infinity,
                      height: 8.0,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(8.0),
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 8.0),
                    Container(
                      width: kAppSize.width / 2,
                      height: 8.0,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(8.0),
                        color: Colors.white,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      );
}

// ignore: must_be_immutable
class QuantitativeWalletShimmer extends StatelessWidget {
  QuantitativeWalletShimmer({
    Key? key,
    required this.padding,
  }) : super(key: key);

  EdgeInsetsGeometry padding;
  @override
  Widget build(BuildContext context) => Shimmer.fromColors(
        baseColor: Theme.of(context).focusColor,
        highlightColor: Colors.transparent,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 200.0,
              height: 8.0,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(8.0),
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 16.0),
            Container(
              width: 120.0,
              height: 16.0,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(8.0),
                color: Colors.white,
              ),
            ),
          ],
        ),
      );
}

// ignore: must_be_immutable
class AccelerationLandingShimmer extends StatelessWidget {
  AccelerationLandingShimmer({
    Key? key,
    required this.padding,
  }) : super(key: key);

  EdgeInsetsGeometry padding;
  @override
  Widget build(BuildContext context) => Shimmer.fromColors(
        baseColor: Theme.of(context).focusColor,
        highlightColor: Colors.transparent,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Expanded(
              child: ListView(
                padding: EdgeInsets.zero,
                shrinkWrap: true,
                primary: false,
                children: [
                  Center(
                    child: Container(
                      height: 140.0,
                      width: 140.0,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(100.0),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16.0),
                  Center(
                    child: Container(
                      width: 200.0,
                      height: 8.0,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(8.0),
                        color: Colors.white,
                      ),
                    ),
                  ),
                  const SizedBox(height: 16.0),
                  Center(
                    child: Container(
                      width: 100.0,
                      height: 8.0,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(8.0),
                        color: Colors.white,
                      ),
                    ),
                  ),
                  const SizedBox(height: 16.0),
                  Row(
                    children: List.generate(
                      3,
                      (index) => Expanded(
                        child: Container(
                          margin: EdgeInsets.only(left: index == 0 ? 0.0 : 8.0),
                          padding: const EdgeInsets.all(8.0),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(8.0),
                          ),
                          child: const Text(''),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16.0),
                  Align(
                    alignment: Alignment.bottomLeft,
                    child: Container(
                      width: 200.0,
                      height: 8.0,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(8.0),
                        color: Colors.white,
                      ),
                    ),
                  ),
                  const SizedBox(height: 16.0),
                  Column(
                    children: List.generate(
                      3,
                      (index) => Padding(
                        padding: EdgeInsets.only(top: index == 0 ? 0.0 : 16.0),
                        child: Row(
                          children: [
                            Column(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Container(
                                  alignment: Alignment.center,
                                  height: 30.0,
                                  width: 30.0,
                                  decoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(100.0),
                                    color: Theme.of(context).focusColor,
                                  ),
                                  child: Icon(
                                    index.isEven ? CupertinoIcons.gift_alt_fill : CupertinoIcons.gift_fill,
                                    color: Colors.white,
                                    size: 18.0,
                                  ),
                                ),
                                Column(
                                  children: List.generate(
                                    10,
                                    (index) => Container(
                                      height: 2.0,
                                      width: 2.0,
                                      margin: const EdgeInsets.symmetric(vertical: 4.0),
                                      decoration: BoxDecoration(
                                        borderRadius: BorderRadius.circular(100.0),
                                        color: Colors.white,
                                      ),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(width: 8.0),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Container(
                                    width: 200.0,
                                    height: 8.0,
                                    decoration: BoxDecoration(
                                      borderRadius: BorderRadius.circular(8.0),
                                      color: Colors.white,
                                    ),
                                  ),
                                  const SizedBox(height: 16.0),
                                  Container(
                                    width: 100.0,
                                    height: 8.0,
                                    decoration: BoxDecoration(
                                      borderRadius: BorderRadius.circular(8.0),
                                      color: Colors.white,
                                    ),
                                  ),
                                  const SizedBox(height: 16.0),
                                  Container(
                                    width: 160.0,
                                    height: 8.0,
                                    decoration: BoxDecoration(
                                      borderRadius: BorderRadius.circular(8.0),
                                      color: Colors.white,
                                    ),
                                  ),
                                  const SizedBox(height: 16.0),
                                  Container(
                                    width: 100.0,
                                    height: 8.0,
                                    decoration: BoxDecoration(
                                      borderRadius: BorderRadius.circular(8.0),
                                      color: Colors.white,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16.0),
            TextButton(
              style: TextButton.styleFrom(
                minimumSize: const Size.fromHeight(40.0),
                backgroundColor: Colors.white,
                disabledBackgroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8.0),
                ),
              ),
              onPressed: null,
              child: const SizedBox(),
            ),
          ],
        ),
      );
}

// ignore: must_be_immutable
class HorizontalPosHomeShimmer extends StatelessWidget {
  HorizontalPosHomeShimmer({
    Key? key,
    required this.padding,
  }) : super(key: key);

  EdgeInsetsGeometry padding;
  @override
  Widget build(BuildContext context) => Shimmer.fromColors(
        baseColor: Theme.of(context).focusColor,
        highlightColor: Colors.transparent,
        child: SizedBox(
          height: 240.0,
          child: ListView.separated(
            separatorBuilder: (context, index) => const SizedBox(width: 16.0),
            physics: const NeverScrollableScrollPhysics(),
            scrollDirection: Axis.horizontal,
            shrinkWrap: true,
            padding: padding,
            primary: false,
            itemCount: 8,
            itemBuilder: (context, index) => SizedBox(
              width: kAppSize.width / 1.2,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: double.infinity,
                    height: 180.0,
                    decoration: const BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.only(
                        topLeft: Radius.circular(8.0),
                        topRight: Radius.circular(8.0),
                      ),
                    ),
                  ),
                  const SizedBox(height: 8.0),
                  Container(
                    width: double.infinity,
                    height: 8.0,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(8.0),
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 8.0),
                  Container(
                    width: kAppSize.width / 2,
                    height: 8.0,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(8.0),
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      );
}

// ignore: must_be_immutable
class HorizontalQuestHomeShimmer extends StatelessWidget {
  HorizontalQuestHomeShimmer({
    Key? key,
    required this.padding,
  }) : super(key: key);

  EdgeInsetsGeometry padding;
  @override
  Widget build(BuildContext context) => Shimmer.fromColors(
        baseColor: Theme.of(context).focusColor,
        highlightColor: Colors.transparent,
        child: SizedBox(
          height: 210.0,
          child: ListView.separated(
            separatorBuilder: (context, index) => const SizedBox(width: 16.0),
            physics: const NeverScrollableScrollPhysics(),
            scrollDirection: Axis.horizontal,
            shrinkWrap: true,
            padding: padding,
            primary: false,
            itemCount: 8,
            itemBuilder: (context, index) => SizedBox(
              width: kAppSize.width / 1.5,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: double.infinity,
                    height: 160.0,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(8.0),
                    ),
                  ),
                  const SizedBox(height: 8.0),
                  Container(
                    width: double.infinity,
                    height: 8.0,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(8.0),
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 8.0),
                  Container(
                    width: kAppSize.width / 2,
                    height: 8.0,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(8.0),
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      );
}

// ignore: must_be_immutable
class LinkedAccountPosLandingShimmer extends StatelessWidget {
  LinkedAccountPosLandingShimmer({
    Key? key,
    required this.padding,
  }) : super(key: key);
  EdgeInsetsGeometry padding;

  @override
  Widget build(BuildContext context) => Shimmer.fromColors(
        baseColor: Theme.of(context).focusColor,
        highlightColor: Colors.transparent,
        child: Padding(
          padding: padding,
          child: Row(
            children: [
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(16.0),
                  height: 160.0,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(8.0),
                    color: Colors.white.withOpacity(0.2),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 50.0,
                        height: 50.0,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(100.0),
                        ),
                      ),
                      const SizedBox(height: 8.0),
                      Container(
                        width: 200.0,
                        height: 8.0,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(100.0),
                        ),
                      ),
                      const SizedBox(height: 8.0),
                      Container(
                        width: 100.0,
                        height: 8.0,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(100.0),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 16.0),
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(16.0),
                  height: 160.0,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(8.0),
                    border: Border.all(
                      color: Colors.white,
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 50.0,
                        height: 50.0,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(100.0),
                        ),
                      ),
                      const SizedBox(height: 8.0),
                      Container(
                        width: 200.0,
                        height: 8.0,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(100.0),
                        ),
                      ),
                      const SizedBox(height: 8.0),
                      Container(
                        width: 100.0,
                        height: 8.0,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(100.0),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      );
}

// ignore: must_be_immutable
class InternalProductShimmer extends StatelessWidget {
  InternalProductShimmer({
    Key? key,
    required this.padding,
  }) : super(key: key);

  EdgeInsetsGeometry padding;
  @override
  Widget build(BuildContext context) => Shimmer.fromColors(
        baseColor: Theme.of(context).focusColor,
        highlightColor: Colors.transparent,
        child: MasonryGridView.count(
          itemBuilder: (context, index) => Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: double.infinity,
                height: 180.0,
                decoration: const BoxDecoration(
                  borderRadius: BorderRadius.only(topLeft: Radius.circular(16.0), topRight: Radius.circular(16.0)),
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 8.0),
              Container(
                width: double.infinity,
                height: 8.0,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(8.0),
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 8.0),
              Container(
                width: kAppSize.width / 4,
                height: 8.0,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(8.0),
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 8.0),
              Container(
                width: kAppSize.width / 3,
                height: 8.0,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(8.0),
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 8.0),
              Container(
                width: kAppSize.width / 4,
                height: 8.0,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(8.0),
                  color: Colors.white,
                ),
              ),
            ],
          ),
          itemCount: 8,
          crossAxisSpacing: 16.0,
          mainAxisSpacing: 16.0,
          padding: EdgeInsets.zero,
          physics: const NeverScrollableScrollPhysics(),
          crossAxisCount: 2,
          shrinkWrap: true,
          primary: false,
        ),
      );
}
