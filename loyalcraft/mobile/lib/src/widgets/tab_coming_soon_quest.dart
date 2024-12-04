import 'package:flutter/cupertino.dart';
import 'package:flutter_staggered_grid_view/flutter_staggered_grid_view.dart';
import 'package:loyalcraft/localizations_delegate/app_localizations.dart';
import 'package:loyalcraft/src/bloc/quest.dart';
import 'package:loyalcraft/src/widgets/coming_soon_quest_item.dart';
import 'package:loyalcraft/src/widgets/empty.dart';
import 'package:loyalcraft/src/widgets/shimmers.dart';

// ignore: must_be_immutable
class TabComingSoonQuestWidget extends StatelessWidget {
  TabComingSoonQuestWidget({
    Key? key,
    required this.getComingSoonQuestsByTargetAndUserAudienceWithLinkedAccountsPaginatedCubit,
  }) : super(key: key);
  GetComingSoonQuestsByTargetAndUserAudienceWithLinkedAccountsPaginatedCubit getComingSoonQuestsByTargetAndUserAudienceWithLinkedAccountsPaginatedCubit;

  @override
  Widget build(BuildContext context) => getComingSoonQuestsByTargetAndUserAudienceWithLinkedAccountsPaginatedCubit.state == null
      ? QuestsShimmer(padding: EdgeInsets.zero)
      : getComingSoonQuestsByTargetAndUserAudienceWithLinkedAccountsPaginatedCubit.state!.objects.isEmpty
          ? EmptyWidget(
              description: translate(context, 'comingSoonQuestEmptyDescription'),
              title: translate(context, 'comingSooQuestEmptyTitle'),
              iconData: CupertinoIcons.play_rectangle_fill,
              padding: EdgeInsets.zero,
            )
          : MasonryGridView.count(
              itemBuilder: (context, index) => ComingSoonQuestItemWidget(
                quest: getComingSoonQuestsByTargetAndUserAudienceWithLinkedAccountsPaginatedCubit.state!.objects[index],
              ),
              itemCount: getComingSoonQuestsByTargetAndUserAudienceWithLinkedAccountsPaginatedCubit.state!.objects.length,
              crossAxisSpacing: 16.0,
              mainAxisSpacing: 16.0,
              padding: EdgeInsets.zero,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisCount: 2,
              shrinkWrap: true,
              primary: false,
            );
}
