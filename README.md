# Vila Prime Restaurante

Projeto estático do site do Vila Prime, organizado para publicação no GitHub. O catálogo inicial usa as três ofertas fornecidas pelo restaurante; não foram criados itens ou preços adicionais.

## Estrutura

```text
vila-prime-github/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── script.js
├── img/
│   ├── logo-vila-prime.jpeg
│   ├── hero-almoco-sushi.jpg
│   ├── hero-rodizio-semana.jpg
│   ├── hero-rodizio-fim-de-semana.jpg
│   └── demais fotos e vídeo do site
├── .gitignore
└── README.md
```

## Recursos

- Página responsiva com apresentação do restaurante, cardápio, ofertas, galeria, localização e formulário de reserva.
- Catálogo de ofertas com almoço e rodízios, usando os valores e horários fornecidos.
- Sacola no navegador para guardar e remover ofertas selecionadas. A seleção fica no `localStorage` deste dispositivo.
- Link do WhatsApp com a seleção preenchida para consultar disponibilidade e condições. A sacola não recebe pagamento nem confirma uma reserva.
- Fotos de comida geradas para o site e identificadas como ilustrativas.

## Como abrir

Não há etapa de compilação nem dependências. Abra `index.html` no navegador ou use uma extensão de servidor local, como Live Server no VS Code, para ter uma visualização mais próxima de um site publicado.

## Publicar no GitHub

1. Crie um repositório vazio no GitHub.
2. Abra um terminal nesta pasta e execute:

   ```bash
   git init
   git add .
   git commit -m "Adiciona site do Vila Prime"
   git branch -M main
   git remote add origin URL_DO_REPOSITORIO
   git push -u origin main
   ```

3. Para publicar como site estático, habilite GitHub Pages nas configurações do repositório e selecione a branch `main`.

## Atualizar ofertas

Os textos visíveis, preços, horários e atributos usados pela sacola estão nas três ofertas de `index.html`. Mantenha o nome, o preço e o identificador de cada botão `data-add-to-bag` alinhados ao texto mostrado no respectivo slide.

## Antes de publicar

- Confirme que preços, horários e condições das ofertas continuam vigentes.
- O telefone exibido no site é `(11) 2959-1060`; o formulário e a sacola abrem o WhatsApp `+55 11 99173-5016`. Confirme qual contato deve ser publicado.
- Confira os horários gerais da seção de visita junto ao restaurante.
- A sacola é somente uma lista de interesse no navegador. Não existe backend, pagamento online nem confirmação automática.
