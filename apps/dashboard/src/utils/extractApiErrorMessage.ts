interface ErrorWithMessage {
  message: string;
}

interface ErrorWithData {
  data: ErrorWithMessage;
}

interface ErrorWithResponse {
  response: ErrorWithData;
}

function isErrorWithMessage(obj: unknown): obj is ErrorWithMessage {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'message' in obj &&
    typeof (obj as { message: unknown }).message === 'string'
  );
}

function isErrorWithData(obj: unknown): obj is ErrorWithData {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'data' in obj &&
    isErrorWithMessage((obj as { data: unknown }).data)
  );
}

function isErrorWithResponse(obj: unknown): obj is ErrorWithResponse {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'response' in obj &&
    isErrorWithData((obj as { response: unknown }).response)
  );
}

export function extractApiErrorMessage(error: unknown): string | null {
  if (isErrorWithResponse(error)) {
    return error.response.data.message;
  }
  return null;
}
