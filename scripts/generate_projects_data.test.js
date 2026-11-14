import { describe, it, expect } from 'vitest';
import generator from './generate_projects_data.js';

const { resolveFallbackUpdatedAt } = generator;

const now = () => new Date('2026-11-14T10:00:00.000Z');

/**
 * Fake git: answers `status` and `log` and records the calls.
 * @param {{ status?: string, log?: string }} answers
 */
function fakeGit({ status = '', log = '' }) {
    const calls = [];
    const git = (args) => {
        calls.push(args);
        return args[0] === 'status' ? status : log;
    };
    return { git, calls };
}

describe('resolveFallbackUpdatedAt', () => {
    it('uses the date of the last commit that touched the project folder', () => {
        const { git, calls } = fakeGit({ log: '2026-10-27T10:25:30+01:00' });
        const result = resolveFallbackUpdatedAt({ folderName: 'Amazon 2.0', git, now });
        expect(result).toBe('2026-10-27T09:25:30.000Z');
        expect(calls[1]).toEqual(['log', '-1', '--format=%cI', '--', 'Projekte/Amazon 2.0']);
    });

    it('stays the same on every run while the folder is unchanged', () => {
        const { git } = fakeGit({ log: '2026-10-27T10:25:30+01:00' });
        const first = resolveFallbackUpdatedAt({ folderName: 'Minecraft', git, now });
        const later = resolveFallbackUpdatedAt({
            folderName: 'Minecraft',
            git,
            now: () => new Date('2026-12-01T00:00:00.000Z'),
        });
        expect(later).toBe(first);
    });

    it('uses the current time while the folder has uncommitted changes (sync in progress)', () => {
        const { git } = fakeGit({ status: ' M Projekte/Minecraft/index.html', log: '2026-10-27T10:25:30+01:00' });
        expect(resolveFallbackUpdatedAt({ folderName: 'Minecraft', git, now })).toBe('2026-11-14T10:00:00.000Z');
    });

    it('keeps the previous value when git is not available', () => {
        const git = () => {
            throw new Error('git: command not found');
        };
        const previous = '2026-10-01T08:00:00.000Z';
        expect(resolveFallbackUpdatedAt({ folderName: 'Minecraft', previous, git, now })).toBe(previous);
    });

    it('keeps the previous value when the folder has no commit yet and no changes', () => {
        const { git } = fakeGit({});
        const previous = '2026-10-01T08:00:00.000Z';
        expect(resolveFallbackUpdatedAt({ folderName: 'Neu', previous, git, now })).toBe(previous);
    });

    it('falls back to the current time without folder, git data and previous value', () => {
        const { git, calls } = fakeGit({});
        expect(resolveFallbackUpdatedAt({ folderName: '', git, now })).toBe('2026-11-14T10:00:00.000Z');
        expect(calls).toHaveLength(0);
    });
});
