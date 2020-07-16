'use strict';

import axios from "axios";
import * as common from "../common";

export default {
  created() {
    this.getSystemOverview()
      .then(() => this.getSystemDetail());
  },
  methods: {
    setOverviewData(data, key) {
      if (common.isNumber(data[key])) {
        this.overviewData[key] = data[key];
      }
    },
    setDetailData(data, key) {
      if (Array.isArray(data[key])) {
        this.detailData[key] = data[key];
      }
    },
    status(value) {
      if (value < 0.6) {
        return 'healthy';
      } else if (value < 0.85) {
        return 'warning';
      } else {
        return 'error';
      }
    },
    getSystemOverview() {
      const error = '获取系统信息概览失败，请重试';
      this.overviewLoading = true;
      return axios.get('/api/app/agent_osinfo_overview', { params: { appId: this.appId, agentId: this.agentId } })
        .then(data => {
          data = data.data;
          if (data.ok) {
            data = data.data;
            if (!data) {
              this.hasOsData = false;
              return;
            }
            this.setOverviewData(data, 'cpuUsage');
            this.setOverviewData(data, 'memUsage');
            this.setOverviewData(data, 'diskUsage');
            this.overviewData.diskMounted = data.diskMounted;
          } else {
            common.error.call(this, data.message || error, data.code);
          }
          this.overviewLoading = false;
        })
        .catch(err => {
          common.error.call(this, `${error} ${err}`, err.code);
          this.overviewLoading = false;
        });
    },
    getSystemDetail() {
      const error = '获取系统信息详情失败，请重试';
      this.detailLoading = true;
      return axios.get('/api/app/agent_osinfo_detail', { params: { appId: this.appId, agentId: this.agentId } })
        .then(data => {
          data = data.data;
          if (data.ok) {
            data = data.data;
            this.setDetailData(data, 'cpuTrend');
            this.setDetailData(data, 'memTrend');
            this.setDetailData(data, 'loadTrend');
            this.setDetailData(data, 'nodeTrend');
            this.setDetailData(data, 'diskTrend');
            this.setDetailData(data, 'qpsTrend');
            this.setDetailData(data, 'responseTrend');
            this.setDetailData(data, 'rtTrend');
            this.setDetailData(data, 'expiredTrend');
            if (common.isNumber(data.totalMem)) {
              this.detailData.totalMem = data.totalMem;
            }
            if (Array.isArray(data.diskFields)) {
              this.detailData.diskFields = data.diskFields;
            }
            if (Array.isArray(data.responseFields) && data.responseFields.length) {
              this.detailData.responseFields = data.responseFields;
            }
          } else {
            common.error.call(this, data.message || error, data.code);
          }
          this.detailLoading = false;
        })
        .catch(err => {
          common.error.call(this, `${error} ${err}`, err.code);
          this.detailLoading = false;
        });
    },
    cpuFormatter(val) {
      return val + "%";
    },
    memoryFormatter(val) {
      return common.formatMemory(val);
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
        for (const tmp of this.detailData[`${id.split('-')[1]}Trend`]) {
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
    }
  },
  watch: {
    agentId() {
      this.hasOsData = true;
      this.getSystemOverview()
        .then(() => this.getSystemDetail());
    }
  }
};
