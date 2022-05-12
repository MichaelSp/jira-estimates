import * as core from '@actions/core'
import {AutoLink, EstimateContext, Issue, LabelInterface} from './types'
import {GitHub} from '@actions/github/lib/utils'
import * as github from '@actions/github'
import JiraApi from 'jira-client'

export function getGithubClient(): InstanceType<typeof GitHub> {
  const token = process.env['GITHUB_TOKEN']
  if (!token) {
    throw new Error('GITHUB_TOKEN is required!')
  }

  return github.getOctokit(token)
}

export async function loadGHIssue(ctx: EstimateContext): Promise<Issue> {
  const issue = await ctx.octokit.rest.issues.get({
    owner: ctx.github.repo.owner,
    repo: ctx.github.repo.repo,
    issue_number: ctx.github.issue.number
  })
  return issue as Issue
}

export async function loadEstimate(context: EstimateContext): Promise<number> {
  let estimate = 0
  if (context.ghIssue) {
    core.debug(
      `Loaded GH issue ${
        context.ghIssue.data.body
      }\n\n with labels: ${JSON.stringify(context.ghIssue.data.labels)}`
    )

    const labels: LabelInterface[] =
      typeof context.ghIssue.data.labels == 'string'
        ? [{name: context.ghIssue.data.labels}]
        : context.ghIssue.data.labels || []
    estimate = Number.parseInt(
      labels.find(label => label.name?.match(/\d+/))?.name || '0'
    )
  } else {
    estimate = 0
  }
  if (estimate === 0) {
    core.warning(
      'No estimate label found or estimation is "0". Only labels with just one number (\\d+) > 0 are considered estimates.'
    )
  }
  return estimate
}

export async function findIssueKeyIn(
  config: EstimateContext
): Promise<string | undefined> {
  const searchPatterns: string[] = config.autoLinks.map(
    autolink => `${autolink.key_prefix}\\d+`
  )

  if (config.jiraProjectRegexPattern && config.jiraProjectRegexPattern !== '') {
    searchPatterns.push(config.jiraProjectRegexPattern)
  }
  core.debug(`Searching for ${JSON.stringify(searchPatterns)}`)
  for (const pattern of searchPatterns) {
    const match = config.string.match(new RegExp(pattern))
    if (match) {
      core.debug(`found ${match[0]}`)
      return match[0]
    }
  }
  return undefined
}

export async function loadAutolinks(
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

export async function updateEstimates(
  config: EstimateContext
): Promise<JiraApi.JsonResponse | void> {
  if (!config.string || config.string === '') {
    core.setFailed(
      'Neither "string" is defined nor issue comment could be determined.'
    )
    return
  }
  if (!config.jiraIssue || config.jiraIssue === '') {
    core.setFailed("Jira issue couldn't be determined")
    return
  }
  if (!config.estimate || config.estimate === 0) {
    core.warning('Estimate is either null or 0. Will not update the issue.')
    return
  }

  core.info(`Updating issue ${config.jiraIssue}`)
  const response = await config.jira.updateIssue(config.jiraIssue, {
    update: {
      [config.jiraCustomFieldId]: [
        {
          set: config.estimate
        }
      ]
    }
  })
  return response
}
