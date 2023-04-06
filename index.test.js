const core = require('@actions/core');
const github = require('@actions/github');
const run = require('./index');

jest.mock('@actions/core');
jest.mock('@actions/github');

describe('remove-safe-to-test-label', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should remove the "safe-to-test" label when pull request is from a fork and has the label', async () => {
        const payload = {
            pull_request: {
                head: {
                    repo: {
                        full_name: 'fork-owner/repo',
                    },
                },
                base: {
                    repo: {
                        full_name: 'base-owner/repo',
                    },
                },
                labels: [
                    {
                        name: 'safe-to-test',
                    },
                ],
                number: 1,
            },
            repository: {
                full_name: 'base-owner/repo',
            },
        };

        github.context.eventName = 'pull_request';
        github.context.payload = payload;
        github.context.repo = { owner: 'base-owner', repo: 'repo' };

        core.getInput.mockReturnValueOnce('safe-to-test');
        core.getInput.mockReturnValueOnce('fake-token');

        github.getOctokit.mockReturnValue({
            rest: {
                issues: {
                    removeLabel: jest.fn(),
                },
            },
        });

        await run();

        expect(github.getOctokit).toHaveBeenCalledWith('fake-token');
        expect(github.getOctokit().rest.issues.removeLabel).toHaveBeenCalledWith({
            owner: 'base-owner',
            repo: 'repo',
            issue_number: 1,
            name: 'safe-to-test',
        });
    });

    test('should not remove the "safe-to-test" label when pull request is not from a fork', async () => {
        const payload = {
            pull_request: {
                head: {
                    repo: {
                        full_name: 'base-owner/repo',
                    },
                },
                base: {
                    repo: {
                        full_name: 'base-owner/repo',
                    },
                },
                labels: [
                    {
                        name: 'safe-to-test',
                    },
                ],
                number: 1,
            },
            repository: {
                full_name: 'base-owner/repo',
            },
        };

        github.context.eventName = 'pull_request';
        github.context.payload = payload;
        github.context.repo = { owner: 'base-owner', repo: 'repo' };

        core.getInput.mockReturnValueOnce('safe-to-test');
        core.getInput.mockReturnValueOnce('fake-token');

        github.getOctokit.mockReturnValue({
            rest: {
                issues: {
                    removeLabel: jest.fn(),
                },
            },
        });

        await run();

        expect(github.getOctokit).toHaveBeenCalledTimes(0);
        expect(github.getOctokit().rest.issues.removeLabel).toHaveBeenCalledTimes(0);
    });

    test('should fail when eventName is not allowed', async () => {
        const payload = {
            pull_request: {
                head: {
                    repo: {
                        full_name: 'fork-owner/repo',
                    },
                },
                base: {
                    repo: {
                        full_name: 'base-owner/repo',
                    },
                },
                labels: [],
            },
            repository: {
                full_name: 'base-owner/repo',
            },
        };

        github.context.eventName = 'not_allowed_event';
        github.context.payload = payload;

        core.getInput.mockReturnValue('safe-to-test');
        await run();

        expect(core.setFailed).toHaveBeenCalledWith(
            'This action only works with the following events: pull_request, pull_request_target, merge_group.'
        );
    });

    test('should fail when there is an error', async () => {
        const errorMessage = 'An error occurred';
        github.context.eventName = 'pull_request';
        github.context.payload = null;

        core.getInput.mockReturnValue('safe-to-test');

        try {
            await run();
        } catch (error) {
            expect(core.setFailed).toHaveBeenCalledWith(errorMessage);
        }
    });
});
