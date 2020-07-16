'use strict';

import axios from "axios";
import * as common from "./common";

export default {
  methods: {
    getUserInfo() {
      const error = `获取用户信息错误，请重试！`;
      axios.get('/api/user').then(data => {
        data = data.data;
        if (data.ok) {
          data = data.data;
          this.userName = data.name;
        } else {
          common.error.call(this, error, data.code);
        }
      }).catch(err => common.error.call(this, `${error} ${err}`, err.code));
    }
  }
};
