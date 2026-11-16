#!/usr/bin/env node
/** Keeps the mock Resend + Supabase standing for the site-level QA suite. */
import { startMocks } from './mock-services.mjs';
await startMocks({ resendPort: 3210, dbPort: 3211 });
console.log('qa mocks listening on 3210 (resend) and 3211 (supabase)');
setInterval(() => {}, 1 << 30);
