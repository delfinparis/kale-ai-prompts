/**
 * Backup-prompt emailer for tapthis.co
 * ------------------------------------
 * A Google Apps Script web app that sends the "here's your prompt as a backup"
 * email from dj@kalerealty.com via Gmail. The site's /api/capture-email route
 * POSTs to this script's URL after a visitor enters their email at the gate.
 *
 * SETUP (do this once, signed in as dj@kalerealty.com):
 *  1. Go to https://script.google.com → New project.
 *  2. Paste this whole file in as Code.gs.
 *  3. Set SHARED_TOKEN below to a long random string (your own secret).
 *  4. Deploy → New deployment → type "Web app".
 *       - Execute as: Me (dj@kalerealty.com)
 *       - Who has access: Anyone
 *     Copy the resulting Web app URL.
 *  5. In Vercel (realtor-ai-prompts-app project) add env vars for
 *     Production + Preview:
 *       PROMPT_EMAIL_WEBHOOK_URL   = the Web app URL from step 4
 *       PROMPT_EMAIL_WEBHOOK_TOKEN = the same SHARED_TOKEN string from step 3
 *  6. Redeploy the site so the new env vars are baked in.
 *
 * Gmail send quota on Google Workspace is ~1,500 recipients/day. Fine for
 * top-of-funnel volume; revisit with a transactional provider if you scale past it.
 */

var SHARED_TOKEN = "REPLACE_WITH_A_LONG_RANDOM_STRING";

function doPost(e) {
  try {
    var data = JSON.parse((e && e.postData && e.postData.contents) || "{}");

    if (!SHARED_TOKEN || data.token !== SHARED_TOKEN) {
      return json_({ ok: false, error: "unauthorized" });
    }

    var to = (data.to || "").trim();
    var promptText = (data.promptText || "").trim();
    var title = (data.promptTitle || "Your prompt").trim();
    if (!to || !promptText) {
      return json_({ ok: false, error: "missing to or promptText" });
    }

    var subject = "Your prompt: " + title;
    var body =
      "Here's the prompt you grabbed on tapthis.co, saved as a backup so you have it.\n\n" +
      title +
      "\n\n----------\n\n" +
      promptText +
      "\n\n----------\n\n" +
      "Paste it into ChatGPT, Claude, or Gemini. More prompts at https://tapthis.co\n\n" +
      "- D.J. Paris";

    GmailApp.sendEmail(to, subject, body, { name: "D.J. Paris" });
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
