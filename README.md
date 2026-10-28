# GS Infinity Travel | Quadros

Kanban interno no estilo Trello para organizar a operação da GS. Sem build: é só HTML, CSS
e JavaScript. Usa o mesmo design system da landing page e puxa a logo e o favicon de
`assets/`.

```
./
├── index.html        a página
├── styles.css        visual (claro e escuro)
├── app.js            o app
├── modelos.js        galeria de modelos prontos (um bloco por modelo)
├── cloud.js          conversa com o Supabase (login e sincronização)
├── config.js         ← você preenche aqui a URL e a chave do Supabase
├── supabase/schema.sql   ← você roda isto uma vez no Supabase
└── assets/           logo, favicon e imagens de fundo
```

## Dois modos

| | Modo local (padrão) | Modo nuvem (Supabase) |
|---|---|---|
| Como ligar | já vem assim | preencher `config.js` |
| Login | não tem | Google ou e-mail e senha, com "Manter conectado" |
| Dados | só neste navegador | no servidor, iguais para toda a equipe, em tempo real |
| Permissões | quem usa é sempre administrador | administrador e membro (veja abaixo) |

Enquanto o `config.js` estiver vazio, o app abre direto, sem login, e guarda tudo no
navegador (exporte backups pelo menu da conta › Configurações).

## Quem pode o quê (modo nuvem)

- **Administrador** (login mestre): é só o e-mail **grupovilane@gmail.com**, e só entrando
  com o **Google**. Usa tudo, aprova ou bloqueia as outras pessoas e vê a aba Equipe. Esse
  e-mail não consegue criar conta com senha, para ninguém "roubar" o acesso mestre.
- **Membro** (todas as outras contas, sempre usuários comuns): usa todos os quadros, listas e cartões da equipe, mas **só edita a própria
  conta** (nome, cor, cargo e senha). Não vê a aba Equipe e não consegue alterar função,
  status ou e-mail de ninguém.
- **Pendente**: criou a conta, mas ainda não foi aprovado. Não vê nenhum dado.
- **Bloqueado**: perdeu o acesso.

Essas regras valem no servidor (segurança por linha do Supabase), não só na tela: mesmo
alguém que mexa no código do navegador não consegue editar a conta de outra pessoa.

## Ligar o login e a sincronização (uma vez, ~15 minutos)

1. **Criar o projeto.** Em [supabase.com](https://supabase.com) crie uma conta e um projeto
   (o plano gratuito basta).
2. **Criar as tabelas.** No projeto, abra **SQL Editor**, cole o conteúdo de
   `supabase/schema.sql` e clique em **Run**.
3. **Ativar o login por e-mail.** Em **Authentication › Providers**, deixe **Email** ligado.
   Por padrão o Supabase pede que a pessoa confirme o e-mail ao criar a conta.
4. **Ativar o login com Google.**
   1. No [Google Cloud Console](https://console.cloud.google.com/apis/credentials), crie um
      **ID do cliente OAuth** do tipo **Aplicativo da Web**.
   2. Em **URIs de redirecionamento autorizados**, cole a URL que o Supabase mostra em
      **Authentication › Providers › Google** (termina em `/auth/v1/callback`).
   3. Copie o **Client ID** e o **Client Secret** para essa mesma tela do Supabase e salve.
5. **Informar o endereço do site.** Em **Authentication › URL Configuration**, coloque em
   **Site URL** o endereço onde o app vai ficar (ex.: `https://seusite.com.br/`) e,
   em **Redirect URLs**, o mesmo endereço mais `http://localhost:8891/` para testes.
6. **Colar as chaves.** Em **Project Settings › API**, copie a **Project URL** e a chave
   **anon public** para o `config.js`. Essa chave pode ficar no site: quem protege os dados
   são as regras do passo 2.
7. **Entrar como administrador.** Abra o app e clique em **Continuar com o Google** usando
   grupovilane@gmail.com. Essa conta já entra como administradora e liberada. Depois, cada
   pessoa da equipe cria a própria conta (Google ou e-mail e senha) e você aprova em
   **Conta › Equipe**. Para trocar o e-mail mestre, altere `master_email()` no
   `supabase/schema.sql` e rode o arquivo de novo.

### Levar os quadros que você já tem
No modo local, exporte o backup (Conta › Configurações). Depois de ligar a nuvem e entrar
como administrador, use **Importar backup** no mesmo lugar: os quadros são adicionados
sem apagar nada.

## O que tem no app

- Criar quadro no estilo do Trello: prévia, fundos (fotos de Foz ou cores da marca), título
  obrigatório, **visibilidade** (equipe ou privado, só no modo nuvem) e "Começar com um template".
  Quadro privado só é visto por quem o criou, e isso vale no servidor
- Vários quadros, favoritos, fundos na paleta GS e **modelos prontos** (aba Modelos) para
  vendas, reservas, grupos, conteúdo, atendimento e equipe. Qualquer quadro pode virar modelo
- Listas e cartões com arrastar e soltar (no celular, segure o cartão um instante) e rolagem
  lateral arrastando o fundo do quadro
- Cartão com etiquetas, membros, data de entrega, descrição, checklist, comentários, histórico
  e capa. Mover, copiar, arquivar e excluir quadros, listas e cartões
- Filtro por etiqueta, membro e prazo; busca em todos os quadros (atalho `/`)
- **Menu da conta**: perfil e visibilidade, conta, atividade, cartões, configurações, equipe
  (administrador), tema claro, escuro ou do sistema, ajuda, atalhos (`?`) e logout
- Em tempo real: o que uma pessoa muda aparece para as outras em segundos

## Limites conhecidos

- Cada quadro é salvo inteiro. Se duas pessoas editarem **o mesmo quadro no mesmo instante**,
  vale a última gravação. Para uma equipe pequena isso raramente acontece.
- Todo membro ativo pode excluir quadros. Se quiser restringir isso ao administrador, dá
  para ajustar a política `quadros: tudo` no `supabase/schema.sql`.
- O e-mail de cada pessoa fica visível para a equipe liberada (o administrador precisa dele
  para aprovar contas).

## Testar no computador

Na pasta do projeto:

```bash
node .claude/serve.js 8891 .
```

e abra `http://localhost:8891/`. (O login com Google só funciona em `localhost` ou
`https`, não abrindo o arquivo direto.)
