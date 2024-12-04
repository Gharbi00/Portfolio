import 'dart:io';

import 'package:flutter_loyalcraft_gql/graphql/amazon.graphql.dart';
import 'package:http/http.dart' as http;
import 'package:loyalcraft/src/data/graphql_client.dart';

class SharedRepository {
  SharedRepository(
    this._sGraphQLClient,
  );
  final SGraphQLClient _sGraphQLClient;

  Future<Query$generateS3SignedUrl$generateS3SignedUrl> generateS3SignedUrl(
    String fileName,
    String fileType,
  ) async {
    try {
      final result = await _sGraphQLClient.client.query$generateS3SignedUrl(
        Options$Query$generateS3SignedUrl(
          variables: Variables$Query$generateS3SignedUrl(
            fileName: fileName,
            fileType: fileType,
          ),
        ),
      );
      return result.parsedData?.generateS3SignedUrl ?? Query$generateS3SignedUrl$generateS3SignedUrl(message: 'Failed', success: false);
    } on Exception {
      return Query$generateS3SignedUrl$generateS3SignedUrl(message: 'Failed', success: false);
    }
  }

  Future<String?> uploadS3AwsWithSignature({
    required String signedUrl,
    required String fileName,
    required File file,
  }) async {
    try {
      var bytes = await file.readAsBytes();

      var response = await http.put(
        Uri.parse(
          signedUrl,
        ),
        headers: {
          'Content-Type': _lookupMimeType(file.path) ?? 'application/octet-stream',
        },
        body: bytes,
      );
      if (response.statusCode != 200) {
        return null;
      }

      return fileName;
    } on Exception {
      return null;
    }
  }

  Future<Query$deleteFileFromAws$deleteFileFromAws> deleteFileFromAws(String fileName) async {
    final result = await _sGraphQLClient.client.query$deleteFileFromAws(
      Options$Query$deleteFileFromAws(
        variables: Variables$Query$deleteFileFromAws(
          fileName: fileName,
        ),
      ),
    );
    return result.parsedData?.deleteFileFromAws ?? Query$deleteFileFromAws$deleteFileFromAws(message: 'Failed', success: false);
  }

  String? _lookupMimeType(String path) {
    var extension = path.split('.').last.toLowerCase();
    switch (extension) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'gif':
        return 'image/gif';
      case 'bmp':
        return 'image/bmp';
      case 'webp':
        return 'image/webp';
      case 'pdf':
        return 'application/pdf';
      case 'txt':
        return 'text/plain';
      case 'html':
        return 'text/html';
      case 'json':
        return 'application/json';
      case 'xml':
        return 'application/xml';
      case 'csv':
        return 'text/csv';
      default:
        return null;
    }
  }
}
