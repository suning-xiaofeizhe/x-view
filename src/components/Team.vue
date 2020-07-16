<style scoped>
.add-member {
  margin-left: 20px;
  margin-top: 7px;
  margin-right: 20px;
}
.member-confirm {
  /* margin-left: 0px; */
  margin-top: 1px;
}
.show-member {
  margin-left: 20px;
  margin-top: 20px;
  margin-right: 20px;
}
</style>>

<template>
  <div>
    <Row class="info-bar">
      <Col class="info-content">
        {{ appName }}
        > 团队协作
      </Col>
    </Row>
    <Row class="info-divider"></Row>
    <Row class="info-prompt" style="margin-top:-10px;">
      <Alert>
        <Icon class="message-icon" type="ios-alert-outline" />您可以在这里将本应用授权给其他同学，团队成员可以查看完整的监控数据以及生成的性能文件，进而一起对 Node.js 的应用故障进行排查和定位
      </Alert>
    </Row>
    <Row class="add-member">
      <Col span="6">
        <Input v-model="invitedWorkId" placeholder="请输入用户 ID">
          <span slot="prepend">添加新成员</span>
        </Input>
      </Col>
      <Col class="member-confirm" span="2">
        <Button type="info" @click="invite">确认</Button>
      </Col>
    </Row>
    <Row class="show-member">
      <Table no-data-text="暂无成员" :columns="title" :data="members"></Table>
    </Row>

    <!-- invite member -->
    <x-normal-modal
      :show="showInviteModal"
      :loading="inviteModalLoading"
      title="邀请成员"
      :body="`确认邀请成员 <span style='font-weight:bold'>${invitedWorkId}</span> 至本应用，请注意这里需要输入正确的用户 ID`"
      :cancel="function() { showInviteModal = false; }"
      :confirm="submitInvitation"
      @modalStatusChanged="updateInvitation"
    ></x-normal-modal>

    <!-- cancel invitation -->
    <x-normal-modal
      :show="showCancelInvitationModal"
      :loading="cancelInvitationModalLoading"
      title="撤回邀请"
      body="<span style='font-weight:bold'>注意：</span>将撤回向此用户的应用授权邀请，撤销后您仍然可以继续邀请此用户加入此应用"
      :cancel="function() { showCancelInvitationModal = false; }"
      :confirm="submitInvitationCancel"
      @modalStatusChanged="updateCancelInvitationModalStatus"
    ></x-normal-modal>

    <!-- transfer ownership -->
    <x-normal-modal
      :show="showTransferOwnerShipModal"
      :loading="transferOwnerShipModalLoading"
      title="转交权限"
      :body="`本应用的管理员权限将转交给用户 <span style='font-weight:bold'>${transferOwnerShipData && transferOwnerShipData.workId || ''}</span> ，转交后您将变为本应用的普通成员`"
      :cancel="function() { showTransferOwnerShipModal = false; }"
      :confirm="submitTransferOwnerShip"
      @modalStatusChanged="updateTransferOwnerShipModalStatus"
    ></x-normal-modal>

    <!-- remove member -->
    <x-normal-modal
      :show="showRemoveMemberModal"
      :loading="removeMemberModalLoading"
      title="移除成员"
      :body="`将会把成员 <span style='font-weight:bold'>${removeMemberData && removeMemberData.workId || ''}</span> 移出本应用，后续如有需要您仍然可以继续邀请此用户加入此应用`"
      :cancel="function() { showRemoveMemberModal = false; }"
      :confirm="submitRemoveMember"
      @modalStatusChanged="updateRemoveMemberModalStatus"
    ></x-normal-modal>

    <!-- leave team -->
    <x-normal-modal
      :show="showLeaveTeamModal"
      :loading="leaveTeamModalLoading"
      title="离开团队"
      :body="`将会离开此应用团队，离开后您将无法访问本应用的所有监控数据和生成的性能分析文件`"
      :cancel="function() { showLeaveTeamModal = false; }"
      :confirm="submitLeaveTeam"
      @modalStatusChanged="updateLeaveTeamModalStatus"
    ></x-normal-modal>
  </div>
</template>

<script>
import normalModal from "./common/NormalModal";
import team from "../javascript/team";
const teamModule = Object.assign(
  {
    data() {
      return {
        appId: "",
        title: [
          {
            title: "成员信息",
            key: "workId",
            // align: "center"
            render: (h, params) => {
              const userName = params.row.userName;
              const workId = params.row.workId;
              const show = userName ? `${workId} (${userName})` : workId;
              return h("div", [h("span", show)]);
            }
          },
          {
            title: "当前状态",
            key: "status",
            // align: "center",
            render: (h, params) => {
              const status = params.row.status;
              let show = "未知";
              if (status === 0) {
                show = "管理员";
              }
              if (status === 1) {
                show = "邀请中";
              }
              if (status === 2) {
                show = "已加入";
              }
              return h("div", [
                h(
                  "span",
                  {
                    style: {
                      marginLeft: "1px"
                    }
                  },
                  show
                )
              ]);
            }
          },
          {
            title: "加入时间",
            key: "joinedTime"
            // align: "center"
          },
          {
            title: "可执行的操作",
            key: "action",
            width: 190,
            // align: "center",
            render: (h, params) => {
              // current user is joined this app
              if (params.row.owner === 0) {
                if (params.row.currentUser === params.row.workId) {
                  return h("div", [
                    h(
                      "Button",
                      {
                        props: {
                          type: "warning",
                          size: "small"
                        },
                        style: {
                          marginLeft: "5px"
                        },
                        on: {
                          click: () => {
                            this.showLeaveTeamModal = true;
                            this.leaveTeamData = {
                              appId: this.appId,
                              workId: params.row.workId
                            };
                          }
                        }
                      },
                      "离开团队"
                    )
                  ]);
                }
                return;
              }
              // app owner
              if (params.row.currentUser === params.row.workId) {
                return;
              }
              if (params.row.status === 1) {
                return h("div", [
                  h(
                    "Button",
                    {
                      props: {
                        type: "warning",
                        size: "small"
                      },
                      style: {
                        width: "64px"
                      },
                      on: {
                        click: () => {
                          this.showCancelInvitationModal = true;
                          this.cancelInvitationData = {
                            appId: this.appId,
                            workId: params.row.workId
                          };
                        }
                      }
                    },
                    "撤回邀请"
                  )
                ]);
              }
              return h("div", [
                h(
                  "Button",
                  {
                    props: {
                      type: "primary",
                      size: "small"
                    },
                    style: {
                      marginRight: "10px"
                    },
                    on: {
                      click: () => {
                        this.showTransferOwnerShipModal = true;
                        this.transferOwnerShipData = {
                          appId: this.appId,
                          workId: params.row.workId
                        };
                      }
                    }
                  },
                  "转交权限"
                ),
                h(
                  "Button",
                  {
                    props: {
                      type: "error",
                      size: "small"
                    },
                    on: {
                      click: () => {
                        this.showRemoveMemberModal = true;
                        this.removeMemberData = {
                          appId: this.appId,
                          workId: params.row.workId
                        };
                      }
                    }
                  },
                  "移除成员"
                )
              ]);
            }
          }
        ],
        members: [],
        showInviteModal: false,
        inviteModalLoading: false,
        invitedWorkId: "",
        showCancelInvitationModal: false,
        cancelInvitationModalLoading: false,
        cancelInvitationData: null,
        showTransferOwnerShipModal: false,
        transferOwnerShipModalLoading: false,
        transferOwnerShipData: null,
        showRemoveMemberModal: false,
        removeMemberModalLoading: false,
        removeMemberData: null,
        showLeaveTeamModal: false,
        leaveTeamModalLoading: false,
        leaveTeamData: null
      };
    },
    props: ["appName"],
    components: {
      "x-normal-modal": normalModal
    },
    created() {
      this.appId = this.$route.params.appId;
      this.getMembers();
    }
  },
  team
);
export default teamModule;
</script>
