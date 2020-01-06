window.addEventListener(
  "load",
  function() {
    const manageBtn = document.getElementById("manage-game");
    const cardFieldContainer = document.getElementById("card-field-container");
    const options = document.getElementById("options");
    const timerBlock = document.getElementById("timer-block");
    const minutes = document.getElementById("minutes");
    const seconds = document.getElementById("seconds");
    const label = document.querySelectorAll("label");

    const complexitySettings = document.getElementById("complexity-settings");
    const complexity = document.getElementById("complexity");
    const results = document.getElementById("results");
    const rules = document.getElementById("rules");
    const instructions = document.getElementById("instructions");

    let complexityPoints = 9;
    let guessed = 0;
    let hints = 0;
    let cardsListeners = [];
    let answers = [];
    let timeForRemembering = "";
    let timer;

    const createNewElement = (className, tag = "div") => {
      const newTag = document.createElement(tag);
      newTag.classList.add(className);
      return newTag;
    };

    const showComplexity = e => {
      results.classList.add("hidden");
      instructions.classList.add("hidden");
      complexitySettings.classList.remove("hidden");
    };

    complexity.addEventListener("click", showComplexity, false);

    const showRules = e => {
      complexitySettings.classList.add("hidden");
      results.classList.add("hidden");
      instructions.classList.remove("hidden");
    };

    rules.addEventListener("click", showRules, false);

    const createComplexityStar = n => {
      complexity.textContent = "";
      const fragment = document.createDocumentFragment();
      for (let i = 0; i < n; i++) {
        const image = createNewElement("complexity-img", "img");
        image.src = "images/star-yellow.png";
        fragment.appendChild(image);
      }
      complexity.appendChild(fragment);
    };

    const changeComplexity = e => {
      const attr = e.target.getAttribute("for");
      if (attr === "easy") {
        createComplexityStar(1);
        complexityPoints = 9;
      } else if (attr === "hard") {
        createComplexityStar(2);
        complexityPoints = 18;
      }
    };

    label.forEach(item =>
      item.addEventListener("click", changeComplexity, false)
    );

    const shuffleArray = array => {
      const result = [].concat(array);
      for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
      }
      return result;
    };

    function ItemBlock(n, isHint = false) {
      this.item = createNewElement("item");
      this.item.id = `item-${n}`;
      this.bundle = createNewElement("bundle");
      this.bundle.id = `bundle-${n}`;
      this.keyWord = createNewElement("key-word");
      this.keyWord.id = `key-word-${n}`;
      this.bindedWord = createNewElement("binded-word", "input");
      this.bindedWord.id = `binded-word-${n}`;

      this.bundle.appendChild(this.keyWord);
      this.bundle.appendChild(this.bindedWord);
      this.item.appendChild(this.bundle);

      if (isHint) {
        this.hint = createNewElement("hint", "img");
        this.hint.src = "images/hint.png";
        this.item.appendChild(this.hint);
      }
    }

    const getRandomItems = (num, array = words) => {
      const count = num * 2;
      const wordsArray = [];

      while (wordsArray.length < count) {
        const key = array[Math.floor(Math.random() * array.length)];
        if (wordsArray.indexOf(key) === -1) {
          wordsArray.push(key);
        }
      }

      const wordsArrayLength = wordsArray.length / 2;
      const keyArray = wordsArray.slice(0, wordsArrayLength);
      const valueArray = wordsArray.slice(wordsArrayLength, wordsArray.length);

      return {
        keys: shuffleArray(keyArray),
        values: shuffleArray(valueArray)
      };
    };

    const generateCardItems = count => {
      const fragment = document.createDocumentFragment();
      const randomItems = getRandomItems(count);

      for (let i = 0; i < count; i++) {
        const card = new ItemBlock(i);
        card.keyWord.textContent = randomItems.keys[i];
        card.bindedWord.value = randomItems.values[i];
        card.bindedWord.setAttribute("disabled", true);
        fragment.appendChild(card.item);
      }
      cardFieldContainer.appendChild(fragment);
    };

    const startTimer = () => {
      let countSeconds = -1;
      let countMinutes = 0;

      function updateTimer() {
        countSeconds += 1;

        if (countSeconds === 60) {
          countSeconds = 0;
          countMinutes += 1;
          if (countMinutes === 60) {
            clearTimeout(timer);
            return;
          }
          if (countMinutes < 10) {
            minutes.textContent = "0" + countMinutes;
          } else {
            minutes.textContent = countMinutes;
          }
        }

        if (countSeconds < 10) {
          seconds.textContent = "0" + countSeconds;
        } else {
          seconds.textContent = countSeconds;
        }
        timer = setTimeout(updateTimer, 1000);
      }
      updateTimer();
    };

    const getAnswer = () => {
      const items = document.querySelectorAll(".item");
      const len = items.length;
      for (let i = 0; i < len; i++) {
        const key = items[i].getElementsByClassName("key-word")[0].textContent;
        const value = items[i].getElementsByClassName("binded-word")[0].value;
        answers[items[i].id] = {
          key,
          value
        };
      }
    };

    const checkValue = e => {
      const parent = e.target.parentNode.parentNode;
      const id = parent.id;
      const value = e.target.value;
      const reg = new RegExp(`^${value}`, "i");

      const isMatched = reg.test(answers[id].value);

      if (!isMatched) {
        e.target.value = "";
        e.target.placeholder = "неправильно";
      }
      if (isMatched && value.length >= 3) {
        e.target.value = answers[id].value;
        e.target.setAttribute("disabled", true);
        e.target.parentNode.classList.add("right");
        parent.lastElementChild.classList.add("hide");
        guessed += 1;
      }
    };

    const executeHint = e => {
      const parent = e.target.parentNode;
      const id = parent.id;
      const input = parent.firstElementChild.lastElementChild;
      input.value = answers[id].value;
      input.setAttribute("disabled", true);
      parent.firstElementChild.classList.add("prompted");
      e.target.classList.add("hide");
      hints += 1;
    };

    const checkAnswers = () => {
      manageBtn.removeEventListener("click", checkAnswers, false);
      clearTimeout(timer);
      manageBtn.textContent = "Начать игру";

      document.getElementById("all-answers").textContent = guessed + hints;
      document.getElementById("right-answers").textContent = guessed;
      let allCards = document.getElementsByClassName("all-cards-count");
      Array.prototype.forEach.call(allCards, item => {
        item.textContent = complexityPoints;
      });
      document.getElementById("hints-count").textContent = hints;
      document.getElementById(
        "whole-game-time"
      ).textContent = `${minutes.textContent} : ${seconds.textContent}`;
      document.getElementById(
        "time-for-remember"
      ).textContent = timeForRemembering;
      timerBlock.classList.remove("visible");
      options.classList.remove("hidden");

      cardsListeners.forEach(element => {
        element.bindedWord.removeEventListener("keyup", checkValue);
        element.hint.removeEventListener("click", executeHint);
      });

      answers = [];
      cardsListeners.length = 0;

      cardFieldContainer.textContent = "";
      cardFieldContainer.classList.add("hidden");
      results.classList.remove("hidden");

      manageBtn.addEventListener("click", startGame, false);
    };

    const showItems = () => {
      manageBtn.textContent = "Проверить";
      manageBtn.addEventListener("click", checkAnswers, false);
      const keys = [];
      for (let key in answers) {
        keys.push(key);
      }
      const shuffledKeys = shuffleArray(keys);

      const count = keys.length;
      cardFieldContainer.textContent = "";
      for (let i = 0; i < count; i++) {
        const num = shuffledKeys[i].split("-")[1];
        const card = new ItemBlock(num, true);
        cardFieldContainer.appendChild(card.item);
        const key = answers[shuffledKeys[i]]["key"];
        card.keyWord.textContent = key;
        card.bindedWord.addEventListener("keyup", checkValue, false);
        card.hint.addEventListener("click", executeHint, false);
        cardsListeners.push(card);
      }
    };

    const rememberItems = e => {
      getAnswer();
      let items = document.getElementsByClassName("item");
      Array.prototype.forEach.call(items, item => {
        item.classList.add("animate");
      });
      setTimeout(showItems, 500);
      timeForRemembering = `${minutes.textContent} : ${seconds.textContent}`;
      manageBtn.removeEventListener("click", rememberItems);
    };

    const startGame = e => {
      complexitySettings.classList.add("hidden");
      instructions.classList.add("hidden");
      results.classList.add("hidden");
      cardFieldContainer.classList.remove("hidden");
      guessed = 0;
      hints = 0;

      generateCardItems(complexityPoints);
      manageBtn.removeEventListener("click", startGame, false);
      clearTimeout(timer);
      manageBtn.textContent = "Запомнить";
      manageBtn.addEventListener("click", rememberItems, false);
      options.classList.add("hidden");
      timerBlock.classList.add("visible");
      minutes.textContent = "00";
      startTimer();
    };

    manageBtn.addEventListener("click", startGame, false);
  },
  false
);
