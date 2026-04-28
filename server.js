const express = require('express');
const path = require('path');
const crypto = require('crypto');

try {
	require('dotenv').config();
} catch (err) {
	// dotenv is optional; environment variables can come from the shell.
}

const app = express();
const ROOT = __dirname;
const PORT = process.env.PORT || 8081;

app.use(express.json({ limit: '256kb' }));
app.use(express.static(ROOT));

function buildCloudinarySignature(params, apiSecret) {
	const toSign = Object.keys(params)
		.filter((key) => params[key] !== undefined && params[key] !== null && params[key] !== '')
		.sort()
		.map((key) => key + '=' + params[key])
		.join('&');
	return crypto.createHash('sha1').update(toSign + apiSecret).digest('hex');
}

app.get('/api/health', (req, res) => {
	res.json({ ok: true, service: 'birthday-upload-server' });
});

app.post('/api/cloudinary/signature', (req, res) => {
	const configuredCloudName = process.env.CLOUDINARY_CLOUD_NAME;
	const apiKey = process.env.CLOUDINARY_API_KEY;
	const apiSecret = process.env.CLOUDINARY_API_SECRET;

	if (!configuredCloudName || !apiKey || !apiSecret) {
		return res.status(500).json({
			error: 'Cloudinary server config missing. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.'
		});
	}

	const requestedCloudName = req.body && req.body.cloudName ? String(req.body.cloudName) : '';
	if (requestedCloudName && requestedCloudName !== configuredCloudName) {
		return res.status(400).json({ error: 'Cloud name mismatch.' });
	}

	const timestamp = Math.floor(Date.now() / 1000);
	const signature = buildCloudinarySignature({ timestamp: timestamp }, apiSecret);

	return res.json({
		cloudName: configuredCloudName,
		apiKey: apiKey,
		timestamp: timestamp,
		signature: signature
	});
});

app.listen(PORT, () => {
	console.log('Birthday server running on http://127.0.0.1:' + PORT);
});
