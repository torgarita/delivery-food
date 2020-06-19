'use strict';

const cartButton = document.querySelector("#cart-button");
const modal = document.querySelector(".modal");
const close = document.querySelector(".close");
const buttonAuth = document.querySelector('.button-auth'); 
const modalAuth = document.querySelector('.modal-auth');
const closeAuth = document.querySelector('.close-auth');
const logInForm = document.querySelector('#logInForm');
const loginInput = document.querySelector('#login');
const userName = document.querySelector('.user-name');
const buttonOut = document.querySelector('.button-out');
const cardsRestaurants = document.querySelector('.cards-restaurants');
const containerPromo = document.querySelector('.container-promo');
const restaurants = document.querySelector('.restaurants');
const menu = document.querySelector('.menu');
const logo = document.querySelector('.logo');
const cardsMenu = document.querySelector('.cards-menu');
const modalBody = document.querySelector('.modal-body');
const modalPrice = document.querySelector('.modal-pricetag');
const buttonClearCart = document.querySelector('.clear-cart')

const valid = function(str) {
  const nameReg = /^[a-zA-Z][a-zA-Z0-9-_\.]{1,20}$/
  return nameReg.test(str);
}

let login = localStorage.getItem('gloDelivery');

const cart = [];

const getData = async function (url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`ошибка по адресу ${url}, статус ошибки ${response.status}!`)
  }
  return await response.json();
};

getData('./db/partners.json');

function toggleModal() {
  modal.classList.toggle("is-open");
}

function toggleModalAuth(callback) {
  loginInput.style.borderColor = '';
  modalAuth.classList.toggle('is-open');
  if (callback) callback();
}

function autorized() {
  function logOut() {
    login = null;
    localStorage.removeItem('gloDelivery');
    buttonAuth.style.display = '';
    userName.style.display = '';
    buttonOut.style.display = '';
    cartButton.style.display = '';
    buttonOut.removeEventListener('click', logOut);
    checkAuth();
    returnMain();
  }
  console.log('Авторизован');
  userName.textContent = login;
  buttonAuth.style.display = 'none';
  userName.style.display = 'inline';
  buttonOut.style.display = 'flex';
  cartButton.style.display = 'flex';
  buttonOut.addEventListener('click', logOut);
}

function maskInput(string) {
  return !!string.trim();
}

function notAutorized () {
  console.log('Не авторизован');

  function logIn(event) {
    event.preventDefault();

    if(valid(loginInput.value)){
      login = loginInput.value;
      localStorage.setItem('gloDelivery', login);
      toggleModalAuth();
      buttonAuth.removeEventListener('click', toggleModalAuth);
      closeAuth.removeEventListener('click', toggleModalAuth);
      logInForm.removeEventListener('submit', logIn);
      logInForm.reset();
      checkAuth();
      } else {
        loginInput.style.borderColor = 'red';
        loginInput.value = '';
      }
  }

  buttonAuth.addEventListener('click', toggleModalAuth);
  closeAuth.addEventListener('click', toggleModalAuth);
  logInForm.addEventListener('submit', logIn);
}

function checkAuth() {
  if (login) {
    autorized();
  } else {
    notAutorized();
  }
}


function createCardRestaurant({ image, 
  kitchen, 
  name, 
  price, 
  stars, 
  products, 
  time_of_delivery: timeOfDelivery }) {

  const card = `
      <a class="card card-restaurant" data-products="${products}">
      <img src="${image}" alt="image" class="card-image"/>
      <div class="card-text">
        <div class="card-heading">
          <h3 class="card-title">${name}</h3>
          <span class="card-tag tag">${timeOfDelivery} мин</span>
        </div>
        <div class="card-info">
          <div class="rating">
            ${stars}
          </div>
          <div class="price">От ${price} ₽</div>
          <div class="category">${kitchen}</div>
        </div>
      </div>
    </a>`;

  cardsRestaurants.insertAdjacentHTML('beforeend', card)

}

function createCardGood({ description, image, name, price, id }) {


  const card = document.createElement('div');
  card.className = 'card';
  card.insertAdjacentHTML('beforeend', `
      <img src="${image}" alt="image" class="card-image"/>
                <div class="card-text">
                  <div class="card-heading">
                    <h3 class="card-title card-title-reg">${name}</h3>
                  </div>
                  <div class="card-info">
                    <div class="ingredients">${description}
                    </div>
                  </div>
                  <div class="card-buttons">
                    <button class="button button-primary button-add-cart" id="${id}">
                      <span class="button-card-text">В корзину</span>
                      <span class="button-cart-svg"></span>
                    </button>
                    <strong class="card-price card-price-bold">${price} ₽</strong>
                  </div>
                </div>
      `);

  cardsMenu.insertAdjacentElement('beforeend',card);
}

function openGoods (event) {
   const target = event.target;
   const restaurant = target.closest('.card-restaurant');

  if (restaurant) {

      if (login){
      containerPromo.classList.add('hide');
      restaurants.classList.add('hide');
      menu.classList.remove('hide');

      getData(`./db/${restaurant.dataset.products}`).then(function(data){
        data.forEach(createCardGood);
      });

      cardsMenu.textContent = '';
    
      createCardGood();
      createCardGood();
      createCardGood();
      createCardGood();
    } else {
      toggleModalAuth();
    }
  }
}

function addToCart(event) {
  const target = event.target;
  const buttonAddToCart = target.closest('.button-add-cart');
  if (buttonAddToCart) {
    const card = target.closest('.card');
    const title = card.querySelector('.card-title-reg').textContent;
    const cost = card.querySelector('.card-price').textContent;
    const id  = buttonAddToCart.id;
    const food = cart.find(function(item){
      return item.id === id;
      
    })

    if (food) {
      food.count += 1;
    } else {
       cart.push({
        id,
        title,
        cost,
        count: 1
      });
    }
  }
}

function renderCart() {
  modalBody.textContent = '';

  cart.forEach(function({ id, title, cost, count }) {
    const itemCart = `
      <div class="food-row">
        <span class="food-name">${title}</span>
          <strong class="food-price">${cost} ₽</strong>
            <div class="food-counter">
              <button class="counter-button counter-minus" data-id=${id}>-</button>
              <span class="counter">${count}</span>
              <button class="counter-button counter-plus" data-id=${id}>+</button>
            </div>
        </div>
        `;
    modalBody.insertAdjacentHTML('afterbegin', itemCart);
  });

  const totalPrice = cart.reduce(function(result, item) {
      return result + (parseFloat(item.cost) * item.count);
  }, 0);
  modalPrice.textContent = totalPrice + ' ₽';
}

function changeCount(event) {
  const target = event.target;
  if (target.classList.contains('counter-minus')) {
    const food = cart.find(function(item) {
    return item.id === target.dataset.id;
    });
    food.count--;
    if (food.count === 0) {
      cart.splice(cart.indexOf(food), 1);
    }
    renderCart();
  }
  
  if (target.classList.contains('counter-plus')){
    const food = cart.find(function(item) {
      return item.id === target.dataset.id;
      });
      food.count++;
    renderCart();
    }
}

function init () {

  getData('./db/partners.json').then(function(data){
    data.forEach(createCardRestaurant);
  });

  buttonClearCart.addEventListener('click', function(){
    cart.length = 0;
    renderCart();
  })
  
  checkAuth();

  modalBody.addEventListener('click', changeCount)
  
  cardsMenu.addEventListener('click', addToCart);
  
  cardsRestaurants.addEventListener('click', openGoods);
  
  logo.addEventListener('click', function (){
    containerPromo.classList.remove('hide')
        restaurants.classList.remove('hide')
        menu.classList.add('hide')
  })
  
  cartButton.addEventListener('click', function() {
    renderCart();
    toggleModal();
  });
  
  close.addEventListener('click', toggleModal);
  
}

init();

checkAuth();

new Swiper('.swiper-container', {
  loop: true,
  autoplay: {
    delay: 3000,
  },
  sliderPerView: 1,
  slidesPerColumn: 1,
})