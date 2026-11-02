/**
 * Meta WhatsApp Cloud API webhook for Vercel serverless.
 * GET  — webhook verification
 * POST — incoming event acknowledgement (no auto-replies yet)
 */
module.exports = function handler(req, res) {
  if (req.method === "GET") {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (
      mode === "subscribe" &&
      token &&
      token === process.env.WHATSAPP_VERIFY_TOKEN
    ) {
      res.status(200).send(challenge);
      return;
    }

    res.status(403).end();
    return;
  }

  if (req.method === "POST") {
    let payload = req.body;

    if (typeof payload === "string") {
      try {
        payload = JSON.parse(payload);
      } catch {
        payload = { parseError: true };
      }
    }

    // Log structure only; never log env secrets (e.g. WHATSAPP_VERIFY_TOKEN).
    console.log(
      "WhatsApp webhook event:",
      JSON.stringify(payload ?? null)
    );

    res.status(200).json({ ok: true });
    return;
  }

  res.setHeader("Allow", "GET, POST");
  res.status(405).end();
};
