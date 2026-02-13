const express = require("express");
const TuyAPI = require("tuyapi");
const cors = require("cors");

const app = express();
app.use(cors());

// =============================
// 🔐 CONFIGURE AQUI
// =============================
const DEVICE_ID = "ebc657705b8ddcb163cmth";  // seu device id
const LOCAL_KEY = "1sZgxK7!RPw5vqK(";        // local_key do dispositivo
const IP = "192.168.100.244";                     // IP local do dispositivo na rede

// =============================
// 🔎 Inicializa dispositivo TuyAPI
// =============================
const device = new TuyAPI({
  id: DEVICE_ID,
  key: LOCAL_KEY,
  ip: IP,
});

// Conecta ao dispositivo
(async () => {
  try {
    await device.find();
    await device.connect();
    console.log("Dispositivo conectado via LAN:", IP);
  } catch (err) {
    console.error("Erro ao conectar ao dispositivo:", err);
  }
})();

// =============================
// 🔹 Endpoint para retornar temperatura e setpoint
// =============================
app.get("/temperature", async (req, res) => {
  try {
    const status = await device.get(); // pega todos os DPs

    // Exemplo: status pode ter temp_current e temp_set
    // Ajuste conforme os nomes que aparecerem
    res.json(status);
  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

// =============================
// 🚀 Inicia servidor
// =============================
app.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});