'use strict';

// Обработка навигационного меню
function displayMenu(event) {
    const navbarList = document.getElementById("navbarList");
    const page = document.getElementById("page");
    
    navbarList.classList.toggle("show");
    page.classList.toggle("nav-active");
}

// Плавная прокрутка к секциям страницы
const anchors = document.querySelectorAll('a[href*="#"]');
for (let anchor of anchors) {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const blockID = anchor.getAttribute('href').substr(1);
        const element = document.getElementById(blockID);
        if (element) {
            const offsetPosition = element.getBoundingClientRect().top + window.pageYOffset - 92;
            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
        }
    });
}

// Отображение текущего года
let tomorrow = new Date();
document.getElementById("spanDate").innerHTML = tomorrow.getFullYear();

// Настройка Swiper карусели
const swiper = new Swiper(".mySwiper", {
    cssMode: true,
    slidesPerView: 2,
    spaceBetween: 30,
    loop: false,
    speed: 1000,
    navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
    },
    pagination: {
        el: ".swiper-pagination",
    },
    mousewheel: true,
    keyboard: true,
    breakpoints: {
        320: {
            slidesPerView: 1,
            spaceBetween: 10,
        },
        1024: {
            slidesPerView: 3,
            spaceBetween: 30,
        },
        1280: {
            slidesPerView: 3,
            spaceBetween: 30,
        }
    }
});

// Загрузка и установка языка из localStorage или по умолчанию
document.addEventListener('DOMContentLoaded', function() {
    var storedLang = localStorage.getItem('preferredLang') || 'ru'; // Установите 'ru' как язык по умолчанию
    setLanguage(storedLang);
    
    document.getElementById('switch-lang').addEventListener('click', function() {
        var newLang = storedLang === 'ru' ? 'en' : 'ru';
        setLanguage(newLang);
        localStorage.setItem('preferredLang', newLang);
        storedLang = newLang;
    });
});

// Функция установки языка и загрузки переводов
function setLanguage(lang) {
    fetchTranslations(lang, function(translations) {
        window.currentTranslations = translations; // Сохраняем текущие переводы для использования в getTranslation
        updateTexts(translations);
        document.documentElement.lang = lang;
        document.getElementById('switch-lang').textContent = lang === 'ru' ? 'En' : 'Ru';
    });
}

// Загрузка переводов из JSON файла
function fetchTranslations(lang, callback) {
    fetch('translations.json')
      .then(response => {
          if (!response.ok) {
              throw new Error('Network response was not ok');
          }
          return response.json();
      })
      .then(data => callback(data[lang]))
      .catch(error => {
          console.error('There has been a problem with your fetch operation:', error);
      });
}

// Обновление текстовых элементов страницы согласно загруженным переводам
function updateTexts(translations) {
    var elements = document.querySelectorAll('[data-key]');
    elements.forEach(function(element) {
        var key = element.getAttribute('data-key');
        if (translations[key]) {
            // Проверяем, содержит ли перевод HTML теги
            if (/</.test(translations[key]) && />/.test(translations[key])) {
                // Если содержит, вставляем как HTML
                element.innerHTML = translations[key];
            } else {
                // Если не содержит, вставляем как текст
                element.textContent = translations[key];
            }
        }
    });
    
    // Обработка плейсхолдеров
    var placeholderElements = document.querySelectorAll('[data-key-placeholder]');
    placeholderElements.forEach(function(element) {
        var key = element.getAttribute('data-key-placeholder');
        if (translations[key]) {
            element.setAttribute('placeholder', translations[key]);
        }
    });
}

// Экранирование HTML в тегах <pre>
var preTags = document.querySelectorAll('pre');
for (var i = 0; i < preTags.length; i++) {
    var htmlContent = preTags[i].innerHTML;
    var encodedHtml = htmlContent.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    preTags[i].innerHTML = encodedHtml;
}

// Получение элементов модального окна
const modal = document.getElementById("contactModal");
const openModalBtn = document.getElementById("openModalBtn");
const closeModalBtn = document.querySelector(".close-button");
const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");

// Обработчик открытия модального окна
openModalBtn.addEventListener("click", () => {
    modal.style.display = "block"; // Устанавливаем display перед добавлением класса
    setTimeout(() => {
        modal.classList.add("show");
    }, 10); // Небольшая задержка для активации CSS перехода
    document.body.style.overflow = "hidden";
});

// Обработчик закрытия модального окна
closeModalBtn.addEventListener("click", () => {
    modal.classList.remove("show");
    document.body.style.overflow = "auto";
    // После окончания перехода, скрываем модальное окно
    setTimeout(() => {
        modal.style.display = "none";
    }, 300); // Должно совпадать с временем перехода в CSS
});

// Закрытие модального окна при клике вне его содержимого
window.addEventListener("click", (event) => {
    if (event.target == modal) {
        modal.classList.remove("show");
        document.body.style.overflow = "auto";
        setTimeout(() => {
            modal.style.display = "none";
        }, 300);
    }
});

// Обработка формы контакта через SMTPJS
contactForm.addEventListener("submit", function(event) {
    event.preventDefault();
    
    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const email = document.getElementById("email").value.trim();
    const message = document.getElementById("message").value.trim();
    
    if (!name || !phone || !email || !message) {
        formStatus.textContent = getTranslation('contactModal-formError');
        formStatus.style.color = "red";
        return;
    }
    
    // SecureToken, полученный от SMTPJS
    const secureToken = "e7c1cd5c-cdc0-499d-8297-092f4b9d2ce9";
    
    Email.send({
        SecureToken: secureToken,
        To: 'alexander.boev.dev@gmail.com',
        From: "alexander.boev.dev@gmail.com",
        Subject: getTranslation('contactModal-emailSubject'),
        Body: getTranslation('contactModal-emailBody', { name, phone, email, message })
    }).then(
      message => {
          if (message === 'OK') {
              formStatus.textContent = getTranslation('contactModal-formSuccess');
              formStatus.style.color = "green";
              setTimeout(() => {
                  modal.classList.remove("show");
                  setTimeout(() => {
                      modal.style.display = "none";
                      contactForm.reset();
                      formStatus.textContent = "";
                  }, 300);
                  document.body.style.overflow = "auto";
              }, 2000);
          } else {
              formStatus.textContent = getTranslation('contactModal-formErrorSend');
              formStatus.style.color = "red";
          }
      }
    ).catch(error => {
        console.error('Ошибка при отправке письма:', error);
        formStatus.textContent = getTranslation('contactModal-formErrorSend');
        formStatus.style.color = "red";
    });
});

// Функция для получения перевода с возможностью вставки динамических данных
function getTranslation(key, params = {}) {
    if (window.currentTranslations && window.currentTranslations[key]) {
        let text = window.currentTranslations[key];
        for (const param in params) {
            text = text.replace(`{${param}}`, params[param]);
        }
        return text;
    }
    return key;
}
