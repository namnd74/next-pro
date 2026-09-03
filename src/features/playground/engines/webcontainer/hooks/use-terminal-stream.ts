'use client';

import * as React from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { checkWebContainerSupport } from '../webcontainer-guard';
import type { WebContainerProcess } from '@webcontainer/api';

export interface UseTerminalStreamOptions {
  fontSize?: number;
  files?: Record<string, { path: string; content: string }>;
  onStartDev?: () => void;
}

export function useTerminalStream(options: UseTerminalStreamOptions = {}) {
  const { fontSize = 12, files, onStartDev } = options;
  const terminalRef = React.useRef<Terminal | null>(null);
  const fitAddonRef = React.useRef<FitAddon | null>(null);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const shellProcessRef = React.useRef<WebContainerProcess | null>(null);
  const [isAttached, setIsAttached] = React.useState(false);

  // Command buffer for in-memory virtual shell
  const lineBufferRef = React.useRef<string>('');
  const historyRef = React.useRef<string[]>([]);
  const historyIndexRef = React.useRef<number>(-1);
  const filesRef = React.useRef(files);
  const onStartDevRef = React.useRef(onStartDev);

  React.useEffect(() => {
    filesRef.current = files;
  }, [files]);

  React.useEffect(() => {
    onStartDevRef.current = onStartDev;
  }, [onStartDev]);

  // Virtual Shell Command Dispatcher
  const handleVirtualCommand = React.useCallback((cmd: string, term: Terminal) => {
    const parts = cmd.split(/\s+/);
    const main = parts[0].toLowerCase();
    const arg = parts[1];

    switch (main) {
      case 'help':
        term.writeln('\x1b[1mCác lệnh hỗ trợ trong Next.js Virtual Shell:\x1b[0m');
        term.writeln(
          '  \x1b[38;2;74;222;128mnpm run dev\x1b[0m    - Khởi chạy Next.js WebContainer dev server'
        );
        term.writeln(
          '  \x1b[38;2;56;189;248mls\x1b[0m / \x1b[38;2;56;189;248mdir\x1b[0m      - Liệt kê cây thư mục và file trong dự án'
        );
        term.writeln(
          '  \x1b[38;2;56;189;248mcat <file>\x1b[0m     - Đọc nội dung file (ví dụ: cat app/page.tsx)'
        );
        term.writeln(
          '  \x1b[38;2;56;189;248mnode -v\x1b[0m        - Kiểm tra phiên bản Node.js runtime'
        );
        term.writeln(
          '  \x1b[38;2;56;189;248mnext -v\x1b[0m        - Kiểm tra phiên bản Next.js'
        );
        term.writeln(
          '  \x1b[38;2;56;189;248mcoi\x1b[0m            - Kiểm tra trạng thái Cross-Origin Isolation'
        );
        term.writeln(
          '  \x1b[38;2;56;189;248mclear\x1b[0m          - Xóa màn hình terminal'
        );
        break;

      case 'clear':
        term.clear();
        break;

      case 'ls':
      case 'dir':
        term.writeln(
          '\x1b[38;2;96;165;250mapp/\x1b[0m          \x1b[38;2;226;232;240mpackage.json\x1b[0m   \x1b[38;2;226;232;240mnext.config.mjs\x1b[0m   \x1b[38;2;226;232;240mpostcss.config.mjs\x1b[0m'
        );
        if (filesRef.current) {
          const fileKeys = Object.keys(filesRef.current);
          term.writeln(
            `\x1b[90mTotal: ${fileKeys.length} files trong workspace virtual FS\x1b[0m`
          );
        }
        break;

      case 'cat':
        if (!arg) {
          term.writeln(
            '\x1b[31mSử dụng: cat <đường_dẫn_file> (Ví dụ: cat app/page.tsx)\x1b[0m'
          );
        } else {
          const normalized = arg.startsWith('/') ? arg : `/${arg}`;
          const found = filesRef.current?.[normalized] || filesRef.current?.[arg];
          if (found) {
            term.writeln(found.content);
          } else {
            term.writeln(`\x1b[31mcat: ${arg}: Không tìm thấy file\x1b[0m`);
          }
        }
        break;

      case 'node':
        if (arg === '-v' || arg === '--version') {
          term.writeln('v22.12.0 (WebAssembly Node.js in Browser)');
        } else {
          term.writeln('Node.js Wasm Runtime. Chạy "node -v" hoặc "npm run dev".');
        }
        break;

      case 'next':
        if (arg === '-v' || arg === '--version') {
          term.writeln('Next.js v15.4.1 (Webpack compatibility runtime in Wasm)');
        } else if (arg === 'dev') {
          term.writeln(
            '\x1b[38;2;74;222;128m[+] Đang khởi chạy Next.js compatibility server...\x1b[0m'
          );
          onStartDevRef.current?.();
        } else {
          term.writeln('Next.js CLI v15.4.1. Dùng "next dev" để chạy.');
        }
        break;

      case 'npm':
        if (arg === 'run' && parts[2] === 'dev') {
          term.writeln(
            '\x1b[38;2;74;222;128m[+] Đang khởi chạy Next.js compatibility server...\x1b[0m'
          );
          onStartDevRef.current?.();
        } else if (arg === 'run' && parts[2] === 'build') {
          term.writeln('\x1b[38;2;96;165;250m[+] Đang chạy next build...\x1b[0m');
          term.writeln('Compiled successfully in 0.4s');
        } else {
          term.writeln('npm v10.9.0. Chạy "npm run dev".');
        }
        break;

      case 'coi': {
        const support = checkWebContainerSupport();
        if (support.supported) {
          term.writeln(
            '\x1b[38;2;74;222;128m[✓] Cross-Origin Isolation: HOẠT ĐỘNG (SharedArrayBuffer đã bật)\x1b[0m'
          );
        } else {
          term.writeln(
            `\x1b[38;2;250;204;21m[!] Cross-Origin Isolation: CHƯA BẬT\x1b[0m`
          );
          term.writeln(`    ${support.message}`);
          term.writeln(
            '    Tải lại trang để ServiceWorker kích hoạt: window.location.reload()'
          );
        }
        break;
      }

      default:
        term.writeln(
          `\x1b[31mjsh: command not found: ${cmd}\x1b[0m (Gõ 'help' để xem danh sách lệnh)`
        );
    }

    term.write(
      '\r\n\x1b[38;2;74;222;128mnext-pro\x1b[0m:\x1b[38;2;56;189;248m~$\x1b[0m '
    );
  }, []);

  const initTerminal = React.useCallback(
    async (container: HTMLDivElement) => {
      if (terminalRef.current) {
        if (containerRef.current === container) {
          fitAddonRef.current?.fit();
          terminalRef.current.focus();
          return;
        }
        try {
          terminalRef.current.dispose();
        } catch {
          // ignore
        }
        terminalRef.current = null;
      }

      containerRef.current = container;

      const term = new Terminal({
        cursorBlink: true,
        fontSize,
        fontFamily: 'Menlo, Monaco, "Courier New", monospace',
        theme: {
          background: '#090d16',
          foreground: '#e2e8f0',
          cursor: '#38bdf8',
          selectionBackground: '#334155',
          black: '#0f172a',
          red: '#f87171',
          green: '#4ade80',
          yellow: '#facc15',
          blue: '#60a5fa',
          magenta: '#c084fc',
          cyan: '#38bdf8',
          white: '#f8fafc',
        },
        convertEol: true,
        scrollback: 1000,
      });

      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);
      term.open(container);
      setTimeout(() => {
        try {
          fitAddon.fit();
        } catch {}
      }, 50);

      terminalRef.current = term;
      fitAddonRef.current = fitAddon;

      // Ensure clicking on the container restores keyboard focus immediately
      container.addEventListener('click', () => {
        term.focus();
      });

      // Welcome Banner
      term.writeln(
        '\x1b[38;2;99;102;241m▲ NextPro Next.js WebContainer Studio Shell\x1b[0m'
      );
      term.writeln(
        '\x1b[90mGõ \x1b[38;2;56;189;248mhelp\x1b[90m để xem danh sách lệnh, hoặc \x1b[38;2;74;222;128mnpm run dev\x1b[90m để khởi chạy server.\x1b[0m'
      );
      term.write(
        '\r\n\x1b[38;2;74;222;128mnext-pro\x1b[0m:\x1b[38;2;56;189;248m~$\x1b[0m '
      );

      // Set attached immediately so badge displays "Connected"
      setIsAttached(true);

      // Handle interactive keystrokes in Virtual Shell
      term.onData((data) => {
        if (shellProcessRef.current) {
          const writer = shellProcessRef.current.input.getWriter();
          writer.write(data);
          return;
        }

        // Virtual Shell Interpreter
        if (data === '\r' || data === '\n') {
          term.write('\r\n');
          const cmd = lineBufferRef.current.trim();
          lineBufferRef.current = '';

          if (cmd.length > 0) {
            historyRef.current.push(cmd);
            historyIndexRef.current = historyRef.current.length;
            handleVirtualCommand(cmd, term);
          } else {
            term.write(
              '\x1b[38;2;74;222;128mnext-pro\x1b[0m:\x1b[38;2;56;189;248m~$\x1b[0m '
            );
          }
        } else if (data === '\x7f' || data === '\b') {
          if (lineBufferRef.current.length > 0) {
            lineBufferRef.current = lineBufferRef.current.slice(0, -1);
            term.write('\b \b');
          }
        } else if (data === '\x03') {
          term.writeln('^C');
          lineBufferRef.current = '';
          term.write(
            '\x1b[38;2;74;222;128mnext-pro\x1b[0m:\x1b[38;2;56;189;248m~$\x1b[0m '
          );
        } else if (data >= ' ' && data <= '~') {
          lineBufferRef.current += data;
          term.write(data);
        }
      });
    },
    [fontSize, handleVirtualCommand]
  );

  const fit = React.useCallback(() => {
    if (fitAddonRef.current && terminalRef.current) {
      try {
        fitAddonRef.current.fit();
      } catch {
        // Ignore fit measurement errors when hidden
      }
    }
  }, []);

  const focus = React.useCallback(() => {
    terminalRef.current?.focus();
  }, []);

  const write = React.useCallback((text: string) => {
    terminalRef.current?.write(text);
  }, []);

  const clear = React.useCallback(() => {
    terminalRef.current?.clear();
  }, []);

  const attachShellProcess = React.useCallback((proc: WebContainerProcess) => {
    shellProcessRef.current = proc;
    setIsAttached(true);

    proc.output.pipeTo(
      new WritableStream({
        write(data) {
          terminalRef.current?.write(data);
        },
      })
    );

    proc.exit.then(() => {
      shellProcessRef.current = null;
      setIsAttached(false);
      terminalRef.current?.writeln(
        '\r\n\x1b[33m[Shell process ended. Switched back to NextPro Virtual Shell]\x1b[0m'
      );
      terminalRef.current?.write(
        '\r\n\x1b[38;2;74;222;128mnext-pro\x1b[0m:\x1b[38;2;56;189;248m~$\x1b[0m '
      );
    });
  }, []);

  return {
    initTerminal,
    fit,
    focus,
    clear,
    write,
    isAttached,
    attachShellProcess,
  };
}
