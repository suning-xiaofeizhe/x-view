'use strict';

import axios from "axios";
import * as common from "./common";

export default {
  methods: {
    getRandomColor(index) {
      const color = ['#19be6b', '#2d8cf0', '#9B59B6', '#3498DB', '#28B463'];
      // const randomIndex = parseInt(Math.random() * color.length * 100);
      return `border-left: 5px solid ${color[index % color.length]}`;
    },
    getInstanceCount() {
      const error = '获取应用实例信息失败，请刷新页面重试！';
      this.instanceCountLoading = true;
      axios.get('/api/app/instance_count', { params: { appId: this.app.appId } }).then(data => {
        data = data.data;
        if (data.ok) {
          data = data.data;
          if (data.count !== undefined && !isNaN(data.count)) {
            this.instanceCount = data.count;
          }
        } else {
          console.error(data.message || error);
        }
        this.instanceCountLoading = false;
      }).catch(err => {
        console.error(`${error} ${err}`);
        this.instanceCountLoading = false;
      });
    },
    getAlarmCount() {
      const error = '获取应用报警信息失败，请刷新页面重试！';
      this.alarmCountLoading = true;
      axios.get('/api/app/alarm_count', { params: { appId: this.app.appId } }).then(data => {
        data = data.data;
        if (data.ok) {
          data = data.data;
          if (data.count !== undefined && !isNaN(data.count)) {
            this.alarmCount = data.count;
          }
        } else {
          console.error(data.message || error);
        }
        this.alarmCountLoading = false;
      }).catch(err => {
        console.error(`${error} ${err}`);
        this.alarmCountLoading = false;
      });
    },
    formatCount(count) {
      return common.formatCount(count);
    },
    getNodeCpuAverageStatistics() {
      const error = '获取应用 CPU 信息失败，请刷新页面重试！';
      this.cpuStatusLoading = true;
      axios.get('/api/app/cpu_overview', { params: { appId: this.app.appId } }).then(data => {
        data = data.data;
        if (data.ok) {
          data = data.data;
          if (Array.isArray(data.list)) {
            this.cpuStatus = data.list;
          } else {
            this.cpuStatus = [];
          }
        } else {
          console.error(data.message || error);
        }
        this.cpuStatusLoading = false;
      }).catch(err => {
        console.error(`${error} ${err}`);
        this.cpuStatusLoading = false;
      });
    },
    getNodeMomeryAverageStatistics() {
      const error = '获取应用 Memory 信息失败，请刷新页面重试！';
      this.memoryStatusLoading = true;
      axios.get('/api/app/memory_overview', { params: { appId: this.app.appId } }).then(data => {
        data = data.data;
        if (data.ok) {
          data = data.data;
          if (Array.isArray(data.list)) {
            this.memoryStatus = data.list;
          } else {
            this.memoryStatus = [];
          }
        } else {
          console.error(data.message || error);
        }
        this.memoryStatusLoading = false;
      }).catch(err => {
        console.error(`${error} ${err}`);
        this.memoryStatusLoading = false;
      });
    }
  }
};
