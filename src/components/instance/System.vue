<style scoped>
.content {
  margin-left: 20px;
  margin-right: 20px;
}
.section-header {
  text-align: left;
  font-weight: bold;
  font-size: 13px;
  line-height: 32px;
}
.status-title {
  font-weight: bold;
  margin-top: 10px;
  margin-bottom: 10px;
}
.chart {
  text-align: left;
}
</style>

<template>
  <div>
    <Row v-if="hasOsData" class="content">
      <!-- overview -->
      <Row class="section-header">基本系统信息概览</Row>
      <Row v-if="!overviewLoading">
        <Col span="8">
          <x-dashboard
            id="cpuUsage"
            type="CPU 使用率"
            :value="overviewData.cpuUsage"
            :status="status(overviewData.cpuUsage)"
          ></x-dashboard>
        </Col>
        <Col span="8">
          <x-dashboard
            id="memUsage"
            type="Mem 使用率"
            :value="overviewData.memUsage"
            :status="status(overviewData.memUsage)"
          ></x-dashboard>
        </Col>
        <Col span="8">
          <x-dashboard
            id="diskUsage"
            type="Disk 使用率"
            :value="overviewData.diskUsage"
            :status="status(overviewData.diskUsage)"
            :title="overviewData.diskMounted"
          ></x-dashboard>
        </Col>
      </Row>
      <!-- overview loading -->
      <div v-else type="flex" style="height: 255px;text-align:center">
        <Row type="flex" justify="center">
          <Col span="1">
            <Spin size="large" style="padding-top:100px"></Spin>
          </Col>
        </Row>
      </div>

      <!-- detail -->
      <Row class="section-header">24h 内系统详细数据</Row>
      <Row v-if="!detailLoading">
        <!-- os cpu -->
        <Col span="12">
          <div class="status-title">系统 CPU 趋势</div>
          <x-area
            class="chart"
            id="osinfo-cpu-detail"
            :status="false"
            :fields="['os_cpu']"
            :chart-data="detailData.cpuTrend"
            :formatter="cpuFormatter"
            :care-key="[]"
            @pushChart="pushChart"
            @clearChart="clearChart"
            @plotmove="plotmove"
            @plotleave="plotleave"
          ></x-area>
        </Col>

        <!-- os memory -->
        <Col span="12">
          <div class="status-title">系统 Memory 趋势 ({{ memoryFormatter(detailData.totalMem) }})</div>
          <x-area
            class="chart"
            id="osinfo-mem-detail"
            :status="false"
            :fields="['os_mem']"
            :chart-data="detailData.memTrend"
            :formatter="cpuFormatter"
            :care-key="[]"
            @pushChart="pushChart"
            @clearChart="clearChart"
            @plotmove="plotmove"
            @plotleave="plotleave"
          ></x-area>
        </Col>

        <!-- os load -->
        <Col span="12">
          <div class="status-title">系统 Load 负载趋势</div>
          <x-area
            class="chart"
            id="osinfo-load-detail"
            :status="false"
            :fields="['load1', 'load5', 'load15']"
            :chart-data="detailData.loadTrend"
            :care-key="[]"
            @pushChart="pushChart"
            @clearChart="clearChart"
            @plotmove="plotmove"
            @plotleave="plotleave"
          ></x-area>
        </Col>

        <!-- process count -->
        <Col span="12">
          <div class="status-title">系统 Node.js 进程数趋势</div>
          <x-area
            class="chart"
            id="osinfo-node-detail"
            :status="false"
            :fields="['node_count']"
            :chart-data="detailData.nodeTrend"
            :care-key="[]"
            @pushChart="pushChart"
            @clearChart="clearChart"
            @plotmove="plotmove"
            @plotleave="plotleave"
          ></x-area>
        </Col>

        <!-- disk -->
        <Col span="24">
          <div class="status-title">系统磁盘使用趋势</div>
          <x-area
            class="chart"
            id="osinfo-disk-detail"
            :status="false"
            :fields="detailData.diskFields"
            :chart-data="detailData.diskTrend"
            :formatter="cpuFormatter"
            :care-key="[]"
            @pushChart="pushChart"
            @clearChart="clearChart"
            @plotmove="plotmove"
            @plotleave="plotleave"
          ></x-area>
        </Col>

        <!-- http status qps -->
        <Col span="12">
          <div class="status-title">QPS 趋势</div>
          <x-area
            class="chart"
            id="osinfo-qps"
            :status="false"
            :fields="['qps']"
            :chart-data="detailData.qpsTrend"
            :care-key="[]"
            @pushChart="pushChart"
            @clearChart="clearChart"
            @plotmove="plotmove"
            @plotleave="plotleave"
          ></x-area>
        </Col>

        <!-- http  rt -->
        <Col span="12">
          <div class="status-title">HTTP 响应时间趋势</div>
          <x-area
            class="chart"
            id="osinfo-rt"
            :status="false"
            :fields="['rt']"
            :chart-data="detailData.rtTrend"
            :formatter="val => val + 'ms'"
            :care-key="[]"
            @pushChart="pushChart"
            @clearChart="clearChart"
            @plotmove="plotmove"
            @plotleave="plotleave"
          ></x-area>
        </Col>

        <!-- http status response trend -->
        <Col span="12">
          <div class="status-title">HTTP 状态码趋势</div>
          <x-area
            class="chart"
            id="osinfo-response"
            :status="false"
            :fields="detailData.responseFields"
            :chart-data="detailData.responseTrend"
            :care-key="[]"
            @pushChart="pushChart"
            @clearChart="clearChart"
            @plotmove="plotmove"
            @plotleave="plotleave"
          ></x-area>
        </Col>

        <!-- http timeout -->
        <Col span="12">
          <div class="status-title">HTTP 响应超时状况 (30s)</div>
          <x-area
            class="chart"
            id="osinfo-expired-detail"
            :status="false"
            :fields="['expired_count']"
            :chart-data="detailData.expiredTrend"
            :care-key="[]"
            @pushChart="pushChart"
            @clearChart="clearChart"
            @plotmove="plotmove"
            @plotleave="plotleave"
          ></x-area>
        </Col>
      </Row>

      <!-- detail loading -->
      <div v-else type="flex" style="height: 405px;text-align:center">
        <Row type="flex" justify="center">
          <Col span="1">
            <Spin size="large" style="padding-top:150px"></Spin>
          </Col>
        </Row>
      </div>
    </Row>

    <!-- no data -->
    <Row v-else class="content dashboard-message-tip">
      <Icon type="ios-information-circle-outline" />
      <span>项目下暂无 OS 信息，请确认您已正确配置 x-agent 且等待 1min 以初始化上报第一次系统数据</span>
    </Row>
  </div>
</template>

<script>
import dashbord from "../charts/Dashboard";
import area from "../charts/Area";
import system from "../../javascript/instance/system";
const processModule = Object.assign(
  {
    data() {
      return {
        hasOsData: true,
        overviewLoading: false,
        detailLoading: false,
        overviewData: {
          cpuUsage: 0,
          memUsage: 0,
          diskUsage: 0,
          diskMounted: ""
        },
        detailData: {
          cpuTrend: [],
          memTrend: [],
          totalMem: 0,
          loadTrend: [],
          nodeTrend: [],
          diskTrend: [],
          diskFields: [],
          qpsTrend: [],
          responseFields: ["200"],
          responseTrend: [],
          rtTrend: [],
          expiredTrend: []
        },
        charts: []
      };
    },
    props: ["appId", "agentId"],
    components: {
      "x-dashboard": dashbord,
      "x-area": area
    }
  },
  system
);
export default processModule;
</script>
