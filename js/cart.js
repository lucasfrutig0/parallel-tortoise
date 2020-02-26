
//variables
const cartDOM = document.querySelector('.cart')
const cartOverlay = document.querySelector('.cart-overlay')
const iconCart = document.querySelector('.snipcart-checkout')
const closeCartBtn = document.querySelector('.close-cart')

console.log(closeCartBtn)
//buttons add to cart
let buttonsDOM = []


class UI {

  getButButtons() {
    const buttonsBuy = [...document.querySelectorAll('.product-grid__item-buy')]
    buttonsDOM = buttonsBuy
    buttonsBuy.forEach(button => {
      button.addEventListener('click', (event) => {
        console.log(event)
        this.showCart()
      })
    })
  }

  showCart() {
    cartOverlay.classList.add('transparentBcg')
    cartDOM.classList.add('showCart')
    iconCart.style.display = "none"
  }

  hideCart() {
    cartOverlay.classList.remove('transparentBcg')
    cartDOM.classList.remove('showCart')
    iconCart.style.display = "block"
    
  }

  setupAPP() {
    iconCart.addEventListener('click', this.showCart)
    closeCartBtn.addEventListener('click', this.hideCart)
  }
}

//localStorage
class Storage {

}


document.addEventListener('DOMContentLoaded', () => {
  const ui = new UI();

  //setup Application
  ui.setupAPP()

  //get all buttons
  ui.getButButtons();
})

