# KROS Production Deployment Guide

## Option A — Docker (Recommended)

### Prerequisites
- Docker 24+ and Docker Compose v2
- Domain name pointed to your server
- SSL certificate (Let's Encrypt)

### Steps

**1. Clone and configure**
```bash
git clone https://github.com/yourcompany/kros-web.git
cd kros-web
cp backend/.env.example .env
```

**2. Edit `.env`**
```bash
ANTHROPIC_API_KEY=sk-ant-your-key
DEEPSEEK_API_KEY=sk-your-deepseek-key
JWT_SECRET=$(openssl rand -base64 32)
DB_PASSWORD=$(openssl rand -base64 16)
FRONTEND_URL=https://kros.yourcompany.com.my
AI_ROUTING_MODE=auto
```

**3. Copy your Skills.md files**
```bash
# Copy all skills into the Docker volume
mkdir -p skills-volume
cp -r /path/to/your/kros/skills/* skills-volume/
```

**4. Deploy**
```bash
docker compose up -d
docker compose logs -f backend   # Watch for startup
```

**5. Verify**
```bash
curl https://kros.yourcompany.com.my/api/health
```

---

## Option B — Manual (PM2 + Nginx)

### Backend

```bash
cd backend
npm install --production
cp .env.example .env  # fill in keys

# Install PM2
npm install -g pm2

# Start
pm2 start server.js --name kros-api --env production
pm2 save
pm2 startup
```

### Frontend

```bash
cd frontend
npm install
npm run build        # Outputs to dist/

# Serve with Nginx (copy dist/ to web root)
sudo cp -r dist/* /var/www/kros/
```

### Nginx config
```nginx
server {
    listen 443 ssl;
    server_name kros.yourcompany.com.my;

    ssl_certificate     /etc/letsencrypt/live/kros.yourcompany.com.my/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/kros.yourcompany.com.my/privkey.pem;

    root /var/www/kros;
    index index.html;

    location / {
        try_files $uri /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_buffering off;      # Required for SSE streaming
        proxy_read_timeout 120s;
    }
}
```

---

## Option C — Self-Hosted DeepSeek (Maximum Data Security)

If you want DeepSeek's cost savings WITHOUT sending data to China, run DeepSeek locally:

### Hardware requirements
| DeepSeek Model | VRAM Required | Notes |
|---|---|---|
| DeepSeek-R1 7B (quantised) | 8 GB | Entry level — suitable for most KROS queries |
| DeepSeek-R1 14B | 16 GB | Better quality, still affordable GPU |
| DeepSeek-R1 32B | 24 GB | Near-cloud quality |
| DeepSeek-R1 70B | 48 GB+ | Cloud-equivalent quality |

### Using Ollama (easiest)
```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Pull DeepSeek model
ollama pull deepseek-r1:7b

# Ollama serves at http://localhost:11434
# It's OpenAI-compatible — just change the endpoint in .env:
```

```env
# In backend/.env — point DeepSeek to local Ollama
DEEPSEEK_API_URL=http://localhost:11434/v1/chat/completions
DEEPSEEK_API_KEY=ollama   # Ollama doesn't require a real key
DEEPSEEK_MODEL=deepseek-r1:7b

# Now ALL queries can safely use DeepSeek (even high sensitivity)
# since data never leaves your server:
DEEPSEEK_ALLOWED_SENSITIVITY=low,medium,high
```

**Update `aiService.js` to use the custom endpoint:**
```javascript
// In services/aiService.js, change:
const DEEPSEEK_API = process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/chat/completions";
```

### With self-hosted DeepSeek, the cost model becomes:
- One-time GPU server cost: ~RM 8,000–25,000 (used server + GPU)
- Monthly running cost: ~RM 300–600 (electricity + hosting)
- Per-query API cost: **RM 0** (fully local)

---

## SharePoint Integration

To sync Skills.md files from SharePoint instead of local files:

```bash
npm install @microsoft/microsoft-graph-client
```

Create `backend/services/sharepointService.js`:
```javascript
const { Client } = require("@microsoft/microsoft-graph-client");

async function fetchSkillsFromSharePoint() {
  const client = Client.initWithMiddleware({ /* auth */ });
  const files = await client.api(
    `/sites/${SITE_ID}/drive/root:/KROS/skills:/children`
  ).get();
  // Download each .md file and return as { id: content } map
}
```

Then in `aiService.js`, replace `loadSkills()` with `fetchSkillsFromSharePoint()`.

---

## Monitoring

```bash
# Check API health
curl https://kros.yourcompany.com.my/api/health

# PM2 monitoring
pm2 monit

# Docker logs
docker compose logs --tail=100 backend

# PostgreSQL
docker compose exec postgres psql -U kros -d kros_db -c "SELECT count(*) FROM chat_logs;"
```

---

## Security Checklist

- [ ] Change `JWT_SECRET` to a strong random value
- [ ] Change default DB password
- [ ] Enable HTTPS (Let's Encrypt)
- [ ] Set `DEEPSEEK_ALLOWED_SENSITIVITY=low` (default — don't change unless self-hosting)
- [ ] Restrict CORS to your actual frontend domain
- [ ] Enable rate limiting on AI endpoints (already configured)
- [ ] Review user access levels — remove demo users in production
- [ ] Set up regular PostgreSQL backups
- [ ] Mount skills volume as read-write only for backend, read-only for everything else
- [ ] Audit all users who have `admin` access quarterly

---

*KROS Deployment Guide v2.0 — May 2026*
