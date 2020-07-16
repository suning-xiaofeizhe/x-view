'use strict';

import axios from "axios";
import * as common from "../common";

export default {
  created() {
    this.getPackageInfo();
  },
  methods: {
    getPackageInfo() {
      const error = '获取 package 信息列表失败，请重试';
      this.loading = true;
      this.reset();
      axios.get('/api/app/agent_packages', { params: { appId: this.appId, agentId: this.agentId } })
        .then(data => {
          data = data.data;
          if (data.ok) {
            data = data.data;
            if (Array.isArray(data.packages)) {
              this.packages = data.packages;
              if (this.packages.length > 0) {
                this.selectedPackage = this.packages[0];
              }
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
    reset() {
      this.choseDependencies = true;
      this.showHowToFix = false;
    },
    selectPackage(index) {
      this.reset();
      this.selectedPackage = this.packages[index];
    },
    howToFix() {
      this.showHowToFix = true;
    },
    showPackageInfo() {
      this.reset();
      this.showHowToFix = false;
    },
    downloadPackage(url) {
      window.location = url;
    },
    getPackages(dependencies, dev) {
      return Object.entries(dependencies).map(([pkg, ver]) => {
        const lockInfo = this.packageLockInfo[pkg] || {};
        return {
          packageName: pkg,
          settedPackageVersion: ver,
          lockedPackageVersion: lockInfo.version,
          usedPackageDownloadUrl: lockInfo.resolved,
          devDependence: dev
        };
      });
    },
    changeChosenDependencies(checked) {
      this.choseDependencies = checked;
    },
    changeChosenDevDependencies(checked) {
      this.choseDependencies = !checked;
    },
    showMorDetail(url) {
      window.open(url);
    },
    changeDetail(row) {
      const index = row.index;
      const actions = this.audit.actions || [];
      this.selectedResolves = (actions[index] && actions[index].resolves) || [];
    }
  },
  computed: {
    audit() {
      const audit = this.selectedPackage.audit || {};
      return audit;
    },
    advisories() {
      const audit = this.audit;
      const advisories = audit.advisories || {};
      return advisories;
    },
    metadata() {
      const audit = this.audit;
      const metadata = audit.metadata || {};
      return metadata;
    },
    vulnerabilities() {
      const metadata = this.metadata;
      const vulnerabilities = metadata.vulnerabilities || {};
      return vulnerabilities;
    },
    totalDependencies() {
      const metadata = this.metadata;
      const totalDependencies = metadata.totalDependencies || 0;
      return totalDependencies;
    },
    scanTime() {
      const metadata = this.metadata;
      const scanTime = metadata.scanTime || 0;
      return scanTime;
    },
    hasSecurityRisk() {
      const vulnerabilities = this.vulnerabilities;
      return vulnerabilities &&
        (vulnerabilities.low || vulnerabilities.moderate || vulnerabilities.high || vulnerabilities.critical);
    },
    packageLockInfo() {
      const lock = this.selectedPackage.lock || {};
      return lock;
    },
    dependencies() {
      const dependencies = this.selectedPackage.dependencies || {};
      return this.getPackages(dependencies, false);
    },
    devDependencies() {
      const devDependencies = this.selectedPackage.devDependencies || {};
      return this.getPackages(devDependencies, true);
    },
    packageTableData() {
      if (this.choseDependencies) {
        return this.dependencies;
      } else {
        return this.devDependencies;
      }
    },
    actionTableData() {
      const actions = this.audit.actions || [];
      this.selectedResolves = (actions[0] && actions[0].resolves) || [];
      const devDependencies = this.selectedPackage.devDependencies || {};
      return actions.map((action, index) => {
        let fixCmd = '';
        const devDependence = !!devDependencies[action.module];
        switch (action.action) {
          case 'install':
            fixCmd = `npm install ${action.module}@${action.target} ${devDependence ? '--save-dev' : '--save'}`;
            break;
          case 'update':
            fixCmd = `npm update ${action.module} --depth=${action.depth}`;
            break;
          case 'review':
            fixCmd = `涉及到的依赖模块需要手动 review`;
            break;
          default:
            break;
        }
        return { index, fixCmd };
      });
    },
    resolvesTableData() {
      const advisories = this.advisories;
      return this.selectedResolves.map(resolve => {
        const result = { dev: resolve.dev, fullPath: resolve.path };
        const id = resolve.id;
        const advisory = advisories[id];
        if (advisory) {
          result.moduleName = advisory.module_name;
          result.currentVersions = advisory.findings.map(item => item.version).join(', ');
          result.originDependence = [];
          for (const { paths } of advisory.findings) {
            for (const path of paths) {
              const tmp = path.split('>');
              if (tmp.length > 0) {
                result.originDependence.push(tmp[0]);
              }
            }
          }
          result.originDependence = Array.from(new Set(result.originDependence));
          result.originDependence = result.originDependence.join(', ');
          result.severity = advisory.severity;
          result.vulnerableVersions = advisory.vulnerable_versions;
          result.detail = advisory.url;
        }
        return result;
      });
    }
  },
  watch: {
    agentId() {
      this.getPackageInfo();
    }
  }
};
