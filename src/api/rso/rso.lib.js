/* eslint-disable no-unsafe-optional-chaining */
const { XMLParser } = require('fast-xml-parser');
const he = require('he');

class RsoLib {
  static getRsoParamArrays(rsoJson) {
    const { omm } = rsoJson?.ndm;
    const rsoParams = omm
      .filter((element) => element?.body?.segment?.data)
      .filter((element) => {
        const { tleParameters, userDefinedParameters } =
          element.body.segment.data;
        const { OBJECT_NAME } = element.body.segment.metadata;
        return (
          userDefinedParameters &&
          tleParameters &&
          tleParameters.NORAD_CAT_ID &&
          OBJECT_NAME
        );
      })
      .filter((element) => {
        const { USER_DEFINED } =
          element.body.segment.data.userDefinedParameters;
        return USER_DEFINED && USER_DEFINED.length === 12;
      })
      .map((element) => {
        const { NORAD_CAT_ID } = element.body.segment.data.tleParameters;
        const { USER_DEFINED } =
          element.body.segment.data.userDefinedParameters;

        const OBJECT_TYPE = USER_DEFINED[4];
        const RCS_SIZE = USER_DEFINED[5];
        const COUNTRY_CODE = USER_DEFINED[6];

        const { OBJECT_NAME } = element.body.segment.metadata;

        return {
          id: NORAD_CAT_ID,
          objtype: OBJECT_TYPE,
          objectname: OBJECT_NAME,
          rcssize: RCS_SIZE === '' ? 'UNKNOWN' : RCS_SIZE,
          country: COUNTRY_CODE === '' ? 'UNKNOWN' : COUNTRY_CODE,
        };
      });
    return rsoParams;
  }

  static parseRsoXml(rsoXml) {
    const parser = new XMLParser();
    const parseOptions = {
      attributeNamePrefix: '@_',
      attrNodeName: 'attr',
      textNodeName: '#text',
      ignoreAttributes: true,
      ignoreNameSpace: false,
      allowBooleanAttributes: false,
      parseNodeValue: true,
      parseAttributeValue: false,
      trimValues: true,
      cdataTagName: '__cdata',
      cdataPositionChar: '\\c',
      parseTrueNumberOnly: false,
      arrayMode: false,
      attrValueProcessor: (val) => he.decode(val, { isAttributeValue: true }),
      tagValueProcessor: (val) => he.decode(val),
      stopNodes: ['parse-me-as-string'],
    };

    return parser.parse(rsoXml, parseOptions);
  }
}

module.exports = RsoLib;
