<style scoped>
.create {
  position: absolute;
  right: 20px;
  z-index: 10;
  border-radius: 0px;
}
.content {
  margin: 20px;
}
.new-app-info {
  font-weight: bold;
}
.main-spin {
  margin-top: 150px;
}
.tip {
  margin-top: 150px;
  font-size: 13px;
  color: #515a6e;
}
</style>

<template>
  <div class="content">
    <Button class="create" type="primary" icon="md-add" @click="createApp">创建新应用</Button>
    <Tabs v-model="appTab" :value="appTab">
      <TabPane label="我的应用" name="myApps"></TabPane>
      <TabPane label="我加入的应用" name="joinedApps"></TabPane>
    </Tabs>
    <Row class="main-spin" v-if="loadingAppData" type="flex" justify="center">
      <Col>
        <Spin size="large"></Spin>
      </Col>
    </Row>
    <div v-show="!loadingAppData" style="margin-top:-15px">
      <transition name="common-transition">
        <div v-if="invitationList.length">
          <x-invitation
            style="margin-top:15px;"
            v-for="(invitation, invitationIndex) in invitationList"
            :invitation="invitation"
            :key="invitationIndex"
            @updateInvitation="updateInvitation"
          ></x-invitation>
        </div>
      </transition>
      <div v-if="!appList.length" class="tip">
        <Icon type="ios-information-circle-outline" />
        {{ appTip }}
      </div>
      <transition name="common-transition">
        <div v-if="appList.length">
          <x-app-view
            style="margin-top:15px;"
            v-for="(app, appIndex) in appList"
            :app="app"
            :index="appIndex"
            :key="appIndex"
          ></x-app-view>
        </div>
      </transition>
    </div>

    <!-- show create app modal -->
    <Modal style="border-radius:0px" v-model="showCreateAppModal" width="500" closable>
      <p slot="header" style="color:white;">
        <Icon type="ios-information-circle"></Icon>
        <span>创建新应用</span>
      </p>
      <div style="margin-top:25px;margin-bottom:15px;">
        <Input v-model="newAppName">
          <span slot="prepend">应用名称</span>
        </Input>
        <br />
        <span>
          <span style="font-weight:bold">注意</span>：应用名称最大长度不能超过 20 个字符
        </span>
      </div>
      <div slot="footer">
        <Button type="primary" ghost @click="cancelNewAppCreation">取消</Button>
        <Button type="primary" :loading="creationNewAppLoading" @click="submitNewAppCreation">提交</Button>
      </div>
    </Modal>

    <!-- show create app result modal -->
    <Modal style="border-radius:0px" v-model="showCreateAppResultModal" width="500" closable>
      <p slot="header" style="color:white;">
        <Icon type="ios-information-circle"></Icon>
        <span>创建新应用成功</span>
      </p>
      <div style="margin-top:25px;margin-bottom:15px;margin-left:70px;font-size:13px">
        <div>
          <span class="new-app-info">应用名称</span>
          ：
          {{ newAppInfo.name }}
        </div>
        <div style="margin-top:10px;margin-bottom:10px;">
          <span class="new-app-info">应用 ID</span>
          ：
          {{ newAppInfo.id }}
        </div>
        <div>
          <span class="new-app-info">应用 Secret</span>
          ：
          {{ newAppInfo.secret }}
        </div>
      </div>
      <div slot="footer">
        <Button type="primary" ghost @click="confirmNewAppCreation">关闭</Button>
        <Button
          :to="{path:`/app/${newAppInfo.id}/agent`, query: {appName: newAppInfo.name}}"
          type="primary"
        >打开新应用</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import homeTab from "../javascript/homeTab";
import appView from "./AppView";
import invitation from "./Invitation.vue";
const homeModule = Object.assign(
  {
    data() {
      return {
        showCreateAppModal: false,
        newAppName: "",
        creationNewAppLoading: false,
        showCreateAppResultModal: false,
        newAppInfo: {
          name: "",
          id: "",
          secret: ""
        },
        appTab: "",
        appList: [],
        invitationList: [],
        loadingAppData: false
      };
    },
    components: {
      "x-app-view": appView,
      "x-invitation": invitation
    },
    created() {
      this.appTab = this.$route.query.type || "myApps";
      this.getApps();
    }
  },
  homeTab
);
export default homeModule;
</script>
