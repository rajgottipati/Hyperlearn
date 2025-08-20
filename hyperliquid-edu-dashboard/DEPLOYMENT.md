# Production Deployment Guide

## Prerequisites

- Node.js 18 or higher
- npm or yarn package manager
- Supabase project set up
- Domain name (optional)

## Quick Deploy Options

### Option 1: Netlify (Recommended)

1. **Fork/Clone the repository**
2. **Connect to Netlify:**
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Connect your repository
   - Build settings are automatically detected from `netlify.toml`

3. **Set Environment Variables:**
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   VITE_WALLETCONNECT_PROJECT_ID=your_project_id
   ```

4. **Deploy:** Netlify will automatically build and deploy

### Option 2: Vercel

1. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your repository
   - Configuration is handled by `vercel.json`

2. **Set Environment Variables in Vercel dashboard**

3. **Deploy:** Automatic deployment on push

### Option 3: Manual Build & Host

```bash
# Install dependencies
npm install

# Build for production
npm run build

# The dist/ folder contains the built application
# Upload to any static hosting service
```

## Environment Configuration

### Required Variables

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key

### Optional Variables

- `VITE_WALLETCONNECT_PROJECT_ID`: For WalletConnect support
- `VITE_ENABLE_TESTNET_TRADING`: Set to `true` for testing

## Performance Optimization

The build is optimized with:

- **Code Splitting:** Lazy loading for routes
- **Tree Shaking:** Removes unused code
- **Asset Optimization:** Images and fonts optimized
- **Caching:** Static assets cached for 1 year
- **Compression:** Gzip/Brotli compression enabled

## Monitoring & Analytics

### Built-in Monitoring

- Error boundaries catch and report crashes
- WebSocket connection status monitoring
- API response time tracking
- User session tracking via Supabase

### Optional Integrations

- **Sentry:** For error tracking
- **Google Analytics:** For user behavior
- **LogRocket:** For session replay

## Security

### Headers Applied

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Content-Security-Policy`: Restricted to necessary domains

### Best Practices

- All API keys are properly scoped
- HTTPS enforced in production
- Wallet connections use secure methods
- No sensitive data in localStorage

## Custom Domain

### Netlify
1. Go to Domain settings
2. Add custom domain
3. Configure DNS records
4. SSL certificate auto-generated

### Vercel
1. Go to Project settings > Domains
2. Add domain
3. Configure DNS
4. SSL auto-configured

## Troubleshooting

### Common Issues

**Build fails:**
- Check Node.js version (18+ required)
- Verify all environment variables are set
- Clear npm cache: `npm cache clean --force`

**WebSocket connection fails:**
- Check if hosting supports WebSockets
- Verify WSS URLs in environment
- Check for proxy/firewall blocking

**Wallet connection issues:**
- Ensure HTTPS is enabled
- Check WalletConnect project ID
- Verify CSP allows wallet domains

## Scaling Considerations

- **CDN:** Assets served from global CDN
- **Edge Functions:** Consider Netlify/Vercel Edge Functions for API
- **Database:** Supabase handles scaling automatically
- **Rate Limiting:** Implemented in Hyperliquid client

## Backup & Recovery

- **Code:** Version controlled on Git
- **Database:** Supabase automatic backups
- **Deployment:** Instant rollback available
- **Environment:** Document all variables

## Maintenance

- **Dependencies:** Update monthly
- **Security:** Monitor security advisories
- **Performance:** Regular Lighthouse audits
- **Monitoring:** Check error rates and performance

## Support

For deployment issues:
1. Check the deployment logs
2. Verify environment variables
3. Test the build locally first
4. Check the GitHub issues for known problems