export type WaitlistState = {
  status: "idle" | "success" | "error";
  message: string;
};

export const initialWaitlistState: WaitlistState = {
  status: "idle",
  message: "",
};
