/**
 * Declarative Initial VFS Fixture & Honest In-Browser Shell Dispatcher
 * Strictly adheres to ADR-001:
 * - Does NOT emulate a POSIX kernel, multi-user DAC, or UID/GID transitions.
 * - Provides basic fixture inspection for demo viewing.
 * - Dispatches real execution to WebContainer or advises external VM.
 */

import type { TerminalExecutionResult, VfsDirectory, VfsState } from '../workbench/types';

export const createDefaultVfs = (): VfsDirectory => ({
  type: 'dir',
  name: '',
  mode: 0o755,
  owner: 'root',
  group: 'root',
  children: {
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
          mode: 0o750,
          owner: 'operator',
          group: 'operator',
          children: {
            'notes.txt': {
              type: 'file',
              name: 'notes.txt',
              mode: 0o644,
              owner: 'operator',
              group: 'operator',
              content:
                'Offensive Security Academy: Environment initialized in sandbox mode.\nUse WebContainer for Node/Web labs or an external container/VM for full POSIX execution.\n',
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
        passwd: {
          type: 'file',
          name: 'passwd',
          mode: 0o644,
          owner: 'root',
          group: 'root',
          content:
            'root:x:0:0:root:/root:/bin/bash\noperator:x:1000:1000:Operator:/home/operator:/bin/bash\nnobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin\n',
        },
        shadow: {
          type: 'file',
          name: 'shadow',
          mode: 0o640,
          owner: 'root',
          group: 'shadow',
          content: 'root:*:19700:0:99999:7:::\noperator:*:19700:0:99999:7:::\n',
        },
      },
    },
  },
});

export function createInitialVfsState(customDir?: VfsDirectory): VfsState {
  return {
    cwd: '/home/operator',
    user: {
      uid: 1000,
      gid: 1000,
      username: 'operator',
      groups: ['operator'],
    },
    env: {
      PATH: '/usr/local/bin:/usr/bin:/bin',
      HOME: '/home/operator',
      USER: 'operator',
    },
    history: [],
    root: customDir || createDefaultVfs(),
  };
}

/**
 * Honest In-Browser Demo Shell.
 * Evaluates basic inspection commands without pretending to be a Linux kernel.
 */
export function executeHonestShellCommand(
  rawCmd: string,
  state: VfsState
): TerminalExecutionResult {
  const trimmed = rawCmd.trim();
  const parts = trimmed.split(/\s+/);
  const cmd = parts[0] || '';
  const args = parts.slice(1);

  const updatedState: VfsState = {
    ...state,
    history: [...state.history, trimmed],
  };

  if (!cmd) {
    return { stdout: '', stderr: '', exitCode: 0, updatedState };
  }

  switch (cmd) {
    case 'pwd':
      return { stdout: `${state.cwd}\n`, stderr: '', exitCode: 0, updatedState };

    case 'whoami':
      return {
        stdout: `${state.user.username}\n`,
        stderr: '',
        exitCode: 0,
        updatedState,
      };

    case 'id':
      return {
        stdout: `uid=${state.user.uid}(${state.user.username}) gid=${state.user.gid}(${state.user.username}) groups=${state.user.groups.join(',')}\n`,
        stderr: '',
        exitCode: 0,
        updatedState,
      };

    case 'help':
      return {
        stdout: `Available in-browser demo commands: pwd, whoami, id, ls, cat, echo, clear, help.\nNote: Full Linux kernel DAC/privilege escalation is not simulated in-browser (see ADR-001).\n`,
        stderr: '',
        exitCode: 0,
        updatedState,
      };

    case 'echo':
      return { stdout: `${args.join(' ')}\n`, stderr: '', exitCode: 0, updatedState };

    case 'ls': {
      // Find operator directory files or root
      const operatorDir = state.root.children.home as VfsDirectory | undefined;
      const opSub = operatorDir?.children?.operator as VfsDirectory | undefined;
      const fileNames = opSub ? Object.keys(opSub.children) : ['notes.txt'];
      return {
        stdout: `${fileNames.join('  ')}\n`,
        stderr: '',
        exitCode: 0,
        updatedState,
      };
    }

    case 'cat': {
      const target = args[0] || '';
      if (target.includes('notes.txt') || !target) {
        return {
          stdout: `Offensive Security Academy: Environment initialized in sandbox mode.\n`,
          stderr: '',
          exitCode: 0,
          updatedState,
        };
      }
      if (target.includes('passwd')) {
        return {
          stdout: `root:x:0:0:root:/root:/bin/bash\noperator:x:1000:1000:Operator:/home/operator:/bin/bash\n`,
          stderr: '',
          exitCode: 0,
          updatedState,
        };
      }
      return {
        stdout: '',
        stderr: `cat: ${target}: No such file or directory\n`,
        exitCode: 1,
        updatedState,
      };
    }

    default:
      return {
        stdout: '',
        stderr: `[In-Browser Demo] '${cmd}': Full kernel execution not simulated in-browser.\nUse WebContainer for Node/Web labs or an external VM for live exploitation (see ADR-001).\n`,
        exitCode: 127,
        updatedState,
      };
  }
}
