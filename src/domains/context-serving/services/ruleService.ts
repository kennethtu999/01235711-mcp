import { getDrizzle } from '../db';
import { Rule } from '../db/schema';
import { eq } from 'drizzle-orm';
// Cloudflare Worker D1 DB 存取服務
export class RuleService {
  private orm;

  constructor(private db: D1Database) {
    this.orm = getDrizzle(db);
  }

  async getRuleByTaskType(taskType: string) {
    console.debug(`Attempting to fetch rule by taskType: ${taskType}`);
    const result = await this.orm.select().from(Rule).where(eq(Rule.taskType, taskType)).limit(1);
    console.debug(`Fetched rule: ${JSON.stringify(result[0] || null)}`);
    return result[0] || null;
  }

  async upsertRule(rule: {
    taskType: string;
    name: string;
    description?: string;
    content: object;
    isActive: boolean;
  }) {
    console.debug(`Attempting to upsert rule: ${JSON.stringify(rule)}`);
    const existing = await this.getRuleByTaskType(rule.taskType);
    if (existing) {
      console.debug(`Updating existing rule for taskType: ${rule.taskType}`);
      await this.orm.update(Rule)
        .set({
          name: rule.name,
          description: rule.description,
          content: JSON.stringify(rule.content),
          isActive: rule.isActive,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(Rule.taskType, rule.taskType));
      console.debug(`Updated rule: ${JSON.stringify({ ...existing, ...rule })}`);
      return { ...existing, ...rule };
    } else {
      console.debug(`Inserting new rule for taskType: ${rule.taskType}`);
      await this.orm.insert(Rule).values({
        taskType: rule.taskType,
        name: rule.name,
        description: rule.description,
        content: JSON.stringify(rule.content),
        isActive: rule.isActive,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      console.debug(`Inserted rule: ${JSON.stringify(rule)}`);
      return rule;
    }
  }

  async getAllRuleSummaries() {
    console.debug(`Fetching all rule summaries`);
    const summaries = await this.orm.select({
      id: Rule.id,
      taskType: Rule.taskType,
      name: Rule.name,
      isActive: Rule.isActive,
    }).from(Rule);
    console.debug(`Fetched rule summaries: ${JSON.stringify(summaries)}`);
    return summaries;
  }
} 