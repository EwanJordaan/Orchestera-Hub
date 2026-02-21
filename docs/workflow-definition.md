# Workflow Definition

A workflow is a directed acyclic graph (DAG) where each node represents a unit
of work and edges describe execution order dependencies.

Core fields:

- `nodes`: typed node definitions with retry and timeout behavior.
- `edges`: directed relationships from one node key to another.
