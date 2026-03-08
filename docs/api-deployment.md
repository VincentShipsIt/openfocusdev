# TaskFlow API Deployment

## First-time setup on EC2

1. Clone repo to `/home/openclaw/www/shipshitdev/vincentshipsit/todo`
2. Copy `.env.production.example` to `core/apps/api/.env` and fill in secrets
3. Install PM2: `npm install -g pm2`
4. Build and start: `bash scripts/deploy-api.sh`
5. Copy `nginx/taskflow-api.conf` to `/etc/nginx/sites-available/taskflow-api`
6. Enable: `sudo ln -s /etc/nginx/sites-available/taskflow-api /etc/nginx/sites-enabled/`
7. Test: `sudo nginx -t && sudo systemctl reload nginx`
8. Get SSL: `sudo certbot --nginx -d api.todo.shipshit.dev`

## DNS
Add CNAME: `api.todo.shipshit.dev` → EC2 public DNS or Elastic IP

## Monitoring
- `pm2 status` — check running processes
- `pm2 logs taskflow-api` — view logs
- `pm2 monit` — live monitoring

## Manual deploy
```bash
bash scripts/deploy-api.sh
```
