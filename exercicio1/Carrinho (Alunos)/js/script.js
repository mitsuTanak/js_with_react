// Inicialização de variáveis
let cart = [];
let modalQt = 0;
let key = 0;

// Função auxiliar para selecionar um único elemento do DOM
const c = (el) => document.querySelector(el);

// Função auxiliar para selecionar vários elementos do DOM
const cs = (el) => document.querySelectorAll(el);

// Manipulação dos dados do modelo a partir do JSON
modelsJson.map((item, index) => {
    // Clonar o item do modelo
    let modelsItem = c('.models .models-item').cloneNode(true);

    // Atualizar os dados do item do modelo clonado
    modelsItem.setAttribute('data-key', index);
    modelsItem.querySelector('.models-item--img img').src = item.img;
    modelsItem.querySelector('.models-item--price').innerHTML = `R$ ${item.price[2].toFixed(3)}`;
    modelsItem.querySelector('.models-item--name').innerHTML = item.name;
    modelsItem.querySelector('.models-item--desc').innerHTML = item.description;

    // Adicionar evento de clique para exibir o modal ao clicar no modelo
    modelsItem.querySelector('a').addEventListener('click', (e) => {
        e.preventDefault();
        key = e.target.closest('.models-item').getAttribute('data-key');
        modalQt = 1;

        c('.modelsBig img').src = modelsJson[key].img;
        c('.modelsInfo h1').innerHTML = modelsJson[key].name;
        c('.modelsInfo--desc').innerHTML = modelsJson[key].description;
        c('.modelsInfo--size.selected').classList.remove('selected');

        // Atualizar os tamanhos disponíveis no modal
        cs('.modelsInfo--size').forEach((size, sizeIndex) => {
            if (sizeIndex == 2) {
                size.classList.add('selected');
                c('.modelsInfo--actualPrice').innerHTML = `R$ ${modelsJson[key].price[sizeIndex].toFixed(2)}`;
            }
            size.querySelector('span').innerHTML = modelsJson[key].sizes[sizeIndex];
        });

        c('.modelsInfo--qt').innerHTML = modalQt;
        c('.modelsWindowArea').style.opacity = 0;
        c('.modelsWindowArea').style.display = 'flex';
        setTimeout(() => {
            c('.modelsWindowArea').style.opacity = 1;
        }, 200);

    });
    c('.models-area').append(modelsItem);
});

  // Função para fechar o modal
function closeModal() {
    c('.modelsWindowArea').style.opacity = 0;
    setTimeout(() => {
        c('.modelsWindowArea').style.display = 'none';
    }, 500);
}

// Adicionar eventos de clique para fechar o modal
cs('.modelsInfo--cancelButton, .modelsInfo--cancelMobileButton').forEach((item) => {
    item.addEventListener('click', closeModal);
});

// Adicionar eventos de clique para controlar a quantidade no modal
c('.modelsInfo--qtmenos').addEventListener('click', () => {
    if (modalQt > 1) {
        modalQt--;
        c('.modelsInfo--qt').innerHTML = modalQt;
    }
});

c('.modelsInfo--qtmais').addEventListener('click', () => {
    modalQt++;
    c('.modelsInfo--qt').innerHTML = modalQt;
});

// Adicionar eventos de clique para selecionar o tamanho do modelo no modal
cs('.modelsInfo--size').forEach((size, sizeIndex) => {
    size.addEventListener('click', (e) => {
        c('.modelsInfo--size.selected').classList.remove('selected');
        size.classList.add('selected');
        c('.modelsInfo--actualPrice').innerHTML = `R$ ${modelsJson[key].price[sizeIndex].toFixed(2)}`;
    });
});

// Adicionar evento de clique para adicionar o item ao carrinho
c('.modelsInfo--addButton').addEventListener('click', () => {

    // Lógica para adicionar o item ao carrinho
    let size = parseInt(c('.modelsInfo--size.selected').getAttribute('data-key'));
    let identifier = modelsJson[key].id + '@' + size;
    let locaId = cart.findIndex((item) => item.identifier == identifier);
    if (locaId > -1) {
        cart[locaId].qt += modalQt;
    } else {
        cart.push({
            identifier,
            id: modelsJson[key].id,
            size,
            qt: modalQt
        });
    }
    updateCart();
    closeModal();
});

// Evento de clique para exibir o carrinho quando há itens no carrinho
c('.menu-openner').addEventListener('click', ()=>{
    if(cart.length > 0){
        c('aside').style.left = '0';
    };
});

// Evento de clique para fechar a barra lateral do carrinho
c('.menu-closer').addEventListener('click', ()=> {
    c('aside').style.left = '100vw';
})

// Evento de clique para finalizar a compra e limpar o carrinho
c('.cart--finalizar').addEventListener('click', ()=>{
    cart = [];
    updateCart();
})

// Função para atualizar o conteúdo do carrinho
function updateCart(){
    // Atualizar o número de itens exibido no ícone do carrinho no menu
    c('.menu-openner span').innerHTML = cart.length;
    // Verificar se há itens no carrinho
    if(cart.length > 0){
        // Adicionar a classe 'show' para exibir a barra lateral do carrinho
        c('aside').classList.add('show');
        // Limpar o conteúdo atual da lista de itens no carrinho
        c('.cart').innerHTML = '';

        // Inicialização de variáveis para os totais
        let subtotal = 0;
        let desconto = 0;
        let total = 0;

        // Iterar sobre os itens no carrinho
        cart.map((itemCart, index)=>{
            // Encontrar o item correspondente nos dados dos modelos
            let modelItem = modelsJson.find((itemBD)=>itemBD.id == itemCart.id);

            // Calcular o subtotal com base no preço e na quantidade do item
            subtotal += modelItem.price[itemCart.size] * itemCart.qt;

            // Clonar o item do carrinho para exibição
            let cartItem = c('.models .cart--item').cloneNode(true);
            let modelSizeName;

            // Determinar o nome do tamanho do modelo com base no índice
            switch(itemCart.size) {
                case 0:
                    modelSizeName = 'P';
                    break
                case 1:
                    modelSizeName = 'M';
                    break
                case 2:
                    modelSizeName = 'G';
                    break
            }

            // Atualizar os dados do item clonado do carrinho
            cartItem.querySelector('img').src = modelItem.img;
            cartItem.querySelector('.cart--item--nome').innerHTML = `${modelItem.name} - ${modelItem.sizes[itemCart.size]}`;
            cartItem.querySelector('.cart--item--qt').innerHTML = itemCart.qt;

            // Adicionar eventos de clique para diminuir e aumentar a quantidade do item no carrinho
            cartItem.querySelector('.cart--item--qtmenos').addEventListener('click', ()=>{
                if(itemCart.qt > 1){
                    itemCart.qt --;
                } else {
                    cart.splice(index, 1);
                }
                updateCart();
            });
            cartItem.querySelector('.cart--item--qtmais').addEventListener('click', ()=>{
                itemCart.qt ++;
                updateCart();
            });

            // Adicionar o item clonado à lista de itens no carrinho
            c('.cart').append(cartItem);
        });
       
        // Calcular o desconto e o total com base no subtotal
        desconto = subtotal * 0.1;
        total = subtotal - desconto

        // Atualizar os elementos HTML com os valores de subtotal, desconto e total
        c('.subtotal span:last-child').innerHTML = `R$ ${subtotal.toFixed(2)}`
        c('.desconto span:last-child').innerHTML = `R$ ${desconto.toFixed(2)}`
        c('.total span:last-child').innerHTML = `R$ ${total.toFixed(2)}`

    } else {
        // Remover a classe 'show' para ocultar a barra lateral do carrinho
        c('aside').classList.remove('show');
        // Esconder a barra lateral movendo-a para fora da tela
        c('aside').style.left = '100vw';
    }
};