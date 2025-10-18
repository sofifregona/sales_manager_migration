import { Outlet, useLocation, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "~/config/api";

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
  return <Outlet />;
}

