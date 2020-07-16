<style scoped>
.layout {
  background: #f5f7f9;
  position: relative;
  overflow: hidden;
}
</style>
<template>
  <div class="layout">
    <x-header :active-name="activeName"></x-header>
    <Layout>
      <Sider :width="80">
        <Menu
          style="width:80px;min-height:100vh"
          theme="dark"
          :activeName="operation"
          @on-select="changeOperation"
        >
          <MenuItem name="agent">实例</MenuItem>
          <MenuItem name="file">文件</MenuItem>
          <MenuItem name="team">团队</MenuItem>
          <MenuItem name="alarm">告警</MenuItem>
          <MenuItem
            v-if="own"
            :class="operation === 'setting' ? 'ivu-menu-item-active' : ''"
            name="setting"
          >设置</MenuItem>
        </Menu>
      </Sider>
      <Content :style="{background: '#fff', minHeight: '500px'}">
        <x-agent v-if="operation === 'agent'" :app-name="appName"></x-agent>
        <x-file v-if="operation === 'file'" :app-name="appName" @xnodeAnalytics="xnodeAnalytics"></x-file>
        <x-team v-if="operation === 'team'" :app-name="appName"></x-team>
        <x-alarm v-if="operation === 'alarm'" :app-name="appName"></x-alarm>
        <x-setting
          v-if="operation === 'setting' && own"
          :app-name="appName"
          @updateAppName="updateAppName"
        ></x-setting>
        <x-analytics v-if="operation === 'analytics'" :data="analyticData"></x-analytics>
      </Content>
    </Layout>
  </div>
</template>
<script>
import header from "./Header";
import setting from "./Setting";
import alarm from "./Alarm";
import team from "./Team";
import file from "./File";
import agent from "./Agent";
import analytics from "./analytics/Index";
import detail from "../javascript/detail";
const detailModule = Object.assign(
  {
    data() {
      return {
        appId: 0,
        appName: "",
        own: false,
        activeName: "console",
        operation: "agent",
        analyticData: null
      };
    },
    components: {
      "x-header": header,
      "x-setting": setting,
      "x-alarm": alarm,
      "x-team": team,
      "x-file": file,
      "x-agent": agent,
      "x-analytics": analytics
    },
    created() {
      this.analyticData = this.$route.query;
      this.operation = this.$route.params.operation || "agent";
      this.appId = this.$route.params.appId || 0;
      this.getAppInfo();
    }
  },
  detail
);
export default detailModule;
</script>
