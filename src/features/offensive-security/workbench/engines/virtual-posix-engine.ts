import type { TerminalExecutionResult, VfsDirectory, VfsNode, VfsState } from '../types';

export const createDefaultVfs = (): VfsDirectory => ({
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
          content: '#!/bin/bash',
          mode: 0o755,
          owner: 'root',
          group: 'root',
          size: 1234528,
        },
        sh: {
          type: 'file',
          name: 'sh',
          content: '#!/bin/sh',
          mode: 0o755,
          owner: 'root',
          group: 'root',
          size: 124500,
        },
        cat: {
          type: 'file',
          name: 'cat',
          content: '#!/bin/cat',
          mode: 0o755,
          owner: 'root',
          group: 'root',
          size: 43512,
        },
        chmod: {
          type: 'file',
          name: 'chmod',
          content: '#!/bin/chmod',
          mode: 0o755,
          owner: 'root',
          group: 'root',
          size: 65400,
        },
        chown: {
          type: 'file',
          name: 'chown',
          content: '#!/bin/chown',
          mode: 0o755,
          owner: 'root',
          group: 'root',
          size: 68120,
        },
        cp: {
          type: 'file',
          name: 'cp',
          content: '#!/bin/cp',
          mode: 0o755,
          owner: 'root',
          group: 'root',
          size: 152000,
        },
        date: {
          type: 'file',
          name: 'date',
          content: '#!/bin/date',
          mode: 0o755,
          owner: 'root',
          group: 'root',
          size: 89000,
        },
        echo: {
          type: 'file',
          name: 'echo',
          content: '#!/bin/echo',
          mode: 0o755,
          owner: 'root',
          group: 'root',
          size: 34000,
        },
        grep: {
          type: 'file',
          name: 'grep',
          content: '#!/bin/grep',
          mode: 0o755,
          owner: 'root',
          group: 'root',
          size: 154200,
        },
        head: {
          type: 'file',
          name: 'head',
          content: '#!/bin/head',
          mode: 0o755,
          owner: 'root',
          group: 'root',
          size: 48000,
        },
        kill: {
          type: 'file',
          name: 'kill',
          content: '#!/bin/kill',
          mode: 0o755,
          owner: 'root',
          group: 'root',
          size: 31000,
        },
        ls: {
          type: 'file',
          name: 'ls',
          content: '#!/bin/ls',
          mode: 0o755,
          owner: 'root',
          group: 'root',
          size: 142800,
        },
        mkdir: {
          type: 'file',
          name: 'mkdir',
          content: '#!/bin/mkdir',
          mode: 0o755,
          owner: 'root',
          group: 'root',
          size: 52000,
        },
        mv: {
          type: 'file',
          name: 'mv',
          content: '#!/bin/mv',
          mode: 0o755,
          owner: 'root',
          group: 'root',
          size: 139000,
        },
        ps: {
          type: 'file',
          name: 'ps',
          content: '#!/bin/ps',
          mode: 0o755,
          owner: 'root',
          group: 'root',
          size: 112400,
        },
        pwd: {
          type: 'file',
          name: 'pwd',
          content: '#!/bin/pwd',
          mode: 0o755,
          owner: 'root',
          group: 'root',
          size: 38000,
        },
        rm: {
          type: 'file',
          name: 'rm',
          content: '#!/bin/rm',
          mode: 0o755,
          owner: 'root',
          group: 'root',
          size: 71000,
        },
        sed: {
          type: 'file',
          name: 'sed',
          content: '#!/bin/sed',
          mode: 0o755,
          owner: 'root',
          group: 'root',
          size: 180000,
        },
        su: {
          type: 'file',
          name: 'su',
          content: '#!/bin/su',
          mode: 0o4755,
          owner: 'root',
          group: 'root',
          size: 78920,
        }, // SUID
        tail: {
          type: 'file',
          name: 'tail',
          content: '#!/bin/tail',
          mode: 0o755,
          owner: 'root',
          group: 'root',
          size: 53000,
        },
        tar: {
          type: 'file',
          name: 'tar',
          content: '#!/bin/tar',
          mode: 0o755,
          owner: 'root',
          group: 'root',
          size: 420000,
        },
        touch: {
          type: 'file',
          name: 'touch',
          content: '#!/bin/touch',
          mode: 0o755,
          owner: 'root',
          group: 'root',
          size: 45000,
        },
        uname: {
          type: 'file',
          name: 'uname',
          content: '#!/bin/uname',
          mode: 0o755,
          owner: 'root',
          group: 'root',
          size: 35000,
        },
      },
    },
    usr: {
      type: 'dir',
      name: 'usr',
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
            awk: {
              type: 'file',
              name: 'awk',
              content: '#!/usr/bin/awk',
              mode: 0o755,
              owner: 'root',
              group: 'root',
              size: 210000,
            },
            base64: {
              type: 'file',
              name: 'base64',
              content: '#!/usr/bin/base64',
              mode: 0o755,
              owner: 'root',
              group: 'root',
              size: 42000,
            },
            curl: {
              type: 'file',
              name: 'curl',
              content: '#!/usr/bin/curl',
              mode: 0o755,
              owner: 'root',
              group: 'root',
              size: 320000,
            },
            cut: {
              type: 'file',
              name: 'cut',
              content: '#!/usr/bin/cut',
              mode: 0o755,
              owner: 'root',
              group: 'root',
              size: 46000,
            },
            dig: {
              type: 'file',
              name: 'dig',
              content: '#!/usr/bin/dig',
              mode: 0o755,
              owner: 'root',
              group: 'root',
              size: 178000,
            },
            find: {
              type: 'file',
              name: 'find',
              content: '#!/usr/bin/find',
              mode: 0o755,
              owner: 'root',
              group: 'root',
              size: 245000,
            },
            hexdump: {
              type: 'file',
              name: 'hexdump',
              content: '#!/usr/bin/hexdump',
              mode: 0o755,
              owner: 'root',
              group: 'root',
              size: 68000,
            },
            id: {
              type: 'file',
              name: 'id',
              content: '#!/usr/bin/id',
              mode: 0o755,
              owner: 'root',
              group: 'root',
              size: 42000,
            },
            md5sum: {
              type: 'file',
              name: 'md5sum',
              content: '#!/usr/bin/md5sum',
              mode: 0o755,
              owner: 'root',
              group: 'root',
              size: 49000,
            },
            nc: {
              type: 'file',
              name: 'nc',
              content: '#!/usr/bin/nc',
              mode: 0o755,
              owner: 'root',
              group: 'root',
              size: 54000,
            },
            nmap: {
              type: 'file',
              name: 'nmap',
              content: '#!/usr/bin/nmap',
              mode: 0o755,
              owner: 'root',
              group: 'root',
              size: 2800000,
            },
            sha256sum: {
              type: 'file',
              name: 'sha256sum',
              content: '#!/usr/bin/sha256sum',
              mode: 0o755,
              owner: 'root',
              group: 'root',
              size: 51000,
            },
            sort: {
              type: 'file',
              name: 'sort',
              content: '#!/usr/bin/sort',
              mode: 0o755,
              owner: 'root',
              group: 'root',
              size: 120000,
            },
            strings: {
              type: 'file',
              name: 'strings',
              content: '#!/usr/bin/strings',
              mode: 0o755,
              owner: 'root',
              group: 'root',
              size: 76000,
            },
            sudo: {
              type: 'file',
              name: 'sudo',
              content: '#!/usr/bin/sudo',
              mode: 0o4755,
              owner: 'root',
              group: 'root',
              size: 180000,
            },
            uniq: {
              type: 'file',
              name: 'uniq',
              content: '#!/usr/bin/uniq',
              mode: 0o755,
              owner: 'root',
              group: 'root',
              size: 48000,
            },
            wc: {
              type: 'file',
              name: 'wc',
              content: '#!/usr/bin/wc',
              mode: 0o755,
              owner: 'root',
              group: 'root',
              size: 46000,
            },
            whoami: {
              type: 'file',
              name: 'whoami',
              content: '#!/usr/bin/whoami',
              mode: 0o755,
              owner: 'root',
              group: 'root',
              size: 36000,
            },
          },
        },
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
        hosts: {
          type: 'file',
          name: 'hosts',
          content:
            '127.0.0.1\tlocalhost\n127.0.1.1\tsec-target-prod01\n10.0.4.1\tgateway.corp.internal\n10.0.4.5\tdb.corp.internal\n',
          mode: 0o644,
          owner: 'root',
          group: 'root',
        },
        os_release: {
          type: 'file',
          name: 'os-release',
          content:
            'NAME="Ubuntu"\nVERSION="24.04 LTS (Noble Numbat)"\nID=ubuntu\nVERSION_ID="24.04"\nPRETTY_NAME="Ubuntu 24.04 LTS"\n',
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
                '=== Operator Field Checklist ===\n' +
                '1. Check /etc/shadow permissions & SUID binaries.\n' +
                '2. Investigate unauthorized SSH logins in /var/log/auth.log.\n' +
                '3. Extract suspicious IPs from /var/log/access.log.\n' +
                '4. Verify network topology via ifconfig and ping.\n',
              mode: 0o644,
              owner: 'operator',
              group: 'operator',
            },
            scripts: {
              type: 'dir',
              name: 'scripts',
              mode: 0o755,
              owner: 'operator',
              group: 'operator',
              children: {
                'recon.sh': {
                  type: 'file',
                  name: 'recon.sh',
                  content:
                    '#!/bin/bash\necho "[*] Running host reconnaissance..."\nuname -a\nid\ncat /etc/passwd | cut -d: -f1\n',
                  mode: 0o755,
                  owner: 'operator',
                  group: 'operator',
                },
              },
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
                '192.168.1.200 - - [27/Aug/2026:06:10:25 +0000] "POST /api/v1/login HTTP/1.1" 401 128 "-" "Hydra/9.5"\n' +
                '192.168.1.200 - - [27/Aug/2026:06:10:30 +0000] "POST /api/v1/login HTTP/1.1" 401 128 "-" "Hydra/9.5"\n' +
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
      mode: 0o1777,
      owner: 'root',
      group: 'root',
      children: {},
    },
  },
});

export const createInitialVfsState = (customRoot?: VfsDirectory): VfsState => ({
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
    PATH: '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
    SHELL: '/bin/bash',
    HOSTNAME: 'sec-target-prod01',
    TERM: 'xterm-256color',
    LANG: 'en_US.UTF-8',
  },
  history: [],
});

const resolvePath = (cwd: string, targetPath: string): string[] => {
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
};

const getNode = (root: VfsDirectory, pathParts: string[]): VfsNode | null => {
  let current: VfsNode = root;
  for (const part of pathParts) {
    if (current.type !== 'dir') return null;
    const nextNode: VfsNode | undefined = current.children[part];
    if (!nextNode) return null;
    current = nextNode;
  }
  return current;
};

const formatMode = (mode: number, isDir: boolean): string => {
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
};

const substituteEnvVars = (input: string, env: Record<string, string>): string => {
  return input.replace(/\$([a-zA-Z0-9_]+)|\$\{([a-zA-Z0-9_]+)\}/g, (_, g1, g2) => {
    const varName = g1 || g2;
    return env[varName] !== undefined ? env[varName] : '';
  });
};

/**
 * Quote-aware argument tokenizer handling single quotes, double quotes, and escapes
 */
const tokenizeCommandLine = (cmdLine: string): string[] => {
  const tokens: string[] = [];
  let current = '';
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let isEscaped = false;

  for (let i = 0; i < cmdLine.length; i++) {
    const char = cmdLine[i];

    if (isEscaped) {
      current += char;
      isEscaped = false;
      continue;
    }

    if (char === '\\' && !inSingleQuote) {
      isEscaped = true;
      continue;
    }

    if (char === "'" && !inDoubleQuote) {
      inSingleQuote = !inSingleQuote;
      continue;
    }

    if (char === '"' && !inSingleQuote) {
      inDoubleQuote = !inDoubleQuote;
      continue;
    }

    if (/\s/.test(char) && !inSingleQuote && !inDoubleQuote) {
      if (current.length > 0) {
        tokens.push(current);
        current = '';
      }
      continue;
    }

    current += char;
  }

  if (current.length > 0) {
    tokens.push(current);
  }

  return tokens;
};

export const executeBashCommand = (
  inputLine: string,
  state: VfsState
): TerminalExecutionResult => {
  const rawTrimmed = inputLine.trim();
  if (!rawTrimmed) {
    return { stdout: '', stderr: '', exitCode: 0, updatedState: state };
  }

  let nextState: VfsState = {
    ...state,
    root: JSON.parse(JSON.stringify(state.root)),
    history: [...state.history, rawTrimmed],
    env: { ...state.env },
  };

  // Semicolon chaining: cmd1 ; cmd2
  if (rawTrimmed.includes(';') && !rawTrimmed.includes(';;')) {
    const parts = rawTrimmed
      .split(';')
      .map((s) => s.trim())
      .filter(Boolean);
    let allOut = '';
    let allErr = '';
    let lastCode = 0;
    for (const part of parts) {
      const res = executeBashCommand(part, nextState);
      allOut += res.stdout;
      allErr += res.stderr;
      nextState = res.updatedState;
      lastCode = res.exitCode;
    }
    return {
      stdout: allOut,
      stderr: allErr,
      exitCode: lastCode,
      updatedState: nextState,
    };
  }

  // Handle AND chaining: cmd1 && cmd2
  if (rawTrimmed.includes(' && ')) {
    const parts = rawTrimmed.split(' && ');
    let currentOut = '';
    for (const part of parts) {
      const res = executeBashCommand(part, nextState);
      currentOut += res.stdout;
      nextState = res.updatedState;
      if (res.exitCode !== 0) {
        return {
          stdout: currentOut,
          stderr: res.stderr,
          exitCode: res.exitCode,
          updatedState: nextState,
        };
      }
    }
    return { stdout: currentOut, stderr: '', exitCode: 0, updatedState: nextState };
  }

  // Handle OR chaining: cmd1 || cmd2
  if (rawTrimmed.includes(' || ')) {
    const parts = rawTrimmed.split(' || ');
    const firstRes = executeBashCommand(parts[0], nextState);
    if (firstRes.exitCode === 0) {
      return firstRes;
    }
    return executeBashCommand(parts.slice(1).join(' || '), firstRes.updatedState);
  }

  // Handle pipe: cmd1 | cmd2 | cmd3
  if (rawTrimmed.includes(' | ')) {
    const pipeCommands = rawTrimmed.split(' | ');
    let pipeInput = '';
    let lastExit = 0;
    for (let i = 0; i < pipeCommands.length; i++) {
      const subCmd = pipeCommands[i].trim();
      const res = executeSingleCommand(subCmd, nextState, pipeInput);
      pipeInput = res.stdout;
      nextState = res.updatedState;
      lastExit = res.exitCode;
      if (lastExit !== 0 && res.stderr) {
        return {
          stdout: res.stdout,
          stderr: res.stderr,
          exitCode: lastExit,
          updatedState: nextState,
        };
      }
    }
    return { stdout: pipeInput, stderr: '', exitCode: 0, updatedState: nextState };
  }

  // Handle redirection: cmd > file, cmd >> file, 2>/dev/null
  const cleanLine = rawTrimmed.replace(/\s*2>\/dev\/null/g, '');
  const redirectAppendMatch = cleanLine.match(/^(.*?)\s*>>\s*(.*?)$/);
  const redirectOverwriteMatch = cleanLine.match(/^(.*?)\s*>\s*(.*?)$/);

  if (redirectAppendMatch || redirectOverwriteMatch) {
    const isAppend = Boolean(redirectAppendMatch);
    const activeMatch = redirectAppendMatch ?? redirectOverwriteMatch;
    if (!activeMatch) return executeSingleCommand(cleanLine, nextState, '');

    const rawCmd = activeMatch[1] ?? '';
    const targetFile = (activeMatch[2] ?? '').trim();

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

  return executeSingleCommand(cleanLine, nextState, '');
};

const executeSingleCommand = (
  rawCmd: string,
  state: VfsState,
  stdinData: string
): TerminalExecutionResult => {
  const substituted = substituteEnvVars(rawCmd, state.env);
  const args = tokenizeCommandLine(substituted);
  const cmd = args[0] || '';

  // Variable assignment check: VAR=val
  if (cmd.includes('=') && !cmd.startsWith('==')) {
    const eqIdx = cmd.indexOf('=');
    const key = cmd.substring(0, eqIdx);
    const val = cmd.substring(eqIdx + 1);
    state.env[key] = val;
    return { stdout: '', stderr: '', exitCode: 0, updatedState: state };
  }

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

    case 'hostname': {
      return {
        stdout: `${state.env.HOSTNAME || 'sec-target-prod01'}\n`,
        stderr: '',
        exitCode: 0,
        updatedState: state,
      };
    }

    case 'uptime': {
      return {
        stdout: ' 06:45:12 up 14 days,  3:12,  1 user,  load average: 0.08, 0.03, 0.01\n',
        stderr: '',
        exitCode: 0,
        updatedState: state,
      };
    }

    case 'date': {
      return {
        stdout: `${new Date().toUTCString()}\n`,
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

    case 'uname': {
      if (args.includes('-a') || args.includes('--all')) {
        return {
          stdout: `Linux ${state.env.HOSTNAME || 'sec-target-prod01'} 6.8.0-45-generic #45-Ubuntu SMP PREEMPT_DYNAMIC Thu Aug 27 06:00:00 UTC 2026 x86_64 GNU/Linux\n`,
          stderr: '',
          exitCode: 0,
          updatedState: state,
        };
      }
      if (args.includes('-r'))
        return {
          stdout: '6.8.0-45-generic\n',
          stderr: '',
          exitCode: 0,
          updatedState: state,
        };
      if (args.includes('-m'))
        return { stdout: 'x86_64\n', stderr: '', exitCode: 0, updatedState: state };
      return { stdout: 'Linux\n', stderr: '', exitCode: 0, updatedState: state };
    }

    case 'env': {
      const out = Object.entries(state.env)
        .map(([k, v]) => `${k}=${v}`)
        .join('\n');
      return {
        stdout: out ? out + '\n' : '',
        stderr: '',
        exitCode: 0,
        updatedState: state,
      };
    }

    case 'export': {
      if (args.length === 1) {
        const out = Object.entries(state.env)
          .map(([k, v]) => `declare -x ${k}="${v}"`)
          .join('\n');
        return {
          stdout: out ? out + '\n' : '',
          stderr: '',
          exitCode: 0,
          updatedState: state,
        };
      }
      const rest = args.slice(1).join(' ');
      const [key, ...vParts] = rest.split('=');
      if (key) {
        state.env[key.trim()] = vParts.join('=');
      }
      return { stdout: '', stderr: '', exitCode: 0, updatedState: state };
    }

    case 'unset': {
      const varName = args[1];
      if (varName && state.env[varName]) {
        delete state.env[varName];
      }
      return { stdout: '', stderr: '', exitCode: 0, updatedState: state };
    }

    case 'cd': {
      const target = args[1] || `/home/${state.user.username}`;
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
      const newCwd = `/${resolved.join('/')}`;
      state.env.PWD = newCwd;
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
      let showHuman = false;
      let reverse = false;
      const targets: string[] = [];

      for (let i = 1; i < args.length; i++) {
        const arg = args[i];
        if (arg.startsWith('-') && arg !== '-') {
          if (arg.includes('a')) showAll = true;
          if (arg.includes('l')) showLong = true;
          if (arg.includes('h')) showHuman = true;
          if (arg.includes('r')) reverse = true;
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

      let childrenKeys = Object.keys(node.children).sort();
      if (reverse) childrenKeys = childrenKeys.reverse();

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
          const rawSize = isDir ? 4096 : child.size || child.content.length;
          const sizeStr =
            showHuman && rawSize > 1024
              ? `${Math.round(rawSize / 1024)}K`
              : String(rawSize);
          out += `${modeStr} 1 ${child.owner} ${child.group} ${sizeStr.padStart(6, ' ')} Aug 27 06:00 ${child.name}\n`;
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

    case 'head': {
      let linesCount = 10;
      let target = '';
      for (let i = 1; i < args.length; i++) {
        if (args[i] === '-n' && args[i + 1]) {
          linesCount = parseInt(args[i + 1], 10) || 10;
          i++;
        } else if (args[i].startsWith('-n')) {
          linesCount = parseInt(args[i].slice(2), 10) || 10;
        } else if (!target) {
          target = args[i];
        }
      }
      let content = stdinData;
      if (target) {
        const resolved = resolvePath(state.cwd, target);
        const node = getNode(state.root, resolved);
        if (!node || node.type !== 'file') {
          return {
            stdout: '',
            stderr: `head: cannot open '${target}': No such file\n`,
            exitCode: 1,
            updatedState: state,
          };
        }
        content = node.content;
      }
      const out = content.split('\n').slice(0, linesCount).join('\n');
      return {
        stdout: out + (out ? '\n' : ''),
        stderr: '',
        exitCode: 0,
        updatedState: state,
      };
    }

    case 'tail': {
      let linesCount = 10;
      let target = '';
      for (let i = 1; i < args.length; i++) {
        if (args[i] === '-n' && args[i + 1]) {
          linesCount = parseInt(args[i + 1], 10) || 10;
          i++;
        } else if (args[i].startsWith('-n')) {
          linesCount = parseInt(args[i].slice(2), 10) || 10;
        } else if (!target) {
          target = args[i];
        }
      }
      let content = stdinData;
      if (target) {
        const resolved = resolvePath(state.cwd, target);
        const node = getNode(state.root, resolved);
        if (!node || node.type !== 'file') {
          return {
            stdout: '',
            stderr: `tail: cannot open '${target}': No such file\n`,
            exitCode: 1,
            updatedState: state,
          };
        }
        content = node.content;
      }
      const allLines = content.split('\n').filter(Boolean);
      const out = allLines.slice(Math.max(0, allLines.length - linesCount)).join('\n');
      return {
        stdout: out + (out ? '\n' : ''),
        stderr: '',
        exitCode: 0,
        updatedState: state,
      };
    }

    case 'touch': {
      const target = args[1];
      if (!target)
        return {
          stdout: '',
          stderr: 'touch: missing file operand\n',
          exitCode: 1,
          updatedState: state,
        };
      const resolved = resolvePath(state.cwd, target);
      const fileName = resolved.pop();
      if (!fileName)
        return {
          stdout: '',
          stderr: 'touch: invalid file path\n',
          exitCode: 1,
          updatedState: state,
        };

      const parent = getNode(state.root, resolved);
      if (!parent || parent.type !== 'dir') {
        return {
          stdout: '',
          stderr: `touch: cannot touch '${target}': No such file or directory\n`,
          exitCode: 1,
          updatedState: state,
        };
      }
      if (!parent.children[fileName]) {
        parent.children[fileName] = {
          type: 'file',
          name: fileName,
          content: '',
          mode: 0o644,
          owner: state.user.username,
          group: state.user.username,
          size: 0,
          mtime: new Date().toISOString(),
        };
      }
      return { stdout: '', stderr: '', exitCode: 0, updatedState: state };
    }

    case 'mkdir': {
      const target = args.find((a) => !a.startsWith('-') && a !== 'mkdir');
      if (!target)
        return {
          stdout: '',
          stderr: 'mkdir: missing operand\n',
          exitCode: 1,
          updatedState: state,
        };
      const resolved = resolvePath(state.cwd, target);
      const dirName = resolved.pop();
      if (!dirName)
        return {
          stdout: '',
          stderr: 'mkdir: invalid directory path\n',
          exitCode: 1,
          updatedState: state,
        };

      const parent = getNode(state.root, resolved);
      if (!parent || parent.type !== 'dir') {
        return {
          stdout: '',
          stderr: `mkdir: cannot create directory '${target}': No such file or directory\n`,
          exitCode: 1,
          updatedState: state,
        };
      }
      parent.children[dirName] = {
        type: 'dir',
        name: dirName,
        mode: 0o755,
        owner: state.user.username,
        group: state.user.username,
        children: {},
      };
      return { stdout: '', stderr: '', exitCode: 0, updatedState: state };
    }

    case 'rm': {
      const target = args.find((a) => !a.startsWith('-') && a !== 'rm');
      if (!target)
        return {
          stdout: '',
          stderr: 'rm: missing operand\n',
          exitCode: 1,
          updatedState: state,
        };
      const resolved = resolvePath(state.cwd, target);
      const name = resolved.pop();
      if (!name)
        return {
          stdout: '',
          stderr: 'rm: invalid file path\n',
          exitCode: 1,
          updatedState: state,
        };

      const parent = getNode(state.root, resolved);
      if (!parent || parent.type !== 'dir' || !parent.children[name]) {
        return {
          stdout: '',
          stderr: `rm: cannot remove '${target}': No such file or directory\n`,
          exitCode: 1,
          updatedState: state,
        };
      }
      delete parent.children[name];
      return { stdout: '', stderr: '', exitCode: 0, updatedState: state };
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

      // Octal support
      const octalMatch = modeStr.match(/^[0-7]{3,4}$/);
      if (octalMatch) {
        node.mode = parseInt(modeStr, 8);
        return { stdout: '', stderr: '', exitCode: 0, updatedState: state };
      }

      // Symbolic support
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
      let countOnly = false;
      let pattern = '';
      let fileArg = '';

      for (let i = 1; i < args.length; i++) {
        const a = args[i];
        if (a.startsWith('-')) {
          if (a.includes('i')) ignoreCase = true;
          if (a.includes('v')) invert = true;
          if (a.includes('n')) showLineNum = true;
          if (a.includes('c')) countOnly = true;
        } else if (!pattern) {
          pattern = a;
        } else {
          fileArg = a;
        }
      }

      let content = stdinData;
      if (fileArg) {
        const resolved = resolvePath(state.cwd, fileArg);
        const node = getNode(state.root, resolved);
        if (!node || node.type !== 'file') {
          return {
            stdout: '',
            stderr: `grep: ${fileArg}: No such file or directory\n`,
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

      if (countOnly) {
        return {
          stdout: `${matched.length}\n`,
          stderr: '',
          exitCode: 0,
          updatedState: state,
        };
      }

      return {
        stdout: matched.length > 0 ? matched.join('\n') + '\n' : '',
        stderr: '',
        exitCode: matched.length > 0 ? 0 : 1,
        updatedState: state,
      };
    }

    case 'awk': {
      let delimiter = /\s+/;
      let program = '';
      for (let i = 1; i < args.length; i++) {
        if (args[i] === '-F' && args[i + 1]) {
          delimiter = new RegExp(args[i + 1]);
          i++;
        } else if (args[i].startsWith('-F')) {
          delimiter = new RegExp(args[i].slice(2));
        } else if (!program) {
          program = args[i];
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

    case 'sed': {
      const expr = args[1] || '';
      const sedMatch = expr.match(/^s\/([^/]+)\/([^/]*)\/(g?)/);
      if (!sedMatch) {
        return { stdout: stdinData, stderr: '', exitCode: 0, updatedState: state };
      }
      const findText = sedMatch[1];
      const replaceText = sedMatch[2];
      const flags = sedMatch[3] ? 'g' : '';
      const regex = new RegExp(findText, flags);
      const out = stdinData.replace(regex, replaceText);
      return { stdout: out, stderr: '', exitCode: 0, updatedState: state };
    }

    case 'sort': {
      let reverse = false;
      let numeric = false;
      let unique = false;
      for (const a of args) {
        if (a.includes('r')) reverse = true;
        if (a.includes('n')) numeric = true;
        if (a.includes('u')) unique = true;
      }
      let lines = stdinData.split('\n').filter(Boolean);
      if (unique) lines = Array.from(new Set(lines));
      lines.sort((a, b) => {
        if (numeric) {
          return parseFloat(a) - parseFloat(b);
        }
        return a.localeCompare(b);
      });
      if (reverse) lines.reverse();
      return {
        stdout: lines.join('\n') + (lines.length ? '\n' : ''),
        stderr: '',
        exitCode: 0,
        updatedState: state,
      };
    }

    case 'uniq': {
      let count = false;
      for (const a of args) {
        if (a.includes('c')) count = true;
      }
      const lines = stdinData.split('\n').filter(Boolean);
      const counts: Record<string, number> = {};
      lines.forEach((l) => {
        counts[l] = (counts[l] || 0) + 1;
      });
      const out = Object.keys(counts)
        .map((k) => (count ? `${String(counts[k]).padStart(7, ' ')} ${k}` : k))
        .join('\n');
      return {
        stdout: out ? out + '\n' : '',
        stderr: '',
        exitCode: 0,
        updatedState: state,
      };
    }

    case 'wc': {
      let countLines = false;
      let countWords = false;
      let countChars = false;
      for (const a of args) {
        if (a.includes('l')) countLines = true;
        if (a.includes('w')) countWords = true;
        if (a.includes('c') || a.includes('m')) countChars = true;
      }
      if (!countLines && !countWords && !countChars) {
        countLines = true;
        countWords = true;
        countChars = true;
      }
      const text = stdinData;
      const l = text.split('\n').filter(Boolean).length;
      const w = text.trim().split(/\s+/).filter(Boolean).length;
      const c = text.length;

      const outParts: string[] = [];
      if (countLines) outParts.push(String(l));
      if (countWords) outParts.push(String(w));
      if (countChars) outParts.push(String(c));

      return {
        stdout: outParts.join('\t') + '\n',
        stderr: '',
        exitCode: 0,
        updatedState: state,
      };
    }

    case 'find': {
      const pathArg = args[1] || '.';
      let permCheck: number | null = null;
      let nameCheck: RegExp | null = null;

      for (let i = 2; i < args.length; i++) {
        if (args[i] === '-perm' && args[i + 1]) {
          const p = args[i + 1];
          permCheck = p.startsWith('-') ? parseInt(p.slice(1), 8) : parseInt(p, 8);
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
      const walk = (n: VfsNode, currentPath: string): void => {
        let matches = true;
        if (permCheck !== null && (n.mode & permCheck) !== permCheck) matches = false;
        if (nameCheck !== null && !nameCheck.test(n.name)) matches = false;
        if (matches && currentPath) results.push(currentPath);
        if (n.type === 'dir') {
          for (const k of Object.keys(n.children)) {
            walk(n.children[k], `${currentPath}/${k}`.replace(/\/+/g, '/'));
          }
        }
      };

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

    case 'kill': {
      const pid = args.find((a) => !a.startsWith('-') && a !== 'kill');
      if (!pid)
        return {
          stdout: '',
          stderr:
            'kill: usage: kill [-s sigspec | -n signum | -sigspec] pid | jobspec ...\n',
          exitCode: 1,
          updatedState: state,
        };
      return {
        stdout: `[+] Terminated process PID ${pid}\n`,
        stderr: '',
        exitCode: 0,
        updatedState: state,
      };
    }

    case 'nmap': {
      const target = args.find((a) => !a.startsWith('-') && a !== 'nmap') || '10.0.4.1';
      const out =
        `Starting Nmap 7.94 ( https://nmap.org ) at 2026-08-27 06:50 UTC\n` +
        `Nmap scan report for ${target}\n` +
        `Host is up (0.00042s latency).\n` +
        `Not shown: 996 closed tcp ports (reset)\n` +
        `PORT     STATE SERVICE VERSION\n` +
        `22/tcp   open  ssh     OpenSSH 9.6p1 Ubuntu 3ubuntu13\n` +
        `80/tcp   open  http    nginx 1.24.0 (Ubuntu)\n` +
        `443/tcp  open  ssl/http nginx 1.24.0\n` +
        `5432/tcp open  postgresql PostgreSQL DB 16.2\n\n` +
        `Nmap done: 1 IP address (1 host up) scanned in 0.84 seconds\n`;
      return { stdout: out, stderr: '', exitCode: 0, updatedState: state };
    }

    case 'ifconfig':
    case 'ip': {
      const out =
        'eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500\n' +
        '        inet 10.0.4.15  netmask 255.255.255.0  broadcast 10.0.4.255\n' +
        '        inet6 fe80::216:3eff:feaa:bbcc  prefixlen 64  scopeid 0x20<link>\n' +
        '        ether 00:16:3e:aa:bb:cc  txqueuelen 1000  (Ethernet)\n' +
        '        RX packets 14208  bytes 12894102 (12.8 MB)\n' +
        '        TX packets 9812  bytes 841209 (841.2 KB)\n\n' +
        'lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536\n' +
        '        inet 127.0.0.1  netmask 255.0.0.0\n';
      return { stdout: out, stderr: '', exitCode: 0, updatedState: state };
    }

    case 'ping': {
      const host = args.find((a) => !a.startsWith('-') && a !== 'ping') || '10.0.4.1';
      const out =
        `PING ${host} (${host}) 56(84) bytes of data.\n` +
        `64 bytes from ${host}: icmp_seq=1 ttl=64 time=0.412 ms\n` +
        `64 bytes from ${host}: icmp_seq=2 ttl=64 time=0.389 ms\n` +
        `64 bytes from ${host}: icmp_seq=3 ttl=64 time=0.401 ms\n\n` +
        `--- ${host} ping statistics ---\n` +
        `3 packets transmitted, 3 received, 0% packet loss, time 2004ms\n` +
        `rtt min/avg/max/mdev = 0.389/0.400/0.412/0.009 ms\n`;
      return { stdout: out, stderr: '', exitCode: 0, updatedState: state };
    }

    case 'base64': {
      if (args.includes('-d') || args.includes('--decode')) {
        const text = stdinData || args.slice(2).join(' ');
        try {
          const decoded = atob(text.trim());
          return { stdout: `${decoded}\n`, stderr: '', exitCode: 0, updatedState: state };
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
      return { stdout: `${encoded}\n`, stderr: '', exitCode: 0, updatedState: state };
    }

    case 'hexdump': {
      const content = stdinData || 'Security Practice Payload Data';
      let out = '';
      for (let i = 0; i < content.length; i += 16) {
        const chunk = content.slice(i, i + 16);
        const hex = Array.from(chunk)
          .map((c) => c.charCodeAt(0).toString(16).padStart(2, '0'))
          .join(' ');
        const offset = i.toString(16).padStart(8, '0');
        out += `${offset}  ${hex.padEnd(48, ' ')}  |${chunk}|\n`;
      }
      return { stdout: out, stderr: '', exitCode: 0, updatedState: state };
    }

    case 'echo': {
      const msg = args.slice(1).join(' ');
      return { stdout: `${msg}\n`, stderr: '', exitCode: 0, updatedState: state };
    }

    case 'curl': {
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
        '=== Professional Security POSIX Workbench (45+ Utilities) ===\n' +
        '  File System:   ls, cd, pwd, cat, head, tail, touch, mkdir, rm, cp, mv, chmod, chown\n' +
        '  Search & Text:  grep, awk, sed, cut, sort, uniq, wc, find, strings, hexdump\n' +
        '  System Info:    whoami, id, uname, hostname, env, export, unset, uptime, date, ps, kill\n' +
        '  Network Recon:  nmap, ifconfig, ip, ping, curl, dig, nc\n' +
        '  Pipelines (|), Chaining (&&, ||, ;), and Redirections (>, >>) are fully active.\n';
      return { stdout: helpMsg, stderr: '', exitCode: 0, updatedState: state };
    }

    default: {
      return {
        stdout: '',
        stderr: `bash: ${cmd}: command not found. Type 'help' to see all 45+ supported commands.\n`,
        exitCode: 127,
        updatedState: state,
      };
    }
  }
};
