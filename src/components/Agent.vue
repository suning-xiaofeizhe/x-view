<style scoped>
.agent-list {
  margin-left: 20px;
  margin-top: -5px;
  text-align: left;
}
.agent-list-select {
  width: 300px;
  margin-left: 10px;
  margin-top: -4px;
}
.agent-list-button {
  margin-left: 10px;
  margin-top: -4px;
}
.instance-tab {
  margin-left: 20px;
  margin-right: 20px;
  margin-top: 10px;
}
.tip {
  margin-top: 150px;
  font-size: 13px;
  color: #515a6e;
}
</style>

<template>
  <div>
    <Row class="info-bar">
      <Col class="info-content">
        {{ appName }}
        > 实例信息
        <Select
          class="agent-list-select"
          size="small"
          v-model="selectedAgent"
          placeholder="请选择实例 ID"
        >
          <Option v-for="item in agentList" :value="item.value" :key="item.value">{{ item.label }}</Option>
        </Select>
        <Button
          class="agent-list-button"
          size="small"
          type="primary"
          @click="checkInstance"
          :disabled="checkInstanceDisabled"
        >查看实例</Button>
      </Col>
    </Row>
    <div v-if="agentLoading">
      <Row class="info-divider"></Row>
      <Row type="flex" justify="center" style="margin-top:150px;">
        <Col span="1">
          <Spin size="large"></Spin>
        </Col>
      </Row>
    </div>
    <div v-if="!agentLoading">
      <div v-if="!agentList.length">
        <Row class="info-divider"></Row>
        <Row class="tip">
          <Icon type="ios-information-circle-outline" />
          <span>没有任何实例连接到此应用，请确认您的服务器上启动了 x-agent 并且填写了正确的 appid 和 secret</span>
        </Row>
      </div>
      <div v-if="agentList.length">
        <Row class="instance-tab">
          <Tabs v-model="instanceTab" :value="instanceTab">
            <TabPane label="进程数据" name="process" icon="ios-pulse"></TabPane>
            <TabPane label="系统数据" name="system" icon="md-laptop"></TabPane>
            <TabPane label="异常日志" name="error" icon="md-warning"></TabPane>
            <TabPane label="模块依赖" name="package" icon="md-git-branch"></TabPane>
          </Tabs>
        </Row>
        <instance-process
          v-if="instanceTab === 'process'"
          :app-id="appId"
          :agent-id="selectedAgent"
          @instanceStatus="updateCheckInstanceDisabled"
        ></instance-process>
        <instance-system v-if="instanceTab === 'system'" :app-id="appId" :agent-id="selectedAgent"></instance-system>
        <instance-error v-if="instanceTab === 'error'" :app-id="appId" :agent-id="selectedAgent"></instance-error>
        <instance-package
          v-if="instanceTab === 'package'"
          :app-id="appId"
          :agent-id="selectedAgent"
        ></instance-package>
      </div>
    </div>

    <!-- check os info modal -->
    <x-check-os
      :show="showCheckOSModal"
      :loading="checkOSModalLoading"
      :cancel="function() { showCheckOSModal = false; }"
      :data="checkOSData"
      @modalStatusChanged="updateCheckOSModalStatus"
    ></x-check-os>
  </div>
</template>

<script>
import agent from "../javascript/agent";
import process from "./instance/Process";
import system from "./instance/System";
import error from "./instance/ErrorLog";
import pkg from "./instance/Package";
import checkOS from "./instance/process/CheckOS";

const agentModule = Object.assign(
  {
    data() {
      return {
        appId: "",
        selectedAgent: "",
        agentList: [],
        instanceTab: "",
        agentLoading: false,
        showCheckOSModal: false,
        checkOSModalLoading: false,
        checkOSData: {},
        checkInstanceDisabled: true
      };
    },
    props: ["appName"],
    components: {
      "instance-process": process,
      "instance-system": system,
      "instance-error": error,
      "instance-package": pkg,
      "x-check-os": checkOS
    },
    created() {
      this.appId = this.$route.params.appId;
      this.agentLoading = true;
      this.getAgentList();
      this.selectedAgent = this.$route.query.agentId || "";
      this.instanceTab = this.$route.query.instanceTab || "process";
    }
  },
  agent
);
export default agentModule;
</script>
