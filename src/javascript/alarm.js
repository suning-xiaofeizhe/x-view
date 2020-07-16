'use strict';

import axios from "axios";
import * as common from "./common";

const urls = {
  strategies: {
    global: '/api/alarm/global_strategies',
    default: '/api/alarm/strategies'
  },
  strategy: {
    global: '/api/alarm/global_strategy',
    default: '/api/alarm/strategy'
  },
  strategyStatus: {
    global: '/api/alarm/global_strategy_status',
    default: '/api/alarm/strategy_status'
  },
  list: {
    global: '/api/alarm/global_list',
    default: '/api/alarm/list'
  },
  members: {
    global: '/api/alarm/global_member_list',
    default: '/api/alarm/member_list'
  },
  member: {
    global: '/api/alarm/global_member',
    default: '/api/alarm/member'
  }
};

export default {
  methods: {
    getRuleList() {
      const error = '获取规则列表失败，请重试！';
      this.userRulesLoading = true;
      axios.get(urls.strategies[this.urlKey], { params: { appId: this.appId } })
        .then(data => {
          data = data.data;
          if (data.ok) {
            data = data.data;
            if (Array.isArray(data.list)) {
              this.settedRuleList = data.list;
            }
          } else {
            common.error.call(this, data.message || error, data.code);
          }
          this.userRulesLoading = false;
        })
        .catch(err => {
          common.error.call(this, `${error} ${err}`, err.code);
          this.userRulesLoading = false;
        });
    },
    checkAddRule() {
      if (!this.selectedContextType) {
        common.error.call(this, '请选择判定上下文类型!');
        return false;
      }
      if (!this.selectedPushType) {
        common.error.call(this, '请选择推送级别!');
        return false;
      }
      if (!this.dsl) {
        common.error.call(this, '请填写阈值表达式!');
        return false;
      }
      if (!this.expr) {
        common.error.call(this, '请填写告警消息内容!');
        return false;
      }
      return true;
    },
    addRule() {
      if (!this.checkAddRule()) {
        return;
      }
      const error = '添加告警规则失败，请重试！';
      this.addRuleLoading = true;
      axios({
        method: 'POST',
        url: urls.strategy[this.urlKey],
        headers: {
          'x-csrf-token': common.getCsrfToken()
        },
        data: {
          appId: this.appId,
          contextType: this.selectedContextType,
          pushType: this.selectedPushType,
          dsl: this.dsl,
          expr: this.expr
        }
      }).then(data => {
        data = data.data;
        if (data.ok) {
          this.getRuleList();
          this.reset();
        } else {
          common.error.call(this, data.message || error, data.code);
        }
        this.addRuleLoading = false;
      }).catch(err => {
        common.error.call(this, `${error} ${err}`, err.code);
        this.addRuleLoading = false;
      });
    },
    updateFastRule() {
      if (this.selectedPreSettedRules === 'fast_rule_memory') {
        this.selectedContextType = 'node_log';
        this.dsl = '@heap_used / @heap_limit > 0.7';
        this.expr = '已用堆内存超过堆上限的 70%，当前为 ${@heap_used / @heap_limit * 100}%';
      } else if (this.selectedPreSettedRules === 'fast_rule_cpu') {
        this.selectedContextType = 'node_log';
        this.dsl = '@cpu_60 > 80';
        this.expr = '1 分钟内 CPU 使用率超过 80%，当前为 ${@cpu_60}%';
      } else if (this.selectedPreSettedRules === 'fast_rule_coredump') {
        this.selectedContextType = 'xagent_notification';
        this.dsl = '@corefile_created';
        this.expr = '服务器生成 coredump 文件，路径为：${@corefile}，请分析查看原因!';
      } else if (this.selectedPreSettedRules === 'fast_rule_os_memory') {
        this.selectedContextType = 'system_log';
        this.dsl = '@os_mem_usage > 80';
        this.expr = '系统内存整体使用率超过 80%，当前为 ${@os_mem_usage}%';
      } else if (this.selectedPreSettedRules === 'fast_rule_os_cpu') {
        this.selectedContextType = 'system_log';
        this.dsl = '@os_cpu_usage > 80';
        this.expr = '系统 CPU 整体使用率超过 80%，当前为 ${@os_cpu_usage}%';
      } else if (this.selectedPreSettedRules === 'fast_rule_disk_usage') {
        this.selectedContextType = 'system_log';
        this.dsl = '@disk_usage > 85';
        this.expr = '磁盘 (${@mounted_on}) 占比超过 85%：为 ${@disk_usage}%';
      } else if (this.selectedPreSettedRules === 'fast_rule_error_log_content') {
        this.selectedContextType = 'error_log';
        this.dsl = '@error_type == "TypeError" || @error_type ==  "SyntaxError"';
        this.expr = '发生错误 ${@error_type}，堆栈是：${@stack}';
      } else if (this.selectedPreSettedRules === 'fast_rule_node_process_exit') {
        this.selectedContextType = 'xagent_notification';
        this.dsl = '@node_process_exit';
        this.expr = "实例 ${@agent_id} 上 Node.js 进程 ${@pid} 退出，命令信息：${@cmd}";
      } else if (this.selectedPreSettedRules === 'fast_rule_dependence_security_risk') {
        this.selectedContextType = 'xagent_notification';
        this.dsl = '@critical > 0 || @high > 0';
        this.expr = "项目依赖发现极危漏洞 ${@critical} 个，高危漏洞 ${@high} 个，请尽快升级修复";
      } else if (this.selectedPreSettedRules === 'fast_rule_expired_request') {
        this.selectedContextType = 'system_log';
        this.dsl = '@expired_request > 0';
        this.expr = "1 分钟内响应超过 30s 时请求出现 ${@expired_request} 个，请多加关注";
      } else if (this.selectedPreSettedRules === 'fast_rule_illegal_request') {
        this.selectedContextType = 'system_log';
        this.dsl = '@code_4xx / @http_response_sent + @code_5xx / @http_response_sent > 0.5';
        this.expr = "1 分钟内 4xx 和 5xx 请求数占比超过 50%，当前为 (${@code_4xx}, ${@code_5xx}) / ${@http_response_sent}";
      } else {
        this.selectedContextType = 'node_log';
        this.dsl = '';
        this.expr = '';
      }
    },
    getPushType(type) {
      for (const pushType of this.pushTypeList) {
        if (type === pushType.value) {
          return pushType.label;
        }
      }
      return type;
    },
    getContextType(type) {
      for (const contextType of this.contextTypeList) {
        if (type === contextType.value) {
          return contextType.label;
        }
      }
      return type;
    },
    updateAlarmListModalStatus(status) {
      this.showAlarmListModal = status;
      if (!status) {
        const query = this.$route.query;
        if (query.showAlarmListModal) {
          this.$router.push({ path: this.$route.path });
        }
      }
    },
    showAlarmList(row) {
      this.showAlarmListModal = true;
      this.alarmListModalLoading = true;
      const error = '获取告警列表失败，请重试！';
      axios.get(urls.list[this.urlKey], { params: { appId: this.appId, strategyId: row.strategyId } })
        .then(data => {
          data = data.data;
          this.alarmListData = data;
          this.alarmListModalLoading = false;
          const query = this.$route.query;
          if (!query.showAlarmListModal) {
            this.$router.push({
              path: this.$route.path,
              query: Object.assign({}, this.$route.query, { showAlarmListModal: 1, strategyId: row.strategyId })
            });
          }
        })
        .catch(err => {
          this.alarmListData = { ok: false, message: `${error} ${err}` };
          this.alarmListModalLoading = false;
        });
    },
    updateAlarmMemberSettingModalStatus(status) {
      this.showAlarmMemberSettingModal = status;
    },
    getMemberSetting(row) {
      const error = '获取告警联系人信息失败，请重试！';
      axios.get(urls.members[this.urlKey], { params: { appId: this.appId, strategyId: row.strategyId } })
        .then(data => {
          data = data.data;
          this.alarmMemberSettingData = data;
          this.alarmMemberSettingModalLoading = false;
        })
        .catch(err => {
          this.alarmMemberSettingData = { ok: false, message: `${error} ${err}` };
          this.alarmMemberSettingModalLoading = false;
        });
    },
    showMemberSetting(row) {
      this.showAlarmMemberSettingModal = true;
      this.alarmMemberSettingModalLoading = true;
      this.alarmMemberSettingRule = row.dsl;
      this.getMemberSetting(row);
    },
    removeFromContactList(row) {
      this.removeContactLoading = true;
      const error = '移出告警联系人列表失败，请重试！';
      axios({
        method: 'DELETE',
        url: urls.member[this.urlKey],
        headers: {
          'x-csrf-token': common.getCsrfToken()
        },
        data: {
          appId: this.appId,
          strategyId: row.strategyId,
          workId: row.workId
        }
      }).then(data => {
        data = data.data;
        if (data.ok) {
          this.getMemberSetting(row);
        } else {
          common.error.call(this, data.message || error, data.code);
        }
        this.removeContactLoading = false;
      }).catch(err => {
        common.error.call(this, `${error} ${err}`, err.code);
        this.removeContactLoading = false;
      });
    },
    addToContactList(row) {
      this.addContactLoading = true;
      const error = '添加至告警联系人列表失败，请重试！';
      axios({
        method: 'PUT',
        url: urls.member[this.urlKey],
        headers: {
          'x-csrf-token': common.getCsrfToken()
        },
        data: {
          appId: this.appId,
          strategyId: row.strategyId,
          workId: row.workId
        }
      }).then(data => {
        data = data.data;
        if (data.ok) {
          this.getMemberSetting(row);
        } else {
          common.error.call(this, data.message || error, data.code);
        }
        this.addContactLoading = false;
      }).catch(err => {
        common.error.call(this, `${error} ${err}`, err.code);
        this.addContactLoading = false;
      });
    },
    updateRuleStatus(row, status) {
      this.userRulesLoading = true;
      const error = `更新规则状态为 ${status === 1 ? '启用' : '禁用'} 失败，请重试`;
      axios({
        method: 'PUT',
        url: urls.strategyStatus[this.urlKey],
        headers: {
          'x-csrf-token': common.getCsrfToken()
        },
        data: {
          appId: this.appId,
          strategyId: row.strategyId,
          status
        }
      }).then(data => {
        data = data.data;
        if (data.ok) {
          this.getRuleList();
          this.reset();
        } else {
          common.error.call(this, data.message || error, data.code);
          this.updateRuleLoading = false;
        }
      }).catch(err => {
        common.error.call(this, `${error} ${err}`, err.code);
        this.userRulesLoading = false;
      });
    },
    deleteRule(row) {
      this.userRulesLoading = true;
      const error = `删除规则失败，请重试`;
      axios({
        method: 'DELETE',
        url: urls.strategy[this.urlKey],
        headers: {
          'x-csrf-token': common.getCsrfToken()
        },
        data: {
          appId: this.appId,
          strategyId: row.strategyId
        }
      }).then(data => {
        data = data.data;
        if (data.ok) {
          this.getRuleList();
          this.reset();
        } else {
          common.error.call(this, data.message || error, data.code);
          this.updateRuleLoading = false;
        }
      }).catch(err => {
        common.error.call(this, `${error} ${err}`, err.code);
        this.userRulesLoading = false;
      });
    },
    selectMoreAction(actionString) {
      const action = JSON.parse(actionString);
      if (action.action === 'edit') {
        this.ruleEditData = action.row;
        const configureRule = this.$refs['configureRule'];
        if (configureRule && configureRule.$el && typeof configureRule.$el.scrollIntoView === 'function') {
          configureRule.$el.scrollIntoView(true);
        }
      }
      if (action.action === 'disable') {
        this.updateRuleStatus(action.row, 0);
      }
      if (action.action === 'delete') {
        this.deleteRule(action.row);
      }
    },
    reset() {
      this.selectedContextType = 'node_log';
      this.selectedPushType = 'p3';
      this.selectedPreSettedRules = '';
      this.dsl = '';
      this.expr = '';
      this.ruleEditData = null;
    },
    cancelUpdateRule() {
      this.reset();
    },
    updateRule() {
      if (!this.checkAddRule()) {
        return;
      }
      if (!this.ruleEditData || !this.ruleEditData.strategyId) {
        common.error.call(this, '没有告警规则 Id!');
        return;
      }
      const error = '更新告警规则失败，请重试！';
      this.updateRuleLoading = true;
      axios({
        method: 'PUT',
        url: urls.strategy[this.urlKey],
        headers: {
          'x-csrf-token': common.getCsrfToken()
        },
        data: {
          appId: this.appId,
          contextType: this.selectedContextType,
          pushType: this.selectedPushType,
          dsl: this.dsl,
          expr: this.expr,
          strategyId: this.ruleEditData.strategyId
        }
      }).then(data => {
        data = data.data;
        if (data.ok) {
          this.getRuleList();
          this.reset();
        } else {
          common.error.call(this, data.message || error, data.code);
        }
        this.updateRuleLoading = false;
      }).catch(err => {
        common.error.call(this, `${error} ${err}`, err.code);
        this.updateRuleLoading = false;
      });
    }
  },
  computed: {
    shouldShowUpdate() {
      const ruleEditData = this.ruleEditData;
      return ruleEditData && ruleEditData.dsl && ruleEditData.expr &&
        ruleEditData.contextType && ruleEditData.pushType;
    },

    urlKey() {
      if (this.globalRule) {
        return "global";
      } else {
        return "default";
      }
    }
  },
  watch: {
    ruleEditData() {
      const ruleEditData = this.ruleEditData;
      if (this.shouldShowUpdate) {
        this.selectedContextType = ruleEditData.contextType;
        this.selectedPushType = ruleEditData.pushType;
        this.dsl = ruleEditData.dsl;
        this.expr = ruleEditData.expr;
      }
    }
  }
};
