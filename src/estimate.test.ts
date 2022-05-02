import {findIssueKeyIn, loadEstimate} from './estimate'
import {EstimateContext, LabelInterface} from './types'

describe('estimates', () => {
  it.each([
    [['abc-'], 'abc-1', 'abc-1'],
    [['abc'], 'abx1', null],
    [['abc-'], 'aosiuhdjssdb isjdf abc-2334 oijsdg34 sdg', 'abc-2334'],
    [[], 'abc-21', 'abc-21'],
    [[], 'abc21', null]
  ])(`finds issue in string: %s,"%s"`, async (autolinks, string, result) => {
    const ctx: EstimateContext = {
      autolinks: autolinks.map(link => {
        return {key_prefix: link}
      }),
      string
    } as EstimateContext
    expect(await findIssueKeyIn(ctx)).toBe(result)
  })

  it.each([
    ['feature', 0],
    ['3', 3],
    ['235', 235],
    ['something', 0],
    [[{name: 'something'}] as LabelInterface[], 0]
  ])(
    'loads estimates from GH ticket %s',
    async (labels: string | LabelInterface[], result: number) => {
      expect(await loadEstimate({data: {labels, body: ''}})).toBe(result)
    }
  )
})
