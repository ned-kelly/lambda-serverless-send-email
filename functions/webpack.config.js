var path = require('path'),
    fs = require('fs'),
    CheckerPlugin = require('awesome-typescript-loader').CheckerPlugin;

// Helper functions
var ROOT = path.resolve(__dirname, '..');

function root(args) {
    args = Array.prototype.slice.call(arguments, 0);
    return path.join.apply(path, [ROOT].concat(args));
}

//Detect handlers
function searchEntryHandlers() {
    var foundHandlers = [];
    var handlerFile = 'handler.ts';

    //Scan directory structure
    var detectPath = __dirname;
    var folders = fs.readdirSync(detectPath)
        .filter(file => file !== 'dist' && fs.statSync(path.join(detectPath, file)).isDirectory());

    //Inspect level 1
    folders.forEach(folder => {
        var handlerPath = path.join(detectPath, folder, handlerFile);
        try {
            var hasHandler = fs.statSync(handlerPath);
            if (hasHandler.isFile()) {
                console.log(`Found file ${folder}/${handlerFile}`);
                foundHandlers.push(`${folder}/${handlerFile}`);
            } else {
                console.log(`Searching for ${folder}/${handlerFile}, missing file.`);
            }
        } catch(ex) {
            console.log(`Searching for ${folder}/${handlerFile}, missing file.`);
        }
    });

    var entrypoints = {};
    foundHandlers.forEach(handler => {
        var handlerName = handler.substring(0, handler.lastIndexOf('.'));
        entrypoints[handlerName] = `./${handler}`;
    });

    console.log('Using endpoints', entrypoints);
    return entrypoints;
}

module.exports = (debug) => {
    var externals = debug
        ? ['aws-sdk', 'request']
        : [];

    return {
        entry: searchEntryHandlers(),
        target: 'node',
        watch: !!debug,
        watchOptions: {
            aggregateTimeout: 100,
            ignored: /node_modules/
        },
        externals: externals, // modules to be excluded from bundled file
        devtool: 'inline-source-map',
        resolve: {
            extensions: ['.ts', '.tsx', '.js', '.json'],
            modules: [
                root('src'),
                'node_modules'
            ]
        },
        output: {
            libraryTarget: 'commonjs',
            path: path.join(__dirname, '/dist'),
            filename: '[name].js'
        },
        module: {
            loaders: [
                {
                    test: /\.ts?$/,
                    loader: 'awesome-typescript-loader',
                },
                {
                    test: /\.json$/,
                    loader: 'json-loader'
                }
            ]
        },
        plugins: [
            new CheckerPlugin()
        ]
    }
};