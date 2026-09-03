/**
 * ============================================================================
 * OFFENSIVE SECURITY ACADEMY - WEBCONTAINER WORKBENCH ADAPTER (v3.0)
 * ============================================================================
 * Connects the Offensive Security Workbench directly to the authoritative
 * WebContainer runtime for real Node.js, Web API, and Scripting execution.
 *
 * Adheres strictly to the AI Execution Constitution:
 * - Uses ONLY the existing WebContainerManager primitive in the repo.
 * - Approved for in-browser Node HTTP services, process output, and fixtures.
 * - Explicitly non-used for Linux kernel DAC/UIDs or Windows/AD simulation.
 */

import { WebContainer, type FileSystemTree } from '@webcontainer/api';
import { WebContainerManager } from '@/features/playground/engines/webcontainer/webcontainer-manager';
import { checkWebContainerSupport } from '@/features/playground/engines/webcontainer/webcontainer-guard';

export interface CommandExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export class WebContainerWorkbenchAdapter {
  private static activeInstance: WebContainer | null = null;

  /**
   * Checks whether the current browser supports WebContainer (requires SharedArrayBuffer).
   */
  public static isSupported(): { supported: boolean; reason?: string } {
    const guard = checkWebContainerSupport();
    return {
      supported: guard.supported,
      reason: guard.message,
    };
  }

  /**
   * Initializes or returns the singleton WebContainer instance.
   */
  public static async getContainer(): Promise<WebContainer> {
    if (this.activeInstance) {
      return this.activeInstance;
    }
    const wc = await WebContainerManager.getInstance();
    this.activeInstance = wc;
    return wc;
  }

  /**
   * Mounts a set of lesson fixtures (e.g., vulnerable Node API service, test runner).
   */
  public static async mountFixtures(fixtures: FileSystemTree): Promise<void> {
    const wc = await this.getContainer();
    await wc.mount(fixtures);
  }

  /**
   * Runs a command inside WebContainer and captures full stdout, stderr, and exit code.
   */
  public static async runCommand(
    cmd: string,
    args: string[] = []
  ): Promise<CommandExecutionResult> {
    const wc = await this.getContainer();
    const process = await wc.spawn(cmd, args);

    let stdout = '';
    const stderr = '';

    process.output.pipeTo(
      new WritableStream({
        write(chunk) {
          stdout += chunk;
        },
      })
    );

    const exitCode = await process.exit;
    return { stdout, stderr, exitCode };
  }

  /**
   * Reads a file from the WebContainer virtual file system.
   */
  public static async readFile(path: string): Promise<string> {
    const wc = await this.getContainer();
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return wc.fs.readFile(normalizedPath, 'utf-8');
  }

  /**
   * Writes a file to the WebContainer virtual file system.
   */
  public static async writeFile(path: string, content: string): Promise<void> {
    const wc = await this.getContainer();
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    await wc.fs.writeFile(normalizedPath, content, 'utf-8');
  }
}
