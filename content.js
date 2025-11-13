console.log('Content script carregado');

let botoesInjetados = false;

// Função para verificar se o formulário existe
function verificarFormulario() {
  const botaoAdicionarFoto = document.querySelector('button.btn-add-foto');
  
  if (botaoAdicionarFoto && !botoesInjetados) {
    console.log('Formulário detectado! Injetando botões...');
    injetarBotoes();
    botoesInjetados = true;
  } else if (!botaoAdicionarFoto && botoesInjetados) {
    // Se o formulário foi fechado, remove os botões e reseta a flag
    const container = document.getElementById('sisreg-helper-buttons');
    if (container) {
      container.remove();
      botoesInjetados = false;
      console.log('Formulário fechado, botões removidos');
    }
  }
}

// Função para injetar os botões
function injetarBotoes() {
  // Cria o container dos botões
  const container = document.createElement('div');
  container.id = 'sisreg-helper-buttons';
  container.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 8px;
    background: white;
    padding: 10px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  `;
  
  // Botão Buscar CNS
  const btnBuscarCNS = document.createElement('button');
  btnBuscarCNS.textContent = 'Buscar CNS';
  btnBuscarCNS.style.cssText = `
    padding: 8px 16px;
    background: #1976d2;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: background 0.2s;
  `;
  btnBuscarCNS.onmouseover = () => btnBuscarCNS.style.background = '#1565c0';
  btnBuscarCNS.onmouseout = () => btnBuscarCNS.style.background = '#1976d2';
  btnBuscarCNS.onclick = () => buscarCNS();
  
  // Botão Buscar CPF
  const btnBuscarCPF = document.createElement('button');
  btnBuscarCPF.textContent = 'Buscar CPF';
  btnBuscarCPF.style.cssText = `
    padding: 8px 16px;
    background: #058d49;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: background 0.2s;
  `;
  btnBuscarCPF.onmouseover = () => btnBuscarCPF.style.background = '#047a3f';
  btnBuscarCPF.onmouseout = () => btnBuscarCPF.style.background = '#058d49';
  btnBuscarCPF.onclick = () => buscarCPF();
  
  // Botão Preencher Completo
  const btnPreencherCompleto = document.createElement('button');
  btnPreencherCompleto.textContent = 'Preencher Completo';
  btnPreencherCompleto.style.cssText = `
    padding: 8px 16px;
    background: #d32f2f;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: background 0.2s;
  `;
  btnPreencherCompleto.onmouseover = () => btnPreencherCompleto.style.background = '#c62828';
  btnPreencherCompleto.onmouseout = () => btnPreencherCompleto.style.background = '#d32f2f';
  btnPreencherCompleto.onclick = () => preencherCompleto();
  
  // Adiciona os botões ao container
  container.appendChild(btnBuscarCNS);
  container.appendChild(btnBuscarCPF);
  container.appendChild(btnPreencherCompleto);
  
  // Adiciona o container ao body
  document.body.appendChild(container);
  
  console.log('Botões injetados com sucesso!');
}

// Função para buscar CNS
function buscarCNS() {
  console.log('Buscar CNS clicado');
  const cpfInput = document.querySelector('p-inputmask[controllabel="CPF"] input');
  if (cpfInput && cpfInput.value) {
    const cpfValue = cpfInput.value.replace(/\D/g, '');
    try {
      chrome.runtime.sendMessage({ action: 'buscarCNS', valor: cpfValue });
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      alert('Erro: Recarregue a página e tente novamente');
    }
  } else {
    alert('CPF não encontrado no formulário');
  }
}

// Função para buscar CPF
function buscarCPF() {
  console.log('Buscar CPF clicado');
  const cnsInput = document.querySelector('p-inputmask[controllabel="CNS"] input');
  if (cnsInput && cnsInput.value) {
    const cnsValue = cnsInput.value.replace(/\D/g, '');
    try {
      chrome.runtime.sendMessage({ action: 'buscarCPF', valor: cnsValue });
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      alert('Erro: Recarregue a página e tente novamente');
    }
  } else {
    alert('CNS não encontrado no formulário');
  }
}

// Função para preencher completo
function buscarDadosCompletos(valor) {
  try {
    chrome.runtime.sendMessage({ action: 'preencherCompleto', valor: valor });
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    alert('Erro: Recarregue a página e tente novamente');
  }
}

function preencherCompleto() {
  console.log('Preencher Completo clicado');
  
  // Tenta pegar CPF primeiro
  const cpfInput = document.querySelector('p-inputmask[controllabel="CPF"] input');
  if (cpfInput && cpfInput.value && cpfInput.value.trim()) {
    const cpfValue = cpfInput.value.replace(/\D/g, '');
    buscarDadosCompletos(cpfValue);
    return;
  }
  
  // Se não tem CPF, tenta CNS
  const cnsInput = document.querySelector('p-inputmask[controllabel="CNS"] input');
  if (cnsInput && cnsInput.value && cnsInput.value.trim()) {
    const cnsValue = cnsInput.value.replace(/\D/g, '');
    buscarDadosCompletos(cnsValue);
    return;
  }
  
  alert('CPF ou CNS não encontrado no formulário');
}

// Listener para receber dados do background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'preencherDados') {
    preencherDadosNoFormulario(request.dados);
  } else if (request.action === 'inserirCNS') {
    const cnsInput = document.querySelector('p-inputmask[controllabel="CNS"] input');
    if (cnsInput) {
      cnsInput.value = request.valor;
      cnsInput.dispatchEvent(new Event('input', { bubbles: true }));
      cnsInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
  } else if (request.action === 'inserirCPF') {
    const cpfInput = document.querySelector('p-inputmask[controllabel="CPF"] input');
    if (cpfInput) {
      cpfInput.value = request.valor;
      cpfInput.dispatchEvent(new Event('input', { bubbles: true }));
      cpfInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }
});

function preencherDadosNoFormulario(dados) {
  // CPF
  if (dados.cpf) {
    const cpfInput = document.querySelector('p-inputmask[controllabel="CPF"] input');
    if (cpfInput) {
      cpfInput.value = dados.cpf;
      cpfInput.dispatchEvent(new Event('input', { bubbles: true }));
      cpfInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }
  
  // CNS
  if (dados.cns) {
    const cnsInput = document.querySelector('p-inputmask[controllabel="CNS"] input');
    if (cnsInput) {
      cnsInput.value = dados.cns;
      cnsInput.dispatchEvent(new Event('input', { bubbles: true }));
      cnsInput.dispatchEvent(new Event('change', { bubbles: true }));
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
  
  // Sexo
  if (dados.sexo) {
    const sexoValue = dados.sexo.toUpperCase().includes('MASCULINO') ? '1' : '2';
    const sexoRadios = document.querySelectorAll('p-radiobutton[name="sexo"] input[type="radio"]');
    sexoRadios.forEach(radio => {
      if (radio.value === sexoValue) {
        radio.click();
      }
    });
  }
  
  // Estrangeiro - sempre "Não"
  const estrangeiroRadios = document.querySelectorAll('p-radiobutton[name="flagEstrangeiro"] input[type="radio"]');
  estrangeiroRadios.forEach(radio => {
    if (radio.value === '0') {
      radio.click();
    }
  });
  
  // Raça/Cor - BRANCA
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

  // CEP - 55700-000 se vazio
  setTimeout(() => {
    const cepInput = document.querySelector('p-inputmask[controllabel="CEP"] input');
    if (cepInput && (!cepInput.value || cepInput.value.trim() === '')) {
      cepInput.value = '55700-000';
      cepInput.dispatchEvent(new Event('input', { bubbles: true }));
      cepInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }, 500);
}

// Verifica a cada 3 segundos
setInterval(verificarFormulario, 3000);

// Verifica imediatamente ao carregar
verificarFormulario();
