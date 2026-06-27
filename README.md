# config-plus

A lightweight TypeScript library for merging application configuration from multiple sources.

The library is designed for Node.js applications and supports hierarchical configuration with environment variable overrides.

## Features

* 🚀 Zero dependencies
* 📦 Lightweight and fast
* 🔷 Written in TypeScript
* 🔄 Deep object merge
* 🌳 Nested configuration support
* ✅ Automatic parsing of:
  - string
  - number
  - boolean
  - array (JSON)
* 🌍 Environment-specific configuration
* ⚙️ Automatic mapping from environment variables
* 📋 Array override support
* 🔒 Strongly typed API

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
    port: 8080,
    host: "localhost"
  },
  database: {
    host: "localhost",
    port: 5432
  }
};
```

2. Production overrides

```ts
export const environments = {
  production: {
    server: {
      port: 80
    }
  }
};
```

3. Environment variables

```text
SERVER_PORT=443
DATABASE_HOST=db.company.com
```

The library automatically combines all of them into a single configuration object.

---

## Merge Priority

Configuration is merged in the following order:

```text
Default Configuration
        │
        ▼
Environment Configuration
        │
        ▼
Environment Variables
```

Later sources always override earlier ones.

---

## Quick Start

```ts
import { merge } from "config-plus";

const config = {
  server: {
    host: "localhost",
    port: 8080
  }
};

const environments = {
  production: {
    server: {
      port: 80
    }
  }
};

const result = merge(
  config,
  process.env,
  environments,
  "production"
);
```

Result:

```ts
{
  server: {
    host: "localhost",
    port: 443
  }
}
```

when

```text
SERVER_PORT=443
```

---

## API

## merge()

```ts
merge<T>(
    config: T,
    env: ProcessEnv,
    environments?: object,
    environmentName?: string
): T
```

Merges:

* default configuration
* environment-specific configuration
* process environment variables

Example

```ts
const config = merge(
    defaults,
    process.env,
    environments,
    "production"
);
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
    production: {
        server: {
            port: 80
        }
    }
};

process.env.SERVER_HOST = "0.0.0.0";
process.env.DATABASE_HOST = "db.company.com";

const config = merge(
    defaults,
    process.env,
    environments,
    "production"
);
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

## How It Works

```text
                Default Config
                       │
                       ▼
          Environment-specific Config
                       │
                       ▼
             process.env Overrides
                       │
                       ▼
              Final Configuration
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

- floating-point numbers
- negative numbers
- custom value parsers
- enum parsing
- Date objects
- Map / Set
- immutable merging

These features may be added in future versions.

---