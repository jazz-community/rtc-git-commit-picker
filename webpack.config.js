const packageJson = require('./package.json');
const JazzUpdateSitePlugin = require('jazz-update-site-webpack-plugin');

module.exports = (env) => {
   const version = (typeof env !== 'undefined' && env.buildUUID) || packageJson.version;
	const config = {
		entry: {
			app: './src/RtcCommitUrlEncoder.js',
		},
		output: {
			libraryTarget: 'var',
			library: 'com_siemens_bt_jazz_gitlab_encoding_helper',
			filename: './resources/dist/encoder-bundle.js',
		},
		
		plugins: [
			new JazzUpdateSitePlugin({
				appType: 'ccm',
				projectId: 'com.siemens.bt.jazz.workitemeditor.gitCommitPicker',
				acceptGlobPattern: [
				   'resources/**',
				   'META-INF/**',
				   'plugin.xml',
				],
				projectInfo: {
				   author: packageJson.author,
				   copyright: packageJson.author,
				   description: packageJson.description,
				   license: packageJson.license,
				   version: version,
				},
			}),
		],
	};
	return config;
};