import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { login as loginApi } from "~/feature/auth/auth-api";

export function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const [params] = useSearchParams();
  const next = params.get("next") || "/";
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(undefined);
    setSubmitting(true);
    try {
      await loginApi(username, password);
      navigate(next, { replace: true });
    } catch (e) {
      let message = "Credenciales inválidas";
      if (e instanceof Error) {
        try {
          const parsed = JSON.parse(e.message) as { message?: string };
          if (parsed.message) message = parsed.message;
        } catch {}
      }
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <form className="w-full max-w-sm space-y-4" onSubmit={onSubmit}>
        <h1 className="text-xl font-semibold">Iniciar sesión</h1>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <div>
          <label className="block text-sm">Usuario</label>
          <input
            name="username"
            className="border rounded w-full p-2"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
        </div>
        <div>
          <label className="block text-sm">Contraseña</label>
          <input
            name="password"
            className="border rounded w-full p-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            autoComplete="current-password"
          />
        </div>
        <button
          className="bg-blue-600 text-white rounded px-4 py-2"
          type="submit"
          disabled={submitting}
        >
          {submitting ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </main>
  );
}
