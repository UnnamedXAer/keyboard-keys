import { loadContent } from '../helpers/text';
import type { PageLoad } from './$types';

export const load = ((args) => {
	console.log('LOAD', args);
  return {
    content: loadContent(args.fetch),
  };
}) satisfies PageLoad;
