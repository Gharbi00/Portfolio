import 'package:flutter/material.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-card-user-card.graphql.dart';
import 'package:flutter_loyalcraft_gql/schema.graphql.dart';
import 'package:loyalcraft/localizations_delegate/app_localizations.dart';
import 'package:loyalcraft/src/data/consts.dart';
import 'package:loyalcraft/src/data/flutter_messenger.dart';
import 'package:loyalcraft/src/repository/user_card.dart';
import 'package:loyalcraft/src/screens/scan_qr_code.dart';
import 'package:loyalcraft/src/utils/image_cache_manager/shared_image_provider.dart';

// ignore: must_be_immutable
class SignInOnDesktopBannerItemWidget extends StatelessWidget {
  SignInOnDesktopBannerItemWidget({
    Key? key,
    required this.userCardRepository,
  }) : super(key: key);
  UserCardRepository userCardRepository;

  @override
  Widget build(BuildContext context) => GestureDetector(
        onTap: () => showGeneralDialog(
          pageBuilder: (context, anim1, anim2) => ScanQrCodeWidget(
            refreshTheView: (value) async {
              var uri = Uri.parse(value.startsWith('http://') || value.startsWith('https://') ? value : 'https://$value');
              var path = uri.path.trim();
              var index = path.indexOf('/');
              if (index != -1) {
                path = path.substring(index + 1);
              }
              if (path.contains(kLoginRefIdPath) && path.contains('/') && path.split('/').length >= 3) {
                path = path.replaceAll(kLoginRefIdPath, '');
                final pathList = path.split('/');
                final linkUserAccount = await userCardRepository.linkUserAccount(
                  Variables$Mutation$linkUserAccount(
                    reference: pathList[1],
                    target: Input$TargetACIInput(
                      pos: pathList[2],
                    ),
                  ),
                );
                if (linkUserAccount == null) {
                  FlutterMessenger.showSnackbar(context: context, string: translate(context, 'generalErrorMessage'));
                } else {
                  FlutterMessenger.showSnackbar(context: context, string: translate(context, 'successfullyAccountLinked'));
                }
              } else {
                FlutterMessenger.showSnackbar(context: context, string: translate(context, 'generalErrorMessage'));
              }
            },
          ),
          transitionDuration: const Duration(milliseconds: 1),
          barrierColor: Colors.transparent,
          barrierLabel: '',
          context: context,
        ),
        child: Container(
          padding: const EdgeInsets.all(16.0),
          alignment: Alignment.center,
          height: 250.0,
          width: kAppSize.width / 1.8,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(8.0),
            color: Theme.of(context).focusColor,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              SharedImageProviderWidget(
                imageUrl: kDesktops,
                borderRadius: BorderRadius.circular(4.0),
                fit: BoxFit.cover,
                width: 40.0,
                height: 40.0,
              ),
              const SizedBox(height: 8.0),
              Text(
                translate(context, 'signInOnDesktopBannerText1'),
                style: Theme.of(context).textTheme.bodyMedium,
              ),
              const SizedBox(height: 8.0),
              Container(
                alignment: Alignment.center,
                padding: const EdgeInsets.all(8.0),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(8.0),
                  color: Colors.black,
                ),
                child: Text(
                  translate(context, 'scan'),
                  textAlign: TextAlign.center,
                  overflow: TextOverflow.ellipsis,
                  softWrap: false,
                  maxLines: 1,
                  style: Theme.of(context).textTheme.bodyLarge!.copyWith(
                        color: Colors.white,
                      ),
                ),
              ),
            ],
          ),
        ),
      );
}
