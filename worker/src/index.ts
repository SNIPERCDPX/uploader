/* eslint-disable no-case-declarations */
/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.toml`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

const keyMapping = {
	nDHsK8EOLxHGyh: 'loyalty',
	bcxMEav14xqVgx: 'cdpx',
	QG2LFnFZX863eI: 'afterservice',
	DEFAULT: 'default',
};

export default {
	async fetch(request, env, ctx): Promise<Response> {
		switch (request.method) {
			case 'GET':
				return Response.redirect('https://upload.sniper.tech', 301);
			case 'POST':
				//body is form data
				const body = await request.formData();
				const file = body.get('file');
				const token: string = (body.get('token') as string) || 'DEFAULT';
				if (!token) {
					return new Response('No token found', { status: 400 });
				}
				if (!token || typeof token !== 'string') {
					return new Response('No token found', { status: 400 });
				}
				if (!file || !(file instanceof File)) {
					return new Response('No file found', { status: 400 });
				}
				// 2024-08-29/TIMESTAMP-FILENAME.FILEXTENSION
				const date = new Date();
				const timestamp = date.getTime();
				const fileName = file.name;
				const newFileName = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}/${timestamp}-${fileName}`;
				const key = `${keyMapping[token as keyof typeof keyMapping]}/${newFileName}`;
				const fileContents = await file.arrayBuffer();  // Convert file to ArrayBuffer
				await env.USER_CONTENT.put(key, fileContents);
				return new Response(`https://usercontent.sniper.tech/${key}`, {
					status: 201,
					headers: {
						'Content-Type': 'text/plain',
					},
				});
			default:
				return new Response('Method Not Allowed', {
					status: 405,
					headers: {
						Allow: 'POST',
					},
				});
		}
	},
} satisfies ExportedHandler<Env>;
