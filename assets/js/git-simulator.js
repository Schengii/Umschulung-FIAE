/**
 * Git Branching Simulator Logic
 * Provides a client-side Git sandbox with interactive command execution,
 * tutorials, quick action buttons, and a dynamic SVG visualization of the commit tree.
 */

// Git Simulator State
let gitState = {
    commits: {}, // Map of hash -> commit { id, message, parentId, parent2Id, branch, x, y, depth }
    branches: {}, // Map of branchName -> commitId
    head: 'main', // Active branch name or direct commitId (detached HEAD)
    commitCount: 0,
    activeBranch: 'main'
};

// Available Level Objectives
const LEVELS = {
    sandbox: {
        titleDe: "Freie Sandbox",
        titleEn: "Free Sandbox",
        descDe: "Probiere beliebige Git-Befehle aus. Es gibt kein festes Ziel. Nutze die Tasten oder tippe Befehle in die Konsole.",
        descEn: "Try out any Git commands you want. There is no set goal. Use the quick buttons or type commands in the console.",
        check: () => false
    },
    lvl1: {
        titleDe: "Level 1: Erste Commits",
        titleEn: "Level 1: First Commits",
        descDe: "Erstelle mindestens 2 neue Commits auf dem Hauptzweig <code>main</code>.<br><strong>Tipp:</strong> Klicke zweimal auf <strong>Commit</strong> oder tippe <code>git commit</code>.",
        descEn: "Create at least 2 new commits on the <code>main</code> branch.<br><strong>Tip:</strong> Click <strong>Commit</strong> twice or type <code>git commit</code>.",
        check: () => {
            const mainCommits = Object.values(gitState.commits).filter(c => c.branch === 'main');
            return mainCommits.length >= 3 && gitState.head === 'main';
        }
    },
    lvl2: {
        titleDe: "Level 2: Branching erstellen",
        titleEn: "Level 2: Creating Branches",
        descDe: "Erstelle einen neuen Entwicklungszweig namens <code>feature/login</code> und wechsle auf diesen Zweig.<br><strong>Tipp:</strong> <code>git checkout -b feature/login</code>.",
        descEn: "Create a new development branch named <code>feature/login</code> and switch to it.<br><strong>Tip:</strong> <code>git checkout -b feature/login</code>.",
        check: () => {
            return gitState.branches['feature/login'] !== undefined && gitState.head === 'feature/login';
        }
    },
    lvl3: {
        titleDe: "Level 3: Mergen & Integrieren",
        titleEn: "Level 3: Merging & Integration",
        descDe: "1. Wechsle auf den Zweig <code>feature/login</code> (falls nicht bereits dort).<br>2. Erstelle einen Commit.<br>3. Wechsle zurück auf <code>main</code> (<code>git checkout main</code>).<br>4. Führe den Branch zusammen: <code>git merge feature/login</code>.",
        descEn: "1. Switch to branch <code>feature/login</code>.<br>2. Create a commit.<br>3. Switch back to <code>main</code> (<code>git checkout main</code>).<br>4. Merge the branch: <code>git merge feature/login</code>.",
        check: () => {
            // Check if there is a commit on main that has a parent from feature/login
            const commits = Object.values(gitState.commits);
            const mergeCommit = commits.find(c => c.branch === 'main' && c.parent2Id);
            if (mergeCommit) {
                const parent2 = gitState.commits[mergeCommit.parent2Id];
                return parent2 && parent2.branch === 'feature/login' && gitState.head === 'main';
            }
            return false;
        }
    },
    lvl4: {
        titleDe: "Level 4: Rebase (Fortgeschritten)",
        titleEn: "Level 4: Rebase (Advanced)",
        descDe: "Rebasing verschiebt Commits auf einen neuen Basis-Commit.<br>1. Erstelle einen Commit auf <code>main</code>.<br>2. Wechsle auf <code>feature/login</code> und erstelle dort einen Commit.<br>3. Führe <code>git rebase main</code> aus, um die Änderungen sauber linear anzuordnen.",
        descEn: "Rebasing moves commits onto a new base commit.<br>1. Create a commit on <code>main</code>.<br>2. Switch to <code>feature/login</code> and commit there.<br>3. Run <code>git rebase main</code> to cleanly align changes linearly.",
        check: () => {
            // Check if feature/login commit is a descendant of a commit on main, and parent is not a merge commit
            const commits = Object.values(gitState.commits);
            const loginCommit = commits.find(c => c.branch === 'feature/login');
            if (loginCommit && loginCommit.parentId) {
                const parent = gitState.commits[loginCommit.parentId];
                // In a rebase, the parent of the rebased commit on feature/login is now on main branch
                return parent && parent.branch === 'main' && !loginCommit.parent2Id;
            }
            return false;
        }
    },
    lvl5: {
        titleDe: "Level 5: Stash & Work-in-Progress",
        titleEn: "Level 5: Stash & Work-in-Progress",
        descDe: "Speichere unfertige Änderungen im Stash ab.<br>Führe <code>git stash</code> und anschließend <code>git stash pop</code> aus.",
        descEn: "Stash uncommitted work-in-progress.<br>Run <code>git stash</code> and then <code>git stash pop</code>.",
        check: () => {
            const commits = Object.values(gitState.commits);
            return commits.length >= 2;
        }
    },
    lvl6: {
        titleDe: "Level 6: Cherry-Pick (Profi)",
        titleEn: "Level 6: Cherry-Pick (Pro)",
        descDe: "Kopiere einen spezifischen Commit von einem anderen Branch.<br>1. Erstelle Branch <code>feature/hotfix</code> und mache einen Commit.<br>2. Wechsle auf <code>main</code> und kopiere den Commit mit <code>git cherry-pick &lt;hash&gt;</code>.",
        descEn: "Copy a specific commit from another branch.<br>1. Create branch <code>feature/hotfix</code> and commit.<br>2. Switch to <code>main</code> and copy the commit via <code>git cherry-pick &lt;hash&gt;</code>.",
        check: () => {
            const commits = Object.values(gitState.commits);
            return commits.some(c => c.message && c.message.includes('Cherry-picked'));
        }
    }
};

let currentLevelId = 'sandbox';

// Color Palette for branches
const BRANCH_COLORS = {
    main: '#3b82f6', // Blue
    'feature/login': '#a855f7', // Violet
    develop: '#10b981', // Green
    hotfix: '#f43f5e', // Rose
    default: '#f59e0b' // Amber
};

// DOM Elements
let terminalOutput;
let terminalInput;
let levelSelect;
let levelDescription;
let gitSvg;

/**
 * Generate a short 4-character hex-like hash for commits
 */
function generateHash() {
    gitState.commitCount++;
    return 'c' + gitState.commitCount;
}

/**
 * Initialize Git state to starting point
 */
function resetGitState() {
    gitState = {
        commits: {},
        branches: {},
        head: 'main',
        commitCount: 0,
        activeBranch: 'main'
    };

    const rootHash = generateHash();
    gitState.commits[rootHash] = {
        id: rootHash,
        message: 'Initial commit',
        parentId: null,
        parent2Id: null,
        branch: 'main',
        depth: 0
    };
    gitState.branches['main'] = rootHash;
    gitState.head = 'main';
    gitState.activeBranch = 'main';

    writeSystemLine('Initialisiert leeres Git-Repository.');
    renderGraph();
    checkLevelProgress();
}

/**
 * Write a standard line to the simulated terminal
 */
function writeTerminalLine(text, className = '') {
    if (!terminalOutput) return;
    const line = document.createElement('div');
    line.className = `terminal-line ${className}`;
    line.innerHTML = text;
    terminalOutput.appendChild(line);
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
    if (terminalOutput.parentElement) {
        terminalOutput.parentElement.scrollTop = terminalOutput.parentElement.scrollHeight;
    }
}

function writeSystemLine(text) {
    writeTerminalLine(text, 'system-line');
}

function writeErrorLine(text) {
    writeTerminalLine(`error: ${text}`, 'error-line');
}

function writeSuccessLine(text) {
    writeTerminalLine(text, 'success-line');
}

/**
 * Calculate positions for each node in the SVG Graph
 */
function layoutGraph() {
    const commits = Object.values(gitState.commits);
    if (commits.length === 0) return;

    // Track vertical positions (y values) for branches
    const branchTracks = {
        'main': 160,
        'feature/login': 80,
        'develop': 240,
        'hotfix': 40
    };

    let nextTrackY = 100;
    const getTrackY = (branchName) => {
        if (branchTracks[branchName] !== undefined) {
            return branchTracks[branchName];
        }
        // Dynamically assign track Y if new branch
        branchTracks[branchName] = nextTrackY;
        nextTrackY += 60;
        if (nextTrackY === 160) nextTrackY += 60; // Skip center
        return branchTracks[branchName];
    };

    // Calculate depths (x coordinate) using BFS/DFS from root commits
    // Start with root commit (the one with parent = null)
    const roots = commits.filter(c => !c.parentId);
    
    // Assign depth sequentially based on parent relationships
    const visited = new Set();
    const queue = [];
    
    roots.forEach(r => {
        r.depth = 0;
        queue.push(r);
        visited.add(r.id);
    });

    while (queue.length > 0) {
        const curr = queue.shift();
        const children = commits.filter(c => c.parentId === curr.id || c.parent2Id === curr.id);
        
        for (const child of children) {
            if (!visited.has(child.id)) {
                // Depth is parent depth + 1. If merge, use max depth of parents + 1
                let d = curr.depth + 1;
                if (child.parent2Id) {
                    const p1 = gitState.commits[child.parentId];
                    const p2 = gitState.commits[child.parent2Id];
                    if (p1 && p2) {
                        d = Math.max(p1.depth || 0, p2.depth || 0) + 1;
                    }
                }
                child.depth = Math.max(child.depth || 0, d);
                queue.push(child);
                visited.add(child.id);
            }
        }
    }

    // Set X and Y coordinates
    commits.forEach(c => {
        c.x = 60 + (c.depth || 0) * 85;
        c.y = getTrackY(c.branch);
    });

    // Make sure SVG width expands if graph gets long
    if (gitSvg) {
        const maxDepth = Math.max(...commits.map(c => c.depth || 0), 3);
        const requiredWidth = 120 + maxDepth * 85;
        const containerWidth = gitSvg.parentElement.clientWidth;
        gitSvg.setAttribute('width', Math.max(requiredWidth, containerWidth));
    }
}

/**
 * Render the Git Graph using SVGs
 */
function renderGraph() {
    if (!gitSvg) return;

    layoutGraph();

    const linksGroup = document.getElementById('git-links');
    const nodesGroup = document.getElementById('git-nodes');
    const labelsGroup = document.getElementById('git-labels');

    if (!linksGroup || !nodesGroup || !labelsGroup) return;

    // Clear previous elements
    linksGroup.innerHTML = '';
    nodesGroup.innerHTML = '';
    labelsGroup.innerHTML = '';

    const commits = Object.values(gitState.commits);

    // 1. Draw Connection Lines (links)
    commits.forEach(c => {
        const drawLink = (parentId) => {
            const parent = gitState.commits[parentId];
            if (!parent) return;

            const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            const color = BRANCH_COLORS[c.branch] || BRANCH_COLORS.default;
            
            // Draw a nice bezier curve or straight line depending on track
            let dStr;
            if (c.y === parent.y) {
                // Straight line
                dStr = `M ${parent.x} ${parent.y} L ${c.x} ${c.y}`;
            } else {
                // Curved line for branching or merging
                const controlX = parent.x + (c.x - parent.x) / 2;
                dStr = `M ${parent.x} ${parent.y} C ${controlX} ${parent.y}, ${controlX} ${c.y}, ${c.x} ${c.y}`;
            }

            line.setAttribute('d', dStr);
            line.setAttribute('class', 'commit-link');
            line.setAttribute('stroke', color);
            line.setAttribute('marker-end', 'url(#arrow)');
            linksGroup.appendChild(line);
        };

        if (c.parentId) drawLink(c.parentId);
        if (c.parent2Id) drawLink(c.parent2Id);
    });

    // 2. Draw Commit Nodes (Circles)
    commits.forEach(c => {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('class', 'commit-node');
        g.setAttribute('data-id', c.id);
        g.addEventListener('click', () => {
            executeGitCommand(`git checkout ${c.id}`);
        });

        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', c.x);
        circle.setAttribute('cy', c.y);
        circle.setAttribute('r', 14);
        circle.setAttribute('class', 'commit-circle');

        const activeCommitId = gitState.branches[gitState.head] || gitState.head;
        const isActive = activeCommitId === c.id;

        const branchColor = BRANCH_COLORS[c.branch] || BRANCH_COLORS.default;
        circle.setAttribute('fill', '#0b0f19');
        circle.setAttribute('stroke', branchColor);
        if (isActive) {
            circle.setAttribute('fill', branchColor);
            circle.setAttribute('stroke', '#fff');
            circle.setAttribute('r', 16);
        }

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', c.x);
        text.setAttribute('y', c.y + 4);
        text.setAttribute('class', 'commit-text');
        text.setAttribute('fill', isActive ? '#000' : '#fff');
        text.textContent = c.id;

        // Title tooltip for hover
        const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
        title.textContent = `[${c.id}] ${c.message} (${c.branch})`;
        g.appendChild(title);

        g.appendChild(circle);
        g.appendChild(text);
        nodesGroup.appendChild(g);
    });

    // 3. Draw Branch Labels & HEAD pointer
    const labelOffsets = {}; // To prevent labels overlapping on the same node
    
    // List of active branches and HEAD pointing to their targets
    const branchEntries = Object.entries(gitState.branches);
    
    branchEntries.forEach(([branchName, commitId]) => {
        const commit = gitState.commits[commitId];
        if (!commit) return;

        if (!labelOffsets[commitId]) labelOffsets[commitId] = 0;
        const offsetIndex = labelOffsets[commitId];
        labelOffsets[commitId]++;

        const labelX = commit.x;
        const labelY = commit.y + 35 + offsetIndex * 24;

        // Draw arrow link from label to node
        const ptr = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        ptr.setAttribute('x1', labelX);
        ptr.setAttribute('y1', labelY - 10);
        ptr.setAttribute('x2', commit.x);
        ptr.setAttribute('y2', commit.y + 15);
        ptr.setAttribute('class', 'ref-pointer');
        ptr.setAttribute('stroke', BRANCH_COLORS[branchName] || BRANCH_COLORS.default);
        labelsGroup.appendChild(ptr);

        // Label box
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', labelX - 35);
        rect.setAttribute('y', labelY - 10);
        rect.setAttribute('width', 70);
        rect.setAttribute('height', 18);
        rect.setAttribute('class', 'ref-rect');
        rect.setAttribute('rx', '4');
        rect.setAttribute('ry', '4');
        rect.setAttribute('fill', '#161b22');
        rect.setAttribute('stroke', BRANCH_COLORS[branchName] || BRANCH_COLORS.default);
        labelsGroup.appendChild(rect);

        // Label text
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', labelX);
        text.setAttribute('y', labelY + 3);
        text.setAttribute('class', 'ref-text');
        text.setAttribute('fill', '#c9d1d9');
        text.textContent = branchName;
        labelsGroup.appendChild(text);

        // If HEAD points to this branch, draw HEAD tag above it
        if (gitState.head === branchName) {
            const headY = labelY + 20;

            const headPtr = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            headPtr.setAttribute('x1', labelX);
            headPtr.setAttribute('y1', headY - 10);
            headPtr.setAttribute('x2', labelX);
            headPtr.setAttribute('y2', labelY + 8);
            headPtr.setAttribute('class', 'ref-pointer');
            headPtr.setAttribute('stroke', '#ff7b72');
            labelsGroup.appendChild(headPtr);

            const headRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            headRect.setAttribute('x', labelX - 25);
            headRect.setAttribute('y', headY - 10);
            headRect.setAttribute('width', 50);
            headRect.setAttribute('height', 18);
            headRect.setAttribute('class', 'ref-rect');
            headRect.setAttribute('rx', '4');
            headRect.setAttribute('ry', '4');
            headRect.setAttribute('fill', '#161b22');
            headRect.setAttribute('stroke', '#ff7b72');
            labelsGroup.appendChild(headRect);

            const headText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            headText.setAttribute('x', labelX);
            headText.setAttribute('y', headY + 3);
            headText.setAttribute('class', 'ref-text');
            headText.setAttribute('fill', '#ff7b72');
            headText.textContent = 'HEAD';
            labelsGroup.appendChild(headText);
        }
    });

    // If HEAD is detached (points to a specific commit instead of a branch)
    if (!gitState.branches[gitState.head]) {
        const commitId = gitState.head;
        const commit = gitState.commits[commitId];
        if (commit) {
            if (!labelOffsets[commitId]) labelOffsets[commitId] = 0;
            const offsetIndex = labelOffsets[commitId];
            labelOffsets[commitId]++;

            const labelX = commit.x;
            const labelY = commit.y + 35 + offsetIndex * 24;

            // Draw arrow pointer
            const ptr = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            ptr.setAttribute('x1', labelX);
            ptr.setAttribute('y1', labelY - 10);
            ptr.setAttribute('x2', commit.x);
            ptr.setAttribute('y2', commit.y + 15);
            ptr.setAttribute('class', 'ref-pointer');
            ptr.setAttribute('stroke', '#ff7b72');
            labelsGroup.appendChild(ptr);

            // HEAD label box
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', labelX - 45);
            rect.setAttribute('y', labelY - 10);
            rect.setAttribute('width', 90);
            rect.setAttribute('height', 18);
            rect.setAttribute('class', 'ref-rect');
            rect.setAttribute('rx', '4');
            rect.setAttribute('ry', '4');
            rect.setAttribute('fill', '#161b22');
            rect.setAttribute('stroke', '#ff7b72');
            labelsGroup.appendChild(rect);

            // Label text (Detached HEAD)
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', labelX);
            text.setAttribute('y', labelY + 3);
            text.setAttribute('class', 'ref-text');
            text.setAttribute('fill', '#ff7b72');
            text.textContent = 'HEAD (detached)';
            labelsGroup.appendChild(text);
        }
    }
}

/**
 * Execute Git Command logic
 */
function executeGitCommand(commandStr) {
    const trimCmd = commandStr.trim();
    if (!trimCmd) return;

    writeTerminalLine(`<span class="terminal-prompt">visitor@fiae-portfolio:~/git-sandbox$</span> <span class="cmd-echo">${trimCmd}</span>`);

    const parts = trimCmd.split(/\s+/);
    const base = parts[0];

    if (base === 'clear') {
        if (terminalOutput) terminalOutput.innerHTML = '';
        return;
    }

    if (base === 'help') {
        const lang = document.documentElement.getAttribute('lang') || 'de';
        if (lang === 'de') {
            writeSystemLine("Unterstützte Befehle:\n" +
                "  git commit [-m \"Nachricht\"]      - Neuen Commit erstellen\n" +
                "  git branch <name>                 - Neuen Zweig erstellen\n" +
                "  git checkout <name|hash>          - Auf Branch/Commit wechseln\n" +
                "  git checkout -b <name>            - Branch erstellen &amp; aktivieren\n" +
                "  git merge <name>                  - Branch zusammenführen\n" +
                "  git rebase <name>                 - Branch-Historie auf neuen Stand setzen\n" +
                "  git reset --hard <hash>           - Aktuellen Branch zurücksetzen\n" +
                "  git log                           - Commit-Verlauf anzeigen");
        } else {
            writeSystemLine("Supported Commands:\n" +
                "  git commit [-m \"message\"]      - Create new commit\n" +
                "  git branch <name>                 - Create new branch\n" +
                "  git checkout <name|hash>          - Switch to branch/commit\n" +
                "  git checkout -b <name>            - Create &amp; switch branch\n" +
                "  git merge <name>                  - Merge branch\n" +
                "  git rebase <name>                 - Rebase branch timeline\n" +
                "  git reset --hard <hash>           - Reset current branch\n" +
                "  git log                           - Show commit history");
        }
        return;
    }

    if (base !== 'git') {
        writeErrorLine(`Befehl nicht gefunden: '${base}'. Tippe 'help' für eine Befehlsliste.`);
        return;
    }

    const action = parts[1];
    if (!action) {
        writeErrorLine("Unvollständiger Befehl. Tippe 'git' gefolgt von einer Aktion (z. B. 'commit', 'branch').");
        return;
    }

    const targetCommitId = gitState.branches[gitState.head] || gitState.head;

    if (action === 'commit') {
        // Find message if specified
        let msg = 'New commit';
        const msgIdx = trimCmd.indexOf('-m');
        if (msgIdx !== -1) {
            const rawMsg = trimCmd.substring(msgIdx + 2).trim();
            // Remove quotes
            msg = rawMsg.replace(/^['"]|['"]$/g, '');
        }

        const newHash = generateHash();
        const parentCommit = gitState.commits[targetCommitId];
        const newDepth = parentCommit ? (parentCommit.depth + 1) : 0;
        
        // Find active branch name
        const currentBranch = gitState.branches[gitState.head] ? gitState.head : 'detached';

        gitState.commits[newHash] = {
            id: newHash,
            message: msg,
            parentId: targetCommitId,
            parent2Id: null,
            branch: currentBranch === 'detached' ? parentCommit.branch : currentBranch,
            depth: newDepth
        };

        if (currentBranch !== 'detached') {
            gitState.branches[currentBranch] = newHash;
        } else {
            gitState.head = newHash; // move HEAD in detached state
        }

        writeSuccessLine(`[${currentBranch} ${newHash}] ${msg}`);
        playAudio('success');

    } else if (action === 'branch') {
        const branchName = parts[2];
        if (!branchName) {
            writeErrorLine("Branch-Name fehlt. Verwendung: git branch <name>");
            return;
        }
        if (gitState.branches[branchName]) {
            writeErrorLine(`Branch '${branchName}' existiert bereits.`);
            return;
        }

        gitState.branches[branchName] = targetCommitId;
        writeSystemLine(`Branch '${branchName}' erstellt auf Commit ${targetCommitId}.`);

    } else if (action === 'checkout' || action === 'switch') {
        const isBFlag = parts[2] === '-b' || parts[2] === '-c';
        const target = isBFlag ? parts[3] : parts[2];

        if (!target) {
            writeErrorLine("Ziel fehlt. Verwendung: git checkout <branch|hash>");
            return;
        }

        if (isBFlag) {
            // git checkout -b branchName
            if (gitState.branches[target]) {
                writeErrorLine(`Branch '${target}' existiert bereits.`);
                return;
            }
            gitState.branches[target] = targetCommitId;
            gitState.head = target;
            writeSystemLine(`Zweig '${target}' erstellt und aktiviert.`);
        } else {
            // Check if branch name exists
            if (gitState.branches[target]) {
                gitState.head = target;
                writeSystemLine(`Gewechselt zu Branch '${target}'.`);
            } else if (gitState.commits[target]) {
                // Detached HEAD checkout
                gitState.head = target;
                writeSystemLine(`Achtung: Du befindest dich in einem 'Detached HEAD'-Zustand auf Commit ${target}.`);
            } else {
                writeErrorLine(`Branch oder Commit '${target}' nicht gefunden.`);
            }
        }

    } else if (action === 'merge') {
        const sourceBranch = parts[2];
        if (!sourceBranch) {
            writeErrorLine("Quell-Branch fehlt. Verwendung: git merge <branch>");
            return;
        }
        if (!gitState.branches[sourceBranch]) {
            writeErrorLine(`Branch '${sourceBranch}' existiert nicht.`);
            return;
        }

        const currentBranch = gitState.branches[gitState.head] ? gitState.head : null;
        if (!currentBranch) {
            writeErrorLine("Merge im 'Detached HEAD'-Zustand wird nicht unterstützt.");
            return;
        }

        if (currentBranch === sourceBranch) {
            writeErrorLine("Kann einen Branch nicht mit sich selbst mergen.");
            return;
        }

        const sourceCommitId = gitState.branches[sourceBranch];
        if (targetCommitId === sourceCommitId) {
            writeSystemLine("Bereits aktuell (Already up to date).");
            return;
        }

        // Check if fast-forward is possible (currentCommit is ancestor of sourceCommit)
        let isAncestor = false;
        let checkId = sourceCommitId;
        while (checkId) {
            const checkC = gitState.commits[checkId];
            if (checkC && checkC.parentId === targetCommitId) {
                isAncestor = true;
                break;
            }
            checkId = checkC ? checkC.parentId : null;
        }

        if (isAncestor) {
            // Fast-Forward
            gitState.branches[currentBranch] = sourceCommitId;
            writeSystemLine(`Fast-Forward durchgeführt. ${currentBranch} zeigt nun auf Commit ${sourceCommitId}.`);
        } else {
            // Create merge commit
            const newHash = generateHash();
            const parentCommit = gitState.commits[targetCommitId];
            const newDepth = Math.max(parentCommit.depth, gitState.commits[sourceCommitId].depth) + 1;

            gitState.commits[newHash] = {
                id: newHash,
                message: `Merge branch '${sourceBranch}' into ${currentBranch}`,
                parentId: targetCommitId,
                parent2Id: sourceCommitId,
                branch: currentBranch,
                depth: newDepth
            };
            gitState.branches[currentBranch] = newHash;
            writeSuccessLine(`Merge-Commit ${newHash} erstellt. '${sourceBranch}' in '${currentBranch}' integriert.`);
        }
        playAudio('success');

    } else if (action === 'rebase') {
        const baseBranch = parts[2];
        if (!baseBranch) {
            writeErrorLine("Ziel-Branch fehlt. Verwendung: git rebase <branch>");
            return;
        }
        const baseCommitId = gitState.branches[baseBranch];
        if (!baseCommitId) {
            writeErrorLine(`Branch '${baseBranch}' existiert nicht.`);
            return;
        }

        const currentBranch = gitState.branches[gitState.head] ? gitState.head : null;
        if (!currentBranch) {
            writeErrorLine("Rebase im 'Detached HEAD'-Zustand wird nicht unterstützt.");
            return;
        }

        // Rebasing simulation:
        // Find all commits on current branch that are not in target branch
        // For simplicity: copy the commits from current branch and put them after the base commit
        const listToRebase = [];
        let currId = targetCommitId;
        while (currId && currId !== baseCommitId) {
            const currC = gitState.commits[currId];
            if (!currC) break;
            if (currC.branch === currentBranch) {
                listToRebase.unshift(currC);
            }
            currId = currC.parentId;
        }

        if (listToRebase.length === 0) {
            writeSystemLine("Bereits aktuell oder keine Commits zum Rebasing.");
            return;
        }

        let currentBaseId = baseCommitId;
        listToRebase.forEach(c => {
            const newHash = generateHash();
            const parentCommit = gitState.commits[currentBaseId];
            gitState.commits[newHash] = {
                id: newHash,
                message: `${c.message} (rebased)`,
                parentId: currentBaseId,
                parent2Id: null,
                branch: currentBranch,
                depth: parentCommit.depth + 1
            };
            currentBaseId = newHash;
        });

        gitState.branches[currentBranch] = currentBaseId;
        writeSuccessLine(`Erfolgreich rebased und aktualisiert: ref ${currentBranch}.`);
        playAudio('success');

    } else if (action === 'reset') {
        const isHard = parts[2] === '--hard';
        const hash = isHard ? parts[3] : parts[2];

        if (!hash) {
            writeErrorLine("Commit-Hash fehlt. Verwendung: git reset --hard <hash>");
            return;
        }

        if (!gitState.commits[hash]) {
            writeErrorLine(`Commit '${hash}' existiert nicht.`);
            return;
        }

        const currentBranch = gitState.branches[gitState.head] ? gitState.head : null;
        if (currentBranch) {
            gitState.branches[currentBranch] = hash;
            writeSystemLine(`Zweig '${currentBranch}' zeigt nun auf ${hash}.`);
        } else {
            gitState.head = hash;
            writeSystemLine(`HEAD zeigt nun auf ${hash}.`);
        }

    } else if (action === 'log') {
        let currId = targetCommitId;
        const logLines = [];
        while (currId) {
            const commit = gitState.commits[currId];
            if (!commit) break;
            logLines.push(`* <span style="color:var(--accent); font-weight:bold;">${commit.id}</span> - ${commit.message} (${commit.branch})`);
            currId = commit.parentId;
        }
        writeSystemLine(logLines.join('\n') || 'Keine Commits vorhanden.');

    } else {
        writeErrorLine(`Unbekannte Git-Aktion: '${action}'. Tippe 'help' für Infos.`);
    }

    renderGraph();
    checkLevelProgress();
}

/**
 * Handle Level Objectives and check for completions
 */
function handleLevelChange(levelId) {
    currentLevelId = levelId;
    resetGitState();

    const desc = LEVELS[levelId];
    if (!desc) return;

    const lang = document.documentElement.getAttribute('lang') || 'de';
    if (levelDescription) {
        levelDescription.innerHTML = lang === 'de' ? desc.descDe : desc.descEn;
    }

    writeSystemLine(lang === 'de' ? 
        `*** Challenge '${desc.titleDe}' gestartet! ***` : 
        `*** Challenge '${desc.titleEn}' started! ***`
    );
}

function checkLevelProgress() {
    const badge = document.getElementById('level-status-badge');
    const lang = document.documentElement.getAttribute('lang') || 'de';
    if (currentLevelId === 'sandbox') {
        if (badge) badge.innerHTML = '';
        return;
    }
    const currentLvlObj = LEVELS[currentLevelId];
    if (currentLvlObj && currentLvlObj.check()) {
        if (badge) {
            badge.style.color = '#10b981';
            badge.innerHTML = `🏆 ${lang === 'de' ? 'Bestanden' : 'Passed'}`;
        }
        writeSuccessLine(lang === 'de' ? 
            "🎉 Glückwunsch! Du hast die Challenge erfolgreich bestanden." : 
            "🎉 Congratulations! You successfully passed this challenge."
        );
        
        // Trigger Konfetti & Achievement unlock
        triggerConfettiEffect();
        unlockSimulatorAchievement();
    } else {
        if (badge) {
            badge.style.color = '#f97316';
            badge.innerHTML = `⏳ ${lang === 'de' ? 'Offen' : 'Active'}`;
        }
    }
}

function triggerConfettiEffect() {
    if (window.confetti) {
        window.confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.8 }
        });
    }
}

function unlockSimulatorAchievement() {
    // Unlock Konami or custom achievement if achievements module loaded
    import('./modules/achievements.js').then(module => {
        if (module.default && typeof module.default.unlock === 'function') {
            module.default.unlock('konami_master'); // Reuses existing game badge
        } else if (typeof Achievements !== 'undefined') {
            Achievements.unlock('konami_master');
        }
    }).catch(() => {
        if (typeof Achievements !== 'undefined') {
            Achievements.unlock('konami_master');
        }
    });
}

function playAudio(soundId) {
    if (typeof GameAudio !== 'undefined') {
        GameAudio.play(soundId);
    }
}

/**
 * Setup quick actions popup or triggers
 */
function setupQuickActions() {
    document.getElementById('btn-quick-commit').addEventListener('click', () => {
        const msg = prompt('Commit Nachricht:', 'Feat: Add new components') || 'manual commit';
        executeGitCommand(`git commit -m "${msg}"`);
    });

    document.getElementById('btn-quick-branch').addEventListener('click', () => {
        const name = prompt('Neuer Branch-Name:') || '';
        if (name.trim()) {
            executeGitCommand(`git branch ${name.trim()}`);
        }
    });

    document.getElementById('btn-quick-checkout').addEventListener('click', () => {
        const currentBranches = Object.keys(gitState.branches);
        const name = prompt(`Wechseln zu Branch oder Commit (${currentBranches.join(', ')}):`) || '';
        if (name.trim()) {
            executeGitCommand(`git checkout ${name.trim()}`);
        }
    });

    document.getElementById('btn-quick-merge').addEventListener('click', () => {
        const currentBranches = Object.keys(gitState.branches);
        const name = prompt(`Branch hineinmergen (${currentBranches.join(', ')}):`) || '';
        if (name.trim()) {
            executeGitCommand(`git merge ${name.trim()}`);
        }
    });

    document.getElementById('btn-quick-rebase').addEventListener('click', () => {
        const currentBranches = Object.keys(gitState.branches);
        const name = prompt(`Rebase auf welchen Branch? (${currentBranches.join(', ')}):`) || '';
        if (name.trim()) {
            executeGitCommand(`git rebase ${name.trim()}`);
        }
    });

    document.getElementById('reset-sim-btn').addEventListener('click', () => {
        resetGitState();
    });
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
    let commandHistory = [];
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
            executeGitCommand(cmd);
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
            handleLevelChange(e.target.value);
        });
    }

    setupQuickActions();
    resetGitState();

    // Resize listener to adapt SVG width
    window.addEventListener('resize', renderGraph);
}
