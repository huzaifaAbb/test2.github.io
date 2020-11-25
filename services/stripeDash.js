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
      color: 'white',
    },
  };

  const card = elements.create('card', {
    style,
  });
  card.mount('#card-element');
  console.log('FORM MOUNTED');

  const form = document.querySelector('#card-form');

  // Create token from card data
  form.addEventListener('submit', (e) => {
    console.log('SUBMIT CARD');
    e.preventDefault();

    swal.fire({
      title: 'Updating card info..',
      text: 'Do not close this window',
      allowEscapeKey: false,
      closeOnClickOutside: false,
    });
    swal.showLoading();

    stripe.createToken(card).then((res) => {
      console.log('RES::', res);
      if (res.error) {
        Alert.error(res.error.message);
        return;
      }
      let { card } = res.token;
      dServer.updateCard(res.token.id).then((resUpdateC) => {
        if (resUpdateC.error) {
          return Alert.error(resUpdateC.error);
        } else if (resUpdateC.id) {
          let card_info = card;
          let { last4, exp_month, exp_year } = card_info;
          $('#cc-number').val(`**** **** **** ${last4}`);
          $('#cc-expiry').val(`${exp_month}/${exp_year}`);
          $('#cc-cvv').val('***');
          return Alert.success('Card updated successfully');
        } else {
          return Alert.error('Api error, contact support');
        }
      });
    });
  });
});
