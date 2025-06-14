/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { verifyBearerToken } from './middleware/auth';
import { RuleService } from './domains/context-serving/services';

export default {
	/**
	 * This is the standard fetch handler for a Cloudflare Worker
	 *
	 * @param request - The request submitted to the Worker from the client
	 * @param env - The interface to reference bindings declared in wrangler.jsonc
	 * @param ctx - The execution context of the Worker
	 * @returns The response to be sent back to the client
	 */
	async fetch(request: Request, env: any, _ctx: ExecutionContext): Promise<Response> {
		console.debug('Request received:', request);
		const url = new URL(request.url);
		const ruleService = new RuleService(env.DB as D1Database);
		if (url.pathname === '/health') {
			console.debug('Health check request');
			return new Response(JSON.stringify({ status: 'ok' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
		}
		const authResult = await verifyBearerToken(request, env.DB as D1Database);
		if (authResult) {
			console.debug('Authentication failed');
			return authResult;
		}
		if (url.pathname === '/context' && request.method === 'GET') {
			console.debug('GET /context request');
			const taskType = url.searchParams.get('taskType');
			if (!taskType) {
				console.debug('Missing taskType parameter');
				return new Response('Missing taskType', { status: 400 });
			}
			const rule = await ruleService.getRuleByTaskType(taskType);
			if (!rule) {
				console.debug('Rule not found');
				return new Response('Not found', { status: 404 });
			}
			return new Response(JSON.stringify(rule), { status: 200, headers: { 'Content-Type': 'application/json' } });
		}
		if (url.pathname === '/context' && request.method === 'POST') {
			console.debug('POST /context request');
			const body = await request.json() as { taskType: string; name: string; description?: string; content: object; isActive: boolean };
			// 應包含 taskType, name, description, content, isActive
			if (!body.taskType || !body.name || typeof body.isActive !== 'boolean' || !body.content) {
				console.debug('Invalid body');
				return new Response('Invalid body', { status: 400 });
			}
			const rule = await ruleService.upsertRule(body);
			return new Response(JSON.stringify(rule), { status: 200, headers: { 'Content-Type': 'application/json' } });
		}
		if (url.pathname === '/discover' && request.method === 'GET') {
			console.debug('GET /discover request');
			const rules = await ruleService.getAllRuleSummaries();
			return new Response(JSON.stringify(rules), { status: 200, headers: { 'Content-Type': 'application/json' } });
		}
		console.debug('Not found');
		return new Response('Not found', { status: 404 });
	},
} satisfies ExportedHandler<Env>;
