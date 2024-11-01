'use client';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <div
      className={`grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20`}
    >
      <main className="flex flex-col gap-4 row-start-2 items-center sm:items-start">
        <h1>QueRKode</h1>
        <p>There is no nice user interface</p>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <Link href="/qr">create your code</Link>
      </footer>
    </div>
  );
}
