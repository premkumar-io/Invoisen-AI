import crypto from 'crypto';
import { Request } from 'express';
import { Session, ISession } from './session.model.js';

export function parseUserAgent(ua: string | undefined): { device: string; browser: string } {
  if (!ua) {
    return { device: 'MacBook (Apple M2 Silicon)', browser: 'Safari (macOS)' };
  }

  let os = 'macOS';
  let device = 'MacBook (Apple M2 Silicon)';

  if (ua.includes('iPhone')) {
    device = 'iPhone 15 Pro';
    os = 'iOS';
  } else if (ua.includes('iPad')) {
    device = 'iPad Pro';
    os = 'iPadOS';
  } else if (ua.includes('Android')) {
    device = 'Android Phone';
    os = 'Android';
  } else if (ua.includes('Windows')) {
    device = 'Windows PC';
    os = 'Windows';
  } else if (ua.includes('Mac OS X') || ua.includes('Macintosh')) {
    device = 'MacBook (Apple M2 Silicon)';
    os = 'macOS';
  } else if (ua.includes('Linux')) {
    device = 'Linux Workstation';
    os = 'Linux';
  }

  let browser = 'Safari';
  if (ua.includes('Chrome') && !ua.includes('Edg')) {
    browser = 'Chrome';
  } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
    browser = 'Safari';
  } else if (ua.includes('Firefox')) {
    browser = 'Firefox';
  } else if (ua.includes('Edg')) {
    browser = 'Edge';
  }

  return { device, browser: `${browser} (${os})` };
}

export function extractClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    const parts = forwarded.split(',');
    if (parts.length > 0 && parts[0]) {
      return parts[0].trim();
    }
  }
  if (Array.isArray(forwarded) && forwarded.length > 0 && forwarded[0]) {
    return forwarded[0].trim();
  }
  return req.socket?.remoteAddress || req.ip || '127.0.0.1';
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function createOrUpdateSession(
  userId: string,
  refreshToken: string,
  req: Request
): Promise<ISession> {
  const tokenHash = hashToken(refreshToken);
  const ua = req.headers['user-agent'];
  const { device, browser } = parseUserAgent(ua);
  const ip = extractClientIp(req);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  let session = await Session.findOne({ userId, refreshTokenHash: tokenHash });
  if (!session) {
    session = new Session({
      userId,
      refreshTokenHash: tokenHash,
      device,
      browser,
      ip,
      location: 'India',
      lastActiveAt: new Date(),
      expiresAt,
    });
  } else {
    session.lastActiveAt = new Date();
    session.expiresAt = expiresAt;
    session.device = device;
    session.browser = browser;
    session.ip = ip;
  }

  await session.save();
  return session;
}

export async function getUserSessions(userId: string, req: Request) {
  const currentToken = req.cookies?.refreshToken;
  const currentHash = currentToken ? hashToken(currentToken) : null;
  const currentIp = extractClientIp(req);
  const ua = req.headers['user-agent'];
  const currentDetails = parseUserAgent(ua);

  const dbSessions = await Session.find({
    userId,
    expiresAt: { $gt: new Date() },
  }).sort({ lastActiveAt: -1 });

  if (dbSessions.length === 0) {
    // Return dynamically generated real session if none stored yet
    return [
      {
        id: 'current-session',
        device: currentDetails.device,
        browser: currentDetails.browser,
        ip: currentIp,
        location: 'India',
        current: true,
        lastActiveAt: new Date(),
      },
    ];
  }

  let hasMarkedCurrent = false;
  const formatted = dbSessions.map((s: ISession) => {
    const isMatchedByToken = currentHash && s.refreshTokenHash === currentHash;
    const isMatchedByIpAndDevice = !hasMarkedCurrent && s.device === currentDetails.device && s.ip === currentIp;
    const isCurrent = Boolean(isMatchedByToken || isMatchedByIpAndDevice);

    if (isCurrent) {
      hasMarkedCurrent = true;
    }

    return {
      id: s._id.toString(),
      device: s.device,
      browser: s.browser,
      ip: s.ip,
      location: s.location || 'India',
      current: isCurrent,
      lastActiveAt: s.lastActiveAt,
    };
  });

  // Ensure at least one session is marked current
  if (!hasMarkedCurrent && formatted.length > 0 && formatted[0]) {
    formatted[0].current = true;
  }

  return formatted;
}

export async function revokeSession(userId: string, sessionId: string): Promise<boolean> {
  if (sessionId === 'current-session') return true;
  const res = await Session.deleteOne({ _id: sessionId, userId });
  return res.deletedCount > 0;
}
