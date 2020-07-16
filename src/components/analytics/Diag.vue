<style scoped>
.content {
  margin-top: 15px;
  margin-left: 20px;
  margin-right: 20px;
}
.detail {
  margin-left: 20px;
  margin-right: 20px;
  margin-bottom: 10px;
  font-family: Menlo, Monaco, Consolas, "Courier New", monospace;
  color: #24292e;
}
.diag-content {
  background-color: #f6f8fa;
  padding: 10px;
  padding-left: 17px;
  font-size: 90%;
  text-align: left;
  word-wrap: break-word;
  word-break: break-all;
  overflow: hidden;
}
.pagination {
  margin-top: 10px;
  text-align: right;
}
.system-tile {
  font-size: 16px;
}
</style>>

<template>
  <div>
    <Row class="info-bar">
      <Col class="info-content">
        诊断报告分析
        > {{ data.fileName }}
      </Col>
    </Row>
    <Row class="info-divider"></Row>
    <Row>
      <Row v-if="loading" type="flex" justify="center" style="margin-top:200px;">
        <Col span="1">
          <Spin></Spin>
        </Col>
      </Row>
      <Row v-if="!loading">
        <Row>
          <Col span="6">
            <Row class="analytics-overview-title">ProcessID</Row>
            <Row class="analytics-overview-value">{{ diag.pid }}</Row>
          </Col>
          <Col span="6">
            <Row class="analytics-overview-title">Node.js 版本</Row>
            <Row class="analytics-overview-value">{{ diag.nodeVersion }}</Row>
          </Col>
          <Col span="6">
            <Row class="analytics-overview-title">启动时间</Row>
            <Row class="analytics-overview-value">{{ diag.loadTime }}</Row>
          </Col>
          <Col span="6">
            <Row class="analytics-overview-title">生成时间</Row>
            <Row class="analytics-overview-value">{{ diag.dumpTime }}</Row>
          </Col>
        </Row>
        <Row>
          <Tabs v-model="messageType" :value="messageType" class="content">
            <TabPane label="JavaScript 栈" name="jsStack"></TabPane>
            <TabPane label="Native 栈" name="nativeStack"></TabPane>
            <TabPane label="堆内存分布" name="heap"></TabPane>
            <TabPane label="Libuv 句柄" name="libuv"></TabPane>
            <TabPane label="系统详情" name="system"></TabPane>
          </Tabs>
        </Row>
        <Row class="detail">
          <!-- js stacks -->
          <div v-if="messageType === 'jsStack'">
            <Table :columns="jsStack" :data="jsStackList" no-data-text="暂无 JavaScript 栈信息">
              <template slot-scope="{ row }" slot="pcAddress">
                <strong style="color:#c7254e">{{ row.pcAddress }}</strong>
              </template>
              <template slot-scope="{ row }" slot="frameType">
                <strong style="color:#c7254e">{{ row.frameType }}</strong>
              </template>
              <template slot-scope="{ row }" slot="url">
                <span style="color:#6f42c1">{{row.functionName}}</span>
                <span style="font-style:italic;color:#d73a49;">({{row.url}})</span>
              </template>
            </Table>
          </div>

          <!-- native stacks -->
          <div v-if="messageType === 'nativeStack'">
            <Table :columns="nativeStack" :data="nativeStackList" no-data-text="暂无 Native 栈信息">
              <template slot-scope="{ row }" slot="pcAddress">
                <strong style="color:#3ba3d8">{{ row.pcAddress }}</strong>
              </template>
              <template slot-scope="{ row }" slot="symbolInfo">
                <span style="color:#3ba3d8;">{{row.symbolName}}</span>
                <span v-if="row.os==='win32'" style="font-style:italic;color:#30bfda;">
                  <span>{{row.sharedObjectName}}</span>
                  <span v-if="row.offset !== undefined">[+{{row.offset}}]</span>
                  <span v-if="row.url !== undefined">in {{row.url}}</span>
                  <span v-if="row.lineNumber !== undefined">line: {{row.lineNumber}}</span>
                </span>
                <span v-else style="font-style:italic;color:#30bfda;">[{{row.sharedObjectName}}]</span>
              </template>
            </Table>
          </div>

          <!-- heap -->
          <div v-if="messageType === 'heap'" style="text-align:left">
            <Alert>
              <Icon class="message-icon" type="ios-alert-outline" />堆已使用内存:
              <span style="color:#c7254e">{{ getHeapTotal() }}</span>, V8 可分配内存上限:
              <span style="color:#c7254e">{{ getHeapLimit() }}</span>
            </Alert>
            <Row class="diag-content">
              <strong class="system-tile">Heap Spaces</strong>
              <Row
                v-for="(space, index) in spaces"
                :key="index"
                :style="(index !== 0 ? 'margin-top:5px;':'margin-top:5px;') + 'margin-left:10px'"
              >
                *
                <span>{{ getSpaceName(space) }}</span>
                <span style="color:#d73a49">:</span>
                <span style="color:#005cc5">{{ getSpaceSize(space) }}</span>
              </Row>
            </Row>
          </div>

          <!-- libuv -->
          <div v-if="messageType === 'libuv'">
            <Row class="info-prompt" style="margin-right:0;margin-left:0;">
              <Alert>
                <Icon class="message-icon" type="ios-alert-outline" />Libuv 句柄总数:
                <span style="color:#c7254e">{{ libuvTotalHandles.length }}</span>, 活跃句柄数:
                <span
                  style="color:#c7254e"
                >{{ libuvTotalHandles.filter(handle=>handle.active).length }}</span>
              </Alert>
            </Row>
            <Table :columns="libuv" :data="libuvHandles" no-data-text="暂无 Libuv 句柄信息">
              <template slot-scope="{ row }" slot="pcAddress">
                <strong v-if="row.active" style="color:#3ba3d8">{{ row.pcAddress }}</strong>
                <strong v-if="!row.active" style="color:#c5c8ce">{{ row.pcAddress }}</strong>
              </template>
              <template slot-scope="{ row }" slot="type">
                <strong v-if="row.active" style="color:#3ba3d8;">{{row.type}}</strong>
                <strong v-if="!row.active" style="color:#c5c8ce;">{{row.type}}</strong>
              </template>
              <template slot-scope="{ row }" slot="detail">
                <span v-if="row.active" style="color:#1570a6 !important;">{{row.detail}}</span>
                <span v-if="!row.active" style="color:#c5c8ce;">{{row.detail}}</span>
              </template>
            </Table>
            <Row v-if="libuvTotalHandles.length" class="pagination">
              <Page
                :total="libuvTotalHandles.length"
                :page-size="libuvPageSize"
                :current="libuvCurrentPage"
                size="small"
                show-elevator
                @on-change="changePage"
              />
            </Row>
          </div>

          <!-- system info -->
          <div v-if="messageType === 'system'">
            <Row class="info-prompt" style="margin-right:0;margin-left:0;">
              <Alert>
                <Icon class="message-icon" type="ios-alert-outline" />系统信息：
                <span style="color:#c7254e">{{ diag.osVersion }}</span>
              </Alert>
            </Row>
            <Row class="diag-content">
              <Row>
                <strong class="system-tile">Env</strong>
                <Row v-for="(env, index) in envList" :key="index">
                  <Row style="margin-left:10px;">
                    *
                    <span>{{env.key}}</span>
                    <span style="color:#d73a49">:</span>
                    <span style="color:#229954">"{{env.value}}"</span>
                  </Row>
                </Row>
              </Row>
              <Row style="margin-top:10px">
                <strong class="system-tile">Resource Limit</strong>
                <Row v-for="(resource, index) in resources" :key="index">
                  <Row style="margin-left:10px;">
                    *
                    <span>{{resource.type}}</span>
                    <span style="color:#d73a49">:</span>
                    <span style="color:#">Soft</span>
                    <span style="color:#005cc5">{{resource.softLimit}}</span>
                    <span style="color:#">Hard</span>
                    <span style="color:#005cc5">{{resource.hardLimit}}</span>
                  </Row>
                </Row>
              </Row>
              <Row style="margin-top:10px">
                <strong class="system-tile">Loaded Libraries</strong>
                <Row v-for="(lib, index) in loadedLibs" :key="index">
                  <Row style="margin-left:10px;">
                    *
                    <span>{{lib}}</span>
                  </Row>
                </Row>
              </Row>
            </Row>
          </div>
        </Row>
      </Row>
    </Row>
  </div>
</template>

<script>
import diag from "../../javascript/analytics/diag";
const diagModule = Object.assign(
  {
    data() {
      return {
        loading: false,
        diag: {},
        messageType: "",
        jsStack: [
          { title: "寄存器指令地址", slot: "pcAddress", width: 140 },
          { title: "函数类型", slot: "frameType", width: 100, align: "center" },
          { title: "函数信息", slot: "url" }
        ],
        nativeStack: [
          { title: "寄存器指令地址", slot: "pcAddress", width: 140 },
          {
            title: "Native 符号和共享库（动态/静态链接库）信息",
            slot: "symbolInfo"
          }
        ],
        libuv: [
          { title: "寄存器指令地址", slot: "pcAddress", width: 140 },
          { title: "句柄类型", slot: "type", width: 100 },
          { title: "句柄详细信息", slot: "detail" }
        ],
        libuvCurrentPage: 1,
        libuvPageSize: 10
      };
    },
    props: ["data"],
    created() {
      this.getDiag();
      this.messageType = this.$route.query.messageType || "jsStack";
      this.libuvCurrentPage = Number(this.$route.query.libuvCurrentPage) || 1;
    }
  },
  diag
);
export default diagModule;
</script>
