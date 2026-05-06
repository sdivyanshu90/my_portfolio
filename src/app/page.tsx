import { Suspense } from "react";
import Chat from "../components/chat/chat";

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center px-6">
          <div className="panel-surface rounded-[32px] px-6 py-5 text-sm text-[#556173] shadow-sm">
            Loading recruiter console...
          </div>
        </div>
      }
    >
      <Chat />
    </Suspense>
  );
}
