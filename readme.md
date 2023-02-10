# Time Shift

## Node

Ensure to have the right node version installed and active.

We highly recommend to use [nvm](https://github.com/nvm-sh/nvm), the version to be used can be found in the [.nvmrc](.nvmrc) file.

## Dependencies

Install dependencies with [pnpm](https://pnpm.js.org/):

```bash
$ pnpm -r install
```

## Build, Test, Run

Each package can be built, tested and run individually.
Just add a filter to the command to only run it on a specific package: `pnpm -r <command> --filter <package-name>`.

### Build

```bash
$ pnpm --recursive build
```

### Test

```bash
$ pnpm --recursive test
```

### Run

```bash
$ pnpm --recursive --parallel dev
```

## Adapters

Configure adapters to connect to different sources of time entries with necessary credentials.

## Workflows

Workflows consist of two major parts:

1. Select sources

```sql
SELECT * FROM <adapter> WHERE user = <userId> AND <field> = <value> AND at > <date>
```

2. Create or update targets

```sql
CREATE / UPDATE * FROM <adapter> WHERE user = <userId> AND itemId = <id> AND <field> = <value> JOIN <selected time entries>
```

### Selection conditions

Define workflow conditions:

- Source adapter (e.g. `mite` or `jira`)
- Match all conditions / one condition (`AND` / `OR`)
- Fields (at least one?)
  - Select preconfigured key (provided by adapter configuration)
  - Select preconfigured matcher (`equals`, `not`, `gt`, `lt`, ...)
  - Provide value (matching the configured type of the field)

-> Shows list of matching time entries from given adapter

### Synchronization strategy

Configure strategies to synchronize time entries to other adapters:

- Target adapter
- Sync method (match `id` to `id`, match pattern in comment to `id`, ...)

-> Show synchronization status in list of selected time entries
-> Apply synchronization strategy to selected time entries if confirmed

## UI

- Left sidebar:
  - Configured Adapters
  - Workflows
- Main view (if workflow selected):
  - List of matching time entries
  - Actions (**sync**, align times, delete, ...)
