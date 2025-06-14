import { ApiTokenService } from '../domains/context-serving/services/apiTokenService';

export async function verifyBearerToken(request: Request, db: D1Database): Promise<Response | null> {
  console.debug('Verifying Bearer token');
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.debug('Authorization header is missing or invalid');
    return new Response('Unauthorized', { status: 401 });
  }
  const token = authHeader.slice(7);

  const apiTokenService = new ApiTokenService(db);
  const isValid = await apiTokenService.isValidToken(token);
  if (!isValid) {
    console.debug('Token is invalid');
    return new Response('Forbidden', { status: 403 });
  }
  console.debug('Token is valid');
  return null; // 通過驗證
} 