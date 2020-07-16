'use strict';

export function error(content, code, duration) {
  if (Number(code) === 401) {
    location.reload();
    return;
  }
  if (duration) {
    this.$Message.error({ content, duration, closable: true });
  } else {
    this.$Message.error(content);
  }
};

export function getCsrfToken() {
  const cookies = document.cookie.split(';')
    .map(c => c.split('=')
      .map(item => item.trim()));
  const length = cookies.length;
  for (let i = 0; i < length; i++) {
    const kv = cookies[i];
    if (kv[0] === 'csrfToken') {
      return kv[1];
    }
  }
};

export function formatCount(count) {
  if (count === undefined || count === null) {
    return '-';
  }
  if (isNaN(count)) {
    return '-';
  }
  if (count < 1000) {
    return count;
  } else if (count < 1000000) {
    return `${(count / 1000).toFixed(1)}K`;
  } else {
    return `${(count / 1000000).toFixed(1)}M`;
  }
};

export function randomString() {
  return `u-${Math.random().toString(16).substr(2)}-${Math.random().toString(16).substr(2)}`;
};

export function hashCode(s) {
  let h;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(31, h) + s.charCodeAt(i) | 0;
  }
  return h;
};

export function formatMemory(size, showPlus) {
  const symbol = size === Math.abs(size);
  size = Math.abs(size);
  let str = '';
  size = +size;
  if (size / 1024 < 1) {
    str = `${(size).toFixed(2)} Bytes`;
  } else if (size / 1024 / 1024 < 1) {
    str = `${(size / 1024).toFixed(2)} KB`;
  } else if (size / 1024 / 1024 / 1024 < 1) {
    str = `${(size / 1024 / 1024).toFixed(2)} MB`;
  } else {
    str = `${(size / 1024 / 1024 / 1024).toFixed(2)} GB`;
  }
  return size ? `${symbol ? `${showPlus ? `+${str}` : str}` : `-${str}`}` : str;
};

export function formatTime(ts, ch) {
  ts = (!isNaN(ts) && ts) || 0;
  let str = '';
  ts = Number(ts);
  if (ts < 1e3) {
    str = `${ts.toFixed(2)} ${ch ? '毫秒' : 'ms'}`;
  } else if (ts < 1e3 * 60) {
    str = `${(ts / 1e3).toFixed(2)} ${ch ? '秒' : 's'}`;
  } else if (ts < 1e3 * 60 * 60) {
    str = `${(ts / (1e3 * 60)).toFixed(2)} ${ch ? '分钟' : 'min'}`;
  } else if (ts < 1e3 * 60 * 60 * 24) {
    str = `${(ts / (1e3 * 60 * 60)).toFixed(2)} ${ch ? '小时' : 'h'}`;
  } else {
    const day = parseInt(ts / (1e3 * 60 * 60 * 24));
    const remain = ts - day * 1e3 * 60 * 60 * 24;
    str = `${day} ${ch ? '天' : 'd'}${remain ? ` ${formatTime(remain, ch)}` : ''}`;
  }
  return str;
};

export function formatTimeNew(ts, ch) {
  ts = (!isNaN(ts) && ts) || 0;
  ts = Number(ts);
  let str = '';
  if (ts < 1e3) {
    str = `${parseInt(ts)} ${ch ? '毫秒' : 'ms'}`;
  } else if (ts < 1e3 * 60) {
    const sec = parseInt(ts / (1e3));
    const remain = ts - sec * 1e3;
    str = `${sec} ${ch ? '秒' : 's'}${remain ? ` ${formatTimeNew(remain, ch)}` : ''}`;
  } else if (ts < 1e3 * 60 * 60) {
    const min = parseInt(ts / (1e3 * 60));
    const remain = ts - min * 1e3 * 60;
    str = `${min} ${ch ? '分' : 'min'}${remain ? ` ${formatTimeNew(remain, ch)}` : ''}`;
  } else if (ts < 1e3 * 60 * 60 * 24) {
    const hour = parseInt(ts / (1e3 * 60 * 60));
    const remain = ts - hour * 1e3 * 60 * 60;
    str = `${hour} ${ch ? '时' : 'h'}${remain ? ` ${formatTimeNew(remain, ch)}` : ''}`;
  } else {
    const day = parseInt(ts / (1e3 * 60 * 60 * 24));
    const remain = ts - day * 1e3 * 60 * 60 * 24;
    str = `${day} ${ch ? '天' : 'd'}${remain ? ` ${formatTimeNew(remain, ch)}` : ''}`;
  }
  return str;
};

export function isNumber(num) {
  return num !== null && !isNaN(num);
};
