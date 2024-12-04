import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:http/http.dart' as http;
import 'package:loyalcraft/src/data/consts.dart';

class ConnectivityCubit extends Cubit<bool> {
  ConnectivityCubit(this._connectivity) : super(false);
  final Connectivity _connectivity;

  Future<void> init() async {
    await _checkInitialConnectivity();

    _connectivity.onConnectivityChanged.listen((result) async {
      if (result.isEmpty) {
        emit(false);
      } else {
        await _handleConnectivityChange(result.first);
      }
    });
  }

  Future<void> _checkInitialConnectivity() async {
    final result = await _connectivity.checkConnectivity();
    if (result.isEmpty) {
      emit(false);
    } else {
      await _handleConnectivityChange(result.first);
    }
  }

  Future<void> _handleConnectivityChange(ConnectivityResult result) async {
    if (result != ConnectivityResult.none) {
      var hasInternetConnection = await _checkConnectionSpeed();
      emit(hasInternetConnection);
      if (hasInternetConnection) {
        print('Connected to the internet.');
      } else {
        print('Connection is too slow.');
        if (kBuildContext != null) {
          // FlutterMessenger.showSnackbar(
          //   string: translate(kBuildContext!, 'noInternetConnectionTitle'),
          //   backgroundColor: Colors.red[800],
          //   context: kBuildContext!,
          // );
        }
      }
    } else {
      emit(false);
      print('No network connection.');
      if (kBuildContext != null) {
        // FlutterMessenger.showSnackbar(
        //   string: translate(kBuildContext!, 'noInternetConnectionTitle'),
        //   backgroundColor: Colors.red[800],
        //   context: kBuildContext!,
        // );
      }
    }
  }

  Future<bool> _checkConnectionSpeed() async {
    try {
      final stopwatch = Stopwatch()..start();
      final response = await http.get(Uri.parse(kElevokPortal)).timeout(const Duration(seconds: 5));
      stopwatch.stop();

      if (response.statusCode == 200 && stopwatch.elapsedMilliseconds < 2000) {
        return true; // Good connection
      }
    } on Exception {
      return false;
    }
    return false; // Slow connection or no response
  }
}
