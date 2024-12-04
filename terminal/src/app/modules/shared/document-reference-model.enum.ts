export enum DocumentReferenceModelFrontEnum {
  // WITH_PREFIX = 'DOC-00000X',
  // WITH_PREFIX_AND_DATE = 'DOC-202X-00000X',
  // WITH_DATE = '202X-00000X',
  // WITH_DATE_WITHOUT_HYPHEN = '202X00000X',
  // WITHOUT_PREFIX = '00000X',
  WITH_PREFIX = '<%- prefix %>-<%- number %>',
  WITH_PREFIX_AND_DATE = '<%- prefix %>-<%- year %>-<%- number %>',
  WITH_DATE = '<%- year %>-<%- number %>',
  WITH_DATE_WITHOUT_HYPHEN = '<%- year %><%- number %>',
  WITHOUT_PREFIX = '<%- number %>',
}
