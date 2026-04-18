import crypto from 'crypto';

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'guest';
};

type SessionPayload = {
  user: SessionUser;
  exp: number;
};

const SESSION_SECRET =
  process.env.AUTH_SECRET || 'ustccb-fullstack-preview-secret';

const DEMO_USER = {
  id: 'owner-demo',
  email: process.env.DEMO_LOGIN_EMAIL || 'owner@ustc.chat',
  password: process.env.DEMO_LOGIN_PASSWORD || 'ustccb2026',
  name: process.env.DEMO_LOGIN_NAME || 'USTCCB',
  role: 'owner' as const,
};

function toBase64Url(value: string) {
  return Buffer.from(value)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function fromBase64Url(value: string) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  return Buffer.from(padded, 'base64').toString('utf8');
}

function sign(payload: string) {
  return crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payload)
    .digest('base64url');
}

export function issueSessionToken(user: SessionUser) {
  const payload: SessionPayload = {
    user,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7,
  };
  const encoded = toBase64Url(JSON.stringify(payload));
  return `${encoded}.${sign(encoded)}`;
}

export function verifySessionToken(token: string | undefined | null) {
  if (!token) {
    return null;
  }

  const [encoded, signature] = token.split('.');
  if (!encoded || !signature) {
    return null;
  }

  if (sign(encoded) !== signature) {
    return null;
  }

  try {
    const parsed = JSON.parse(fromBase64Url(encoded)) as SessionPayload;
    if (parsed.exp < Date.now()) {
      return null;
    }

    return parsed.user;
  } catch {
    return null;
  }
}

export function authenticateDemoUser(email: string, password: string) {
  if (
    email.trim().toLowerCase() === DEMO_USER.email.toLowerCase() &&
    password === DEMO_USER.password
  ) {
    return {
      id: DEMO_USER.id,
      email: DEMO_USER.email,
      name: DEMO_USER.name,
      role: DEMO_USER.role,
    } satisfies SessionUser;
  }

  return null;
}

export function createPreviewUser(name: string, email: string) {
  return {
    id: crypto.createHash('md5').update(email).digest('hex').slice(0, 12),
    email,
    name,
    role: 'guest' as const,
  } satisfies SessionUser;
}

export function getDemoCredentials() {
  return {
    email: DEMO_USER.email,
    passwordHint: DEMO_USER.password,
  };
}
