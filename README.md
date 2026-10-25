# Cury Correa Seguros – site

Site institucional da Cury Correa Corretora de Seguros (Brasília – DF). Feito em HTML, CSS e JavaScript puros, sem dependências: funciona em qualquer hospedagem de arquivos estáticos.

## Páginas

| Arquivo | Conteúdo |
| --- | --- |
| `index.html` | Início: apresentação, números, seguros em destaque, diferenciais, como funciona, seguradoras parceiras |
| `seguros.html` | Os 10 tipos de seguro, com atalhos e botão de cotação pelo WhatsApp |
| `sobre.html` | Missão, história, diferenciais, seguradoras e programa de indicação |
| `sinistros.html` | O que fazer em caso de sinistro, telefones de assistência 24h e perguntas frequentes |
| `contato.html` | Canais de contato, formulário de cotação (abre o WhatsApp) e mapa |

## Onde editar

- **Cores e fontes:** bloco `:root` no início de `css/styles.css`.
- **Número do WhatsApp dos botões:** constante `WHATSAPP` no início de `js/main.js`.
- **Menu, rodapé e ícones:** se repetem em cada página. Ao mudar um telefone ou link, altere nos 5 arquivos `.html`.
- **Imagens:** pasta `images/` (logos das seguradoras em `images/seguradoras/`).

## Rodar localmente

```bash
python -m http.server 5500
```

Depois abra http://localhost:5500.
