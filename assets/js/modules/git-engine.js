/**
 * Git simulator engine — the DOM-free state machine behind assets/js/git-simulator.js.
 *
 * It owns the repository state (ADR 0007) and turns a command line into state changes plus
 * a list of output lines. Nothing in here touches the document, so the command semantics
 * and the level rules are covered by unit tests (git-engine.test.js); the page script only
 * renders what the engine returns.
 *
 * Output lines are plain text in both languages ({ kind, de, en }) and may contain text the
 * visitor typed (branch names, commit messages): the renderer must treat them as text, never
 * as HTML.
 */

/**
 * @typedef {object} Commit
 * @property {string} id
 * @property {string} message
 * @property {string | null} parentId
 * @property {string | null} parent2Id second parent of a merge commit
 * @property {string} branch branch the commit was created on (decides lane and colour)
 * @property {number} depth longest distance to the root commit (x position in the graph)
 * @property {string} [rebasedFrom] id of the commit this one replays
 * @property {string} [cherryPickedFrom] id of the commit this one copies
 */

/**
 * @typedef {object} GitState
 * @property {Record<string, Commit>} commits
 * @property {Record<string, string>} branches branch name -> commit id
 * @property {string} head branch name, or a commit id when HEAD is detached
 * @property {number} commitCount
 * @property {boolean} dirty uncommitted changes in the simulated working directory
 * @property {string[]} stash stash entries, newest first
 * @property {number} stashPops how often a stash entry was applied again
 */

/**
 * @typedef {object} OutputLine
 * @property {'system' | 'error' | 'success' | 'log'} kind
 * @property {string} de
 * @property {string} en
 * @property {string} [hash] commit id of a `log` line, for highlighting
 */

/**
 * @typedef {object} CommandResult
 * @property {OutputLine[]} lines
 * @property {boolean} clear the terminal should be emptied
 * @property {boolean} changed the repository state changed (graph needs a re-render)
 * @property {boolean} success worth an acoustic confirmation
 */

const BRANCH_NAME = /^[A-Za-z0-9][A-Za-z0-9._/-]*$/;

const HELP_DE = [
    'Unterstützte Befehle:',
    '  git commit [-m "Nachricht"]   Neuen Commit erstellen',
    '  git branch [<name>]           Branches auflisten / Branch erstellen',
    '  git branch -d <name>          Branch löschen',
    '  git checkout <name|hash>      Auf Branch/Commit wechseln (auch: git switch)',
    '  git checkout -b <name>        Branch erstellen und aktivieren',
    '  git merge <name>              Branch in den aktuellen Branch integrieren',
    '  git rebase <name>             Eigene Commits auf <name> neu aufsetzen',
    '  git cherry-pick <hash>        Einzelnen Commit kopieren',
    '  git reset --hard <hash>       Aktuellen Branch zurücksetzen',
    '  git stash | stash pop | stash list   Änderungen zwischenlagern',
    '  git status                    Zustand anzeigen',
    '  git log                       Commit-Verlauf anzeigen',
    '  touch <datei>                 Uncommittete Änderung simulieren',
    '  clear                         Konsole leeren',
].join('\n');

const HELP_EN = [
    'Supported commands:',
    '  git commit [-m "message"]     Create a new commit',
    '  git branch [<name>]           List branches / create a branch',
    '  git branch -d <name>          Delete a branch',
    '  git checkout <name|hash>      Switch to a branch/commit (also: git switch)',
    '  git checkout -b <name>        Create and switch to a branch',
    '  git merge <name>              Integrate a branch into the current one',
    '  git rebase <name>             Replay your commits on top of <name>',
    '  git cherry-pick <hash>        Copy a single commit',
    '  git reset --hard <hash>       Reset the current branch',
    '  git stash | stash pop | stash list   Shelve changes',
    '  git status                    Show the current state',
    '  git log                       Show the commit history',
    '  touch <file>                  Simulate an uncommitted change',
    '  clear                         Clear the console',
].join('\n');

/** @returns {GitState} */
export function createInitialState() {
    return {
        commits: {
            c1: { id: 'c1', message: 'Initial commit', parentId: null, parent2Id: null, branch: 'main', depth: 0 },
        },
        branches: { main: 'c1' },
        head: 'main',
        commitCount: 1,
        dirty: false,
        stash: [],
        stashPops: 0,
    };
}

/**
 * Splits a command line into arguments; single or double quotes keep a phrase together.
 * @param {string} input
 * @returns {string[]}
 */
export function tokenize(input) {
    const tokens = [];
    const pattern = /"([^"]*)"|'([^']*)'|(\S+)/g;
    let match;
    while ((match = pattern.exec(input)) !== null) {
        tokens.push(match[1] ?? match[2] ?? match[3]);
    }
    return tokens;
}

/** Commit id HEAD currently resolves to. */
export function headCommitId(state) {
    return state.branches[state.head] || state.head;
}

/** Name of the checked-out branch, or null when HEAD is detached. */
export function currentBranch(state) {
    return state.branches[state.head] ? state.head : null;
}

/**
 * Every commit reachable from `id` through first and second parents, `id` included.
 * @param {GitState} state
 * @param {string} id
 * @returns {Set<string>}
 */
export function ancestorsOf(state, id) {
    const seen = new Set();
    const pending = [id];
    while (pending.length > 0) {
        const current = pending.pop();
        const commit = state.commits[current];
        if (!commit || seen.has(current)) continue;
        seen.add(current);
        if (commit.parentId) pending.push(commit.parentId);
        if (commit.parent2Id) pending.push(commit.parent2Id);
    }
    return seen;
}

/**
 * The commits on the first-parent chain of `tipId` that are not part of `baseId`'s history,
 * oldest first — i.e. the work a branch has on top of another one.
 * @returns {Commit[]}
 */
function ownCommits(state, tipId, baseId) {
    const base = ancestorsOf(state, baseId);
    const own = [];
    let id = tipId;
    while (id && !base.has(id)) {
        const commit = state.commits[id];
        if (!commit) break;
        own.unshift(commit);
        id = commit.parentId;
    }
    return own;
}

/**
 * Drops commits no branch (and no detached HEAD) can reach any more, like `git log --all`
 * no longer showing them. Returns how many were removed.
 */
function collectGarbage(state) {
    const reachable = new Set();
    for (const tip of [...Object.values(state.branches), headCommitId(state)]) {
        for (const id of ancestorsOf(state, tip)) reachable.add(id);
    }
    let removed = 0;
    for (const id of Object.keys(state.commits)) {
        if (!reachable.has(id)) {
            delete state.commits[id];
            removed++;
        }
    }
    return removed;
}

function addCommit(state, fields) {
    state.commitCount++;
    const id = `c${state.commitCount}`;
    const parent = state.commits[fields.parentId];
    const parent2 = fields.parent2Id ? state.commits[fields.parent2Id] : null;
    const depth = Math.max(parent ? parent.depth : -1, parent2 ? parent2.depth : -1) + 1;
    state.commits[id] = { id, parent2Id: null, ...fields, depth };
    return state.commits[id];
}

/** Moves the current branch (or a detached HEAD) to `commitId`. */
function moveHead(state, commitId) {
    const branch = currentBranch(state);
    if (branch) state.branches[branch] = commitId;
    else state.head = commitId;
}

/**
 * Executes one command line against `state` (mutating it).
 * @param {GitState} state
 * @param {string} input
 * @returns {CommandResult}
 */
export function executeCommand(state, input) {
    /** @type {CommandResult} */
    const result = { lines: [], clear: false, changed: false, success: false };
    const say = (kind, de, en = de, extra = {}) => result.lines.push({ kind, de, en, ...extra });
    const fail = (de, en) => say('error', `error: ${de}`, `error: ${en}`);

    const args = tokenize(input);
    if (args.length === 0) return result;
    const [base, action, ...rest] = args;

    if (base === 'clear') {
        result.clear = true;
        return result;
    }
    if (base === 'help') {
        say('system', HELP_DE, HELP_EN);
        return result;
    }
    if (base === 'touch') {
        const file = action || 'datei.txt';
        state.dirty = true;
        say(
            'system',
            `'${file}' geändert. Im Arbeitsverzeichnis liegen jetzt uncommittete Änderungen.`,
            `'${file}' modified. The working directory now has uncommitted changes.`
        );
        result.changed = true;
        return result;
    }
    if (base !== 'git') {
        fail(
            `Befehl nicht gefunden: '${base}'. Tippe 'help' für eine Befehlsliste.`,
            `Command not found: '${base}'. Type 'help' for a list of commands.`
        );
        return result;
    }
    if (!action) {
        fail(
            "Unvollständiger Befehl. Tippe 'git' gefolgt von einer Aktion (z. B. 'commit', 'branch').",
            "Incomplete command. Type 'git' followed by an action (e.g. 'commit', 'branch')."
        );
        return result;
    }

    const headId = headCommitId(state);
    const branch = currentBranch(state);

    switch (action) {
        case 'commit': {
            let message = 'New commit';
            const flag = rest.indexOf('-m');
            if (flag !== -1) {
                message = rest
                    .slice(flag + 1)
                    .join(' ')
                    .trim();
                if (!message) {
                    fail(
                        'Commit-Nachricht fehlt. Verwendung: git commit -m "Nachricht"',
                        'Commit message missing. Usage: git commit -m "message"'
                    );
                    return result;
                }
            }
            const commit = addCommit(state, {
                message,
                parentId: headId,
                branch: branch || state.commits[headId].branch,
            });
            moveHead(state, commit.id);
            state.dirty = false;
            say('success', `[${branch || 'detached HEAD'} ${commit.id}] ${message}`);
            result.success = true;
            break;
        }

        case 'branch': {
            const [first, second] = rest;
            if (!first) {
                const list = Object.keys(state.branches)
                    .map((name) => `${name === state.head ? '*' : ' '} ${name}`)
                    .join('\n');
                say('system', list);
                return result;
            }
            if (first === '-d' || first === '-D') {
                if (!second) {
                    fail(
                        'Branch-Name fehlt. Verwendung: git branch -d <name>',
                        'Branch name missing. Usage: git branch -d <name>'
                    );
                    return result;
                }
                if (!state.branches[second]) {
                    fail(`Branch '${second}' existiert nicht.`, `Branch '${second}' does not exist.`);
                    return result;
                }
                if (second === state.head) {
                    fail(
                        `Der ausgecheckte Branch '${second}' kann nicht gelöscht werden.`,
                        `Cannot delete the checked-out branch '${second}'.`
                    );
                    return result;
                }
                delete state.branches[second];
                const removed = collectGarbage(state);
                say('system', `Branch '${second}' gelöscht.`, `Deleted branch '${second}'.`);
                if (removed > 0) {
                    say(
                        'system',
                        `${removed} nicht mehr erreichbare(r) Commit(s) verworfen.`,
                        `Dropped ${removed} commit(s) that are no longer reachable.`
                    );
                }
                break;
            }
            if (!BRANCH_NAME.test(first)) {
                fail(`'${first}' ist kein gültiger Branch-Name.`, `'${first}' is not a valid branch name.`);
                return result;
            }
            if (state.branches[first]) {
                fail(`Branch '${first}' existiert bereits.`, `Branch '${first}' already exists.`);
                return result;
            }
            state.branches[first] = headId;
            say(
                'system',
                `Branch '${first}' erstellt auf Commit ${headId}.`,
                `Created branch '${first}' at commit ${headId}.`
            );
            break;
        }

        case 'checkout':
        case 'switch': {
            const create = rest[0] === '-b' || rest[0] === '-c';
            const target = create ? rest[1] : rest[0];
            if (!target) {
                fail(
                    'Ziel fehlt. Verwendung: git checkout <branch|hash>',
                    'Target missing. Usage: git checkout <branch|hash>'
                );
                return result;
            }
            if (create) {
                if (!BRANCH_NAME.test(target)) {
                    fail(`'${target}' ist kein gültiger Branch-Name.`, `'${target}' is not a valid branch name.`);
                    return result;
                }
                if (state.branches[target]) {
                    fail(`Branch '${target}' existiert bereits.`, `Branch '${target}' already exists.`);
                    return result;
                }
                state.branches[target] = headId;
                state.head = target;
                say(
                    'system',
                    `Zweig '${target}' erstellt und aktiviert.`,
                    `Created and switched to branch '${target}'.`
                );
            } else if (state.branches[target]) {
                state.head = target;
                say('system', `Gewechselt zu Branch '${target}'.`, `Switched to branch '${target}'.`);
            } else if (state.commits[target]) {
                state.head = target;
                say(
                    'system',
                    `Achtung: Du befindest dich in einem 'Detached HEAD'-Zustand auf Commit ${target}.`,
                    `Note: you are in 'detached HEAD' state at commit ${target}.`
                );
            } else {
                fail(`Branch oder Commit '${target}' nicht gefunden.`, `Branch or commit '${target}' not found.`);
                return result;
            }
            // Commits made on a detached HEAD belong to no branch; leaving them loses them.
            const removed = collectGarbage(state);
            if (removed > 0) {
                say(
                    'system',
                    `Warnung: ${removed} Commit(s) ohne Branch wurden zurückgelassen und verworfen.`,
                    `Warning: ${removed} commit(s) without a branch were left behind and dropped.`
                );
            }
            break;
        }

        case 'merge': {
            const source = rest[0];
            if (!source) {
                fail(
                    'Quell-Branch fehlt. Verwendung: git merge <branch>',
                    'Source branch missing. Usage: git merge <branch>'
                );
                return result;
            }
            if (!state.branches[source]) {
                fail(`Branch '${source}' existiert nicht.`, `Branch '${source}' does not exist.`);
                return result;
            }
            if (!branch) {
                fail(
                    "Merge im 'Detached HEAD'-Zustand wird nicht unterstützt.",
                    "Merging in 'detached HEAD' state is not supported."
                );
                return result;
            }
            if (branch === source) {
                fail('Kann einen Branch nicht mit sich selbst mergen.', 'Cannot merge a branch into itself.');
                return result;
            }
            const sourceId = state.branches[source];
            if (ancestorsOf(state, headId).has(sourceId)) {
                say('system', 'Bereits aktuell (Already up to date).', 'Already up to date.');
                return result;
            }
            if (ancestorsOf(state, sourceId).has(headId)) {
                state.branches[branch] = sourceId;
                say(
                    'system',
                    `Fast-Forward durchgeführt. ${branch} zeigt nun auf Commit ${sourceId}.`,
                    `Fast-forward. ${branch} now points to commit ${sourceId}.`
                );
            } else {
                const commit = addCommit(state, {
                    message: `Merge branch '${source}' into ${branch}`,
                    parentId: headId,
                    parent2Id: sourceId,
                    branch,
                });
                state.branches[branch] = commit.id;
                say(
                    'success',
                    `Merge-Commit ${commit.id} erstellt. '${source}' in '${branch}' integriert.`,
                    `Created merge commit ${commit.id}. Merged '${source}' into '${branch}'.`
                );
            }
            result.success = true;
            break;
        }

        case 'rebase': {
            const onto = rest[0];
            if (!onto) {
                fail(
                    'Ziel-Branch fehlt. Verwendung: git rebase <branch>',
                    'Target branch missing. Usage: git rebase <branch>'
                );
                return result;
            }
            const ontoId = state.branches[onto];
            if (!ontoId) {
                fail(`Branch '${onto}' existiert nicht.`, `Branch '${onto}' does not exist.`);
                return result;
            }
            if (!branch) {
                fail(
                    "Rebase im 'Detached HEAD'-Zustand wird nicht unterstützt.",
                    "Rebasing in 'detached HEAD' state is not supported."
                );
                return result;
            }
            if (ancestorsOf(state, headId).has(ontoId)) {
                say(
                    'system',
                    `Bereits aktuell: '${branch}' baut schon auf '${onto}' auf.`,
                    `Already up to date: '${branch}' is already based on '${onto}'.`
                );
                return result;
            }
            const replay = ownCommits(state, headId, ontoId);
            let tip = ontoId;
            for (const original of replay) {
                tip = addCommit(state, {
                    message: original.message,
                    parentId: tip,
                    branch,
                    rebasedFrom: original.id,
                }).id;
            }
            state.branches[branch] = tip;
            collectGarbage(state);
            if (replay.length === 0) {
                say(
                    'system',
                    `Fast-Forward durchgeführt. ${branch} zeigt nun auf Commit ${tip}.`,
                    `Fast-forward. ${branch} now points to commit ${tip}.`
                );
            } else {
                say(
                    'success',
                    `Erfolgreich rebased: ${replay.length} Commit(s) von '${branch}' neu auf '${onto}' aufgesetzt.`,
                    `Successfully rebased: replayed ${replay.length} commit(s) of '${branch}' on top of '${onto}'.`
                );
            }
            result.success = true;
            break;
        }

        case 'cherry-pick': {
            const hash = rest[0];
            if (!hash) {
                fail(
                    'Commit-Hash fehlt. Verwendung: git cherry-pick <hash>',
                    'Commit hash missing. Usage: git cherry-pick <hash>'
                );
                return result;
            }
            const original = state.commits[hash];
            if (!original) {
                fail(`Commit '${hash}' existiert nicht.`, `Commit '${hash}' does not exist.`);
                return result;
            }
            if (ancestorsOf(state, headId).has(hash)) {
                fail(
                    `Commit '${hash}' ist bereits Teil der aktuellen Historie.`,
                    `Commit '${hash}' is already part of the current history.`
                );
                return result;
            }
            const commit = addCommit(state, {
                message: original.message,
                parentId: headId,
                branch: branch || state.commits[headId].branch,
                cherryPickedFrom: hash,
            });
            moveHead(state, commit.id);
            say(
                'success',
                `[${branch || 'detached HEAD'} ${commit.id}] ${original.message} (Cherry-Pick von ${hash})`,
                `[${branch || 'detached HEAD'} ${commit.id}] ${original.message} (cherry-picked from ${hash})`
            );
            result.success = true;
            break;
        }

        case 'reset': {
            const hash = rest[0] === '--hard' ? rest[1] : rest[0];
            if (!hash) {
                fail(
                    'Commit-Hash fehlt. Verwendung: git reset --hard <hash>',
                    'Commit hash missing. Usage: git reset --hard <hash>'
                );
                return result;
            }
            if (!state.commits[hash]) {
                fail(`Commit '${hash}' existiert nicht.`, `Commit '${hash}' does not exist.`);
                return result;
            }
            moveHead(state, hash);
            if (rest[0] === '--hard') state.dirty = false;
            collectGarbage(state);
            if (branch) {
                say('system', `Zweig '${branch}' zeigt nun auf ${hash}.`, `Branch '${branch}' now points to ${hash}.`);
            } else {
                say('system', `HEAD zeigt nun auf ${hash}.`, `HEAD now points to ${hash}.`);
            }
            break;
        }

        case 'stash': {
            const sub = rest[0] || 'push';
            if (sub === 'list') {
                const list = state.stash.map((entry, index) => `stash@{${index}}: ${entry}`).join('\n');
                say('system', list || 'Der Stash ist leer.', list || 'The stash is empty.');
                return result;
            }
            if (sub === 'pop' || sub === 'apply') {
                if (state.stash.length === 0) {
                    fail('Keine Stash-Einträge vorhanden.', 'No stash entries found.');
                    return result;
                }
                if (sub === 'pop') state.stash.shift();
                state.dirty = true;
                state.stashPops++;
                say(
                    'success',
                    'Änderungen aus dem Stash wiederhergestellt. Das Arbeitsverzeichnis enthält sie wieder.',
                    'Restored the stashed changes. They are back in the working directory.'
                );
                result.success = true;
                break;
            }
            if (sub !== 'push') {
                fail(`Unbekannte Stash-Aktion: '${sub}'.`, `Unknown stash action: '${sub}'.`);
                return result;
            }
            if (!state.dirty) {
                say(
                    'system',
                    "Keine lokalen Änderungen zum Speichern. Tipp: 'touch <datei>' simuliert eine Änderung.",
                    "No local changes to save. Tip: 'touch <file>' simulates a change."
                );
                return result;
            }
            state.stash.unshift(`WIP on ${branch || 'detached HEAD'}: ${headId} ${state.commits[headId].message}`);
            state.dirty = false;
            say(
                'system',
                `Arbeitsverzeichnis gesichert: ${state.stash[0]}`,
                `Saved working directory: ${state.stash[0]}`
            );
            break;
        }

        case 'status': {
            const where = branch
                ? [`Auf Branch ${branch}`, `On branch ${branch}`]
                : [`HEAD losgelöst bei ${headId}`, `HEAD detached at ${headId}`];
            const tree = state.dirty
                ? ['Änderungen, die nicht zum Commit vorgemerkt sind (uncommittet).', 'Changes not staged for commit.']
                : ['Nichts zu committen, Arbeitsverzeichnis unverändert.', 'Nothing to commit, working tree clean.'];
            say('system', `${where[0]}\n${tree[0]}`, `${where[1]}\n${tree[1]}`);
            return result;
        }

        case 'log': {
            let id = headId;
            while (id) {
                const commit = state.commits[id];
                if (!commit) break;
                say('log', `* ${commit.id} - ${commit.message} (${commit.branch})`, undefined, { hash: commit.id });
                id = commit.parentId;
            }
            return result;
        }

        default:
            fail(
                `Unbekannte Git-Aktion: '${action}'. Tippe 'help' für Infos.`,
                `Unknown git action: '${action}'. Type 'help' for details.`
            );
            return result;
    }

    result.changed = true;
    return result;
}

/** True when `tipId`'s own commits on top of `baseId` exist and all came from a rebase. */
function isRebasedOnto(state, tipId, baseId) {
    if (!ancestorsOf(state, tipId).has(baseId)) return false;
    const own = ownCommits(state, tipId, baseId);
    return own.length > 0 && own.every((commit) => commit.rebasedFrom && !commit.parent2Id);
}

/**
 * Level rules: commands that prepare the repository, and the goal as a pure function of the
 * state. The texts shown to the visitor live in git-simulator.js.
 * @type {Record<string, { setup: string[], check: (state: GitState) => boolean }>}
 */
export const LEVEL_RULES = {
    sandbox: { setup: [], check: () => false },
    // Two new commits on main.
    lvl1: {
        setup: [],
        check: (state) =>
            state.head === 'main' &&
            [...ancestorsOf(state, state.branches.main)].filter((id) => state.commits[id].branch === 'main').length >=
                3,
    },
    // feature/login exists and is checked out.
    lvl2: {
        setup: [],
        check: (state) => state.branches['feature/login'] !== undefined && state.head === 'feature/login',
    },
    // Work from feature/login is part of main (a fast-forward counts as much as a merge commit).
    lvl3: {
        setup: ['git branch feature/login'],
        check: (state) => {
            const feature = state.branches['feature/login'];
            if (!feature || state.head !== 'main') return false;
            const inMain = ancestorsOf(state, state.branches.main);
            return inMain.has(feature) && [...inMain].some((id) => state.commits[id].branch === 'feature/login');
        },
    },
    // feature/login was replayed on top of a main that had moved on.
    lvl4: {
        setup: ['git branch feature/login'],
        check: (state) => {
            const feature = state.branches['feature/login'];
            return (
                Boolean(feature) &&
                state.head === 'feature/login' &&
                state.branches.main !== 'c1' &&
                isRebasedOnto(state, feature, state.branches.main)
            );
        },
    },
    // Changes were stashed and brought back.
    lvl5: {
        setup: ['touch login.js'],
        check: (state) => state.stashPops > 0 && state.stash.length === 0 && state.dirty,
    },
    // A commit from another branch was copied onto main.
    lvl6: {
        setup: [],
        check: (state) =>
            state.head === 'main' &&
            [...ancestorsOf(state, state.branches.main)].some((id) => Boolean(state.commits[id].cherryPickedFrom)),
    },
};

/**
 * A repository prepared for `levelId` (unknown ids fall back to the sandbox).
 * @param {string} levelId
 * @returns {GitState}
 */
export function createLevelState(levelId) {
    const state = createInitialState();
    const rules = LEVEL_RULES[levelId] || LEVEL_RULES.sandbox;
    for (const command of rules.setup) executeCommand(state, command);
    return state;
}

/** @returns {boolean} whether the goal of `levelId` is reached in `state` */
export function isLevelComplete(levelId, state) {
    const rules = LEVEL_RULES[levelId];
    return Boolean(rules) && rules.check(state);
}
