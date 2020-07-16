'use strict';

import axios from "axios";
import * as common from "./common";

export default {
  methods: {
    createApp() {
      this.showCreateAppModal = true;
      this.newAppName = "";
    },
    submitNewAppCreation() {
      const error = "创建新应用失败，请重试！";
      if (!this.newAppName) {
        this.$Message.error('请输入新应用的名称！');
        return;
      }
      if (this.newAppName.length > 20) {
        this.$Message.error('应用名称不能超过 20 个字符！');
        return;
      }
      this.creationNewAppLoading = true;
      axios({
        method: 'POST',
        url: '/api/application',
        headers: {
          'x-csrf-token': common.getCsrfToken()
        },
        data: {
          appName: this.newAppName
        }
      }).then(data => {
        data = data.data;
        if (data.ok) {
          data = data.data;
          this.newAppInfo.name = data.appName;
          this.newAppInfo.id = data.appId;
          this.newAppInfo.secret = data.appSecret;
          this.showCreateAppResultModal = true;
          this.showCreateAppModal = false;
        } else {
          common.error.call(this, data.message || error, data.code);
        }
        this.creationNewAppLoading = false;
      }).catch(err => {
        common.error.call(this, `${error} ${err}`, err.code);
        this.creationNewAppLoading = false;
      });
    },
    cancelNewAppCreation() {
      this.showCreateAppModal = false;
    },
    confirmNewAppCreation() {
      this.showCreateAppResultModal = false;
      this.getApps();
    },
    getApps() {
      this.loadingAppData = true;
      const error = '获取 APP 列表失败，请刷新页面重试！';
      axios.get('/api/apps', { params: { type: this.appTab } }).then(data => {
        data = data.data;
        if (data.ok) {
          data = data.data;
          if (data && Array.isArray(data.list)) {
            this.appList = data.list;
          } else {
            this.appList = [];
          }
          if (data && Array.isArray(data.invitations)) {
            this.invitationList = data.invitations;
          } else {
            this.invitationList = [];
          }
        } else {
          common.error.call(this, data.message || error, data.code);
        }
        this.loadingAppData = false;
      }).catch(err => {
        common.error.call(this, `${error} ${err}`, err.code);
        this.loadingAppData = false;
      });
    },
    updateInvitation() {
      this.getApps();
    }
  },
  watch: {
    appTab() {
      if (this.$route.query.type !== this.appTab) {
        this.$router.push({
          path: '/console',
          query: { type: this.appTab }
        });
        this.appList = [];
        this.getApps();
      }
    },
    $route(to) {
      if (to.query.type !== this.appTab) {
        this.appTab = to.query.type;
        this.appList = [];
        this.getApps();
      }
    }
  },
  computed: {
    appTip() {
      if (this.appTab === 'myApps') {
        return '您的账号下没有任何应用，请点击右上角 【创建新应用】按钮进行创建';
      } else {
        return '您暂时没有加入任何应用';
      }
    }
  },
  updated() {
    this.$emit('appListChanged');
  }
};
