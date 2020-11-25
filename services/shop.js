var app = new Vue({
  el: '#appShop',
  data: {
    message: '',
    cards: [],
    userInfo: {
      credits_available: 'loading',
      total_credits: 0,
      credits: 0,
    },
  },
  methods: {
    async loadProducts() {
      const res = await shopServer.getProducts();
      for (let index = 0; index < res.length; index++) {
        const card = res[index];
        this.cards.push(card);
        this.$nextTick(() => {
          this.setupCardEffect(index);
        });
      }
    },
    async getProduct(card) {
      const cost = card.price;
      const currentCredits = this.userInfo.credits_available;
      if (currentCredits < cost) {
        const creditsRequired = cost - currentCredits;
        Alert.errorHTML(
          `Not enough credits to get <strong>${card.name}</strong><br/>You need ${creditsRequired} more credits to acquire this product`
        );
      } else {
        swal
          .fire({
            title: 'Are you sure?',
            text: `You are about to get ${card.name} in exchange of ${cost} credits!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes!',
            closeOnClickOutside: false,
          })
          .then(async (result) => {
            if (result.value) {
              swal.fire({
                title: 'Be patient',
                text: `Transaction in progress..`,
                icon: 'info',
                showCancelButton: false,
                showConfirmButton: false,
                closeOnClickOutside: false,
              });
              Swal.showLoading();
              const res = await shopServer.purchaseProduct(card.id);
              console.log('RESPONSE::', res);
              if (res.error) {
                Alert.errorHTML(res.error);
              } else if (res.success) {
                Alert.success('Transaction was successful, once approved by an admin you will get this product');
                this.loadCredits();
              }
            }
          });
      }
      //alert('GET PRODUCT');
    },
    async loadCredits() {
      const res = await shopServer.getCredits();
      this.userInfo = res;
    },
    setupCardEffect(index) {
      console.log('INDEX::', index);
      const name = 'card-' + index;
      const element = document.getElementById(name);
      if (!element) {
        setTimeout(() => {
          this.setupCardEffect(index);
        }, 50);
      } else {
        console.log('ELEMENT::', element, name);
        console.log('VANILLA TILT INIT');
        VanillaTilt.init(element);
      }
    },
  },
  beforeMount() {
    const discordToken = readCookie('discord-token');
    if (!discordToken) window.location.href = website;
    this.loadProducts();
    this.loadCredits();
  },
  mounted() {
    // Get values of instance
    //element.vanillaTilt.getValues();
    // Reset instance
  },
});
