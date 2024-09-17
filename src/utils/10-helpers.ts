/* helper functions without dependencies */

// do nothing function
export const nop: () => {} = function (): {} {
    return {};
};

// returns always a string
// sometimes it even has content!
export function isStringOrEmpty(s: any): string {
    return undefined !== isStringOrUndefined(s) ? "" + s : "";
}
export function isStringOrUndefined(s: any): string | undefined {
    return typeof s === "string" || s instanceof String ? "" + s : undefined;
}

// returns an array of all arguments that are not undefined
export function collectArgs(args: any): any[] {
    let list = [];
    for (let i = 0; i < args.length; i++) {
        if (undefined !== args[i]) {
            list.push(args[i]);
        }
    }
    return list;
}

// returns all elements converted to strings
// undefined becomes "undefined"
export function convertElementsToString(inputs: any): string[] {
    let list = [];
    for (let i = 0; i < inputs.length; i++) {
        if (undefined !== inputs[i]) {
            list.push("" + inputs[i].toString());
        } else {
            list.push("" + undefined);
        }
    }
    return list;
}

// returns an array of all arguments that are strings
export function collectStringArgs(args: any): string[] {
    let list = [];
    for (let i = 0; i < args.length; i++) {
        let arg = isStringOrUndefined(args[i]);
        if (undefined !== arg) {
            list.push(arg);
        }
    }
    return list;
}
