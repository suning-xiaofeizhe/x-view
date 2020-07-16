'use strict';

import axios from "axios";
import moment from "moment";
import * as common from "../common";

export default {
  created() {
    this.getErrorLogFiles();
    this.selectErrorLog = this.$route.query.selectErrorLog || '';
    this.currentPage = Number(this.$route.query.currentPage) || 1;
  },
  methods: {
    formatHtml(content) {
      if (!content) {
        return [];
      }
      return content.split('\n').filter(line => line);
    },
    formatErrorLogs(errorLogFiles) {
      return errorLogFiles.map(item => {
        return {
          label: item.errorLogFile,
          value: item.errorLogPath
        };
      });
    },
    formatErrorLogContent(logs) {
      return logs.map(log => {
        const time = moment(Number(log.timestamp)).format('YYYY-MM-DD HH:mm:ss').split(' ');
        return {
          date: time[0],
          time: time[1],
          type: log.type,
          stack: this.formatHtml(log.stack),
          extra: this.formatHtml(log.extra)
        };
      });
    },
    reset() {
      this.loading = false;
      this.currentPage = 1;
      this.pageSize = 10;
      this.errorLogLength = 0;
    },
    getErrorLogFiles() {
      const error = '获取 error logs 失败，请重试';
      this.fileLoading = true;
      return axios.get('/api/app/agent_error_log_files', { params: { appId: this.appId, agentId: this.agentId } })
        .then(data => {
          data = data.data;
          if (data.ok) {
            data = data.data;
            if (Array.isArray(data.errorLogFiles)) {
              this.errorLogFiles = this.formatErrorLogs(data.errorLogFiles);
              if (this.errorLogFiles.length > 0) {
                this.selectErrorLog = this.errorLogFiles[0].value;
              }
            }
          } else {
            common.error.call(this, data.message || error, data.code);
          }
          this.fileLoading = false;
        })
        .catch(err => {
          common.error.call(this, `${error} ${err}`, err.code);
          this.fileLoading = false;
        });
    },
    getErrorLogContent() {
      const error = '获取 error log 详细信息失败，请重试';
      this.loading = true;
      this.errorLogTableContent = [];
      axios.get('/api/app/agent_error_log', {
        params: {
          appId: this.appId,
          agentId: this.agentId,
          errorLogPath: this.selectErrorLog,
          currentPage: this.currentPage,
          pageSize: this.pageSize
        }
      })
        .then(data => {
          data = data.data;
          if (data.ok) {
            data = data.data;
            if (Array.isArray(data.logs)) {
              this.errorLogTableContent = this.formatErrorLogContent(data.logs);
              this.errorLogLength = data.count;
            }
          } else {
            common.error.call(this, data.message || error, data.code);
          }
          this.loading = false;
        })
        .catch(err => {
          common.error.call(this, `${error} ${err}`, err.code);
          this.loading = false;
        });
    },
    changeErrorLog(value) {
      this.$router.push({
        path: this.$route.path,
        query: { agentId: this.agentId, instanceTab: 'error', selectErrorLog: value }
      });
      this.reset();
      this.selectErrorLog = value;
    },
    changePage(page) {
      this.$router.push({
        path: this.$route.path,
        query: Object.assign({}, this.$route.query, { currentPage: page })
      });
      this.currentPage = page;
      this.getErrorLogContent();
    }
  },
  watch: {
    selectErrorLog() {
      this.getErrorLogContent();
    },
    agentId() {
      this.getErrorLogFiles().then(() => this.getErrorLogContent());
    }
  }
};
