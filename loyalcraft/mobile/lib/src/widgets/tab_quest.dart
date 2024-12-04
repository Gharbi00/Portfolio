import 'package:flutter/cupertino.dart';
import 'package:flutter_staggered_grid_view/flutter_staggered_grid_view.dart';
import 'package:loyalcraft/localizations_delegate/app_localizations.dart';
import 'package:loyalcraft/src/bloc/quest.dart';
import 'package:loyalcraft/src/widgets/empty.dart';
import 'package:loyalcraft/src/widgets/quest_item.dart';
import 'package:loyalcraft/src/widgets/shimmers.dart';

// ignore: must_be_immutable
class TabQuestWidget extends StatelessWidget {
  TabQuestWidget({
    Key? key,
    required this.getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginatedCubit,
    required this.valueChanged,
  }) : super(key: key);
  GetQuestsByTargetAndUserAudienceWithLinkedAccountsPaginatedCubit getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginatedCubit;
  ValueChanged<void> valueChanged;

  @override
  Widget build(BuildContext context) => getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginatedCubit.state == null
      ? QuestsShimmer(padding: EdgeInsets.zero)
      : getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginatedCubit.state!.objects.isEmpty
          ? EmptyWidget(
              description: translate(context, 'questEmptyDescription'),
              title: translate(context, 'questEmptyTitle'),
              iconData: CupertinoIcons.play_rectangle_fill,
              padding: EdgeInsets.zero,
            )
          : MasonryGridView.count(
              itemBuilder: (context, index) => QuestItemWidget(
                quest: getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginatedCubit.state!.objects[index],
                valueChanged: valueChanged,
              ),
              itemCount: getQuestsByTargetAndUserAudienceWithLinkedAccountsPaginatedCubit.state!.objects.length,
              crossAxisSpacing: 16.0,
              mainAxisSpacing: 16.0,
              padding: EdgeInsets.zero,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisCount: 2,
              shrinkWrap: true,
              primary: false,
            );
}
