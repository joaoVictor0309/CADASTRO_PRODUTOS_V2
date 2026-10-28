// FASE 1: Modelagem dos dados (Classe Base)
class Produto {
    constructor(nome, preco, quantidade) {
        this.nome = nome;
        this.preco = parseFloat(preco);
        this.quantidade = parseInt(quantidade, 10);
    }

    calcularSubtotal() {
        return this.preco * this.quantidade;
    }
}

// FASE 2: Gerenciamento de Estado
const listaDeProdutos = [];
// null = Modo Cadastro; número = Modo Edição.
let indiceEdicao = null;

// Persistência com localStorage (mantém a chave do projeto original).
const CHAVE_STORAGE = "sistema_estoque_produtos";

function salvarNoLocalStorage() {
    try {
        localStorage.setItem(CHAVE_STORAGE, JSON.stringify(listaDeProdutos));
    } catch (erro) {
        console.error("Erro ao salvar produtos:", erro);
        alert("Não foi possível salvar os produtos no navegador.");
    }
}

function carregarDoLocalStorage() {
    try {
        const dadosSalvos = localStorage.getItem(CHAVE_STORAGE);
        if (!dadosSalvos) return;

        const produtosObjetos = JSON.parse(dadosSalvos);
        if (!Array.isArray(produtosObjetos)) return;

        produtosObjetos.forEach((prod) => {
            listaDeProdutos.push(new Produto(prod.nome, prod.preco, prod.quantidade));
        });
    } catch (erro) {
        console.error("Erro ao carregar produtos:", erro);
        alert("Não foi possível carregar os produtos salvos.");
    }
}

// FASE 3: Captura de Elementos do DOM
const formProduto = document.getElementById("produto-form");
const campoNome = document.getElementById("nome");
const campoPreco = document.getElementById("preco");
const campoQuantidade = document.getElementById("quantidade");
const btnLimparTudo = document.getElementById("limpar-tabela");
const totalEstoqueEl = document.getElementById("total-estoque");
const btnSalvar = document.getElementById("btn-salvar");
const btnCancelar = document.getElementById("btn-cancelar");

// FASE 4: Gerenciamento do modo de edição
function prepararEdicao(index) {
    if (index < 0 || index >= listaDeProdutos.length) {
        alert("Produto não encontrado.");
        return;
    }

    const produto = listaDeProdutos[index];
    campoNome.value = produto.nome;
    campoPreco.value = produto.preco;
    campoQuantidade.value = produto.quantidade;

    indiceEdicao = index;
    btnSalvar.textContent = "Salvar Alterações";
    btnCancelar.hidden = false;
    campoNome.focus();
}

function resetarFormulario() {
    formProduto.reset();
    indiceEdicao = null;
    btnSalvar.textContent = "Adicionar Produto";
    btnCancelar.hidden = true;
}

// FASE 5: Validação e Submit
formProduto.addEventListener("submit", function (event) {
    event.preventDefault();

    // Sanitização com trim().
    const nome = campoNome.value.trim();
    const precoTexto = campoPreco.value.trim();
    const quantidadeTexto = campoQuantidade.value.trim();
    const preco = Number(precoTexto);
    const quantidade = Number(quantidadeTexto);

    // Guard Clause: interrompe o submit se o nome estiver vazio.
    if (!nome) {
        alert("Por favor, informe um nome válido para o produto.");
        campoNome.focus();
        return;
    }

    // Guard Clause: preço e quantidade devem ser válidos e maiores que zero.
    if (
        precoTexto === "" ||
        !Number.isFinite(preco) ||
        preco <= 0 ||
        quantidadeTexto === "" ||
        !Number.isFinite(quantidade) ||
        !Number.isInteger(quantidade) ||
        quantidade <= 0
    ) {
        alert("O preço deve ser um número maior que zero e a quantidade deve ser um número inteiro maior que zero.");
        return;
    }

    const novoProduto = new Produto(nome, preco, quantidade);

    // Inclusão (Create) ou atualização (Update).
    if (indiceEdicao === null) {
        listaDeProdutos.push(novoProduto);
        alert("Produto cadastrado com sucesso!");
    } else {
        listaDeProdutos[indiceEdicao] = novoProduto;
        alert("Produto atualizado com sucesso!");
    }

    salvarNoLocalStorage();
    resetarFormulario();
    atualizarInterface();
});

btnCancelar.addEventListener("click", function () {
    resetarFormulario();
});

// Limpar toda a tabela.
btnLimparTudo.addEventListener("click", function () {
    if (listaDeProdutos.length === 0) {
        alert("A tabela já está vazia!");
        return;
    }

    if (confirm("Tem certeza que deseja remover todos os produtos?")) {
        listaDeProdutos.length = 0;
        localStorage.removeItem(CHAVE_STORAGE);
        resetarFormulario();
        atualizarInterface();
    }
});

// FASE 6: Atualização e renderização da interface
function removerProduto(index) {
    if (!confirm("Deseja remover este produto?")) return;

    listaDeProdutos.splice(index, 1);

    if (indiceEdicao === index) {
        resetarFormulario();
    } else if (indiceEdicao !== null && indiceEdicao > index) {
        indiceEdicao -= 1;
    }

    salvarNoLocalStorage();
    atualizarInterface();
}

function atualizarTotalEstoque() {
    const total = listaDeProdutos.reduce(
        (acc, produto) => acc + produto.calcularSubtotal(),
        0
    );

    totalEstoqueEl.textContent = `Total em Estoque: ${total.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    })}`;
}

function renderizarTabela() {
    const tabelaBody = document.querySelector("#tabela-produtos tbody");
    tabelaBody.innerHTML = "";

    listaDeProdutos.forEach((produto, index) => {
        const linha = document.createElement("tr");

        const celulaNome = document.createElement("td");
        celulaNome.textContent = produto.nome;

        const celulaPreco = document.createElement("td");
        celulaPreco.textContent = produto.preco.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });

        const celulaQuantidade = document.createElement("td");
        celulaQuantidade.textContent = String(produto.quantidade);

        const celulaSubtotal = document.createElement("td");
        celulaSubtotal.textContent = produto.calcularSubtotal().toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });

        const celulaAcoes = document.createElement("td");

        const btnEditar = document.createElement("button");
        btnEditar.type = "button";
        btnEditar.className = "btn-editar";
        btnEditar.textContent = "Editar";
        btnEditar.addEventListener("click", () => prepararEdicao(index));

        const btnRemover = document.createElement("button");
        btnRemover.type = "button";
        btnRemover.className = "btn-remover";
        btnRemover.textContent = "Remover";
        btnRemover.addEventListener("click", () => removerProduto(index));

        celulaAcoes.append(btnEditar, btnRemover);
        linha.append(
            celulaNome,
            celulaPreco,
            celulaQuantidade,
            celulaSubtotal,
            celulaAcoes
        );
        tabelaBody.appendChild(linha);
    });
}

function atualizarInterface() {
    renderizarTabela();
    atualizarTotalEstoque();
}

// FASE 7: Inicialização
carregarDoLocalStorage();
atualizarInterface();
