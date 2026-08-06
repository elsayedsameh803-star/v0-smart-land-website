// =============================================================================
// Smart Land - Security Utilities
// =============================================================================
// Protects against SSRF (Server-Side Request Forgery) attacks
// =============================================================================

import { NextResponse } from "next/server";

// Blocked IP ranges (private, loopback, link-local, etc.)
const BLOCKED_IP_RANGES: Array<[string, string]> = [
  // IPv4 private ranges
  ["10.0.0.0", "10.255.255.255"],
  ["172.16.0.0", "172.31.255.255"],
  ["192.168.0.0", "192.168.255.255"],
  // IPv4 loopback
  ["127.0.0.0", "127.255.255.255"],
  // IPv4 link-local
  ["169.254.0.0", "169.254.255.255"],
  // IPv4 reserved
  ["0.0.0.0", "0.255.255.255"],
  ["100.64.0.0", "100.127.255.255"],
  ["192.0.0.0", "192.0.0.255"],
  ["192.0.2.0", "192.0.2.255"],
  ["198.18.0.0", "198.19.255.255"],
  ["198.51.100.0", "198.51.100.255"],
  ["203.0.113.0", "203.0.113.255"],
  ["224.0.0.0", "239.255.255.255"],
  ["240.0.0.0", "255.255.255.255"],
];

// IPv6 blocked prefixes
const BLOCKED_IPV6_PREFIXES = [
  "::1",           // loopback
  "::",            // unspecified
  "fc",            // unique local
  "fd",            // unique local
  "fe80",          // link-local
  "ff",            // multicast
  "2001:db8",      // documentation
];

function ipv4ToInt(ip: string): number {
  return ip.split(".").reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
}

function isIpv4Blocked(ip: string): boolean {
  const ipInt = ipv4ToInt(ip);
  return BLOCKED_IP_RANGES.some(([start, end]) => {
    const startInt = ipv4ToInt(start);
    const endInt = ipv4ToInt(end);
    return ipInt >= startInt && ipInt <= endInt;
  });
}

function isIpv6Blocked(ip: string): boolean {
  const normalized = ip.toLowerCase();
  return BLOCKED_IPV6_PREFIXES.some((prefix) => normalized.startsWith(prefix));
}

function isBlockedIp(ip: string): boolean {
  if (ip.includes(":")) {
    return isIpv6Blocked(ip);
  }
  return isIpv4Blocked(ip);
}

/**
 * Validates a URL for SSRF protection.
 * Returns an error message if the URL is unsafe, or null if safe.
 */
export function validateUrlForFetch(url: string): string | null {
  try {
    const parsed = new URL(url);

    // Only allow http/https protocols
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return "Only HTTP and HTTPS protocols are allowed";
    }

    // Block URLs with credentials
    if (parsed.username || parsed.password) {
      return "URLs with embedded credentials are not allowed";
    }

    // Block localhost and common internal hostnames
    const hostname = parsed.hostname.toLowerCase();
    const blockedHostnames = [
      "localhost",
      "127.0.0.1",
      "::1",
      "0.0.0.0",
      "metadata.google.internal",
      "169.254.169.254", // AWS metadata
      "metadata",
      "instance-data",
      "169.254.170.2", // ECS metadata
      "100.100.100.200", // Alibaba metadata
    ];

    if (blockedHostnames.includes(hostname)) {
      return "Access to internal/local resources is not allowed";
    }

    // Block internal TLDs
    const blockedTlds = [".local", ".internal", ".localhost", ".home", ".lan"];
    if (blockedTlds.some((tld) => hostname.endsWith(tld))) {
      return "Access to internal network resources is not allowed";
    }

    // Block IP addresses in private ranges
    const ipv4Match = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if (ipv4Match) {
      const ip = ipv4Match.slice(1).join(".");
      // Validate each octet is 0-255
      const validOctets = ipv4Match.slice(1).every((octet) => {
        const num = parseInt(octet, 10);
        return num >= 0 && num <= 255;
      });
      if (!validOctets) {
        return "Invalid IP address";
      }
      if (isBlockedIp(ip)) {
        return "Access to private/internal IP addresses is not allowed";
      }
    }

    // Block IPv6 addresses
    if (hostname.includes(":")) {
      if (isBlockedIp(hostname)) {
        return "Access to private/internal IPv6 addresses is not allowed";
      }
    }

    // Block URLs with unusual ports
    const port = parsed.port;
    if (port && !["80", "443", "8080", "8443"].includes(port)) {
      return "Access to non-standard ports is not allowed";
    }

    return null;
  } catch {
    return "Invalid URL format";
  }
}

/**
 * Creates a safe fetch with SSRF protection and timeout.
 */
export async function safeFetch(url: string, options: RequestInit = {}, timeoutMs = 15000): Promise<Response> {
  const validationError = validateUrlForFetch(url);
  if (validationError) {
    throw new Error(validationError);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      redirect: "follow",
    });
    return res;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Returns a NextResponse error for SSRF violations.
 */
export function ssrfErrorResponse(message: string): NextResponse {
  return NextResponse.json(
    { success: false, error: message },
    { status: 400 }
  );
}