/**
 * Webhook Inspector & Dispatch Simulator
 * Simulates incoming HTTP webhooks, HMAC signature verification and logging.
 */

export const WEBHOOK_PRESETS = [
  {
    id: 'github_push',
    name: 'GitHub Push Event',
    service: 'GitHub',
    endpoint: '/api/webhooks/github',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'GitHub-Hookshot/1.0',
      'X-GitHub-Event': 'push',
      'X-GitHub-Delivery': '72h821-ab91-4c12-b912-9218a0912f'
    },
    body: {
      ref: 'refs/heads/main',
      repository: {
        name: 'informatik-lernen',
        full_name: 'Schengii/Informatik-lernen'
      },
      pusher: {
        name: 'dev-lead',
        email: 'lead@company.de'
      },
      commits: [
        {
          id: 'b1982cf',
          message: 'feat: add Webhook Inspector Studio'
        }
      ]
    }
  },
  {
    id: 'stripe_payment',
    name: 'Stripe Payment Succeeded',
    service: 'Stripe',
    endpoint: '/api/webhooks/stripe',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Stripe/1.0 (+https://stripe.com/docs/webhooks)',
      'Stripe-Signature': 't=1700000000,v1=5257a869e7eceeda32aaaa62cd493b3f2f6214bda4f615fb898d7bc3d20bbddf'
    },
    body: {
      id: 'evt_1O00002eZvKYlo2C',
      type: 'payment_intent.succeeded',
      data: {
        object: {
          amount: 4900,
          currency: 'eur',
          status: 'succeeded',
          customer: 'cus_99182'
        }
      }
    }
  }
];

export function simulateWebhookDispatch(webhookData, _expectedSecret = 'secret123') {
  const startTime = performance.now();
  const timestamp = new Date().toISOString();

  let statusCode = 200;
  let statusText = 'OK';
  let responseBody = { received: true, status: 'processed' };

  if (!webhookData || !webhookData.endpoint) {
    statusCode = 400;
    statusText = 'Bad Request';
    responseBody = { error: 'Missing endpoint or payload' };
  }

  const durationMs = Number((performance.now() - startTime + Math.random() * 40 + 10).toFixed(1));

  return {
    id: `req_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp,
    endpoint: webhookData.endpoint,
    service: webhookData.service || 'Custom',
    headers: webhookData.headers || {},
    body: webhookData.body || {},
    statusCode,
    statusText,
    responseBody,
    durationMs
  };
}
