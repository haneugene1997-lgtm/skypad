"use client";

import { useEffect } from "react";
import "@/styles/globals.css";

export default function GlobalError({
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
    <html lang="ko">
      <body className="flex min-h-[100dvh] items-center justify-center bg-[#0a0e1a] text-white antialiased">
        <div className="flex max-w-md flex-col items-center gap-4 px-6 text-center">
          <p className="text-lg font-medium">SkyPad를 불러오지 못했습니다</p>
          <p className="text-sm text-white/60">
            로컬 개발 중이면 <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs">.next</code>{" "}
            폴더를 지운 뒤{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs">npm run dev</code>를 다시
            실행해 보세요.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-2 rounded-xl bg-[#4f8ef7] px-5 py-2.5 text-sm font-medium text-white"
          >
            다시 시도
          </button>
        </div>
      </body>
    </html>
  );
}
