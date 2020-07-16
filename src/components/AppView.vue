<style scoped>
.total {
  background-color: #fafbfd;
  display: flex;
}
.app-content {
  border-right: 1px dashed #c5c8ce;
  flex: 0 0 320px;
}
.app-name {
  font-size: 17px;
  text-align: left;
  margin-top: 17px;
  margin-left: 15px;
}
.app-menu {
  margin: 13px 0 15px 15px;
  color: #515a6e;
  display: flex;
  flex-wrap: wrap;
}
.app-menu-item {
  margin-left: 30px;
}
.app-icon {
  margin-top: 4px;
  font-size: 22px;
}
.overview {
  background-color: #fafbfd;
  flex: 1;
  display: flex;
}
.overview-metric-item {
  flex: 0 0 160px;
}
.overview-instance-item {
  flex: 1 0;
}
.overview-title {
  margin-top: 21px;
  font-size: 14px;
}
.overview-content {
  margin-top: 13px;
  margin-bottom: 5px;
  font-size: 20px;
  font-weight: bold;
}
.overview-content-loading {
  margin-top: 25px;
}
.overview-icon-disable {
  font-size: 18px;
  font-weight: bold;
  color: #c5c8ce;
}
.overview-icon-line {
  margin-top: -8px;
  margin-left: 30px;
  margin-right: 30px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}
.overview-icon-item {
  width: 28px;
}
.demo-spin-icon-load {
  animation: ani-demo-spin 1s linear infinite;
}
.link-color {
  color: #515a6e;
}
@keyframes ani-demo-spin {
  from {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(180deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>

<template>
  <div>
    <div type="flex" justify="center" class="total" :style="getRandomColor(index)">
      <div class="app-content">
        <div class="app-name">{{ app.appName }}</div>
        <div class="app-menu">
          <router-link
            :to="{path:`/app/${app.appId}/agent`, query:{appName:app.appName}}"
            class="link-color"
          >
            <div>
              <div>实例</div>
              <Icon class="app-icon" type="ios-grid" />
            </div>
          </router-link>
          <router-link
            :to="{path: `/app/${app.appId}/file`, query: {appName: app.appName}}"
            class="link-color"
          >
            <div class="app-menu-item">
              <div>文件</div>
              <Icon class="app-icon" type="ios-folder" />
            </div>
          </router-link>
          <router-link
            :to="{path: `/app/${app.appId}/team`, query: {appName: app.appName}}"
            class="link-color"
          >
            <div class="app-menu-item">
              <div>团队</div>
              <Icon class="app-icon" type="md-person-add" />
            </div>
          </router-link>
          <router-link
            :to="{path: `/app/${app.appId}/alarm`, query: {appName: app.appName}}"
            class="link-color"
          >
            <div class="app-menu-item">
              <div>报警</div>
              <Icon class="app-icon" type="ios-alarm" />
            </div>
          </router-link>
          <router-link v-if="app.own" :to="{path: `/app/${app.appId}/setting`}" class="link-color">
            <div class="app-menu-item" :style="app.own ? '' : 'color:#c5c8ce'">
              <div>设置</div>
              <Icon class="app-icon" type="md-build" />
            </div>
          </router-link>
        </div>
      </div>
      <div class="overview">
        <div class="overview-metric-item">
          <div class="overview-title">实例总数</div>
          <transition name="common-transition">
            <div
              v-if="!instanceCountLoading"
              class="overview-content"
            >{{ formatCount(instanceCount) }}</div>
          </transition>
          <Row
            v-if="instanceCountLoading"
            type="flex"
            justify="center"
            class="overview-content-loading"
          >
            <Col>
              <Spin size="small"></Spin>
            </Col>
          </Row>
        </div>
        <div class="overview-metric-item">
          <div class="overview-title">24h 报警数</div>
          <transition name="common-transition">
            <div v-if="!alarmCountLoading" class="overview-content">{{ formatCount(alarmCount) }}</div>
          </transition>
          <Row
            v-if="alarmCountLoading"
            type="flex"
            justify="center"
            class="overview-content-loading"
          >
            <Col>
              <Spin size="small"></Spin>
            </Col>
          </Row>
        </div>
        <div class="overview-instance-item">
          <div class="overview-title">Node 进程 CPU 平均负载</div>
          <Row
            v-if="cpuStatusLoading"
            type="flex"
            justify="center"
            class="overview-content-loading"
          >
            <Col>
              <Spin size="small"></Spin>
            </Col>
          </Row>
          <transition name="common-transition">
            <div v-if="!cpuStatusLoading" class="overview-content">
              <div v-if="!cpuStatus.length">-</div>
              <div v-if="cpuStatus.length" class="overview-icon-line" type="flex" justify="center">
                <div
                  :title="`CPU: ${cpu.status === '-' ? '-' : (cpu.cpuUsage+'%')}`"
                  :span="2"
                  v-for="(cpu, cpuIndex) in cpuStatus"
                  :key="cpuIndex"
                  class="overview-icon-item"
                >
                  <router-link
                    :to="{path:`/app/${app.appId}/agent`, query:{agentId:cpu.agentId, selectPid:cpu.pid}}"
                  >
                    <Icon
                      v-if="cpu.status == '-'"
                      class="overview-icon-disable"
                      type="ios-help-circle-outline"
                    />
                    <Icon
                      v-if="cpu.status == 0"
                      class="overview-icon-healthy"
                      type="md-checkmark-circle"
                    />
                    <Icon
                      v-if="cpu.status == 1"
                      class="overview-icon-warn"
                      type="md-checkmark-circle"
                    />
                    <Icon
                      v-if="cpu.status == 2"
                      class="overview-icon-error"
                      type="md-close-circle"
                    />
                  </router-link>
                </div>
              </div>
            </div>
          </transition>
        </div>
        <div class="overview-instance-item">
          <div class="overview-title">Node 进程 Memory 平均使用率</div>
          <Row
            v-if="memoryStatusLoading"
            type="flex"
            justify="center"
            class="overview-content-loading"
          >
            <Col>
              <Spin size="small"></Spin>
            </Col>
          </Row>
          <transition name="common-transition">
            <div v-if="!memoryStatusLoading" class="overview-content">
              <div v-if="!memoryStatus.length">-</div>
              <div
                v-if="memoryStatus.length"
                class="overview-icon-line"
                type="flex"
                justify="center"
              >
                <div
                  :title="`内存: ${mem.status === '-' ? '-' : (mem.memoryUsage+'%')}`"
                  :span="2"
                  v-for="(mem, memIndex) in memoryStatus"
                  :key="memIndex"
                  class="overview-icon-item"
                >
                  <router-link
                    :to="{path:`/app/${app.appId}/agent/`, query:{agentId:mem.agentId, selectPid:mem.pid}}"
                  >
                    <Icon
                      v-if="mem.status == '-'"
                      class="overview-icon-disable"
                      type="ios-help-circle-outline"
                    />
                    <Icon
                      v-if="mem.status == 0"
                      class="overview-icon-healthy"
                      type="md-checkmark-circle"
                    />
                    <Icon
                      v-if="mem.status == 1"
                      class="overview-icon-warn"
                      type="md-checkmark-circle"
                    />
                    <Icon
                      v-if="mem.status == 2"
                      class="overview-icon-error"
                      type="md-close-circle"
                    />
                  </router-link>
                </div>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import appView from "../javascript/appView";
const appViewModule = Object.assign(
  {
    data() {
      return {
        instanceCount: "-",
        instanceCountLoading: false,
        alarmCount: "-",
        alarmCountLoading: false,
        cpuStatus: [],
        cpuStatusLoading: false,
        memoryStatus: [],
        memoryStatusLoading: false
      };
    },
    props: ["app", "index"],
    created() {
      this.getInstanceCount();
      this.getAlarmCount();
      this.getNodeCpuAverageStatistics();
      this.getNodeMomeryAverageStatistics();
    }
  },
  appView
);
export default appViewModule;
</script>
