import { getRandomPhrase } from '../helpers/text';
import type { PageLoad } from './$types';

export const load = (({ fetch }) => {
  return {
    rawPhrase: getRandomPhrase(fetch),
  };
}) satisfies PageLoad;
