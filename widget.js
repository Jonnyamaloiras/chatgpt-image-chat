(async () => {
  if (document.getElementById('gpt-widget')) return;

  const apiKey = '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'; // Troque pela sua chave da OpenAI

  const widget = document.createElement('div');
  widget.id = 'gpt-widget';
  widget.innerHTML = `
    <style>
      #gpt-widget {
        position: fixed; bottom: 20px; right: 20px;
        width: 320px; height: 420px; background: white;
        border: 1px solid #ccc; border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        font-family: sans-serif; z-index: 9999;
        display: flex; flex-direction: column;
      }
      #gpt-chat { flex: 1; padding: 10px; overflow-y: auto; font-size: 14px; }
      #gpt-input { display: flex; border-top: 1px solid #ccc; }
      #gpt-input input { flex: 1; padding: 8px; border: none; outline: none; }
      #gpt-input button { padding: 8px 10px; border: none; background: #10a37f; color: white; cursor: pointer; }
      #gpt-close { position: absolute; top: 5px; right: 10px; cursor: pointer; color: #888; }
    </style>
    <div id="gpt-close">✖</div>
    <div id="gpt-chat">Coletando imagens da página...</div>
    <div id="gpt-input">
      <input type="text" placeholder="Pergunte algo sobre as imagens..." />
      <button>Enviar</button>
    </div>
  `;
  document.body.appendChild(widget);

  document.getElementById('gpt-close').onclick = () => widget.remove();

  const chat = document.querySelector('#gpt-chat');
  const input = document.querySelector('#gpt-input input');
  const button = document.querySelector('#gpt-input button');

  function addMessage(sender, text) {
    chat.innerHTML += `<div><strong>${sender}:</strong> ${text}</div>`;
    chat.scrollTop = chat.scrollHeight;
  }

  function getImagesFromPage() {
    const images = Array.from(document.images)
      .map(img => img.src)
      .filter(src => src && src.startsWith('http'));
    return images.slice(0, 5); // máximo 5 imagens
  }

  const images = getImagesFromPage();
  addMessage('Você', `Encontrei ${images.length} imagem(ns) na página.`);

  async function askGPT(prompt) {
    const fullPrompt = `Essas são imagens da página atual:\n${images.join('\n')}\n\nPergunta: ${prompt}`;
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{ role: 'user', content: fullPrompt }],
        temperature: 0.7
      })
    });
    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'Erro na resposta da API.';
  }

  button.onclick = async () => {
    const text = input.value;
    if (!text) return;
    addMessage('Você', text);
    input.value = '';
    const reply = await askGPT(text);
    addMessage('ChatGPT', reply);
  };
})();
