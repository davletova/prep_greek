import type { ReactNode } from "react";
import type { VoidHandler } from "../types/ui.ts";
import DetailScreenHeader from "./detail-screen-header.tsx";

interface PracticeScreenShellProps {
  title: string;
  mainClassName: string;
  onClose: VoidHandler;
  children: ReactNode;
}

export default function PracticeScreenShell({
  title,
  mainClassName,
  onClose,
  children,
}: PracticeScreenShellProps) {
  return (
    <>
      <DetailScreenHeader title={title} onClose={onClose} />
      <main className={mainClassName}>{children}</main>
    </>
  );
}
