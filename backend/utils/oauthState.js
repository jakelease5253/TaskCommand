const crypto = require('crypto');

// HMAC-signed OAuth state: base64url(payload).base64url(signature).
// Signing with ENCRYPTION_KEY (already a required strong secret) means the
// callback can trust the userId inside the state - a forged or tampered
// state fails verification instead of binding an attacker's Slack account
// to a victim's Azure user id.

const STATE_MAX_AGE_MS = 10 * 60 * 1000;

function signingKey() {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error('ENCRYPTION_KEY must be set to sign OAuth state');
  }
  return key;
}

function signState(payload) {
  const body = Buffer.from(
    JSON.stringify({ ...payload, ts: Date.now() })
  ).toString('base64url');
  const sig = crypto
    .createHmac('sha256', signingKey())
    .update(body)
    .digest('base64url');
  return `${body}.${sig}`;
}

function verifyState(state) {
  const parts = (state || '').split('.');
  if (parts.length !== 2) {
    throw new Error('Malformed state');
  }
  const [body, sig] = parts;
  const expected = crypto
    .createHmac('sha256', signingKey())
    .update(body)
    .digest('base64url');

  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expected);
  if (
    sigBuf.length !== expectedBuf.length ||
    !crypto.timingSafeEqual(sigBuf, expectedBuf)
  ) {
    throw new Error('Invalid state signature');
  }

  const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8'));
  if (!payload.ts || Date.now() - payload.ts > STATE_MAX_AGE_MS) {
    throw new Error('State expired');
  }
  return payload;
}

module.exports = { signState, verifyState };
