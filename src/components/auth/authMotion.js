/**
 * Shared motion tokens for the landing <-> login transition and the landing
 * entrance. CSS reads these through custom properties set on .auth-stage.
 */
export const AUTH_MOTION = {
  duration: 640, // panel + shared-element movement (ms)
  reducedDuration: 200, // reduced-motion crossfade (ms)
  fadeDuration: 240, // landing copy / floating cards (ms)
  brandFadeDuration: 200, // login brand copy (ms)
  brandDelay: 170, // landing copy clears before the login copy (ms)
  formFadeDuration: 200, // form fields (ms)
  slideDuration: 320, // landing copy rise/settle (ms)
  cardDuration: 480, // floating card exit/return (ms)
  stagger: 60, // landing/card stagger (ms)
  formStagger: 50, // form-field stagger (ms)
  formDelay: 80, // delay before the first form field (ms)
  mobileHeader: 176, // blue header strip height on mobile (px)
  ease: 'cubic-bezier(0.65, 0, 0.35, 1)',

  // Landing entrance: wordmark + blue + cards are already in place; the
  // tagline, three headline lines, subtext and button follow.
  entrance: {
    total: 1210, // last item finishes at ~1.2s
    tagline: 250, // tagline fade
    lineDelay: 150, // first headline line starts after the tagline
    line: 320, // per-line fade/rise
    lineStagger: 120, // between headline lines
    subtextDelay: 720, // after the third line settles
    subtextDuration: 250,
    buttonDelay: 990, // after the subtext
    buttonDuration: 220,
    progress: 900, // month-close bar 0 -> 82%
  },

  // Strict login -> landing choreography.
  backDuration: 650, // total reverse transition
  backContentFade: 150, // login copy + form content fade out
  backPanelDelay: 150, // white panel waits for its content
  backPanelDuration: 200, // white panel slides out (150 -> 350)
  backTitleDelay: 150, // title starts shrinking after the copy is gone
  backTitleDuration: 350, // title morph (150 -> 500)
  backBlueDelay: 250, // blue expands after the title is under way
  backBlueDuration: 400, // blue expansion (250 -> 650)
}
