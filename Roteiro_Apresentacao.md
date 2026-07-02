# Roteiro de Apresentação — Corrida de Rua
> Dica: não precisa decorar isso palavra por palavra. Leia, entenda, e fale com suas palavras na hora. O roteiro é um guia, não um script.

---

## ABERTURA (30 segundos)

"Bom dia / Boa tarde. O app que eu desenvolvi se chama **Corrida de Rua**. A ideia é simples: a maioria dos apps de corrida mostra só os dados — quantos km você rodou, quanto tempo levou. O meu faz isso também, mas adiciona uma camada de motivação em cima. Cada km que você corre vira XP, você sobe de nível, aparece no ranking, segue outros corredores... basicamente transforma o treino num jogo."

---

## O QUE O APP FAZ — Demonstração rápida (2-3 minutos)

> Abra o app no celular enquanto fala.

**Tela de Login / Cadastro:**
"Aqui o usuário cria a conta com email, senha e um username. Isso vai pro Firebase Authentication — não tem nada guardado localmente, tudo na nuvem. O login é persistente, então quando você fecha e abre o app, já continua logado."

**Home:**
"Na tela inicial você já vê seu nível atual — começa no Bronze, e pode chegar ao Diamante com 15 mil XP. A barra mostra quanto falta pro próximo nível. Aqui também aparecem suas estatísticas: total de km, quantas corridas você fez e sua sequência atual de dias."

**Corrida (mostrar a tela, não precisa sair correndo):**
"Quando você inicia uma corrida, o mapa aparece em tempo real. O GPS rastreia sua posição e vai desenhando a rota. Ao finalizar, o mapa exibe o trajeto completo com marcador de início e fim, e você vê quantos XP ganhou."

**Ranking:**
"O ranking é em tempo real — atualiza automaticamente sem precisar fechar o app. Usei o onSnapshot do Firestore, que mantém um listener ativo. Qualquer usuário que ganhe XP já aparece na posição correta."

**Perfil:**
"No perfil você tem seguidores, seguindo, suas estatísticas e pode editar seu nome e username. Quando muda o username, o app verifica se já existe alguém com aquele nome antes de salvar."

**Metas:**
"Tem 9 metas: correr 5km por semana, completar 10 corridas, manter 7 dias de sequência... cada uma tem uma barra de progresso calculada em tempo real com os dados do usuário."

---

## COMO FOI DESENVOLVIDO — A parte técnica (2 minutos)

"O app foi feito em **React Native com Expo**, rodando no SDK 54. Escolhi o Expo porque facilita muito o acesso ao GPS, ao mapa e ao build para Android e iOS sem precisar configurar ambiente nativo."

"O backend é totalmente Firebase — Authentication para login e Firestore como banco de dados. No Firestore tenho duas coleções: **users**, com todos os dados do perfil e estatísticas, e **corridas**, com cada treino salvo incluindo o array de coordenadas GPS do trajeto."

"Para calcular a distância das corridas, implementei a **fórmula Haversine** manualmente. Ela pega dois pontos de latitude/longitude e calcula a distância real entre eles na superfície da Terra — é a mesma fórmula que o Google Maps usa."

"O sistema de XP tem várias regras: 10 XP por km, 2 XP por minuto de corrida, bônus pela primeira corrida do dia, bônus por recorde pessoal, e bônus de sequência — 75 XP se você correr 3 dias seguidos, 200 XP por 7 dias."

---

## SE PERGUNTAREM SOBRE DIFICULDADES (tenha isso na cabeça)

**"Qual foi o maior desafio?"**
"Com certeza foi a compatibilidade de versões. O Expo Go no celular usa React Native 0.81 com a nova arquitetura. Quando o projeto estava em versões antigas, dava um erro de 'PlatformConstants not found'. Precisei identificar exatamente quais versões de cada pacote eram compatíveis entre si e fixar isso no package.json. Foi trabalhoso mas aprendi muito sobre como o ecossistema React Native funciona por baixo."

**"Por que Firebase e não outro banco?"**
"O Firebase tem listener em tempo real nativo, a ferramenta chamada onSnapshot. Isso foi essencial pro ranking. Com um banco REST normal, eu precisaria ficar fazendo polling a cada X segundos. Com Firestore, o banco me avisa automaticamente quando tem mudança, e o app atualiza sozinho."

**"O GPS funciona em segundo plano?"**
"Por decisão de projeto, não. O rastreamento é só em foreground — o GPS para se você minimizar o app. Isso evita consumo excessivo de bateria e complexidade desnecessária de background tasks para o escopo deste projeto."

---

## FECHAMENTO (20 segundos)

"O resultado é um app funcional, com autenticação real, dados na nuvem, GPS funcionando em dispositivo físico e uma experiência de usuário completa — do cadastro até a corrida com mapa. Obrigado."

---

> **Dica final:** Se travar em algum momento, volte para o celular e mostre a tela. "Deixa eu mostrar aqui como funciona..." compra tempo e reconecta a atenção.
