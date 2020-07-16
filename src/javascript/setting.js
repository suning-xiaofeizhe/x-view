'use strict';

import axios from "axios";
import * as common from "./common";

export default {
  methods: {
    getAppSecret() {
      const error = "获取秘钥失败！";
      axios.get('/api/app/info', { params: { appId: this.appId } }).then(data => {
        data = data.data;
        if (data.ok) {
          data = data.data;
          this.appSecret = data.secret;
        } else {
          common.error.call(this, data.message || `${error}`, data.code);
        }
      }).catch(err => common.error.call(this, `${error} ${err}`, err.code));
    },
    modifyAppName() {
      this.newAppName = this.appName;
      this.showModifyAppModal = true;
    },
    cancelModifyAppCreation() {
      this.showModifyAppModal = false;
    },
    submitNewAppName() {
      if (!this.newAppName) {
        this.$Message.error('请输入新应用的名称！');
        return;
      }
      if (this.newAppName === this.appName) {
        this.$Message.error('新应用名称不能和老应用一样！');
        return;
      }
      if (this.newAppName.length > 20) {
        this.$Message.error('应用名称不能超过 20 个字符！');
        return;
      }
      const error = "修改应用名失败！";
      this.modifyNewAppLoading = true;
      axios({
        method: 'POST',
        url: '/api/app/name',
        headers: {
          'x-csrf-token': common.getCsrfToken()
        },
        data: {
          appName: this.newAppName,
          appId: this.appId
        }
      }).then(data => {
        data = data.data;
        if (data.ok) {
          this.$emit('updateAppName', this.newAppName);
          // this.$Message.success("修改成功！");
        } else {
          common.error.call(this, data.message || `${error}`, data.code);
        }
        this.showModifyAppModal = false;
        this.modifyNewAppLoading = false;
      }).catch(err => {
        common.error.call(this, `${error} ${err}`, err.code);
        this.showModifyAppModal = false;
        this.modifyNewAppLoading = false;
      });
    },
    deleteApp() {
      this.showDeleteAppModal = true;
    },
    cancelDeleteAppCreation() {
      this.showDeleteAppModal = false;
    },
    submitAppDeletion() {
      const error = '删除应用失败！';
      this.deleteAppLoading = true;
      axios({
        method: 'DELETE',
        url: '/api/application',
        headers: {
          'x-csrf-token': common.getCsrfToken()
        },
        data: {
          appId: this.appId
        }
      }).then(data => {
        data = data.data;
        if (data.ok) {
          // this.$Message.success("删除应用成功，2s 后将跳转到控制台首页！");
          // setTimeout(() => {
          this.$router.push({ path: '/console' });
          // }, 2000);
        } else {
          common.error.call(this, data.message || `${error}`, data.code);
        }
        this.showDeleteAppModal = false;
        this.deleteAppLoading = false;
      }).catch(err => {
        common.error.call(this, `${error} ${err}`, err.code);
        this.showModifyAppModal = false;
        this.deleteAppLoading = false;
      });
    }
  }
};
