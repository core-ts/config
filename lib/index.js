"use strict";
var __assign = (this && this.__assign) || function () {
  __assign = Object.assign || function(t) {
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
function merge(cfg, env, environments, environmentName, logError, logInfo) {
  if (!environments || !environmentName || environmentName.length === 0) {
    return mergeEnv(cfg, env, logError, logInfo);
  }
  else {
    var x = environments[environmentName];
    if (x) {
      var c2 = mergeEnvironments(cfg, environments[environmentName], logError, logInfo);
      return mergeEnv(c2, env, logError, logInfo);
    }
    else {
      return mergeEnv(cfg, env, logError, logInfo);
    }
  }
}
exports.merge = merge;
function mergeEnvironments(cfg, cfgEnv, logError, logInfo) {
  if (!cfgEnv) {
    return cfg;
  }
  var conf = cfg;
  var keys = Object.keys(cfgEnv);
  for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
    var key = keys_1[_i];
    var o2 = cfgEnv[key];
    switch (typeof o2) {
      case "object":
        if (Array.isArray(o2)) {
          conf[key] = o2;
        }
        else {
          var o1 = conf[key];
          if (o1 && typeof o1 === "object" && !Array.isArray(o1)) {
            mergeEnvironments(o1, o2, logError, logInfo);
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
function mergeEnv(cfg, env, logError, logInfo) {
  return mergeWithPath(__assign({}, cfg), env, undefined, logError, logInfo);
}
exports.mergeEnv = mergeEnv;
function mergeWithPath(cfg, env, parentPath, logError, logInfo) {
  var conf = cfg;
  var keys = Object.keys(conf);
  for (var _i = 0, keys_2 = keys; _i < keys_2.length; _i++) {
    var key = keys_2[_i];
    var envKey = buildFullPathEnv(key, parentPath);
    var envValue = env[envKey];
    switch (typeof conf[key]) {
      case "string":
        if (envValue && envValue.length > 0) {
          if (logInfo) {
            logInfo("Override by environment parameter: " + envKey);
          }
          conf[key] = envValue;
        }
        break;
      case "object":
        if (Array.isArray(conf[key])) {
          try {
            if (envValue) {
              var newArray = JSON.parse(envValue);
              if (typeof newArray === "object" && Array.isArray(newArray)) {
                conf[key] = newArray;
              }
            }
          }
          catch (err) {
            var log = logError ? logError : console.log;
            log("Can't parse value of \"" + envKey + "\" env. Error: " + toString(err));
          }
        }
        else if (conf[key] !== null) {
          conf[key] = mergeWithPath(conf[key], env, envKey, logError, logInfo);
        }
        break;
      case "number":
        if (envValue && envValue.length > 0) {
          if (!isNaN(envValue)) {
            conf[key] = Number(envValue);
          }
          else {
            var log = logError ? logError : console.log;
            log("Invalid number value for \"" + envKey + "\" env: " + envValue);
          }
        }
        break;
      case "boolean":
        if (envValue) {
          var nv = env[envKey] === "true";
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
    return parentPath + "_" + key.toUpperCase();
  }
}
function isEmpty(s) {
  return !s || s === "";
}
function toString(v) {
  if (typeof v === "string") {
    return v;
  }
  else {
    return JSON.stringify(v);
  }
}
