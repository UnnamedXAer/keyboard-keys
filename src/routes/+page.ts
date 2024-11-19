import { getRandomPhrase } from '../helpers/text';
import type { PageLoad } from './$types';

export const load = (async ({ fetch }) => {
  return {
    rawPhrase: await getRandomPhrase(fetch),
  };
}) satisfies PageLoad;
