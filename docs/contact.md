# Formulário de contato

Página: `/contato` (formulário em `#formulario`). API: `src/app/api/contact/route.ts` (runtime `nodejs`).
Lógica testável em `src/lib/contact/*` e testes em `tests/contact.test.ts` (`npm test`).

## Fluxo

1. Ao abrir o formulário, o cliente faz `GET /api/contact` e recebe `{ token }`:
   `"<timestamp>.<HMAC-SHA256(CONTACT_FORM_SECRET, 'cstar-contact:<timestamp>')>"`.
   Se o envio não estiver configurado, a resposta é `503 { "error": "envio_indisponivel" }` e a UI
   mostra um aviso com o e-mail oficial (mufforigem@gmail.com) como alternativa.
2. O envio faz `POST /api/contact` com JSON `{ name, email, subject, message, website, token }`.
3. O servidor, nesta ordem:
   - sem configuração → `503 envio_indisponivel` (nunca simula sucesso);
   - limite por IP (5 envios / 10 min) → `429 muitas_tentativas` + `Retry-After`;
   - `Content-Type` diferente de JSON → `415`; corpo > 16 KB → `413 corpo_grande`; JSON inválido → `400 formato_invalido`;
   - honeypot `website` preenchido → `422 rejeitado`;
   - validação zod (nome 2–100, e-mail ≤ 254, assunto `Parceria | Imprensa | Oportunidade | Outro`,
     mensagem 10–5000; sem quebras de linha em nome/e-mail) → `400 dados_invalidos` + `fields`;
   - token: assinatura inválida → `token_invalido`; enviado em menos de 3 s → `rapido_demais`;
     mais de 2 h → `token_expirado` (a UI renova o token automaticamente);
   - envio SMTP com nodemailer; falha → `502 falha_envio` (logado no servidor, sem dados do usuário);
   - sucesso → `200 { "ok": true }`.

O e-mail é texto puro, com `Reply-To` apontando para quem escreveu e assunto
`[C-STAR] <Assunto>: <Nome>`. Nenhuma credencial vai para o cliente (só variáveis sem `NEXT_PUBLIC_`).

## Variáveis de ambiente

Veja `.env.example`. Obrigatórias para habilitar o envio: `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`,
`CONTACT_FORM_SECRET`. Opcionais: `SMTP_PORT` (587), `SMTP_SECURE` (true se porta 465),
`CONTACT_TO` (mufforigem@gmail.com), `CONTACT_FROM` (= `SMTP_USER`).

Na Vercel: Project → Settings → Environment Variables (Production e Preview), depois redeploy.
Com Gmail, use uma senha de app e `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=465`.

## Limite por IP (melhor esforço)

O rate limit é um `Map` em memória por instância. Em serverless cada instância tem o seu e ele zera
em cold start: freia abuso casual, não é garantia. Para algo rígido, substituir
`createRateLimiter` por um store compartilhado (Redis/Upstash) mantendo a mesma interface.

## Testar localmente

```bash
cp .env.example .env.local   # preencha SMTP_* e CONTACT_FORM_SECRET
npm run dev                  # abra http://localhost:3000/contato
npm test                     # validação, token, rate limit e handler
```
