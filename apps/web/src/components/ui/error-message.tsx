interface ErrorMessageProps {
  message: string;
}

export function ErrorMessage({ message }: ErrorMessageProps): JSX.Element {
  return (
    <div className="flex h-full items-center justify-center">
      <div
        className="relative rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700"
        role="alert"
      >
        <span className="block sm:inline">{message}</span>
      </div>
    </div>
  );
}

export type { ErrorMessageProps };
