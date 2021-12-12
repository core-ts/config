import ProcessEnv = NodeJS.ProcessEnv;

const r1 = /^[1-9]\d*$/;

export function merge<T>(conf: T, env: ProcessEnv, extEnv?: any, envName?: string): T {
  if (!extEnv || !envName || envName.length === 0) {
    return mergeEnv(conf, env);
  } else {
    const x = extEnv[envName];
    if (x) {
      const c2 = mergeEnvironments(conf, extEnv[envName]);
      return mergeEnv(c2, env);
    } else {
      return mergeEnv(conf, env);
    }
  }
}
export function mergeEnvironments<T>(c: T, conf2?: any): T {
  if (!conf2) {
    return c;
  }
  const conf: any = c;
  const keys = Object.keys(conf2);
  for (const key of keys) {
    const o2 = conf2[key];
    switch (typeof o2) {
      case 'object':
        if (Array.isArray(o2)) {
          conf[key] = o2;
        } else {
          const o1 = conf[key];
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
export function mergeEnv<T>(conf: T, env: ProcessEnv): T {
  return mergeWithPath({ ...conf }, env, undefined);
}
export function mergeWithPath<T>(c: T, env: ProcessEnv, parentPath?: string): T {
  const conf: any = c;
  const keys = Object.keys(conf);
  for (const key of keys) {
    const envKey = buildFullPathEnv(key, parentPath);
    const envValue = env[envKey];
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
              const newArray = JSON.parse(envValue);
              if (typeof newArray === 'object' && Array.isArray(newArray)) {
                conf[key] = newArray;
              }
            }
          } catch (e) {
            console.log('Can\'t parse value of ' + envKey + ' env', e);
          }
        } else if (conf[key] !== null) {
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
          const nv = (env[envKey] === 'true');
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
function buildFullPathEnv(key: string, parentPath?: string): string {
  if (isEmpty(parentPath)) {
    return key.toUpperCase();
  } else {
    return parentPath + '_' + key.toUpperCase();
  }
}
function isEmpty(s?: string): boolean {
  return (!s || s === '');
}
