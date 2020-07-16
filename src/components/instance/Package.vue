<style scoped>
.alert {
  color: #ed4014;
}
.package-content {
  font-family: PingFangSC-Regular, "Titillium Web", "Helvetica Neue", Helvetica,
    Arial, "Hiragino Sans GB", STHeiti, "Microsoft YaHei", "WenQuanYi Micro Hei",
    sans-serif;
}
.long-text {
  word-break: keep-all;
}
</style>

<template>
  <div>
    <Row>
      <!-- get package info -->
      <Col v-if="loading">
        <Row type="flex" justify="center" style="margin-top:200px;">
          <Col span="1">
            <Spin size="large"></Spin>
          </Col>
        </Row>
      </Col>

      <!-- no packages -->
      <Col v-if="!loading && packages.length === 0">
        <Row class="dashboard-message-tip">
          <Icon type="ios-information-circle-outline" />
          <span>项目下暂无 package 信息，请查看您的 xagent 是否正确配置了 packages 模块依赖文件路径数组</span>
        </Row>
      </Col>

      <!-- show packages -->
      <Col v-if="!loading && packages.length !== 0" class="info-prompt">
        <!-- secruit risk warning -->
        <Alert v-if="hasSecurityRisk" type="warning">
          <Icon class="message-icon" style="color:#ff9900" type="ios-alert-outline" />项目
          <Dropdown @on-click="selectPackage">
            <a href="javascript:void(0)">
              <span style="color:#ff9900">{{ selectedPackage.name }}</span>
            </a>
            <DropdownMenu slot="list">
              <DropdownItem
                v-for="(pkg, index) in packages"
                :key="index"
                :name="index"
              >{{ pkg.name }}</DropdownItem>
            </DropdownMenu>
          </Dropdown>
          <span>引入的 npm 依赖模块发现</span>
          <span v-if="vulnerabilities.critical">
            <code class="alert">{{ vulnerabilities.critical }}</code> 个极危漏洞
          </span>
          <span v-if="vulnerabilities.high">
            <code class="alert">{{ vulnerabilities.high }}</code> 个高危漏洞
          </span>
          <span v-if="vulnerabilities.moderate">
            <code class="alert">{{ vulnerabilities.moderate }}</code> 个中危漏洞
          </span>
          <span v-if="vulnerabilities.low">
            <code class="alert">{{ vulnerabilities.low }}</code> 个低危漏洞
          </span>
          （共扫描
          <code>{{ totalDependencies }}</code> 个依赖模块于
          <code>{{ scanTime }}</code>）
          <a
            v-if="!showHowToFix"
            href="javascript:void(0)"
            style="color:#ff9900;"
            @click="howToFix"
          >查看如何修复</a>
          <a v-else href="javascript:void(0)" style="color:#ff9900;" @click="showPackageInfo">查看依赖模块</a>
        </Alert>
        <!-- no security risk -->
        <!-- <Alert v-else type="success">
          <Icon class="message-icon" style="color:#19be6b" type="ios-checkmark-circle-outline" />项目
          <Dropdown @on-click="selectPackage">
            <a href="javascript:void(0)">
              <span style="color:#19be6b">{{ selectedPackage.name }}</span>
            </a>
            <DropdownMenu slot="list">
              <DropdownItem
                v-for="(pkg, index) in packages"
                :key="index"
                :name="index"
              >{{ pkg.name }}</DropdownItem>
            </DropdownMenu>
          </Dropdown>
          <span>
            引入的 npm 依赖模块目前没有安全风险（共扫描
            <code>{{ totalDependencies }}</code> 个依赖于
            <code>{{ scanTime }}</code>）
          </span>
        </Alert> -->

        <!-- choose dependence type -->
        <Row v-if="!showHowToFix">
          <Tag
            style="user-select:none;"
            checkable
            :checked="choseDependencies"
            color="primary"
            @on-change="changeChosenDependencies"
          >dependencies</Tag>
          <Tag
            style="user-select:none;"
            checkable
            :checked="!choseDependencies"
            color="primary"
            @on-change="changeChosenDevDependencies"
          >devDependencies</Tag>
        </Row>

        <!-- package -->
        <Row style="margin-top:12px;margin-bottom:15px;">
          <!-- show package info -->
          <Table
            class="package-content"
            v-if="!showHowToFix"
            :columns="packageInfoColumns"
            :data="packageTableData"
          >
            <template slot-scope="{ row }" slot="packageName">
              <span>{{ row.packageName }}</span>
            </template>
            <template slot-scope="{ row }" slot="settedPackageVersion">
              <span>{{ row.settedPackageVersion }}</span>
            </template>
            <template slot-scope="{ row }" slot="lockedPackageVersion">
              <span>{{ row.lockedPackageVersion }}</span>
            </template>
            <template slot-scope="{ row }" slot="usedPackageDownloadUrl">
              <Button
                type="primary"
                size="small"
                long
                ghost
                @click="downloadPackage(row.usedPackageDownloadUrl)"
              >下载当前使用版本</Button>
            </template>
          </Table>

          <!-- show how to fix security risk -->
          <Col v-else>
            <Row :gutter="8">
              <!-- action -->
              <Col span="6">
                <Table
                  class="package-content"
                  :columns="actionColumns"
                  :data="actionTableData"
                  highlight-row
                  @on-current-change="changeDetail"
                >
                  <template slot-scope="{ row }" slot="fixCmd">
                    <code>{{ row.fixCmd || 'Unknown' }}</code>
                  </template>
                </Table>
              </Col>

              <!-- fix detail -->
              <Col span="18">
                <Table class="package-content" :columns="resolvesColumns" :data="resolvesTableData">
                  <template slot-scope="{ row }" slot="moduleName">
                    <span>{{ row.moduleName }}</span>
                  </template>
                  <template slot-scope="{ row }" slot="currentVersions">
                    <span>{{ row.currentVersions }}</span>
                  </template>
                  <template slot-scope="{ row }" slot="fullPath">
                    <span class="long-text">{{ row.fullPath }}</span>
                  </template>
                  <template slot-scope="{ row }" slot="severity">
                    <span>{{ row.severity }}</span>
                  </template>
                  <template slot-scope="{ row }" slot="vulnerableVersions">
                    <span>{{ row.vulnerableVersions }}</span>
                  </template>
                  <template slot-scope="{ row }" slot="detail">
                    <Button
                      type="primary"
                      long
                      ghost
                      size="small"
                      @click="showMorDetail(row.detail)"
                    >漏洞详情</Button>
                  </template>
                </Table>
              </Col>
            </Row>
          </Col>
        </Row>
      </Col>
    </Row>
  </div>
</template>

<script>
import packages from "../../javascript/instance/package";

const processModule = Object.assign(
  {
    props: ["appId", "agentId"],
    data() {
      return {
        loading: false,
        selectedPackage: {},
        choseDependencies: true,
        packages: [],
        showHowToFix: false,
        selectedResolves: [],
        packageInfoColumns: [
          {
            title: "依赖名称",
            slot: "packageName"
          },
          {
            title: "版本设置信息",
            slot: "settedPackageVersion",
            align: "center"
          },
          {
            title: "版本锁定信息",
            slot: "lockedPackageVersion",
            align: "center"
          },
          {
            title: "下载实际使用版本",
            slot: "usedPackageDownloadUrl",
            width: 180,
            align: "center"
          }
        ],
        actionColumns: [
          {
            title: "安全漏洞修复命令",
            slot: "fixCmd"
          }
        ],
        resolvesColumns: [
          {
            title: "模块名称",
            slot: "moduleName",
            align: "center"
          },
          {
            title: "当前版本",
            slot: "currentVersions",
            align: "center"
          },
          {
            title: "完整依赖路径",
            slot: "fullPath",
            width: 250
          },
          {
            title: "漏洞级别",
            slot: "severity",
            align: "center"
          },
          {
            title: "影响版本",
            slot: "vulnerableVersions",
            align: "center"
          },
          {
            title: "漏洞详情",
            slot: "detail",
            align: "center"
          }
        ]
      };
    }
  },
  packages
);
export default processModule;
</script>
