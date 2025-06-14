### TEST
``` sh
curl -X GET http://localhost:8787/context?taskType=test \
  -H "Authorization: Bearer test"

curl -X POST http://localhost:8787/context \
  -H "Authorization: Bearer test" \
  -H "Content-Type: application/json" \
  -d '{"taskType": "test", "name": "test", "description": "test", "content": "test", "isActive": true}'

curl -X GET http://localhost:8787/discover \
  -H "Authorization: Bearer test"

curl -X GET http://localhost:8787/health \
  -H "Authorization: Bearer test"

curl -X POST http://localhost:8787/context \
  -H "Authorization: Bearer test" \
  -H "Content-Type: application/json" \
  -d '{
    "taskType": "test-task",
    "name": "Test Rule",
    "description": "This is a test rule",
    "content": { "foo": "bar" },
    "isActive": true
  }'

```

### DB 初始化
``` sh
npx wrangler d1 execute mcp-db --file=./architecture/schema.sql --remote
```

### DEV 啟動
``` sh
wrangler dev --remote
```