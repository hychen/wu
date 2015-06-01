/** Module RPC
 *
 * Copyright (c) 2015 Chen Hsin-Yi
 * MIT License, see LICENSE file for full terms.
 */
import path = require('path');

/** Takes a process name and returns a ipc address.
 * @param {string}  processName - a process name.
 * @returns {string} ipc address.
 */
 export function rpcSocketAddr(processName: string): string {
    var runtimeDir = process.env.RUNTIME_ROOT_DIR || './.ic';
    var fname = 'ipc-process-' + processName;
    return path.join(runtimeDir, 'socket', fname);
 }
