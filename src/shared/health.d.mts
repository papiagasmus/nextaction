export type HealthPayload = {
  status: "ok";
  service: "nextaction-worker";
};
export function healthPayload(): HealthPayload;
