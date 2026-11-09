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
let indiceEdicao = null;

// Persistência com localStorage
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
const campoBusca = document.getElementById("campo-busca"); // Novo elemento da Versão 4

// FASE 4: Gerenciamento do modo de edição
function prepararEdicao(indexReal) {
    const termoBusca = campoBusca.value.trim().toLowerCase();
    const produtosFiltrados = obterProdutosFiltrados();
    const produtoAlvo = produtosFiltrados[indexReal];

    // Encontra o índice correspondente na lista principal
    const indexOriginal = listaDeProdutos.indexOf(produtoAlvo);

    if (indexOriginal < 0 || indexOriginal >= listaDeProdutos.length) {
        alert("Produto não encontrado.");
        return;
    }

    const produto = listaDeProdutos[indexOriginal];
    campoNome.value = produto.nome;
    campoPreco.value = produto.preco;
    campoQuantidade.value = produto.quantidade;

    indiceEdicao = indexOriginal;
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

    const nome = campoNome.value.trim();
    const precoTexto = campoPreco.value.trim();
    const quantidadeTexto = campoQuantidade.value.trim();
    const preco = Number(precoTexto);
    const quantidade = Number(quantidadeTexto);

    if (!nome) {
        alert("Por favor, informe um nome válido para o produto.");
        campoNome.focus();
        return;
    }

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

// FASE 6: Atualização e renderização da interface (Versão 4)

function obterProdutosFiltrados() {
    const termo = campoBusca.value.trim().toLowerCase();
    return listaDeProdutos.filter(produto => produto.nome.toLowerCase().includes(termo));
}

function removerProduto(indexReal) {
    if (!confirm("Deseja remover este produto?")) return;

    const produtosFiltrados = obterProdutosFiltrados();
    const produtoAlvo = produtosFiltrados[indexReal];
    const indexOriginal = listaDeProdutos.indexOf(produtoAlvo);

    listaDeProdutos.splice(indexOriginal, 1);

    if (indiceEdicao === indexOriginal) {
        resetarFormulario();
    } else if (indiceEdicao !== null && indiceEdicao > indexOriginal) {
        indiceEdicao -= 1;
    }

    salvarNoLocalStorage();
    atualizarInterface();
}

function atualizarTotalEstoque() {
    const produtosVisiveis = obterProdutosFiltrados();
    const total = produtosVisiveis.reduce(
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

    const produtosFiltrados = obterProdutosFiltrados();

    // Tratamento caso nenhum produto seja encontrado na busca
    if (produtosFiltrados.length === 0) {
        const linhaVazia = document.createElement("tr");
        const celulaVazia = document.createElement("td");
        celulaVazia.colSpan = 5;
        celulaVazia.textContent = "Nenhum produto encontrado.";
        linhaVazia.appendChild(celulaVazia);
        tabelaBody.appendChild(linhaVazia);
        return;
    }

    produtosFiltrados.forEach((produto, index) => {
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

// Evento de digitação dinâmica para a busca em tempo real
campoBusca.addEventListener("input", function () {
    atualizarInterface();
});

// FASE 7: Inicialização
carregarDoLocalStorage();
atualizarInterface();