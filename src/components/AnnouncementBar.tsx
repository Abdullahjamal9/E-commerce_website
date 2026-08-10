/**
 * Thin dark strip above the header that runs promo lines past as a headline
 * ticker — the standard retail pattern for surfacing sale/shipping messaging
 * without spending hero space on it. Pure CSS, so it needs no client bundle.
 */
export default function AnnouncementBar({ messages }: { messages: string[] }) {
  if (messages.length === 0) return null;

  // One pass of the message list. Two of these sit end to end and the track
  // scrolls exactly one pass before restarting, which reads as an unbroken
  // loop. Each pass is held to at least the viewport width so a short list
  // can never leave a blank stretch trailing the last message; when it is
  // shorter than that, the messages spread across the pass instead of
  // bunching at one end.
  const pass = (hidden: boolean) => (
    <div
      // The second pass repeats what a screen reader has already read.
      aria-hidden={hidden}
      className="flex min-w-[100vw] shrink-0 items-center justify-around gap-12 px-6"
    >
      {messages.map((message, i) => (
        <p key={i} className="whitespace-nowrap text-[11px] font-medium tracking-wide sm:text-xs">
          {message}
        </p>
      ))}
    </div>
  );

  return (
    <div className="relative z-[60] overflow-hidden bg-[#151515] text-white">
      <div className="flex h-9 items-center">
        <div className="ticker-track flex w-max shrink-0">
          {pass(false)}
          {pass(true)}
        </div>
      </div>
    </div>
  );
}
