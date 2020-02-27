
//variables
const cartDOM = document.querySelector('.cart')
const cartOverlay = document.querySelector('.cart-overlay')
const iconCart = document.querySelector('.snipcart-checkout')
const closeCartBtn = document.querySelector('.close-cart')
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
    console.log(cart)
    let tempTotal = 0;
    let itemsTotal = 0;
    cart.map(item => {
      tempTotal += item.itemPrice * item.itemAmount
      itemsTotal += Number(item.itemAmount)
    })
    cartTotal.innerText = tempTotal.toLocaleString();
    cartItems.innerText = itemsTotal;
  }

  //add cart Items
  addCartItem(item) {
    console.log(item)
    let colors = item.itemColors.split('').join(',')
    console.log(colors)
    const div = document.createElement('div')
    div.classList.add('cart-item')
    div.innerHTML = `
    <img src=${item.itemImage} alt="product">
    <div>
      <h4>${item.itemName}</h4>
      <h6>Escolha uma cor:</h6>
      <select>
        <option value=""></option>
      </select>
      <h5>R$${item.itemPrice.toLocaleString()}</h5>
      <span class="remove-item" data-id=${item.itemId}>remove</span>
    </div>
    <div>
      <i class="fas fa-chevron-up" data-id=${item.itemIdid}></i>
      <p class="item-amount">${item.itemAmount}</p>
      <i class="fas fa-chevron-down" data-id=${item.itemIdid}></i>
    </div>
    `;
    cartContent.appendChild(div)
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

  //get all buttons
  ui.getButButtons();
})

