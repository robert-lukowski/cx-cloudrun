import express from "express";

const app = express();
app.use(express.json({ limit: "1mb" }));

// 1) Healthcheck - jak wejdziesz w URL Cloud Run, ma pokazać OK
app.get("/", (_req, res) => res.status(200).send("OK - cx-cloudrun"));

// 2) Webhook dla Dialogflow CX (i ES też przełknie)
function getIntentName(body) {
  // CX zwykle: intentInfo.displayName
  const cx = body?.intentInfo?.displayName;
  if (cx) return cx;

  // ES: queryResult.intent.displayName
  const es = body?.queryResult?.intent?.displayName;
  if (es) return es;

  return "UnknownIntent";
}

app.post("/webhook", (req, res) => {
  const intent = getIntentName(req.body);

  let reply;
  if (intent === "Default Welcome Intent" || intent === "Welcome") {
    reply = "Siemanko! Odpowiada Cloud Run 🏃‍♀️ ";
  } else {
    reply = `Webhook działa. Intent: ${intent}`;
  }

  // Minimalna odpowiedź z tekstem (ES na pewno rozumie fulfillmentText)
  res.json({ fulfillmentText: reply });
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Listening on ${port}`));
