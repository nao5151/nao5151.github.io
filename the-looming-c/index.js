class Training {
  constructor() {
    this.startButton = document.getElementById("start-button");
    this.startButton.addEventListener("click", (e) => {
      e.stopPropagation();
      this.start();
    });
    const container = document.getElementById("container");
    container.addEventListener(
      "click",
      () => {
        this.stop();
      },
      { passive: true }
    );

    const screenSize = Math.max(window.innerWidth, window.innerHeight);
    const holeSize = 37.5;
    const maxScale = Math.floor(screenSize / holeSize);
    const keyframes = document.createElement("style");
    keyframes.setAttribute("type", "text/css");
    keyframes.innerHTML = `@keyframes looming {
      0% {transform: scale3d(0, 0, 1);}
      100% {transform: scale3d(${maxScale}, ${maxScale}, 1);}
    }`;
    document.head.appendChild(keyframes);

    /** @type {HTMLElement} */
    this.div = document.getElementById("wrapper");
    /** @type {HTMLElement} */
    this.svg = document
      .getElementById("template")
      .content.cloneNode(true)
      .querySelector("svg");
    this.svg.addEventListener("animationend", this._onAnimationEnd.bind(this), {
      passive: true,
    });
  }

  start() {
    this.i = 0;
    this.duration = 800;
    this.startButton.style.display = "none";
    this.svg.style.animationDuration = `${this.duration}ms`;
    this.div.appendChild(this.svg);
  }

  stop() {
    this.svg.remove();
    this.startButton.style.display = "block";
  }

  _onAnimationEnd() {
    this.svg.remove();

    this.div.style.transform = `rotate(${
      45 * Math.floor(Math.random() * 8)
    }deg)`;
    this.i++;
    // 同じ期間のアニメーションは3秒行う
    // 1000ms /  3回
    //  500ms /  6回
    if (this.i % (Math.round(3000 / this.duration)) === 0) {
      this.i = 0;
      this.duration -= 100;
      if (this.duration >= 300) {
        this.svg.style.animationDuration = `${this.duration}ms`;
        setTimeout(() => {
          this.div.appendChild(this.svg);
        }, 1000);
      } else {
        this.stop();
      }
    } else {
      this.div.appendChild(this.svg);
    }
  }
}
const t = new Training();
