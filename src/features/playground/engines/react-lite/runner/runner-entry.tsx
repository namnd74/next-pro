import { PLAYGROUND_PROTOCOL } from './protocol';

export function generateIframeSrcDoc(sessionId: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>NextPro Playground Sandbox</title>
  
  <!-- Tailwind CSS -->
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
  
  <!-- Single-Instance Unified React 19.2.8 & ReactDOM 19.2.8 Loader -->
  <script type="module">
    try {
      const [React, ReactDOM, ReactDOMClient] = await Promise.all([
        import('https://esm.sh/react@19.2.8'),
        import('https://esm.sh/react-dom@19.2.8'),
        import('https://esm.sh/react-dom@19.2.8/client')
      ]);

      const reactDefault = React.default || React;
      const reactDomDefault = ReactDOM.default || ReactDOM;

      window.React = reactDefault;
      const rawCreateRoot = (ReactDOMClient && ReactDOMClient.createRoot) || reactDomDefault.createRoot;
      window.ReactDOM = Object.assign({}, reactDomDefault, ReactDOMClient, {
        createRoot: function(container, options) {
          if (window.__REACT_ACTIVE_ROOT__) {
            try { window.__REACT_ACTIVE_ROOT__.unmount(); } catch(e) {}
            window.__REACT_ACTIVE_ROOT__ = null;
          }
          const root = rawCreateRoot.call(this, container, options);
          window.__REACT_ACTIVE_ROOT__ = root;
          return root;
        }
      });

      try {
        const { create } = await import('https://esm.sh/zustand@5.0.3');
        window.Zustand = { create, default: { create } };
      } catch (e) {
        window.Zustand = { create: () => () => ({}) };
      }

      window.__REACT_RUNTIME_READY__ = true;
      window.dispatchEvent(new Event('react-runtime-ready'));
    } catch (err) {
      console.error('Failed to load React 19.2.8:', err);
      window.__REACT_RUNTIME_ERROR__ = err instanceof Error ? err.message : String(err);
      window.dispatchEvent(new Event('react-runtime-error'));
    }
  </script>
  
  <style>
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      min-height: 100%;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: transparent;
      color: inherit;
    }
    #root {
      width: 100%;
      min-height: 100%;
      padding: 16px;
    }
    /* Scrollbar */
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(150, 150, 150, 0.3); border-radius: 3px; }
  </style>
</head>
<body>
  <div id="__user_html_wrapper__">
    <div id="root">
      <div style="display:flex;align-items:center;justify-content:center;min-height:160px;font-family:monospace;font-size:12px;color:#94a3b8;gap:8px;">
        <div style="width:14px;height:14px;border:2px solid #38bdf8;border-top-color:transparent;border-radius:50%;animation:spin 1s linear infinite;"></div>
        <span>Đang khởi động React 19.2.8 Runtime...</span>
      </div>
      <style>
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      </style>
    </div>
  </div>

  <script>
    (function() {
      const PROTOCOL = '${PLAYGROUND_PROTOCOL}';
      const SESSION_ID = '${sessionId}';
      let currentRunId = '';
      let logCount = 0;
      const MAX_LOGS_PER_RUN = 500;
      let rootInstance = null;
      let isRuntimeReady = false;
      let pendingExecution = null;

      // 1. Virtual Storage Shims
      const virtualStorageMap = new Map();
      const virtualStorage = {
        getItem: function(k) { return virtualStorageMap.get(String(k)) ?? null; },
        setItem: function(k, v) { virtualStorageMap.set(String(k), String(v)); },
        removeItem: function(k) { virtualStorageMap.delete(String(k)); },
        clear: function() { virtualStorageMap.clear(); },
        get length() { return virtualStorageMap.size; },
        key: function(i) { return Array.from(virtualStorageMap.keys())[i] ?? null; }
      };

      try {
        Object.defineProperty(window, 'localStorage', { value: virtualStorage, writable: false });
        Object.defineProperty(window, 'sessionStorage', { value: virtualStorage, writable: false });
      } catch (e) {}

      // 2. Safe Serializer
      function serialize(val, depth, seen) {
        depth = depth || 0;
        seen = seen || new WeakSet();
        if (val === null) return { type: 'null' };
        if (val === undefined) return { type: 'undefined' };
        const t = typeof val;
        if (t === 'string') return { type: 'string', value: val.length > 5000 ? val.slice(0, 5000) + '... [truncated]' : val };
        if (t === 'number') return { type: 'number', value: Number.isNaN(val) ? 0 : val };
        if (t === 'boolean') return { type: 'boolean', value: val };
        if (t === 'bigint') return { type: 'bigint', value: val.toString() + 'n' };
        if (t === 'symbol') return { type: 'symbol', value: val.toString() };
        if (t === 'function') return { type: 'function', name: val.name || 'anonymous' };
        if (t === 'object') {
          if (val instanceof Error) {
            return { type: 'error', message: val.message, stack: val.stack };
          }
          if (val instanceof Node) {
            return { type: 'string', value: '<' + val.nodeName.toLowerCase() + ' />' };
          }
          if (seen.has(val)) return { type: 'string', value: '[Circular]' };
          if (depth >= 4) return { type: 'string', value: Array.isArray(val) ? '[Array]' : '[Object]' };
          seen.add(val);
          if (Array.isArray(val)) {
            const arr = [];
            const len = Math.min(val.length, 50);
            for (let i = 0; i < len; i++) arr.push(serialize(val[i], depth + 1, seen));
            return { type: 'array', value: arr };
          }
          const res = {};
          const keys = Object.keys(val).slice(0, 50);
          for (let i = 0; i < keys.length; i++) {
            const k = keys[i];
            try { res[k] = serialize(val[k], depth + 1, seen); } catch(e) { res[k] = { type: 'string', value: '[Error]' }; }
          }
          return { type: 'object', value: res };
        }
        return { type: 'string', value: String(val) };
      }

      // 3. Console Interceptor
      const originalConsole = {
        log: console.log.bind(console),
        info: console.info.bind(console),
        warn: console.warn.bind(console),
        error: console.error.bind(console),
      };

      function sendLog(level, args) {
        const runIdToSend = currentRunId || 'active';
        logCount++;
        if (logCount > MAX_LOGS_PER_RUN) {
          if (logCount === MAX_LOGS_PER_RUN + 1) {
            window.parent.postMessage({
              protocol: PROTOCOL,
              sessionId: SESSION_ID,
              runId: runIdToSend,
              type: 'CONSOLE',
              payload: {
                id: Date.now() + '-max',
                level: 'warn',
                args: [{ type: 'string', value: '⚠️ Console output truncated: limit of 500 logs exceeded for this run.' }],
                timestamp: Date.now()
              }
            }, '*');
          }
          return;
        }

        const serializedArgs = args.map(function(a) { return serialize(a, 0, new WeakSet()); });
        window.parent.postMessage({
          protocol: PROTOCOL,
          sessionId: SESSION_ID,
          runId: runIdToSend,
          type: 'CONSOLE',
          payload: {
            id: Date.now() + '-' + Math.random().toString(36).slice(2, 7),
            level: level,
            args: serializedArgs,
            timestamp: Date.now()
          }
        }, '*');
      }

      console.log = function() { const args = Array.from(arguments); originalConsole.log.apply(console, args); sendLog('log', args); };
      console.info = function() { const args = Array.from(arguments); originalConsole.info.apply(console, args); sendLog('info', args); };
      console.warn = function() { const args = Array.from(arguments); originalConsole.warn.apply(console, args); sendLog('warn', args); };
      console.error = function() { const args = Array.from(arguments); originalConsole.error.apply(console, args); sendLog('error', args); };

      // 4. Global Error Handlers (Suppress masked cross-origin noise)
      window.onerror = function(message, source, lineno, colno, error) {
        const msgStr = String(message || '');
        if (
          msgStr === 'Script error.' ||
          msgStr === 'Script error' ||
          msgStr.includes('ResizeObserver')
        ) {
          return true;
        }

        if (currentRunId) {
          window.parent.postMessage({
            protocol: PROTOCOL,
            sessionId: SESSION_ID,
            runId: currentRunId,
            type: 'ERROR',
            payload: {
              category: 'AsyncRuntimeError',
              message: msgStr,
              stack: error && error.stack ? error.stack : undefined,
              line: lineno
            }
          }, '*');
        }
        return false;
      };

      window.onunhandledrejection = function(event) {
        const reason = event.reason;
        const reasonStr = reason instanceof Error ? reason.message : String(reason || '');
        if (
          reasonStr === 'Script error.' ||
          reasonStr === 'Script error' ||
          reasonStr.includes('ResizeObserver')
        ) {
          return;
        }

        if (currentRunId) {
          window.parent.postMessage({
            protocol: PROTOCOL,
            sessionId: SESSION_ID,
            runId: currentRunId,
            type: 'ERROR',
            payload: {
              category: 'AsyncRuntimeError',
              message: reasonStr,
              stack: reason instanceof Error ? reason.stack : undefined
            }
          }, '*');
        }
      };

      // 5. Universal Lucide Icon Factory
      const ICONS_PATH_MAP = {
        Play: '<polygon points="6 3 20 12 6 21 6 3"/>',
        Pause: '<rect width="4" height="16" x="6" y="4"/><rect width="4" height="16" x="14" y="4"/>',
        RotateCcw: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
        Sparkles: '<path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>',
        Eye: '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
        EyeOff: '<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/>',
        Heart: '<path d="19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
        User: '<path d="19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
        Plus: '<path d="5 12h14"/><path d="M12 5v14"/>',
        Trash2: '<path d="3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>',
        Edit3: '<path d="12 20h9"/><path d="16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
        Check: '<path d="20 6 9 17l-5-5"/>',
        X: '<path d="18 6 6 18"/><path d="m6 6 12 12"/>',
      };

      function createLucideIcon(iconName) {
        const svgInner = ICONS_PATH_MAP[iconName] || '<circle cx="12" cy="12" r="9"/>';
        return function LucideIcon(props) {
          props = props || {};
          const className = props.className || 'w-4 h-4';
          const size = props.size || 16;
          const color = props.color || 'currentColor';
          const strokeWidth = props.strokeWidth || 2;
          return window.React.createElement('svg', Object.assign({
            xmlns: 'http://www.w3.org/2000/svg',
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: props.fill || 'none',
            stroke: color,
            strokeWidth: strokeWidth,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            className: className,
            dangerouslySetInnerHTML: { __html: svgInner },
          }, props));
        };
      }

      const LucideProxy = new Proxy({}, {
        get: function(target, prop) {
          if (typeof prop !== 'string' || prop === 'default' || prop === '__esModule') {
            return target[prop];
          }
          if (!target[prop]) {
            target[prop] = createLucideIcon(prop);
          }
          return target[prop];
        }
      });
      LucideProxy.__esModule = true;
      LucideProxy.default = LucideProxy;

      function withoutLeadingSlash(value) {
        return value && value.charAt(0) === '/' ? value.slice(1) : value;
      }

      // 6. Virtual CommonJS Module Loader
      function RunnerLoader(compiledModules, wrappedReact) {
        this.modules = compiledModules;
        this.cache = new Map();
        this.wrappedReact = wrappedReact;
      }

      RunnerLoader.prototype.require = function(specifier, currentPath) {
        currentPath = currentPath || '/App.tsx';
        if (specifier === 'react' || specifier === 'react/jsx-runtime') {
          return this.wrappedReact;
        }
        if (specifier === 'react-dom' || specifier === 'react-dom/client') {
          return window.ReactDOM;
        }
        if (specifier === 'zustand' || specifier.startsWith('zustand')) {
          return window.Zustand || { create: function() { return function() { return {}; }; } };
        }
        if (specifier.startsWith('lucide-react')) {
          return LucideProxy;
        }

        if (specifier === 'next/server') {
          return {
            NextResponse: {
              json: function(data, init) {
                return {
                  status: (init && init.status) || 200,
                  json: async function() { return data; },
                  text: async function() { return JSON.stringify(data); }
                };
              }
            }
          };
        }
        if (specifier === 'next/navigation') {
          return {
            useRouter: function() { return { push: function() {}, replace: function() {}, back: function() {} }; },
            usePathname: function() { return '/'; },
            useSearchParams: function() { return new URLSearchParams(); }
          };
        }
        if (specifier === 'next/link') {
          return {
            default: function(props) {
              return window.React.createElement('a', Object.assign({}, props, { href: props.href || '#' }), props.children);
            }
          };
        }
        if (specifier === 'next/image') {
          return {
            default: function(props) {
              return window.React.createElement('img', Object.assign({}, props, { src: props.src || '' }));
            }
          };
        }
        if (specifier.startsWith('next/font')) {
          return {
            default: function() { return { className: 'font-sans' }; }
          };
        }

        const resolved = this.resolve(specifier, currentPath);
        if (this.cache.has(resolved)) {
          return this.cache.get(resolved).exports;
        }

        const code = this.modules[resolved] ?? this.modules[withoutLeadingSlash(resolved)];
        if (!code) {
          throw new Error("Cannot find module '" + specifier + "' imported from '" + currentPath + "'");
        }

        const mod = { exports: {} };
        this.cache.set(resolved, mod);

        const self = this;
        const customRequire = function(nextSpec) { return self.require(nextSpec, resolved); };
        const fn = new Function('require', 'module', 'exports', 'React', 'localStorage', 'sessionStorage', 'console', code);
        fn(customRequire, mod, mod.exports, self.wrappedReact, virtualStorage, virtualStorage, window.console);

        return mod.exports;
      };

      RunnerLoader.prototype.resolve = function(specifier, currentPath) {
        if (specifier.startsWith('/')) return specifier;
        if (!specifier.startsWith('.')) return '/' + specifier;

        const dir = currentPath.substring(0, currentPath.lastIndexOf('/'));
        const combined = dir + '/' + specifier;
        const parts = combined.split('/');
        const stack = [];
        for (let i = 0; i < parts.length; i++) {
          const p = parts[i];
          if (!p || p === '.') continue;
          if (p === '..') {
            if (stack.length > 0) stack.pop();
          } else {
            stack.push(p);
          }
        }
        const norm = '/' + stack.join('/');
        const self = this;
        const has = function(p) { return Boolean(self.modules[p] || self.modules[withoutLeadingSlash(p)]); };
        if (has(norm)) return norm;
        const exts = ['.tsx', '.ts', '.jsx', '.js', '.css', '/index.tsx', '/index.ts', '/index.jsx', '/index.js'];
        for (let j = 0; j < exts.length; j++) {
          if (has(norm + exts[j])) return norm + exts[j];
        }
        return norm;
      };

      // 7. Execution Function (Strict React 19 Single Instance)
      function executeProject(runId, entryPath, modules) {
        currentRunId = runId;
        logCount = 0;

        if (!isRuntimeReady || !window.React || !window.ReactDOM || !window.ReactDOM.createRoot) {
          pendingExecution = { runId, entryPath, modules };
          return;
        }

        window.parent.postMessage({
          protocol: PROTOCOL,
          sessionId: SESSION_ID,
          runId: runId,
          type: 'RUN_START'
        }, '*');

        const rootEl = document.getElementById('root');
        if (!rootEl) return;

        try {
          const wrappedReact = new Proxy(window.React, {
            get: function(target, prop) {
              if (prop === '__esModule') return true;
              if (prop === 'default') return wrappedReact;
              return target[prop];
            }
          });

          const loader = new RunnerLoader(modules, wrappedReact);

          // 1. Reconcile virtual CSS. A fresh loader runs each revision, so
          // removing previous tags prevents deleted or renamed styles leaking.
          const previousVirtualStyles = document.querySelectorAll('style[data-virtual-css]');
          for (let s = 0; s < previousVirtualStyles.length; s++) {
            previousVirtualStyles[s].remove();
          }

          // Auto-evaluate all CSS modules in the project
          for (const modPath in modules) {
            if (modPath.endsWith('.css') && modPath.startsWith('/')) {
              try {
                loader.require(modPath, '');
              } catch(e) {
                console.warn('Auto-CSS load error:', modPath, e);
              }
            }
          }

          // 1b. Reconcile index.html into the iframe DOM
          const htmlModulePath = modules['/index.html'] ? '/index.html' : (modules['index.html'] ? 'index.html' : null);
          if (htmlModulePath) {
            try {
              const htmlExports = loader.require(htmlModulePath, '');
              const rawHtml = typeof htmlExports === 'string' ? htmlExports : (htmlExports && htmlExports.default ? htmlExports.default : '');
              if (rawHtml && rawHtml.trim()) {
                const parser = new DOMParser();
                const doc = parser.parseFromString(rawHtml, 'text/html');

                // 1. Reconcile <title>
                if (doc.title) {
                  document.title = doc.title;
                }

                // 2. Reconcile custom inline styles in head from index.html
                const previousHtmlStyles = document.querySelectorAll('style[data-index-html-style]');
                for (let s = 0; s < previousHtmlStyles.length; s++) {
                  previousHtmlStyles[s].remove();
                }
                const headStyles = doc.head ? doc.head.querySelectorAll('style') : [];
                for (let hs = 0; hs < headStyles.length; hs++) {
                  const st = headStyles[hs];
                  const newStyle = document.createElement('style');
                  newStyle.setAttribute('data-index-html-style', 'true');
                  newStyle.textContent = st.textContent;
                  document.head.appendChild(newStyle);
                }

                // 3. Reconcile body markup and #root container
                const parsedRoot = doc.body ? doc.body.querySelector('#root') : null;
                if (!parsedRoot) {
                  throw new Error("File 'index.html' bị thiếu thẻ <div id=\\"root\\"></div>. React không thể tìm thấy phần tử DOM để render ứng dụng.");
                }

                // Reconcile attributes on actual #root (e.g. class, style)
                if (rootEl) {
                  const existingAttrNames = Array.from(rootEl.attributes).map(function(a) { return a.name; });
                  for (let ea = 0; ea < existingAttrNames.length; ea++) {
                    const aName = existingAttrNames[ea];
                    if (aName !== 'id' && !parsedRoot.hasAttribute(aName)) {
                      rootEl.removeAttribute(aName);
                    }
                  }
                  for (let pa = 0; pa < parsedRoot.attributes.length; pa++) {
                    const attr = parsedRoot.attributes[pa];
                    rootEl.setAttribute(attr.name, attr.value);
                  }
                }

                // Reconcile elements before and after #root in __user_html_wrapper__
                let wrapper = document.getElementById('__user_html_wrapper__');
                if (!wrapper) {
                  wrapper = document.createElement('div');
                  wrapper.id = '__user_html_wrapper__';
                  if (rootEl.parentNode) {
                    rootEl.parentNode.insertBefore(wrapper, rootEl);
                    wrapper.appendChild(rootEl);
                  }
                }

                if (wrapper) {
                  // Remove non-root children
                  const children = Array.from(wrapper.childNodes);
                  for (let c = 0; c < children.length; c++) {
                    if (children[c] !== rootEl) {
                      children[c].remove();
                    }
                  }

                  // Insert parsed elements in order (ignoring script tags so the browser doesn't try network fetches)
                  let reachedRoot = false;
                  const bodyNodes = Array.from(doc.body.childNodes);
                  for (let bn = 0; bn < bodyNodes.length; bn++) {
                    const node = bodyNodes[bn];
                    if (node.nodeType === 1 && node.tagName && node.tagName.toLowerCase() === 'script') {
                      continue;
                    }
                    if (node.nodeType === 1 && node.id === 'root') {
                      reachedRoot = true;
                    } else if (!reachedRoot) {
                      wrapper.insertBefore(node.cloneNode(true), rootEl);
                    } else {
                      wrapper.appendChild(node.cloneNode(true));
                    }
                  }
                }
              }
            } catch (htmlErr) {
              console.warn('Error applying index.html:', htmlErr);
              throw htmlErr;
            }
          }

          // 2. Load Entry Component
          let targetPath = entryPath;
          if (targetPath.endsWith('layout.tsx') || targetPath.endsWith('layout.ts')) {
            targetPath = '/app/page.tsx';
          }

          // If /src/main.tsx exists, it is ALWAYS the primary application bootstrap entry!
          if (modules['/src/main.tsx'] || modules['src/main.tsx']) {
            targetPath = modules['/src/main.tsx'] ? '/src/main.tsx' : 'src/main.tsx';
          } else if (targetPath.endsWith('.html') || (!modules[targetPath] && !modules[withoutLeadingSlash(targetPath)])) {
            if (modules['/src/App.tsx'] || modules['src/App.tsx']) {
              targetPath = modules['/src/App.tsx'] ? '/src/App.tsx' : 'src/App.tsx';
            } else if (modules['/App.tsx'] || modules['App.tsx']) {
              targetPath = modules['/App.tsx'] ? '/App.tsx' : 'App.tsx';
            } else {
              targetPath = entryPath;
            }
          }

          const entryExports = loader.require(targetPath, '');
          let RootComponent = entryExports.default || entryExports.Page || entryExports.App;

          // If entry is main.tsx and rendered into DOM or exported App:
          if (!RootComponent) {
            if (modules['/src/App.tsx'] || modules['src/App.tsx']) {
              try {
                const appExp = loader.require(modules['/src/App.tsx'] ? '/src/App.tsx' : 'src/App.tsx', '');
                RootComponent = appExp.default || appExp.App || appExp;
              } catch(e) {}
            } else if (modules['/App.tsx'] || modules['App.tsx']) {
              try {
                const appExp = loader.require(modules['/App.tsx'] ? '/App.tsx' : 'App.tsx', '');
                RootComponent = appExp.default || appExp.App || appExp;
              } catch(e) {}
            }
          }

          if (!RootComponent && rootEl.childNodes.length === 0 && !window.__REACT_ACTIVE_ROOT__) {
            RootComponent = entryExports;
          }

          if (!RootComponent && rootEl.childNodes.length === 0 && !window.__REACT_ACTIVE_ROOT__) {
            throw new Error("File '" + targetPath + "' không export một React Component hợp lệ dưới dạng export default.");
          }

          // Check if Root Layout exists
          let LayoutComponent = null;
          try {
            if (modules['/app/layout.tsx'] || modules['app/layout.tsx']) {
              const layoutExports = loader.require('/app/layout.tsx', '');
              LayoutComponent = layoutExports.default || layoutExports.RootLayout;
            }
          } catch(e) {}

          // If main.tsx did not create a root via ReactDOM.createRoot, fallback to manual rendering
          if (!window.__REACT_ACTIVE_ROOT__ && RootComponent && (typeof RootComponent === 'function' || typeof RootComponent === 'object')) {
            if (!rootInstance) {
              rootEl.innerHTML = '';
              rootInstance = window.ReactDOM.createRoot(rootEl);
            }

            let element = window.React.createElement(RootComponent);
            if (LayoutComponent && typeof LayoutComponent === 'function' && RootComponent !== LayoutComponent) {
              element = window.React.createElement(LayoutComponent, null, element);
            }

            rootInstance.render(element);
          }

          // Announce Render Success
          window.parent.postMessage({
            protocol: PROTOCOL,
            sessionId: SESSION_ID,
            runId: runId,
            type: 'RENDER_SUCCESS'
          }, '*');
        } catch (err) {
          const errMsg = err instanceof Error ? err.message : String(err);
          const errStack = err instanceof Error ? err.stack : undefined;
          
          rootEl.innerHTML = '<div style="padding:16px;background:#450a0a;border:1px solid #dc2626;color:#fecaca;font-family:monospace;border-radius:8px;font-size:13px;">' +
            '<b style="color:#f87171;">⚠️ Lỗi Thực thi (Execution Error):</b><br/><pre style="white-space:pre-wrap;margin-top:8px;">' + errMsg + '</pre>' +
            (errStack ? '<pre style="opacity:0.6;font-size:11px;margin-top:6px;overflow-x:auto;">' + errStack + '</pre>' : '') +
            '</div>';

          window.parent.postMessage({
            protocol: PROTOCOL,
            sessionId: SESSION_ID,
            runId: runId,
            type: 'ERROR',
            payload: {
              category: 'ModuleExecutionError',
              message: errMsg,
              stack: errStack
            }
          }, '*');
        }
      }

      // 8. Attach PostMessage Listener
      window.addEventListener('message', function(event) {
        const data = event.data;
        if (!data || data.protocol !== PROTOCOL || data.sessionId !== SESSION_ID) {
          return;
        }

        if (data.type === 'PING') {
          if (isRuntimeReady) {
            window.parent.postMessage({ protocol: PROTOCOL, sessionId: SESSION_ID, type: 'READY' }, '*');
          }
        } else if (data.type === 'EXECUTE') {
          if (isRuntimeReady) {
            executeProject(data.runId, data.entryPath, data.modules);
          } else {
            currentRunId = data.runId;
            pendingExecution = data;
          }
        } else if (data.type === 'RESET') {
          if (rootInstance) {
            try { rootInstance.unmount(); } catch(e) {}
            rootInstance = null;
          }
          const rootEl = document.getElementById('root');
          if (rootEl) rootEl.innerHTML = '';
          const virtualStyles = document.querySelectorAll('style[data-virtual-css]');
          for (let s = 0; s < virtualStyles.length; s++) {
            virtualStyles[s].remove();
          }
          currentRunId = '';
        }
      });

      // 9. Asynchronous Polling for Unified React 19.2.8 availability
      function bootstrapRuntime(attempts) {
        attempts = attempts || 0;
        if (window.__REACT_RUNTIME_READY__ === true && window.React && window.ReactDOM && window.ReactDOM.createRoot) {
          if (isRuntimeReady) return;
          isRuntimeReady = true;

          const rootEl = document.getElementById('root');
          if (rootEl) rootEl.innerHTML = '';

          // Announce Ready to parent
          window.parent.postMessage({
            protocol: PROTOCOL,
            sessionId: SESSION_ID,
            type: 'READY'
          }, '*');

          // Execute pending request
          if (pendingExecution) {
            executeProject(pendingExecution.runId, pendingExecution.entryPath, pendingExecution.modules);
            pendingExecution = null;
          }
          return;
        }

        if (window.__REACT_RUNTIME_ERROR__) {
          window.parent.postMessage({
            protocol: PROTOCOL,
            sessionId: SESSION_ID,
            runId: currentRunId || 'bootstrap',
            type: 'ERROR',
            payload: {
              category: 'RuntimeBootstrapError',
              message: 'Không thể tải React 19.2.8 Runtime: ' + window.__REACT_RUNTIME_ERROR__
            }
          }, '*');
          const rootEl = document.getElementById('root');
          if (rootEl) {
            rootEl.innerHTML = '<div style="padding:16px;background:#450a0a;border:1px solid #dc2626;color:#fecaca;font-family:monospace;border-radius:8px;font-size:12px;">' +
              '<b>⚠️ Không thể tải React 19.2.8 Runtime:</b> ' + window.__REACT_RUNTIME_ERROR__ + '<br/>Vui lòng kiểm tra kết nối mạng hoặc tắt extension chặn CDN.</div>';
          }
          return;
        }

        if (attempts < 1000) {
          setTimeout(function() { bootstrapRuntime(attempts + 1); }, 20);
        } else {
          window.parent.postMessage({
            protocol: PROTOCOL,
            sessionId: SESSION_ID,
            runId: currentRunId || 'bootstrap',
            type: 'ERROR',
            payload: {
              category: 'RuntimeBootstrapError',
              message: 'Quá thời gian tải React 19.2.8 Runtime.'
            }
          }, '*');
          const rootEl = document.getElementById('root');
          if (rootEl) {
            rootEl.innerHTML = '<div style="padding:16px;background:#450a0a;border:1px solid #dc2626;color:#fecaca;font-family:monospace;border-radius:8px;font-size:12px;">' +
              '<b>⚠️ Quá thời gian tải React 19.2.8 Runtime:</b> Vui lòng kiểm tra kết nối mạng hoặc thử tải lại.</div>';
          }
        }
      }

      // Module scripts can finish after a slow cold CDN request. Events allow
      // the runner to recover even if the defensive polling window elapsed.
      window.addEventListener('react-runtime-ready', function() { bootstrapRuntime(0); });
      window.addEventListener('react-runtime-error', function() { bootstrapRuntime(0); });

      // Start bootstrap with a 20-second cold-load window.
      bootstrapRuntime(0);
    })();
  </script>
</body>
</html>`;
}
