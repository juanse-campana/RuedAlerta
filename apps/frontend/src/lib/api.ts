export type VehicleType = "BICYCLE" | "MOTORCYCLE";
export type EventType = "UNAUTHORIZED_MOVEMENT" | "IMPACT" | "FALL";

export type AuthTokens = { accessToken: string; refreshToken: string; expiresIn: number };
export type User = { id: string; email: string };
export type DeviceNode = { id: string; externalId: string; status: string; vehicleId: string };
export type Vehicle = { id: string; type: VehicleType; alias: string; plate: string | null; node?: DeviceNode | null };
export type VehicleEvent = { id: string; externalEventId: string; type: EventType; source: string; occurredAt: string | null; receivedAt: string; latitude: string | number | null; longitude: string | number | null };

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";
const tokenKey = "ruedalerta.tokens";

export function readStoredTokens(): AuthTokens | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(tokenKey);
    return raw ? (JSON.parse(raw) as AuthTokens) : null;
  } catch {
    return null;
  }
}

export function storeTokens(tokens: AuthTokens) {
  window.localStorage.setItem(tokenKey, JSON.stringify(tokens));
  window.dispatchEvent(new Event("ruedalerta:tokens-updated"));
}

export function clearStoredTokens() {
  window.localStorage.removeItem(tokenKey);
  window.dispatchEvent(new Event("ruedalerta:tokens-updated"));
}

export class ApiError extends Error {
  constructor(message: string, readonly status: number) { super(message); this.name = "ApiError"; }
}

async function request<T>(path: string, options: RequestInit = {}, accessToken?: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}), ...(options.headers ?? {}) },
  });
  if (response.status === 401 && accessToken && typeof window !== "undefined") {
    const stored = readStoredTokens();
    if (stored?.refreshToken) {
      try {
        const refreshed = await request<AuthTokens>("/auth/refresh", post({ refreshToken: stored.refreshToken }));
        storeTokens(refreshed);
        return request<T>(path, options, refreshed.accessToken);
      } catch {
        clearStoredTokens();
      }
    }
  }
  if (!response.ok) {
    let message = "No se pudo completar la solicitud.";
    try {
      const body = (await response.json()) as { message?: string | string[] };
      if (Array.isArray(body.message)) message = body.message.join(" ");
      else if (body.message) message = body.message;
    } catch { /* Empty error response. */ }
    throw new ApiError(message, response.status);
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

const post = (body: unknown): RequestInit => ({ method: "POST", body: JSON.stringify(body) });

export const api = {
  register: (email: string, password: string) => request<AuthTokens>("/auth/register", post({ email, password })),
  login: (email: string, password: string) => request<AuthTokens>("/auth/login", post({ email, password })),
  refresh: (refreshToken: string) => request<AuthTokens>("/auth/refresh", post({ refreshToken })),
  logout: (refreshToken: string) => request<{ success: boolean }>("/auth/logout", post({ refreshToken })),
  me: (accessToken: string) => request<User>("/auth/me", {}, accessToken),
  vehicles: (accessToken: string) => request<Vehicle[]>("/vehicles", {}, accessToken),
  createVehicle: (accessToken: string, body: { type: VehicleType; alias: string; plate?: string }) => request<Vehicle>("/vehicles", post(body), accessToken),
  createNode: (accessToken: string, vehicleId: string, externalId: string) => request<DeviceNode>(`/vehicles/${vehicleId}/nodes`, post({ externalId }), accessToken),
  events: (accessToken: string, vehicleId: string) => request<VehicleEvent[]>(`/vehicles/${vehicleId}/events`, {}, accessToken),
  createEvent: (accessToken: string, nodeId: string, body: { externalEventId: string; type: EventType; latitude?: number; longitude?: number }) => request<VehicleEvent>(`/nodes/${nodeId}/events`, post(body), accessToken),
};
