INSTALANDO E RODANDO O APP CORRIDA DE RUA
> Esse guia foi feito para quem nunca mexeu com código antes. Siga os
passos na ordem e vai funcionar.
## 🧰 O que você vai precisar instalar primeiro
Antes de qualquer coisa, instale os programas abaixo no computador. São
gratuitos.
### 1. Node.js
O Node é o motor que roda o projeto no seu computador.
- Acesse: https://nodejs.org
- Baixe a versão **LTS** (é a recomendada, fica no lado esquerdo)
- Instale normalmente (Next → Next → Finish)
- Para confirmar que instalou certo, abra o **Prompt de Comando** e
digite:
 ```
 node -v
 ```
 Se aparecer um número (ex: `v20.11.0`), está funcionando ✅
### 2. Git
O Git serve para baixar o código do GitHub.
- Acesse: https://git-scm.com/downloads
- Baixe para Windows e instale (pode deixar todas as opções padrão)
- Para confirmar, abra o Prompt de Comando e digite:
 ```
 git -v
 ```
 Se aparecer um número, está funcionando ✅
### 3. Expo Go (no celular)
O app que vai rodar o projeto no seu celular.
- **Android:** Baixe "Expo Go" na Play Store
- **iPhone:** Baixe "Expo Go" na App Store
---
## 📥 Baixando e instalando o projeto
1. Abra o **Prompt de Comando** (aperte `Windows + R`, digite `cmd`,
aperte Enter)
2. Escolha onde quer salvar o projeto. Para salvar na sua Área de
Trabalho:
 ```
 cd Desktop
 ```
3. Baixe o projeto:
 ```
 git clone https://github.com/PalavroDev/Corrida-de-Rua.git
 ```
4. Entre na pasta do projeto:
 ```
 cd Corrida-de-Rua
 ```
5. Instale as dependências (os pacotes que o app precisa):
 ```
 npm install
 ```
 > ⏳ Isso pode demorar alguns minutos. É normal.
---
## ▶️ Rodando o app
1. Ainda no Prompt de Comando, dentro da pasta do projeto, digite:
 ```
 npx expo start
 ```
2. Vai aparecer um **QR Code** no terminal
3. Abra o app **Expo Go** no celular
 - **Android:** toque em "Scan QR Code" e aponte para o QR
 - **iPhone:** abra a câmera do celular e aponte para o QR
4. O app vai carregar no seu celular em alguns segundos ✅
> ⚠️ O celular e o computador precisam estar na **mesma rede Wi-Fi**.
---
## ❓ Problemas comuns
| Problema | Solução |
|----------|---------|
| "command not found: node" | Node.js não foi instalado corretamente.
Reinstale. |
| "command not found: git" | Git não foi instalado. Reinstale. |
| App não carrega no celular | Verifique se celular e PC estão no mesmo
Wi-Fi |
| "Firebase: Error (auth/...)" | Verifique sua conexão com a internet |
| npm install demorou muito | Normal. Aguarde até terminar. |
---
## 📁 Estrutura resumida do projeto
```
Corrida-de-Rua/
├── src/
│ ├── config/ → Configuração do Firebase
│ ├── screens/ → Todas as telas do app
│ ├── services/ → Funções que acessam o banco de dados
│ └── contexts/ → Estado global do usuário logado
└── package.json → Lista de dependências do projeto
```
---
> Feito com React Native + Expo + Firebase �
