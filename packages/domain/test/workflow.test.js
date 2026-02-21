"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const validateDag_1 = require("../src/workflow/validateDag");
(0, node_test_1.default)("validateDag accepts an acyclic workflow", () => {
    const result = (0, validateDag_1.validateDag)({
        nodes: [
            {
                key: "start",
                type: "noop",
                timeoutMs: 1000,
                retryPolicy: {
                    maxAttempts: 1,
                    backoffMs: 0,
                    multiplier: 1,
                    jitter: false
                },
                config: {}
            }
        ],
        edges: []
    });
    strict_1.default.equal(result.valid, true);
});
