export function extractApiErrorMessage(error: unknown): string | null {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as any).response === 'object' &&
    (error as any).response !== null &&
    'data' in (error as any).response &&
    typeof (error as any).response.data === 'object' &&
    (error as any).response.data !== null &&
    typeof (error as any).response.data.message === 'string'
  ) {
    return (error as any).response.data.message;
  }
  return null;
} 