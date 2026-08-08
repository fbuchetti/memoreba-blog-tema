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

## Paleta — identidade do blog, não a do produto

O blog tem marca própria. A paleta vem de
`docs/08-produto/marca-blog/descricao-blog.md` no monorepo, **não** dos tokens
do produto (`packages/ui/src/styles/tokens.css`). Decisão do dono em 08/08/2026:
o blog veste "De Cabeça!", o Memoreba mantém terracota e roxo.

**Base neutra** — é ela que deixa a cor da editoria significar alguma coisa:

| Uso | Cor |
|---|---|
| Fundo | `#FFFFFF` |
| Grafite (texto e títulos) | `#232B2B` |
| Grafite claro (datas, apoio) | `#6B7272` |
| Linha | `#E6E8E8` |

**Cor por editoria** — a engrenagem do logotipo troca de cor conforme a pauta:

| Editoria | Cor |
|---|---|
| Método | `#20A8E0` |
| Memória | `#844890` |
| Edital | `#E46C30` |
| Rotina | `#009C9C` |
| Bastidores | `#FCB418` |
| Série especial (reservada) | `#E41860` |

Regra que sustenta o sistema: **o corpo da página fica neutro**. Se o layout
começar a receber cor de fundo em bloco, a sinalização por editoria se perde.
O ciano de Método é o padrão de link por ser a cor da engrenagem no logotipo
principal.

Os cinzas `#6B7272` e `#E6E8E8` são derivados do grafite, não constam do
documento de marca — se a marca fixar valores próprios, troque aqui.

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
