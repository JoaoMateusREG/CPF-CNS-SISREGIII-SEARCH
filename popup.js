console.log('popup.js carregado (contexto: popup)');

// Função para buscar CNS por CPF
document.getElementById('buscarcns').addEventListener('click', async () => {
  const botaoExecutar = document.getElementById('buscarcns');
  botaoExecutar.disabled = true;
  console.log('Botão buscar CNS clicado');
  let cnsValue = document.getElementById('cpf-cns').value;
  console.log('Valor digitado no input:', cnsValue);

  if (cnsValue) {
    executarNaAbaSisreg(cnsValue, botaoExecutar, 'cns', null);
  } else {
    console.log('Input do popup vazio, buscando CNS na aba atual pelo XPath...');
    chrome.tabs.query({active: true, currentWindow: true}, (tabsAtuais) => {
      if (tabsAtuais.length === 0) {
        console.error('Nenhuma aba ativa encontrada.');
        botaoExecutar.disabled = false;
        return;
      }
      const abaAtualId = tabsAtuais[0].id;
      chrome.scripting.executeScript({
        target: { tabId: abaAtualId },
        func: () => {
          const pInputMask = document.querySelector('p-inputmask[controllabel="CPF"]');
          if (pInputMask) {
            const input = pInputMask.querySelector('input');
            return input ? input.value : '';
          }
          return '';
        }
      }, (results) => {
        if (results && results[0] && results[0].result) {
          cnsValue = results[0].result;
          console.log('CNS encontrado na aba atual:', cnsValue);
          if (!cnsValue) {
            console.error('CNS não encontrado pelo XPath na aba atual.');
            botaoExecutar.disabled = false;
            return;
          }
          cnsValue = cnsValue.replace(/\D/g, '');
          console.log('CNS limpo:', cnsValue);
          executarNaAbaSisreg(cnsValue, botaoExecutar, 'cns', abaAtualId);
        } else {
          console.error('Não foi possível obter o CNS da aba atual.');
          botaoExecutar.disabled = false;
        }
      });
    });
  }
});

// Função para preencher dados completos
document.getElementById('preenchercompleto').addEventListener('click', async () => {
  const botaoExecutar = document.getElementById('preenchercompleto');
  botaoExecutar.disabled = true;
  console.log('Botão preencher completo clicado');
  
  // Primeiro verifica se tem valor digitado no input da extensão
  let valorInput = document.getElementById('cpf-cns').value;
  
  if (valorInput && valorInput.trim()) {
    // Se tem valor digitado, usa ele
    const valorLimpo = valorInput.replace(/\D/g, '');
    console.log('Valor do input da extensão:', valorLimpo);
    
    chrome.tabs.query({active: true, currentWindow: true}, (tabsAtuais) => {
      if (tabsAtuais.length === 0) {
        console.error('Nenhuma aba ativa encontrada.');
        botaoExecutar.disabled = false;
        return;
      }
      const abaCmceId = tabsAtuais[0].id;
      buscarDadosCompletosSisreg(valorLimpo, botaoExecutar, abaCmceId);
    });
  } else {
    // Se não tem valor digitado, busca do CMCE
    chrome.tabs.query({active: true, currentWindow: true}, (tabsAtuais) => {
      if (tabsAtuais.length === 0) {
        console.error('Nenhuma aba ativa encontrada.');
        botaoExecutar.disabled = false;
        return;
      }
      const abaCmceId = tabsAtuais[0].id;
      
      // Busca CPF ou CNS do CMCE
      chrome.scripting.executeScript({
        target: { tabId: abaCmceId },
        func: () => {
          // Tenta pegar CPF primeiro
          let cpfInput = document.querySelector('p-inputmask[controllabel="CPF"]');
          if (cpfInput) {
            const input = cpfInput.querySelector('input');
            if (input && input.value && input.value.trim()) {
              return { tipo: 'cpf', valor: input.value };
            }
          }
          
          // Se não tem CPF, tenta CNS
          let cnsInput = document.querySelector('p-inputmask[controllabel="CNS"]');
          if (cnsInput) {
            const input = cnsInput.querySelector('input');
            if (input && input.value && input.value.trim()) {
              return { tipo: 'cns', valor: input.value };
            }
          }
          
          return null;
        }
      }, (results) => {
        if (results && results[0] && results[0].result) {
          const { tipo, valor } = results[0].result;
          const valorLimpo = valor.replace(/\D/g, '');
          console.log(`${tipo.toUpperCase()} encontrado no CMCE:`, valorLimpo);
          
          buscarDadosCompletosSisreg(valorLimpo, botaoExecutar, abaCmceId);
        } else {
          console.error('CPF ou CNS não encontrado no CMCE.');
          botaoExecutar.disabled = false;
        }
      });
    });
  }
});

// Função para buscar CPF por CNS
document.getElementById('buscarcpf').addEventListener('click', async () => {
  const botaoExecutar = document.getElementById('buscarcpf');
  botaoExecutar.disabled = true;
  console.log('Botão buscar CPF clicado');
  let cpfValue = document.getElementById('cpf-cns').value;
  console.log('Valor digitado no input:', cpfValue);

  if (cpfValue) {
    executarNaAbaSisreg(cpfValue, botaoExecutar, 'cpf', null);
  } else {
    console.log('Input do popup vazio, buscando CPF na aba atual pelo XPath...');
    chrome.tabs.query({active: true, currentWindow: true}, (tabsAtuais) => {
      if (tabsAtuais.length === 0) {
        console.error('Nenhuma aba ativa encontrada.');
        botaoExecutar.disabled = false;
        return;
      }
      const abaAtualId = tabsAtuais[0].id;
      chrome.scripting.executeScript({
        target: { tabId: abaAtualId },
        func: () => {
          const pInputMask = document.querySelector('p-inputmask[controllabel="CNS"]');
          if (pInputMask) {
            const input = pInputMask.querySelector('input');
            return input ? input.value : '';
          }
          return '';
        }
      }, (results) => {
        if (results && results[0] && results[0].result) {
          cpfValue = results[0].result;
          console.log('CPF encontrado na aba atual:', cpfValue);
          if (!cpfValue) {
            console.error('CPF não encontrado pelo XPath na aba atual.');
            botaoExecutar.disabled = false;
            return;
          }
          cpfValue = cpfValue.replace(/\D/g, '');
          console.log('CPF limpo:', cpfValue);
          executarNaAbaSisreg(cpfValue, botaoExecutar, 'cpf', abaAtualId);
        } else {
          console.error('Não foi possível obter o CPF da aba atual.');
          botaoExecutar.disabled = false;
        }
      });
    });
  }
});

function buscarDadosCompletosSisreg(value, botaoExecutar, abaCmceId) {
  chrome.tabs.query({ url: "*://sisregiii.saude.gov.br/*" }, (tabs) => {
    if (tabs.length === 0) {
      botaoExecutar.disabled = false;
      return;
    }
    const tabId = tabs[0].id;
    chrome.scripting.executeScript({
      target: { tabId },
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
                  
                  // Busca todos os dados
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
                  
                  // Verifica se encontrou dados suficientes
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
      args: [value]
    }, (results) => {
      const dadosCompletos = results && results[0] && results[0].result;
      
      if (dadosCompletos && abaCmceId) {
        // Preenche todos os campos no CMCE
        chrome.scripting.executeScript({
          target: { tabId: abaCmceId },
          func: (dados) => {
            // CPF
            if (dados.cpf) {
              const cpfInput = document.querySelector('p-inputmask[controllabel="CPF"]');
              if (cpfInput) {
                const input = cpfInput.querySelector('input');
                if (input) {
                  input.value = dados.cpf;
                  input.dispatchEvent(new Event('input', { bubbles: true }));
                  input.dispatchEvent(new Event('change', { bubbles: true }));
                }
              }
            }
            
            // CNS
            if (dados.cns) {
              const cnsInput = document.querySelector('p-inputmask[controllabel="CNS"]');
              if (cnsInput) {
                const input = cnsInput.querySelector('input');
                if (input) {
                  input.value = dados.cns;
                  input.dispatchEvent(new Event('input', { bubbles: true }));
                  input.dispatchEvent(new Event('change', { bubbles: true }));
                }
              }
            }
            
            // Nome Completo
            if (dados.nome) {
              const nomeInput = document.querySelector('input[controllabel="Nome Completo"]');
              if (nomeInput) {
                nomeInput.value = dados.nome;
                nomeInput.dispatchEvent(new Event('input', { bubbles: true }));
                nomeInput.dispatchEvent(new Event('change', { bubbles: true }));
              }
            }
            
            // Nome da Mãe
            if (dados.nomeMae) {
              const nomeMaeInput = document.querySelector('input[controllabel="Nome da mãe"]');
              if (nomeMaeInput) {
                nomeMaeInput.value = dados.nomeMae;
                nomeMaeInput.dispatchEvent(new Event('input', { bubbles: true }));
                nomeMaeInput.dispatchEvent(new Event('change', { bubbles: true }));
              }
            }
            
            // Data de Nascimento
            if (dados.dataNascimento) {
              const dataNascInput = document.querySelector('mvcommons-calendar[controllabel="Nascimento"] input');
              if (dataNascInput) {
                dataNascInput.value = dados.dataNascimento;
                dataNascInput.dispatchEvent(new Event('input', { bubbles: true }));
                dataNascInput.dispatchEvent(new Event('change', { bubbles: true }));
              }
            }
            
            // Sexo (1 = Masculino, 2 = Feminino)
            if (dados.sexo) {
              const sexoValue = dados.sexo.toUpperCase().includes('MASCULINO') ? '1' : '2';
              const sexoRadios = document.querySelectorAll('p-radiobutton[name="sexo"] input[type="radio"]');
              sexoRadios.forEach(radio => {
                if (radio.value === sexoValue) {
                  radio.click();
                }
              });
            }
            
            // Estrangeiro - sempre seleciona "Não" (valor 0)
            const estrangeiroRadios = document.querySelectorAll('p-radiobutton[name="flagEstrangeiro"] input[type="radio"]');
            estrangeiroRadios.forEach(radio => {
              if (radio.value === '0') {
                radio.click();
              }
            });
            
            // Raça/Cor - seleciona "BRANCA"
            setTimeout(() => {
              const racaCorDropdown = document.querySelector('mvcommons-dropdown[controllabel="Raça cor"] p-dropdown');
              if (racaCorDropdown) {
                const dropdownDiv = racaCorDropdown.querySelector('.ui-dropdown');
                if (dropdownDiv) {
                  dropdownDiv.click();
                  
                  setTimeout(() => {
                    const brancaOption = Array.from(document.querySelectorAll('.ui-dropdown-item')).find(el => 
                      el.textContent.trim() === 'BRANCA'
                    );
                    if (brancaOption) {
                      brancaOption.click();
                    }
                  }, 300);
                }
              }
            }, 500);
            
            // CEP - preenche com 55700-000 se estiver vazio
            setTimeout(() => {
              const cepInput = document.querySelector('p-inputmask[controllabel="CEP"] input');
              if (cepInput && (!cepInput.value || cepInput.value.trim() === '')) {
                cepInput.value = '55700-000';
                cepInput.dispatchEvent(new Event('input', { bubbles: true }));
                cepInput.dispatchEvent(new Event('change', { bubbles: true }));
              }
            }, 500);
          },
          args: [dadosCompletos]
        }, () => {
          botaoExecutar.disabled = false;
          console.log('Dados preenchidos com sucesso!');
        });
      } else {
        botaoExecutar.disabled = false;
        console.error('Não foi possível obter os dados do SISREG.');
      }
    });
  });
}

function executarNaAbaSisreg(value, botaoExecutar, tipo, abaCmceId) {
  chrome.tabs.query({ url: "*://sisregiii.saude.gov.br/*" }, (tabs) => {
    if (tabs.length === 0) {
      botaoExecutar.disabled = false;
      return;
    }
    const tabId = tabs[0].id;
    chrome.scripting.executeScript({
      target: { tabId },
      func: (valor, tipoBusca) => {
        return new Promise((resolve) => {
          function copyToClipboard(text) {
            const textArea = document.createElement("textarea");
            textArea.value = text;
            textArea.style.top = "0";
            textArea.style.left = "0";
            textArea.style.position = "fixed";
            textArea.style.opacity = "0";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
              document.execCommand('copy');
            } catch (err) {
              // Não faz nada
            }
            document.body.removeChild(textArea);
          }

          const iframe = document.getElementById('f_main');
          const link = document.querySelector('a[href="/cgi-bin/cadweb50?url=/cgi-bin/marcar"]');
          if (link) {
            link.click();
            iframe.onload = function() {
              executarFluxoPrincipal();
              iframe.onload = null;
            };
          } else {
            executarFluxoPrincipal();
          }
          function executarFluxoPrincipal() {
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
                        const nextTr = tr.nextElementSibling;
                        const td = nextTr.querySelector('td');
                        if (td) {
                          texto = td.textContent.trim().replace(/\D/g, '');
                        }
                      }
                    }
                  }

                  if (texto) {
                    clearInterval(intervalo);
                    copyToClipboard(texto);
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
      args: [value, tipo]
    }, (results) => {
      const textoCopiado = results && results[0] && results[0].result;
      
      // Se copiou CNS e tem aba do CMCE, insere o CNS no campo
      if (textoCopiado && tipo === 'cns' && abaCmceId) {
        chrome.scripting.executeScript({
          target: { tabId: abaCmceId },
          func: (cnsValue) => {
            const pInputMask = document.querySelector('p-inputmask[controllabel="CNS"]');
            if (pInputMask) {
              const input = pInputMask.querySelector('input');
              if (input) {
                input.value = cnsValue;
                input.dispatchEvent(new Event('input', { bubbles: true }));
                input.dispatchEvent(new Event('change', { bubbles: true }));
              }
            }
          },
          args: [textoCopiado]
        }, () => {
          botaoExecutar.disabled = false;
        });
      } 
      // Se copiou CPF e tem aba do CMCE, insere o CPF no campo
      else if (textoCopiado && tipo === 'cpf' && abaCmceId) {
        chrome.scripting.executeScript({
          target: { tabId: abaCmceId },
          func: (cpfValue) => {
            const pInputMask = document.querySelector('p-inputmask[controllabel="CPF"]');
            if (pInputMask) {
              const input = pInputMask.querySelector('input');
              if (input) {
                input.value = cpfValue;
                input.dispatchEvent(new Event('input', { bubbles: true }));
                input.dispatchEvent(new Event('change', { bubbles: true }));
              }
            }
          },
          args: [textoCopiado]
        }, () => {
          botaoExecutar.disabled = false;
        });
      } else {
        botaoExecutar.disabled = false;
      }
    });
  });
}