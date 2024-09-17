import path from "path";

export default {
    mode: "production",
    entry: "./src/dnsconfig.ts",
    output: {
        filename: "dnsconfig.js",
        clean: true,
        path: path.resolve("output/webpack"),
        chunkFormat: "commonjs",
    },
    resolve: {
        extensions: [".ts", ".js"],
        modules: ["src", "node_modules"].map((x) => path.resolve(x)),
    },
    module: {
        rules: [
            {
                test: /\.[tj]s$/,
                use: "ts-loader",
                use: "babel-loader",
                exclude: /node_modules/,
            },
        ],
    },
    target: ["es5"],
    optimization: {
        minimize: false,
        // splitChunks: false,
        // runtimeChunk: false,
        // moduleIds: "named",
    },
};
