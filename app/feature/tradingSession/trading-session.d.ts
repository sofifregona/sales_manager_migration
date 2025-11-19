import type { AccountDTO } from "~/feature/account/account";
import type { SaleDTO } from "~/feature/sale/types/sale";
import type { Flash } from "~/types/flash";
import type { UserDTO } from "../user/user";

export interface TradingSessionDTO {
  id: number;
  openBy: UserDTO;
  openDateTime: Date;
  openingCashCount: number;
  closeBy: UserDTO;
  closeDateTime: Date;
  closingCashCount: number;
  manualAdjustment: number;
}

export interface OpenTradingSessionPayload {
  openBy: UserDTO;
  openDateTime: Date;
  openingCashCount: number;
}

export interface CloseTradingSessionPayload {
  closeBy: UserDTO;
  closeDateTime: Date;
  closingCashCount: number;
}

export interface AdjustTradingSessionPayload {
  manualAdjustment: number;
}

export interface TradingSessionLoaderData {
  tradingSessions: TradingSessionDTO[] | [];
  adjustingTradingSession: TradingSession | null;
  flash: Flash;
}
