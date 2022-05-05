import JiraApi from 'jira-client'
import {GitHub} from '@actions/github/lib/utils'
import * as Context from '@actions/github/lib/context'

export interface Issue {
  data: {
    labels?: string | LabelInterface[]
    body?: string
  }
}

export interface LabelInterface {
  id?: number
  node_id?: string
  url?: string
  name?: string
  description?: string | null | undefined
  color?: string | null | undefined
  default?: boolean | undefined
}

export interface AutoLink {
  id?: number
  key_prefix: string
  url_template?: string
}

export interface EstimateContext {
  octokit: InstanceType<typeof GitHub>
  github: Context.Context
  jira: JiraApi
  string: string
  autoLinks: AutoLink[]
  jiraProjectPrefix: string
  jiraIssue?: string
  ghIssue?: Issue
  estimate?: number
}
