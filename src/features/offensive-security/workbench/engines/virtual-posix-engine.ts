import type { TerminalExecutionResult, VfsDirectory, VfsNode, VfsState } from '../types';

export function createDefaultVfs(): VfsDirectory {
  return {
    type: 'dir',
    name: '',
    mode: 0o755,
    owner: 'root',
    group: 'root',
    children: {
      bin: {
        type: 'dir',
        name: 'bin',
        mode: 0o755,
        owner: 'root',
        group: 'root',
        children: {
          bash: {
            type: 'file',
            name: 'bash',
            content: '#!/bin/bash binary',
            mode: 0o755,
            owner: 'root',
            group: 'root',
            size: 1234528,
          },
          cat: {
            type: 'file',
            name: 'cat',
            content: '#!/bin/cat binary',
            mode: 0o755,
            owner: 'root',
            group: 'root',
            size: 43512,
          },
          chmod: {
            type: 'file',
            name: 'chmod',
            content: '#!/bin/chmod binary',
            mode: 0o755,
            owner: 'root',
            group: 'root',
            size: 65400,
          },
          chown: {
            type: 'file',
            name: 'chown',
            content: '#!/bin/chown binary',
            mode: 0o755,
            owner: 'root',
            group: 'root',
            size: 68120,
          },
          grep: {
            type: 'file',
            name: 'grep',
            content: '#!/bin/grep binary',
            mode: 0o755,
            owner: 'root',
            group: 'root',
            size: 154200,
          },
          ls: {
            type: 'file',
            name: 'ls',
            content: '#!/bin/ls binary',
            mode: 0o755,
            owner: 'root',
            group: 'root',
            size: 142800,
          },
          ps: {
            type: 'file',
            name: 'ps',
            content: '#!/bin/ps binary',
            mode: 0o755,
            owner: 'root',
            group: 'root',
            size: 112400,
          },
          su: {
            type: 'file',
            name: 'su',
            content: '#!/bin/su binary',
            mode: 0o4755,
            owner: 'root',
            group: 'root',
            size: 78920,
          }, // SUID
        },
      },
      etc: {
        type: 'dir',
        name: 'etc',
        mode: 0o755,
        owner: 'root',
        group: 'root',
        children: {
          hostname: {
            type: 'file',
            name: 'hostname',
            content: 'sec-target-prod01\n',
            mode: 0o644,
            owner: 'root',
            group: 'root',
          },
          passwd: {
            type: 'file',
            name: 'passwd',
            content:
              'root:x:0:0:root:/root:/bin/bash\n' +
              'daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\n' +
              'www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin\n' +
              'operator:x:1000:1000:Operator User,,,:/home/operator:/bin/bash\n' +
              'auditor:x:1001:1001:Security Auditor:/home/auditor:/bin/bash\n',
            mode: 0o644,
            owner: 'root',
            group: 'root',
          },
          shadow: {
            type: 'file',
            name: 'shadow',
            content:
              'root:$6$aK92jL$zXp94/8vM4L2389.kLmPqz01980vF1:19820:0:99999:7:::\n' +
              'operator:$6$bJ21kQ$98LmnO1029384756lkjhgfdsap:19820:0:99999:7:::\n' +
              'auditor:$6$cL31mR$0192837465alskdjfhgzmxncbv12:19820:0:99999:7:::\n',
            mode: 0o640,
            owner: 'root',
            group: 'shadow',
          },
          sudoers: {
            type: 'file',
            name: 'sudoers',
            content:
              '# /etc/sudoers\nDefaults env_reset\nroot ALL=(ALL:ALL) ALL\n%sudo ALL=(ALL:ALL) ALL\noperator ALL=(ALL) NOPASSWD: /usr/bin/apt, /bin/systemctl status *\n',
            mode: 0o440,
            owner: 'root',
            group: 'root',
          },
        },
      },
      home: {
        type: 'dir',
        name: 'home',
        mode: 0o755,
        owner: 'root',
        group: 'root',
        children: {
          operator: {
            type: 'dir',
            name: 'operator',
            mode: 0o700,
            owner: 'operator',
            group: 'operator',
            children: {
              '.bashrc': {
                type: 'file',
                name: '.bashrc',
                content: 'export PS1="\\u@\\h:\\w\\$ "\nalias ll="ls -la"\n',
                mode: 0o644,
                owner: 'operator',
                group: 'operator',
              },
              'notes.txt': {
                type: 'file',
                name: 'notes.txt',
                content:
                  'Review hardening checklist for PCI-DSS audit before Friday.\nCheck /var/log/auth.log for failed SSH attempts.\n',
                mode: 0o644,
                owner: 'operator',
                group: 'operator',
              },
            },
          },
        },
      },
      var: {
        type: 'dir',
        name: 'var',
        mode: 0o755,
        owner: 'root',
        group: 'root',
        children: {
          log: {
            type: 'dir',
            name: 'log',
            mode: 0o755,
            owner: 'root',
            group: 'root',
            children: {
              'auth.log': {
                type: 'file',
                name: 'auth.log',
                content:
                  'Aug 27 06:12:01 sec-target-prod01 sshd[1421]: Accepted publickey for operator from 10.0.4.15 port 52312 ssh2\n' +
                  'Aug 27 06:14:22 sec-target-prod01 sshd[1456]: Failed password for invalid user admin from 192.168.1.105 port 41202 ssh2\n' +
                  'Aug 27 06:14:25 sec-target-prod01 sshd[1458]: Failed password for invalid user root from 192.168.1.105 port 41208 ssh2\n' +
                  'Aug 27 06:14:30 sec-target-prod01 sshd[1460]: Failed password for invalid user test from 192.168.1.105 port 41214 ssh2\n' +
                  'Aug 27 06:15:02 sec-target-prod01 sudo: operator : TTY=pts/0 ; PWD=/home/operator ; USER=root ; COMMAND=/bin/systemctl status nginx\n',
                mode: 0o640,
                owner: 'root',
                group: 'adm',
              },
              'access.log': {
                type: 'file',
                name: 'access.log',
                content:
                  '192.168.1.105 - - [27/Aug/2026:06:10:12 +0000] "GET /api/v1/health HTTP/1.1" 200 45 "-" "curl/7.88.1"\n' +
                  '192.168.1.105 - - [27/Aug/2026:06:10:15 +0000] "POST /api/v1/login HTTP/1.1" 401 128 "-" "Python-urllib/3.11"\n' +
                  '192.168.1.105 - - [27/Aug/2026:06:10:18 +0000] "GET /admin/debug.php HTTP/1.1" 404 153 "-" "Mozilla/5.0"\n' +
                  '10.0.4.15 - - [27/Aug/2026:06:11:00 +0000] "GET /dashboard HTTP/1.1" 200 4521 "https://corp.local" "Mozilla/5.0"\n' +
                  '10.0.4.15 - - [27/Aug/2026:06:12:05 +0000] "GET /api/user/profile HTTP/1.1" 200 892 "https://corp.local" "Mozilla/5.0"\n',
                mode: 0o644,
                owner: 'www-data',
                group: 'adm',
              },
            },
          },
        },
      },
      tmp: {
        type: 'dir',
        name: 'tmp',
        mode: 0o1777, // Sticky bit
        owner: 'root',
        group: 'root',
        children: {},
      },
    },
  };
}

export function createInitialVfsState(customRoot?: VfsDirectory): VfsState {
  return {
    root: customRoot || createDefaultVfs(),
    cwd: '/home/operator',
    user: {
      uid: 1000,
      gid: 1000,
      username: 'operator',
      groups: ['operator', 'sudo', 'adm'],
    },
    env: {
      USER: 'operator',
      HOME: '/home/operator',
      PATH: '/bin:/usr/bin:/usr/local/bin',
      SHELL: '/bin/bash',
      HOSTNAME: 'sec-target-prod01',
      TERM: 'xterm-256color',
    },
    history: [],
  };
}

function resolvePath(cwd: string, targetPath: string): string[] {
  const parts = targetPath.startsWith('/')
    ? targetPath.split('/').filter(Boolean)
    : [...cwd.split('/').filter(Boolean), ...targetPath.split('/').filter(Boolean)];

  const resolved: string[] = [];
  for (const part of parts) {
    if (part === '.' || part === '') continue;
    if (part === '..') {
      resolved.pop();
    } else {
      resolved.push(part);
    }
  }
  return resolved;
}

function getNode(root: VfsDirectory, pathParts: string[]): VfsNode | null {
  let current: VfsNode = root;
  for (const part of pathParts) {
    if (current.type !== 'dir') return null;
    const nextNode: VfsNode | undefined = current.children[part];
    if (!nextNode) return null;
    current = nextNode;
  }
  return current;
}

function formatMode(mode: number, isDir: boolean): string {
  const fileType = isDir ? 'd' : '-';
  const hasSuid = (mode & 0o4000) !== 0;
  const hasSgid = (mode & 0o2000) !== 0;
  const hasSticky = (mode & 0o1000) !== 0;

  const uR = mode & 0o400 ? 'r' : '-';
  const uW = mode & 0o200 ? 'w' : '-';
  let uX = mode & 0o100 ? 'x' : '-';
  if (hasSuid) uX = uX === 'x' ? 's' : 'S';

  const gR = mode & 0o040 ? 'r' : '-';
  const gW = mode & 0o020 ? 'w' : '-';
  let gX = mode & 0o010 ? 'x' : '-';
  if (hasSgid) gX = gX === 'x' ? 's' : 'S';

  const oR = mode & 0o004 ? 'r' : '-';
  const oW = mode & 0o002 ? 'w' : '-';
  let oX = mode & 0o001 ? 'x' : '-';
  if (hasSticky) oX = oX === 'x' ? 't' : 'T';

  return `${fileType}${uR}${uW}${uX}${gR}${gW}${gX}${oR}${oW}${oX}`;
}

export function executeBashCommand(
  inputLine: string,
  state: VfsState
): TerminalExecutionResult {
  const trimmed = inputLine.trim();
  if (!trimmed) {
    return { stdout: '', stderr: '', exitCode: 0, updatedState: state };
  }

  // Clone state
  const nextState: VfsState = {
    ...state,
    root: JSON.parse(JSON.stringify(state.root)),
    history: [...state.history, trimmed],
    env: { ...state.env },
  };

  // Handle command chaining: cmd1 && cmd2 || cmd3
  if (trimmed.includes(' && ')) {
    const parts = trimmed.split(' && ');
    let currentOut = '';
    let curState = nextState;
    for (const part of parts) {
      const res = executeBashCommand(part, curState);
      currentOut += res.stdout;
      curState = res.updatedState;
      if (res.exitCode !== 0) {
        return {
          stdout: currentOut,
          stderr: res.stderr,
          exitCode: res.exitCode,
          updatedState: curState,
        };
      }
    }
    return { stdout: currentOut, stderr: '', exitCode: 0, updatedState: curState };
  }

  // Handle pipe: cmd1 | cmd2
  if (trimmed.includes(' | ')) {
    const pipeCommands = trimmed.split(' | ');
    let pipeInput = '';
    let curState = nextState;
    let lastExit = 0;
    for (let i = 0; i < pipeCommands.length; i++) {
      const subCmd = pipeCommands[i].trim();
      const res = executeSingleCommand(subCmd, curState, pipeInput);
      pipeInput = res.stdout;
      curState = res.updatedState;
      lastExit = res.exitCode;
      if (lastExit !== 0) {
        return {
          stdout: res.stdout,
          stderr: res.stderr,
          exitCode: lastExit,
          updatedState: curState,
        };
      }
    }
    return { stdout: pipeInput, stderr: '', exitCode: 0, updatedState: curState };
  }

  // Handle redirection: cmd > file or cmd >> file
  const redirectAppendMatch = trimmed.match(/^(.*?)\s*>>\s*(.*?)$/);
  const redirectOverwriteMatch = trimmed.match(/^(.*?)\s*>\s*(.*?)$/);

  if (redirectAppendMatch || redirectOverwriteMatch) {
    const isAppend = !!redirectAppendMatch;
    const rawCmd = isAppend ? redirectAppendMatch![1] : redirectOverwriteMatch![1];
    const targetFile = (
      isAppend ? redirectAppendMatch![2] : redirectOverwriteMatch![2]
    ).trim();

    const cmdRes = executeBashCommand(rawCmd, nextState);
    if (cmdRes.exitCode !== 0) return cmdRes;

    const pathParts = resolvePath(cmdRes.updatedState.cwd, targetFile);
    const fileName = pathParts.pop();
    if (!fileName) {
      return {
        stdout: '',
        stderr: 'bash: syntax error near unexpected token `newline`\n',
        exitCode: 2,
        updatedState: nextState,
      };
    }

    const parentNode = getNode(cmdRes.updatedState.root, pathParts);
    if (!parentNode || parentNode.type !== 'dir') {
      return {
        stdout: '',
        stderr: `bash: ${targetFile}: No such file or directory\n`,
        exitCode: 1,
        updatedState: nextState,
      };
    }

    const existing = parentNode.children[fileName];
    if (existing && existing.type === 'dir') {
      return {
        stdout: '',
        stderr: `bash: ${targetFile}: Is a directory\n`,
        exitCode: 1,
        updatedState: nextState,
      };
    }

    const existingContent = existing && existing.type === 'file' ? existing.content : '';
    const newContent =
      isAppend && existing ? existingContent + cmdRes.stdout : cmdRes.stdout;
    parentNode.children[fileName] = {
      type: 'file',
      name: fileName,
      content: newContent,
      mode: existing ? existing.mode : 0o644,
      owner: nextState.user.username,
      group: nextState.user.username,
      size: newContent.length,
      mtime: new Date().toISOString(),
    };

    return { stdout: '', stderr: '', exitCode: 0, updatedState: cmdRes.updatedState };
  }

  return executeSingleCommand(trimmed, nextState, '');
}

function executeSingleCommand(
  rawCmd: string,
  state: VfsState,
  stdinData: string
): TerminalExecutionResult {
  const args = rawCmd.split(/\s+/).filter(Boolean);
  const cmd = args[0];

  switch (cmd) {
    case 'pwd': {
      return { stdout: `${state.cwd}\n`, stderr: '', exitCode: 0, updatedState: state };
    }

    case 'whoami': {
      return {
        stdout: `${state.user.username}\n`,
        stderr: '',
        exitCode: 0,
        updatedState: state,
      };
    }

    case 'id': {
      const u = state.user;
      const groupsStr = u.groups.map((g, i) => `${1000 + i}(${g})`).join(',');
      return {
        stdout: `uid=${u.uid}(${u.username}) gid=${u.gid}(${u.username}) groups=${groupsStr}\n`,
        stderr: '',
        exitCode: 0,
        updatedState: state,
      };
    }

    case 'cd': {
      const target = args[1] || '/home/' + state.user.username;
      const resolved = resolvePath(state.cwd, target);
      const node = getNode(state.root, resolved);
      if (!node) {
        return {
          stdout: '',
          stderr: `bash: cd: ${target}: No such file or directory\n`,
          exitCode: 1,
          updatedState: state,
        };
      }
      if (node.type !== 'dir') {
        return {
          stdout: '',
          stderr: `bash: cd: ${target}: Not a directory\n`,
          exitCode: 1,
          updatedState: state,
        };
      }
      const newCwd = '/' + resolved.join('/');
      return {
        stdout: '',
        stderr: '',
        exitCode: 0,
        updatedState: { ...state, cwd: newCwd },
      };
    }

    case 'ls': {
      let showAll = false;
      let showLong = false;
      const targets: string[] = [];

      for (let i = 1; i < args.length; i++) {
        const arg = args[i];
        if (arg.startsWith('-')) {
          if (arg.includes('a')) showAll = true;
          if (arg.includes('l')) showLong = true;
        } else {
          targets.push(arg);
        }
      }

      const targetPath = targets[0] || '.';
      const resolved = resolvePath(state.cwd, targetPath);
      const node = getNode(state.root, resolved);

      if (!node) {
        return {
          stdout: '',
          stderr: `ls: cannot access '${targetPath}': No such file or directory\n`,
          exitCode: 2,
          updatedState: state,
        };
      }

      if (node.type === 'file') {
        const line = showLong
          ? `${formatMode(node.mode, false)} 1 ${node.owner} ${node.group} ${node.size || node.content.length} Aug 27 06:00 ${node.name}\n`
          : `${node.name}\n`;
        return { stdout: line, stderr: '', exitCode: 0, updatedState: state };
      }

      const childrenKeys = Object.keys(node.children).sort();
      let out = '';
      if (showLong) {
        out += `total ${childrenKeys.length * 4}\n`;
        if (showAll) {
          out += `drwxr-xr-x 2 ${node.owner} ${node.group} 4096 Aug 27 06:00 .\n`;
          out += `drwxr-xr-x 4 root root 4096 Aug 27 06:00 ..\n`;
        }
        for (const k of childrenKeys) {
          if (!showAll && k.startsWith('.')) continue;
          const child = node.children[k];
          const isDir = child.type === 'dir';
          const modeStr = formatMode(child.mode, isDir);
          const size = isDir ? 4096 : child.size || child.content.length;
          out += `${modeStr} 1 ${child.owner} ${child.group} ${String(size).padStart(6, ' ')} Aug 27 06:00 ${child.name}\n`;
        }
      } else {
        const names: string[] = [];
        if (showAll) {
          names.push('.', '..');
        }
        for (const k of childrenKeys) {
          if (!showAll && k.startsWith('.')) continue;
          names.push(k);
        }
        out = names.join('  ') + (names.length ? '\n' : '');
      }

      return { stdout: out, stderr: '', exitCode: 0, updatedState: state };
    }

    case 'cat': {
      if (args.length === 1 && stdinData) {
        return { stdout: stdinData, stderr: '', exitCode: 0, updatedState: state };
      }
      const target = args[1];
      if (!target) {
        return {
          stdout: '',
          stderr: 'cat: missing operand\n',
          exitCode: 1,
          updatedState: state,
        };
      }
      const resolved = resolvePath(state.cwd, target);
      const node = getNode(state.root, resolved);
      if (!node) {
        return {
          stdout: '',
          stderr: `cat: ${target}: No such file or directory\n`,
          exitCode: 1,
          updatedState: state,
        };
      }
      if (node.type === 'dir') {
        return {
          stdout: '',
          stderr: `cat: ${target}: Is a directory\n`,
          exitCode: 1,
          updatedState: state,
        };
      }
      return { stdout: node.content, stderr: '', exitCode: 0, updatedState: state };
    }

    case 'chmod': {
      if (args.length < 3) {
        return {
          stdout: '',
          stderr: 'chmod: missing operand\n',
          exitCode: 1,
          updatedState: state,
        };
      }
      const modeStr = args[1];
      const target = args[2];
      const resolved = resolvePath(state.cwd, target);
      const node = getNode(state.root, resolved);

      if (!node) {
        return {
          stdout: '',
          stderr: `chmod: cannot access '${target}': No such file or directory\n`,
          exitCode: 1,
          updatedState: state,
        };
      }

      // Support octal: 600, 755, 4755, 644
      const octalMatch = modeStr.match(/^[0-7]{3,4}$/);
      if (octalMatch) {
        node.mode = parseInt(modeStr, 8);
        return { stdout: '', stderr: '', exitCode: 0, updatedState: state };
      }

      // Support symbolic: +x, -w, u+s
      if (modeStr === '+x' || modeStr === 'a+x') {
        node.mode |= 0o111;
      } else if (modeStr === '-w') {
        node.mode &= ~0o222;
      } else if (modeStr === 'u+s') {
        node.mode |= 0o4000;
      } else if (modeStr === 'u-s') {
        node.mode &= ~0o4000;
      } else {
        return {
          stdout: '',
          stderr: `chmod: invalid mode: '${modeStr}'\n`,
          exitCode: 1,
          updatedState: state,
        };
      }

      return { stdout: '', stderr: '', exitCode: 0, updatedState: state };
    }

    case 'chown': {
      if (args.length < 3) {
        return {
          stdout: '',
          stderr: 'chown: missing operand\n',
          exitCode: 1,
          updatedState: state,
        };
      }
      const [newOwner, newGroup] = args[1].split(':');
      const target = args[2];
      const resolved = resolvePath(state.cwd, target);
      const node = getNode(state.root, resolved);
      if (!node) {
        return {
          stdout: '',
          stderr: `chown: cannot access '${target}': No such file or directory\n`,
          exitCode: 1,
          updatedState: state,
        };
      }
      if (newOwner) node.owner = newOwner;
      if (newGroup) node.group = newGroup;
      return { stdout: '', stderr: '', exitCode: 0, updatedState: state };
    }

    case 'grep': {
      let ignoreCase = false;
      let invert = false;
      let showLineNum = false;
      let pattern = '';
      let fileArg = '';

      for (let i = 1; i < args.length; i++) {
        const a = args[i];
        if (a.startsWith('-')) {
          if (a.includes('i')) ignoreCase = true;
          if (a.includes('v')) invert = true;
          if (a.includes('n')) showLineNum = true;
        } else if (!pattern) {
          pattern = a.replace(/^['"](.*)['"]$/, '$1');
        } else {
          fileArg = a;
        }
      }

      let content = stdinData;
      if (fileArg) {
        const resolved = resolvePath(state.cwd, fileArg);
        const node = getNode(state.root, resolved);
        if (!node) {
          return {
            stdout: '',
            stderr: `grep: ${fileArg}: No such file or directory\n`,
            exitCode: 2,
            updatedState: state,
          };
        }
        if (node.type === 'dir') {
          return {
            stdout: '',
            stderr: `grep: ${fileArg}: Is a directory\n`,
            exitCode: 2,
            updatedState: state,
          };
        }
        content = node.content;
      }

      if (!pattern) {
        return {
          stdout: '',
          stderr: 'grep: missing pattern\n',
          exitCode: 2,
          updatedState: state,
        };
      }

      const regex = new RegExp(pattern, ignoreCase ? 'i' : '');
      const lines = content.split('\n');
      const matched: string[] = [];

      for (let idx = 0; idx < lines.length; idx++) {
        const line = lines[idx];
        if (!line && idx === lines.length - 1) continue;
        const matches = regex.test(line);
        if ((matches && !invert) || (!matches && invert)) {
          matched.push(showLineNum ? `${idx + 1}:${line}` : line);
        }
      }

      return {
        stdout: matched.length > 0 ? matched.join('\n') + '\n' : '',
        stderr: '',
        exitCode: matched.length > 0 ? 0 : 1,
        updatedState: state,
      };
    }

    case 'awk': {
      // Basic awk field extractor support: awk '{print $1}' or awk -F: '{print $1}'
      let delimiter = /\s+/;
      let program = '';
      for (let i = 1; i < args.length; i++) {
        if (args[i] === '-F' && args[i + 1]) {
          delimiter = new RegExp(args[i + 1]);
          i++;
        } else if (args[i].startsWith('-F')) {
          delimiter = new RegExp(args[i].slice(2));
        } else if (!program) {
          program = args[i].replace(/^['"](.*)['"]$/, '$1');
        }
      }

      const content = stdinData;
      const lines = content.split('\n').filter(Boolean);
      const printMatch = program.match(/print\s+(\$[0-9]+)/);
      const fieldIdx = printMatch ? parseInt(printMatch[1].replace('$', ''), 10) : 0;

      const out = lines
        .map((line) => {
          if (fieldIdx === 0) return line;
          const fields = line.split(delimiter);
          return fields[fieldIdx - 1] || '';
        })
        .join('\n');

      return {
        stdout: out ? out + '\n' : '',
        stderr: '',
        exitCode: 0,
        updatedState: state,
      };
    }

    case 'find': {
      // find / -perm -4000 or find . -name "*.log"
      const pathArg = args[1] || '.';
      let permCheck: number | null = null;
      let nameCheck: RegExp | null = null;

      for (let i = 2; i < args.length; i++) {
        if (args[i] === '-perm' && args[i + 1]) {
          const p = args[i + 1];
          if (p.startsWith('-')) {
            permCheck = parseInt(p.slice(1), 8);
          } else {
            permCheck = parseInt(p, 8);
          }
          i++;
        } else if (args[i] === '-name' && args[i + 1]) {
          const pattern = args[i + 1].replace(/\*/g, '.*');
          nameCheck = new RegExp(`^${pattern}$`);
          i++;
        }
      }

      const resolved = resolvePath(state.cwd, pathArg);
      const startNode = getNode(state.root, resolved);
      if (!startNode) {
        return {
          stdout: '',
          stderr: `find: '${pathArg}': No such file or directory\n`,
          exitCode: 1,
          updatedState: state,
        };
      }

      const results: string[] = [];
      function walk(n: VfsNode, currentPath: string) {
        let matches = true;
        if (permCheck !== null) {
          if ((n.mode & permCheck) !== permCheck) matches = false;
        }
        if (nameCheck !== null) {
          if (!nameCheck.test(n.name)) matches = false;
        }
        if (matches && currentPath) {
          results.push(currentPath);
        }
        if (n.type === 'dir') {
          for (const k of Object.keys(n.children)) {
            walk(n.children[k], `${currentPath}/${k}`.replace(/\/+/g, '/'));
          }
        }
      }

      const basePath = pathArg.startsWith('/')
        ? pathArg
        : (state.cwd === '/' ? '' : state.cwd) + '/' + pathArg;
      walk(startNode, basePath.replace(/\/+/g, '/'));

      return {
        stdout: results.join('\n') + (results.length ? '\n' : ''),
        stderr: '',
        exitCode: 0,
        updatedState: state,
      };
    }

    case 'ps': {
      const out =
        'USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND\n' +
        'root         1  0.0  0.1  22580  9412 ?        Ss   05:59   0:01 /sbin/init\n' +
        'root       341  0.0  0.2  41280 12500 ?        Ss   06:00   0:00 /usr/sbin/sshd -D\n' +
        'www-data   890  0.0  0.4  89200 24100 ?        S    06:05   0:02 nginx: worker process\n' +
        'operator  1421  0.0  0.1  14200  4200 pts/0    Ss   06:12   0:00 -bash\n' +
        'root      2310  0.0  0.0   9800  1200 ?        S    06:14   0:00 /tmp/.hidden_miner -c 4\n';
      return { stdout: out, stderr: '', exitCode: 0, updatedState: state };
    }

    case 'echo': {
      const msg = args
        .slice(1)
        .join(' ')
        .replace(/^['"](.*)['"]$/, '$1');
      return { stdout: `${msg}\n`, stderr: '', exitCode: 0, updatedState: state };
    }

    case 'base64': {
      if (args[1] === '-d') {
        const text = stdinData || (args[2] ? args[2] : '');
        try {
          const decoded = atob(text.trim());
          return { stdout: decoded, stderr: '', exitCode: 0, updatedState: state };
        } catch {
          return {
            stdout: '',
            stderr: 'base64: invalid input\n',
            exitCode: 1,
            updatedState: state,
          };
        }
      }
      const text = stdinData || args.slice(1).join(' ');
      const encoded = btoa(text);
      return { stdout: encoded + '\n', stderr: '', exitCode: 0, updatedState: state };
    }

    case 'curl': {
      const _url =
        args.find((a) => a.startsWith('http://') || a.startsWith('https://')) ||
        'http://localhost:8080';
      const isHead = args.includes('-I') || args.includes('--head');
      if (isHead) {
        const headerRes =
          'HTTP/1.1 200 OK\r\n' +
          'Server: nginx/1.24.0 (Ubuntu)\r\n' +
          'Date: Thu, 27 Aug 2026 06:30:00 GMT\r\n' +
          'Content-Type: application/json; charset=utf-8\r\n' +
          'Content-Length: 48\r\n' +
          'X-Powered-By: Express\r\n' +
          'Access-Control-Allow-Origin: *\r\n' +
          'Connection: keep-alive\r\n\r\n';
        return { stdout: headerRes, stderr: '', exitCode: 0, updatedState: state };
      }
      return {
        stdout: '{"status":"healthy","version":"1.4.2","environment":"production"}\n',
        stderr: '',
        exitCode: 0,
        updatedState: state,
      };
    }

    case 'clear': {
      return { stdout: '\x1b[2J\x1b[H', stderr: '', exitCode: 0, updatedState: state };
    }

    case 'help': {
      const helpMsg =
        'Supported POSIX commands in this Web Workbench:\n' +
        '  ls, cd, pwd, cat, chmod, chown, grep, awk, find, ps, echo, base64, curl, clear\n' +
        '  Pipes (|), redirects (>, >>), and chaining (&&) are fully supported.\n';
      return { stdout: helpMsg, stderr: '', exitCode: 0, updatedState: state };
    }

    default: {
      return {
        stdout: '',
        stderr: `bash: ${cmd}: command not found. Type 'help' for available commands.\n`,
        exitCode: 127,
        updatedState: state,
      };
    }
  }
}
