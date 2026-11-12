# EDMUNDO KUTUZOV / V4 — ENTER THE EXPERIENCE
**Director's treatment & technical breakdown | 30.00s | 1920×1080 | 30 fps**

**Ideia central** — *DON'T JUST WATCH. ENTER THE EXPERIENCE.* O filme não explica o site; transforma a arquitectura digital numa experiência cinematográfica. O scroll é linguagem de câmara, os hovers são movimentos editoriais, e a navegação torna-se montagem.

## Compromisso de autenticidade
- Estrutura, páginas, terminologia e direcção visual mapeadas em `edmundokutuzov333/kutuzovportfolio333` em 12 Nov 2026.
- Fotogramas reais da V3, fornecida pelo titular, usados como matéria-prima visual dos trabalhos, sem inventar campanhas ou logótipos.
- A montagem é uma **recriação cinematográfica**, não uma gravação pixel-perfect do website em produção. Texto, disposição e movimento são dirigidos para o vídeo, sem alterar o site.
- **Jarvis é uma simulação narrativa** para o filme: não é uma demonstração de disponibilidade ou precisão do backend. A legenda «DEMONSTRAÇÃO CONCEPTUAL · CONVERSA ENCENADA» é mantida no enquadramento.
- O vídeo não apresenta páginas de administração nem executa acções reais de formulário, terceiros, pagamentos, ou dados privados de Supabase.

## Linguagem visual
Fundo #0A0D15, azul #4466FF, ice #9CC6F5 e branco #E8EEF6. Tipografia-matriz: Syne (display), Manrope (corpo) e JetBrains Mono (meta/tecnologia); no renderizador offline foi utilizada uma fonte de apresentação local semelhante para texto, com exactidão tipográfica sujeita à disponibilidade das fontes originais. A marca EK e campanhas vêm de fotogramas reais da V3.

## Decupagem e montagem (timecode exacto)
| Início–fim | Cena | Acção | Câmara e passagem | Som | Justificação |
|---|---|---|---|---|---|
| 00:00–00:02.00 | Gate / EK | EK surge no vazio, texto **NOT A PORTFOLIO. / A WORLD TO ENTER.** | Push-in leve, pulsações circulares, entrada óptica em azul | Impulso de abertura, instrumental V3 | Abre com aura, não com uma captura de ecrã |
| 00:02–00:05.00 | Home hero `/` | Browser abre; headline **I MAKE IDEAS STOP... STAY IN MEMORY, AND ACT.**, EK em destaque | Dolly 2.5D, cursor orientado para a zona de scroll | Quem vê entra na interface | Apresenta o código visual do site e o posicionamento |
| 00:05–00:07.35 | Manifesto + Featured Work `/` | Texto-manifesto, deslocação vertical; quatro imagens de trabalhos entram em sequência | Deslizamento, mudança de profundidade e linhas editoriais | SFX de scroll e batida de passagem | Mostra que o conteúdo continua além da hero |
| 00:07.35–00:10.65 | Work index `/work` | Título **Selected work**, filtros e grelha de campanhas/disciplinas; hover sobre uma peça | Scroll acelerado e zoom de aproximação ao projecto | Clique e whoosh contidos | Demonstra riqueza do arquivo sem fixar-se apenas num trabalho |
| 00:10.65–00:13.10 | Project detail `/work/diga-yes` | Abre Diga YES & Viva o Mundo Online, com imagem central e estudos complementares | Zoom interno e movimento lateral dos thumbnails | Impacto visual ligado ao corte | Simula a passagem do arquivo para um case study |
| 00:13.10–00:15.45 | Services `/services` | Identidade, direcção de arte, editorial, digital e IA passam em hover | Varredura vertical secção-a-secção | Cliques finos, ritmo digital | Traduz competências em navegação |
| 00:15.45–00:17.70 | Process `/process` | Discovery, Strategy, Craft, Rollout num painel editorial | Movimento horizontal de quatro etapas | Pulso de quatro acentos | Responde à pergunta «Como pensa e produz?» |
| 00:17.70–00:19.65 | About `/about` | Retrato de Edmundo, nome, 150+ projectos, 30+ marcas, 360º | Aproximação suave e luz lateral | Mix limpo para dar escala humana | Humaniza a tecnologia sem perder o autor |
| 00:19.65–00:21.55 | Clients `/clients` | Grelha com 20 nomes de marcas reais associados ao portfólio | Rastreio da grelha, destaques sucessivos | Impulso breve por sequência | Converte estética em credibilidade, sem sugerir endossos novos |
| 00:21.55–00:26.00 | Jarvis — SIMULAÇÃO | «Jarvis, mostra-me as tuas campanhas.»; resposta encenada com Diga YES, A Depressão É Real e We Are GIZ | Orbita de partículas e esfera oscilante; typing + cartões | Vozes sintéticas em PT-PT, claramente não-authenticadas; instrumental baixa | Cria curiosidade sobre interacção sem prometer função não verificada |
| 00:26.00–00:28.20 | Contact `/contact` | **LET'S TALK**, email e WhatsApp públicos | Movimento do cursor para o CTA | Impacto e recuperação de energia | Torna o convite à acção específico |
| 00:28.20–00:30.00 | Signature | EK e **DON'T JUST WATCH. ENTER THE EXPERIENCE.** + domínio | Pull-back subtil, luminosidade estabiliza | Final com identificação sonora | A curiosidade termina num endereço memorável |

## Jarvis — guião de diálogo do filme
**Utilizador (voz sintética de encenação):** «Jarvis, mostra-me as tuas campanhas.»

**Jarvis (voz sintética de encenação):** «Aqui estão: Diga YES, A Depressão é Real e We Are GIZ.»

No ecrã: três cartões com imagens reais dessas campanhas. Rodapé de leitura: **DEMONSTRAÇÃO CONCEPTUAL · CONVERSA ENCENADA**. Nenhum endpoint de IA foi chamado para criar o diálogo.

## Engenharia de renderização
1. Conferir rotas e componentes no repositório do portfólio.
2. Extrair fotogramas do master V3 (fornecido pelo autor), e separar as obras por cena.
3. Compor a interface em camadas gráficas por código, usando espaços, hierarchy e cores derivados do site.
4. Animar com relógio determinístico de 30 fps: re-enquadramento, cursor digital, estados de hover, revelação de texto, grelhas e ringes orbitais.
5. Misturar instrumental V3, eventos curtos de interface e falas sintéticas da demonstração Jarvis.
6. Codificar H.264 / AAC estéreo em MP4; validar duração, resolução, fps, codecs e legibilidade de fotogramas.

**Motor offline seleccionado:** Python 3.13, Pillow, NumPy, OpenCV, FFmpeg, espeak. Escolhido por ser reproduzível, sem custos de geração e sem alterações a Supabase ou ao site em produção. Uma alternativa Remotion/React poderia ser criada no futuro caso se precise de capturar o DOM real e renderizá-lo como vídeo; para esta entrega o master é código+imagem e já está exportado.

## Critérios de aceitação
- 30.00 segundos exactos, 1920×1080, 30 fps, H.264 + AAC, áudio estéreo.
- Todas as 7 rotas públicas principais demonstradas, com detalhe de projecto. Home mostra ainda Manifesto e Selected work.
- Dar destaque explícito à simulação Jarvis, sem representar uma consulta real.
- Evitar imagens inventadas: os quadros de trabalhos derivam do master do artista.
- Não alterar os motores, assets e renders originais V1/V2/V3.
- A disponibilidade e funcionamento do website devem ser verificados separadamente do vídeo; o filme não substitui testes end-to-end de navegação.

**Repo-fonte:** `https://github.com/edmundokutuzov333/kutuzovportfolio333`
**Site:** `https://edmundokutuzov.art`
**Repo-showreel:** `https://github.com/edmundokutuzov333/showreel-kutuzov`