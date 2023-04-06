# remove-safe-to-test-label

A GitHub Action to remove the "safe to test" label when the PR is from a fork.

## Motivation

When you have GitHub Actions using secrets, these secrets are not available for
PRs from forks. This is a security feature of GitHub Actions. This means that if
you have a GitHub Action that is triggered by a PR from a fork, it will fail.

The best solution is to not use GitHub secrets in GitHub Actions that are
triggered by PRs from forks (see the blog article from GitHub Security Lab:
[Keeping your GitHub Actions and workflows secure Part 1: Preventing pwn
requests](https://securitylab.github.com/research/github-actions-preventing-pwn-requests/)).
However, sometimes this is not possible.

A workaround is to add a label to the PR when it is safe to test. This label is
added by the PR reviewer. Your jobs that are using secrets are only triggered
when this label is present. However, you also need to remove this label when a
new commit is pushed to the PR so that the change can be reviewed again.

This GitHub Action removes the "safe to test" label when the PR is from a fork.

To verify if jobs have the "safe to test" label, you can use the
[verify-safe-to-test-label](https://github.com/SharezoneApp/verify-safe-to-test-label)
GitHub Action.

## Usage

```yaml
on:
  # This action only works with pull_request and pull_request_target events.
  # 
  # For other events, it succeeds with exit code 0.
  pull_request: # or pull_request_target

jobs:
  # It's important that you run this job first, because you need to remove the
  # "safe to test" label when the PR comes from a fork in order to ensure that
  # every change is reviewed for security implications. Other jobs should use the
  # "needs" keyword to depend on this job.
  remove-safe-to-build-label:
    runs-on: ubuntu-latest
    permissions:
      # Required to remove the "safe to test" label
      contents: read
      pull-requests: write
    steps:
      - name: Remove "safe to test" label, if PR is from a fork
        uses: SharezoneApp/remove-safe-to-test-label@v1
```

### Inputs

| Name | Description | Default |
| ---- | ----------- | ------- |
| `label` | The label to remove | `safe to test` |
| `repo-token` | The GitHub token to authorize the label changes. Typically the `GITHUB_TOKEN` secret with `contents: read` and `pull-requests: write` access | `github.token` |