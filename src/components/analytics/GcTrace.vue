<style scoped>
.no-gc {
  margin-top: 150px;
  font-size: 13px;
}
.sub-title {
  text-align: left;
  margin-left: 20px;
  margin-top: 20px;
  font-weight: bold;
}
.overview-content {
  margin-top: 15px;
}
.mini-chart-title {
  margin-bottom: -24px;
}
.progress {
  /* display: block; */
  background-color: #eff1f4;
  height: 20px;
  margin-left: 20%;
  margin-right: 20%;
}
.progress-active {
  background-color: #7d3c98;
  height: 20px;
}
.analytics-content {
  margin-left: 20px;
  margin-right: 20px;
  margin-bottom: 10px;
}
.analytics-title-common {
  height: 80px;
  color: white;
  padding-top: 6px;
  font-size: 20px;
}
.analytics-icon {
  font-size: 35px;
  margin-top: 15px;
  cursor: pointer;
}
.analytics-icon-disable {
  cursor: auto;
  opacity: 0;
}
.scavenge {
  background-color: #3498db;
}
.marksweep {
  background-color: #f5b041;
}
.marking {
  background-color: #7d3c98;
}
.analytics-info {
  color: #515a6e;
  background-color: #f8f8f9;
}
.analytics-info-value {
  margin-top: 5px;
  color: #17233d;
  font-weight: bold;
  font-size: 13px;
}
.analytics-radio {
  background-color: #e8eaec;
}
.analytics-space-detail {
  background-color: #f8f8f9;
}
.space {
  cursor: pointer;
}
.space-unused {
  background-image: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 3px,
    rgba(255, 255, 255, 0.5) 3px,
    rgba(255, 255, 255, 0.5) 6px
  );
}
.tip-content {
  padding: 10px;
}
.trace {
  font-family: PingFangSC-Regular, "Titillium Web", "Helvetica Neue", Helvetica,
    Arial, "Hiragino Sans GB", STHeiti, "Microsoft YaHei", "WenQuanYi Micro Hei",
    sans-serif;
  min-width: 100px;
  border: 1px solid #dcdee2;
}
.space-change-info {
  font-family: PingFangSC-Regular, "Titillium Web", "Helvetica Neue", Helvetica,
    Arial, "Hiragino Sans GB", STHeiti, "Microsoft YaHei", "WenQuanYi Micro Hei",
    sans-serif;
  /* text-align: left; */
  margin-top: 5px;
  margin-bottom: 10px;
}
.icon {
  font-size: 15px;
  margin-bottom: 3px;
  margin-right: 5px;
}
</style>

<template>
  <div>
    <Row class="info-bar">
      <Col class="info-content">
        GC 追踪日志分析
        > {{ data.fileName }}
      </Col>
    </Row>
    <Row class="info-divider"></Row>
    <Row ref="process-body">
      <Row v-if="loading" type="flex" justify="center" style="margin-top:200px;">
        <Col span="1">
          <Spin></Spin>
        </Col>
      </Row>
      <Row v-if="!loading">
        <div v-if="!gcList.length" class="no-gc">追踪期间暂无 GC 行为发生</div>
        <div v-if="gcList.length">
          <Row>
            <Col span="5">
              <Row class="analytics-overview-title">追踪期内 GC 暂停总时间 (追踪时长)</Row>
              <Row class="analytics-overview-value">{{ totalGcTime }} ( {{ totalGTracingTime }} )</Row>
            </Col>
            <Col span="9">
              <Row
                class="analytics-overview-title"
              >GC 次数 (Scavenge / Mark-Sweep / Incremental-Marking)</Row>
              <Row
                class="analytics-overview-value"
              >{{ gcTimes.total }} ( {{ gcTimes.scavenge }} / {{ gcTimes.marksweep }} / {{ gcTimes.marking }} )</Row>
            </Col>
            <Col span="5">
              <Row class="analytics-overview-title">第一次 GC 前堆大小</Row>
              <Row class="analytics-overview-value">{{ memoryBeforeFirstGc}}</Row>
            </Col>
            <Col span="5">
              <Row class="analytics-overview-title">最后一次 GC 后堆大小</Row>
              <Row class="analytics-overview-value">{{ memoryAfterLastGc }}</Row>
            </Col>
          </Row>
          <!-- gc trace overview -->
          <Row class="sub-title">GC 追踪分析概览</Row>
          <Row class="overview-content">
            <Col span="8">
              <div
                class="mini-chart-title"
                style="margin-bottom:15px"
              >GC 暂停时间占比 ( {{ progressPercentage }} )</div>
              <div class="progress">
                <div class="progress-active" :style="'width: ' + progressPercentage"></div>
              </div>
            </Col>
            <Col span="8">
              <div class="mini-chart-title">GC 暂停时间分布 (ms)</div>
              <x-mini-multi-scatter
                id="gc-pause"
                :fields="['(ms)', 'name', 'type']"
                :types="['scavenge','marksweep','marking']"
                :chartData="gcPauseData"
                show-color="#3498DB"
                care-key="type"
                @clickGcObject="clickGcObject"
              ></x-mini-multi-scatter>
            </Col>
            <Col span="8">
              <div class="mini-chart-title">GC 内存变化分布 (MB)</div>
              <x-mini-multi-scatter
                id="gc-reduce"
                :fields="['(MB)', 'name', 'type']"
                :types="['scavenge','marksweep','marking']"
                :chartData="gcReduceData"
                show-color="#F5B041"
                care-key="type"
                @clickGcObject="clickGcObject"
              ></x-mini-multi-scatter>
            </Col>
          </Row>
          <!-- gc trace analytics -->
          <Row class="sub-title" style="margin-top:0">GC 追踪详细分析</Row>
          <Row class="analytics-content">
            <Col span="18">
              <Row type="flex" justify="center">
                <Col span="11">
                  <x-histogram
                    id="gcCostTrend"
                    :fields="['time', 'value', 'type']"
                    :alias="{value:'GC 耗时 (ms)'}"
                    :chart-data="gcCostTrend"
                    :formatter="formatTime"
                    :color-keys="['scavenge', 'marksweep', 'marking']"
                    @clickGcObject="clickGcObject"
                    @pushChart="pushChart"
                    @plotmove="plotmove"
                    @plotleave="plotleave"
                  ></x-histogram>
                </Col>
                <Col span="11">
                  <x-line
                    id="gcHeapReduceTrend"
                    :fields="['time', 'value', 'type']"
                    :alias="{value:'堆内存变化 (MB)'}"
                    :chart-data="gcHeapReduceTrend"
                    :formatter="formatSize"
                    show-color="#72ccba"
                    @clickGcObject="clickGcObject"
                    @pushChart="pushChart"
                    @plotmove="plotmove"
                    @plotleave="plotleave"
                  ></x-line>
                </Col>
              </Row>
              <Row type="flex" justify="center">
                <Col span="22">
                  <x-gc-scatter
                    id="gcSpaceTrend"
                    :fields="['time', 'space', 'change']"
                    :alias="{space: 'V8 各堆空间名称'}"
                    :chartData="gcSpaceTrend"
                    :formatter="formatSize"
                    @clickGcObject="clickGcObject"
                  ></x-gc-scatter>
                </Col>
                <Col span="6">
                  <Icon class="icon" color="#f3a1a1" type="md-square" />GC 后空间内存增加
                </Col>
                <Col span="6">
                  <Icon class="icon" color="#adbcc9" type="md-square" />GC 后空间内存减小
                </Col>
              </Row>
            </Col>
            <!-- analytics card -->
            <Col span="6">
              <!-- title -->
              <Row :class="'analytics-title-common ' + showGcData.type">
                <Col span="6">
                  <Icon
                    v-if="showGcData.index !== 1"
                    @click="dropleft"
                    class="analytics-icon"
                    type="ios-arrow-dropleft"
                  />
                  <Icon
                    v-if="showGcData.index === 1"
                    class="analytics-icon analytics-icon-disable"
                    type="ios-arrow-dropleft"
                  />
                </Col>
                <Col span="12">
                  <Row>
                    第
                    <span style="font-size: 30px;">{{ showGcData.index }}</span> 次 GC
                  </Row>
                  <Row style="font-size: 12px">类型: {{ showGcData.type }}</Row>
                </Col>
                <Col span="6">
                  <Icon
                    v-if="showGcData.index !== gcList.length"
                    @click="dropright"
                    class="analytics-icon"
                    type="ios-arrow-dropright"
                  />
                  <Icon
                    v-if="showGcData.index === gcList.length"
                    class="analytics-icon analytics-icon-disable"
                    type="ios-arrow-dropright"
                  />
                </Col>
              </Row>
              <!-- info -->
              <Row type="flex" justify="center" class="analytics-info">
                <Col span="22" style="margin-top: 10px;">
                  <Row>
                    <Col span="12">
                      <Row>距离进程启动时间</Row>
                      <Row
                        class="analytics-info-value"
                      >{{ formatTime(showGcData.timeFromStart * 1000) }}</Row>
                    </Col>
                    <Col span="12">
                      <Row>累计 GC 暂停时间 (总数)</Row>
                      <Row
                        class="analytics-info-value"
                      >{{ formatTime(showGcData.totalSpentfromStart) }} ({{ showGcData.totalTimesfromStart }})</Row>
                    </Col>
                  </Row>
                </Col>
                <Col span="22" style="margin-top: 10px;margin-bottom: 10px;">
                  <Row>
                    <Col span="12">
                      <Row>堆大小变化</Row>
                      <Row
                        class="analytics-info-value"
                      >{{ formatSize(showGcData.totalSizeAfter - showGcData.totalSizeBefore) }}</Row>
                    </Col>
                    <Col span="12">
                      <Row>本次 GC 暂停时间</Row>
                      <Row
                        class="analytics-info-value"
                      >{{ formatTime(showGcData.end - showGcData.start) }}</Row>
                    </Col>
                  </Row>
                </Col>
              </Row>
              <!-- gc before/after -->
              <Row type="flex" justify="center" class="analytics-radio">
                <RadioGroup v-model="selectGcStatus" style="margin-top: 10px;margin-bottom: 10px;">
                  <Radio label="before">GC 前</Radio>
                  <Radio label="after">GC 后</Radio>
                </RadioGroup>
              </Row>
              <!-- show space detail -->
              <Row type="flex" justify="center" class="analytics-space-detail">
                <Col span="22">
                  <Row style="margin-top: 15px;padding: 2px;">
                    <Row>
                      <Col
                        class="space"
                        v-for="(space, index) in spacesExceptOldSpace"
                        :key="index"
                        :span="getSpaceWidth(space)"
                        :style="`height: 130px;${index !== 0 ? 'padding-left:1px':''}`"
                      >
                        <!-- new space to semi space -->
                        <!-- <Row v-if="space === 'new_space'" style="height:50%;padding-bottom:1px;">
                          <Row
                            class="space-unused"
                            :style="`background-color: ${getSpaceColor(space)};height: 100%;`"
                          >
                            <div
                              @mouseover.stop="showTooltip('new_space', 'inactive::', $event)"
                              @mousemove.stop="showTooltip('new_space', 'inactive::', $event)"
                              @mouseout.stop="resetTooltip('new_space', 'inactive::', $event)"
                              style="height: 100%"
                            ></div>
                          </Row>
                        </Row>-->
                        <!-- other spaces except old_space -->
                        <!-- <Row :style="`height:${space === 'new_space' ? 50 : 100}%;`"> -->
                        <Row style="height: 100%;">
                          <!-- unused -->
                          <Row
                            class="space-unused"
                            :style="`background-color: ${getSpaceColor(space)};height: ${100 - getUsedHeight(space)}%`"
                          >
                            <div
                              @mouseover.stop="showTooltip(space, 'active::unused', $event)"
                              @mousemove.stop="showTooltip(space, 'active::unused', $event)"
                              @mouseout.stop="resetTooltip()"
                              style="height: 100%"
                            ></div>
                          </Row>
                          <!-- used -->
                          <Row
                            :style="`margin-top:1px;background-color: ${getSpaceColor(space)};height: ${getUsedHeight(space)}%`"
                          >
                            <div
                              @mouseover.stop="showTooltip(space, 'active::used', $event)"
                              @mousemove.stop="showTooltip(space, 'active::used', $event)"
                              @mouseout.stop="resetTooltip()"
                              style="height: 100%"
                            ></div>
                          </Row>
                        </Row>
                      </Col>
                    </Row>
                    <!-- old_space -->
                    <Row class="space" style="height: 130px;margin-top: 2px;">
                      <Row
                        class="space-unused"
                        :style="`background-color: ${getSpaceColor('old_space')};height: ${100 - getUsedHeight('old_space')}%;`"
                      >
                        <div
                          @mouseover.stop="showTooltip('old_space', 'active::unused', $event)"
                          @mousemove.stop="showTooltip('old_space', 'active::unused', $event)"
                          @mouseout.stop="resetTooltip()"
                          style="height: 100%"
                        ></div>
                      </Row>
                      <Row
                        :style="`margin-top:1px;background-color: ${getSpaceColor('old_space')};height: ${getUsedHeight('old_space')}%;`"
                      >
                        <div
                          @mouseover.stop="showTooltip('old_space', 'active::used', $event)"
                          @mousemove.stop="showTooltip('old_space', 'active::used', $event)"
                          @mouseout.stop="resetTooltip()"
                          style="height: 100%"
                        ></div>
                      </Row>
                    </Row>
                  </Row>
                </Col>
              </Row>
              <!-- describe space detail -->
              <Row class="analytics-info">
                <Col span="22" style="margin-top: 10px;">
                  <Row type="flex" justify="center">
                    <Col span="12">
                      <Row>所有空间已使用大小</Row>
                      <Row class="analytics-info-value">{{ totalSpacesUsedSize }}</Row>
                    </Col>
                    <Col span="12">
                      <Row>所有空间实际大小</Row>
                      <Row class="analytics-info-value">{{ totalSpacesSize }}</Row>
                    </Col>
                  </Row>
                </Col>
                <Col span="22" style="margin-top: 10px;">
                  <Row type="flex" justify="center">
                    <Col span="12">
                      <Row>Page 空洞大小 (部分)</Row>
                      <Row class="analytics-info-value">{{ totalHoleSize }}</Row>
                    </Col>
                    <Col span="12">
                      <Row>物理分配内存大小</Row>
                      <Row class="analytics-info-value">{{ totalPhysicalSpacesSize }}</Row>
                    </Col>
                  </Row>
                </Col>
                <Col span="22" style="margin-top: 10px;">
                  <Row type="flex" justify="center">
                    <Col>
                      <!-- <Row> -->
                      <!-- <Col> -->
                      <Row>堆各空间主要内存变化部分</Row>
                      <Row class="space-change-info" v-html="mainChangeSpace"></Row>
                      <!-- </Col> -->
                      <!-- </Row> -->
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Col>
          </Row>
        </div>
      </Row>
    </Row>

    <!-- tooltip -->
    <div ref="space-detail" class="tooltip trace">
      <Row class="tip-content">
        <Row>
          <Col>{{ spaceDetail }}</Col>
        </Row>
      </Row>
    </div>
  </div>
</template>

<script>
import gcTrace from "../../javascript/analytics/gcTrace";
import miniMultiScatter from "../charts/MiniMultiScatter";
import histogram from "../charts/Histogram";
import line from "../charts/Line";
import gcScatter from "../charts/GcScatter";

const gcTraceModule = Object.assign(
  {
    data() {
      return {
        loading: false,
        gcLog: {},
        showGcData: {},
        selectGcStatus: "before",
        spaceDetail: "",
        spaces: [],
        colors: [
          "#30bfd9",
          "#ffc900",
          "#8995d9",
          "#d4668c",
          "#646faa",
          "#9B59B6",
          "#2ECC71",
          "#3498DB"
        ],
        charts: []
      };
    },
    props: ["data"],
    components: {
      "x-mini-multi-scatter": miniMultiScatter,
      "x-histogram": histogram,
      "x-line": line,
      "x-gc-scatter": gcScatter
    },
    created() {
      this.getGcLog();
    }
  },
  gcTrace
);
export default gcTraceModule;
</script>
