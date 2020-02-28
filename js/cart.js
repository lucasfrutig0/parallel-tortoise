
//variables
const cartDOM = document.querySelector('.cart')
const cartOverlay = document.querySelector('.cart-overlay')
const iconCart = document.querySelector('.snipcart-checkout')
const closeCartBtn = document.querySelector('.close-cart')
const clearCartBtn = document.querySelector('.clear-cart')
const cartItems = document.querySelector('.snipcart-items-count')
const cartTotal = document.querySelector('.cart-total')
const cartContent = document.querySelector('.cart-content')
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
      button.addEventListener('click', (event) => {
        console.log(button.dataset)
        // get product info
        let cartItem = {
          itemID: button.dataset.itemId,
          itemName: button.dataset.itemName,
          itemPrice: Number(button.dataset.itemPrice),
          itemAmount: button.dataset.itemAmount,
          itemColors: button.dataset.itemColortags,
          itemImage: button.dataset.itemImage
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
      itemsTotal += Number(item.itemAmount)
    })
    cartTotal.innerText = tempTotal.toLocaleString('pt-BR', {
      maximumFractionDigits: 2
    });
    cartItems.innerText = itemsTotal;
  }

  //add cart Items
  addCartItem(item) {
    console.log(item)
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
      console.log(event)
      if (event.target.classList.contains('remove-item')) {
        let removeItem = event.target
        let id = removeItem.dataset.id
        cartContent.removeChild(removeItem.parentElement.parentElement);
        this.removeItem(id)
      }
      else if (event.target.classList.contains("fa-chevron-up")) {
        let addAmount = event.target
        console.log(addAmount)
        let id = addAmount.dataset.id
        let tempItem = cart.find(item => item.itemID === id)
        console.log(tempItem)
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
    let cartItems = cart.map(item => item.id)
    cartItems.forEach(id => this.removeItem(id))

    while(cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0])
    }
    this.hideCart()
  }

  removeItem(id) {
    cart = cart.filter(item => item.id !== id)
    this.setCartValues(cart)
    Storage.saveCart(cart)
    let button = this.getSingleButton(id)
    button.disabled = false
    button.innerHTML = `
      <i class="fas fa-shopping-cart"></i>
      add to cart
    `
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

