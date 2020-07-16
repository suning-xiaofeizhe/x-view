'use strict';

import axios from "axios";
import * as common from "./common";

export default {
  methods: {
    updateLoadingStatus(status, loading) {
      if (status === 1) {
        this.cancelLoading = loading;
      } else {
        this.confirmLoading = loading;
      }
    },
    updateInvitation(status) {
      const error = '更新邀请状态失败，请重试！';
      this.updateLoadingStatus(status, true);
      axios({
        method: 'PUT',
        url: '/api/member/invitation',
        headers: {
          'x-csrf-token': common.getCsrfToken()
        },
        data: { status, appId: this.invitation.appId }
      }).then(data => {
        data = data.data;
        if (data.ok) {
          this.$emit('updateInvitation');
        } else {
          common.error.call(this, data.message || `${error}`, data.code);
        }
        this.updateLoadingStatus(status, false);
      }).catch(err => {
        common.error.call(this, `${error} ${err}`, err.code);
        this.updateLoadingStatus(status, false);
      });
    },
    rejectInvitation() {
      this.updateInvitation(1);
    },
    confirmInvitation() {
      this.updateInvitation(2);
    }
  }
};
