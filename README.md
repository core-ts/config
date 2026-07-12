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
export const environments = {
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
export const environments = {
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

const cfg = merge(config, process.env, environments, "prd")

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

## Architecture
```text
merge()
    │
    ├── mergeEnvironments()
    │
    └── mergeEnv()
             │
             ▼
        mergeWithPath()
```

### Type handling
This is one of the strongest parts.

It automatically converts environment variables based on the existing property's type.

#### Strings
```text
"localhost"

↓

HOST="google.com"

↓

"google.com"
```

#### Numbers
```text
8080

↓

PORT=3000

↓

3000
```
with validation.

#### Boolean
```text
false

↓

SSL=true

↓

true
```

#### Arrays
Allows
```text
STATUS=["A","B","C"]
```
using JSON parsing.

Many libraries don't support arrays.

#### Objects
Recursive
```text
db.user

↓

DB_USER
```

#### Naming convention
Environment names become
```text
db.host

↓

DB_HOST
```

and 

```text
cache.redis.timeout

↓

CACHE_REDIS_TIMEOUT
```

This is an industry-standard convention

### Configuration acts as schema
Instead of
```ts
{
    type: Number,
    default: 8080
}
```

simply write
```ts
port: 8080
```

The runtime infers
```text
number
```
Very elegant.

### No decorators

### Supported Types
Current implementation supports

- string
- number
- boolean
- object
- array

#### Not supported
- ❌ bigint
- ❌ Date
- ❌ Map
- ❌ Set
- ❌ enum
- ❌ null override
- ❌ undefined override

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
- [sql-modular-sample](https://github.com/source-code-template/sql-modular-sample): REST API example with MySQL.
- [sql-simple-modular-sample](https://github.com/source-code-template/sql-simple-modular-sample): REST API example with Posgres.
- [mongo-simple-modular-sample](https://github.com/source-code-template/mongo-simple-modular-sample): REST API example with Mongo.

### Quick example:

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

---

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

<td>Size</td>
<td>~40–80 KB</td>
<td>~2–3 MB</td>
<td>~300–500 KB</td>
<td>~85 KB</td>
<td>~80 KB</td>

</tr>

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

## Why config-plus
Many configuration libraries include features such as file loading, validation, schemas, plugins, and dependency injection. While powerful, they can be unnecessary for smaller projects or reusable libraries.

config-plus focuses on one job:
- merging configuration objects,
- applying environment-specific overrides,
- overriding values from process.env

The result is a tiny, dependency-free utility that is easy to understand, easy to maintain, and suitable for applications, libraries, and frameworks.

## Recommended Usage

This library is best suited for:
- Microservices
- REST APIs
- Batch jobs
- Internal backend applications
- Docker/Kubernates deployments

---

## License

MIT
