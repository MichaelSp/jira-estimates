import * as core from '@actions/core'
import * as github from '@actions/github'
import JiraApi from 'jira-client'
import {
  findIssueKeyIn,
  loadAutolinks,
  loadEstimate,
  loadGHIssue,
  updateEstimates
} from './estimate'
import {EstimateContext} from './types'

async function run(): Promise<void> {
  try {
    const token = process.env['GITHUB_TOKEN']
    if (!token) {
      core.setFailed('GITHUB_TOKEN is required!')
      return
    }
    if (!github) {
      core.setFailed('No github')
      return
    }
    if (!github.context) {
      core.setFailed('no github.context')
      return
    }

    const octokit = github.getOctokit(token)

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
    if (config.estimate === 0) {
      core.warning(
        'No estimate label found or estimation is "0". Only labels with just one number (\\d+) > 0 are considered estimates.'
      )
      return
    }
    core.debug(`Using estimate '${config.estimate}'`)

    if (!config.jiraIssue) {
      core.info(`String does not contain issueKeys`)
      return
    }

    if (!config.string || config.string === '') {
      config.string = config.ghIssue.data.body || ''
    }
    config.jiraIssue = await findIssueKeyIn(config)
    await updateEstimates(config)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
