/** Alerts */
const swal = Swal.mixin({
  customClass: {
    container: 'container-class',
    popup: 'popup-class text-white',
    header: 'header-class',
    title: 'title-class text-white',
    closeButton: 'close-button-class',
    icon: 'icon-class',
    image: 'image-class',
    content: 'content-class text-white',
    input: 'input-class',
    actions: 'actions-class',
    confirmButton: 'btn btn-success',
    cancelButton: 'cancel-button-class',
    footer: 'footer-class',
  },
  background: 'rgb(23, 25, 65)',
  buttonsStyling: false,
  //iconHtml:
  //'<img class="img-fluid rounded-circle shadow-lg" src="./assets/img/elixir/Elixir_Labs_Logo.svg" rel="tooltip" target="_blank" data-original-title="" title="">',
  //imageUrl: './assets/img/elixir/Elixir_Labs_Logo.svg',
  color: 'white',
});

const Alert = {
  error: (text) => {
    swal.fire({
      title: 'Error!',
      text: text,
      icon: 'error',
      confirmButtonText: 'Okay',
    });
  },
  errorHTML: (text) => {
    swal.fire({
      title: 'Error!',
      html: text,
      icon: 'error',
      confirmButtonText: 'Okay',
    });
  },
  warning: (text) => {
    swal.fire({
      title: 'Important!',
      text: text,
      icon: 'warning',
      confirmButtonText: 'Okay',
    });
  },
  success: (text) => {
    swal.fire({
      title: 'Success!',
      text: text,
      icon: 'success',
      confirmButtonText: 'Okay',
    });
  },
  redirection: (location, title, message) => {
    let timerInterval;
    swal
      .fire({
        title: title,
        html: message,
        timer: 2000,
        timerProgressBar: true,
        allowEscapeKey: false,
        closeOnClickOutside: false,
        onBeforeOpen: () => {
          swal.showLoading();
          timerInterval = setInterval(() => {
            const content = swal.getContent();
            if (content) {
              const b = content.querySelector('b');
              if (b) {
                b.textContent = swal.getTimerLeft();
              }
            }
          }, 100);
        },
        onClose: () => {
          clearInterval(timerInterval);
        },
      })
      .then((result) => {
        /* Read more about handling dismissals below */
        if (result.dismiss === swal.DismissReason.timer) {
          document.location.href = location;
        }
      });
  },
};
