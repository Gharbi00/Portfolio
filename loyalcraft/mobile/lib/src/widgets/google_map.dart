import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:loyalcraft/src/bloc/locale.dart';
import 'package:loyalcraft/src/bloc/theme.dart';
import 'package:loyalcraft/src/utils/theme.dart';

//ignore: must_be_immutable
class GoogleMapWidget extends StatelessWidget {
  GoogleMapWidget({
    Key? key,
    required this.initialLatLng,
    this.rotateGesturesEnabled,
    this.scrollGesturesEnabled,
    this.initialCameraPosition,
    this.zoomGesturesEnabled,
    this.tiltGesturesEnabled,
    this.onCameraMove,
    this.polylineSet,
    this.polygonSet,
    this.circleSet,
    this.markerSet,
    this.onTap,
    this.zoom,
  }) : super(key: key);
  void Function(CameraPosition)? onCameraMove;
  CameraPosition? initialCameraPosition;
  void Function(LatLng)? onTap;
  bool? scrollGesturesEnabled;
  bool? rotateGesturesEnabled;
  Set<Polyline>? polylineSet;
  bool? zoomGesturesEnabled;
  bool? tiltGesturesEnabled;
  Set<Polygon>? polygonSet;
  Set<Circle>? circleSet;
  Set<Marker>? markerSet;
  LatLng initialLatLng;
  double? zoom;

  final Completer<GoogleMapController> _googleMapController = Completer();

  @override
  Widget build(BuildContext context) {
    final _themeData = context.watch<ThemeCubit>().state;
    final _locale = context.watch<LocaleCubit>().state;

    return FutureBuilder(
      future: Future.wait([
        rootBundle.loadString('map_style/dark.json'),
        rootBundle.loadString('map_style/light.json'),
      ]),
      builder: (context, snapshot) => snapshot.hasData == false
          ? const SizedBox()
          : GoogleMap(
              onMapCreated: _googleMapController.complete,
              scrollGesturesEnabled: scrollGesturesEnabled ?? true,
              rotateGesturesEnabled: rotateGesturesEnabled ?? true,
              zoomGesturesEnabled: zoomGesturesEnabled ?? true,
              tiltGesturesEnabled: tiltGesturesEnabled ?? true,
              onCameraMove: onCameraMove,
              polylines: polylineSet ?? {},
              polygons: polygonSet ?? {},
              circles: circleSet ?? {},
              markers: markerSet ?? {},
              myLocationButtonEnabled: false,
              onTap: onTap,
              zoomControlsEnabled: false,
              mapToolbarEnabled: false,
              compassEnabled: false,
              style: _themeData == ThemeUtils(locale: _locale).darkTheme ? snapshot.data!.first : snapshot.data!.last,
              initialCameraPosition: initialCameraPosition ??
                  CameraPosition(
                    target: initialLatLng,
                    zoom: zoom ?? 16.0,
                  ),
            ),
    );
  }
}
