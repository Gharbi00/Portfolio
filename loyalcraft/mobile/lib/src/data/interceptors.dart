import 'package:flutter_diktup_utilities/extensions.dart';
import 'package:flutter_loyalcraft_gql/schema.graphql.dart';
import 'package:http/http.dart' as http;
import 'package:loyalcraft/src/data/shared_preferences.dart';

class BaseInterceptor extends http.BaseClient {
  factory BaseInterceptor({String? origin, String? linkedUserToken}) => _singleton(origin, linkedUserToken);

  BaseInterceptor._internal(this.origin, this.linkedUserToken);

  static BaseInterceptor _singleton(String? origin, String? linkedUserToken) => BaseInterceptor._internal(origin, linkedUserToken);

  final String? origin;
  final String? linkedUserToken;
  final http.Client _client = http.Client();

  @override
  Future<http.StreamedResponse> send(http.BaseRequest request) async {
    var accessToken = await getAccessTokenFromSP();
    var headers = <String, String>{
      if (accessToken.isNotEmpty) 'Authorization': 'Bearer $accessToken',
      if (origin.removeNull().isNotEmpty) 'origin': origin.removeNull(),
      'App': Enum$App.SIFCA.name.toUpperCase(),
    };

    request.headers.addAll(headers);
    return _client.send(request);
  }
}
