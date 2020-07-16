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
.line {
  height: 5px;
}
.select,
.line:hover {
  -webkit-transform: scaleY(1.2);
  transform: scaleY(1.2);
  /* box-shadow: 0 0 10px rgb(153, 216, 255); */
  /* border: 1px solid rgb(153, 216, 255); */
}
.tip-title {
  background: #2d8cf0;
  color: white;
  padding: 5px 10px;
  font-weight: bold;
  /* line-height:15px; */
}
.tip-content {
  padding: 10px;
}
.tip-content-key {
  font-weight: bold;
}
.tip-content-value {
  /* font-size: 5px; */
  font-family: "PingFangSC-Regular";
}
.process-timeline {
  min-height: 100px;
}
.process-time {
  margin-top: 10px;
  text-align: right;
  font-size: 13px;
  font-weight: bold;
  color: #515a6e;
}
.process-default {
  height: 5px;
  background: #c5c8ce;
}
.process-card {
  margin-top: 7px;
}
.process-card-title {
  padding: 10px 15px;
  /* padding-left: 15px; */
}
.process-card-pid {
  text-align: left;
  font-weight: bold;
  font-size: 17px;
  color: white;
}
.process-card-cmd {
  text-align: left;
  color: white;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  /* font-size: 12px; */
}
.process-card-content {
  padding: 10px;
  background: #f8f8f9;
}
.process-card-key {
  /* font-weight: bold; */
  color: #515a6e;
}
.process-card-value {
  margin-top: 5px;
  font-weight: bold;
  color: #17233d;
  font-size: 13px;
}
.action-title {
  text-align: left;
  font-weight: bold;
  font-size: 13px;
  margin-left: 12px;
}
.process-info-divider {
  /* height: 25px; */
  /* margin-left: 20px; */
  margin-top: 15px;
  margin-bottom: 15px;
  /* margin-right: 20px; */
  border-top: 1px solid #dcdee2;
}
.agent-process-header {
  text-align: left;
  font-weight: bold;
  font-size: 14px;
  margin-top: 10px;
  margin-bottom: 10px;
}
.agent-process-cmd {
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB",
    "Microsoft YaHei", "\5FAE\8F6F\96C5\9ED1", Arial, sans-serif;
}
.process-content {
  display: flex;
}
.process-metrics {
  flex: 1;
}
.process-panel {
  flex: 0 0 265px;
  max-width: 265px;
}
</style>>

<template>
  <div class="content">
    <Row ref="process-body">
      <Row>
        <Col span="18">
          <Row>
            <Col span="12" ref="main-charts"></Col>
          </Row>
        </Col>
      </Row>
      <Row v-if="processDataLoading">
        <Row type="flex" justify="center" style="margin-top:150px;">
          <Col span="1">
            <Spin size="large"></Spin>
          </Col>
        </Row>
      </Row>
      <Row v-if="!processDataLoading">
        <Row v-if="!xagentConnectedStatus">
          <Row class="dashboard-message-tip">
            <Icon type="ios-information-circle-outline" />
            <span>无法连接到此实例，请确认当前实例已安装且启动 x-agent，并正确配置了 appid 和 secret</span>
          </Row>
        </Row>
        <Row v-if="xagentConnectedStatus">
          <Row v-if="!processDataUploaded" style="margin-bottom:10px;">
            <Row class="info-prompt" style="margin-left:0;margin-right:0;">
              <Alert>
                <Icon class="message-icon" type="ios-alert-outline" />暂无监控数据，可能是当前实例未正确配置 x-agent 的日志目录，如果已确认正确配置 x-agent 日志目录请等待 1min 以初始化上报第一次进程数据
              </Alert>
            </Row>
            <Row class="agent-process-header">Node.js 进程列表</Row>
            <Row>
              <Table :columns="processColumns" :data="processes">
                <template slot-scope="{ row }" slot="pid">
                  <strong>{{ row.pid }}</strong>
                </template>
                <template slot-scope="{ row }" slot="command">
                  <span class="agent-process-cmd">{{ row.command }}</span>
                </template>
                <template slot-scope="{ row }" slot="action">
                  <Button
                    type="primary"
                    size="small"
                    style="margin-right: 5px"
                    @click="checkProcess(row)"
                  >检查进程</Button>
                </template>
              </Table>
            </Row>
          </Row>
          <div v-if="processDataUploaded" class="process-content">
            <div class="process-metrics">
              <Row class="process-timeline">
                <Row class="section-header">进程存活时间线</Row>
                <Row v-for="(xnode, index) in xnodeList" :key="index" type="flex" justify="end">
                  <div :style="index !== 0 ? 'width:100%;margin-top: 8px;':'width:100%;'">
                    <div
                      :style="`height:5px;width:${xnode.span.pre}%;background:#c5c8ce;float:left`"
                    ></div>
                    <a
                      @click="selectProcess(xnode)"
                      @mouseover="showTooltip(xnode, $event)"
                      @mousemove="showTooltip(xnode, $event)"
                      @mouseout="resetTooltip(xnode, $event)"
                    >
                      <div
                        :class="xnode.class"
                        :style="`height:5px;width:${xnode.span.active}%;float:left;${xnode.style}` "
                      ></div>
                    </a>
                    <div
                      :style="`height:5px;width:${xnode.span.after}%;background:#c5c8ce;float:left`"
                    ></div>
                  </div>
                  <!-- <Col :span="xnode.span.pre">
                    <div class="process-default" :style="index !== 0 ? 'margin-top: 8px;':''"></div>
                  </Col>
                  <Col :span="xnode.span.active">
                    <a
                      @click="selectProcess(xnode)"
                      @mouseover="showTooltip(xnode, $event)"
                      @mousemove="showTooltip(xnode, $event)"
                      @mouseout="resetTooltip(xnode, $event)"
                    >
                      <div :class="xnode.class" :style="xnode.style"></div>
                    </a>
                  </Col>
                  <Col :span="xnode.span.after">
                    <div class="process-default" :style="index !== 0 ? 'margin-top: 8px;':''"></div>
                  </Col>-->
                </Row>
                <Row class="process-time">
                  <Col v-for="t in times" :key="t.hour + '.'+t.tip" span="3">{{ t.hour }}</Col>
                  <Col
                    style="font-size:10px"
                    v-for="(t, index) in times"
                    :key="index"
                    span="3"
                  >{{ t.tip }}</Col>
                </Row>
              </Row>
              <Row class="process-info-divider"></Row>
              <Row style="text-align:left;">
                <Row class="section-header">进程 CPU/Memory/GC 指标分布</Row>
                <Row style="margin-top:5px;" type="flex" justify="start">
                  <Col span="12">
                    <x-cpu-memory-scatter
                      style="margin-left:20px"
                      :char-data="cpuMemoryData"
                      :id="'cpuMemory'"
                      :width="scatterWidth"
                    ></x-cpu-memory-scatter>
                  </Col>
                  <Col span="12">
                    <x-memory-gc-scatter
                      :char-data="memoryGcData"
                      :id="'memoryGc'"
                      :width="scatterWidth"
                    ></x-memory-gc-scatter>
                  </Col>
                </Row>
              </Row>
            </div>

            <!-- process card -->
            <div class="process-panel">
              <Row type="flex" justify="end">
                <Button
                  size="small"
                  icon="md-search"
                  type="primary"
                  @click="showProcessList"
                >查看运行中的 Node.js 进程</Button>
              </Row>
              <Row type="flex" justify="end" class="process-card">
                <Col span="23">
                  <Row class="process-card-title" :style="processCardStyle">
                    <Row>
                      <Col span="16" class="process-card-pid">PID: {{ this.selectPid }}</Col>
                      <Col span="8">
                        <Dropdown @on-click="selectProcessAtDropDown">
                          <a style="color:white" href="javascript:void(0)">
                            进程列表
                            <Icon type="ios-arrow-down"></Icon>
                          </a>
                          <DropdownMenu slot="list">
                            <DropdownItem
                              v-for="(xnode, index) in xnodeList"
                              :key="index"
                              :name="xnode.pid"
                            >
                              <span :style="'font-weight:bold;color:'+xnode.color[0]">
                                <Icon type="md-egg" />
                              </span>
                              {{xnode.pid}}
                            </DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </Col>
                    </Row>
                    <div class="process-card-cmd">{{ processCmd }}</div>
                  </Row>
                  <Row class="process-card-content">
                    <Row style="margin-top:5px;">
                      <Col span="12">
                        <Row class="process-card-key">启动时间</Row>
                        <Row class="process-card-value">{{ processCreateDay }}</Row>
                        <Row
                          class="process-card-value"
                          style="margin-top:0px"
                        >{{ processCreateTime }}</Row>
                      </Col>
                      <Col span="12">
                        <Row class="process-card-key">更新时间</Row>
                        <Row class="process-card-value">{{ processUpdateDay }}</Row>
                        <Row
                          class="process-card-value"
                          style="margin-top:0px"
                        >{{ processUpdateTime }}</Row>
                      </Col>
                    </Row>
                    <Row style="margin-top:15px;">
                      <Col span="12">
                        <Row class="process-card-key">CPU 使用率</Row>
                        <Row class="process-card-value">{{ processCpuUsage }}</Row>
                      </Col>
                      <Col span="12">
                        <Row class="process-card-key">内存使用率</Row>
                        <Row class="process-card-value">{{ processMemoryUsage }}</Row>
                      </Col>
                    </Row>
                    <Row style="margin-top:15px;">
                      <Col span="12">
                        <Row class="process-card-key">GC 占比</Row>
                        <Row class="process-card-value">{{ processGcUsage }}</Row>
                      </Col>
                      <Col span="12">
                        <Row class="process-card-key">UV 存活句柄数 (Ref)</Row>
                        <Row class="process-card-value">{{ processLibuvActiveHandles }}</Row>
                      </Col>
                    </Row>
                    <Row style="margin-top:15px;">
                      <Col span="12">
                        <Row class="process-card-key">定时器数量</Row>
                        <Row class="process-card-value">{{ processTimers }}</Row>
                      </Col>
                      <Col span="12">
                        <Row class="process-card-key">TCP 活跃句柄数</Row>
                        <Row class="process-card-value">{{ processTcpActiveHandles }}</Row>
                      </Col>
                    </Row>
                    <Row class="action-title" style="margin-top:15px;">进程详细信息</Row>
                    <Row class="action-title" style="margin-top:10px;">
                      <Button
                        size="small"
                        type="success"
                        @click="checkProcess({ pid: selectPid })"
                        long
                        ghost
                      >获取 Node.js 进程状态</Button>
                    </Row>
                    <Row class="action-title" style="margin-top:15px;">
                      <Col span="12">
                        <Row type="flex" justify="start">
                          <Col span="22">
                            <Button size="small" type="success" @click="showProcessDetail" long>进程趋势</Button>
                          </Col>
                        </Row>
                      </Col>
                      <Col span="12">
                        <Row type="flex" justify="end">
                          <Col span="22">
                            <Button
                              size="small"
                              type="success"
                              long
                              @click="takeAction('save_process_data')"
                            >保存数据</Button>
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                    <Row class="action-title" style="margin-top:15px;">抓取性能数据</Row>
                    <Row class="action-title" style="margin-top:10px;">
                      <Col span="12">
                        <Row type="flex" justify="start">
                          <Col span="22">
                            <Button
                              size="small"
                              type="success"
                              long
                              @click="takeAction('cpu_profiling')"
                            >CPU Profiling</Button>
                          </Col>
                        </Row>
                      </Col>
                      <Col span="12">
                        <Row type="flex" justify="end">
                          <Col span="22">
                            <Button
                              size="small"
                              type="success"
                              long
                              @click="takeAction('heapdump')"
                            >堆快照</Button>
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                    <Row class="action-title" style="margin-top:15px;">
                      <Col span="12">
                        <Row type="flex" justify="start">
                          <Col span="22">
                            <Button
                              size="small"
                              type="success"
                              long
                              @click="takeAction('heap_profiling')"
                            >Heap Profiling</Button>
                          </Col>
                        </Row>
                      </Col>
                      <Col span="12">
                        <Row type="flex" justify="end">
                          <Col span="22">
                            <Button
                              size="small"
                              type="success"
                              long
                              @click="takeAction('gc_tracing')"
                            >GC 追踪</Button>
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                    <Row class="action-title" style="margin-top:15px;margin-bottom:10px;">
                      <Button
                        size="small"
                        type="success"
                        long
                        @click="takeAction('diag_report')"
                      >Node.js 实时诊断报告</Button>
                    </Row>
                  </Row>
                </Col>
              </Row>
            </div>
          </div>
        </Row>
      </Row>
    </Row>

    <!-- process list -->
    <x-process-list
      :open="showProcessListDrawer"
      :width="drawerWidth"
      :agent-id="agentId"
      :get-agent-processes="getAgentProcesses"
      @drawerStatusUpdated="updateProcessListDrawerStatus"
      @checkProcess="checkProcess"
    ></x-process-list>

    <!-- process detail -->
    <x-process-detail
      :open="showProcessDetailDrawer"
      :width="drawerWidth"
      :title-style="processCardStyle"
      :pid="selectPid"
      :cmd="processCmd"
      :app-id="appId"
      :agent-id="agentId"
      @drawerStatusUpdated="updateProcessDetailDrawerStatus"
      @action="takeAction"
    ></x-process-detail>

    <!-- tooltip -->
    <div
      v-for="(xnode, index) in xnodeList"
      :key="index"
      :ref="agentId + '::'+xnode.pid"
      class="tooltip"
    >
      <Row class="tip-title" :style="'background:' + xnode.color[0] + ';'">
        <Col>
          PID:
          <span>{{xnode.pid}}</span>
        </Col>
      </Row>
      <Row class="tip-content">
        <Row>
          <Col span="6" class="tip-content-key">启动命令：</Col>
          <Col span="18" class="tip-content-value">
            <span>{{xnode.cmd}}</span>
          </Col>
        </Row>
        <Row style="margin-top:3px">
          <Col span="6" class="tip-content-key">创建时间：</Col>
          <Col span="18" class="tip-content-value">
            <span>{{xnode.create}}</span>
          </Col>
        </Row>
        <Row style="margin-top:3px">
          <Col span="6" class="tip-content-key">更新时间：</Col>
          <Col span="18" class="tip-content-value">
            <span>{{xnode.update}}</span>
          </Col>
        </Row>
      </Row>
    </div>

    <!-- check list modal -->
    <x-check-list
      :show="showCheckListModal"
      :loading="checkListModalLoading"
      :cancel="function() { showCheckListModal = false; }"
      :data="checkListData"
      @modalStatusChanged="updateCheckListModalStatus"
    ></x-check-list>

    <!-- take actions -->
    <x-take-action
      :app-id="appId"
      :show="showTakeActionModal"
      :loading="takeActionModalLoading"
      :cancel="function() { showTakeActionModal = false; }"
      :data="takeActionData"
      @modalStatusChanged="updateTakeActionModalStatus"
    ></x-take-action>
  </div>
</template>

<script>
import process from "../../javascript/instance/process";
import cpuMemoryScatter from "../charts/CpuMemoryScatter";
import memoryGcScatter from "../charts/MemoryGcScatter";
import processList from "./process/ProcessList";
import processDetail from "./process/ProcessDetail";
import checkList from "./process/CheckList";
import takeAction from "./process/TakeAction";

const processModule = Object.assign(
  {
    props: ["appId", "agentId"],
    data() {
      return {
        selectPid: "无",
        xnodeList: [],
        times: [],
        processes: [],
        processDetails: [],
        cpuMemoryData: [],
        memoryGcData: [],
        scatterWidth: 0,
        showProcessListDrawer: false,
        showProcessDetailDrawer: false,
        drawerWidth: 0,
        processDataUploaded: false,
        processColumns: [
          {
            title: "PID",
            slot: "pid",
            width: 80
          },
          {
            title: "命令",
            slot: "command"
          },
          {
            title: "操作",
            slot: "action",
            width: 150
          }
        ],
        xagentConnectedStatus: false,
        processDataLoading: false,
        showCheckListModal: false,
        checkListModalLoading: false,
        checkListData: {},
        showTakeActionModal: false,
        takeActionModalLoading: false,
        takeActionData: {}
      };
    },
    components: {
      "x-cpu-memory-scatter": cpuMemoryScatter,
      "x-memory-gc-scatter": memoryGcScatter,
      "x-process-list": processList,
      "x-process-detail": processDetail,
      "x-check-list": checkList,
      "x-take-action": takeAction
    },
    created() {
      this.init();
    },
    mounted() {
      this.getChardWidth();
      this.getDrawerWidth();
      window.onresize = this.getDrawerWidth;
      this.showProcessDetailDrawer = !!parseInt(
        this.$route.query.showProcessDetailDrawer
      );
    }
  },
  process
);
export default processModule;
</script>
