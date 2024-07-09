import api from './douyu_bc_api';
import BaseClass from './menu';

const app = () => {
  api.initScript();
  new BaseClass();
};

export default app;
