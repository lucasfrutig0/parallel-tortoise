//variables
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const iconCart = document.querySelector(".snipcart-checkout");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartItems = document.querySelector(".snipcart-items-count");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const cartForm = document.querySelector(".shipping-method");
const cartFooter = document.querySelector(".cart-footer");
const loader = document.querySelector(".loader");
const clientAddress = document.createElement("div");
const paypalButtons = document.querySelector(".paypal");
let addToCartBtn = "";
let checkRadiobtns = false;
const inputCep = document.querySelector(".input-cep");
const submitCepBtn = document.querySelector(".calc-cep");
const shipElement = document.querySelector(".ship");
const radioBtns = document.getElementsByName("envio");
const buttonPaypal = document.getElementById("paypal-button-container");

//initialize cart array
let cart = [];

//buttons add to cart
let buttonsDOM = [];

class UI {
  getButButtons() {
    const buttonsBuy = [...document.querySelectorAll(".snipcart-add-item")];
    buttonsDOM = buttonsBuy;
    buttonsBuy.forEach((button) => {
      /* let id = button.dataset.itemId
      let inCart = cart.find(item => item.itemID === id)
      if(inCart) {
        button.innerText = 'No Carrinho'
        button.disabled = true
      } */
      button.addEventListener("click", (event) => {
        // get product info
        let cartItem = {
          itemID: button.dataset.itemId,
          itemName: button.dataset.itemName,
          itemPrice: Number(button.dataset.itemPrice),
          itemAmount: Number(button.dataset.itemAmount),
          itemColors: button.dataset.itemColortags,
          itemImage: button.dataset.itemImage,
          itemFrete: 0,
        };

        //add product to the cart
        cart = [...cart, cartItem];

        // save cart in local storage
        Storage.saveCart(cart);

        // set cart values
        this.setCartValues(cart);

        // display cart items
        this.addCartItem(cartItem);

        //show the cart
        this.showCart();
      });
    });
  }

  // update cart Items values
  setCartValues(cart) {
    let tempTotal = 0;
    let itemsTotal = 0;

    cart.map((item) => {
      tempTotal += item.itemPrice * item.itemAmount;
      tempTotal += Number(item.itemFrete);
      itemsTotal += Number(item.itemAmount);
    });

    cartTotal.innerText = tempTotal.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
    });
    cartItems.innerText = itemsTotal;
  }

  //add cart Items
  addCartItem(item) {
    let colors = item.itemColors.split(" ");
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `
    <img src=${item.itemImage} alt="product">
    <div>
      <h4>${item.itemName}</h4>
      <h6>Escolha uma cor:</h6>
        <select class="select-color" data-id="${item.itemID}">
          ${colors.map((color) => `<option value="${color}">${color}</option>`)}
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
    cartContent.appendChild(div);
    /* parcelasElement.appendChild(inCashElement) */

    //Get all select color elements on the cart
    let selectEl = [...document.querySelectorAll(".select-color")];
    //Add an event listener for each one
    selectEl.forEach((select) => {
      select.addEventListener("change", () => {
        //Update cart Colors in localStorage
        let selectID = select.dataset.id;
        cart = Storage.getCart();
        cart.find((item) => {
          item.itemID === selectID;
          item.itemColors = select.value;
          Storage.saveCart(cart);
        });
      });
    });
  }

  showCart() {
    cartOverlay.classList.add("transparentBcg");
    cartDOM.classList.add("showCart");
    iconCart.style.visibility = "hidden";
  }

  setupAPP() {
    cart = Storage.getCart();
    this.setCartValues(cart);
    this.populateCart(cart);
    addToCartBtn = document.querySelector(".snipcart-button");
    iconCart.addEventListener("click", this.showCart);
    addToCartBtn.addEventListener("click", this.showCart);
    closeCartBtn.addEventListener("click", this.hideCart);
  }

  populateCart(cart) {
    cart.forEach((item) => this.addCartItem(item));
  }

  hideCart() {
    cartOverlay.classList.remove("transparentBcg");
    cartDOM.classList.remove("showCart");
    iconCart.style.visibility = "visible";
  }

  cartLogic() {
    //clear car button
    clearCartBtn.addEventListener("click", () => {
      this.clearCart();
    });

    //cart functionality
    cartContent.addEventListener("click", (event) => {
      if (event.target.classList.contains("remove-item")) {
        let removeItem = event.target;
        let id = removeItem.dataset.id;
        cartContent.removeChild(removeItem.parentElement.parentElement);
        this.removeItem(id);
      } else if (event.target.classList.contains("fa-chevron-up")) {
        let addAmount = event.target;

        let id = addAmount.dataset.id;
        let tempItem = cart.find((item) => item.itemID === id);

        tempItem.itemAmount = Number(tempItem.itemAmount) + 1;
        Storage.saveCart(cart);
        this.setCartValues(cart);
        addAmount.nextElementSibling.innerText = Number(tempItem.itemAmount);
      } else if (event.target.classList.contains("fa-chevron-down")) {
        let lowerAmount = event.target;
        let id = lowerAmount.dataset.id;
        let tempItem = cart.find((item) => item.itemID === id);
        tempItem.itemAmount = Number(tempItem.itemAmount) - 1;
        if (tempItem.itemAmount > 0) {
          Storage.saveCart(cart);
          this.setCartValues(cart);
          lowerAmount.previousElementSibling.innerText = Number(
            tempItem.itemAmount
          );
        } else {
          cartContent.removeChild(lowerAmount.parentElement.parentElement);
          this.removeItem(id);
        }
      }
    });
    //Call fetch cep and calc frete functions

    submitCepBtn.addEventListener("click", (e) => {
      loader.style.display = "block";
      e.preventDefault();
      
      const cep = inputCep.value;
      this.fetchCep(cep);

      /* this.sendToInfinite() */
    });
  }

  async sendToInfinite() {
    const myHeaders = new Headers({
      'Accept': "application/json, text/plain, */*",
      'Content-Type': "application/json;charset=utf-8",
      'Authorization': "DpZt0FsDUYJyBTYdKEGPiwIw5sK5bDJH",
    });

    const body = {
      payment: {
        amount: 100,
        capture_method: "ecommerce",
        payment_method: "credit",
      },
      card: {
        cvv: "520",
        card_number: "5161590002168049",
        card_holder_name: "LUIS M G P TONELO",
        card_expiration_year: "25",
        card_expiration_month: "03",
      },
    };
    const response = await fetch("https://api.infinitepay.io/v2/transactions", {
      method: "POST",
      mode: 'cors',
      headers: myHeaders,
      body: JSON.stringify(body),
    });

    return await response.json();
  }

  clearCart() {
    let cartItems = cart.map((item) => item.itemID);
    cartItems.forEach((id) => this.removeItem(id));
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
    inCashElement.innerHTML = ``;
    this.hideCart();
  }

  removeItem(id) {
    cart = cart.filter((item) => item.itemID !== id);
    this.setCartValues(cart);
    Storage.saveCart(cart);
    inCashElement.innerHTML = ``;
    /*     let button = this.getSingleButton(id)
        button.disabled = false
        button.innerHTML = `
          <i class="fas fa-shopping-cart"></i>
          adicionar ao carrinho
        ` */
  }

  //loader
  showloader() {
    loader.style.display = "block";
  }

  //hide loader

  hideloader() {
    loader.style.display = "none";
  }

  //calcula cep
  calculaCEP(cep) {
    let args = {
      nCdServico: "04014",
      sCepOrigem: "14015080",
      sCepDestino: cep,
      nVlPeso: "1",
      nCdFormato: 1,
      nVlComprimento: 20,
      nVlAltura: 5,
      nVlLargura: 15,
      nVlDiametro: 0,
    };
    /* let queryString = Object.keys(args).map(key => key + '=' + args[key]).join('&'); */
    /*   this.fetchCep(cep)

      this.calcFrete(args) */
  }

  fetchCep(cep) {
    console.log("aqui", cep);
    let args = {
      nCdServico: "04014",
      sCepOrigem: "14015080",
      sCepDestino: cep,
      nVlPeso: "1",
      nCdFormato: 1,
      nVlComprimento: 20,
      nVlAltura: 5,
      nVlLargura: 15,
      nVlDiametro: 0,
    };
    const url = `https://frete-correios.herokuapp.com/cep/${cep}`;
    clientAddress.innerHTML = ``;

    fetch(url, {
        method: "GET",
      })
      .then((response) => response.json())
      .then(function (data) {
        console.log(data);
        const url2 = `https://frete-correios.herokuapp.com/ship/`;
        return fetch(url2, {
            method: "POST",
            headers: {
              "Content-type": "application/json",
            },
            body: JSON.stringify(args),
          })
          .then((response) => response.json())
          .then((response) => {
            console.log('CEP', response);
            const clientShip = document.createElement("div");
            loader.style.display = "none";

            clientShip.innerHTML = `
            <p class="frete">
              <strong>Sedex para seu Estado: R$</strong>${response[0].Valor.toLocaleString(
                "pt-br"
              )}
              <strong>PAC: R$</strong> Entrega Gratuita
            </p>
          `;

            cartForm.appendChild(clientShip);
            shipElement.classList.replace("hide", "show");
            let totalValue = cartTotal.innerHTML;
            let freteFormat = 0;
            radioBtns.forEach((radio) => {
              radio.addEventListener("change", (e) => {
                if (e.target.value === "sedex") {
                  cart[0].itemFrete = response[0].Valor.replace(",", ".");
                  freteFormat = parseFloat(cart[0].itemFrete);
                  totalValue = freteFormat + cart[0].itemPrice * cart[0].itemAmount;
                 console.log(this)
                } else if (e.target.value === "pac") {
                  cart[0].itemFrete = 0;
                  setCartValues(cart);
                  totalValue =
                    cart[0].itemFrete + cart[0].itemPrice * cart[0].itemAmount;
                }
                if (e.target.checked) {
                  paypalButtons.classList.replace('hide', 'show')
                  paypal.Buttons({
                    createOrder: function(data, actions) {
                      /* This function sets up the details of the transaction, including the amount and line item details. */
                      return actions.order.create({
                        intent: "CAPTURE",
                        purchase_units: [
                          {
                              reference_id: "PUHF",
                              description: "MacBook",
        
                              custom_id: "CUST-HighFashions",
                              soft_descriptor: "HighFashions",
                              amount: {
                                currency_code: "BRL",
                                value: totalValue,
                                breakdown: {
                                  item_total: {
                                      currency_code: "BRL",
                                      value: cart[0].itemPrice * cart[0].itemAmount
                                  },
                                  shipping: {
                                    currency_code: "BRL",
                                    value: cart[0].itemFrete
                                },
                                }
                            },
                              items: [
                                  {
                                      name: cart[0].itemName,
                                      description: `Cor: ${cart[0].itemColors}`,
                                      sku: "sku01",
                                      unit_amount: {
                                          currency_code: "BRL",
                                          value: cart[0].itemPrice
                                      },
                                      quantity: cart[0].itemAmount,
                                      category: "PHYSICAL_GOODS"
                                  }
                              ]
                          }
                      ]
                      });
                    }
                  }).render('#paypal-button-container')
                }
              });
            });    

          });
      })
      .catch(function (err) {
        console.log(err);
      });
  }

  getSingleButton(id) {
    return buttonsDOM.find((button) => button.dataset.id === id);
  }
}

//localStorage
class Storage {
  //save cart items in localStorage
  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  //Get cart items in localStorage
  static getCart() {
    return localStorage.getItem("cart") ?
      JSON.parse(localStorage.getItem("cart")) : [];
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();

  //setup Application
  ui.setupAPP();

  //cart logic
  ui.cartLogic();

  //get all buttons
  ui.getButButtons();
});