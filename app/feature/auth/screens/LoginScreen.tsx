import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { FaSpinner } from "react-icons/fa";
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
      let message = "Credenciales inválidas.";
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
    <main className="login-screen">
      <div className="login-card">
        <h1 className="login-card__title">Iniciar sesión</h1>
        {error && <p className="login-card__error">{error}</p>}

        <form className="login-form" onSubmit={onSubmit}>
          <div className="form-pill pill-login-user">
            <label htmlFor="username" className="form-pill__label">
              Usuario
            </label>
            <input
              id="username"
              name="username"
              className="form-pill__input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </div>

          <div className="form-pill pill-login-password">
            <label htmlFor="password" className="form-pill__label">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              className="form-pill__input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="current-password"
              required
            />
          </div>

          <button
            className="btn login-form__btn"
            type="submit"
            disabled={submitting}
          >
            {submitting ? (
              <FaSpinner className="action-icon spinner" />
            ) : (
              "Entrar"
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
