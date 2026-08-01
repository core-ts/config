import ProcessEnv = NodeJS.ProcessEnv

interface StringMap {
  [key: string]: any
}
interface PartialMap {
  [key: string]: any
}
export function merge<T extends StringMap>(cfg: T, env: ProcessEnv, environments?: PartialMap, environmentName?: string, logError?: (msg: string) => void, logInfo?: (msg: string) => void): T {
  if (!environments || !environmentName || environmentName.length === 0) {
    return mergeEnv(cfg, env, logError, logInfo)
  } else {
    const x = environments[environmentName]
    if (x) {
      const c2 = mergeEnvironments(cfg, environments[environmentName], logError, logInfo)
      return mergeEnv(c2, env, logError, logInfo)
    } else {
      return mergeEnv(cfg, env, logError, logInfo)
    }
  }
}
export function mergeEnvironments<T extends StringMap>(cfg: T, cfgEnv?: Partial<T>, logError?: (msg: string) => void, logInfo?: (msg: string) => void): T {
  if (!cfgEnv) {
    return cfg
  }
  const conf: any = cfg
  const keys = Object.keys(cfgEnv)
  for (const key of keys) {
    const o2 = cfgEnv[key]
    switch (typeof o2) {
      case "object":
        if (Array.isArray(o2)) {
          conf[key] = o2
        } else {
          const o1 = conf[key]
          if (o1 && typeof o1 === "object" && !Array.isArray(o1)) {
            mergeEnvironments(o1, o2, logError, logInfo)
          }
        }
        break
      default:
        if (o2 !== conf[key]) {
          conf[key] = o2
          if (logInfo) {
            logInfo(`Override ${key} with value ${toString(o2)} from environment configuration`)
          }
        }
        break
    }
  }
  return conf
}
export function mergeEnv<T extends StringMap>(cfg: T, env: ProcessEnv, logError?: (msg: string) => void, logInfo?: (msg: string) => void): T {
  return mergeWithPath({ ...cfg }, env, undefined, logError, logInfo)
}
export function mergeWithPath<T extends StringMap>(cfg: T, env: ProcessEnv, parentPath?: string, logError?: (msg: string) => void, logInfo?: (msg: string) => void): T {
  const conf: any = cfg
  const keys = Object.keys(conf)
  for (const key of keys) {
    const envKey = buildFullPathEnv(key, parentPath)
    const envValue = env[envKey]
    switch (typeof conf[key]) {
      case "string":
        if (envValue && envValue.length > 0) {
          if (logInfo) {
            logInfo(`Override by environment parameter: ${envKey}`)
          }
          conf[key] = envValue
        }
        break
      case "object":
        if (Array.isArray(conf[key])) {
          try {
            if (envValue) {
              const newArray = JSON.parse(envValue)
              if (typeof newArray === "object" && Array.isArray(newArray)) {
                conf[key] = newArray
              }
            }
          } catch (err) {
            const log = logError ? logError : console.log
            log(`Can't parse value of "${envKey}" env. Error: ${toString(err)}`)
          }
        } else if (conf[key] !== null) {
          conf[key] = mergeWithPath(conf[key], env, envKey, logError, logInfo)
        }
        break
      case "number":
        if (envValue && envValue.length > 0) {
          if (!isNaN(envValue as any)) {
            conf[key] = Number(envValue)
          } else {
            const log = logError ? logError : console.log
            log(`Invalid number value for "${envKey}" env: ${envValue}`)
          }
        }
        break
      case "boolean":
        if (envValue) {
          const nv = env[envKey] === "true"
          if (nv !== conf[key]) {
            conf[key] = nv
          }
        }
        break
      default:
        break
    }
  }
  return conf
}
function buildFullPathEnv(key: string, parentPath?: string): string {
  if (isEmpty(parentPath)) {
    return key.toUpperCase()
  } else {
    return parentPath + "_" + key.toUpperCase()
  }
}
function isEmpty(s?: string): boolean {
  return !s || s === ""
}
function toString(v: any): string {
  if (typeof v === "string") {
    return v
  } else {
    return JSON.stringify(v)
  }
}
