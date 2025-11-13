console.log('Background script carregado');

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'buscarCNS') {
    buscarNoSisreg(request.valor, 'cns', sender.tab.id);
  } else if (request.action === 'buscarCPF') {
    buscarNoSisreg(request.valor, 'cpf', sender.tab.id);
  } else if (request.action === 'preencherCompleto') {
    buscarDadosCompletos(request.valor, sender.tab.id);
  }
});

function buscarNoSisreg(valor, tipo, tabCmceId) {
  chrome.tabs.query({ url: "*://sisregiii.saude.gov.br/*" }, (tabs) => {
    if (tabs.length === 0) {
      console.error('Aba do SISREG não encontrada');
      return;
    }
    
    const tabSisregId = tabs[0].id;
    
    chrome.scripting.executeScript({
      target: { tabId: tabSisregId },
      func: (valor, tipoBusca) => {
        return new Promise((resolve) => {
          const iframe = document.getElementById('f_main');
          const link = document.querySelector('a[href="/cgi-bin/cadweb50?url=/cgi-bin/marcar"]');
          
          if (link) {
            link.click();
            iframe.onload = function() {
              executarBusca();
              iframe.onload = null;
            };
          } else {
            executarBusca();
          }
          
          function executarBusca() {
            if (iframe && iframe.contentDocument) {
              const input = iframe.contentDocument.querySelector('input[name="nu_cns"]');
              const botao = iframe.contentDocument.querySelector('input[name="btn_pesquisar"]');
              
              if (input && botao) {
                input.value = valor;
                botao.click();
                
                let tentativas = 0;
                const maxTentativas = 20;
                const intervalo = setInterval(() => {
                  tentativas++;
                  let texto = '';
                  
                  if (tipoBusca === 'cns') {
                    const resultado = iframe.contentDocument.evaluate(
                      '/html/body/div[2]/form/center[1]/table/tbody/tr[3]/td/font/b',
                      iframe.contentDocument,
                      null,
                      XPathResult.FIRST_ORDERED_NODE_TYPE,
                      null
                    ).singleNodeValue;
                    if (resultado) {
                      texto = resultado.textContent;
                    }
                  } else if (tipoBusca === 'cpf') {
                    const cpfLabel = iframe.contentDocument.evaluate(
                      "//b[text()='CPF:']",
                      iframe.contentDocument,
                      null,
                      XPathResult.FIRST_ORDERED_NODE_TYPE,
                      null
                    ).singleNodeValue;
                    if (cpfLabel) {
                      const tr = cpfLabel.closest('tr');
                      if (tr && tr.nextElementSibling) {
                        const td = tr.nextElementSibling.querySelector('td');
                        if (td) {
                          texto = td.textContent.trim().replace(/\D/g, '');
                        }
                      }
                    }
                  }
                  
                  if (texto) {
                    clearInterval(intervalo);
                    resolve(texto);
                  } else if (tentativas >= maxTentativas) {
                    clearInterval(intervalo);
                    resolve(null);
                  }
                }, 500);
              } else {
                resolve(null);
              }
            } else {
              resolve(null);
            }
          }
        });
      },
      args: [valor, tipo]
    }, (results) => {
      const textoEncontrado = results && results[0] && results[0].result;
      
      if (textoEncontrado) {
        if (tipo === 'cns') {
          chrome.tabs.sendMessage(tabCmceId, { action: 'inserirCNS', valor: textoEncontrado });
        } else if (tipo === 'cpf') {
          chrome.tabs.sendMessage(tabCmceId, { action: 'inserirCPF', valor: textoEncontrado });
        }
      }
    });
  });
}

function buscarDadosCompletos(valor, tabCmceId) {
  chrome.tabs.query({ url: "*://sisregiii.saude.gov.br/*" }, (tabs) => {
    if (tabs.length === 0) {
      console.error('Aba do SISREG não encontrada');
      return;
    }
    
    const tabSisregId = tabs[0].id;
    
    chrome.scripting.executeScript({
      target: { tabId: tabSisregId },
      func: (valor) => {
        return new Promise((resolve) => {
          const iframe = document.getElementById('f_main');
          const link = document.querySelector('a[href="/cgi-bin/cadweb50?url=/cgi-bin/marcar"]');
          
          if (link) {
            link.click();
            iframe.onload = function() {
              executarBusca();
              iframe.onload = null;
            };
          } else {
            executarBusca();
          }
          
          function executarBusca() {
            if (iframe && iframe.contentDocument) {
              const input = iframe.contentDocument.querySelector('input[name="nu_cns"]');
              const botao = iframe.contentDocument.querySelector('input[name="btn_pesquisar"]');
              
              if (input && botao) {
                input.value = valor;
                botao.click();
                
                let tentativas = 0;
                const maxTentativas = 20;
                const intervalo = setInterval(() => {
                  tentativas++;
                  const dados = {};
                  
                  // CNS
                  const cnsNode = iframe.contentDocument.evaluate(
                    '/html/body/div[2]/form/center[1]/table/tbody/tr[3]/td/font/b',
                    iframe.contentDocument,
                    null,
                    XPathResult.FIRST_ORDERED_NODE_TYPE,
                    null
                  ).singleNodeValue;
                  if (cnsNode) dados.cns = cnsNode.textContent.trim();
                  
                  // CPF
                  const cpfLabel = iframe.contentDocument.evaluate(
                    "//b[text()='CPF:']",
                    iframe.contentDocument,
                    null,
                    XPathResult.FIRST_ORDERED_NODE_TYPE,
                    null
                  ).singleNodeValue;
                  if (cpfLabel) {
                    const tr = cpfLabel.closest('tr');
                    if (tr && tr.nextElementSibling) {
                      const td = tr.nextElementSibling.querySelector('td');
                      if (td) dados.cpf = td.textContent.trim().replace(/\D/g, '');
                    }
                  }
                  
                  // Nome
                  const nomeLabel = iframe.contentDocument.evaluate(
                    "//b[text()='Nome:']",
                    iframe.contentDocument,
                    null,
                    XPathResult.FIRST_ORDERED_NODE_TYPE,
                    null
                  ).singleNodeValue;
                  if (nomeLabel) {
                    const tr = nomeLabel.closest('tr');
                    if (tr && tr.nextElementSibling) {
                      const td = tr.nextElementSibling.querySelector('td');
                      if (td) dados.nome = td.textContent.trim();
                    }
                  }
                  
                  // Nome da Mãe
                  const nomeMaeLabel = iframe.contentDocument.evaluate(
                    "//b[text()='Nome da Mãe:']",
                    iframe.contentDocument,
                    null,
                    XPathResult.FIRST_ORDERED_NODE_TYPE,
                    null
                  ).singleNodeValue;
                  if (nomeMaeLabel) {
                    const tr = nomeMaeLabel.closest('tr');
                    if (tr && tr.nextElementSibling) {
                      const td = tr.nextElementSibling.querySelector('td');
                      if (td) dados.nomeMae = td.textContent.trim();
                    }
                  }
                  
                  // Data de Nascimento
                  const dataNascLabel = iframe.contentDocument.evaluate(
                    "//b[text()='Data de Nascimento:']",
                    iframe.contentDocument,
                    null,
                    XPathResult.FIRST_ORDERED_NODE_TYPE,
                    null
                  ).singleNodeValue;
                  if (dataNascLabel) {
                    const tr = dataNascLabel.closest('tr');
                    if (tr && tr.nextElementSibling) {
                      const td = tr.nextElementSibling.querySelector('td');
                      if (td) {
                        const texto = td.textContent.trim();
                        const match = texto.match(/(\d{2}\/\d{2}\/\d{4})/);
                        if (match) dados.dataNascimento = match[1];
                      }
                    }
                  }
                  
                  // Sexo
                  const sexoLabel = iframe.contentDocument.evaluate(
                    "//b[text()='Sexo:']",
                    iframe.contentDocument,
                    null,
                    XPathResult.FIRST_ORDERED_NODE_TYPE,
                    null
                  ).singleNodeValue;
                  if (sexoLabel) {
                    const tr = sexoLabel.closest('tr');
                    if (tr && tr.nextElementSibling) {
                      const td = tr.nextElementSibling.querySelector('td');
                      if (td) dados.sexo = td.textContent.trim();
                    }
                  }
                  
                  if (dados.nome && dados.dataNascimento) {
                    clearInterval(intervalo);
                    resolve(dados);
                  } else if (tentativas >= maxTentativas) {
                    clearInterval(intervalo);
                    resolve(null);
                  }
                }, 500);
              } else {
                resolve(null);
              }
            } else {
              resolve(null);
            }
          }
        });
      },
      args: [valor]
    }, (results) => {
      const dadosCompletos = results && results[0] && results[0].result;
      
      if (dadosCompletos) {
        chrome.tabs.sendMessage(tabCmceId, { action: 'preencherDados', dados: dadosCompletos });
      }
    });
  });
}
