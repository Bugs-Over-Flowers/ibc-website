import { toast } from "sonner";
import type { ServerActionResult } from "./types";

interface HandleActionOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
  successToast?: Parameters<typeof toast.success>;
  errorToast?: Parameters<typeof toast.error>;
}

function handleActionResult<T, E = string>(
  result: ServerActionResult<T, E>,
  options: HandleActionOptions<T>
): T | null {
  const { onSuccess, onError, successToast, errorToast } = options;
  const [error, data] = result;

  if (error === null) {
    onSuccess?.(data as T);
    if (successToast) {
      toast.success(...successToast);
    }
    return data;
  } else {
    const message = typeof error === "string" ? error : String(error);
    onError?.(message);
    if (errorToast) {
      toast.error(...errorToast);
    }
    return null;
  }
}

export default handleActionResult;
