const express = require("express");
const axios = require("axios");
const crypto = require("crypto");
const cors = require("cors");

const app = express();
app.use(cors());

// =============================
// 🔐 CONFIGURAÇÕES
// =============================
const ACCESS_ID = "rhvgknh5uwah38frs49k";
const ACCESS_SECRET = "a6054f20e06a4adb9bfc354a1ace2266";
const DEVICE_ID = "ebe727058bd85fa14amatf";

// 🌎 Ajuste conforme seu Data Center
// América (Brasil geralmente) = "https://openapi.tuyaus.com"
// Europa = "https://openapi.tuyaeu.com"
// China = "https://openapi.tuyacn.com"
const BASE_URL = "https://openapi.tuyaus.com";

// =============================
// 🔑 Função de assinatura Tuya v2
// =============================
function generateSign(method, url, body, accessToken = "") {
  const t = Date.now().toString();

  const bodyHash = crypto
    .createHash("sha256")
    .update(body || "")
    .digest("hex");

  const stringToSign = method + "\n" + bodyHash + "\n\n" + url;

  const signStr = ACCESS_ID + accessToken + t + stringToSign;

  const signature = crypto
    .createHmac("sha256", ACCESS_SECRET)
    .update(signStr)
    .digest("hex")
    .toUpperCase();

  return { signature, t };
}

// =============================
// 🔐 Obter Access Token
// =============================
async function getAccessToken() {
  const method = "GET";
  const url = "/v1.0/token?grant_type=1";
  const body = "";

  const { signature, t } = generateSign(method, url, body);

  const response = await axios.get(BASE_URL + url, {
    headers: {
      client_id: ACCESS_ID,
      sign: signature,
      t: t,
      sign_method: "HMAC-SHA256",
    },
  });

  if (!response.data.success) {
    throw new Error(JSON.stringify(response.data));
  }

  return response.data.result.access_token;
}

// =============================
// 🔎 Buscar temperatura e umidade
// =============================
app.get("/temperature", async (req, res) => {
  try {
    const accessToken = await getAccessToken();

    const method = "GET";
    const url = `/v1.0/devices/${DEVICE_ID}`;
    const body = "";

    const { signature, t } = generateSign(method, url, body, accessToken);

    const response = await axios.get(BASE_URL + url, {
      headers: {
        client_id: ACCESS_ID,
        access_token: accessToken,
        sign: signature,
        t: t,
        sign_method: "HMAC-SHA256",
      },
    });

    // 🔹 Extrair temperatura e umidade de forma segura
    const status = response.data.result.status || [];
    let temperature = null;
    let humidity = null;

    status.forEach(dp => {
      if (dp && dp.code) {
        if (dp.code === "va_temperature" && dp.value != null) {
          temperature = dp.value / 10; // Ex: 291 → 29.1°C
        }
        if (dp.code === "va_humidity" && dp.value != null) {
          humidity = dp.value; // Ex: 36%
        }
      }
    });

    res.json({ temperature, humidity });

  } catch (error) {
    res.status(500).json({
      error: error.response?.data || error.message
    });
  }
});

// =============================
// 🚀 Iniciar servidor
// =============================
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});