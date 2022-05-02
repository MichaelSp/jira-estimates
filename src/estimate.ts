import * as core from '@actions/core'
import github from '@actions/github'
import {GitHub} from '@actions/github/lib/utils'
import {EstimateContext, Issue, LabelInterface} from './types'

const issueIdRegEx = /([a-zA-Z0-9]+-[0-9]+)/g

export async function loadIssue(
  octokit: InstanceType<typeof GitHub>
): Promise<Issue> {
  const issue = await octokit.rest.issues.get({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    issue_number: github.context.issue.number
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
  for (const pattern of searchPatterns) {
    const match = config.string.match(pattern)
    if (match) {
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
