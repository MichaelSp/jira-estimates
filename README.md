# Sync GitHub estimation labels with Jira

This action will hook into the issues and export the first value of the label that has exactly one number to jira as `Story Points`.

It will either use the `string` input or the content of the issue to search for an [auto-link](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/managing-repository-settings/configuring-autolinks-to-reference-external-resources) or the regex pattern `/([a-zA-Z0-9]+-[0-9]+)/`.

## Usage

```yaml
name: Jira Estimate Sync
on:
  issues:
    types:
    - opened
    - edited
    - deleted
    - labeled
    - unlabeled

  pull_request:
    types:
    - labeled
    - unlabeled
    - opened
    - edited

jobs:
  sync-estimates:
    runs-on: ubuntu-latest

    steps:
      - uses: MichaelSp/jira-estimates@v1
        with:
          jira-url: https://jira.at.your.company
          jira-username: ${{ secrets.JIRA_USERNAME }}
          jira-password: ${{ secrets.JIRA_PASSWORD }}
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```