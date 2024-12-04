import { ExtraOptions, PreloadAllModules } from '@angular/router';

import { DefaultOptions } from '@apollo/client/core';

export const POS_ID: string = '650b63c094e67c588943cc67';
export const BACKEND_HOST = 'sfca-sbx-bck.diktup.cloud';
export const AWS_CREDENTIALS: any = {
  region: 'eu-central-1',
  storage: 'sifca-storage',
};
export const GOOGLEMAPS_API_KEY = 'AIzaSyArN_5tS2hZfTjISRouwsFe9eID_3RTVq0';
export const environment = {
  production: false,
  // BACKEND_URL: 'http://localhost:3311/graphql',
  BACKEND_REST: `https://${BACKEND_HOST}`,
  BACKEND_URL: `https://${BACKEND_HOST}/graphql`,
  BACKEND_URL_WSS: `wss://${BACKEND_HOST}/graphql`,
  primaryColor: '#FFBF00',
  secondaryColor: '#82A4E3',
  defaultauth: 'fackbackend',
  firebaseConfig: {
    apiKey: '',
    authDomain: '',
    databaseURL: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
    measurementId: '',
  },
};

// export const defaultOptions: DefaultOptions = {
//   watchQuery: {
//     fetchPolicy: 'cache-and-network',
//     errorPolicy: 'ignore',
//   },
//   query: {
//     fetchPolicy: 'cache-first',
//     errorPolicy: 'all',
//   },
// };

export const defaultOptions: DefaultOptions = {
  watchQuery: {
    fetchPolicy: 'no-cache',
    errorPolicy: 'ignore',
  },
  query: {
    fetchPolicy: 'no-cache',
    errorPolicy: 'all',
  },
};
export const ELEVOK_LOGO = 'https://sifca-storage.s3.eu-central-1.amazonaws.com/650b63c094e67c588943cc67_1716977253258_white_logo-ezgif.com-svg-to-png-converter.png';
export const ELEVOK_SMALL_LOGO = 'https://sifca-storage.s3.eu-central-1.amazonaws.com/650b63c094e67c588943cc67_1716802345193_12321.png';

export const AGM_CONFIGS = { apiKey: 'AIzaSyCLaBmBx_sLKNFPpfPCU4bcyUsEhgJPzss' };
export const ROUTER_CONFIG: ExtraOptions = { scrollPositionRestoration: 'enabled', preloadingStrategy: PreloadAllModules };

export const BRAND_NAME = 'Elevok';
export const BRAND_URL = `https://elevok.com`;
export const BRAND_LOGO_URL = `https://sifca-storage.s3.eu-central-1.amazonaws.com/650b63c094e67c588943cc67_1716977253258_white_logo-ezgif.com-svg-to-png-converter.png`;
