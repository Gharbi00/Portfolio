import 'package:app_links/app_links.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-card-user-card.graphql.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-quest-quest.graphql.dart';
import 'package:flutter_loyalcraft_gql/graphql/point-of-sale.graphql.dart';
import 'package:flutter_loyalcraft_gql/schema.graphql.dart';
import 'package:loyalcraft/localizations_delegate/app_localizations.dart';
import 'package:loyalcraft/src/bloc/home_tab_index.dart';
import 'package:loyalcraft/src/data/consts.dart';
import 'package:loyalcraft/src/data/flutter_messenger.dart';
import 'package:loyalcraft/src/data/shared_preferences.dart';
import 'package:loyalcraft/src/modal_bottom_sheet/user_card.dart';
import 'package:loyalcraft/src/repository/pos.dart';
import 'package:loyalcraft/src/repository/quest.dart';
import 'package:loyalcraft/src/repository/user_card.dart';
import 'package:loyalcraft/src/screens/delete_account_1.dart';
import 'package:loyalcraft/src/screens/point_of_sale_landing.dart';
import 'package:loyalcraft/src/screens/reset_password_2.dart';
import 'package:loyalcraft/src/screens/test_quests.dart';

final AppLinks _appLinks = AppLinks();

Future<void> listenToUriLinkStrem({required PosRepository posRepository, required UserCardRepository userCardRepository, required QuestRepository questRepository}) async {
  var accessToken = await getAccessTokenFromSP();
  _appLinks.uriLinkStream.listen((uri) {
    if (kBuildContext != null) {
      _doTheDeepLink(accessToken: accessToken, uri: uri, posRepository: posRepository, userCardRepository: userCardRepository, questRepository: questRepository);
    }
  });
}

Future<void> _doTheDeepLink({
  required UserCardRepository userCardRepository,
  required QuestRepository questRepository,
  required PosRepository posRepository,
  required String accessToken,
  required Uri uri,
}) async {
  if (uri.path.contains('/')) {
    var pathList = uri.path.trim().split('/').toList()..removeWhere((e) => e.isEmpty);

    if (accessToken.isNotEmpty) {
      if (pathList.length > 1) {
        if (pathList[1].trim() == kDeleteUserPath) {
          Navigator.push(
            kBuildContext!,
            MaterialPageRoute(
              builder: (context) => const DeleteAccount1Widget(),
            ),
          );
        }
        if (pathList[1].trim() == kPosPath && pathList.length >= 3) {
          var pos = await posRepository.pointOfSale(
            Variables$Query$pointOfSale(
              id: pathList[2],
            ),
          );

          if (pos != null) {
            Navigator.push(
              kBuildContext!,
              MaterialPageRoute(
                builder: (context) => PointOfSaleLandingWidget(
                  pos: pos,
                ),
              ),
            );
          }
        }
        if (pathList[1].trim().startsWith(kReferFriendIdPath)) {
          addHomeTabIndexToSP(0);
          BlocProvider.of<HomeTabIndexCubit>(kBuildContext!).updateValue(0);
          Navigator.of(kBuildContext!).pushNamedAndRemoveUntil('/Tabs', (route) => false);
          final getCorporateUserCardByUserAndTarget = await getCorporateUserCardByUserAndTargetFromSP();
          final pos = await getPosFromSP();
          Future.delayed(
            const Duration(seconds: 2),
            () => showUserCardSheet(
              getCorporateUserCardByUserAndTarget: getCorporateUserCardByUserAndTarget,
              reference: kReferFriendIdPath.replaceAll(kReferFriendIdPath, '').trim(),
              context: kBuildContext!,
              pos: pos,
            ),
          );
        }
        if (pathList[1].trim().startsWith(kLoginRefIdPath) && pathList.length >= 3) {
          final linkUserAccount = await userCardRepository.linkUserAccount(
            Variables$Mutation$linkUserAccount(
              reference: pathList[1].trim().replaceAll(kLoginRefIdPath, ''),
              target: Input$TargetACIInput(
                pos: pathList[2].trim(),
              ),
            ),
          );
          if (linkUserAccount == null) {
            FlutterMessenger.showSnackbar(context: kBuildContext!, string: translate(kBuildContext!, 'generalErrorMessage'));
          } else {
            FlutterMessenger.showSnackbar(context: kBuildContext!, string: translate(kBuildContext!, 'successfullyAccountLinked'));
          }
        }
        if (pathList[1].trim() == kTestQuestPath && pathList.length >= 3) {
          var quest = await questRepository.quest(
            Variables$Query$quest(
              id: pathList[2],
            ),
          );
          try {
            if (quest != null) {
              var newQuest = Query$getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated$getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated$objects.fromJson(quest.toJson());
              newQuest = newQuest.copyWith(isAccountLinked: true, performed: false);
              Navigator.push(
                kBuildContext!,
                MaterialPageRoute(
                  builder: (context) => TestQuestsWidget(
                    quest: newQuest,
                    isTest: true,
                  ),
                ),
              );
            }
          } on Exception catch (e) {
            debugPrint('$e');
          }
        }
      }
    }
    if (pathList[0].trim().startsWith(kForgotPasswordPath) && pathList.length >= 2) {
      Navigator.push(
        kBuildContext!,
        MaterialPageRoute(
          builder: (context) => ResetPassword2Widget(
            token: pathList[1],
          ),
        ),
      );
    }
  }
}
