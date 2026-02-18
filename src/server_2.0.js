/**
 * ============================================================
 *  Projeto: Painel de Monitoramento IoT - Tuya Cloud
 *  Autor: Welerson Reis
 *  Versão: 3.0
 *  Data: 2026
 *  Descrição: Painel para monitorar a temperatura do CPD
 *  Dashboard para monitoramento de dispositivos IoT (Temperatura,
 *  Umidade e Status Online) integrado com Tuya Cloud API.
 *
 *  GitHub:** https://github.com/reisdev26  
 *  LinkedIn:** https://www.linkedin.com/in/welerson-reis-/  
 *
 *
 * ============================================================
 */
 
require('dotenv').config();
const express = require("express");
const axios = require("axios");
const crypto = require("crypto");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.static(__dirname));

const Datacenter_CLM_ID_DEVICES = process.env.Datacenter_CLM_ID_DEVICES;
const AR_CPD_CLM_ID_DEVICES = process.env.AR_CPD_CLM_ID_DEVICES;
const Termostato_CPD_CLM_Moema_ID_DEVICES = process.env.Termostato_CPD_CLM_Moema_ID_DEVICES;


// =============================
// 🔐 CONFIGURE AQUI
// =============================
const ACCESS_ID = process.env.ACCESS_ID;
const ACCESS_SECRET = process.env.ACCESS_SECRET;

// Lista de dispositivos
const DEVICES = [
  { name: "Datacenter CLM", deviceId: Datacenter_CLM_ID_DEVICES },
  { name: "AR CPD CLM", deviceId: AR_CPD_CLM_ID_DEVICES },
  { name: "Termostato CPD CLM Moema", deviceId: Termostato_CPD_CLM_Moema_ID_DEVICES },
];

// 🌎 Ajuste conforme seu Data Center
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
let cachedToken = null;
let tokenExpireTime = 0;

async function getAccessToken() {
  const now = Date.now();

  if (cachedToken && now < tokenExpireTime) {
    return cachedToken;
  }

  const method = "GET";
  const url = "/v1.0/token?grant_type=1";

  const { signature, t } = generateSign(method, url, "");

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

  cachedToken = response.data.result.access_token;

  // Subtrai 60 segundos de segurança
  tokenExpireTime = now + (response.data.result.expire_time - 60) * 1000;

  return cachedToken;
}

// =============================
// 🔎 Buscar informações dos dispositivos
// =============================
app.get("/temperature", async (req, res) => {
  try {
    const accessToken = await getAccessToken();

    const results = await Promise.all(
      DEVICES.map(async (d) => {
        try {
          const method = "GET";
          const url = `/v1.0/devices/${d.deviceId}`;
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

          const deviceData = response.data.result;

          // Procura status de temperatura e umidade
          let temp = null;
          let hum = null;

          if (deviceData.status && deviceData.status.length > 0) {
            const tempDP = deviceData.status.find(s => s.code.includes("temperature") || s.code.includes("va_temperature"));
            const humDP = deviceData.status.find(s => s.code.includes("humidity") || s.code.includes("va_humidity"));

            if (tempDP) temp = tempDP.value / 10; // alguns sensores enviam x10
            if (humDP) hum = humDP.value;
          }

          return {
            name: d.name,
            deviceId: d.deviceId,
            temperature: temp,
            humidity: hum,
            online: deviceData.online
          };
        } catch {
          return {
            name: d.name,
            deviceId: d.deviceId,
            temperature: null,
            humidity: null,
            online: false
          };
        }
      })
    );

  res.json({
    updatedAt: Date.now(),
    devices: results
  });

} catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =============================
// 🚀 Iniciar servidor
// =============================
// Depois:
const os = require("os");
const interfaces = os.networkInterfaces();
let localIp = "localhost";

// Procura um IP IPv4 que não seja interno
for (const name of Object.keys(interfaces)) {
  for (const iface of interfaces[name]) {
    if (iface.family === "IPv4" && !iface.internal) {
      localIp = iface.address;
      break;
    }
  }
  if (localIp !== "localhost") break;
}

const PORT = 3000;
const HOST = "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log(`Servidor rodando em http://${localIp}:${PORT}`);
});


const path = require("path");

// Servir HTML
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "painel_2.0.html"));
});
