<style scoped>
.alarm-key {
  text-align: right;
  font-size: 13px;
  padding-top: 7px;
  /* font-weight: bold; */
}
.alarm-value {
  text-align: left;
  padding-left: 20px;
}
.line {
  margin-top: 15px;
}
.setted-rules {
  margin-top: 12px;
  margin-left: 20px;
  margin-right: 20px;
  margin-bottom: 10px;
  /* width: 100%; */
}
.express {
  font-family: Menlo, Monaco, Consolas, "Courier New", monospace;
}
.title {
  color: #3d4350;
}
.alert {
  color: #ed4014;
}
.disabled {
  color: #c5c8ce;
}
</style>>

<template>
  <div>
    <Row class="info-bar">
      <Col class="info-content">
        {{ appName }}
        > 运维报警
      </Col>
    </Row>
    <Row ref="configureRule" class="info-divider"></Row>
    <Row class="info-prompt" style="margin-top:-10px;">
      <Alert>
        <Icon class="message-icon" type="ios-alert-outline" />目前开放了配置告警判定上下文为
        <code class="alert">XNPP 插件日志</code> /
        <code class="alert">OS 信息日志</code> /
        <code class="alert">X-Agent 通知信息</code> 以及
        <code class="alert">Node.js 错误日志</code> 四大类告警规则
      </Alert>
    </Row>
    <Row type="flex" justify="start">
      <Col style="margin-left:20px">
        <Tag color="primary" size="large">配置告警项</Tag>
      </Col>
    </Row>
    <Row>
      <Col :span="keySpan" class="alarm-key">
        <span>判定上下文类型</span>
      </Col>
      <Col :span="valueSpan" class="alarm-value">
        <Select v-model="selectedContextType" style="width:260px">
          <Option
            v-for="contextType in contextTypeList"
            :value="contextType.value"
            :key="contextType.value"
            :disabled="contextType.disabled"
          >{{ contextType.label }}</Option>
        </Select>
      </Col>
    </Row>
    <Row class="line">
      <Col :span="keySpan" class="alarm-key">
        <span>消息推送级别</span>
      </Col>
      <Col :span="valueSpan" class="alarm-value">
        <Select v-model="selectedPushType" style="width:260px">
          <Option
            v-for="pushType in pushTypeList"
            :value="pushType.value"
            :key="pushType.value"
            :disabled="pushType.disabled"
          >{{ pushType.label }}</Option>
        </Select>
      </Col>
    </Row>
    <Row class="line pre-setted-rules">
      <Col :span="keySpan" class="alarm-key">
        <span>预设规则列表</span>
      </Col>
      <Col :span="valueSpan" class="alarm-value">
        <Select
          @on-change="updateFastRule"
          clearable
          v-model="selectedPreSettedRules"
          style="width:500px"
          placeholder="自定义规则"
        >
          <Option
            v-for="rule in preSettedRules"
            :value="rule.value"
            :key="rule.value"
            :disabled="rule.disabled"
          >{{ rule.label }}</Option>
        </Select>
      </Col>
    </Row>
    <Row class="line">
      <Col :span="keySpan" class="alarm-key">
        <span>自定义阈值表达式</span>
      </Col>
      <Col :span="valueSpan" class="alarm-value">
        <Input clearable v-model="dsl" placeholder="eg. @cpu_60 > 90" style="width: 500px" />
      </Col>
    </Row>
    <Row class="line">
      <Col :span="keySpan" class="alarm-key">
        <span>告警消息内容</span>
      </Col>
      <Col :span="valueSpan" class="alarm-value">
        <Input
          clearable
          v-model="expr"
          placeholder="实例 ${@agent_id} 上的进程 ${@pid} CPU 使用率超过 90%，为 ${@cpu_60}%"
          style="width: 500px"
        />
      </Col>
    </Row>
    <Row class="line">
      <Col :span="keySpan" class="alarm-key">
        <span></span>
      </Col>
      <Col :span="valueSpan" class="alarm-value">
        <Button
          v-if="!shouldShowUpdate"
          @click="addRule"
          type="info"
          :loading="addRuleLoading"
        >添加告警项</Button>
        <Button v-if="shouldShowUpdate" @click="cancelUpdateRule" ghost type="info">取消</Button>
        <Button
          v-if="shouldShowUpdate"
          @click="updateRule"
          type="info"
          :loading="updateRuleLoading"
          style="margin-left:10px;"
        >更新告警项</Button>
      </Col>
    </Row>
    <Row class="info-divider" style="margin-top:40px"></Row>
    <Row type="flex" justify="start" style="margin-top:-12px">
      <Col style="margin-left:20px">
        <Tag color="primary" size="large">已配置列表</Tag>
      </Col>
    </Row>
    <Row class="setted-rules">
      <Row v-if="userRulesLoading" type="flex" justify="center">
        <Col style="margin-top:50px;">
          <Spin></Spin>
        </Col>
      </Row>
      <Col v-if="!userRulesLoading">
        <Table :columns="settedRuleColumn" :data="settedRuleList" no-data-text="暂无告警配置">
          <template slot-scope="{ row }" slot="pushType">
            <span v-if="row.status === 1" class="title">{{ getPushType(row.pushType) }}</span>
            <span v-if="row.status !== 1" class="title disabled">{{ getPushType(row.pushType) }}</span>
          </template>
          <template slot-scope="{ row }" slot="contextType">
            <span v-if="row.status === 1" class="title">{{ getContextType(row.contextType) }}</span>
            <span
              v-if="row.status !== 1"
              class="title disabled"
            >{{ getContextType(row.contextType) }}</span>
          </template>
          <template slot-scope="{ row }" slot="dsl">
            <span v-if="row.status === 1" class="express">{{ row.dsl }}</span>
            <span v-if="row.status !== 1" class="express disabled">{{ row.dsl }}</span>
          </template>
          <template slot-scope="{ row }" slot="expr">
            <span v-if="row.status === 1" class="express">{{ row.expr }}</span>
            <span v-if="row.status !== 1" class="express disabled">{{ row.expr }}</span>
          </template>
          <template slot-scope="{ row }" slot="alarmList">
            <Badge v-if="row.status === 1" :count="row.count" overflow-count="999">
              <Button type="primary" ghost size="small" @click="showAlarmList(row)">告警列表</Button>
            </Badge>
            <Button
              v-if="row.status !== 1"
              type="primary"
              ghost
              size="small"
              @click="showAlarmList(row)"
              disabled
            >告警列表</Button>
          </template>
          <template slot-scope="{ row }" slot="action">
            <Button
              v-if="row.status === 1"
              type="primary"
              ghost
              size="small"
              style="margin-right: 5px"
              @click="showMemberSetting(row)"
            >联系人设置</Button>
            <Button
              v-if="row.status !== 1"
              type="primary"
              ghost
              size="small"
              style="margin-right: 5px"
              @click="showMemberSetting(row)"
              disabled
            >联系人设置</Button>
            <Dropdown
              v-if="row.status === 1"
              style="text-align: center;margin-left:10px"
              @on-click="selectMoreAction"
            >
              <a href="javascript:void(0)">
                更多
                <Icon type="ios-arrow-down"></Icon>
              </a>
              <DropdownMenu slot="list">
                <DropdownItem :name="JSON.stringify({ row, action: 'edit' })">编辑</DropdownItem>
                <DropdownItem :name="JSON.stringify({ row, action: 'disable' })">禁用</DropdownItem>
                <DropdownItem :name="JSON.stringify({ row, action: 'delete' })">删除</DropdownItem>
              </DropdownMenu>
            </Dropdown>
            <Button
              size="small"
              type="success"
              v-if="row.status !== 1"
              style="margin-left:10px"
              @click="updateRuleStatus(row, 1)"
            >启用</Button>
          </template>
        </Table>
      </Col>
    </Row>

    <!-- show alarm list modal -->
    <x-alarm-list
      :show="showAlarmListModal"
      :loading="alarmListModalLoading"
      :cancel="function() { showAlarmListModal = false; }"
      :data="alarmListData"
      :get-context-type="getContextType"
      @modalStatusChanged="updateAlarmListModalStatus"
    ></x-alarm-list>

    <!-- show alarm member setting modal -->
    <x-alarm-member-setting
      :show="showAlarmMemberSettingModal"
      :loading="alarmMemberSettingModalLoading"
      :remove-contact-loading="removeContactLoading"
      :add-contact-loading="addContactLoading"
      :cancel="function() { showAlarmMemberSettingModal = false; }"
      :data="alarmMemberSettingData"
      :rule="alarmMemberSettingRule"
      @modalStatusChanged="updateAlarmMemberSettingModalStatus"
      @removeFromContactList="removeFromContactList"
      @addToContactList="addToContactList"
    ></x-alarm-member-setting>
  </div>
</template>

<script>
import alarm from "../javascript/alarm";
import alarmList from "./alarm/AlarmList";
import alarmMemberSetting from "./alarm/Member";

const alarmModule = Object.assign(
  {
    data() {
      return {
        appId: "",
        keySpan: 8,
        valueSpan: 16,
        selectedContextType: "node_log",
        contextTypeList: [
          { value: "node_log", label: "XNPP 插件日志" },
          { value: "system_log", label: "操作系统信息日志" },
          { value: "error_log", label: "Node.js 错误日志" },
          { value: "xagent_notification", label: "X-Agent 通知信息" }
        ],
        selectedPushType: "p3",
        pushTypeList: [
          { value: "p1", label: "P1 (致电)" },
          { value: "p2", label: "P2 (短信)" },
          { value: "p3", label: "P3 (邮件)" },
          { value: "p4", label: "P4 (数据记录)" }
        ],
        selectedPreSettedRules: "",
        preSettedRules: [
          { value: "fast_rule_memory", label: "进程 Memory 使用率预警" },
          { value: "fast_rule_cpu", label: "进程 CPU 使用率预警" },
          { value: "fast_rule_os_memory", label: "系统 Memory 使用率预警" },
          { value: "fast_rule_os_cpu", label: "系统 CPU 使用率预警" },
          // {
          //   value: "fast_rule_coredump",
          //   label: "Coredump 生成预警",
          //   disabled: true
          // },
          {
            value: "fast_rule_disk_usage",
            label: "磁盘使用率预警"
          },
          {
            value: "fast_rule_error_log_content",
            label: "特定错误日志预警"
          },
          {
            value: "fast_rule_expired_request",
            label: "慢响应预警 (超过 30s)"
          },
          {
            value: "fast_rule_illegal_request",
            label: "异常请求预警 (4xx 5xx 占比过高)"
          },
          {
            value: "fast_rule_node_process_exit",
            label: "Node.js 进程退出预警"
          },
          {
            value: "fast_rule_dependence_security_risk",
            label: "Npm 安全漏洞预警"
          }
        ],
        dsl: "",
        expr: "",
        settedRuleColumn: [
          { title: "推送级别", slot: "pushType", width: 130 },
          { title: "上下文类型", slot: "contextType", width: 150 },
          { title: "阈值表达式", slot: "dsl", width: 260 },
          { title: "告警消息内容", slot: "expr" },
          { title: "已有告警", slot: "alarmList", width: 100 },
          { title: "操作", slot: "action", width: 175 }
        ],
        settedRuleList: [],
        addRuleLoading: false,
        userRulesLoading: false,
        showAlarmListModal: false,
        alarmListModalLoading: false,
        alarmListData: {},
        showAlarmMemberSettingModal: false,
        alarmMemberSettingModalLoading: false,
        alarmMemberSettingData: {},
        alarmMemberSettingRule: "",
        removeContactLoading: false,
        addContactLoading: false,
        ruleEditData: null,
        updateRuleLoading: false
      };
    },
    props: ["appName", "globalRule"],
    components: {
      "x-alarm-list": alarmList,
      "x-alarm-member-setting": alarmMemberSetting
    },
    created() {
      this.appId = this.$route.params.appId;
      this.getRuleList();
    },
    mounted() {
      const query = this.$route.query;
      if (!!query.showAlarmListModal && query.strategyId) {
        this.showAlarmList({ strategyId: query.strategyId });
      }
    }
  },
  alarm
);
export default alarmModule;
</script>
