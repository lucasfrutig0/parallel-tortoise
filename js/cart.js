
//variables
const cartDOM = document.querySelector('.cart')
const cartOverlay = document.querySelector('.cart-overlay')
const iconCart = document.querySelector('.snipcart-checkout')
const closeCartBtn = document.querySelector('.close-cart')
const clearCartBtn = document.querySelector('.clear-cart')
const cartItems = document.querySelector('.snipcart-items-count')
const cartTotal = document.querySelector('.cart-total')
const cartContent = document.querySelector('.cart-content')
const cartForm = document.querySelector('.shipping-method')
const cartFooter = document.querySelector('.cart-footer')
const spinner = document.getElementById("spinner");
const clientAddress = document.createElement('div')
let addToCartBtn = ''


//initialize cart array
let cart = []

//buttons add to cart
let buttonsDOM = []


class UI {

  getButButtons() {    
  const buttonsBuy = [...document.querySelectorAll('.snipcart-add-item')]
    buttonsDOM = buttonsBuy
    buttonsBuy.forEach(button => {
      /* let id = button.dataset.itemId
      let inCart = cart.find(item => item.itemID === id)
      if(inCart) {
        button.innerText = 'No Carrinho'
        button.disabled = true
      } */
      button.addEventListener('click', (event) => {
        // get product info
        let cartItem = {
          itemID: button.dataset.itemId,
          itemName: button.dataset.itemName,
          itemPrice: Number(button.dataset.itemPrice),
          itemAmount: button.dataset.itemAmount,
          itemColors: button.dataset.itemColortags,
          itemImage: button.dataset.itemImage,
          itemFrete: 0
        }

        //add product to the cart
        cart = [...cart, cartItem]
        
        // save cart in local storage
        Storage.saveCart(cart)

        // set cart values
        this.setCartValues(cart);

        // display cart items
        this.addCartItem(cartItem)

        //show the cart
        this.showCart()
      })
    })
  }

  // update cart Items values
  setCartValues(cart) {

    let tempTotal = 0;
    let itemsTotal = 0;
    cart.map(item => {
      tempTotal += item.itemPrice * item.itemAmount
      tempTotal += Number(item.itemFrete)
      itemsTotal += Number(item.itemAmount)
    })
    cartTotal.innerText = tempTotal.toLocaleString('pt-BR', {
      minimumFractionDigits: 2
    });
    cartItems.innerText = itemsTotal;
  }

  //add cart Items
  addCartItem(item) {

    cartForm.classList.remove('hide-form')
    let colors = item.itemColors.split(' ')
    const div = document.createElement('div')
    div.classList.add('cart-item')
    div.innerHTML = `
    <img src=${item.itemImage} alt="product">
    <div>
      <h4>${item.itemName}</h4>
      <h6>Escolha uma cor:</h6>
        <select class="select-color" data-id="${item.itemID}">
          ${colors.map(color => `<option value="${color}">${color}</option>`)}
        </select>
      <h5>R$${item.itemPrice.toLocaleString()}</h5>
      <span class="remove-item" data-id=${item.itemID}>remove</span>
    </div>
    <div>
      <i class="fas fa-chevron-up" data-id=${item.itemID}></i>
      <p class="item-amount">${item.itemAmount}</p>
      <i class="fas fa-chevron-down" data-id=${item.itemID}></i>
    </div>
    `;
    cartContent.appendChild(div)

    //Get all select color elements on the cart
    let selectEl = [...document.querySelectorAll('.select-color')]
    //Add an event listener for each one
    selectEl.forEach(select => {
      select.addEventListener('change', () => {
        //Update cart Colors in localStorage
        let selectID = select.dataset.id
        cart = Storage.getCart()
        cart.find(item => {
          item.itemID === selectID
          item.itemColors = select.value
          Storage.saveCart(cart)
        })
      })
    })
  }

  showCart() {
    cartOverlay.classList.add('transparentBcg')
    cartDOM.classList.add('showCart')
    iconCart.style.visibility = "hidden"
  }

  setupAPP() {
    cart = Storage.getCart()
    this.setCartValues(cart)
    this.populateCart(cart)
    addToCartBtn = document.querySelector('.snipcart-button')
    iconCart.addEventListener('click', this.showCart)
    addToCartBtn.addEventListener('click', this.showCart)
    closeCartBtn.addEventListener('click', this.hideCart)


    //get all radio buttons
    const radioElements = [...document.querySelectorAll('.shipping-method input[type="radio"]')]
    const inputCepElement = document.createElement('input')
    const buttonCepElement = document.createElement('button')
    inputCepElement.setAttribute('placeholder', 'Informe o CEP. Ex: 14700000')
    buttonCepElement.innerHTML = `Calcular`
    inputCepElement.classList.add('input-cep')
    const containerInputCep = document.createElement('div')
    containerInputCep.classList.add('cep')
    radioElements.forEach(radio => {
      radio.addEventListener('change', () => {
        if (radio.value === 'SEDEX') {
          containerInputCep.appendChild(inputCepElement)
          containerInputCep.appendChild(buttonCepElement)
          buttonCepElement.addEventListener('click', () => this.calculaCEP(inputCepElement.value))
        } else {
          containerInputCep.innerHTML = `
              <p>Entrega gratuita</p>
          `
        }
      })
      /* cartForm.appendChild(containerInputCep) */
      cartFooter.prepend(containerInputCep)
    })
  }

  populateCart(cart) {
    cart.forEach(item => this.addCartItem(item))
  }

  hideCart() {
    cartOverlay.classList.remove('transparentBcg')
    cartDOM.classList.remove('showCart')
    iconCart.style.visibility = "visible"
    
  }

  cartLogic() {
    //clear car button
    clearCartBtn.addEventListener('click', () => {
      this.clearCart()
    })

    //cart functionality
    cartContent.addEventListener('click', event => {
      if (event.target.classList.contains('remove-item')) {
        let removeItem = event.target
        let id = removeItem.dataset.id
        cartContent.removeChild(removeItem.parentElement.parentElement);
        this.removeItem(id)
      }
      else if (event.target.classList.contains("fa-chevron-up")) {
        let addAmount = event.target

        let id = addAmount.dataset.id
        let tempItem = cart.find(item => item.itemID === id)

        tempItem.itemAmount = Number(tempItem.itemAmount) + 1
        Storage.saveCart(cart)
        this.setCartValues(cart)
        addAmount.nextElementSibling.innerText = Number(tempItem.itemAmount)
      }
      else if (event.target.classList.contains("fa-chevron-down")) {
        let lowerAmount = event.target
        let id = lowerAmount.dataset.id
        let tempItem = cart.find(item => item.itemID === id)
        tempItem.itemAmount = Number(tempItem.itemAmount) - 1
        if (tempItem.itemAmount > 0) {
          Storage.saveCart(cart)
          this.setCartValues(cart)
          lowerAmount.previousElementSibling.innerText = Number(tempItem.itemAmount)
        }
        else {
          cartContent.removeChild(lowerAmount.parentElement.parentElement)
          this.removeItem(id)
        }
      }
    })
  }
  clearCart() {
    let cartItems = cart.map(item => item.itemID)
    console.log(cartItems)
    cartItems.forEach(id => this.removeItem(id))
    while(cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0])
    }
    cartFooter.removeChild(cartFooter.children[1])
    

    this.hideCart()
  }

  removeItem(id) {
    cart = cart.filter(item => item.itemID !== id)
    this.setCartValues(cart)
    Storage.saveCart(cart)
/*     let button = this.getSingleButton(id)
    button.disabled = false
    button.innerHTML = `
      <i class="fas fa-shopping-cart"></i>
      adicionar ao carrinho
    ` */
  }

  //spinner 
  showSpinner() {
      spinner.className = spinner.classList.add('show');
  }

  //hide spinner

hideSpinner() {
  spinner.classList.remove('show');
}

  //calcula cep
  calculaCEP(cep) {
    console.log(cep)
    let args = {
      nCdServico:"04014",
      sCepOrigem: "14015080",
      sCepDestino: cep,
      nVlPeso: "1",
      nCdFormato: 1,
      nVlComprimento: 20,
      nVlAltura: 5,
      nVlLargura: 15,
      nVlDiametro: 0
    }
    /* let queryString = Object.keys(args).map(key => key + '=' + args[key]).join('&'); */
    this.fetchCep(cep)
    
    this.calcFrete(args)
  }

  fetchCep(cep) {
    const url = `https://frete-correios.herokuapp.com/cep/${cep}`
    clientAddress.innerHTML = ``
    
      fetch(url, {
        method: 'GET'
      })
        .then(response => response.json())
        .then(response => {
          console.log(response.data)
          //TODO show address to cart content
          
          clientAddress.innerHTML = `
            <p class="address"><strong><i class="fas fa-truck"></i> Endereço:</strong> ${response.data.logradouro}, ${response.data.bairro} - ${response.data.localidade}/${response.data.uf}</p>
          `
          cartForm.appendChild(clientAddress)
        })
        .catch(function(err) {
          console.log(err)
        })
  }

  calcFrete(args) {
    const url = `https://frete-correios.herokuapp.com/ship`
    //TODO fix spinner
    this.showSpinner()
    fetch(url, {
      method: 'POST',
      headers: { 'Content-type': 'application/json'},
      body: JSON.stringify(args)
    })
      .then(response => response.json())
      .then(response => {
        //TODO show value in the cart content
        cart[0].itemFrete = response[0].Valor.replace(',', '.')
        const clientShip = document.createElement('div')
        clientShip.innerHTML = `<p class="frete"><strong>Frete Sedex: </strong>${response[0].Valor.toLocaleString('pt-br')}</p>`
        this.setCartValues(cart)
        this.hideSpinner()
        cartForm.appendChild(clientShip)
      })
      .catch(function(err) {
        console.log(err)
      })
  }

  getSingleButton(id) {
    return buttonsDOM.find(button => button.dataset.id === id)
  }

}



//localStorage
class Storage {

  //save cart items in localStorage
  static saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart))
  }

  //Get cart items in localStorage
  static getCart() {
    return localStorage.getItem('cart') 
    ? JSON.parse(localStorage.getItem('cart')) 
    : []
  }
}


document.addEventListener('DOMContentLoaded', () => {
  const ui = new UI();

  //setup Application
  ui.setupAPP()

  //cart logic
  ui.cartLogic()

  //get all buttons
  ui.getButButtons();
})

