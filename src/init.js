import moment from 'moment-timezone';
import * as services from './services';

if (process.env.NODE_ENV === 'production') {
  require('source-map-support/register'); //eslint-disable-line global-require
}

require('dotenv').config();

moment.tz.setDefault('Asia/Shanghai');

/* eslint-disable global-require */
export default async (engine) => {
  engine.registerServiceProviders(Object.values(services));
};
