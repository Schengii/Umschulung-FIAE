/**
 * Git Branching Simulator — page script.
 *
 * Renders what modules/git-engine.js computes: the terminal output, the SVG commit graph
 * and the level status. All repository logic and the level rules live in the engine (ADR
 * 0007); this file only deals with the document.
 */

import { createLevelState, executeCommand, headCommitId, isLevelComplete } from './modules/git-engine.js';

// Level texts (static, trusted markup). The goals themselves are LEVEL_RULES in the engine.
const LEVEL_TEXTS = {
    sandbox: {
        titleDe: 'Freie Sandbox',
        titleEn: 'Free Sandbox',
        descDe: 'Probiere beliebige Git-Befehle aus. Es gibt kein festes Ziel. Nutze die Tasten oder tippe Befehle in die Konsole.',
        descEn: 'Try out any Git commands you want. There is no set goal. Use the quick buttons or type commands in the console.',
    },
    lvl1: {
        titleDe: 'Level 1: Erste Commits',
        titleEn: 'Level 1: First Commits',
        descDe: 'Erstelle mindestens 2 neue Commits auf dem Hauptzweig <code>main</code>.<br><strong>Tipp:</strong> Klicke zweimal auf <strong>Commit</strong> oder tippe <code>git commit</code>.',
        descEn: 'Create at least 2 new commits on the <code>main</code> branch.<br><strong>Tip:</strong> Click <strong>Commit</strong> twice or type <code>git commit</code>.',
    },
    lvl2: {
        titleDe: 'Level 2: Branching erstellen',
        titleEn: 'Level 2: Creating Branches',
        descDe: 'Erstelle einen neuen Entwicklungszweig namens <code>feature/login</code> und wechsle auf diesen Zweig.<br><strong>Tipp:</strong> <code>git checkout -b feature/login</code>.',
        descEn: 'Create a new development branch named <code>feature/login</code> and switch to it.<br><strong>Tip:</strong> <code>git checkout -b feature/login</code>.',
    },
    lvl3: {
        titleDe: 'Level 3: Mergen & Integrieren',
        titleEn: 'Level 3: Merging & Integration',
        descDe: 'Der Zweig <code>feature/login</code> existiert bereits.<br>1. Wechsle auf ihn: <code>git checkout feature/login</code>.<br>2. Erstelle einen Commit.<br>3. Wechsle zurück auf <code>main</code> (<code>git checkout main</code>).<br>4. Führe den Branch zusammen: <code>git merge feature/login</code>.',
        descEn: 'The branch <code>feature/login</code> already exists.<br>1. Switch to it: <code>git checkout feature/login</code>.<br>2. Create a commit.<br>3. Switch back to <code>main</code> (<code>git checkout main</code>).<br>4. Merge the branch: <code>git merge feature/login</code>.',
    },
    lvl4: {
        titleDe: 'Level 4: Rebase (Fortgeschritten)',
        titleEn: 'Level 4: Rebase (Advanced)',
        descDe: 'Rebasing setzt deine Commits auf einen neuen Basis-Commit.<br>1. Erstelle einen Commit auf <code>main</code>.<br>2. Wechsle auf <code>feature/login</code> und erstelle dort einen Commit.<br>3. Führe <code>git rebase main</code> aus, um die Änderungen sauber linear anzuordnen.',
        descEn: 'Rebasing replays your commits on top of a new base commit.<br>1. Create a commit on <code>main</code>.<br>2. Switch to <code>feature/login</code> and commit there.<br>3. Run <code>git rebase main</code> to line the changes up linearly.',
    },
    lvl5: {
        titleDe: 'Level 5: Stash & Work-in-Progress',
        titleEn: 'Level 5: Stash & Work-in-Progress',
        descDe: 'In deinem Arbeitsverzeichnis liegen unfertige Änderungen (<code>git status</code> zeigt sie).<br>1. Lagere sie zwischen: <code>git stash</code>.<br>2. Hole sie zurück: <code>git stash pop</code>.',
        descEn: 'Your working directory contains unfinished changes (<code>git status</code> shows them).<br>1. Shelve them: <code>git stash</code>.<br>2. Bring them back: <code>git stash pop</code>.',
    },
    lvl6: {
        titleDe: 'Level 6: Cherry-Pick (Profi)',
        titleEn: 'Level 6: Cherry-Pick (Pro)',
        descDe: 'Kopiere einen einzelnen Commit von einem anderen Branch.<br>1. Erstelle den Branch <code>feature/hotfix</code> (<code>git checkout -b feature/hotfix</code>) und mache einen Commit.<br>2. Wechsle auf <code>main</code> und kopiere den Commit mit <code>git cherry-pick &lt;hash&gt;</code> (z. B. <code>c2</code>).',
        descEn: 'Copy a single commit from another branch.<br>1. Create the branch <code>feature/hotfix</code> (<code>git checkout -b feature/hotfix</code>) and commit.<br>2. Switch to <code>main</code> and copy the commit via <code>git cherry-pick &lt;hash&gt;</code> (e.g. <code>c2</code>).',
    },
};

// Colours for well-known branch names; every other branch takes the next palette entry.
const BRANCH_COLORS = {
    main: '#3b82f6', // Blue
    'feature/login': '#a855f7', // Violet
    develop: '#10b981', // Green
    hotfix: '#f43f5e', // Rose
};
const BRANCH_PALETTE = ['#f59e0b', '#06b6d4', '#ec4899', '#84cc16', '#f97316'];

const SVG_NS = 'http://www.w3.org/2000/svg';
const LANE_HEIGHT = 80;
const MAIN_LANE_Y = 160;
const MIN_SVG_HEIGHT = 320;

/** @type {import('./modules/git-engine.js').GitState} */
let gitState = createLevelState('sandbox');
let currentLevelId = 'sandbox';
// The success message, confetti and achievement fire once per level run, not after every
// further command.
let levelCompleted = false;
// The page ships a static welcome text in both languages; it is replaced by a script-rendered
// description (one language at a time) as soon as a level has been chosen.
let descriptionRendered = false;

// DOM Elements
let terminalOutput;
let terminalInput;
let levelSelect;
let levelDescription;
let gitSvg;

const currentLang = () => document.documentElement.getAttribute('lang') || 'de';

/**
 * Appends one line to the simulated terminal. Lines are built from text nodes: they can
 * contain what the visitor typed (branch names, commit messages).
 * @param {{kind: string, de: string, en: string, hash?: string}} line
 */
function writeLine(line) {
    if (!terminalOutput) return;
    const row = document.createElement('div');
    row.className = `terminal-line ${line.kind}-line`;

    if (line.kind === 'log' && line.hash) {
        // "* c3 - message (branch)": highlight the commit id.
        const at = line.de.indexOf(line.hash);
        const hash = document.createElement('span');
        hash.className = 'log-hash';
        hash.textContent = line.hash;
        row.append(line.de.slice(0, at), hash, line.de.slice(at + line.hash.length));
    } else if (line.de === line.en) {
        row.textContent = line.de;
    } else {
        for (const lang of ['de', 'en']) {
            const span = document.createElement('span');
            span.lang = lang;
            span.textContent = line[lang];
            row.appendChild(span);
        }
    }

    terminalOutput.appendChild(row);
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
    if (terminalOutput.parentElement) {
        terminalOutput.parentElement.scrollTop = terminalOutput.parentElement.scrollHeight;
    }
}

function writeSystemLine(de, en = de) {
    writeLine({ kind: 'system', de, en });
}

function writeSuccessLine(de, en = de) {
    writeLine({ kind: 'success', de, en });
}

function writeCommandEcho(command) {
    if (!terminalOutput) return;
    const row = document.createElement('div');
    row.className = 'terminal-line';
    const prompt = document.createElement('span');
    prompt.className = 'terminal-prompt';
    prompt.textContent = 'visitor@fiae-portfolio:~/git-sandbox$';
    const echo = document.createElement('span');
    echo.className = 'cmd-echo';
    echo.textContent = command;
    row.append(prompt, ' ', echo);
    terminalOutput.appendChild(row);
}

/**
 * Vertical lane per branch. `main` sits on the centre line, further branches alternate
 * above and below it in the order they first appear, so no two branches share a lane.
 * @returns {{ laneY: (branch: string) => number, color: (branch: string) => string, height: number }}
 */
function layoutLanes() {
    const names = ['main'];
    for (const name of [
        ...Object.keys(gitState.branches),
        ...Object.values(gitState.commits).map((commit) => commit.branch),
    ]) {
        if (!names.includes(name)) names.push(name);
    }

    // Lane offsets relative to main: 0, -1, +1, -2, +2, ...
    const offsets = names.map((_name, index) => (index % 2 === 1 ? -1 : 1) * Math.ceil(index / 2));
    // One lane fits above main; shift everything down as soon as more are needed.
    const shift = Math.max(0, -1 - Math.min(...offsets)) * LANE_HEIGHT;
    const lanes = new Map(names.map((name, index) => [name, MAIN_LANE_Y + offsets[index] * LANE_HEIGHT + shift]));
    const lowest = Math.max(...lanes.values());

    let paletteIndex = 0;
    const colors = new Map(
        names.map((name) => [name, BRANCH_COLORS[name] || BRANCH_PALETTE[paletteIndex++ % BRANCH_PALETTE.length]])
    );

    return {
        laneY: (branch) => lanes.get(branch) ?? MAIN_LANE_Y + shift,
        color: (branch) => colors.get(branch) || BRANCH_PALETTE[0],
        // Room below the lowest lane for stacked branch labels and the HEAD tag.
        height: Math.max(MIN_SVG_HEIGHT, lowest + 110),
    };
}

function svgElement(tag, attributes = {}, text) {
    const element = document.createElementNS(SVG_NS, tag);
    for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, String(value));
    if (text !== undefined) element.textContent = text;
    return element;
}

/** Draws a reference label (branch name or HEAD) with its pointer line. */
function drawLabel(group, { x, y, pointToY, width, text, stroke, fill }) {
    group.append(
        svgElement('line', { x1: x, y1: y - 10, x2: x, y2: pointToY, class: 'ref-pointer', stroke }),
        svgElement('rect', {
            x: x - width / 2,
            y: y - 10,
            width,
            height: 18,
            class: 'ref-rect',
            rx: 4,
            ry: 4,
            fill: '#161b22',
            stroke,
        }),
        svgElement('text', { x, y: y + 3, class: 'ref-text', fill }, text)
    );
}

/**
 * Render the Git Graph using SVGs
 */
function renderGraph() {
    if (!gitSvg) return;

    const linksGroup = document.getElementById('git-links');
    const nodesGroup = document.getElementById('git-nodes');
    const labelsGroup = document.getElementById('git-labels');
    if (!linksGroup || !nodesGroup || !labelsGroup) return;

    linksGroup.replaceChildren();
    nodesGroup.replaceChildren();
    labelsGroup.replaceChildren();

    const commits = Object.values(gitState.commits);
    const lanes = layoutLanes();
    const position = (commit) => ({ x: 60 + commit.depth * 85, y: lanes.laneY(commit.branch) });

    // The SVG grows with the graph (the container scrolls).
    const maxDepth = Math.max(...commits.map((commit) => commit.depth), 3);
    gitSvg.setAttribute('width', String(Math.max(120 + maxDepth * 85, gitSvg.parentElement.clientWidth)));
    gitSvg.setAttribute('height', String(lanes.height));

    // 1. Connection lines
    for (const commit of commits) {
        const to = position(commit);
        for (const parentId of [commit.parentId, commit.parent2Id]) {
            const parent = parentId ? gitState.commits[parentId] : null;
            if (!parent) continue;
            const from = position(parent);
            const controlX = from.x + (to.x - from.x) / 2;
            const path =
                from.y === to.y
                    ? `M ${from.x} ${from.y} L ${to.x} ${to.y}`
                    : `M ${from.x} ${from.y} C ${controlX} ${from.y}, ${controlX} ${to.y}, ${to.x} ${to.y}`;
            linksGroup.appendChild(
                svgElement('path', {
                    d: path,
                    class: 'commit-link',
                    stroke: lanes.color(commit.branch),
                    'marker-end': 'url(#arrow)',
                })
            );
        }
    }

    // 2. Commit nodes
    const activeCommitId = headCommitId(gitState);
    for (const commit of commits) {
        const { x, y } = position(commit);
        const isActive = commit.id === activeCommitId;
        const color = lanes.color(commit.branch);

        const node = svgElement('g', { class: 'commit-node', 'data-id': commit.id });
        node.addEventListener('click', () => runCommand(`git checkout ${commit.id}`));
        node.append(
            svgElement('title', {}, `[${commit.id}] ${commit.message} (${commit.branch})`),
            svgElement('circle', {
                cx: x,
                cy: y,
                r: isActive ? 16 : 14,
                class: 'commit-circle',
                fill: isActive ? color : '#0b0f19',
                stroke: isActive ? '#fff' : color,
            }),
            svgElement('text', { x, y: y + 4, class: 'commit-text', fill: isActive ? '#000' : '#fff' }, commit.id)
        );
        nodesGroup.appendChild(node);
    }

    // 3. Branch labels and the HEAD pointer, stacked below their commit
    const labelCount = {};
    const nextLabelY = (commit) => {
        const index = labelCount[commit.id] || 0;
        labelCount[commit.id] = index + 1;
        return position(commit).y + 35 + index * 24;
    };

    for (const [branchName, commitId] of Object.entries(gitState.branches)) {
        const commit = gitState.commits[commitId];
        if (!commit) continue;
        const { x, y } = position(commit);
        const labelY = nextLabelY(commit);
        drawLabel(labelsGroup, {
            x,
            y: labelY,
            pointToY: y + 15,
            // Roughly 6.5px per character keeps long branch names inside their box.
            width: Math.max(70, branchName.length * 6.5 + 14),
            text: branchName,
            stroke: lanes.color(branchName),
            fill: '#c9d1d9',
        });

        if (gitState.head === branchName) {
            labelCount[commit.id]++;
            drawLabel(labelsGroup, {
                x,
                y: labelY + 24,
                pointToY: labelY + 8,
                width: 50,
                text: 'HEAD',
                stroke: '#ff7b72',
                fill: '#ff7b72',
            });
        }
    }

    // Detached HEAD: points to a commit instead of a branch.
    if (!gitState.branches[gitState.head]) {
        const commit = gitState.commits[gitState.head];
        if (commit) {
            const { x, y } = position(commit);
            drawLabel(labelsGroup, {
                x,
                y: nextLabelY(commit),
                pointToY: y + 15,
                width: 100,
                text: 'HEAD (detached)',
                stroke: '#ff7b72',
                fill: '#ff7b72',
            });
        }
    }
}

/**
 * Runs one command line through the engine and renders the result.
 */
function runCommand(commandStr) {
    const command = commandStr.trim();
    if (!command) return;

    writeCommandEcho(command);
    const result = executeCommand(gitState, command);

    if (result.clear) {
        if (terminalOutput) terminalOutput.replaceChildren();
        return;
    }
    result.lines.forEach(writeLine);
    if (result.success) playAudio('success');
    if (result.changed) {
        renderGraph();
        checkLevelProgress();
    }
}

function renderLevelDescription() {
    const texts = LEVEL_TEXTS[currentLevelId];
    if (!texts || !levelDescription) return;
    descriptionRendered = true;
    levelDescription.innerHTML = currentLang() === 'de' ? texts.descDe : texts.descEn;
}

function renderLevelBadge() {
    const badge = document.getElementById('level-status-badge');
    if (!badge) return;
    if (currentLevelId === 'sandbox') {
        badge.textContent = '';
        return;
    }
    const isGerman = currentLang() === 'de';
    badge.style.color = levelCompleted ? '#10b981' : '#f97316';
    badge.textContent = levelCompleted
        ? `🏆 ${isGerman ? 'Bestanden' : 'Passed'}`
        : `⏳ ${isGerman ? 'Offen' : 'Active'}`;
}

/** Puts the repository into the starting state of the current level. */
function resetSimulator() {
    gitState = createLevelState(currentLevelId);
    levelCompleted = false;
    writeSystemLine('Git-Repository neu initialisiert.', 'Re-initialised the Git repository.');
    renderGraph();
    renderLevelBadge();
}

function handleLevelChange(levelId) {
    currentLevelId = LEVEL_TEXTS[levelId] ? levelId : 'sandbox';
    resetSimulator();
    renderLevelDescription();

    const texts = LEVEL_TEXTS[currentLevelId];
    writeSystemLine(`*** Challenge '${texts.titleDe}' gestartet! ***`, `*** Challenge '${texts.titleEn}' started! ***`);
}

function checkLevelProgress() {
    if (!levelCompleted && isLevelComplete(currentLevelId, gitState)) {
        levelCompleted = true;
        writeSuccessLine(
            '🎉 Glückwunsch! Du hast die Challenge erfolgreich bestanden.',
            '🎉 Congratulations! You successfully passed this challenge.'
        );
        if (typeof Confetti !== 'undefined') Confetti.start();
        if (typeof Achievements !== 'undefined') Achievements.unlock('git_master');
    }
    renderLevelBadge();
}

function playAudio(soundId) {
    if (typeof GameAudio !== 'undefined') {
        GameAudio.play(soundId);
    }
}

/**
 * Quick action buttons: ask for the one argument a command needs and run it.
 */
function setupQuickActions() {
    const ask = (de, en, fallback = '') => (prompt(currentLang() === 'de' ? de : en, fallback) || '').trim();
    const branchList = () => Object.keys(gitState.branches).join(', ');
    const on = (id, handler) => document.getElementById(id)?.addEventListener('click', handler);

    on('btn-quick-commit', () => {
        const message = ask('Commit-Nachricht:', 'Commit message:', 'Feat: Add new components') || 'manual commit';
        // The message is passed as one quoted argument; quotes inside it would end it early.
        runCommand(`git commit -m "${message.replace(/"/g, "'")}"`);
    });

    on('btn-quick-branch', () => {
        const name = ask('Neuer Branch-Name:', 'New branch name:');
        if (name) runCommand(`git branch ${name}`);
    });

    on('btn-quick-checkout', () => {
        const name = ask(
            `Wechseln zu Branch oder Commit (${branchList()}):`,
            `Switch to branch or commit (${branchList()}):`
        );
        if (name) runCommand(`git checkout ${name}`);
    });

    on('btn-quick-merge', () => {
        const name = ask(`Branch hineinmergen (${branchList()}):`, `Branch to merge in (${branchList()}):`);
        if (name) runCommand(`git merge ${name}`);
    });

    on('btn-quick-rebase', () => {
        const name = ask(
            `Rebase auf welchen Branch? (${branchList()}):`,
            `Rebase onto which branch? (${branchList()}):`
        );
        if (name) runCommand(`git rebase ${name}`);
    });

    on('reset-sim-btn', resetSimulator);
}

/**
 * Module initialization
 */
export function initGitSimulator() {
    terminalOutput = document.getElementById('terminal-output');
    terminalInput = document.getElementById('terminal-input');
    levelSelect = document.getElementById('level-select');
    levelDescription = document.getElementById('level-description');
    gitSvg = document.getElementById('git-svg');

    if (!terminalInput || !gitSvg) return;

    // Command History State
    const commandHistory = [];
    let historyIndex = -1;

    // Terminal Input events with history navigation
    terminalInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const cmd = terminalInput.value;
            if (cmd.trim()) {
                commandHistory.push(cmd);
                historyIndex = commandHistory.length;
            }
            terminalInput.value = '';
            runCommand(cmd);
        } else if (e.key === 'ArrowUp') {
            if (commandHistory.length > 0 && historyIndex > 0) {
                historyIndex--;
                terminalInput.value = commandHistory[historyIndex];
                e.preventDefault();
            }
        } else if (e.key === 'ArrowDown') {
            if (historyIndex < commandHistory.length - 1) {
                historyIndex++;
                terminalInput.value = commandHistory[historyIndex];
            } else {
                historyIndex = commandHistory.length;
                terminalInput.value = '';
            }
            e.preventDefault();
        }
    });

    // Level selector events
    if (levelSelect) {
        levelSelect.addEventListener('change', (e) => {
            handleLevelChange(/** @type {HTMLSelectElement} */ (e.target).value);
        });
    }

    setupQuickActions();
    resetSimulator();

    // Terminal lines carry both languages; description and badge are rendered per language.
    window.addEventListener('fiae:lang-change', () => {
        if (descriptionRendered) renderLevelDescription();
        renderLevelBadge();
    });

    // Resize listener to adapt SVG width
    window.addEventListener('resize', renderGraph);
}
