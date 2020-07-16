'use strict';

import axios from 'axios';
import * as common from "../../common";

export default {
  methods: {
    takeAction(action) {
      this.$emit('action', action);
    },
    getTrends() {
      const error = '获取进程详情失败，请重试';
      const trends = ['memory', "cpu", "heap", 'gc', 'handle', 'timer', 'tcp'];
      const tasks = [];
      for (const trend of trends) {
        tasks.push(this.getTrend(trend));
      }
      this.loading = true;
      Promise.all(tasks)
        .then(() => {
          this.loading = false;
        })
        .catch(err => {
          common.error.call(this, `${error} ${err}`, err.code);
          this.loading = false;
        });
    },
    commonFormatter(val) {
      return common.formatCount(val);
      // return val;
    },
    cpuFormatter(val) {
      return val + "%";
    },
    shouldCareCpuValue(cpu) {
      cpu = parseFloat(cpu);
      if (cpu <= 60) {
        this.cpuStatus = 'healthy';
      } else if (cpu <= 85) {
        this.cpuStatus = 'warning';
      } else {
        this.cpuStatus = 'error';
      }
    },
    memoryFormatter(val) {
      return common.formatMemory(val);
    },
    shouldCareMemoryValue(mem) {
      const tmp = mem.split(' ');
      const type = tmp[1];
      let memory = tmp[0];
      if (type === 'KB') {
        memory = memory * 1024;
      }
      if (type === 'MB') {
        memory = memory * 1024 * 1024;
      }
      if (type === 'GB') {
        memory = memory * 1024 * 1024 * 1024;
      }
      const memoryUsage = memory / this.heapLimit * 100;
      if (memoryUsage <= 60) {
        this.memortStatus = 'healthy';
      } else if (memoryUsage <= 85) {
        this.memortStatus = 'warning';
      } else {
        this.memortStatus = 'error';
      }
    },
    shouldCareGcSumValue(total) {
      total = parseFloat(total);
      if (total <= 5) {
        this.gcStatus = 'healthy';
      } else if (total <= 15) {
        this.gcStatus = 'warning';
      } else {
        this.gcStatus = 'error';
      }
    },
    pushChart(chart) {
      this.charts.push(chart);
    },
    clearChart({ id }) {
      let deleteIndex = null;
      for (let index = 0; index < this.charts.length; index++) {
        if (id === this.charts[index].id) {
          deleteIndex = index;
        }
      }
      if (deleteIndex !== null) {
        this.charts.splice(deleteIndex, 1);
      }
    },
    plotmove(data) {
      const { min } = data;
      this.charts.forEach(({ chart, id }) => {
        for (const tmp of this[`${id.split('-')[1]}Trend`]) {
          if (tmp.min === min) {
            const keys = Object.keys(tmp).filter(key => key !== 'min');
            if (keys.length) {
              for (const key of keys) {
                const position = chart.getXY({ min, type: key, value: tmp[key] });
                if (position.x > 0 && position.y > 0) {
                  chart.showTooltip(position);
                  if (id === 'process-heap-detail') {
                    const records = chart.getSnapRecords(position);
                    const space = {};
                    for (const record of records) {
                      const origin = record._origin;
                      space[origin.type] = origin.value;
                    }
                    this.getHeapMemoryDetail(space);
                  }
                  break;
                }
              }
            }
          }
        }
        // const position = chart.getXY({ min, value: 0 });
        // chart.showTooltip(position);
      });
    },
    plotleave() {
      this.charts.forEach(function ({ chart }) {
        try {
          chart.hideTooltip();
        } catch (e) { }
      });
    },
    getHeapMemoryDetail(data) {
      let sum = 0;
      const list = Object.keys(data).map(spaceName => {
        if (spaceName === 'min') return;
        sum += data[spaceName];
        return {
          space_name: spaceName,
          size: data[spaceName]
        };
      }).filter(space => space);
      for (const space of list) {
        space.percent = (space.size / sum * 100).toFixed(0);
      }
      this.heapMemoryDetail = list;
    },
    heapMemoryPieFormatter(val, item) {
      let spaceName = item.point.space_name;
      spaceName = spaceName.split("_")[0];
      return `${spaceName}: ${val}`;
    },
    getTrend(trend) {
      const error = `获取 ${trend} trend 信息失败，请重试！`;
      return axios.get(`/api/agent/process_detail`,
        { params: { appId: this.appId, agentId: this.agentId, pid: this.pid, trend, duration: this.duration } })
        .then(data => {
          data = data.data;
          if (data.ok) {
            data = data.data;
            if (Array.isArray(data.trend)) {
              this[`${trend}Trend`] = data.trend;
              const length = data.trend.length;
              let tryCount = 0;
              let last = {};
              while (Object.keys(last).length <= 1 && tryCount < length) {
                tryCount++;
                last = data.trend[length - tryCount];
              }
              if (trend === 'heap') {
                this.getHeapMemoryDetail(last);
              }
              if (trend === 'memory') {
                this.heapLimit = data.heapLimit;
                this.shouldCareMemoryValue(common.formatMemory(last.heap_total));
              }
              if (trend === 'cpu') {
                this.shouldCareCpuValue(last.cpu_60);
              }
              if (trend === 'gc') {
                this.shouldCareGcSumValue(last.scavange_duration + last.marksweep_duration);
              }
            }
          } else {
            throw new Error(data.message || `${error}`);
          }
        });
    }
  },
  computed: {
    title() {
      return `进程 ${this.pid} 数据趋势`;
    }
  },
  watch: {
    status() {
      this.$emit("drawerStatusUpdated", this.status);
      if (this.status) {
        this.getTrends();
      }
    },
    open() {
      this.status = this.open;
    },
    duration() {
      this.getTrends();
    }
  }
};
