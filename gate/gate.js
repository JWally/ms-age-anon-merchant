const form = document.querySelector("#entry");
const button = form.querySelector("button");
const status = document.querySelector("#status");
let redirect = "/";
async function api(path, data) {
  const body = JSON.stringify(data);
  const bytes = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(body),
  );
  const hash = Array.from(new Uint8Array(bytes), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
  const response = await fetch(path, {
    method: "POST",
    credentials: "same-origin",
    cache: "no-store",
    headers: {
      "content-type": "application/json",
      "x-amz-content-sha256": hash,
    },
    body,
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error);
  return result;
}
if (!window.FortressCaptcha) {
  form.addEventListener("submit", (e) => e.preventDefault());
  button.disabled = true;
  status.textContent = "The check could not load. Please refresh to try again.";
} else {
  window.FortressCaptcha.attach({
    trigger: form,
    event: "submit",
    siteKey: "site_test_demo.forceauth",
    title: "Welcome to HornPub",
    getActionId: async () => {
      button.disabled = true;
      status.textContent = "";
      const started = await api("/api/start", {
        next: new URLSearchParams(location.search).get("next") || "/",
      });
      return started.actionId;
    },
    onPass: async ({ id, token, actionId }) => {
      const result = await api("/api/complete", { id, token, actionId });
      if (!result.ok) throw new Error("verification_failed");
      redirect = result.redirect;
    },
    onComplete: () => location.assign(redirect),
    onFail: (error) => {
      button.disabled = false;
      status.textContent =
        error.message === "captcha_cancelled"
          ? "No rush. Start the check whenever you’re ready."
          : "We couldn’t complete that check. Please try again.";
    },
  });
}
