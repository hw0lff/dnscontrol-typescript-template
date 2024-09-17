/* ansi escape sequence wrapper functions */

const COLOR_RST = "\x1b[0m";

export const c = {
    fg: function (r: number, g: number, b: number, s: string) {
        return "\x1b[38;2;" + r + ";" + g + ";" + b + "m" + s + COLOR_RST;
    },
    bg: function (r: number, g: number, b: number, s: string) {
        return "\x1b[48;2;" + r + ";" + g + ";" + b + "m" + s + COLOR_RST;
    },
    bold: function (s: string) {
        return "\x1b[1m" + s + COLOR_RST;
    },
    italic: function (s: string) {
        return "\x1b[3m" + s + COLOR_RST;
    },
    rev: function (s: string) {
        return "\x1b[7m" + s + COLOR_RST;
    },
    //

    black: function (s: string) {
        return "\x1b[30m" + s + COLOR_RST;
    },
    red: function (s: string) {
        return "\x1b[31m" + s + COLOR_RST;
    },
    green: function (s: string) {
        return "\x1b[32m" + s + COLOR_RST;
    },
    yellow: function (s: string) {
        return "\x1b[33m" + s + COLOR_RST;
    },
    blue: function (s: string) {
        return "\x1b[34m" + s + COLOR_RST;
    },
    magenta: function (s: string) {
        return "\x1b[35m" + s + COLOR_RST;
    },
    cyan: function (s: string) {
        return "\x1b[36m" + s + COLOR_RST;
    },
    white: function (s: string) {
        return "\x1b[37m" + s + COLOR_RST;
    },
    //

    bgblack: function (s: string) {
        return "\x1b[40m" + s + COLOR_RST;
    },
    bgred: function (s: string) {
        return "\x1b[41m" + s + COLOR_RST;
    },
    bggreen: function (s: string) {
        return "\x1b[42m" + s + COLOR_RST;
    },
    bgyellow: function (s: string) {
        return "\x1b[43m" + s + COLOR_RST;
    },
    bgblue: function (s: string) {
        return "\x1b[44m" + s + COLOR_RST;
    },
    bgmagenta: function (s: string) {
        return "\x1b[45m" + s + COLOR_RST;
    },
    bgcyan: function (s: string) {
        return "\x1b[46m" + s + COLOR_RST;
    },
    bgwhite: function (s: string) {
        return "\x1b[47m" + s + COLOR_RST;
    },
    //

    boldblack: function (s: string) {
        return "\x1b[30m" + c.bold(s) + COLOR_RST;
    },
    boldred: function (s: string) {
        return "\x1b[31m" + c.bold(s) + COLOR_RST;
    },
    boldgreen: function (s: string) {
        return "\x1b[32m" + c.bold(s) + COLOR_RST;
    },
    boldyellow: function (s: string) {
        return "\x1b[33m" + c.bold(s) + COLOR_RST;
    },
    boldblue: function (s: string) {
        return "\x1b[34m" + c.bold(s) + COLOR_RST;
    },
    boldmagenta: function (s: string) {
        return "\x1b[35m" + c.bold(s) + COLOR_RST;
    },
    boldcyan: function (s: string) {
        return "\x1b[36m" + c.bold(s) + COLOR_RST;
    },
    boldwhite: function (s: string) {
        return "\x1b[37m" + c.bold(s) + COLOR_RST;
    },
    // END COLOR
};
