import JiraApi from 'jira-client'

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
  jira: JiraApi
  string: string
  estimate: number
  autolinks: AutoLink[]
}
