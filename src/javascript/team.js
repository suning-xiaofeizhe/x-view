'use strict';

import axios from "axios";
import * as common from "./common";

export default {
  methods: {
    getMembers() {
      const error = '获取应用成员列表失败！';
      axios.get('/api/members', { params: { appId: this.appId } })
        .then(data => {
          data = data.data;
          if (data.ok) {
            data = data.data;
            if (Array.isArray(data.list)) {
              this.members = data.list;
            } else {
              this.members = [];
            }
          } else {
            common.error.call(this, data.message || `${error}`, data.code);
          }
        }).catch(err => common.error.call(this, `${error} ${err}`, err.code));
    },
    submitInvitationCancel() {
      const error = '撤回邀请失败，请重试！';
      this.cancelInvitationModalLoading = true;
      axios({
        method: 'DELETE',
        url: '/api/member/invitation',
        headers: {
          'x-csrf-token': common.getCsrfToken()
        },
        data: this.cancelInvitationData
      }).then(data => {
        data = data.data;
        if (data.ok) {
          this.getMembers();
        } else {
          common.error.call(this, data.message || `${error}`, data.code);
        }
        this.showCancelInvitationModal = false;
        this.cancelInvitationModalLoading = false;
      }).catch(err => {
        common.error.call(this, `${error} ${err}`, err.code);
        this.showCancelInvitationModal = false;
        this.cancelInvitationModalLoading = false;
      });
    },
    updateCancelInvitationModalStatus(status) {
      this.showCancelInvitationModal = status;
      // if (status === false) {
      //   this.cancelInvitationData = null;
      // }
    },
    invite() {
      // if (!this.invitedWorkId || !/^\d{8}$/.test(this.invitedWorkId)) {
      //   this.$Message.error("请输入八位正确的员工工号！");
      //   this.invitedWorkId = "";
      //   return;
      // }
      if (!this.invitedWorkId) {
        this.$Message.error("用户 ID 不能为空！");
        this.invitedWorkId = "";
        return;
      }
      this.showInviteModal = true;
    },
    updateInvitation(status) {
      this.showInviteModal = status;
      // if (status === false) {
      //   this.invitedWorkId = "";
      // }
    },
    submitInvitation() {
      const error = '邀请成员失败，请重试！';
      this.inviteModalLoading = true;
      axios({
        method: 'POST',
        url: '/api/member/invitation',
        headers: {
          'x-csrf-token': common.getCsrfToken()
        },
        data: { appId: this.appId, workId: this.invitedWorkId }
      }).then(data => {
        data = data.data;
        if (data.ok) {
          this.getMembers();
        } else {
          common.error.call(this, data.message || `${error}`, data.code);
        }
        this.showInviteModal = false;
        this.inviteModalLoading = false;
        this.invitedWorkId = "";
      }).catch(err => {
        common.error.call(this, `${error} ${err}`, err.code);
        this.showInviteModal = false;
        this.inviteModalLoading = false;
      });
    },
    submitTransferOwnerShip() {
      const error = '转交失败，请重试！';
      this.transferOwnerShipModalLoading = true;
      axios({
        method: 'POST',
        url: '/api/member/ownership',
        headers: {
          'x-csrf-token': common.getCsrfToken()
        },
        data: this.transferOwnerShipData
      }).then(data => {
        data = data.data;
        if (data.ok) {
          this.getMembers();
        } else {
          common.error.call(this, data.message || `${error}`, data.code);
        }
        this.showTransferOwnerShipModal = false;
        this.transferOwnerShipModalLoading = false;
      }).catch(err => {
        common.error.call(this, `${error} ${err}`, err.code);
        this.showTransferOwnerShipModal = false;
        this.transferOwnerShipModalLoading = false;
      });
    },
    updateTransferOwnerShipModalStatus(status) {
      this.showTransferOwnerShipModal = status;
      // if (status === false) {
      //   this.transferOwnerShipData = null;
      // }
    },
    submitRemoveMember() {
      const error = '移除失败，请重试！';
      this.removeMemberModalLoading = true;
      axios({
        method: 'DELETE',
        url: '/api/team/member',
        headers: {
          'x-csrf-token': common.getCsrfToken()
        },
        data: this.removeMemberData
      }).then(data => {
        data = data.data;
        if (data.ok) {
          this.getMembers();
        } else {
          common.error.call(this, data.message || `${error}`, data.code);
        }
        this.showRemoveMemberModal = false;
        this.removeMemberModalLoading = false;
      }).catch(err => {
        common.error.call(this, `${error} ${err}`, err.code);
        this.showRemoveMemberModal = false;
        this.removeMemberModalLoading = false;
      });
    },
    updateRemoveMemberModalStatus(status) {
      this.showRemoveMemberModal = status;
    },
    submitLeaveTeam() {
      const error = '离开失败，请重试！';
      this.leaveTeamModalLoading = true;
      axios({
        method: 'DELETE',
        url: '/api/member',
        headers: {
          'x-csrf-token': common.getCsrfToken()
        },
        data: this.leaveTeamData
      }).then(data => {
        data = data.data;
        if (data.ok) {
          window.location.href = '/';
        } else {
          common.error.call(this, data.message || `${error}`, data.code);
        }
        this.showLeaveTeamModal = false;
        this.leaveTeamModalLoading = false;
      }).catch(err => {
        common.error.call(this, `${error} ${err}`, err.code);
        this.showLeaveTeamModal = false;
        this.leaveTeamModalLoading = false;
      });
    },
    updateLeaveTeamModalStatus(status) {
      this.showLeaveTeamModal = status;
    }
  }
};
