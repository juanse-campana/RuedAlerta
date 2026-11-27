"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import styles from "./page.module.css";
import { api, ApiError, clearStoredTokens, EventType, readStoredTokens, storeTokens, Vehicle, VehicleEvent, VehicleType } from "../lib/api";

type Tokens = { accessToken: string; refreshToken: string };

function eventLabel(type: EventType) {
  return { UNAUTHORIZED_MOVEMENT: "Movimiento no autorizado", IMPACT: "Impacto", FALL: "Caída" }[type];
}

function vehicleLabel(type: VehicleType) {
  return type === "BICYCLE" ? "Bicicleta" : "Motocicleta";
}

export default function Home() {
  const [tokens, setTokens] = useState<Tokens | null>(() => readStoredTokens());
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [events, setEvents] = useState<VehicleEvent[]>([]);
  const [vehicleType, setVehicleType] = useState<VehicleType>("MOTORCYCLE");
  const [vehicleAlias, setVehicleAlias] = useState("");
  const [nodeExternalId, setNodeExternalId] = useState("");
  const [eventType, setEventType] = useState<EventType>("IMPACT");
  const [busy, setBusy] = useState(false);
  const [initializing, setInitializing] = useState(() => Boolean(readStoredTokens()));
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const selectedVehicle = useMemo(() => vehicles.find((vehicle) => vehicle.id === selectedId) ?? null, [vehicles, selectedId]);

  async function loadVehicles(activeTokens: Tokens) {
    const result = await api.vehicles(activeTokens.accessToken);
    setVehicles(result);
    setSelectedId((current) => current || result[0]?.id || "");
  }

  useEffect(() => {
    if (!tokens) return;
    const timer = window.setTimeout(() => {
      void loadVehicles(tokens).catch(() => {
        clearStoredTokens();
        setError("La sesión guardada ya no es válida. Inicia sesión nuevamente.");
        setTokens(null);
      }).finally(() => setInitializing(false));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [tokens]);

  useEffect(() => {
    const syncTokens = () => setTokens(readStoredTokens());
    window.addEventListener("ruedalerta:tokens-updated", syncTokens);
    return () => window.removeEventListener("ruedalerta:tokens-updated", syncTokens);
  }, []);

  useEffect(() => {
    if (!tokens || !selectedId) return;
    void api.events(tokens.accessToken, selectedId).then(setEvents).catch(() => setEvents([]));
  }, [tokens, selectedId]);

  function showError(reason: unknown) {
    setError(reason instanceof ApiError ? reason.message : "No se pudo completar la operación.");
    setMessage("");
  }

  async function submitAuth(event: FormEvent) {
    event.preventDefault();
    setBusy(true); setError("");
    try {
      const result = authMode === "login" ? await api.login(email, password) : await api.register(email, password);
      storeTokens(result);
      setTokens(result); setPassword(""); setMessage("Sesión iniciada correctamente.");
      await loadVehicles(result);
    } catch (reason) { showError(reason); }
    finally { setBusy(false); }
  }

  function logout() {
    if (tokens) void api.logout(tokens.refreshToken).catch(() => undefined);
    clearStoredTokens(); setTokens(null); setVehicles([]); setEvents([]); setSelectedId(""); setInitializing(false);
  }

  async function createVehicle(event: FormEvent) {
    event.preventDefault(); if (!tokens) return;
    setBusy(true); setError("");
    try {
      const created = await api.createVehicle(tokens.accessToken, { type: vehicleType, alias: vehicleAlias });
      setVehicleAlias(""); setVehicles((current) => [created, ...current]); setSelectedId(created.id); setMessage("Vehículo creado.");
    } catch (reason) { showError(reason); } finally { setBusy(false); }
  }

  async function createNode(event: FormEvent) {
    event.preventDefault(); if (!tokens || !selectedVehicle) return;
    setBusy(true); setError("");
    try {
      const node = await api.createNode(tokens.accessToken, selectedVehicle.id, nodeExternalId);
      setNodeExternalId(""); setVehicles((current) => current.map((vehicle) => vehicle.id === selectedVehicle.id ? { ...vehicle, node } : vehicle)); setMessage("Nodo asociado al vehículo.");
    } catch (reason) { showError(reason); } finally { setBusy(false); }
  }

  async function simulateEvent(event: FormEvent) {
    event.preventDefault(); if (!tokens || !selectedVehicle?.node) return;
    setBusy(true); setError("");
    try {
      const created = await api.createEvent(tokens.accessToken, selectedVehicle.node.id, { externalEventId: crypto.randomUUID(), type: eventType });
      setEvents((current) => [created, ...current]); setMessage("Evento registrado en PostgreSQL.");
    } catch (reason) { showError(reason); } finally { setBusy(false); }
  }

  if (!tokens) return (
    <main className={styles.shell}><section className={styles.authCard} aria-labelledby="auth-title">
      <p className={styles.kicker}>RUEDALERTA · MVP</p><h1 id="auth-title">Seguridad para bicicletas y motocicletas</h1>
      <p className={styles.muted}>Registra eventos y consulta la evidencia asociada a tus vehículos.</p>
      <form onSubmit={submitAuth} className={styles.form}><label>Correo<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" /></label><label>Contraseña<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={10} required autoComplete={authMode === "login" ? "current-password" : "new-password"} /></label><button disabled={busy}>{busy ? "Procesando…" : authMode === "login" ? "Iniciar sesión" : "Crear cuenta"}</button></form>
      {error && <p className={styles.error} role="alert">{error}</p>}<button className={styles.linkButton} onClick={() => setAuthMode(authMode === "login" ? "register" : "login")}>{authMode === "login" ? "Necesito crear una cuenta" : "Ya tengo una cuenta"}</button>
    </section></main>
  );

  return <main className={styles.shell}><header className={styles.header}><div><p className={styles.kicker}>RUEDALERTA · MVP</p><h1>Panel de seguridad</h1></div><button className={styles.secondary} onClick={logout}>Cerrar sesión</button></header>
    <section className={styles.grid}><article className={styles.card}><h2>Nuevo vehículo</h2><form onSubmit={createVehicle} className={styles.form}><label>Tipo<select value={vehicleType} onChange={(e) => setVehicleType(e.target.value as VehicleType)}><option value="MOTORCYCLE">Motocicleta</option><option value="BICYCLE">Bicicleta</option></select></label><label>Alias<input value={vehicleAlias} onChange={(e) => setVehicleAlias(e.target.value)} placeholder="Ej. Moto azul" required /></label><button disabled={busy}>Agregar vehículo</button></form></article>
      <article className={styles.card}><h2>Vehículos</h2>{vehicles.length === 0 ? <p className={styles.muted}>{initializing ? "Cargando vehículos…" : "Todavía no tienes vehículos registrados."}</p> : <div className={styles.vehicleList}>{vehicles.map((vehicle) => <button key={vehicle.id} className={`${styles.vehicle} ${vehicle.id === selectedId ? styles.selected : ""}`} onClick={() => setSelectedId(vehicle.id)}><strong>{vehicle.alias}</strong><span>{vehicleLabel(vehicle.type)} · {vehicle.node ? `Nodo ${vehicle.node.externalId}` : "Sin nodo"}</span></button>)}</div>}</article>
    </section>
    {selectedVehicle && <section className={styles.grid}><article className={styles.card}><h2>{selectedVehicle.alias}</h2><p className={styles.muted}>{vehicleLabel(selectedVehicle.type)}</p>{selectedVehicle.node ? <form onSubmit={simulateEvent} className={styles.form}><label>Evento<select value={eventType} onChange={(e) => setEventType(e.target.value as EventType)}><option value="IMPACT">Impacto</option><option value="FALL">Caída</option><option value="UNAUTHORIZED_MOVEMENT">Movimiento no autorizado</option></select></label><button disabled={busy}>Simular evento</button></form> : <form onSubmit={createNode} className={styles.form}><label>Identificador del nodo<input value={nodeExternalId} onChange={(e) => setNodeExternalId(e.target.value)} placeholder="esp32-lab-01" required /></label><button disabled={busy}>Asociar nodo</button></form>}</article><article className={styles.card}><h2>Eventos recientes</h2>{events.length === 0 ? <p className={styles.muted}>No hay eventos registrados para este vehículo.</p> : <div className={styles.eventList}>{events.map((item) => <div className={styles.event} key={item.id}><div><strong>{eventLabel(item.type)}</strong><span>{new Date(item.receivedAt).toLocaleString()}</span></div><small>{item.latitude == null ? "Ubicación no disponible" : `${item.latitude}, ${item.longitude}`}</small></div>)}</div>}</article></section>}
    {message && <p className={styles.success} role="status">{message}</p>}{error && <p className={styles.error} role="alert">{error}</p>}
  </main>;
}
