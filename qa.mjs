// QA: home mounts → open a format → the completeness warning shrinks as the name
// is filled → save → reload restores the theme and the remembered name.
//
//   npm run preview                       (production build on :4173)
//   node <skill-dir>/browser.mjs http://localhost:4173/ --script ./qa.mjs
//
// Bengali text this script has to reason about is built from code points rather
// than typed as a literal: literal glyphs in this file have silently changed
// meaning between edits, and a QA script that mis-reads its own strings reports
// UI bugs that do not exist. Text it only has to *find* on the page is copied
// from the component source.

const BANGLA_ZERO = 0x9e6; // ০
const BANGLA_NINE = 0x9ef; // ৯

const WARNING_TEXT = 'জায়গা পূরণ করুন';
const NAME_PLACEHOLDER = 'যেমন: আমিনা বেগম';
const NAME = ['মোঃ', 'রফিকুল', 'ইসলাম'].join(' ');

/**
 * Reads the leading count out of "৬টি তথ্য..." → 6, or null when it has none.
 * Bengali digits and ASCII digits are both accepted: the page may hand the count
 * back in either, and a QA script must not call that a UI bug.
 */
function issueCount(warning) {
  if (!warning) return null;
  let value = 0;
  let found = false;
  for (const ch of warning) {
    const code = ch.codePointAt(0);
    let digit = -1;
    if (code >= 0x30 && code <= 0x39) digit = code - 0x30; // 0-9
    else if (code >= BANGLA_ZERO && code <= BANGLA_NINE) digit = code - BANGLA_ZERO;
    if (digit < 0) break;
    value = value * 10 + digit;
    found = true;
  }
  return found ? value : null;
}

/** ১টি, ২টি, … — helps a failure message name what it expected. */
const banglaCount = (n) =>
  String(n)
    .split('')
    .map((d) => String.fromCodePoint(BANGLA_ZERO + Number(d)))
    .join('');

export default async function run(page, ui) {
  const steps = [];
  const fail = (step, reason) => ({ ok: false, failedAt: step, reason, steps });

  // 1) Home screen mounts
  await page.waitForSelector('text=নৈমিত্তিক ছুটি', { timeout: 15000 });
  steps.push({ home: 'mounted' });

  // 2) Open the casual leave format. The card's button is named "আবেদন তৈরি করুন";
  //    every card has one, so the first is ours.
  const snap = await ui.snapshot();
  const ref = snap.match(/@(e\d+) button "আবেদন তৈরি করুন"/)?.[1];
  if (!ref) return fail('open-format', 'no "আবেদন তৈরি করুন" button on the home screen');

  // Start the wait BEFORE the click, await it after — awaiting first would wait
  // for a form that a not-yet-clicked card never shows.
  const opened = page
    .getByText('আবেদনকারীর নাম', { exact: false })
    .first()
    .waitFor({ timeout: 10000 })
    .then(() => true)
    .catch(() => false);
  await ui.click(ref);
  if (!(await opened)) return fail('open-format', 'form did not open after clicking the card');
  steps.push({ format: 'opened' });

  // 3) The completeness warning lists what is still missing
  const warningBox = page.getByText(WARNING_TEXT).first().locator('xpath=..');
  await warningBox.waitFor({ timeout: 5000 });
  const warning = await warningBox.innerText();
  const before = issueCount(warning);
  if (before === null) return fail('warning', `warning did not start with a count: ${warning}`);
  // The app speaks Bangla throughout: the count must be printed in Bangla digits.
  const startsWithBangla = warning.codePointAt(0) >= BANGLA_ZERO && warning.codePointAt(0) <= BANGLA_NINE;
  if (!startsWithBangla) {
    return fail('warning', `the count should be in Bangla digits, got: ${warning.slice(0, 8)}`);
  }
  steps.push({ countBefore: before });

  // 4) Fill the applicant name by its placeholder — the first text input on this
  //    form is the designation, not the name.
  const nameInput = page.getByPlaceholder(NAME_PLACEHOLDER);
  if ((await nameInput.count()) === 0) return fail('fill-name', 'applicant name input not found');
  // Typing, not a bare DOM fill: the form re-renders on React's change event.
  await nameInput.pressSequentially(NAME, { delay: 5 });

  // Wait for React to re-render the count rather than sleeping a fixed time.
  const deadline = Date.now() + 5000;
  let after = before;
  while (Date.now() < deadline) {
    after = issueCount(await warningBox.innerText().catch(() => '')) ?? before;
    if (after < before) break;
    await page.waitForTimeout(100);
  }

  if (after !== before - 1) {
    return fail(
      'fill-name',
      `the name should remove exactly one issue (${banglaCount(before)} → ${banglaCount(before - 1)}), got ${banglaCount(after)}`,
    );
  }
  steps.push({ countAfter: after });

  // 5) Save, then check what actually landed in storage
  await page.getByText('সেভ করুন', { exact: true }).first().click();
  await page.waitForTimeout(600);

  const saved = await page.evaluate(() => {
    const prefs = JSON.parse(localStorage.getItem('bangla_app_prefs_v1') || 'null');
    const apps = JSON.parse(localStorage.getItem('bangla_app_saved_applications_v1') || '[]');
    return { prefs, savedCount: apps.length, lastSavedName: apps[0]?.data?.applicantName ?? null };
  });

  if (saved.savedCount !== 1) return fail('save', `expected 1 saved draft, found ${saved.savedCount}`);
  if (saved.lastSavedName !== NAME) return fail('save', `saved draft holds "${saved.lastSavedName}"`);
  if (saved.prefs?.remembered?.applicantName !== NAME) {
    return fail('save', `writer details were not remembered: ${JSON.stringify(saved.prefs?.remembered)}`);
  }
  steps.push({ saved: saved.savedCount, remembered: saved.prefs.remembered });

  // 6) Reload: theme and the remembered name must come back
  await page.reload();
  await page.waitForSelector('text=নৈমিত্তিক ছুটি', { timeout: 15000 });

  const themeApplied = await page.evaluate(
    () => document.querySelector('.scene-3d, .scene-3d-dark, [class*="scene-"]') !== null,
  );
  if (!themeApplied) return fail('reload', 'dashboard theme was not restored');

  const reopenRef = (await ui.snapshot()).match(/@(e\d+) button "আবেদন তৈরি করুন"/)?.[1];
  if (!reopenRef) return fail('reload', 'format card missing after reload');
  await ui.click(reopenRef);
  await page.getByPlaceholder(NAME_PLACEHOLDER).waitFor({ timeout: 10000 });

  const prefilledName = await page.getByPlaceholder(NAME_PLACEHOLDER).inputValue();
  if (prefilledName !== NAME) {
    return fail('reload', `remembered name was not prefilled, got "${prefilledName}"`);
  }
  steps.push({ themeApplied, prefilledName });

  return { ok: true, steps };
}
