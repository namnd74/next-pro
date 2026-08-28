import type { VfsDirectory, VfsState } from '../../workbench/types';
import { createDefaultVfs } from '../../workbench/engines/virtual-posix-engine';

/**
 * Creates an authentic target box VFS state for a specific challenge.
 * Configures distinct directory structures, user.txt (User Flag), root.txt (Root Flag),
 * /etc/sudoers, SUID binaries, and cron jobs according to the Boot2Root attack chain.
 */
export const createTargetBoxVfs = (challengeId: string): VfsState => {
  const rootDir: VfsDirectory = JSON.parse(JSON.stringify(createDefaultVfs()));

  // Ensure /var/www/html exists
  if (!rootDir.children.var) {
    rootDir.children.var = {
      type: 'dir',
      name: 'var',
      mode: 0o755,
      owner: 'root',
      group: 'root',
      children: {},
    };
  }
  const varDir = rootDir.children.var as VfsDirectory;
  if (!varDir.children.www) {
    varDir.children.www = {
      type: 'dir',
      name: 'www',
      mode: 0o755,
      owner: 'root',
      group: 'root',
      children: {},
    };
  }
  const wwwDir = varDir.children.www as VfsDirectory;
  if (!wwwDir.children.html) {
    wwwDir.children.html = {
      type: 'dir',
      name: 'html',
      mode: 0o755,
      owner: 'www-data',
      group: 'www-data',
      children: {},
    };
  }

  // Ensure /home/operator exists
  if (!rootDir.children.home) {
    rootDir.children.home = {
      type: 'dir',
      name: 'home',
      mode: 0o755,
      owner: 'root',
      group: 'root',
      children: {},
    };
  }
  const homeDir = rootDir.children.home as VfsDirectory;
  if (!homeDir.children.operator) {
    homeDir.children.operator = {
      type: 'dir',
      name: 'operator',
      mode: 0o750,
      owner: 'operator',
      group: 'operator',
      children: {},
    };
  }
  const operatorHome = homeDir.children.operator as VfsDirectory;

  // Ensure /root directory exists with restricted 0o700 permissions
  if (!rootDir.children.root) {
    rootDir.children.root = {
      type: 'dir',
      name: 'root',
      mode: 0o700,
      owner: 'root',
      group: 'root',
      children: {},
    };
  }
  const rootHome = rootDir.children.root as VfsDirectory;
  rootHome.mode = 0o700;
  rootHome.owner = 'root';
  rootHome.group = 'root';

  // Ensure /etc exists
  const etcDir = (rootDir.children.etc as VfsDirectory) || {
    type: 'dir',
    name: 'etc',
    mode: 0o755,
    owner: 'root',
    group: 'root',
    children: {},
  };
  rootDir.children.etc = etcDir;

  // Ensure /usr/bin exists
  const usrDir = (rootDir.children.usr as VfsDirectory) || {
    type: 'dir',
    name: 'usr',
    mode: 0o755,
    owner: 'root',
    group: 'root',
    children: {},
  };
  rootDir.children.usr = usrDir;
  const usrBinDir = (usrDir.children.bin as VfsDirectory) || {
    type: 'dir',
    name: 'bin',
    mode: 0o755,
    owner: 'root',
    group: 'root',
    children: {},
  };
  usrDir.children.bin = usrBinDir;

  // Ensure /opt exists
  if (!rootDir.children.opt) {
    rootDir.children.opt = {
      type: 'dir',
      name: 'opt',
      mode: 0o755,
      owner: 'root',
      group: 'root',
      children: {},
    };
  }
  const optDir = rootDir.children.opt as VfsDirectory;

  // Configure Box-Specific Archetypes
  switch (challengeId) {
    case 'cve-2023-4966-citrix-bleed': {
      operatorHome.children['user.txt'] = {
        type: 'file',
        name: 'user.txt',
        content: 'OS_0DAY{citrix_bleed_heap_leak_foothold_u1000}\n',
        mode: 0o644,
        owner: 'operator',
        group: 'operator',
        size: 47,
      };
      rootHome.children['root.txt'] = {
        type: 'file',
        name: 'root.txt',
        content: 'OS_0DAY{citrix_gtfobins_sudo_find_root_pwned}\n',
        mode: 0o600,
        owner: 'root',
        group: 'root',
        size: 46,
      };
      etcDir.children['sudoers'] = {
        type: 'file',
        name: 'sudoers',
        content:
          '# /etc/sudoers configuration\n' +
          'Defaults        env_reset\n' +
          'root    ALL=(ALL:ALL) ALL\n' +
          'operator ALL=(ALL) NOPASSWD: /usr/bin/find\n',
        mode: 0o440,
        owner: 'root',
        group: 'root',
        size: 150,
      };
      break;
    }

    case 'cve-2021-44228-log4shell': {
      operatorHome.children['user.txt'] = {
        type: 'file',
        name: 'user.txt',
        content: 'OS_0DAY{log4shell_jndi_unauth_rce_user_access}\n',
        mode: 0o644,
        owner: 'operator',
        group: 'operator',
        size: 46,
      };
      rootHome.children['root.txt'] = {
        type: 'file',
        name: 'root.txt',
        content: 'OS_0DAY{cronjob_python_script_hijack_uid0}\n',
        mode: 0o600,
        owner: 'root',
        group: 'root',
        size: 44,
      };
      // Writable cron script
      optDir.children['backup'] = {
        type: 'dir',
        name: 'backup',
        mode: 0o777,
        owner: 'root',
        group: 'root',
        children: {
          'cleanup.py': {
            type: 'file',
            name: 'cleanup.py',
            content:
              '#!/usr/bin/python3\n# Automated backup maintenance script\nimport os, sys\nprint("[*] Running log cleanup job...")\n',
            mode: 0o777,
            owner: 'root',
            group: 'root',
            size: 110,
          },
        },
      };
      etcDir.children['crontab'] = {
        type: 'file',
        name: 'crontab',
        content:
          '# /etc/crontab: system-wide crontab\n' +
          'SHELL=/bin/sh\n' +
          'PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin\n' +
          '* * * * * root /usr/bin/python3 /opt/backup/cleanup.py\n',
        mode: 0o644,
        owner: 'root',
        group: 'root',
        size: 180,
      };
      break;
    }

    case 'bb-aws-01-imdsv2-ssrf': {
      operatorHome.children['user.txt'] = {
        type: 'file',
        name: 'user.txt',
        content: 'OS_0DAY{aws_imdsv2_ssrf_iam_role_compromised}\n',
        mode: 0o644,
        owner: 'operator',
        group: 'operator',
        size: 46,
      };
      rootHome.children['root.txt'] = {
        type: 'file',
        name: 'root.txt',
        content: 'OS_0DAY{gtfobins_vim_spawn_root_shell_pwned}\n',
        mode: 0o600,
        owner: 'root',
        group: 'root',
        size: 45,
      };
      etcDir.children['sudoers'] = {
        type: 'file',
        name: 'sudoers',
        content:
          '# /etc/sudoers\n' +
          'Defaults        env_reset\n' +
          'root    ALL=(ALL:ALL) ALL\n' +
          'operator ALL=(root) NOPASSWD: /usr/bin/vim /etc/nginx/sites-available/*\n',
        mode: 0o440,
        owner: 'root',
        group: 'root',
        size: 180,
      };
      break;
    }

    case 'ad-kerb-01-kerberoasting': {
      // Box 4: CORP-APP01 Linux Domain Member Server with SUID Python
      operatorHome.children['user.txt'] = {
        type: 'file',
        name: 'user.txt',
        content: 'OS_0DAY{ad_kerberoast_svc_mssql_cracked_Summer2026!}\n',
        mode: 0o644,
        owner: 'operator',
        group: 'operator',
        size: 54,
      };
      rootHome.children['root.txt'] = {
        type: 'file',
        name: 'root.txt',
        content: 'OS_0DAY{ad_domain_privesc_suid_python_pwned}\n',
        mode: 0o600,
        owner: 'root',
        group: 'root',
        size: 45,
      };
      // Python3 SUID binary
      usrBinDir.children['python3'] = {
        type: 'file',
        name: 'python3',
        content: '#!/bin/sh\n# CPython 3.12 binary\n',
        mode: 0o4755, // SUID bit set!
        owner: 'root',
        group: 'root',
        size: 5420100,
      };
      operatorHome.children['ad-tools'] = {
        type: 'dir',
        name: 'ad-tools',
        mode: 0o755,
        owner: 'operator',
        group: 'operator',
        children: {},
      };
      break;
    }

    case '0d-taint-01-proto-pollution': {
      operatorHome.children['user.txt'] = {
        type: 'file',
        name: 'user.txt',
        content: 'OS_0DAY{nodejs_prototype_pollution_rce_gadget_pwned}\n',
        mode: 0o644,
        owner: 'operator',
        group: 'operator',
        size: 51,
      };
      rootHome.children['root.txt'] = {
        type: 'file',
        name: 'root.txt',
        content: 'OS_0DAY{linux_cap_setuid_node_root_pwned}\n',
        mode: 0o600,
        owner: 'root',
        group: 'root',
        size: 43,
      };
      etcDir.children['sudoers'] = {
        type: 'file',
        name: 'sudoers',
        content:
          '# /etc/sudoers\n' +
          'Defaults        env_reset\n' +
          'root    ALL=(ALL:ALL) ALL\n' +
          'operator ALL=(ALL) NOPASSWD: /usr/bin/awk\n',
        mode: 0o440,
        owner: 'root',
        group: 'root',
        size: 150,
      };
      break;
    }

    case 'bb-race-03-limit-overrun': {
      operatorHome.children['user.txt'] = {
        type: 'file',
        name: 'user.txt',
        content: 'OS_0DAY{concurrency_race_condition_double_spend_success}\n',
        mode: 0o644,
        owner: 'operator',
        group: 'operator',
        size: 56,
      };
      rootHome.children['root.txt'] = {
        type: 'file',
        name: 'root.txt',
        content: 'OS_0DAY{gtfobins_apt_preinvoke_root_pwned}\n',
        mode: 0o600,
        owner: 'root',
        group: 'root',
        size: 41,
      };
      etcDir.children['sudoers'] = {
        type: 'file',
        name: 'sudoers',
        content:
          '# /etc/sudoers\n' +
          'Defaults        env_reset\n' +
          'root    ALL=(ALL:ALL) ALL\n' +
          'operator ALL=(ALL) NOPASSWD: /usr/bin/apt\n',
        mode: 0o440,
        owner: 'root',
        group: 'root',
        size: 150,
      };
      break;
    }

    default: {
      operatorHome.children['user.txt'] = {
        type: 'file',
        name: 'user.txt',
        content: 'OS_0DAY{generic_user_foothold_flag}\n',
        mode: 0o644,
        owner: 'operator',
        group: 'operator',
        size: 38,
      };
      rootHome.children['root.txt'] = {
        type: 'file',
        name: 'root.txt',
        content: 'OS_0DAY{generic_root_takeover_flag}\n',
        mode: 0o600,
        owner: 'root',
        group: 'root',
        size: 38,
      };
      etcDir.children['sudoers'] = {
        type: 'file',
        name: 'sudoers',
        content: 'operator ALL=(ALL) NOPASSWD: /usr/bin/find\n',
        mode: 0o440,
        owner: 'root',
        group: 'root',
        size: 100,
      };
      break;
    }
  }

  return {
    root: rootDir,
    cwd: '/home/operator',
    user: {
      uid: 1000,
      gid: 1000,
      username: 'operator',
      groups: ['operator', 'users'],
    },
    env: {
      USER: 'operator',
      HOME: '/home/operator',
      SHELL: '/bin/bash',
      PWD: '/home/operator',
      PATH: '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
      TERM: 'xterm-256color',
      LANG: 'en_US.UTF-8',
    },
    history: [],
  };
};
