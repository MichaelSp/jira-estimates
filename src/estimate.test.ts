import {findIssueKeyIn, loadEstimate} from './estimate'
import {EstimateContext, LabelInterface} from './types'

describe('estimates', () => {
  it.each([
    [['abc-'], '', 'abc-1', 'abc-1'],
    [['abc'], '', 'abx1', undefined],
    [['abc-'], '', 'aosiuhdjssdb isjdf abc-2334 oijsdg34 sdg', 'abc-2334'],
    [[], '', 'abc-21', undefined],
    [[], '', 'abc21', undefined],
    [[], 'abc-\\d+', 'abc-21', 'abc-21']
  ])(
    `finds issue in string: %s,"%s"`,
    async (autolinks, jiraProjectPrefix, string, result) => {
      const ctx: EstimateContext = {
        autoLinks: autolinks.map(link => {
          return {key_prefix: link}
        }),
        jiraProjectRegexPattern: jiraProjectPrefix,
        string
      } as EstimateContext
      expect(await findIssueKeyIn(ctx)).toBe(result)
    }
  )

  it.each([
    ['feature', 0],
    ['3', 3],
    ['235', 235],
    ['something', 0],
    [[{name: 'something'}] as LabelInterface[], 0]
  ])(
    'loads estimates from GH ticket %s',
    async (labels: string | LabelInterface[], result: number) => {
      expect(
        await loadEstimate({
          ghIssue: {data: {labels, body: ''}}
        } as EstimateContext)
      ).toBe(result)
    }
  )
})
