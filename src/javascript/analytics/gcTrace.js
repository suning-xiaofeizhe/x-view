'use strict';

import axios from "axios";
import * as common from "../common";

export default {
  methods: {
    getGcLog() {
      const error = '获取 GC 追踪日志失败，请重试';
      this.loading = true;
      const data = this.data;
      axios.get('/file/download', { params: { fileId: data.fileId, fileType: data.fileType } })
        .then(data => {
          data = data.data;
          if (Array.isArray(data.gc) && data.gc) {
            this.parseGcLog(data);
          }
          this.loading = false;
        })
        .catch(err => {
          common.error.call(this, `${error} ${err}`, err.code);
          this.loading = false;
        });
    },
    getTotalSize(spaces) {
      let total = 0;
      for (const space of spaces) {
        total += space.space_used_size;
      }
      return total;
    },
    parseGcLog(data) {
      const gcList = data.gc || [];
      for (let index = 0; index < gcList.length; index++) {
        const gc = gcList[index];
        gc.index = index + 1;
        gc.totalSizeBefore = this.getTotalSize(gc.before);
        gc.totalSizeAfter = this.getTotalSize(gc.after);
      }
      this.gcLog = data;
      this.showGcData = gcList[0];
      if (gcList[0] && Array.isArray(gcList[0].before)) {
        this.spaces = gcList[0].before.map(space => space.name);
        this.spaces.splice(this.spaces.indexOf('new_space'), 1);
        this.spaces.unshift('new_space');
        this.spaces.splice(this.spaces.indexOf('old_space'), 1);
        this.spaces.push('old_space');
      }
    },
    getTotalPauseTime() {
      const gcList = this.gcList;
      let total = 0;
      for (const gc of gcList) {
        total += +(gc.end - gc.start);
      }
      return total;
    },
    resetRadio() {
      this.selectGcStatus = 'before';
    },
    dropleft() {
      const index = this.showGcData.index;
      const gcList = this.gcList;
      if (index === 1) {
        return;
      }
      this.showGcData = gcList[index - 2];
      this.resetRadio();
    },
    dropright() {
      const index = this.showGcData.index;
      const gcList = this.gcList;
      if (index === gcList.length) {
        return;
      }
      this.showGcData = gcList[index];
      this.resetRadio();
    },
    formatTime(time) {
      return common.formatTimeNew(time, 'ch');
    },
    formatSize(size) {
      return common.formatMemory(size, true);
    },
    getSpaceInfo(name) {
      const spaces = this.showGcData[this.selectGcStatus] || [];
      for (const space of spaces) {
        if (space.name === name) {
          return space;
        }
      }
    },
    showTooltip(space, used, d) {
      // get space detail
      const spaceInfo = this.getSpaceInfo(space);
      const tmp = used.split('::');
      const active = tmp[0];
      used = tmp[1];
      if (active === 'active') {
        if (used === 'used') {
          this.spaceDetail = `used ${space}: ${common.formatMemory(spaceInfo.space_used_size)}`;
        } else {
          let spaceSize = spaceInfo.space_size;
          // if (space === 'new_space') {
          //   spaceSize = spaceSize / 2;
          // }
          this.spaceDetail = `unused ${space}: ${common.formatMemory(spaceSize - spaceInfo.space_used_size)}`;
        }
      } else {
        this.spaceDetail = `inactive new_space semispace: ${common.formatMemory(spaceInfo.space_size / 2)}`;
      }

      const ele = this.$refs['space-detail'];
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
    resetTooltip() {
      this.spaceDetail = '';
      const ele = this.$refs['space-detail'];
      ele.style.display = 'none';
      ele.style['z-index'] = -9999;
      ele.style.left = "0px";
      ele.style.top = "0px";
    },
    getSpaceMap(list) {
      return list.reduce((cache, space) => {
        cache[space.name] = space;
        return cache;
      }, {});
    },
    clickGcObject(data) {
      this.showGcData = this.gcList[data.index];
    },
    pushChart(chart) {
      this.charts.push(chart);
    },
    plotmove(data) {
      const { time } = data;
      this.charts.forEach(({ chart, id }) => {
        const data = this[id];
        let col;
        for (const d of data) {
          if (d.time === time) {
            col = d;
          }
        }
        if (col) {
          const position = chart.getXY(col);
          if (position.x > 0 && position.y > 0) {
            chart.showTooltip(position);
          }
        }
      });
    },
    plotleave() {
      this.charts.forEach(function ({ chart }) {
        try {
          chart.hideTooltip();
        } catch (e) { }
      });
    },
    getSpaceColor(space) {
      if (space === 'old_space') {
        return '#F4D03F';
      }
      return this.colors[this.spaces.indexOf(space) % this.colors.length];
    },
    getSpaceWidth(space) {
      return this.spacesSpan[space];
    },
    getUsedHeight(space) {
      const spaceInfo = this.getSpaceInfo(space);
      let spaceSize = spaceInfo.space_size;
      // if (space === 'new_space') {
      //   spaceSize = spaceInfo.space_size / 2;
      // }
      const percentage = spaceInfo.space_used_size ? ((spaceInfo.space_used_size / spaceSize) * 100).toFixed(2) : 0;
      return percentage;
    }
  },
  computed: {
    spacesSpan() {
      const map = {};
      let totalSpaceSize = 0;
      const spaces = this.showGcData[this.selectGcStatus] || [];
      for (const space of spaces) {
        if (space.name === 'old_space') {
          continue;
        }
        totalSpaceSize += space.space_size;
      }
      let maxSpace = '';
      let maxSpan = 0;
      for (const space of spaces) {
        if (space.name === 'old_space') {
          continue;
        }
        let width = Math.round((space.space_size / totalSpaceSize) * 24);
        if (width < 2) {
          width = 2;
        }
        if (width > maxSpan) {
          maxSpan = width;
          maxSpace = space.name;
        }
        map[space.name] = width;
      }
      let totalSpan = 0;
      for (const span of Object.values(map)) {
        totalSpan += span;
      }
      if (totalSpan > 24) {
        map[maxSpace] -= totalSpan - 24;
      }

      return map;
    },
    gcList() {
      const gcList = this.gcLog && this.gcLog.gc;
      return gcList || [];
    },
    startTime() {
      const startTime = (this.gcLog && this.gcLog.startTime) || 0;
      return startTime * 1000;
    },
    stopTime() {
      const stopTime = (this.gcLog && this.gcLog.stopTime) || 0;
      return stopTime * 1000;
    },
    totalGcTime() {
      let total = this.getTotalPauseTime();
      total = total ? common.formatTime(total) : '-';
      return total;
    },
    totalGTracingTime() {
      return common.formatTime(this.stopTime - this.startTime);
    },
    gcTimes() {
      const gcList = this.gcList;
      const results = { total: 0, scavenge: 0, marksweep: 0, marking: 0 };
      for (const gc of gcList) {
        results.total++;
        if (gc.type === 'scavenge') {
          results.scavenge++;
        }
        if (gc.type === 'marksweep') {
          results.marksweep++;
        }
        if (gc.type === 'marking') {
          results.marking++;
        }
      }
      return results;
    },
    memoryBeforeFirstGc() {
      const gcList = this.gcList;
      let result;
      if (gcList.length) {
        result = common.formatMemory(gcList[0].totalSizeBefore);
      } else {
        result = '-';
      }
      return result;
    },
    memoryAfterLastGc() {
      const gcList = this.gcList;
      let result;
      if (gcList.length) {
        result = common.formatMemory(gcList[gcList.length - 1].totalSizeAfter);
      } else {
        result = '-';
      }
      return result;
    },
    gcPauseData() {
      const gcList = this.gcList;
      return gcList.map((gc, index) => {
        return {
          '(ms)': gc.end - gc.start,
          name: 'name',
          type: gc.type,
          index
        };
      });
    },
    gcReduceData() {
      const gcList = this.gcList;
      const data = gcList.map((gc, index) => {
        return {
          '(MB)': (gc.totalSizeAfter - gc.totalSizeBefore) / 1024 / 1024,
          name: 'name',
          type: gc.type,
          index
        };
      });
      return data;
    },
    progressPercentage() {
      const pause = this.getTotalPauseTime();
      const total = this.stopTime - this.startTime;
      return ((pause / total) * 100).toFixed(2) + '%';
    },
    totalSpacesUsedSize() {
      const spaces = this.showGcData[this.selectGcStatus] || [];
      let total = 0;
      for (const space of spaces) {
        total += space.space_used_size;
      }
      return common.formatMemory(total);
    },
    totalSpacesSize() {
      const spaces = this.showGcData[this.selectGcStatus] || [];
      let total = 0;
      for (const space of spaces) {
        total += space.space_size;
      }
      return common.formatMemory(total);
    },
    totalHoleSize() {
      // PagedSpace* PagedSpaces::next() {
      //   switch (counter_++) {
      //     case RO_SPACE:
      //       // skip NEW_SPACE
      //       counter_++;
      //       return heap_->read_only_space();
      //     case OLD_SPACE:
      //       return heap_->old_space();
      //     case CODE_SPACE:
      //       return heap_->code_space();
      //     case MAP_SPACE:
      //       return heap_->map_space();
      //     default:
      //       return nullptr;
      //   }
      // }

      const spaces = this.showGcData[this.selectGcStatus] || [];
      let total = 0;
      const needSumSpaces = ['read_only_space', 'old_space', 'code_space', 'map_space'];
      for (const space of spaces) {
        if (needSumSpaces.includes(space.name)) {
          total += space.space_available_size;
        }
      }
      return common.formatMemory(total);
    },
    totalPhysicalSpacesSize() {
      const spaces = this.showGcData[this.selectGcStatus] || [];
      let total = 0;
      for (const space of spaces) {
        total += space.physical_space_size;
      }
      return common.formatMemory(total);
    },
    mainChangeSpace() {
      const before = this.getSpaceMap(this.showGcData.before);
      const after = this.getSpaceMap(this.showGcData.after);

      let changes = {};
      for (const [space, detail] of Object.entries(after)) {
        changes[space] = detail.space_used_size - before[space].space_used_size;
      }
      changes = Object.entries(changes).map(([name, change]) => ({ name, change }));
      changes.sort((o, n) => Math.abs(o.change) < Math.abs(n.change) ? 1 : -1);
      changes = changes
        .filter(item => item.change)
        .map(({ name, change }) => `${name}: <strong style="color: #17233d">${common.formatMemory(change, true)}</strong>`)
        .join('<br />');

      return changes || '<strong style="color: #17233d">无变化</strong>';
    },
    gcCostTrend() {
      const gcList = this.gcList;
      return gcList.map((gc, index) => {
        return {
          time: index,
          value: gc.end - gc.start,
          type: gc.type,
          index
        };
      });
    },
    gcHeapReduceTrend() {
      const gcList = this.gcList;
      return gcList.map((gc, index) => {
        return {
          time: index,
          value: gc.totalSizeAfter / 1024 / 1024,
          raw: gc.totalSizeAfter - gc.totalSizeBefore,
          type: gc.type,
          index
        };
      });
    },
    gcSpaceTrend() {
      const gcList = this.gcList;
      const data = [];
      for (let index = 0; index < gcList.length; index++) {
        const gc = gcList[index];
        const before = this.getSpaceMap(gc.before);
        const after = this.getSpaceMap(gc.after);
        for (const space of this.spaces) {
          const change = after[space].space_used_size - before[space].space_used_size;
          if (change) {
            data.push({
              time: index,
              space,
              change,
              index
            });
          }
        }
      }

      for (let index = 0; index < gcList.length; index++) {
        const gc = gcList[index];
        const allSpaceChange = gc.totalSizeAfter - gc.totalSizeBefore;
        if (allSpaceChange) {
          data.push({
            time: index,
            space: 'all_spaces',
            change: allSpaceChange,
            index
          });
        }
      }
      return data;
    },
    spacesExceptOldSpace() {
      return this.spaces.filter(space => space !== 'old_space');
    }
  }
};
