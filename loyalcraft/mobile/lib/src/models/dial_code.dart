class DialCode {
  DialCode({
    required this.name,
    required this.flag,
    required this.code,
    required this.dialCode,
    required this.formatPattern,
    required this.numberLength,
  });

  // A factory constructor to create a Country instance from a JSON map
  factory DialCode.fromJson(Map<String, dynamic> json) => DialCode(
        name: json['name'] as String,
        flag: json['flag'] as String,
        code: json['code'] as String,
        dialCode: json['dial_code'] as String,
        numberLength: json['number_length'] as int,
        formatPattern: json['format_pattern'] as String,
      );
  final String name;
  final String flag;
  final String code;
  final String dialCode;
  final String formatPattern;
  final int numberLength;

  // Method to convert a Country instance to a JSON map
  Map<String, dynamic> toJson() => {
        'name': name,
        'flag': flag,
        'code': code,
        'dial_code': dialCode,
        'number_length': numberLength,
        'format_pattern': formatPattern,
      };
}
