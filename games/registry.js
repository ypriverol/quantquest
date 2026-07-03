import * as envelope from './envelope.js';
import * as feature from './feature.js';

export const games = {
  envelope: { render: envelope.render },
  feature:  { render: feature.render },
};
export const gameIds = ['envelope','feature'];
