import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { SuccessKind } from "~/types/clientFlash";

type Options = {
  messageMap?: Record<string, string>;
  flags?: string[];
  transientParams?: string[];
};

export const CRUD_SUCCESS_QUERY_FLAGS = [
  "created",
  "updated",
  "deactivated",
  "reactivated",
  "incremented",
  "deleted",
];

const DEFAULT_TRANSIENT_PARAMS = ["id", "edit"];

const DEFAULT_KIND_MESSAGES: Record<SuccessKind, string> = {
  "created-success": "Creado con éxito.",
  "updated-success": "Actualizado con éxito.",
  "deactivated-success": "Desactivado con éxito.",
  "deleted-success": "Eliminado con éxito.",
  "reactivated-success": "Reactivado con éxito.",
  "incremented-success": "Precios incrementados con éxito.",
  "reseted-password-success": "Contraseña reseteada con éxito.",
};

export function useFloatingCrudSuccess({
  messageMap,
  flags = CRUD_SUCCESS_QUERY_FLAGS,
  transientParams = DEFAULT_TRANSIENT_PARAMS,
}: Options) {
  const location = useLocation();
  const navigate = useNavigate();
  const locationRef = useRef(location);
  useEffect(() => {
    locationRef.current = location;
  }, [location]);
  const [visible, setVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const handledVersionRef = useRef<number | null>(null);
  const [urlSuccessKind, setUrlSuccessKind] = useState<SuccessKind | null>(null);
  const [urlSuccessVersion, setUrlSuccessVersion] = useState(0);
  const processedFlagRef = useRef<string | null>(null);

  const clearParams = useCallback(
    (keys: string[]) => {
      if (keys.length === 0) return false;
      const { pathname, search } = locationRef.current;
      const params = new URLSearchParams(search);
      let updated = false;
      keys.forEach((key) => {
        if (params.has(key)) {
          params.delete(key);
          updated = true;
        }
      });
      if (!updated) {
        return false;
      }
      const qs = params.toString();
      navigate(`${pathname}${qs ? `?${qs}` : ""}`, {
        replace: true,
      });
      return true;
    },
    [navigate]
  );

  useEffect(() => {
    if (!location.search) return;
    const params = new URLSearchParams(location.search);
    const flagKey = flags.find((key) => params.get(key) === "1");
    if (!flagKey) return;
    const signature = `${location.key}-${flagKey}`;
    if (processedFlagRef.current === signature) {
      return;
    }
    processedFlagRef.current = signature;
    const derivedKind = `${flagKey}-success` as SuccessKind;
    setUrlSuccessVersion((prev) => prev + 1);
    setUrlSuccessKind(derivedKind);
    clearParams(flags);
  }, [
    clearParams,
    flags,
    location.key,
    location.search,
  ]);

  const successKind = urlSuccessKind;
  const successVersion = urlSuccessVersion;
  const successMessage =
    successKind != null
      ? messageMap?.[successKind] ?? DEFAULT_KIND_MESSAGES[successKind]
      : null;

  useEffect(() => {
    if (!successKind || !successMessage) {
      handledVersionRef.current = null;
      setVisible(false);
      setToastMessage(null);
      return;
    }
    if (handledVersionRef.current === successVersion) {
      return;
    }
    handledVersionRef.current = successVersion;
    setVisible(true);
    setToastMessage(successMessage);
    clearParams(transientParams);

    const timeout = setTimeout(() => {
      setVisible(false);
      setToastMessage(null);
      clearParams(flags);
    }, 2000);
    return () => clearTimeout(timeout);
  }, [
    clearParams,
    flags,
    successKind,
    successMessage,
    successVersion,
    transientParams,
  ]);

  return useMemo(
    () => ({ visible, toastMessage }),
    [visible, toastMessage]
  );
}
