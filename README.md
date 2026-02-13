\# 🧠 Painel IoT de Monitoramento – Tuya Cloud

📌 \*\*Projeto:\*\* Painel web para monitoramento de dispositivos IoT usando a API da Tuya  

📌 \*\*Autor:\*\* Welerson Reis  

📌 \*\*GitHub:\*\* https://github.com/reisdev26  

📌 \*\*LinkedIn:\*\* https://www.linkedin.com/in/welerson-reis-/  

📌 \*\*Versão:\*\* 2.0  

📌 \*\*Data:\*\* 2026

---



\## 📌 Sobre



Este projeto é um painel de monitoramento em tempo real de dispositivos IoT integrados à plataforma Tuya Cloud. Ele exibe:



\- Temperatura e umidade de sensores compatíveis  

\- Status Online/Offline de dispositivos sem sensores  

\- Destaque visual conforme níveis de alerta de temperatura  

\- Atualização automática de dados  

\- Layout moderno e responsivo  



Ideal para visualização em telas de operação, estações de monitoramento ou gestão de ambiente.



---



\## 🧠 Funcionalidades



\### 🌡️ Principal

✔ Dashboard central com destaque para o dispositivo que reporta temperatura e umidade  

✔ Layout estilizado com cores e alertas visuais  

✔ Relógio e data em tempo real  

✔ Atualização periódica automática  

✔ Compatível com múltiplos dispositivos na mesma rede  



---



\## 🧩 Tecnologias Utilizadas



✔ Node.js (Express)  

✔ Axios  

✔ HTML5 / CSS3 / JavaScript  

✔ API Tuya Cloud  

✔ CORS  

---
\## 📁 Estrutura do Projeto



📦 painel-iot-tuya

├── server.js

├── painel\_2.0.html

├── package.json

├── package-lock.json

└── README.md





---



\## 🚀 Como Rodar



1\. Clone este repositório:



```bash

git clone https://github.com/reisdev26/seu-repositorio.git



Instale dependências:



npm install





Configure suas credenciais Tuya no server.js:



const ACCESS\_ID = "<SEU\_ACCESS\_ID>";

const ACCESS\_SECRET = "<SEU\_ACCESS\_SECRET>";





Adicione os dispositivos que deseja monitorar:



const DEVICES = \[

&nbsp; { name: "Datacenter CLM", deviceId: "..." },

&nbsp; { name: "AR CPD CLM", deviceId: "..." },

&nbsp; { name: "Termostato CPD CLM Moema", deviceId: "..." },

];





Execute o servidor:



node server.js





Abra no navegador de qualquer máquina da rede:



http://SEU\_IP\_LOCAL:3000/

