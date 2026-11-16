export default function SigningInLoadingPage() {
  return (
    <main className="grid min-h-screen grid-cols-1 bg-white font-['Inter',system-ui,sans-serif] text-[#021820] lg:grid-cols-[900fr_1020fr]">
      {/* Brand side (hidden on small screens) */}
      <section
        aria-label="About EnovAcc"
        className="relative hidden flex-col justify-start overflow-hidden px-[clamp(3rem,8.8vw,168px)] pt-[20vh] text-white lg:flex bg-[linear-gradient(180deg,#38bdf8_0%,#32ade5_34.135%,#0e58ad_56.25%,#003699_85.096%,#04294f_100%)]"
      >
        <img
          src="/logo.png"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute right-[-40%] bottom-[-38%] w-[150%] max-w-none object-contain opacity-[0.18] brightness-0 invert"
        />

        <div className="relative max-w-[480px]">
          <p className="mb-2 text-[15px] font-bold leading-4">THE FINANCIAL PICTURE, CONNECTED.</p>
          <h1 className="translate-x-1 whitespace-nowrap text-[clamp(4rem,7.25vw,136px)] font-black italic leading-none">
            EnovAcc:
          </h1>
          <p className="mb-8 translate-x-1 whitespace-nowrap text-[clamp(1.5rem,2.4vw,45px)] font-medium italic">
            Financial Management System
          </p>
          <p className="translate-x-1 text-[15px] leading-[22px]">
            From the first entry to the final report.
            <br />
            One connected workspace for your finances.
          </p>
        </div>

        <p className="absolute bottom-[12%] left-[clamp(3rem,8.8vw,168px)] text-[15px] leading-[18px] text-white/70">
          Enov8tive Technology Solutions Inc.
          <br />
          Philippine Entity · Internal Financial Management System
        </p>
      </section>

      {/* Signing-in side */}
      <section
        role="status"
        aria-live="polite"
        className="flex flex-col items-center justify-center bg-white px-6 py-8 sm:p-16"
      >
        <div className="flex w-full max-w-[500px] flex-col items-center text-center">
          <h2 className="text-[clamp(28px,4.4vw,42px)] font-bold leading-[1.1] text-[#021820]">
            Opening your workspace
          </h2>
          <p className="mt-3 text-[16px] leading-[22px] text-[#637a8a]">
            Your credentials have been accepted
          </p>

          <div className="mt-10 flex flex-col items-center gap-4">
            <span
              aria-hidden="true"
              className="h-12 w-12 animate-spin rounded-full border-4 border-[#dce5ea] border-t-[#0693c7]"
            />
            <p className="text-[16px] font-bold leading-5 text-[#0693c7]">
              Loading EnovAcc
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
