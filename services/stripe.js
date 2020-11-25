$(document).ready(function () {
  function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  const stripe = Stripe(stripeKey); // Your Publishable Key
  const elements = stripe.elements();

  // Create our card inputs
  var style = {
    base: {
      color: '#fff',
    },
  };

  const card = elements.create('card', {
    style,
  });
  card.mount('#card-element');

  const form = document.querySelector('#card-form');
  const errorEl = document.querySelector('#card-errors');

  // Give our token to our form
  const stripeTokenHandler = (token) => {
    const hiddenInput = document.createElement('input');
    hiddenInput.setAttribute('type', 'hidden');
    hiddenInput.setAttribute('name', 'stripeToken');
    hiddenInput.setAttribute('value', token.id);
    form.appendChild(hiddenInput);

    //form.submit();
  };

  function modalClose() {
    setTimeout(() => {
      modalOpen = false;
    }, 10000);
  }

  // Create token from card data
  console.log('Add event listener');
  form.addEventListener('submit', async (e) => {
    console.log('form Submit');
    e.preventDefault();
    let email = $('[name="email"]').val();
    let coupon = $('[name="coupon"]').val();
    var checkError = $('[name="coupon"]').hasClass('error');
    if (checkError) coupon = '';
    let pass = $('#pass').val();
    if (!validateEmail(email)) return Alert.error('Not a valid email');

    if (coupon) {
      const couponInfo = await dServer.stripeCoupon({ id: coupon, password: pass });
      if (couponInfo.error) return Alert.error('Not a valid coupon');
    }

    swal.fire({
      title: 'Loading..',
      text: 'Do not close this window',
      allowEscapeKey: false,
      closeOnClickOutside: false,
    });
    swal.showLoading();

    stripe.createToken(card).then((res) => {
      if (res.error) {
        Alert.error(res.error.message);
        return;
      }

      $('#stripeModal').modal('hide');

      let postBody = {
        token: res.token.id,
        email,
        pass,
        coupon,
      };
      function processPost(postBody) {
        let resSuccess = null;
        dServer.stripePayment(postBody).then((res) => {
          modalOpen = true;
          if (res.error) {
            if (res.error == 'Password required') {
              swal
                .fire({
                  title: 'Password required',
                  input: 'text',
                  inputAttributes: {
                    autocapitalize: 'off',
                  },
                  showCancelButton: true,
                  confirmButtonText: 'Purchase',
                  showLoaderOnConfirm: true,
                  preConfirm: (input) => {
                    if (!input) {
                      swal.showValidationMessage(`Request failed: No password`);
                    } else {
                      postBody.pass = input;
                      return dServer
                        .stripePayment(postBody)
                        .then((resStripe) => {
                          if (resStripe.error) throw new Error(resStripe.error);
                          resSuccess = resStripe.response;
                        })
                        .catch((error) => {
                          swal.showValidationMessage(`Request failed: ${error}`);
                        });
                    }
                  },
                  allowOutsideClick: () => !swal.isLoading(),
                })
                .then((result) => {
                  if (result.value) {
                    let resApi = result.value;
                    modalClose();
                    if (resApi) return Alert.success(resSuccess);
                  }
                });
            } else {
              Alert.error(res.error);
              modalClose();
            }
          } else if (res) {
            Alert.success(res.response);
            modalClose();
          } else {
            Alert.error('Api broken, contact support');
            modalClose();
          }
        });
      }

      processPost(postBody);

      console.log(postBody);
    });
  });
});
