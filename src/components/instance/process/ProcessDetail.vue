<style scoped>
.spin {
  margin-top: 200px;
}
.content {
  margin-left: 10px;
  margin-right: 10px;
}
.card-title {
  color: white;
  padding: 10px;
}
.card-pid {
  font-size: 15px;
  font-weight: bold;
}
.card-cmd {
  margin-top: 3px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.cpu-memory {
  margin-top: 20px;
}
.chart-title {
  margin-bottom: 10px;
  height: 24px;
}
.status-title {
  font-size: 15px;
  font-weight: bold;
  display: inline-block;
}
.status-icon {
  margin-left: 10px;
  color: white;
  padding: 2px 6px;
  display: inline-block;
}
.healthy {
  background-color: #19be6b;
}
.warning {
  background-color: #ff9900;
}
.error {
  background-color: #ed4014;
}
.status-desc {
  margin-left: 5px;
  display: inline-block;
}
.duration-radio {
  display: flex;
  margin-top: 20px;
}
</style>

<template>
  <div>
    <Drawer :title="title" :closable="false" v-model="status" :width="width">
      <Row type="flex" justify="center">
        <Col v-if="loading" span="1">
          <Spin class="spin"></Spin>
        </Col>
        <Col v-if="!loading" span="24" class="content">
          <Row :style="titleStyle" class="card-title" :gutter="8" type="flex" align="middle">
            <Col span="8">
              <Row class="card-pid">PID: {{ pid }}</Row>
              <Row class="card-cmd">{{ cmd }}</Row>
            </Col>
            <Col span="16">
              <Row :gutter="8" type="flex" justify="center">
                <Col span="4">
                  <Button ghost long @click="takeAction('cpu_profiling')">CPU Profiling</Button>
                </Col>
                <Col span="4">
                  <Button ghost long @click="takeAction('heap_profiling')">Heap Profiling</Button>
                </Col>
                <Col span="4">
                  <Button ghost long @click="takeAction('heapdump')">堆快照</Button>
                </Col>
                <Col span="4">
                  <Button ghost long @click="takeAction('gc_tracing')">GC 追踪</Button>
                </Col>
                <Col span="5">
                  <Button ghost long @click="takeAction('diag_report')">Node.js 实时诊断报告</Button>
                </Col>
              </Row>
            </Col>
          </Row>

          <!-- <div class="duration-radio">
            <div>请选择时间间隔：</div>
            <RadioGroup v-model="duration">
              <Radio label="1d">
                <span>1 天</span>
              </Radio>
              <Radio label="2d">
                <span>2 天</span>
              </Radio>
              <Radio label="3d">
                <span>3 天</span>
              </Radio>
            </RadioGroup>
          </div> -->

          <!-- cpu & memory charts -->
          <Row class="cpu-memory">
            <Col span="12">
              <Col class="chart-title">
                <div class="status-title">堆内存趋势</div>
                <div v-if="memortStatus === 'healthy'" class="status-icon healthy">健康态</div>
                <div v-if="memortStatus === 'healthy'" class="status-desc">堆内存使用率在正常范围内 ( 0 - 60% )</div>
                <div v-if="memortStatus === 'warning'" class="status-icon warning">警告态</div>
                <div v-if="memortStatus === 'warning'" class="status-desc">堆内存使用率偏高 ( 60% - 85% )</div>
                <div v-if="memortStatus === 'error'" class="status-icon error">紧急态</div>
                <div v-if="memortStatus === 'error'" class="status-desc">堆内存使用率极高 ( 85%+ )</div>
              </Col>
              <x-area
                id="process-memory-detail"
                :status="status"
                :fields="['rss', 'heap_total', 'heap_used']"
                :chart-data="memoryTrend"
                :formatter="memoryFormatter"
                :care-key="['heap_total']"
                @shouldCareValue="shouldCareMemoryValue"
                @pushChart="pushChart"
                @clearChart="clearChart"
                @plotmove="plotmove"
                @plotleave="plotleave"
              ></x-area>
            </Col>
            <Col span="12">
              <Col class="chart-title">
                <div class="status-title">CPU 趋势</div>
                <div v-if="cpuStatus === 'healthy'" class="status-icon healthy">健康态</div>
                <div
                  v-if="cpuStatus === 'healthy'"
                  class="status-desc"
                >一分钟内 CPU 平均使用率在正常范围内 ( 0 - 60% )</div>
                <div v-if="cpuStatus === 'warning'" class="status-icon warning">警告态</div>
                <div
                  v-if="cpuStatus === 'warning'"
                  class="status-desc"
                >一分钟内 CPU 平均使用率偏高 ( 60% - 85% )</div>
                <div v-if="cpuStatus === 'error'" class="status-icon error">紧急态</div>
                <div v-if="cpuStatus === 'error'" class="status-desc">一分钟内 CPU 平均使用率极高 ( 85%+ )</div>
              </Col>
              <x-area
                id="process-cpu-detail"
                :status="status"
                :fields="['cpu_now', 'cpu_15', 'cpu_30', 'cpu_60']"
                :chart-data="cpuTrend"
                :formatter="cpuFormatter"
                :care-key="['cpu_60']"
                @shouldCareValue="shouldCareCpuValue"
                @pushChart="pushChart"
                @clearChart="clearChart"
                @plotmove="plotmove"
                @plotleave="plotleave"
              ></x-area>
            </Col>
          </Row>

          <!-- heap memory detail -->
          <Row :gutter="24">
            <Col span="8">
              <div class="chart-title status-title">堆空间组成</div>
              <x-pie
                id="process-heap-detail-pie"
                :status="status"
                :fields="['new_space', 'old_space', 'code_space', 'map_space', 'lo_space']"
                title="space_name"
                position="size"
                :chart-data="heapMemoryDetail"
                :percent-formatter="cpuFormatter"
                :position-formatter="memoryFormatter"
                :lable-formatter="heapMemoryPieFormatter"
              ></x-pie>
            </Col>
            <Col span="16">
              <div class="chart-title status-title"></div>
              <x-area
                id="process-heap-detail"
                :status="status"
                :fields="['new_space', 'old_space', 'code_space', 'map_space', 'lo_space']"
                :chart-data="heapTrend"
                :formatter="memoryFormatter"
                :care-key="[]"
                @pushChart="pushChart"
                @clearChart="clearChart"
                @plotmove="plotmove"
                @plotleave="plotleave"
              ></x-area>
            </Col>
          </Row>

          <!-- gc & libuvhandles -->
          <Row>
            <Col span="12">
              <Col class="chart-title">
                <div class="status-title">GC 趋势</div>
                <div v-if="gcStatus === 'healthy'" class="status-icon healthy">健康态</div>
                <div v-if="gcStatus === 'healthy'" class="status-desc">一分钟内 GC 平均耗费在正常范围内 ( 0 - 5% )</div>
                <div v-if="gcStatus === 'warning'" class="status-icon warning">警告态</div>
                <div v-if="gcStatus === 'warning'" class="status-desc">一分钟内 GC 平均耗费偏高 ( 5% - 15% )</div>
                <div v-if="gcStatus === 'error'" class="status-icon error">紧急态</div>
                <div v-if="gcStatus === 'error'" class="status-desc">一分钟内 GC 平均耗费极高 ( 15%+ )</div>
              </Col>
              <x-area
                id="process-gc-detail"
                :status="status"
                :fields="['scavange_duration', 'marksweep_duration']"
                :chart-data="gcTrend"
                :formatter="cpuFormatter"
                :care-key="['scavange_duration', 'marksweep_duration']"
                @shouldCareSumValue="shouldCareGcSumValue"
                @pushChart="pushChart"
                @clearChart="clearChart"
                @plotmove="plotmove"
                @plotleave="plotleave"
              ></x-area>
            </Col>
            <Col span="12">
              <Col class="chart-title">
                <div class="status-title">Libuv Active Handles 趋势</div>
              </Col>
              <x-area
                id="process-handle-detail"
                :status="status"
                :fields="['active_handles']"
                :chart-data="handleTrend"
                :formatter="commonFormatter"
                :care-key="[]"
                @pushChart="pushChart"
                @clearChart="clearChart"
                @plotmove="plotmove"
                @plotleave="plotleave"
              ></x-area>
            </Col>
          </Row>

          <!-- timer & tcp -->
          <Row>
            <Col span="12">
              <Col class="chart-title">
                <div class="status-title">Timer 趋势</div>
              </Col>
              <x-area
                id="process-timer-detail"
                :status="status"
                :fields="['timer_handles_active']"
                :chart-data="timerTrend"
                :formatter="commonFormatter"
                :care-key="[]"
                @pushChart="pushChart"
                @clearChart="clearChart"
                @plotmove="plotmove"
                @plotleave="plotleave"
              ></x-area>
            </Col>
            <Col span="12">
              <Col class="chart-title">
                <div class="status-title">TCP 趋势</div>
              </Col>
              <x-area
                id="process-tcp-detail"
                :status="status"
                :fields="['tcp_handles_active']"
                :chart-data="tcpTrend"
                :formatter="commonFormatter"
                :care-key="[]"
                @pushChart="pushChart"
                @clearChart="clearChart"
                @plotmove="plotmove"
                @plotleave="plotleave"
              ></x-area>
            </Col>
          </Row>
        </Col>
      </Row>
    </Drawer>
  </div>
</template>

<script>
import area from "../../charts/Area";
import pie from "../../charts/Pie";
import processDetail from "../../../javascript/instance/process/processDetail";

const processDetailModule = Object.assign(
  {
    data() {
      return {
        status: false,
        loading: false,
        heapLimit: null,
        memoryTrend: [],
        cpuTrend: [],
        heapTrend: [],
        gcTrend: [],
        handleTrend: [],
        timerTrend: [],
        tcpTrend: [],
        heapMemoryDetail: {},
        cpuStatus: null,
        memortStatus: null,
        gcStatus: null,
        charts: [],
        duration: "1d"
      };
    },
    props: ["open", "width", "titleStyle", "pid", "cmd", "appId", "agentId"],
    components: {
      "x-area": area,
      "x-pie": pie
    },
    created() {
      this.status = this.open;
    }
  },
  processDetail
);

export default processDetailModule;
</script>
