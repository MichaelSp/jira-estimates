"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateEstimates = exports.findIssueKeyIn = exports.loadEstimate = exports.loadIssue = void 0;
const core = __importStar(require("@actions/core"));
const github_1 = __importDefault(require("@actions/github"));
const issueIdRegEx = /([a-zA-Z0-9]+-[0-9]+)/g;
function loadIssue(octokit) {
    return __awaiter(this, void 0, void 0, function* () {
        const issue = yield octokit.rest.issues.get({
            owner: github_1.default.context.repo.owner,
            repo: github_1.default.context.repo.repo,
            issue_number: github_1.default.context.issue.number
        });
        return issue;
    });
}
exports.loadIssue = loadIssue;
function loadEstimate(issue) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const labels = typeof issue.data.labels == 'string'
            ? [{ name: issue.data.labels }]
            : issue.data.labels || [];
        return Number.parseInt(((_a = labels.find(label => { var _a; return (_a = label.name) === null || _a === void 0 ? void 0 : _a.match(/\d+/); })) === null || _a === void 0 ? void 0 : _a.name) || '0');
    });
}
exports.loadEstimate = loadEstimate;
function findIssueKeyIn(config) {
    return __awaiter(this, void 0, void 0, function* () {
        const searchPatterns = config.autolinks.map(autolink => new RegExp(`${autolink.key_prefix}\\d+`));
        searchPatterns.push(issueIdRegEx);
        for (const pattern of searchPatterns) {
            const match = config.string.match(pattern);
            if (match) {
                return match[0];
            }
        }
        return null;
    });
}
exports.findIssueKeyIn = findIssueKeyIn;
function updateEstimates(config) {
    return __awaiter(this, void 0, void 0, function* () {
        const jiraIssueString = yield findIssueKeyIn(config);
        if (!jiraIssueString) {
            core.info(`String does not contain issueKeys`);
            return;
        }
        yield config.jira.updateIssue(jiraIssueString, {
            update: {
                update: {
                    'Story Points': [
                        {
                            set: config.estimate
                        }
                    ]
                }
            }
        });
    });
}
exports.updateEstimates = updateEstimates;
