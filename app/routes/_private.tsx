import { Outlet, useLocation, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "~/config/api";
import { Header } from "~/shared/ui/layout/Header";
import { Footer } from "~/shared/ui/layout/Footer";

export default function PrivateLayout() {
  const [ok, setOk] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/me`, {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) {
          if (!cancelled) {
            navigate(`/login?next=${encodeURIComponent(location.pathname)}`, {
              replace: true,
            });
          }
          return;
        }
        if (!cancelled) setOk(true);
      } catch {
        if (!cancelled) {
          navigate(`/login?next=${encodeURIComponent(location.pathname)}`, {
            replace: true,
          });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [location.pathname, navigate]);

  if (!ok) return null;
  return (
    <div className="app-shell">
      <div className="app-shell__content">
        <Header />
        <main className="app-shell__main">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
