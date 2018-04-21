window.addEventListener('load', () => {
  fetch('assets/img/5.png')
    .then(res => res.blob())
    .then(blob => {
      var img = document.querySelector('.sample05')
      img.src = URL.createObjectURL(blob)
    })
})
