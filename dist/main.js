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
const core = __importStar(require("@actions/core"));
const github_1 = __importDefault(require("@actions/github"));
const jira_client_1 = __importDefault(require("jira-client"));
const estimate_1 = require("./estimate");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const ms = core.getInput('milliseconds');
            core.debug(`Waiting ${ms} milliseconds ...`); // debug is only output if you set the secret `ACTIONS_STEP_DEBUG` to true
            const token = process.env['GITHUB_TOKEN'];
            if (!token) {
                core.setFailed('GITHUB_TOKEN is required!');
                return;
            }
            const octokit = github_1.default.getOctokit(token);
            const jiraUrl = new URL(core.getInput('jira-url'));
            const jiraPassword = core.getInput('jira-username');
            const jiraUsername = core.getInput('jira-password');
            let string = core.getInput('string');
            const issue = yield (0, estimate_1.loadIssue)(octokit);
            const estimate = yield (0, estimate_1.loadEstimate)(issue);
            if (estimate === 0) {
                core.warning('No estimate label found. Only labels with just one number (\\d+) are considered estimates.');
                return;
            }
            const autolinks = (yield octokit.rest.repos.listAutolinks({
                owner: github_1.default.context.repo.owner,
                repo: github_1.default.context.repo.repo
            })).data;
            const jiraConfig = {
                protocol: jiraUrl.protocol,
                host: jiraUrl.host,
                port: jiraUrl.port,
                username: jiraPassword,
                password: jiraUsername,
                apiVersion: '2',
                strictSSL: true
            };
            string = string || issue.data.body;
            if (!string) {
                core.setFailed('Neither "string" is defined nor issue comment could be determined.');
                return;
            }
            yield (0, estimate_1.updateEstimates)({
                jira: new jira_client_1.default(jiraConfig),
                string,
                estimate,
                autolinks
            });
        }
        catch (error) {
            if (error instanceof Error)
                core.setFailed(error.message);
        }
    });
}
run();
