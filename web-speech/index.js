if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('./service-worker.js')
    .then(function () { console.log('Service Worker Registered'); });
}

const status = {
  init: 'init',
  start: 'start',
  end: 'end',
  finish: 'finish',
  next: 'next',
  back: 'back'
};

class Speech {
  constructor(utter) {
    this.utter = utter;
    this.utter.addEventListener('end', this._handler.bind(this));

    this.status = status.init;
    this.textList = [].slice.call(document.querySelectorAll('#article p'));
    this.currentIndex = 0;
  }

  _handler() {
    console.log('status', this.status);
    switch (this.status) {
      case status.start:
        this._autoNext();
        return;
      case status.next:
      case status.back:
        this.start();
        return;
      case status.end:
      default:
        return;
    }
  }

  _speak() {
    console.log('speak', this.currentIndex);
    this.utter.text = this.textList[this.currentIndex].textContent;
    window.speechSynthesis.speak(this.utter);
  }

  start() {
    console.log('start');
    this.status = status.start;

    if (window.speechSynthesis.speaking) {
      console.log('speechSynthesis.speaking');
      return;
    }

    this._speak();
  }

  _autoNext() {
    this.currentIndex++;
    this._speak();
  }

  next() {
    console.log('next');
    this.status = status.next;

    if (this.currentIndex < this.textList.length) {
      this.currentIndex++;
      window.speechSynthesis.cancel();
    } else {
      this.finish();
    }
  }

  back() {
    console.log('back');
    this.status = status.back;

    this.currentIndex = this.currentIndex > 0 ? this.currentIndex - 1 : 0;
    window.speechSynthesis.cancel();
  }

  stop() {
    console.log('stop');
    this.finish();
  }

  /**
   * TODO: pause method
   */
  pause() {
    console.log('pause');
  }

  finish() {
    console.log('finish');
    this.status = status.end;

    window.speechSynthesis.cancel();
    this.currentIndex = 0;
  }
}

function setVoice(uttr, lang = 'ja-JP') {
  window.voices = window.voices || window.speechSynthesis.getVoices()
  for (let i = 0; i < window.voices.length; i++) {
    if (window.voices[i].lang === lang) {
      uttr.voice = window.voices[i];
    }
  }
  uttr.lang === lang;
}

const utterThis = new SpeechSynthesisUtterance();
utterThis.addEventListener('error', (e) => {
  console.error('SpeechSynthesisUtterance.onerror');
});
setVoice(utterThis);

const utterThis1 = new SpeechSynthesisUtterance('ゴーシュは町の活動写真館でセロを弾く係りでした。けれどもあんまり上手でないという評判でした。');
utterThis1.addEventListener('error', (e) => {
  console.error('SpeechSynthesisUtterance.onerror');
});
setVoice(utterThis1);
const utterThis2 = new SpeechSynthesisUtterance('上手でないどころではなく実は仲間の楽手のなかではいちばん下手でしたから、いつでも楽長にいじめられるのでした。');
utterThis2.addEventListener('error', (e) => {
  console.error('SpeechSynthesisUtterance.onerror');
});
setVoice(utterThis2);
const utterThis3 = new SpeechSynthesisUtterance('ひるすぎみんなは楽屋に円くならんで今度の町の音楽会へ出す第六交響曲の練習をしていました。');
utterThis3.addEventListener('error', (e) => {
  console.error('SpeechSynthesisUtterance.onerror');
});
setVoice(utterThis3);

window.speechSynthesis.onvoiceschanged = (e) => {
  console.log('speechSynthesis.onvoiceschanged', e.timeStamp);
  setVoice(utterThis);
};

const speech = new Speech(utterThis);
const demoBtn = document.getElementById('demo');
const startBtn = document.getElementById('start');
// const pauseBtn = document.getElementById('pause');
const stopBtn = document.getElementById('stop');
const nextBtn = document.getElementById('next');
const backBtn = document.getElementById('back');

demoBtn.onclick = (e) => {
  e.preventDefault();
  window.speechSynthesis.speak(utterThis1);
  window.speechSynthesis.speak(utterThis2);
  window.speechSynthesis.speak(utterThis3);
}

startBtn.onclick = (e) => {
  e.preventDefault();
  speech.start();
}

stopBtn.onclick = (e) => {
  e.preventDefault();
  speech.stop();
}

// pauseBtn.onclick = (e) => {
//   console.log(e);
//   e.preventDefault();
//   speech.pause();
// }

nextBtn.onclick = (e) => {
  e.preventDefault();
  speech.next();
}

backBtn.onclick = (e) => {
  e.preventDefault();
  speech.back();
}

window.addEventListener('beforeunload', () => {
  speech.stop();
})
