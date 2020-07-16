'use strict';

const os = require('os');
const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const moment = require('moment');
const app = express();

let randomCache = {};

function getRandomInstanceCount() {
  return parseInt(Math.random() * 35) + 1;
}

setInterval(() => {
  Object.keys(randomCache).forEach(k => randomCache[k].count = getRandomInstanceCount());
}, 1000);

app.use(bodyParser());

app.use(function (req, res, next) {
  // console.log('url:', req.path, ', method:', req.method);
  next();
});

// get user info
app.get('/api/user', function (req, res) {
  const data = {
    name: 'hyj1991',
    jobNumber: '123456'
  };
  res.send(JSON.stringify({ ok: true, data }));
});

// create app
app.post('/api/application', function (req, res) {
  console.log('create application:', req.body);
  const appId = parseInt(Math.random() * 1000);
  randomCache[appId] = {
    name: req.body.appName,
    count: getRandomInstanceCount(),
    secret: '3b33391b83631e369c5dfc85e7641109',
    own: true
  };
  const data = {
    appName: randomCache[appId].name,
    appId,
    appSecret: randomCache[appId].secret
  }
  res.send(JSON.stringify({ ok: true, data }));
});

// get my apps
app.get('/api/apps', function (req, res) {
  const type = req.query.type;
  console.log('apps:', type);
  const random = parseInt(Math.random() * 5) + 1;
  if (type === 'myApps') {
    const data = {
      list: new Array(random).fill('*').map(() => {
        const appId = parseInt(Math.random() * 1000);
        randomCache[appId] = {
          name: `Xnpp-${appId}`,
          count: getRandomInstanceCount(),
          own: true
        };
        return {
          appName: `Xnpp-${appId}`,
          appId,
          own: true
        };
      }),
      invitations: [{
        appId: parseInt(Math.random() * 1000),
        appName: 'xnpp',
        owner: parseInt(Math.random() * 1000),
        workId: '17054666'
      }]
    };
    res.send(JSON.stringify({ ok: true, data }));
  } else if (type === 'joinedApps') {
    const data = {
      list: new Array(random).fill('*').map(() => {
        const appId = parseInt(Math.random() * 1000);
        randomCache[appId] = {
          name: `Joined-${appId}`,
          count: getRandomInstanceCount(),
          own: false
        };
        return {
          appName: `Joined-${appId}`,
          appId,
          own: false
        };
      })
    };
    res.send(JSON.stringify({ ok: true, data }));
  } else {
    res.send(JSON.stringify({ ok: false, message: `不支持的类型: ${type}` }));
  }
});

// get app instance
app.get('/api/app/instance_count', function (req, res) {
  const appId = req.query.appId;
  console.log('instance appId:', appId);
  const data = {
    count: randomCache[appId].count
  }
  res.send(JSON.stringify({ ok: true, data }));
});

// get app alarm count in 24h
app.get('/api/app/alarm_count', function (req, res) {
  const appId = req.query.appId;
  console.log('alarm appId:', appId);
  const data = {
    count: parseInt((Math.random() * 10e3))
  };
  res.send(JSON.stringify({ ok: true, data }));
});

// get node cpu statistics
app.get('/api/app/cpu_overview', function (req, res) {
  const appId = req.query.appId;
  console.log('cpu statistics appId:', appId);
  const data = {
    list: new Array(randomCache[appId].count).fill('*').map(() => {
      const cpuUsage = (Math.random() * 100).toFixed(2);
      const status = cpuUsage < 60 ? 0 : cpuUsage < 85 ? 1 : 2;
      return {
        // status: '-',
        status,
        agentId: os.hostname(),
        cpuUsage
      }
    })
  };
  res.send(JSON.stringify({ ok: true, data }));
});

// get node memory statistics
app.get('/api/app/memory_overview', function (req, res) {
  const appId = req.query.appId;
  console.log('memory statistics appId:', appId);
  const data = {
    list: new Array(randomCache[appId].count).fill('*').map(() => {
      const memoryUsage = (Math.random() * 100).toFixed(2);
      const status = memoryUsage < 60 ? 0 : memoryUsage < 85 ? 1 : 2;
      return {
        // status: '-',
        status,
        agentId: os.hostname(),
        memoryUsage
      }
    })
  };
  res.send(JSON.stringify({ ok: true, data }));
});

// get app info
app.get('/api/application', function (req, res) {
  const appId = req.query.appId;
  console.log('get app info appId:', appId);
  const data = {
    name: randomCache[appId].name,
    own: randomCache[appId].own
  };
  res.send(JSON.stringify({ ok: true, data }));
});

/* ----------------- app setting ----------------- */
// get app secret
app.get('/api/app/info', function (req, res) {
  const appId = req.query.appId;
  console.log('get app secret appId:', appId);
  const data = {
    secret: '26fabeca762590d6d1379b7a4b218057',
  };
  res.send(JSON.stringify({ ok: true, data }));
});

// modify app name
app.post('/api/app/name', function (req, res) {
  const appName = req.body.appName;
  const appId = req.body.appId;
  randomCache[appId].name = appName;
  console.log('modify app name:', appName, ', appId: ', appId);
  res.send(JSON.stringify({ ok: true }));
});

// delete app
app.delete('/api/application', function (req, res) {
  const appId = req.body.appId;
  console.log('delete app appId:', appId);
  delete randomCache[appId];
  res.send(JSON.stringify({ ok: true }));
});

/* ----------------- member start ----------------- */

// get member list
app.get('/api/members', function (req, res) {
  const appId = req.query.appId;
  console.log('get api members appId:', appId);
  const list = [
    {
      workId: "19054670",
      userName: "黄一君",
      status: 0,
      joinedTime: "2019-09-22 10::10::10",
      owner: 1,
      currentUser: "19054670"
    },
    {
      workId: "17085554",
      userName: "李宇翔",
      status: 1,
      joinedTime: "2019-09-22 10::10::10",
      owner: 1,
      currentUser: "19054670"
    },
    {
      workId: "16055786",
      userName: "禹立彬",
      status: 2,
      joinedTime: "2019-09-22 10::10::10",
      owner: 1,
      currentUser: "19054670"
    }
  ];
  res.send(JSON.stringify({ ok: true, data: { list } }));
});

// invite member to app
app.post('/api/member/invitation', function (req, res) {
  const appId = req.body.appId;
  const workId = req.body.workId;
  console.log('invite member invitation appId:', appId, ', workId:', workId);
  res.send(JSON.stringify({ ok: true }));
});

// cancel invitation
app.delete('/api/member/invitation', function (req, res) {
  const appId = req.body.appId;
  const workId = req.body.workId;
  console.log('cancel member invitation appId:', appId, ', workId:', workId);
  res.send(JSON.stringify({ ok: true }));
});

// confirm/reject invitation
app.put('/api/member/invitation', function (req, res) {
  const appId = req.body.appId;
  const workId = req.body.workId;
  const status = req.body.status;
  console.log('confirm/reject member invitation appId:', appId, ', workId:', workId, ', status:', status);
  res.send(JSON.stringify({ ok: true }));
});

// transfer ownership
app.post('/api/member/ownership', function (req, res) {
  const appId = req.body.appId;
  const workId = req.body.workId;
  console.log('transfer ownership appId:', appId, ', workId:', workId);
  res.send(JSON.stringify({ ok: true }));
});

// delete team member
app.delete('/api/team/member', function (req, res) {
  const appId = req.body.appId;
  const workId = req.body.workId;
  console.log('delete team member appId:', appId, ', workId:', workId);
  res.send(JSON.stringify({ ok: true }));
});

// leave team
app.delete('/api/member', function (req, res) {
  const appId = req.body.appId;
  const workId = req.body.workId;
  console.log('leave team appId:', appId, ', workId:', workId);
  res.send(JSON.stringify({ ok: true }));
});

/* ----------------- member end ----------------- */

/* ----------------- file start ----------------- */

// upload file from console
app.post('/api/upload2oss', function (req, res) {
  const appId = req.query.appId;
  const fileType = req.query.fileType;
  console.log('upload file appId:', appId, ', type:', fileType);
  res.send(JSON.stringify({ ok: true }));
});

// download file
app.get('/file/download', function (req, res) {
  const fileId = req.query.fileId;
  const fileType = req.query.fileType;
  console.log(`download file ${fileType}: ${fileId}`);
  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Content-Disposition', `attachment;filename=test.${fileType}`);
  const tmp = path.join(__dirname, `mock.${fileType}`);
  if (fs.existsSync(tmp)) {
    fs.createReadStream(tmp).pipe(res);
  } else {
    fs.createReadStream(__filename).pipe(res);
  }
});

// get file list
app.get('/api/file_list', function (req, res) {
  const appId = req.query.appId;
  const page = req.query.page;
  const pageSize = req.query.size;
  const filterType = req.query.filterType;
  console.log(`get ${appId} file list page ${page}, size: ${pageSize}, filterType: ${filterType}`);
  const data = {
    list: [
      {
        fileType: 'trend',
        file: 'x-process-snapshot-21182-20190930-75431.trend',
        fileName: 'x-process-snapshot-21182-20190930-75431.trend',
        name: '黄一君',
        workId: '19054670',
        time: '2019-07-12 11:19:32',
        agent: '186590dd08d3.local',
        status: 2,
        favor: 0,
        fileId: 3,
        transferring: true
      },
      {
        fileType: 'cpuprofile',
        file: '/tmp/heapdump-84735-20190712-111932.cpuprofile',
        fileName: 'x-process-snapshot-21182-20190930-75431.trend',
        name: '黄一君',
        workId: '19054670',
        time: '2019-07-12 11:19:32',
        agent: '186590dd08d3.local',
        status: 1,
        favor: 0,
        fileId: 3,
        transferring: true
      },
      {
        fileType: 'cpuprofile',
        file: '/tmp/heapdump-84735-20190712-111933.cpuprofile',
        fileName: 'heapdump-84735-20190712-111933.cpuprofile',
        name: '黄一君',
        workId: '19054670',
        time: '2019-07-12 11:19:32',
        agent: '186590dd08d3.local',
        status: 1,
        favor: 0,
        fileId: 99
      },
      {
        fileType: 'heapprofile',
        file: '/tmp/heapdump-84735-20190712-111932.heapprofile',
        fileName: 'heapdump-84735-20190712-111932.heapprofile',
        name: '李宇翔',
        workId: '17080854',
        time: '2019-07-12 11:19:32',
        agent: '186590dd08d3.local',
        status: 0,
        favor: 0,
        fileId: 3
      },
      {
        fileType: 'gclog',
        file: '/tmp/heapdump-84735-20190712-111932.gclog',
        fileName: 'heapdump-84735-20190712-111932.gclog',
        name: '李宇翔',
        workId: '17080854',
        time: '2019-07-12 11:19:32',
        agent: 'upload',
        status: 2,
        favor: 1,
        fileId: 3
      },
      {
        fileType: 'heapsnapshot',
        file: '/tmp/heapdump-84735-20190712-111932.heapsnapshot',
        fileName: 'heapdump-84735-20190712-111932.heapsnapshot',
        name: '李宇翔',
        workId: '17080854',
        time: '2019-07-12 11:19:32',
        agent: '186590dd08d3.local',
        status: 2,
        favor: 1,
        fileId: 3
      },
      {
        fileType: 'diag',
        file: '/tmp/heapdump-84735-20190712-111932.diag',
        fileName: 'heapdump-84735-20190712-111932.diag',
        name: '李宇翔',
        workId: '17080854',
        time: '2019-07-12 11:19:32',
        agent: '186590dd08d3.local',
        status: 2,
        favor: 0,
        fileId: 3
      },
      {
        fileType: 'core',
        coreFile: '/tmp/heapdump-84735-20190712-111932.core',
        fileName: 'heapdump-84735-20190712-111932.core',
        executableFile: 'linux-v10.13.0.node',
        executableStatus: 0,
        name: '李宇翔',
        workId: '17080854',
        time: '2019-07-12 11:19:32',
        agent: 'upload',
        status: 2,
        fileId: 3
      },
      {
        fileType: 'core',
        coreFile: '/tmp/heapdump-84735-20190712-111932.core',
        fileName: 'heapdump-84735-20190712-111932.core',
        executableFile: 'node-v10.13.0',
        executableStatus: 1,
        name: '李宇翔',
        workId: '17080854',
        time: '2019-07-12 11:19:32',
        agent: '186590dd08d3.local',
        status: 2,
        fileId: 4
      }
    ],
    totalCount: 100
  };
  res.send(JSON.stringify({ ok: true, data }));
});

// favor
app.post('/api/file_favor', function (req, res) {
  const fileId = req.body.fileId;
  const fileType = req.body.fileType;
  console.log(`favor file ${fileType}: ${fileId}`);
  res.send(JSON.stringify({ ok: true }));
});


// delete file
app.delete('/api/file', function (req, res) {
  const fileId = req.body.fileId;
  const fileType = req.body.fileType;
  console.log(`delete file ${fileType}: ${fileId}`);
  res.send(JSON.stringify({ ok: true }));
});

// transfer file
app.post('/api/file_transfer', function (req, res) {
  const fileId = req.body.fileId;
  const fileType = req.body.fileType;
  console.log(`transfer file ${fileType}: ${fileId}`);
  res.send(JSON.stringify({ ok: true }));
});

/* ----------------- file end ----------------- */

/* ----------------- agent start ----------------- */

app.get('/api/app/agent_list', function (req, res) {
  const appId = req.query.appId;
  console.log(`get app [${appId}] agent list`);
  const list = [
    { value: 'hyj1991deMacBook-Pro.local', label: 'hyj1991deMacBook-Pro.local' },
    { value: '821a3c59b946', label: '821a3c59b946' },
    { value: '97e0321c43ac', label: '97e0321c43ac' }
  ]
  res.send({ ok: true, data: { list } });
});

app.get('/api/app/agent_detail', function (req, res) {
  const appId = req.query.appId;
  const agentId = req.query.agentId;
  console.log(`get app [${appId}] agent [${agentId}] detail`);
  const now = Date.now();
  const update = new Date().toLocaleString('chinese', { hour12: false });
  let data;
  if (agentId === '821a3c59b946') {
    data = {
      timeline: [], detail: []
    }
  } else {
    const update = moment().format('YYYY-MM-DD HH:mm:ss');
    data = {
      "timeline":
        [
          { "pid": 73851, "create": "2019-09-14 20:48:17", "update": update },
          { "pid": 76981, "create": "2019-09-15 12:28:33", "update": update },
          { "pid": 76982, "create": "2019-09-15 12:28:32", "update": update },
          { "pid": 77961, "create": "2019-09-15 13:17:41", "update": "2019-09-15 14:11:52" },
          { "pid": 79242, "create": "2019-09-15 14:07:50", "update": "2019-09-15 14:11:52" }],
      "detail": [
        { "active_handles": 11, "cpu_60": 0.01, "gc_total": 0, "rss": 29347840, "total_timer": 1, "total_tcp": 2, "pid": 73851 },
        { "active_handles": 5, "cpu_60": 0, "gc_total": 0, "rss": 26767360, "total_timer": 0, "total_tcp": 1, "pid": 76981 },
        { "active_handles": 29, "cpu_60": 0.01, "gc_total": 0, "rss": 33267712, "total_timer": 1, "total_tcp": 2, "pid": 76982 },
        { "active_handles": 11, "cpu_60": 0.05, "gc_total": 0.01, "rss": 45195264, "total_timer": 1, "total_tcp": 9, "pid": 77961 },
        { "active_handles": 11, "cpu_60": 0.14, "gc_total": 0.08, "rss": 47013888, "total_timer": 1, "total_tcp": 9, "pid": 79242 }
      ]
    };
  }
  res.send({ ok: true, data });
});

app.get('/api/app/agent_process', function (req, res) {
  const appId = req.query.appId;
  const agentId = req.query.agentId;
  console.log(`get app [${appId}] agent [${agentId}] processes`);
  let data;
  if (agentId === '97e0321c43ac') {
    data = {
      xagent: false,
      processes: []
    }
  } else {
    data = {
      "xagent": true,
      "processes": [
        { "pid": "74814", "command": "node /Users/hyj1991/git/xnode/x-agent/bin/xagent_main /Users/hyj1991/git/example/x-node-test/xnpp-local.json" },
        { "pid": "74815", "command": "/Users/hyj1991/.tnvm/versions/node/v12.9.1/bin/node /Users/hyj1991/git/xnode/x-agent/bin/client.js /Users/hyj1991/git/example/x-node-test/xnpp-local.json" },
        { "pid": "55990", "command": "node /Users/hyj1991/git/xnode/x-agentserver/node_modules/.bin/nodemon dispatch.js" },
        { "pid": "74912", "command": "/Users/hyj1991/.tnvm/versions/node/v12.9.1/bin/node dispatch.js" },
        { "pid": "73848", "command": "node /Users/hyj1991/git/xnode/x-agentmanager/node_modules/.bin/egg-bin dev --port=7002" },
        { "pid": "73849", "command": "/Users/hyj1991/.tnvm/versions/node/v12.9.1/bin/node /Users/hyj1991/git/xnode/x-agentmanager/node_modules/egg-bin/lib/start-cluster {\"typescript\":false,\"declarations\":false,\"port\":7002,\"workers\":1,\"baseDir\":\"/Users/hyj1991/git/xnode/x-agentmanager\",\"framework\":\"/Users/hyj1991/git/xnode/x-agentmanager/node_modules/@xnode/sng\"}" },
        { "pid": "73851", "command": "/Users/hyj1991/.tnvm/versions/node/v12.9.1/bin/node /Users/hyj1991/git/xnode/x-agentmanager/node_modules/egg-cluster/lib/agent_worker.js {\"framework\":\"/Users/hyj1991/git/xnode/x-agentmanager/node_modules/@xnode/sng\",\"baseDir\":\"/Users/hyj1991/git/xnode/x-agentmanager\",\"port\":7002,\"workers\":1,\"plugins\":null,\"https\":false,\"typescript\":false,\"declarations\":false,\"clusterPort\":64376}" },
        { "pid": "77961", "command": "/Users/hyj1991/.tnvm/versions/node/v12.9.1/bin/node /Users/hyj1991/git/xnode/x-agentmanager/node_modules/egg-cluster/lib/app_worker.js {\"framework\":\"/Users/hyj1991/git/xnode/x-agentmanager/node_modules/@xnode/sng\",\"baseDir\":\"/Users/hyj1991/git/xnode/x-agentmanager\",\"port\":7002,\"workers\":1,\"plugins\":null,\"https\":false,\"typescript\":false,\"declarations\":false,\"clusterPort\":64376}" },
        { "pid": "76980", "command": "node /Users/hyj1991/git/xnode/x-console/node_modules/.bin/egg-bin -r @xnode/x-node dev --port=7001" }, { "pid": "76981", "command": "/Users/hyj1991/.tnvm/versions/node/v12.9.1/bin/node --require @xnode/x-node /Users/hyj1991/git/xnode/x-console/node_modules/egg-bin/lib/start-cluster {\"port\":7001,\"workers\":1,\"baseDir\":\"/Users/hyj1991/git/xnode/x-console\",\"framework\":\"/Users/hyj1991/git/xnode/x-console/node_modules/egg\"}" },
        { "pid": "76982", "command": "/Users/hyj1991/.tnvm/versions/node/v12.9.1/bin/node --require @xnode/x-node /Users/hyj1991/git/xnode/x-console/node_modules/egg-cluster/lib/agent_worker.js {\"framework\":\"/Users/hyj1991/git/xnode/x-console/node_modules/egg\",\"baseDir\":\"/Users/hyj1991/git/xnode/x-console\",\"port\":7001,\"workers\":1,\"plugins\":null,\"https\":false,\"clusterPort\":54636}" },
        { "pid": "79242", "command": "/Users/hyj1991/.tnvm/versions/node/v12.9.1/bin/node --require @xnode/x-node /Users/hyj1991/git/xnode/x-console/node_modules/egg-cluster/lib/app_worker.js {\"framework\":\"/Users/hyj1991/git/xnode/x-console/node_modules/egg\",\"baseDir\":\"/Users/hyj1991/git/xnode/x-console\",\"port\":7001,\"workers\":1,\"plugins\":null,\"https\":false,\"clusterPort\":54636}" },
        { "pid": "60453", "command": "node /Users/hyj1991/git/xnode/x-view/node_modules/.bin/nodemon mock/server.js" }, { "pid": "75686", "command": "/Users/hyj1991/.tnvm/versions/node/v10.16.3/bin/node mock/server.js" },
        { "pid": "60451", "command": "node /Users/hyj1991/git/xnode/x-view/node_modules/.bin/webpack-dev-server --inline --progress --config build/webpack.dev.conf.js" }]
    }
  }
  res.send({ ok: true, data });
});

app.get('/api/app/agent_process_status', function (req, res) {
  const appId = req.query.appId;
  const agentId = req.query.agentId;
  const pid = req.query.pid;
  console.log(`get app [${appId}] agent [${agentId}] process [${pid}] status.`);
  const data = { pid, nodeVersion: '12.9.1', installXnode: true, xnodeVersion: '0.1.0', xnodeLogDir: '/tmp', xagentLogDir: '/tmp' };
  res.send({ ok: true, data });
});

app.get('/api/app/agent_info', function (req, res) {
  const appId = req.query.appId;
  const agentId = req.query.agentId;
  console.log(`get app [${appId}] agent [${agentId}] os info.`);
  const data = {
    nodeVersion: '12.9.1',
    xagentVersion: '1.3.4',
    ulimitC: 'unlimited',
    osInfo: 'Darwin/hyj1991deMacBook-Pro.local/darwin/x64/18.7.0'
  };
  res.send({ ok: true, data });
});

app.post('/api/app/agent_take_action', function (req, res) {
  const appId = req.body.appId;
  const agentId = req.body.agentId;
  const pid = req.body.pid;
  const action = req.body.action;
  console.log(`app [${appId}] agent [${agentId}] pid [${pid}] take action: ${action}`);
  const data = { file: '/root/logs/alinode/diagnostic-report-18963-20190916-161615.diag', type: action };
  res.send({ ok: true, data });
});

/* ----------------- agent end ----------------- */

/* ----------------- analysis diag start ----------------- */

app.get('/api/file_detail', function (req, res) {
  const fileId = req.query.fileId;
  const fileType = req.query.fileType;
  console.log(`analysis ${fileType}: ${fileId}`);
  const data = {
    fileName: `x-${fileType}-92361-20190917-415675.${fileType}`,
    fileId,
    fileType
  }
  res.send(JSON.stringify({ ok: true, data }));
});

/* ----------------- analysis diag end ----------------- */


/* ----------------- alarm start ----------------- */

app.get('/api/alarm/strategies', function (req, res) {
  const appId = req.query.appId;
  console.log(`get app ${appId} user rules`);
  const list = [
    {
      strategyId: 1,
      contextType: 'node_log',
      pushType: 'p3',
      dsl: '@cpu_60 > 80',
      expr: '1 分钟内 CPU 使用率超过 80%，当前为 ${@cpu_60}%',
      status: 1,
      count: 666
    },
    {
      strategyId: 2,
      contextType: 'system_log',
      pushType: 'p3',
      dsl: '@disk_usage > 85',
      expr: '磁盘 (${@mounted_on}) 占比超过 85%：为 ${@disk_usage}%',
      status: 0,
      count: 0
    }
  ];
  res.send(JSON.stringify({ ok: true, data: { list } }));
});

app.post('/api/alarm/strategy', function (req, res) {
  const appId = req.body.appId;
  const contextType = req.body.contextType;
  const pushType = req.body.pushType;
  const dsl = req.body.dsl;
  const expr = req.body.expr;
  console.log(`app ${appId} add rule: ${contextType}, ${pushType}, ${dsl}, ${expr}`);
  res.send({ ok: true });
});

app.put('/api/alarm/strategy', function (req, res) {
  const appId = req.body.appId;
  const contextType = req.body.contextType;
  const pushType = req.body.pushType;
  const dsl = req.body.dsl;
  const expr = req.body.expr;
  const strategyId = req.body.strategyId;
  console.log(`app ${appId} update rule: <${strategyId}> ${contextType}, ${pushType}, ${dsl}, ${expr}`);
  res.send({ ok: true });
});

app.delete('/api/alarm/strategy', function (req, res) {
  const appId = req.body.appId;
  const strategyId = req.body.strategyId;
  console.log(`delete app ${appId} rule ${strategyId}`);
  res.send({ ok: true });
});

app.put('/api/alarm/strategy_status', function (req, res) {
  const appId = req.body.appId;
  const strategyId = req.body.strategyId;
  const status = req.body.status;
  console.log(`update app ${appId}  strategy ${strategyId} status: ${status}`);
  res.send({ ok: true });
});

app.get('/api/alarm/list', function (req, res) {
  const appId = req.query.appId;
  const strategyId = req.query.strategyId;
  console.log(`get app ${appId} strategyId ${strategyId} alarm list`);
  const list = [
    {
      appId,
      agentId: os.hostname(),
      time: new Date().toLocaleString('chinese', { hour12: false }),
      contextType: 'node_log',
      expr: '1 分钟内 CPU 使用率超过 80%，当前为 87%',
      pid: 76982
    },
    {
      appId,
      agentId: os.hostname(),
      time: new Date().toLocaleString('chinese', { hour12: false }),
      contextType: 'system_log',
      expr: '系统内存整体使用率超过 80%，当前为 82%',
      instanceTab: 'system'
    },
    {
      appId,
      agentId: os.hostname(),
      time: new Date().toLocaleString('chinese', { hour12: false }),
      contextType: 'xagent_notification',
      expr: '项目依赖发现极危漏洞 1 个，高危漏洞 66 个，请尽快升级修复',
      instanceTab: 'package'
    },
    {
      appId,
      agentId: '821a3c59b946',
      time: new Date().toLocaleString('chinese', { hour12: false }),
      contextType: 'system_log',
      expr: '磁盘 (/mnt) 占比超过 85%：为 91%',
      instanceTab: 'system'
    }
  ];
  res.send({ ok: true, data: { list, totalCount: 3 } });
});

app.get('/api/alarm/member_list', function (req, res) {
  const appId = req.query.appId;
  const strategyId = req.query.strategyId;
  console.log(`get app ${appId} strategyId ${strategyId} member list`);
  const settedList = [{
    workId: '19054670',
    userName: '黄一君',
    strategyId
  }];
  const remainList = [
    {
      workId: '17080854',
      userName: '李宇翔',
      strategyId
    }
  ];
  res.send({ ok: true, data: { settedList, remainList } });
});

app.put('/api/alarm/member', function (req, res) {
  const appId = req.body.appId;
  const strategyId = req.body.strategyId;
  const workId = req.body.workId;
  console.log(`add member ${workId} to app ${appId} strategyId ${strategyId}`);
  res.send({ ok: true });
});

app.delete('/api/alarm/member', function (req, res) {
  const appId = req.body.appId;
  const strategyId = req.body.strategyId;
  const workId = req.body.workId;
  console.log(`delete member ${workId} from app ${appId} strategyId ${strategyId}`);
  res.send({ ok: true });
});

// global alarm
app.get('/api/alarm/global_strategies', function (req, res) {
  console.log(`get global rules`);
  const list = [
    {
      strategyId: 1,
      contextType: 'node_log',
      pushType: 'p3',
      dsl: '@cpu_60 > 80',
      expr: '1 分钟内 CPU 使用率超过 80%，当前为 ${@cpu_60}%',
      status: 1,
      count: 666
    },
    {
      strategyId: 2,
      contextType: 'system_log',
      pushType: 'p3',
      dsl: '@disk_usage > 85',
      expr: '磁盘 (${@mounted_on}) 占比超过 85%：为 ${@disk_usage}%',
      status: 0,
      count: 0
    }
  ];
  res.send(JSON.stringify({ ok: true, data: { list } }));
});

app.post('/api/alarm/global_strategy', function (req, res) {
  const contextType = req.body.contextType;
  const pushType = req.body.pushType;
  const dsl = req.body.dsl;
  const expr = req.body.expr;
  console.log(`global add rule: ${contextType}, ${pushType}, ${dsl}, ${expr}`);
  res.send({ ok: true });
});

app.put('/api/alarm/global_strategy', function (req, res) {
  const contextType = req.body.contextType;
  const pushType = req.body.pushType;
  const dsl = req.body.dsl;
  const expr = req.body.expr;
  const strategyId = req.body.strategyId;
  console.log(`global} update rule: <${strategyId}> ${contextType}, ${pushType}, ${dsl}, ${expr}`);
  res.send({ ok: true });
});

app.delete('/api/alarm/global_strategy', function (req, res) {
  const strategyId = req.body.strategyId;
  console.log(`delete global rule ${strategyId}`);
  res.send({ ok: true });
});

app.put('/api/alarm/global_strategy_status', function (req, res) {
  const strategyId = req.body.strategyId;
  const status = req.body.status;
  console.log(`update global strategy ${strategyId} status: ${status}`);
  res.send({ ok: true });
});

app.get('/api/alarm/global_list', function (req, res) {
  const strategyId = req.query.strategyId;
  console.log(`get global strategyId ${strategyId} alarm list`);
  const list = [
    {
      appId: 1,
      agentId: os.hostname(),
      owner: 19054670,
      time: new Date().toLocaleString('chinese', { hour12: false }),
      contextType: 'node_log',
      expr: '1 分钟内 CPU 使用率超过 80%，当前为 87%',
      pid: 76982
    },
    {
      appId: 2,
      agentId: os.hostname(),
      owner: 19054670,
      time: new Date().toLocaleString('chinese', { hour12: false }),
      contextType: 'system_log',
      expr: '系统内存整体使用率超过 80%，当前为 82%',
      instanceTab: 'system'
    },
    {
      appId: 3,
      agentId: os.hostname(),
      owner: 19054670,
      time: new Date().toLocaleString('chinese', { hour12: false }),
      contextType: 'xagent_notification',
      expr: '项目依赖发现极危漏洞 1 个，高危漏洞 66 个，请尽快升级修复',
      instanceTab: 'package'
    },
    {
      appId: 4,
      agentId: '821a3c59b946',
      owner: 19054670,
      time: new Date().toLocaleString('chinese', { hour12: false }),
      contextType: 'system_log',
      expr: '磁盘 (/mnt) 占比超过 85%：为 91%',
      instanceTab: 'system'
    }
  ];
  res.send({ ok: true, data: { list, totalCount: 3 } });
});

app.get('/api/alarm/global_member_list', function (req, res) {
  const strategyId = req.query.strategyId;
  console.log(`get global strategyId ${strategyId} member list`);
  const settedList = [{
    workId: '19054670',
    userName: '黄一君',
    strategyId
  }];
  const remainList = [
    {
      workId: '17080854',
      userName: '李宇翔',
      strategyId
    }
  ];
  res.send({ ok: true, data: { settedList, remainList } });
});

app.put('/api/alarm/global_member', function (req, res) {
  const strategyId = req.body.strategyId;
  const workId = req.body.workId;
  console.log(`add member ${workId} to global strategyId ${strategyId}`);
  res.send({ ok: true });
});

app.delete('/api/alarm/global_member', function (req, res) {
  const strategyId = req.body.strategyId;
  const workId = req.body.workId;
  console.log(`delete member ${workId} from global strategyId ${strategyId}`);
  res.send({ ok: true });
});

/* ----------------- alarm end ----------------- */

/* ----------------- process detail start ----------------- */

app.get('/api/agent/process_detail', function (req, res) {
  const appId = req.query.appId;
  const agentId = req.query.agentId;
  const pid = req.query.pid;
  const trend = req.query.trend;
  console.log(`get app ${appId} agent ${agentId} pid ${pid} process trend: ${trend}`);
  let data = [];
  const interval = 288;
  if (trend === 'cpu') {
    const cpuTitles = ["cpu_now", "cpu_15", "cpu_30", "cpu_60"];
    for (let min = 0; min < interval; min++) {
      const tmp = { min: moment(Date.now() - min * (1440 / interval) * 60 * 1000).format('YYYY-MM-DD HH:mm') };
      if (min >= 100 && min <= 150) {
        data.push(tmp);
        continue;
      }
      for (let cpuTitle of cpuTitles) {
        tmp[cpuTitle] = Number((Math.random() * 99 + 1).toFixed(2));
      }
      data.push(tmp);
    }
    data.reverse();
  }
  if (trend === 'memory') {
    const memoryTitles = ["rss", "heap_total", "heap_used"];
    for (let min = 0; min < interval; min++) {
      const tmp = { min: moment(Date.now() - min * (1440 / interval) * 60 * 1000).format('YYYY-MM-DD HH:mm') };
      for (let memoryTitle of memoryTitles) {
        tmp[memoryTitle] = Math.random() * 1024 * 1024 * 1024 * 2;
      }
      data.push(tmp);
    }
    data.reverse();
  }
  if (trend === 'heap') {
    const heapTitles = ['new_space', 'old_space', 'code_space', 'map_space', 'lo_space'];
    for (let min = 0; min < interval; min++) {
      const tmp = { min: moment(Date.now() - min * (1440 / interval) * 60 * 1000).format('YYYY-MM-DD HH:mm') };
      for (let heapTitle of heapTitles) {
        tmp[heapTitle] = Math.random() * 1024 * 1024 * 1024 * 2;
      }
      data.push(tmp);
    }
    data.reverse();
  }
  if (trend === 'gc') {
    const gcTitles = ['total', 'scavange_duration', 'marksweep_duration'];
    for (let min = 0; min < interval; min++) {
      const tmp = { min: moment(Date.now() - min * (1440 / interval) * 60 * 1000).format('YYYY-MM-DD HH:mm') };
      for (let gcTitle of gcTitles) {
        tmp[gcTitle] = Number((Math.random() * 10 + 1).toFixed(2));
      }
      data.push(tmp);
    }
    data.reverse();
  }
  if (trend === 'handle') {
    const uvTitles = ['active_handles'];
    for (let min = 0; min < interval; min++) {
      const tmp = { min: moment(Date.now() - min * (1440 / interval) * 60 * 1000).format('YYYY-MM-DD HH:mm') };
      for (let uvTitle of uvTitles) {
        tmp[uvTitle] = parseInt((Math.random() * 10000));
      }
      data.push(tmp);
    }
    data.reverse();
  }
  if (trend === 'timer') {
    const timerTitles = ['timer_handles_active'];
    for (let min = 0; min < interval; min++) {
      const tmp = { min: moment(Date.now() - min * (1440 / interval) * 60 * 1000).format('YYYY-MM-DD HH:mm') };
      for (let timerTitle of timerTitles) {
        tmp[timerTitle] = parseInt((Math.random() * 10000));
      }
      data.push(tmp);
    }
    data.reverse();
  }
  if (trend === 'tcp') {
    const tcpTitles = ['tcp_handles_active'];
    for (let min = 0; min < interval; min++) {
      const tmp = { min: moment(Date.now() - min * (1440 / interval) * 60 * 1000).format('YYYY-MM-DD HH:mm') };
      for (let tcpTitle of tcpTitles) {
        tmp[tcpTitle] = parseInt((Math.random() * 2));
      }
      data.push(tmp);
    }
    data.reverse();
  }

  const pop = data.pop();
  data.push({ min: pop.min })

  res.send({ ok: true, data: { trend: data, heapLimit: 2 * 1024 * 1024 * 1024 } });
});

/* ----------------- process detail end ----------------- */

app.get('/api/app/agent_packages', function (req, res) {
  const appId = req.query.appId;
  const agentId = req.query.agentId;
  console.log(`get app ${appId} agent ${agentId} packages`);
  const packages = require("../mock/pkg.json");
  res.send({ ok: true, data: { packages } });
});

/* ----------------- agent error log start ----------------- */

app.get('/api/app/agent_error_log_files', function (req, res) {
  const appId = req.query.appId;
  const agentId = req.query.agentId;
  console.log(`get app ${appId} agent ${agentId} error logs`);
  const errorLogFiles = [
    {
      errorLogPath: '/Users/hyj1991/git/xnode/x-agentmanager/logs/x-agentmanager/common-error.log',
      errorLogFile: 'common-error.log'
    },
    {
      errorLogPath: '/Users/hyj1991/git/xnode/x-console/logs/x-console/common-error.log',
      errorLogFile: 'x-console-common-error.log'
    }
  ];
  res.send({ ok: true, data: { errorLogFiles } })
});

app.get('/api/app/agent_error_log', function (req, res) {
  const appId = req.query.appId;
  const agentId = req.query.agentId;
  const errorLogPath = req.query.errorLogPath;
  const currentPage = req.query.currentPage;
  const pageSize = req.query.pageSize;
  console.log(`get app ${appId} agent ${agentId} error log: ${errorLogPath}, page: ${currentPage}, size: ${pageSize}`);
  const start = 0 * pageSize;
  const stop = 1 * pageSize;
  let logs = require("../mock/errorlog.json");
  logs = logs.filter((...args) => args[1] >= start && args[1] < stop);
  res.send({ ok: true, data: { logs, count: 10001 } });
});

/* ----------------- agent error log end ----------------- */

app.get('/api/app/agent_osinfo_overview', function (req, res) {
  const appId = req.query.appId;
  const agentId = req.query.agentId;
  console.log(`get app ${appId} agent ${agentId} os info overview.`);
  const data = {
    cpuUsage: 0.1,
    memUsage: 0.65,
    diskUsage: 0.91,
    diskMounted: '/'
  };
  res.send({ ok: true, data });
});

app.get('/api/app/agent_osinfo_detail', function (req, res) {
  const appId = req.query.appId;
  const agentId = req.query.agentId;
  console.log(`get app ${appId} agent ${agentId} os info detail.`);
  const interval = 288;
  // cpu
  const cpuTrend = [];
  const cpuTitles = ["os_cpu"];
  for (let min = 0; min < interval; min++) {
    const tmp = { min: moment(Date.now() - min * (1440 / interval) * 60 * 1000).format('YYYY-MM-DD HH:mm') };
    if (min >= 100 && min <= 150) {
      cpuTrend.push(tmp);
      continue;
    }
    for (let cpuTitle of cpuTitles) {
      tmp[cpuTitle] = Number((Math.random() * 99 + 1).toFixed(2));
    }
    cpuTrend.push(tmp);
  }
  cpuTrend.reverse();
  const cpuPop = cpuTrend.pop();
  cpuTrend.push({ min: cpuPop.min });

  // mem
  const memTrend = [];
  const memTitles = ["os_mem"];
  for (let min = 0; min < interval; min++) {
    const tmp = { min: moment(Date.now() - min * (1440 / interval) * 60 * 1000).format('YYYY-MM-DD HH:mm') };
    if (min >= 100 && min <= 150) {
      memTrend.push(tmp);
      continue;
    }
    for (let memTitle of memTitles) {
      tmp[memTitle] = Number((Math.random() * 99 + 1).toFixed(2));
    }
    memTrend.push(tmp);
  }
  memTrend.reverse();
  const memPop = memTrend.pop();
  memTrend.push({ min: memPop.min });

  // load
  const loadTrend = [];
  const loadTitles = ['load1', 'load5', 'load15'];
  for (let min = 0; min < interval; min++) {
    const tmp = { min: moment(Date.now() - min * (1440 / interval) * 60 * 1000).format('YYYY-MM-DD HH:mm') };
    if (min >= 100 && min <= 150) {
      loadTrend.push(tmp);
      continue;
    }
    for (let loadTitle of loadTitles) {
      tmp[loadTitle] = Number((Math.random() * os.cpus().length).toFixed(2));
    }
    loadTrend.push(tmp);
  }
  loadTrend.reverse();
  const loadPop = loadTrend.pop();
  loadTrend.push({ min: loadPop.min });

  // node count
  const nodeTrend = [];
  const nodeTitles = ['node_count'];
  for (let min = 0; min < interval; min++) {
    const tmp = { min: moment(Date.now() - min * (1440 / interval) * 60 * 1000).format('YYYY-MM-DD HH:mm') };
    if (min >= 100 && min <= 150) {
      nodeTrend.push(tmp);
      continue;
    }
    for (let nodeTitle of nodeTitles) {
      tmp[nodeTitle] = parseInt((Math.random() * os.cpus().length));
    }
    nodeTrend.push(tmp);
  }
  nodeTrend.reverse();
  const nodePop = nodeTrend.pop();
  nodeTrend.push({ min: nodePop.min });

  // disk usage
  const diskFields = ['/', '/data'];
  const diskTrend = [];
  const diskTitles = diskFields;
  for (let min = 0; min < interval; min++) {
    const tmp = { min: moment(Date.now() - min * (1440 / interval) * 60 * 1000).format('YYYY-MM-DD HH:mm') };
    if (min >= 100 && min <= 150) {
      diskTrend.push(tmp);
      continue;
    }
    for (let diskTitle of diskTitles) {
      tmp[diskTitle] = Number((Math.random() * 99 + 1).toFixed(2));
    }
    diskTrend.push(tmp);
  }
  diskTrend.reverse();
  const diskPop = diskTrend.pop();
  diskTrend.push({ min: diskPop.min });

  // qps
  const qpsTrend = [];
  const qpsTitles = ['qps'];
  for (let min = 0; min < interval; min++) {
    const tmp = { min: moment(Date.now() - min * (1440 / interval) * 60 * 1000).format('YYYY-MM-DD HH:mm') };
    if (min >= 100 && min <= 150) {
      qpsTrend.push(tmp);
      continue;
    }
    for (let qpsTitle of qpsTitles) {
      tmp[qpsTitle] = parseInt((Math.random() * os.cpus().length));
    }
    qpsTrend.push(tmp);
  }
  qpsTrend.reverse();
  const qpsPop = qpsTrend.pop();
  qpsTrend.push({ min: qpsPop.min });

  // http response
  const responseFields = ['200', '304'];
  const responseTrend = [];
  const responseTitles = responseFields;
  for (let min = 0; min < interval; min++) {
    const tmp = { min: moment(Date.now() - min * (1440 / interval) * 60 * 1000).format('YYYY-MM-DD HH:mm') };
    if (min >= 100 && min <= 150) {
      responseTrend.push(tmp);
      continue;
    }
    for (let responseTitle of responseTitles) {
      tmp[responseTitle] = 1000 + parseInt(Math.random() * 1000);
    }
    responseTrend.push(tmp);
  }
  responseTrend.reverse();
  const responsePop = responseTrend.pop();
  responseTrend.push({ min: responsePop.min });

  // response rt
  const rtTrend = [];
  const rtTitles = ['rt'];
  for (let min = 0; min < interval; min++) {
    const tmp = { min: moment(Date.now() - min * (1440 / interval) * 60 * 1000).format('YYYY-MM-DD HH:mm') };
    if (min >= 100 && min <= 150) {
      rtTrend.push(tmp);
      continue;
    }
    for (let rtTitle of rtTitles) {
      tmp[rtTitle] = parseInt((Math.random() * 1000));
    }
    rtTrend.push(tmp);
  }
  rtTrend.reverse();
  const rtPop = rtTrend.pop();
  rtTrend.push({ min: rtPop.min });

  const expiredTrend = [];
  const expiredTitles = ['expired_count'];
  for (let min = 0; min < interval; min++) {
    const tmp = { min: moment(Date.now() - min * (1440 / interval) * 60 * 1000).format('YYYY-MM-DD HH:mm') };
    if (min >= 100 && min <= 150) {
      expiredTrend.push(tmp);
      continue;
    }
    for (let expiredTitle of expiredTitles) {
      tmp[expiredTitle] = parseInt((Math.random() * os.cpus().length));
    }
    expiredTrend.push(tmp);
  }
  expiredTrend.reverse();
  const expiredPop = expiredTrend.pop();
  expiredTrend.push({ min: expiredPop.min });

  const data = {
    cpuTrend,
    memTrend, totalMem: Number((Math.random() * 99 + 1).toFixed(2)),
    loadTrend,
    nodeTrend,
    diskTrend, diskFields,
    qpsTrend,
    responseTrend, responseFields,
    rtTrend,
    expiredTrend
  };
  res.send({ ok: true, data });
});
app.get('/api/admin/summary', function (req, res) {
  const data = {
    appCount: 1000,
    activityCount: 99999
  };
  res.send(JSON.stringify({ ok: true, data }));
});

app.listen(3100);
