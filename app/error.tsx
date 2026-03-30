"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[40dvh] flex-col items-center justify-center gap-4 px-6 pb-24 text-center">
      <p className="text-sm text-[var(--muted)]">화면을 불러오지 못했습니다.</p>
      <p className="max-w-sm text-xs text-[var(--muted)]">
        개발 서버라면 터미널에서 중지한 뒤{" "}
        <code className="rounded bg-[var(--glass)] px-1 py-0.5 text-[11px]">npm run dev:clean</code>
        (또는 터미널에서 <code className="rounded bg-[var(--glass)] px-1 py-0.5 text-[11px]">rm -rf .next</code>{" "}
        후 <code className="rounded bg-[var(--glass)] px-1 py-0.5 text-[11px]">npm run dev</code>)로 다시
        실행해 보세요.
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-xl bg-[var(--blue)] px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 active:opacity-80"
      >
        다시 시도
      </button>
    </div>
  );
}
