import React from "react";

export function SuccessBanner({ message }: { message: string }) {
  if (!message) return null;
  return <p className="flash flash--success">{message}</p>;
}

