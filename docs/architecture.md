# Architecture

The repository is split into runtime applications and shared packages.

- `apps/api`: HTTP API for workflow and run management.
- `apps/worker`: execution worker for node processing.
- `apps/scheduler`: periodic scheduler for workflow triggers.
- `packages/*`: reusable domain, data, and utility modules.
