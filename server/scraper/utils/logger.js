const c = {
    reset: "\x1b[0m",
    bold: "\x1b[1m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    cyan: "\x1b[36m",
    gray: "\x1b[90m",
    magenta: "\x1b[35m",
};

function ts() {
    return new Date().toISOString().replace("T", " ").slice(0, 19);
}

export const logger = {
    info: (msg, ...a) =>
        console.log(
            `${c.gray}${ts()}${c.reset} ${c.cyan}[INFO]${c.reset}  ${msg}`,
            ...a,
        ),
    success: (msg, ...a) =>
        console.log(
            `${c.gray}${ts()}${c.reset} ${c.green}[OK]${c.reset}    ${msg}`,
            ...a,
        ),
    warn: (msg, ...a) =>
        console.log(
            `${c.gray}${ts()}${c.reset} ${c.yellow}[WARN]${c.reset}  ${msg}`,
            ...a,
        ),
    error: (msg, ...a) =>
        console.error(
            `${c.gray}${ts()}${c.reset} ${c.red}[ERR]${c.reset}   ${msg}`,
            ...a,
        ),
    skip: (msg, ...a) =>
        console.log(`${c.gray}${ts()}  [SKIP]  ${msg}${c.reset}`, ...a),
    section: (msg) => {
        const line = "─".repeat(64);
        console.log(`\n${c.bold}${c.blue}${line}${c.reset}`);
        console.log(`${c.bold}  ${msg}${c.reset}`);
        console.log(`${c.bold}${c.blue}${line}${c.reset}\n`);
    },
    stat: (label, value, extra = "") => {
        console.log(
            `${c.gray}${ts()}${c.reset} ${c.magenta}[STAT]${c.reset}  ${c.bold}${label}:${c.reset} ${value} ${c.gray}${extra}${c.reset}`,
        );
    },
};
