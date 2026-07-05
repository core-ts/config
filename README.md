# config-plus

A lightweight TypeScript library for merging configuration from multiple sources:
1. Default Configuration
2. Environment Configuration (SIT, UAT, PRD)
3. Environment Variables (process.env)

Configuration is merged in the following order:

```text
          Default Configuration
                   │
                   ▼
Environment Configuration (SIT, UAT, PRD)
                   │
                   ▼
   Environment Variables (process.env)
                   │
                   ▼
          Final Configuration
```

Environment variables always have the highest priority

---

## Features
- Recursive config merging
- Environment overrides (SIT, UAT, PRD)
- Environment variables overrides (process.env)

---

## Strengths
* 🚀 Zero dependencies
* 📦 Lightweight and fast
* 🔷 Written in TypeScript
* 🔒 Strongly typed API
* 🔄 Deep object merge
* ✅ Automatic parsing of:
  - string
  - number
  - boolean
  - array (JSON)
* 📋 Array override support

---

## Installation

```bash
npm install config-plus
```

or

```bash
yarn add config-plus
```

---

## Why?

Most applications need configuration from multiple sources.

For example:

1. Default configuration

```ts
export const config = {
  server: {
    port: 8000,
    host: "localhost",
  },
  database: {
    host: "localhost",
    port: 5432,
  },
}
```

2. UAT overrides and PRD overrides for the configuration

```ts
export const env = {
  uat: {
    server: {
      port: 8080,
    },
  },
  prd: {
    server: {
      port: 80,
    },
    database: {
      port: 5431,
    },
  },
}
```

3. Environment variables

```text
SERVER_PORT=443
DATABASE_HOST=db.company.com
```

The library automatically combines all of them into a single configuration object.

---

## Quick Start

```ts
import { merge } from "config-plus"

export const config = {
  server: {
    port: 8000,
    host: "localhost",
  },
  database: {
    host: "localhost",
    port: 5432,
  },
}

// SIT overrides and PRD overrides for the configuration
export const env = {
  uat: {
    server: {
      port: 8080,
    },
  },
  prd: {
    server: {
      port: 80,
    },
    database: {
      port: 5431,
    },
  },
}

const cfg = merge(config, process.env, env, "prd")

```

when

```text
SERVER_PORT=443
DATABASE_HOST=db.company.com
```

Result:

```js
{
  server: {
    host: "localhost",
    port: 443
  },
  database: {
    host: "db.company.com",
    port: 5431
  }
}
```

---

## API

## merge()

```ts
merge(
  config: { [key: string]: any },
  env: ProcessEnv,
  environments?: { [key: string]: { [key: string]: any } },
  environmentName?: string,
  logError?: (msg: string) => void,
  logInfo?: (msg: string) => void,
): { [key: string]: any };
```

Merges:

* default configuration
* environment configuration (SIT, UAT, PRD)
* process environment variables

Example

```ts
const config = merge(defaults, process.env, environments, "uat")
```

---

### mergeEnvironments()

```ts
mergeEnvironments(config, environmentConfig)
```

Deep merges an environment configuration into the default configuration.

Example

```ts
mergeEnvironments(defaultConfig, productionConfig);
```

---

### mergeEnv()

```ts
mergeEnv(config, process.env)
```

Overrides configuration values using environment variables.

---

### mergeWithPath()

Internal recursive merge function.

Normally you should call `merge()` instead.

---

## Environment Variable Mapping

Nested properties are converted into uppercase environment variables.

Configuration

```ts
{
    server:{
        port:8080
    }
}
```

becomes

```text
SERVER_PORT
```

More examples

| Configuration        | Environment Variable |
| -------------------- | -------------------- |
| `database.host`      | `DATABASE_HOST`      |
| `database.port`      | `DATABASE_PORT`      |
| `database.pool.size` | `DATABASE_POOL_SIZE` |
| `logging.level`      | `LOGGING_LEVEL`      |

---

## Supported Types

### String

```ts
{
    host:"localhost"
}
```

```text
HOST=myserver
```

↓

```ts
host = "myserver"
```

---

### Number

```ts
{
    port:8080
}
```

```text
PORT=9090
```

↓

```ts
port = 9090
```

---

### Boolean

```ts
{
    ssl:false
}
```

```text
SSL=true
```

↓

```ts
ssl = true
```

Only the literal value `"true"` enables the option.

---

### Arrays

Arrays must be valid JSON.

```text
SERVERS=["a","b","c"]
```

↓

```ts
servers = [
    "a",
    "b",
    "c"
]
```

---

### Nested Objects

Nested objects are merged recursively.

Default

```ts
{
    database:{
        host:"localhost",
        port:5432
    }
}
```

Override

```ts
{
    database:{
        host:"production-db"
    }
}
```

Result

```ts
{
    database:{
        host:"production-db",
        port:5432
    }
}
```

---

## Example

```ts
const defaults = {
    server: {
        host: "localhost",
        port: 8080
    },
    database: {
        host: "localhost",
        port: 5432
    }
};

const environments = {
    uat: {
        server: {
            port: 80
        }
    }
};

process.env.SERVER_HOST = "0.0.0.0";
process.env.DATABASE_HOST = "db.company.com";

const config = merge(defaults, process.env, environments, "uat");
```

Result

```ts
{
    server: {
        host: "0.0.0.0",
        port: 80
    },
    database: {
        host: "db.company.com",
        port: 5432
    }
}
```

---

## Best Practices

* Keep default values in your configuration file.
* Store secrets in environment variables.
* Use environment-specific configuration for deployment differences.
* Avoid hardcoding credentials.
* Commit only default configuration to source control.

---

## Limitations

Current implementation does not support:

- custom value parsers
- enum parsing
- Date objects
- Map / Set
- immutable merging

These features may be added in future versions.

## Comparison with popular libraries

<table>
  <thead>


<tr>

<th>Feature</th>

<th>config-plus</th>
<th>node-config</th>
<th>convict</th>
<th>envalid</th>
<th>dotenv</th>

</tr>
  </thead>
  <tbody>

<tr>

<td>Environment overrides</td>
<td>✅</td>
<td>✅</td>
<td>✅</td>
<td>✅</td>
<td>❌</td>
</tr>


<tr>

<td>Nested objects</td>
<td>✅</td>
<td>✅</td>
<td>✅</td>
<td>✅</td>
<td>❌</td>
</tr>

<tr>

<td>Automatic typing</td>

<td>✅</td>
<td>✅</td>
<td>✅</td>
<td>✅</td>
<td>❌</td>

</tr>


<tr>

<td>Environment-specific config</td>

<td>✅</td>
<td>✅</td>
<td>❌</td>
<td>❌</td>
<td>❌</td>

</tr>


<tr>

<td>Dependencies</td>

<td>None</td>
<td>Medium</td>
<td>Medium</td>
<td>Medium</td>
<td>Small</td>

</tr>


<tr>

<td>Reflection</td>
<td>No</td>
<td>No</td>
<td>No</td>
<td>No</td>
<td>No</td>

</tr>


</tbody>
</table>

---

## License

MIT