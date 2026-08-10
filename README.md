# Memoreba Blog — tema-filho

Tema-filho do **Twenty Twenty-Five** para `blog.memoreba.com.br`, versionado em Git
e implantado pelo **Git Version Control** do cPanel (HostGator).

## Por que tema-filho

O tema-pai (`twentytwentyfive`) é atualizado pelo WordPress. Qualquer alteração feita
dentro dele é apagada na próxima atualização. O tema-filho fica numa pasta própria,
sobrevive às atualizações e herda tudo o que não for redefinido aqui.

## Estrutura

| Arquivo | Papel |
|---|---|
| `style.css` | Cabeçalho obrigatório (`Template: twentytwentyfive`) e CSS residual |
| `theme.json` | Onde mora o visual: paleta, tipografia, espaçamentos |
| `functions.php` | Só o enfileiramento do CSS. **Soma-se** ao do pai, não o substitui |
| `templates/`, `parts/` | Criados sob demanda; um arquivo de mesmo nome sobrescreve o do pai |
| `.cpanel.yml` | Diz ao cPanel quais arquivos copiar e para onde |

## Paleta — o design system do produto

**Decisão do dono em 09/08/2026, que substitui a de 08/08:** o blog inteiro
passa a usar o design system do Memoreba. A identidade grafite "De Cabeça!"
foi aposentada; o blog assina como Memoreba.

A fonte destes valores é o Guia, em
`docs/08-produto/curso-sobre-o-memoreba/guia/assets/css/` no monorepo
(`tokens.css`, `leitura.css`, `componentes.css`). **Quando um valor aqui
divergir de lá, lá está certo** — o Guia é a referência, não o destino.

**Neutros quentes:**

| Uso | Token | Cor |
|---|---|---|
| Fundo | `base` | `#FAF7F0` |
| Superfície (cartão, tabela) | `superficie` | `#FFFFFF` |
| Superfície suave | `superficie-suave` | `#F6F2E8` |
| Texto | `contrast` | `#463F34` |
| Texto médio | `contrast-2` | `#5C5448` |
| Borda | `contrast-3` | `#DED7C8` |

**Marca e estados** — são as variantes escurecidas do Guia, escolhidas para
manter contraste AA sobre o creme:

| Token | Cor |
|---|---|
| `laranja` | `#B04E2E` |
| `teal` | `#1F7A71` |
| `petroleo` | `#233C50` |
| `sucesso` | `#247A55` |
| `atencao` | `#9A6720` |
| `perigo` | `#A33E31` |

**Tipografia:** Outfit (títulos e interface) e Literata (leitura), servidas do
próprio tema em `assets/fontes/` — sem Google Fonts, sem requisição a terceiro.
As licenças acompanham os arquivos.

### Editorias remapeadas

As cinco editorias não têm mais cores próprias: cada uma recebe um token que já
existe no sistema. A cor continua dizendo do que o post trata, sem abrir uma
segunda paleta paralela à do produto.

| Editoria | Token |
|---|---|
| Método | `petroleo` |
| Memória | `teal` |
| Edital | `laranja` |
| Rotina | `sucesso` |
| Bastidores | `atencao` |
| Série especial (reservada) | `perigo` |

O mapa vive em `style.css`, ligado às classes que o próprio WordPress põe no
`<body>` e nos itens de listagem (`category-<slug>`). Não há nada a marcar à mão.

### Detalhes que não são óbvios

- **Os tamanhos de fonte padrão do WordPress continuam ligados.** Conteúdo já
  publicado usa `has-large-font-size`; desligá-los faria esses parágrafos
  encolherem sem aviso. Quando o conversor do Guia parar de emitir essa classe,
  dá para reavaliar.
- **As caixas do Guia são variações de estilo do bloco de citação**, registradas
  em `functions.php` e pintadas em `style.css` (`.is-style-caixa-*`). Aparecem
  no editor sob "Estilos", então o autor troca o tipo sem tocar em código.
- **`screenshot.png` ainda mostra a arte grafite antiga** — é só a miniatura do
  tema no painel, mas precisa ser refeita.

## Como publicar uma mudança

1. Edite os arquivos e faça `git push` para o GitHub.
2. No cPanel: **Git Version Control** → repositório → aba **Pull or Deploy**.
3. Clique em **Update from Remote** e depois em **Deploy HEAD Commit**.
4. Abra o blog e confira. Se o servidor estiver com cache de página, force a
   recarga ou limpe o cache pelo painel.

Não existe implantação automática por push: o cPanel não oferece gatilho por
webhook. São dois cliques por publicação.

## Regra que mantém o Git no comando

O WordPress tem **duas cópias** de cada template: o arquivo do tema e uma cópia no
banco de dados, criada assim que alguém edita pelo **Editor de Site**. **O banco
vence o arquivo.**

Consequência prática: se você editar o layout pelo painel, este repositório deixa
de ter efeito visível — silenciosamente. Ao mexer pelo Editor de Site, ou traga a
mudança para cá e use *Limpar customizações* no painel, ou assuma que aquele
template passou a viver no banco.

O mesmo vale para os arquivos no servidor: nunca edite direto por lá. O
`Update from Remote` do cPanel usa `--ff-only` e passa a falhar se o histórico
divergir.

## Primeira ativação

Ativar este tema muda o visual do blog para os visitantes na hora. Antes:

- faça backup do banco pelo cPanel (**Backup** ou **Assistente de backup**);
- confira alguns posts depois de ativar, principalmente os com imagem destacada.
