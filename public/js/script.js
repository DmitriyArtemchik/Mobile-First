document.addEventListener('DOMContentLoaded', function(){
  var wrapper = document.querySelector('.wrapper'),
      navMenu = document.querySelector('.nav-menu'),
      body = document.querySelector('body'),
      anchors = document.querySelectorAll('a[href^="#"]'),
      arrAnchors = Array.prototype.slice.call(anchors),
      letterForm = document.querySelector('.letterForm');



  wrapper.addEventListener('click', function(){
    wrapper.classList.toggle('burger-active');
    navMenu.classList.toggle('nav-menu__passive');
    navMenu.classList.toggle('nav-menu__active');
    body.classList.toggle('hidden');
  });



arrAnchors.forEach(function(anchor) {
  anchor.addEventListener("click", function(e) {
    e.preventDefault();
    var goto = anchor.hasAttribute('href') ? anchor.getAttribute('href') : 'body';
    document.querySelector(goto).scrollIntoView({
      behavior: "smooth",
      block: "start"
    })
  })
});



letterForm.addEventListener('submit', function(evt) {
  evt.preventDefault();
  const action = this.getAttribute('action'),
        userName = document.querySelector("input[name=userName]"),
        userTel = document.querySelector("input[name=userTel]"),
        userEmail = document.querySelector("input[name=userEmail]"),
        userMessage = document.querySelector("input[name=userMessage]"),
        name = userName.value,
        tel = userTel.value,
        email = userEmail.value,
        message = userMessage.value;

  fetch(action, {
  method: "POST",
  headers: new Headers({
    Accept: 'application/json; charset = utf-8',
    'Content-Type': 'application/json; charset = utf-8'
  }),
  mode: 'same-origin',
  body: JSON.stringify({"name: ":name, "tel: ":tel, "email: ":email, "message: ":message})
  })
  .then( function(response) {
      if (response.status !== 200) {
      return Promise.reject();
      }
      return response.text();

  })
  .catch(() => console.log("error"));
});
});
