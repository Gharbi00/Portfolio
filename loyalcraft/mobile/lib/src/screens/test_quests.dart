import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_loyalcraft_gql/graphql/gamification-quest-quest.graphql.dart';
import 'package:flutter_staggered_grid_view/flutter_staggered_grid_view.dart';
import 'package:loyalcraft/localizations_delegate/app_localizations.dart';
import 'package:loyalcraft/src/widgets/quest_item.dart';

// ignore: must_be_immutable
class TestQuestsWidget extends StatelessWidget {
  TestQuestsWidget({
    Key? key,
    required this.quest,
    this.isTest = false,
  }) : super(key: key);
  Query$getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated$getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginated$objects quest;
  bool isTest;
  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(
          automaticallyImplyLeading: false,
          centerTitle: false,
          elevation: 0,
          title: Row(
            children: [
              GestureDetector(
                onTap: () => Navigator.pop(context),
                child: Container(
                  height: 36.0,
                  width: 36.0,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(100.0),
                    color: Theme.of(context).focusColor,
                  ),
                  child: Icon(
                    CupertinoIcons.arrow_turn_up_left,
                    color: Theme.of(context).colorScheme.secondary,
                    size: 18.0,
                  ),
                ),
              ),
              const SizedBox(width: 8.0),
              Expanded(
                child: Text(
                  translate(context, 'testMode'),
                  style: Theme.of(context).textTheme.headlineSmall,
                ),
              ),
            ],
          ),
        ),
        body: SafeArea(
          right: false,
          left: false,
          top: false,
          child: MasonryGridView.count(
            itemBuilder: (context, index) => QuestItemWidget(
              valueChanged: (value) {},
              quest: quest,
              isTest: isTest,
            ),
            itemCount: 1,
            crossAxisSpacing: 16.0,
            mainAxisSpacing: 16.0,
            padding: const EdgeInsets.all(16.0),
            physics: const NeverScrollableScrollPhysics(),
            crossAxisCount: 2,
            shrinkWrap: true,
            primary: false,
          ),
        ),
      );
}
