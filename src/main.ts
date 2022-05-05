import * as core from '@actions/core'
import * as github from '@actions/github'
import JiraApi from 'jira-client'
import {loadEstimate, loadIssue, updateEstimates} from './estimate'
import {AutoLink} from './types'
import {GitHub} from '@actions/github/lib/utils'

async function loadAutolinks(
  octokit: InstanceType<typeof GitHub>
): Promise<AutoLink[]> {
  try {
    const autolinks: AutoLink[] = (
      await octokit.rest.repos.listAutolinks({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo
      })
    ).data
    core.debug(`Using autolink config: ${JSON.stringify(autolinks)}`)
    return autolinks
  } catch {
    core.warning('Unable to load autolinks')
    return []
  }
}

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
    let string: string | undefined = core.getInput('string')

    const issue = await loadIssue(octokit, github.context)
    core.debug(
      `Loaded GH issue ${issue.data.body}\n\n with labels: ${JSON.stringify(
        issue.data.labels
      )}`
    )
    const estimate: number = await loadEstimate(issue)
    if (estimate === 0) {
      core.warning(
        'No estimate label found. Only labels with just one number (\\d+) are considered estimates.'
      )
      return
    }
    core.debug(`Using estimate '${estimate}'`)

    const jiraConfig: JiraApi.JiraApiOptions = {
      protocol: jiraUrl.protocol,
      host: jiraUrl.host,
      port: jiraUrl.port,
      username: jiraUsername,
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
    core.debug(`Jira config: ${JSON.stringify(jiraConfig)}`)
    await updateEstimates({
      jira: new JiraApi({...jiraConfig, password: jiraPassword}),
      string,
      estimate,
      autolinks: await loadAutolinks(octokit)
    })
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
