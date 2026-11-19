const textLink =
  "p-0 text-[16px] leading-[22px] text-[#0693c7] hover:underline focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0693c7]";

/**
 * Props:
 *  onTryAgain       navigation callback ("Try again")
 *  onForgotPassword navigation callback ("Forgot password?")
 *  onBackToLanding  navigation callback
 */
export default function SignInFailedPage({
  onTryAgain,
  onForgotPassword,
  onBackToLanding,
}) {
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

      {/* Sign-in-failed side */}
      <section className="flex flex-col items-center justify-center bg-white px-6 py-8 sm:p-16">
        <div className="flex w-full max-w-[500px] flex-col items-center text-center">
          <button
            type="button"
            onClick={onBackToLanding}
            className={`${textLink} self-center`}
          >
            ← Back to landing page
          </button>

          <span
            aria-hidden="true"
            className="mt-8 flex h-16 w-16 items-center justify-center rounded-full bg-[#fff5f5] text-[28px] text-[#e5484d]"
          >
            !
          </span>

          <h2 className="mt-6 text-[clamp(28px,4.4vw,42px)] font-bold leading-[1.1] text-[#021820]">
            Unable to sign in
          </h2>
          <p className="mt-3 text-[16px] leading-[22px] text-[#637a8a]">
            The email or password is incorrect. Check your details and try
            again.
          </p>

          <button
            type="button"
            onClick={onTryAgain}
            className="mt-8 box-border inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#38bdf8] p-3 text-[15px] font-bold leading-5 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#02355d]"
          >
            Try again  →
          </button>

          <button type="button" onClick={onForgotPassword} className={`${textLink} mt-4`}>
            Forgot password?
          </button>
        </div>
      </section>
    </main>
  );
}
