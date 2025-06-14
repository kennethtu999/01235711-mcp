import { getDrizzle } from '../db';
import { ApiToken } from '../db/schema';
import { eq } from 'drizzle-orm';

export class ApiTokenService {
  private orm;
  constructor(private db: D1Database) {
    this.orm = getDrizzle(db);
  }

  async isValidToken(token: string) {
    // 這裡假設 token 已經是 hashed，若要支援明文請自行 hash
    const result = await this.orm.select().from(ApiToken).where(eq(ApiToken.hashedToken, token)).limit(1);
    return result.length > 0;
  }
} 