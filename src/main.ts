import * as core from '@actions/core'
import * as github from '@actions/github'
import JiraApi from 'jira-client'
import {
  findIssueKeyIn,
  getGithubClient,
  loadAutolinks,
  loadEstimate,
  loadGHIssue,
  updateEstimates
} from './estimate'
import {EstimateContext} from './types'

async function run(): Promise<void> {
  try {
    const jiraUrl = new URL(core.getInput('jira-url'))
    const jiraPassword = core.getInput('jira-username')
    const jiraUsername = core.getInput('jira-password')
    const jiraProjectRegexPattern = core.getInput('jira-project-regex-pattern')
    const useAutoLinks = core.getInput('use-gh-autolinks')

    const jiraConfig: JiraApi.JiraApiOptions = {
      protocol: jiraUrl.protocol,
      host: jiraUrl.host,
      port: jiraUrl.port === '' ? undefined : jiraUrl.port,
      username: jiraUsername,
      apiVersion: '2',
      strictSSL: true
    }

    const octokit = getGithubClient()
    const config: EstimateContext = {
      octokit,
      github: github.context,
      jira: new JiraApi({...jiraConfig, password: jiraPassword}),
      string: core.getInput('string'),
      autoLinks: useAutoLinks ? await loadAutolinks(octokit) : [],
      jiraProjectRegexPattern
    }
    core.debug(`Jira config: ${JSON.stringify(jiraConfig)}`)

    config.ghIssue = await loadGHIssue(config)
    config.estimate = await loadEstimate(config)
    core.debug(`Using estimate '${config.estimate}'`)

    if (!config.string || config.string === '') {
      config.string = config.ghIssue.data.body || ''
    }
    config.jiraIssue = await findIssueKeyIn(config)
    await updateEstimates(config)
    core.info(`Updated ${jiraUrl}/projects/`)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
