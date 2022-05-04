import * as core from '@actions/core'
import {EstimateContext, Issue, LabelInterface} from './types'
import {GitHub} from '@actions/github/lib/utils'
import * as Context from '@actions/github/lib/context'

const issueIdRegEx = /([a-zA-Z0-9]+-[0-9]+)/g

export async function loadIssue(
  octokit: InstanceType<typeof GitHub>,
  context: Context.Context
): Promise<Issue> {
  const issue = await octokit.rest.issues.get({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: context.issue.number
  })
  return issue as Issue
}

export async function loadEstimate(issue: Issue): Promise<number> {
  const labels: LabelInterface[] =
    typeof issue.data.labels == 'string'
      ? [{name: issue.data.labels}]
      : issue.data.labels || []
  return Number.parseInt(
    labels.find(label => label.name?.match(/\d+/))?.name || '0'
  )
}

export async function findIssueKeyIn(
  config: EstimateContext
): Promise<string | null> {
  const searchPatterns = config.autolinks.map(
    autolink => new RegExp(`${autolink.key_prefix}\\d+`)
  )

  searchPatterns.push(issueIdRegEx)
  core.debug(`searching for ${JSON.stringify(searchPatterns)}`)
  for (const pattern of searchPatterns) {
    const match = config.string.match(pattern)
    if (match) {
      core.debug(`found ${match[0]}`)
      return match[0]
    }
  }
  return null
}

export async function updateEstimates(config: EstimateContext): Promise<void> {
  const jiraIssueString = await findIssueKeyIn(config)
  if (!jiraIssueString) {
    core.info(`String does not contain issueKeys`)
    return
  }

  core.info(`Updating issue ${jiraIssueString} on ${config.jira}`)
  await config.jira.updateIssue(jiraIssueString, {
    update: {
      update: {
        'Story Points': [
          {
            set: config.estimate
          }
        ]
      }
    }
  })
}
