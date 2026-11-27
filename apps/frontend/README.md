# RuedAlerta frontend

Panel Next.js del primer vertical slice de RuedAlerta. Permite registrar e iniciar sesión, crear bicicletas o motocicletas, asociar un nodo simulado, registrar eventos y consultar el historial autorizado.

## Desarrollo

```bash
pnpm install
pnpm dev
```

La API se obtiene de `NEXT_PUBLIC_API_URL` y usa `http://localhost:3001/api` por defecto. El backend debe estar ejecutándose para completar el flujo.

## Verificación

```bash
pnpm lint
pnpm build
```

La interfaz almacena los tokens del MVP en el almacenamiento local del navegador y renueva la sesión automáticamente una vez cuando el access token expira. Antes de un despliegue público debe migrarse el refresh token a una cookie HttpOnly, Secure y SameSite.
