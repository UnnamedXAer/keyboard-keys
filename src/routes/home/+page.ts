import { loadContent } from '../../helpers/text';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ fetch }) => {
  return {
    content: loadContent(fetch),
  };
};
