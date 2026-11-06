import { sileo, type SileoOptions, type SileoState } from "sileo";

export type ToastOptions = {
  duration?: number | null;
};

function toOptions(
  message: string,
  options?: ToastOptions,
  type?: SileoState,
): SileoOptions {
  const opts: SileoOptions = { title: message ?? "" };
  if (options?.duration !== undefined) opts.duration = options.duration;
  if (type) opts.type = type;
  return opts;
}

function invoke(
  state: SileoState | "default",
  message: string,
  options?: ToastOptions,
): string {
  if (state === "success") return sileo.success(toOptions(message, options));
  if (state === "error") return sileo.error(toOptions(message, options));
  if (state === "warning") return sileo.warning(toOptions(message, options));
  if (state === "info") return sileo.info(toOptions(message, options));
  if (state === "loading")
    return sileo.show(toOptions(message, options, "loading"));
  return sileo.show(toOptions(message, options));
}

export const toast = Object.assign(
  (message: string, options?: ToastOptions) => invoke("default", message, options),
  {
    success: (message: string, options?: ToastOptions) =>
      invoke("success", message, options),
    error: (message: string, options?: ToastOptions) =>
      invoke("error", message, options),
    warning: (message: string, options?: ToastOptions) =>
      invoke("warning", message, options),
    info: (message: string, options?: ToastOptions) =>
      invoke("info", message, options),
    loading: (message: string, options?: ToastOptions) =>
      invoke("loading", message, options),
  },
);

export default toast;
