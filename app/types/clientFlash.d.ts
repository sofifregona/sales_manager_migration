export type SuccessKind =
  | "created-success"
  | "updated-success"
  | "deactivated-success"
  | "deleted-success"
  | "reactivated-success"
  | "incremented-success"
  | "reseted-password-success";

export type ConflictKind = "create-conflict" | "update-conflict";

export interface ClientFlashBase {
  scope: string;
  kind: string;
  message?: string;
}

export interface SuccessFlash extends ClientFlashBase {
  kind: SuccessKind;
}

export interface ConflictFlash extends ClientFlashBase {
  kind: ConflictKind;
  name?: string;
  description?: string | null;
  elementId?: number;
}

export type ClientFlash = SuccessFlash | ConflictFlash | ClientFlashBase;
