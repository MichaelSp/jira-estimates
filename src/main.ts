import * as core from '@actions/core'
import {context, getOctokit} from '@actions/github'
import JiraApi from 'jira-client'
import {loadEstimate, loadIssue, updateEstimates} from './estimate'
import {AutoLink} from './types'

async function run(): Promise<void> {
  try {
    const token = process.env['GITHUB_TOKEN']
    if (!token) {
      core.setFailed('GITHUB_TOKEN is required!')
      return
    }
    const octokit = getOctokit(token)

    const jiraUrl = new URL(core.getInput('jira-url'))
    const jiraPassword = core.getInput('jira-username')
    const jiraUsername = core.getInput('jira-password')
    let string: string | undefined = core.getInput('string')

    const issue = await loadIssue(octokit)
    const estimate: number = await loadEstimate(issue)
    if (estimate === 0) {
      core.warning(
        'No estimate label found. Only labels with just one number (\\d+) are considered estimates.'
      )
      return
    }
    const autolinks: AutoLink[] = (
      await octokit.rest.repos.listAutolinks({
        owner: context.repo.owner,
        repo: context.repo.repo
      })
    ).data

    const jiraConfig: JiraApi.JiraApiOptions = {
      protocol: jiraUrl.protocol,
      host: jiraUrl.host,
      port: jiraUrl.port,
      username: jiraPassword,
      password: jiraUsername,
      apiVersion: '2',
      strictSSL: true
    }
    string = string || issue.data.body
    if (!string) {
      core.setFailed(
        'Neither "string" is defined nor issue comment could be determined.'
      )
      return
    }
    await updateEstimates({
      jira: new JiraApi(jiraConfig),
      string,
      estimate,
      autolinks
    })
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
