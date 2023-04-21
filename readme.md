# Time Shift

Time Shift collects time entries from various sources and maps them into configured targets.

## Development

### tl;dr
  
```bash
nvm use
pnpm -r install
pnpm -r build
pnpm -r --parallel dev
```

### Prequisites

#### Node

The correct Node version should be used. We encourage to use nvm ([Unix](https://github.com/nvm-sh/nvm) / [Windows](https://github.com/coreybutler/nvm-windows)). The version to be used can be found in the [.nvmrc](.nvmrc) file.

#### pnpm

As we use [pnpm](https://pnpm.io/), it should be installed globally, either following the [official documentation](https://pnpm.io/installation), or by just running `npm i -g pnpm@latest`.

### Dependencies

Install the required dependencies with [pnpm](https://pnpm.js.org/):

```bash
pnpm --recursive install
```

### Build

```bash
pnpm --recursive build
```

### Running locally

Each package can be built, tested and run individually. Just add a filter to the command to only run it on a specific package:

```bash
pnpm -r <command> --filter <package-name>
```

> If run the first time, all packages [should be build](#build) beforehand.

For example, to run all packages in development mode:

```bash
pnpm --recursive --parallel dev
```

Or to test for example just the Jira Adapter Plugin:

```bash
pnpm --recursive test --filter @time-shift/adapter-jira
```

## Terminology

### Adapters

Are provided at runtime by Time Shift. They can be used to access APIs or to convert data. They conveniently deliver and receive time entries in a common format.

### Connections

Are used to connect to the adapters by providing necessary credentials. Multiple connections can use the same adapter.

### Queries

Use connections to define inputs and filter fields. Each configuration requires to have a source connection to be defined which delivers the available filters.

### Filters

Individual filters can be configured to narrow the set of time entries. Each configuration has its own filters based on the selected source connection adapter type.

### Time entries

By selecting a configuration the resulting time entries can be loaded. This data set can be filtered and individual entries selected for further interactions.

### Synchonization

Are configured by selecting a strategy provided by the target adapter. Once configured, the selected time entries can proceed a three stage process:

- Preflight of the synchronization
- Preview of the actions to be made
- Apply the changes (perform the synchronization)

#### Strategy

Time entries can be mapped to targets by using a strategy. The strategy defines how the mapping is done and is provided by the target adapter.

#### Preflight

Before synchronizing time entries, a preflight check is performed to ensure that the time entries can be mapped to the target adapter. Thus, a preview of the actions to be made is provided and can be aligned before applying the changes.


## Structure

```mermaid
graph TD
  subgraph Configuration
    C -->|source| Q[Query]
    C -->|target| Q
    A[Adapter] -->|used by| C[Connection]
  end

  A -->|filter fields| Q
  A -->|note mapping fields| Q
  A -->|strategy fields| Q
  A -->|strategy| P[Preflight]
  A ---> PR[Preflight result]
  A ---> R[Result]

  subgraph Synchonization
    Q --> E[Time entries]
    E -->|selection| P
    P -->|preview| PR
    PR -->|apply| R
  end
```
