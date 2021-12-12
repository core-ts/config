"use strict";
var __assign = (this && this.__assign) || function () {
  __assign = Object.assign || function (t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];
      for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
        t[p] = s[p];
    }
    return t;
  };
  return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var r1 = /^[1-9]\d*$/;
function merge(conf, env, extEnv, envName) {
  if (!extEnv || !envName || envName.length === 0) {
    return mergeEnv(conf, env);
  }
  else {
    var x = extEnv[envName];
    if (x) {
      var c2 = mergeEnvironments(conf, extEnv[envName]);
      return mergeEnv(c2, env);
    }
    else {
      return mergeEnv(conf, env);
    }
  }
}
exports.merge = merge;
function mergeEnvironments(c, conf2) {
  if (!conf2) {
    return c;
  }
  var conf = c;
  var keys = Object.keys(conf2);
  for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
    var key = keys_1[_i];
    var o2 = conf2[key];
    switch (typeof o2) {
      case 'object':
        if (Array.isArray(o2)) {
          conf[key] = o2;
        }
        else {
          var o1 = conf[key];
          if (o1 && typeof o1 === 'object' && !Array.isArray(o1)) {
            mergeEnvironments(o1, o2);
          }
        }
        break;
      default:
        if (o2 !== conf[key]) {
          conf[key] = o2;
        }
        break;
    }
  }
  return conf;
}
exports.mergeEnvironments = mergeEnvironments;
function mergeEnv(conf, env) {
  return mergeWithPath(__assign({}, conf), env, undefined);
}
exports.mergeEnv = mergeEnv;
function mergeWithPath(c, env, parentPath) {
  var conf = c;
  var keys = Object.keys(conf);
  for (var _i = 0, keys_2 = keys; _i < keys_2.length; _i++) {
    var key = keys_2[_i];
    var envKey = buildFullPathEnv(key, parentPath);
    var envValue = env[envKey];
    switch (typeof conf[key]) {
      case 'string':
        if (envValue && envValue.length > 0) {
          // console.log('Override by environment parameter: ' + envKey);
          conf[key] = envValue;
        }
        break;
      case 'object':
        if (Array.isArray(conf[key])) {
          try {
            if (envValue) {
              var newArray = JSON.parse(envValue);
              if (typeof newArray === 'object' && Array.isArray(newArray)) {
                conf[key] = newArray;
              }
            }
          }
          catch (e) {
            console.log('Can\'t parse value of ' + envKey + ' env', e);
          }
        }
        else if (conf[key] !== null) {
          conf[key] = mergeWithPath(conf[key], env, envKey);
        }
        break;
      case 'number':
        if (envValue && envValue.length > 0 && r1.test(envValue)) {
          conf[key] = Number(envValue);
        }
        break;
      case 'boolean':
        if (envValue) {
          var nv = (env[envKey] === 'true');
          if (nv !== conf[key]) {
            conf[key] = nv;
          }
        }
        break;
      default:
        break;
    }
  }
  return conf;
}
exports.mergeWithPath = mergeWithPath;
function buildFullPathEnv(key, parentPath) {
  if (isEmpty(parentPath)) {
    return key.toUpperCase();
  }
  else {
    return parentPath + '_' + key.toUpperCase();
  }
}
function isEmpty(s) {
  return (!s || s === '');
}
