import api from './douyu_livebc';
import BaseClass from './menu';

const app = () => {
  api.initScript();
  new BaseClass();
};

export default app;
