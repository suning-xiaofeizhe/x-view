'use strict';

import axios from "axios";
import * as common from "./common";

export default {
  methods: {
    changeOperation(name) {
      if (this.operation !== name) {
        const appId = this.$route.params.appId;
        this.$router.push({
          path: `/app/${appId}/${name}`
          // query: this.$route.query
        });
        this.operation = name;
      }
    },
    getAppInfo() {
      const error = "获取 App 信息失败！";
      axios.get('/api/application', { params: { appId: this.appId } }).then(data => {
        data = data.data;
        if (data.ok) {
          data = data.data;
          this.appName = data.name;
          this.own = data.own;
        } else {
          common.error.call(this, data.message || `${error}`, data.code);
        }
      }).catch(err => common.error.call(this, `${error} ${err}`, err.code));
    },
    updateAppName(name) {
      this.appName = name;
    },
    xnodeAnalytics(data) {
      const appId = this.$route.params.appId;
      const { href } = this.$router.resolve({
        path: `/app/${appId}/analytics`,
        query: data
      });
      window.open(href, '_blank');
    }
  }
};
