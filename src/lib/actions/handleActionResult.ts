import { toast } from "sonner";
import type { ServerActionResult } from "./types";

interface HandleActionOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
  successToast?: Parameters<typeof toast.success>;
  errorToast?: Parameters<typeof toast.error>;
}

function handleActionResult<T>(
  result: ServerActionResult<T>,
  options: HandleActionOptions<T>
) {
  const { onSuccess, onError, successToast, errorToast } = options;

  if (result.success) {
    if (onSuccess) {
      onSuccess(result.data);
    }
    if (successToast) {
      console.log("Success:", successToast[0]);
      toast.success(...successToast);
    }
  } else {
    if (onError) {
      onError(result.error);
    }
    if (errorToast) {
      console.error("Error:", result.error);
      toast.error(...errorToast);
    }
  }
}

export default handleActionResult;
