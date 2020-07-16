'use strict';

import axios from 'axios';
import * as common from '../common';

// const colorList = [
//   ['#9B59B6', '#C39BD3'],
//   ['#3498DB', '#85C1E9'],
//   ['#2d8cf0', '#5cadff'],
//   ['#16A085', '#73C6B6'],
//   ['#E67E22', '#F0B27A'],
//   ['#D35400', '#E59866'],
//   ['#F39C12', '#F8C471'],
//   ['#F1C40F', '#F7DC6F'],
//   ['#2ECC71', '#82E0AA'],
//   ['#27AE60', '#7DCEA0'],
//   ['#1ABC9C', '#76D7C4'],
//   ['#2980B9', '#7FB3D5'],
//   ['#8E44AD', '#BB8FCE']
// ];

// const colorList = [
//   ['#9B59B6', '#9B59B6'],
//   ['#3498DB', '#3498DB'],
//   ['#2d8cf0', '#2d8cf0'],
//   ['#16A085', '#16A085'],
//   ['#E67E22', '#E67E22'],
//   ['#D35400', '#D35400'],
//   ['#F39C12', '#F39C12'],
//   ['#F1C40F', '#F1C40F'],
//   ['#2ECC71', '#2ECC71'],
//   ['#27AE60', '#27AE60'],
//   ['#1ABC9C', '#1ABC9C'],
//   ['#2980B9', '#2980B9'],
//   ['#8E44AD', '#8E44AD']
// ];

const colorList = [
  ['#9B59B6', 'rgb(155, 89, 182, 0.4)'],
  ['#3498DB', 'rgb(52, 152, 219, 0.4)'],
  ['#2d8cf0', 'rgb(45, 140, 240, 0.4)'],
  ['#16A085', 'rgb(22, 160, 133, 0.4)'],
  ['#E67E22', 'rgb(230, 126, 34, 0.4)'],
  ['#D35400', 'rgb(211, 84, 0, 0.4)'],
  ['#F39C12', 'rgb(243, 156, 18, 0.4)'],
  ['#F1C40F', 'rgb(241, 196, 15, 0.4)'],
  ['#2ECC71', 'rgb(46, 204, 113, 0.4)'],
  ['#27AE60', 'rgb(39, 174, 96, 0.4)'],
  ['#1ABC9C', 'rgb(26, 188, 156, 0.4)'],
  ['#2980B9', 'rgb(41, 128, 185, 0.4)'],
  ['#8E44AD', 'rgb(142, 68, 173, 0.4)']
];

const disabledColor = ['#c5c8ce', '#CCD1D1'];

const week = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function escapeRegExp(string) {
  return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&');
}

export default {
  methods: {
    selectProcessAtDropDown(pid) {
      this.selectPid = pid;
    },
    selectProcess(xnode) {
      this.selectPid = xnode.pid;
      this.xnodeList.forEach(x => {
        if (x.pid === xnode.pid) {
          x.class += ' select';
          const boxStyle = this.getShadowStyle(xnode.color[1]);
          if (!xnode.style.includes(boxStyle)) {
            xnode.style += boxStyle;
          }
        } else {
          x.class = x.class.replace('select', '');
          const boxStyle = this.getShadowStyle(x.color[1]);
          // x.style = x.style.replace(new RegExp(boxStyle, 'g'), '');
          x.style = x.style.replace(new RegExp(escapeRegExp(boxStyle), 'g'), '');
        }
      });
    },
    getShadowStyle(color) {
      return `box-shadow:0 0 0 2px ${color};`;
    },
    showTooltip(xnode, d) {
      this.moveTooltip(xnode, d);
    },
    moveTooltip(xnode, d) {
      const boxStyle = this.getShadowStyle(xnode.color[1]);
      if (!xnode.style.includes(boxStyle)) {
        xnode.style += boxStyle;
      }
      const ele = this.$refs[this.agentId + '::' + xnode.pid][0];
      const tooltipHeight = parseInt(window.getComputedStyle(ele).height, 10);
      const tooltipWidth = parseInt(window.getComputedStyle(ele).width, 10);
      const pageWidth = parseInt(window.getComputedStyle(this.$refs["process-body"].$el).width, 10);
      const x = d.pageX + 10 + tooltipWidth < pageWidth
        ? d.pageX + 10 : d.pageX - 10 - tooltipWidth;
      const y = d.pageY > tooltipHeight
        ? d.pageY - ((tooltipHeight && tooltipHeight + 10))
        : d.pageY + 10;
      ele.style.display = 'inherit';
      ele.style['z-index'] = 9999;
      ele.style.left = x + "px";
      ele.style.top = y + "px";
    },
    resetTooltip(xnode) {
      if (this.selectPid !== xnode.pid) {
        const boxStyle = this.getShadowStyle(xnode.color[1]);
        // xnode.style = xnode.style.replace(new RegExp(boxStyle, 'g'), '');
        xnode.style = xnode.style.replace(new RegExp(escapeRegExp(boxStyle), 'g'), '');
      }
      const ele = this.$refs[this.agentId + '::' + xnode.pid][0];
      ele.style.display = 'none';
      ele.style['z-index'] = -9999;
      ele.style.left = "0px";
      ele.style.top = "0px";
    },
    getAgentProcesses() {
      const error = '获取实例进程失败';
      return axios.get(`/api/app/agent_process`, { params: { appId: this.appId, agentId: this.agentId } })
        .then(data => {
          data = data.data;
          if (data.ok) {
            return data.data;
          } else {
            throw new Error(data.message || error);
          }
        });
    },
    getAgentDetail() {
      const error = '获取实例详情失败';
      return axios.get(`/api/app/agent_detail`, { params: { appId: this.appId, agentId: this.agentId } })
        .then(data => {
          data = data.data;
          if (data.ok) {
            return data.data;
          } else {
            throw new Error(data.message || error);
          }
        });
    },
    init() {
      const error = '获取实例数据失败，请刷新页面重试！';
      this.processDataLoading = true;
      this.selectPid = parseInt(this.$route.query.selectPid) || "无";
      Promise.all([this.getAgentProcesses(), this.getAgentDetail()])
        .then(data => {
          const processesMap = data[0].processes.reduce((res, proc) => {
            res[proc.pid] = proc.command;
            return res;
          }, {});
          const detail = data[1];
          // processes
          this.xagentConnectedStatus = data[0].xagent;
          this.$emit('instanceStatus', !this.xagentConnectedStatus);
          this.processes = data[0].processes;
          // process detail
          this.processDetails = detail.detail;
          // default select pid
          if (detail.timeline.length) {
            if (this.selectPid === '无') {
              this.selectPid = detail.timeline[0].pid;
            }
            this.processDataUploaded = true;
          } else {
            this.processDataUploaded = false;
            this.selectPid = '无';
          }
          // timeline
          const start = Date.now() - 24 * 60 * 60 * 1000;
          this.xnodeList = detail.timeline.map((proc, index) => {
            const pid = proc.pid;
            const cmd = processesMap[pid] || '暂无命令信息';
            const hash = Math.abs(common.hashCode(cmd));
            let color;
            let span = {};
            if (processesMap[pid]) {
              color = colorList[hash % colorList.length];
              if (new Date(proc.create) <= start) {
                span.pre = 0;
              } else {
                span.pre = (new Date(proc.create) - start) / 24 / 3600 / 1000 * 100;
              }
              if (Date.now() - new Date(proc.update) < 3 * 60 * 1000) {
                span.after = 0;
              } else {
                span.after = (Date.now() - new Date(proc.update)) / 24 / 3600 / 1000 * 100;
                if (span.after >= 100) {
                  span.after = 100;
                }
              }
              span.active = 100 - span.pre - span.after;
            } else {
              color = disabledColor;
              span = { pre: 0, active: 24, after: 0 };
            }
            let style = `background:${color[0]};`;
            return {
              pid,
              class: 'line',
              style,
              cmd,
              create: proc.create,
              update: proc.update,
              color,
              span
            };
          });
          for (let xnode of this.xnodeList) {
            if (xnode.pid === this.selectPid) {
              this.selectProcess(xnode);
            }
          }
          // times
          const now = new Date();
          let flag = false;
          this.times = new Array(8).fill('').map((...args) => {
            const tmp = new Date(now - args[1] * 3 * 3600 * 1000);
            let hour = tmp.getHours();
            let tip = hour <= 12 ? 'AM' : 'PM';
            hour = hour < 10 ? `0${hour}` : hour;
            if ((Number(hour) === 0 || tmp.getDate() !== now.getDate()) && !flag) {
              flag = true;
              hour = week[tmp.getDay()];
              tip = (tmp.getMonth() + 1) + '.' + tmp.getDate();
            }
            return { hour, tip };
          }).reverse();
          // cpu memory data
          this.cpuMemoryData = this.processDetails.map(d => {
            return {
              pid: d.pid,
              cpu: d.cpu_60,
              memory: d.rss / 1024 / 1024
            };
          });
          // memory gc data
          this.memoryGcData = this.processDetails.map(d => {
            return {
              pid: d.pid,
              gc: d.gc_total,
              memory: d.rss / 1024 / 1024
            };
          });
          this.processDataLoading = false;
        }).catch(err => {
          common.error.call(this, `${error} ${err}`, err.code);
          this.processDataLoading = false;
        });
    },
    showProcessList() {
      this.getDrawerWidth();
      this.showProcessListDrawer = true;
    },
    updateProcessListDrawerStatus(status) {
      this.showProcessListDrawer = status;
    },
    getDrawerWidth() {
      // drawer
      if (this.$refs["process-body"]) {
        const el2 = window.getComputedStyle(this.$refs["process-body"].$el).width;
        const half2 = parseInt(el2, 10);
        this.drawerWidth = half2;
      }
    },
    getChardWidth() {
      // charts
      const el = window.getComputedStyle(this.$refs["main-charts"].$el).width;
      const half = parseInt(el, 10);
      this.scatterWidth = half;
    },
    updateCheckListModalStatus(status) {
      this.showCheckListModal = status;
    },
    checkProcess(xnode) {
      this.showCheckListModal = true;
      this.checkListModalLoading = true;
      const error = '检查进程信息失败，请重试！';
      axios.get(`/api/app/agent_process_status`, { params: { appId: this.appId, agentId: this.agentId, pid: xnode.pid } })
        .then(data => {
          data = data.data;
          this.checkListData = data;
          this.checkListModalLoading = false;
        })
        .catch(err => {
          this.checkListData = { ok: false, message: `${error} ${err}` };
          this.checkListModalLoading = false;
        });
    },
    updateTakeActionModalStatus(status) {
      this.showTakeActionModal = status;
    },
    takeAction(action) {
      this.showTakeActionModal = true;
      this.takeActionModalLoading = true;
      const error = '操作失败，请重试！';
      axios({
        method: 'POST',
        url: '/api/app/agent_take_action',
        headers: {
          'x-csrf-token': common.getCsrfToken()
        },
        data: {
          appId: this.appId,
          agentId: this.agentId,
          pid: this.selectPid,
          action
        }
      })
        .then(data => {
          data = data.data;
          this.takeActionData = data;
          this.takeActionModalLoading = false;
        })
        .catch(err => {
          this.takeActionData = { ok: false, message: `${error} ${err}` };
          this.takeActionModalLoading = false;
        });
    },
    showProcessDetail() {
      this.showProcessDetailDrawer = true;
      const query = this.$route.query;
      if (!parseInt(query.showProcessDetailDrawer)) {
        this.$router.push({
          path: this.$route.path,
          query: Object.assign({}, query, { showProcessDetailDrawer: 1 })
        });
      }
    },
    updateProcessDetailDrawerStatus(status) {
      this.showProcessDetailDrawer = status;
      const query = this.$route.query;
      if (!status && parseInt(query.showProcessDetailDrawer)) {
        this.$router.push({
          path: this.$route.path,
          query: Object.assign({}, query, { showProcessDetailDrawer: 0 })
        });
      }
    }
  },
  watch: {
    agentId() {
      this.init();
    },
    selectPid() {
      if (this.selectPid !== parseInt(this.$route.query.selectPid)) {
        this.$router.push({
          path: this.$route.path,
          query: Object.assign({}, this.$route.query, { selectPid: this.selectPid })
        });
      }
      for (let xnode of this.xnodeList) {
        if (xnode.pid === this.selectPid) {
          this.selectProcess(xnode);
        }
      }
    }
  },
  computed: {
    processCardStyle() {
      for (let xnode of this.xnodeList) {
        if (xnode.pid === this.selectPid) {
          return `background: ${xnode.color[0]}`;
        }
      }
      return `background: ${disabledColor[0]}`;
    },
    processCmd() {
      for (let xnode of this.xnodeList) {
        if (xnode.pid === this.selectPid) {
          return xnode.cmd;
        }
      }
      return '暂无进程命令信息';
    },
    processCreateDay() {
      for (let xnode of this.xnodeList) {
        if (xnode.pid === this.selectPid) {
          return xnode.create.split(' ')[0];
        }
      }
      return '-';
    },
    processCreateTime() {
      for (let xnode of this.xnodeList) {
        if (xnode.pid === this.selectPid) {
          return xnode.create.split(' ')[1];
        }
      }
      return '';
    },
    processUpdateDay() {
      for (let xnode of this.xnodeList) {
        if (xnode.pid === this.selectPid) {
          return xnode.update.split(' ')[0];
        }
      }
      return '-';
    },
    processUpdateTime() {
      for (let xnode of this.xnodeList) {
        if (xnode.pid === this.selectPid) {
          return xnode.update.split(' ')[1];
        }
      }
      return '';
    },
    processCpuUsage() {
      for (let proc of this.processDetails) {
        if (proc.pid === this.selectPid) {
          return `${proc.cpu_60.toFixed(2)} %`;
        }
      }
      return '-';
    },
    processMemoryUsage() {
      for (let proc of this.processDetails) {
        if (proc.pid === this.selectPid) {
          return `${common.formatMemory(proc.rss)}`;
        }
      }
      return '-';
    },
    processGcUsage() {
      for (let proc of this.processDetails) {
        if (proc.pid === this.selectPid) {
          return `${proc.gc_total.toFixed(2)} %`;
        }
      }
      return '-';
    },
    processLibuvActiveHandles() {
      for (let proc of this.processDetails) {
        if (proc.pid === this.selectPid) {
          return `${proc.active_handles}`;
        }
      }
    },
    processTimers() {
      for (let proc of this.processDetails) {
        if (proc.pid === this.selectPid) {
          return `${proc.total_timer}`;
        }
      }
      return '-';
    },
    processTcpActiveHandles() {
      for (let proc of this.processDetails) {
        if (proc.pid === this.selectPid) {
          return `${proc.total_tcp}`;
        }
      }
      return '-';
    }
  }
};
