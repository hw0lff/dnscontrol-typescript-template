/* a small logging setup */

// Levels: OFF, ERROR, WARN, INFO, DEBUG, TRACE
enum LEVELS {
    off = -1,
    error = 0,
    warn = 1,
    info = 2,
    debug = 3,
    trace = 4,
}

// dnscontrol env var
CLI_DEFAULTS({
    log_level: LEVELS.info,
});

import { convertElementsToString } from "./10-helpers";
import { c } from "./20-color";

const __clog = console.log;

var __GLOBAL_LOG_COUNTER = 0;
const __GLC_VISIBLE = false;
function incGlc() {
    __GLOBAL_LOG_COUNTER += 10;
    if (__GLC_VISIBLE) {
        __clog(__GLOBAL_LOG_COUNTER);
    }
}

function __llfmt(lvl: LEVELS) {
    return "" + LEVELS[lvl] + "(" + __logLevelToInt(lvl.valueOf()) + ")";
}
function __logLevelToInt(lvl: LEVELS): number {
    return lvl;
}
function __enableLog(lvl: LEVELS) {
    if (lvl <= LEVELS[log_level as keyof typeof LEVELS]) {
        return true;
    }
    return false;
}
function __log(lvl: LEVELS, ...t: any) {
    if (__GLC_VISIBLE) {
        console.log(
            "(" + __llfmt(lvl),
            "<=",
            __llfmt(LEVELS[log_level as keyof typeof LEVELS]) + ") ~> " + __enableLog(lvl),
        );
    }
    if (__enableLog(lvl)) {
        incGlc();
        __clog(t);
    }
}

//
// Only use these functions

export function error(...args: any[]) {
    const text = convertElementsToString(args).join(" ");
    __log(LEVELS.error, c.red("ERROR ") + text);
}
export function warn(...args: any[]) {
    const text = convertElementsToString(args).join(" ");
    __log(LEVELS.warn, c.yellow("WARN ") + text);
}
export function info(...args: any[]) {
    const text = convertElementsToString(args).join(" ");
    __log(LEVELS.info, c.green("INFO ") + text);
}
export function debug(...args: any[]) {
    const text = convertElementsToString(args).join(" ");
    __log(LEVELS.debug, c.blue("DEBUG ") + text);
}
export function trace(...args: any[]) {
    const text = convertElementsToString(args).join(" ");
    __log(LEVELS.trace, c.cyan("TRACE ") + text);
}
