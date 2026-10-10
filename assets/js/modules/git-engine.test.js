import { describe, it, expect } from 'vitest';
import {
    LEVEL_RULES,
    ancestorsOf,
    createInitialState,
    createLevelState,
    currentBranch,
    executeCommand,
    headCommitId,
    isLevelComplete,
    tokenize,
} from './git-engine.js';

/** Runs several commands against a fresh (or given) repository and returns it. */
function run(commands, state = createInitialState()) {
    for (const command of commands) executeCommand(state, command);
    return state;
}

const kinds = (result) => result.lines.map((line) => line.kind);

describe('tokenize', () => {
    it('splits on whitespace', () => {
        expect(tokenize('  git   commit ')).toEqual(['git', 'commit']);
    });

    it('keeps quoted phrases together', () => {
        expect(tokenize('git commit -m "fix the bug"')).toEqual(['git', 'commit', '-m', 'fix the bug']);
        expect(tokenize("git commit -m 'one two'")).toEqual(['git', 'commit', '-m', 'one two']);
    });
});

describe('initial state', () => {
    it('starts with one commit on main', () => {
        const state = createInitialState();
        expect(Object.keys(state.commits)).toEqual(['c1']);
        expect(state.branches).toEqual({ main: 'c1' });
        expect(currentBranch(state)).toBe('main');
        expect(headCommitId(state)).toBe('c1');
    });
});

describe('general command handling', () => {
    it('ignores an empty line', () => {
        const result = executeCommand(createInitialState(), '   ');
        expect(result).toEqual({ lines: [], clear: false, changed: false, success: false });
    });

    it('reports unknown programs and unknown git actions as errors without changing state', () => {
        const state = createInitialState();
        for (const command of ['ls', 'git', 'git frobnicate']) {
            const result = executeCommand(state, command);
            expect(kinds(result)).toEqual(['error']);
            expect(result.changed).toBe(false);
        }
        expect(state).toEqual(createInitialState());
    });

    it('answers every line in German and English', () => {
        const result = executeCommand(createInitialState(), 'git branch feature/x');
        expect(result.lines[0].de).toContain("Branch 'feature/x' erstellt");
        expect(result.lines[0].en).toContain("Created branch 'feature/x'");
    });

    it('asks the terminal to clear', () => {
        expect(executeCommand(createInitialState(), 'clear').clear).toBe(true);
    });

    it('lists the commands on help', () => {
        const [line] = executeCommand(createInitialState(), 'help').lines;
        expect(line.de).toContain('git cherry-pick');
        expect(line.en).toContain('git stash');
    });
});

describe('git commit', () => {
    it('adds a commit on the current branch and moves the branch', () => {
        const state = run(['git commit -m "Add login"']);
        expect(state.commits.c2).toMatchObject({ message: 'Add login', parentId: 'c1', branch: 'main', depth: 1 });
        expect(state.branches.main).toBe('c2');
    });

    it('uses a default message without -m', () => {
        expect(run(['git commit']).commits.c2.message).toBe('New commit');
    });

    it('rejects -m without a message', () => {
        const state = createInitialState();
        const result = executeCommand(state, 'git commit -m');
        expect(kinds(result)).toEqual(['error']);
        expect(Object.keys(state.commits)).toHaveLength(1);
    });

    it('moves a detached HEAD instead of a branch', () => {
        const state = run(['git commit', 'git checkout c1', 'git commit -m detached']);
        expect(state.head).toBe('c3');
        expect(state.branches.main).toBe('c2');
        expect(state.commits.c3.parentId).toBe('c1');
    });

    it('clears the uncommitted changes', () => {
        const state = run(['touch app.js', 'git commit']);
        expect(state.dirty).toBe(false);
    });
});

describe('git branch', () => {
    it('creates a branch at HEAD without switching to it', () => {
        const state = run(['git commit', 'git branch develop']);
        expect(state.branches.develop).toBe('c2');
        expect(state.head).toBe('main');
    });

    it('refuses duplicates and invalid names', () => {
        const state = run(['git branch develop']);
        expect(kinds(executeCommand(state, 'git branch develop'))).toEqual(['error']);
        expect(kinds(executeCommand(state, 'git branch <img>'))).toEqual(['error']);
        expect(Object.keys(state.branches)).toEqual(['main', 'develop']);
    });

    it('lists branches and marks the current one', () => {
        const state = run(['git branch develop']);
        expect(executeCommand(state, 'git branch').lines[0].de).toBe('* main\n  develop');
    });

    it('deletes a branch, but never the checked-out one', () => {
        const state = run(['git branch develop']);
        expect(kinds(executeCommand(state, 'git branch -d main'))).toEqual(['error']);
        executeCommand(state, 'git branch -d develop');
        expect(state.branches).toEqual({ main: 'c1' });
    });

    it('drops commits that only the deleted branch could reach', () => {
        const state = run(['git checkout -b tmp', 'git commit', 'git checkout main', 'git branch -D tmp']);
        expect(Object.keys(state.commits)).toEqual(['c1']);
    });
});

describe('git checkout / switch', () => {
    it('switches to an existing branch', () => {
        const state = run(['git branch develop', 'git switch develop']);
        expect(state.head).toBe('develop');
    });

    it('creates and switches with -b', () => {
        const state = run(['git checkout -b feature/login']);
        expect(state.head).toBe('feature/login');
        expect(state.branches['feature/login']).toBe('c1');
    });

    it('detaches HEAD on a commit id', () => {
        const state = run(['git commit', 'git checkout c1']);
        expect(currentBranch(state)).toBeNull();
        expect(headCommitId(state)).toBe('c1');
    });

    it('fails for an unknown target and keeps HEAD', () => {
        const state = createInitialState();
        expect(kinds(executeCommand(state, 'git checkout nope'))).toEqual(['error']);
        expect(state.head).toBe('main');
    });

    it('warns when commits made on a detached HEAD are left behind', () => {
        const state = run(['git checkout c1', 'git commit']);
        const result = executeCommand(state, 'git checkout main');
        expect(result.lines.at(-1).de).toContain('Warnung');
        expect(Object.keys(state.commits)).toEqual(['c1']);
    });
});

describe('git merge', () => {
    it('fast-forwards when the current branch has no commits of its own', () => {
        const state = run(['git checkout -b feature', 'git commit', 'git checkout main', 'git merge feature']);
        expect(state.branches.main).toBe('c2');
        expect(Object.keys(state.commits)).toHaveLength(2);
    });

    it('creates a merge commit with two parents when both branches moved on', () => {
        const state = run([
            'git checkout -b feature',
            'git commit',
            'git checkout main',
            'git commit',
            'git merge feature',
        ]);
        const merge = state.commits[state.branches.main];
        expect(merge).toMatchObject({ parentId: 'c3', parent2Id: 'c2', branch: 'main', depth: 2 });
    });

    it('is a no-op when the branch is already merged', () => {
        const state = run(['git checkout -b feature', 'git commit', 'git checkout main', 'git merge feature']);
        const before = JSON.parse(JSON.stringify(state));
        const result = executeCommand(state, 'git merge feature');
        expect(result.changed).toBe(false);
        expect(state).toEqual(before);
    });

    it('rejects merging a branch into itself, unknown branches and a detached HEAD', () => {
        const state = run(['git branch feature', 'git commit']);
        expect(kinds(executeCommand(state, 'git merge main'))).toEqual(['error']);
        expect(kinds(executeCommand(state, 'git merge nope'))).toEqual(['error']);
        executeCommand(state, 'git checkout c1');
        expect(kinds(executeCommand(state, 'git merge feature'))).toEqual(['error']);
    });
});

describe('git rebase', () => {
    const diverged = () =>
        run([
            'git checkout -b feature',
            'git commit -m "feature work"',
            'git checkout main',
            'git commit -m "main work"',
        ]);

    it('replays the branch commits on top of the target and drops the originals', () => {
        const state = run(['git checkout feature', 'git rebase main'], diverged());
        const tip = state.commits[state.branches.feature];
        expect(tip).toMatchObject({ message: 'feature work', parentId: 'c3', branch: 'feature', rebasedFrom: 'c2' });
        // c2 is unreachable after the rebase and no longer part of the graph.
        expect(state.commits.c2).toBeUndefined();
        expect(state.branches.main).toBe('c3');
    });

    it('fast-forwards when the branch has nothing of its own', () => {
        const state = run(['git branch feature', 'git commit', 'git checkout feature', 'git rebase main']);
        expect(state.branches.feature).toBe('c2');
        expect(Object.keys(state.commits)).toHaveLength(2);
    });

    it('does nothing when the branch already builds on the target', () => {
        const state = run(['git checkout -b feature', 'git commit']);
        const result = executeCommand(state, 'git rebase main');
        expect(result.changed).toBe(false);
        expect(state.branches.feature).toBe('c2');
    });
});

describe('git cherry-pick', () => {
    it('copies a commit from another branch onto the current one', () => {
        const state = run([
            'git checkout -b hotfix',
            'git commit -m "fix typo"',
            'git checkout main',
            'git cherry-pick c2',
        ]);
        const tip = state.commits[state.branches.main];
        expect(tip).toMatchObject({ message: 'fix typo', parentId: 'c1', branch: 'main', cherryPickedFrom: 'c2' });
        expect(state.branches.hotfix).toBe('c2');
    });

    it('rejects unknown commits and commits already in the history', () => {
        const state = run(['git commit']);
        expect(kinds(executeCommand(state, 'git cherry-pick c9'))).toEqual(['error']);
        expect(kinds(executeCommand(state, 'git cherry-pick c1'))).toEqual(['error']);
        expect(kinds(executeCommand(state, 'git cherry-pick'))).toEqual(['error']);
    });
});

describe('git reset', () => {
    it('moves the current branch back and drops what became unreachable', () => {
        const state = run(['git commit', 'git commit', 'git reset --hard c1']);
        expect(state.branches.main).toBe('c1');
        expect(Object.keys(state.commits)).toEqual(['c1']);
    });

    it('keeps commits another branch still points to', () => {
        const state = run(['git commit', 'git branch keep', 'git reset --hard c1']);
        expect(state.commits.c2).toBeDefined();
    });

    it('fails for an unknown commit', () => {
        expect(kinds(executeCommand(createInitialState(), 'git reset --hard c7'))).toEqual(['error']);
    });
});

describe('git stash and status', () => {
    it('has nothing to stash in a clean working directory', () => {
        const state = createInitialState();
        executeCommand(state, 'git stash');
        expect(state.stash).toEqual([]);
    });

    it('shelves and restores uncommitted changes', () => {
        const state = run(['touch login.js']);
        expect(executeCommand(state, 'git status').lines[0].en).toContain('Changes not staged');

        executeCommand(state, 'git stash');
        expect(state.dirty).toBe(false);
        expect(state.stash).toHaveLength(1);
        expect(executeCommand(state, 'git stash list').lines[0].de).toContain('stash@{0}: WIP on main: c1');
        expect(executeCommand(state, 'git status').lines[0].en).toContain('working tree clean');

        executeCommand(state, 'git stash pop');
        expect(state.dirty).toBe(true);
        expect(state.stash).toEqual([]);
    });

    it('fails to pop from an empty stash', () => {
        expect(kinds(executeCommand(createInitialState(), 'git stash pop'))).toEqual(['error']);
    });
});

describe('git log', () => {
    it('walks the first-parent history from HEAD, newest first', () => {
        const state = run(['git commit -m second', 'git commit -m third']);
        const result = executeCommand(state, 'git log');
        expect(result.lines.map((line) => line.hash)).toEqual(['c3', 'c2', 'c1']);
        expect(result.lines[0].de).toBe('* c3 - third (main)');
        expect(result.changed).toBe(false);
    });
});

describe('ancestorsOf', () => {
    it('follows both parents of a merge commit', () => {
        const state = run([
            'git checkout -b feature',
            'git commit',
            'git checkout main',
            'git commit',
            'git merge feature',
        ]);
        expect([...ancestorsOf(state, state.branches.main)].sort()).toEqual(['c1', 'c2', 'c3', 'c4']);
    });
});

describe('levels', () => {
    /** Starts `levelId`, runs the commands and reports whether the goal is reached. */
    const solves = (levelId, commands) => isLevelComplete(levelId, run(commands, createLevelState(levelId)));

    it('never completes the sandbox or an unknown level', () => {
        expect(solves('sandbox', ['git commit', 'git commit'])).toBe(false);
        expect(isLevelComplete('nope', createInitialState())).toBe(false);
    });

    it('starts no level in a solved state', () => {
        for (const levelId of Object.keys(LEVEL_RULES)) {
            expect(isLevelComplete(levelId, createLevelState(levelId)), levelId).toBe(false);
        }
    });

    it('level 1: two new commits on main', () => {
        expect(solves('lvl1', ['git commit'])).toBe(false);
        expect(solves('lvl1', ['git commit', 'git commit'])).toBe(true);
    });

    it('level 2: feature/login created and checked out', () => {
        expect(solves('lvl2', ['git branch feature/login'])).toBe(false);
        expect(solves('lvl2', ['git checkout -b feature/login'])).toBe(true);
    });

    it('level 3: solvable exactly as described (fast-forward merge)', () => {
        const steps = ['git checkout feature/login', 'git commit', 'git checkout main'];
        expect(solves('lvl3', steps)).toBe(false);
        expect(solves('lvl3', [...steps, 'git merge feature/login'])).toBe(true);
    });

    it('level 3: a real merge commit counts as well', () => {
        expect(
            solves('lvl3', [
                'git checkout feature/login',
                'git commit',
                'git checkout main',
                'git commit',
                'git merge feature/login',
            ])
        ).toBe(true);
    });

    it('level 3: merging without any work on the feature branch is not enough', () => {
        expect(solves('lvl3', ['git merge feature/login'])).toBe(false);
    });

    it('level 4: needs the rebase, not just diverged branches', () => {
        const steps = ['git commit', 'git checkout feature/login', 'git commit'];
        expect(solves('lvl4', steps)).toBe(false);
        expect(solves('lvl4', [...steps, 'git rebase main'])).toBe(true);
    });

    it('level 4: a merge instead of a rebase does not pass', () => {
        expect(solves('lvl4', ['git commit', 'git checkout feature/login', 'git commit', 'git merge main'])).toBe(
            false
        );
    });

    it('level 5: stash and pop the prepared changes', () => {
        expect(createLevelState('lvl5').dirty).toBe(true);
        expect(solves('lvl5', ['git commit'])).toBe(false);
        expect(solves('lvl5', ['git stash'])).toBe(false);
        expect(solves('lvl5', ['git stash', 'git stash pop'])).toBe(true);
    });

    it('level 6: cherry-pick a commit from another branch onto main', () => {
        const steps = ['git checkout -b feature/hotfix', 'git commit', 'git checkout main'];
        expect(solves('lvl6', steps)).toBe(false);
        expect(solves('lvl6', [...steps, 'git cherry-pick c2'])).toBe(true);
    });
});
