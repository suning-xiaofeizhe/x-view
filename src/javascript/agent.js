'use strict';

import axios from "axios";
import * as common from "./common";

export default {
  methods: {
    getAgentList() {
      const error = '获取应用实例列表，请刷新页面重试！';
      axios.get('/api/app/agent_list', { params: { appId: this.appId } })
        .then(data => {
          data = data.data;
          if (data.ok) {
            data = data.data;
            if (Array.isArray(data.list)) {
              this.agentList = data.list;
              if (data.list.length && !this.selectedAgent) {
                this.selectedAgent = data.list[0].value;
              }
            }
          } else {
            common.error.call(this, data.message || `${error}`, data.code);
          }
          this.agentLoading = false;
        })
        .catch(err => {
          this.agentLoading = false;
          common.error.call(this, `${error} ${err}`, err.code);
        });
    },
    updateCheckOSModalStatus(status) {
      this.showCheckOSModal = status;
    },
    checkInstance() {
      this.showCheckOSModal = true;
      this.checkOSModalLoading = true;
      const error = '获取实例详情失败，请重试！';
      axios.get(`/api/app/agent_info`, { params: { appId: this.appId, agentId: this.selectedAgent } })
        .then(data => {
          data = data.data;
          this.checkOSData = data;
          this.checkOSModalLoading = false;
        })
        .catch(err => {
          this.checkOSData = { ok: false, message: `${error} ${err}` };
          this.checkOSModalLoading = false;
        });
    },
    updateCheckInstanceDisabled(status) {
      this.checkInstanceDisabled = status;
    }
  },
  watch: {
    selectedAgent() {
      if (this.selectedAgent !== this.$route.query.agentId) {
        this.$router.push({
          path: this.$route.path,
          query: Object.assign({}, this.$route.query, { agentId: this.selectedAgent, selectPid: undefined })
        });
      }
    },
    instanceTab() {
      if (this.$route.query.instanceTab !== this.instanceTab) {
        this.$router.push({
          path: this.$route.path,
          query: { instanceTab: this.instanceTab, agentId: this.$route.query.agentId }
        });
      }
    },
    agentList() {
      this.checkInstanceDisabled = this.agentList.length === 0;
    }
  }
};
