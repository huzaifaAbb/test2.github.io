/** Api service */
let modalOpen = false;

const aS = {
  get: (endPoint, headers) => {
    console.log(`${api}${endPoint}`);
    return axios
      .get(`${api}${endPoint}`, {
        responseType: 'json',
        headers: headers,
      })
      .then(function (res) {
        console.log(res.data);
        if (res.status == 200) {
          return res.data;
        }
      })
      .catch(function (err) {
        return {
          error: err.message,
        };
      });
  },
  getFile: (endPoint, headers) => {
    console.log(`${api}${endPoint}`);
    return axios
      .get(`${api}${endPoint}`, {
        headers: headers,
        responseType: 'blob',
      })
      .then(function (res) {
        console.log(res.data);
        if (res.status == 200) {
          return res;
        }
      })
      .catch(function (err, res) {
        return {
          error: err.message,
        };
      });
  },
  post: (endPoint, body, headers) => {
    return axios
      .post(`${api}${endPoint}`, body, {
        responseType: 'json',
        headers: headers,
      })
      .then(function (res) {
        console.log(res.data);
        if (res.status == 200) {
          return res.data;
        }
      })
      .catch(function (err) {
        return {
          error: err.message,
        };
      });
  },
};

/** Shop API */
const shopServer = {
  getProducts: () => {
    return aS.get('products/all', null);
  },
  getCredits: () => {
    let token = readCookie('discord-token');
    let headers = {
      'Discord-Token': token,
    };
    return aS.get('my_credits', headers);
  },
  purchaseProduct: (item_id) => {
    let token = readCookie('discord-token');
    let headers = {
      'Discord-Token': token,
    };
    const body = {
      item_id,
    };
    return aS.post('product/reedem', body, headers);
  },
};

/** Discord Server */
const dServer = {
  restorePass: (postBody) => {
    let token = readCookie('admin-token');
    let headers = {
      'Admin-Token': token,
    };
    return aS.post('discord_oauth?req=restore_pass', postBody, headers);
  },
  deletePass: (postBody) => {
    let token = readCookie('admin-token');
    let headers = {
      'Admin-Token': token,
    };
    return aS.post('discord_oauth?req=delete_pass', postBody, headers);
  },
  getLink: () => {
    return aS.post('discord_oauth?req=url', null, null);
  },
  stripeSub: (password) => {
    let str = 'stripe?req=sub';
    if (password) {
      str += '&password=' + password;
    }
    return aS.get(str, null);
  },
  stripeCoupon: ({ id, password }) => {
    return aS.post('stripe?req=coupon', { id, password }, null);
  },
  stripePayment: (postBody) => {
    return aS.post('stripe?req=pay', postBody, null);
  },
  contactEmail: (postBody) => {
    return aS.post('discord_oauth?req=contact', postBody, null);
  },
  getUserInfo: async () => {
    let token = readCookie('discord-token');
    let headers = {
      'Discord-Token': token,
    };
    let res = await aS.get('discord_oauth?req=user_info', headers);
    return res;
  },
  updateEmail: async ({ email }) => {
    let token = readCookie('discord-token');
    let headers = {
      'Discord-Token': token,
    };

    swal.fire({
      title: 'Saving email...',
    });
    swal.showLoading();
    let res = await aS.post(
      'discord_oauth?req=change_mail',
      {
        email,
      },
      headers
    );
    if (res.success) Alert.success(res.success);
    if (res.error) Alert.error(res.error);
    return res;
  },
  updatePhone: async ({ phone }) => {
    let token = readCookie('discord-token');
    let headers = {
      'Discord-Token': token,
    };

    swal.fire({
      title: 'Saving phone number...',
    });
    swal.showLoading();
    let res = await aS.post(
      'discord_oauth?req=change_phone',
      {
        phone,
      },
      headers
    );
    if (res.success) Alert.success(res.success);
    if (res.error) Alert.error(res.error);
    return res;
  },
  submitKey: async () => {
    swal
      .fire({
        title: 'Submit your auth key',
        input: 'text',
        inputAttributes: {
          autocapitalize: 'sff',
        },
        showCancelButton: false,
        confirmButtonText: 'Look up',
        showLoaderOnConfirm: true,
        allowEscapeKey: false,
        closeOnClickOutside: false,
        allowOutsideClick: false,
        preConfirm: (key) => {
          let headers = {
            'Discord-Token': readCookie('discord-token'),
          };
          return aS
            .post('discord_oauth?req=check_key', { key }, headers)
            .then((response) => {
              //console.log(response);
              if (response.error) {
                throw new Error(response.error);
              }
              return response;
            })
            .catch((error) => {
              swal.showValidationMessage(`Request failed: ${error}`);
            });
        },
        //allowOutsideClick: () => !swal.isLoading()
      })
      .then((result) => {
        let res = result.value;
        if (res.success) {
          Alert.success(res.success);
          $('#license-key').text(res.key);
          $('#membership-type').text(res.type);
          $('#strip-id').text(res.stripe_sub);
          let { card_info, autoCheckoutLink } = res;
          if (card_info) {
            $('#sub-status').text(card_info.currentStatus);
            let { last4, exp_month, exp_year } = card_info;
            $('#cc-number').val(`**** **** **** ${last4}`);
            $('#cc-expiry').val(`${exp_month}/${exp_year}`);
            $('#cc-cvv').val('***');
          } else {
            $('#sub-status').text('FREE');
            $('#edit-card').attr('disabled', true);
          }
          if (autoCheckoutLink) {
            $('.autoCheckout a').attr('href', autoCheckoutLink);
          } else {
            $('.autoCheckout a').on('click', function (event) {
              event.preventDefault();
              return Alert.errorHTML(
                'There is currently not a link available, #autoCheckout will update as soon as possible'
              );
            });
          }
        }
      });
  },
  getGuildInfo: async () => {
    let token = readCookie('discord-token');
    let headers = {
      'Discord-Token': token,
    };
    let res = await aS.post('discord_oauth?req=user_info', null, headers);
    return res;
  },
  downloadFile: async (query) => {
    let token = readCookie('discord-token');
    let headers = {
      'Discord-Token': token,
    };
    let res = await aS.getFile('discord_oauth?req=file&' + query + '=true', headers);
    return res;
  },
  getAdminTable: async () => {
    let token = readCookie('admin-token');
    let headers = {
      'Admin-Token': token,
    };
    let res = await aS.get('discord_oauth?req=admin_table', headers);
    return res;
  },
  sendEmail: async (email, key) => {
    let token = readCookie('admin-token');
    let headers = {
      'Admin-Token': token,
    };
    let res = await aS.post('discord_oauth?req=send_email_key', { email, key }, headers);
    return res;
  },
  getPasswords: async () => {
    let token = readCookie('admin-token');
    let headers = {
      'Admin-Token': token,
    };
    let res = await aS.get('discord_oauth?req=get_password', headers);
    return res;
  },
  getDeletedPasswords: async () => {
    let token = readCookie('admin-token');
    let headers = {
      'Admin-Token': token,
    };
    let res = await aS.get('discord_oauth?req=get_password_deleted', headers);
    return res;
  },
  generateKey: async (type) => {
    let token = readCookie('admin-token');
    let headers = {
      'Admin-Token': token,
    };
    let res = await aS.post('discord_oauth?req=generate_key', { type }, headers);
    return res;
  },
  saveStock: async ({ id, type, stock, status, coupon, expiration_date }) => {
    let token = readCookie('admin-token');
    let headers = {
      'Admin-Token': token,
    };
    let res = await aS.post(
      'discord_oauth?req=save_stock',
      { id, type, stock, status, coupon, expiration_date },
      headers
    );
    return res;
  },
  disableKey: async (key, sub, id_user) => {
    let token = readCookie('admin-token');
    let headers = {
      'Admin-Token': token,
    };
    let res = await aS.post('discord_oauth?req=disable_key', { key, sub, id_user }, headers);
    return res;
  },
  updateCard: async (card_id) => {
    let token = readCookie('discord-token');
    let headers = {
      'Discord-Token': token,
    };
    let res = await aS.post('discord_oauth?req=update_card', { card_id: card_id }, headers);
    return res;
  },
  updateCustomer: async ({ email, customer, discord_id, key }) => {
    let token = readCookie('admin-token');
    let headers = {
      'Admin-Token': token,
    };
    let res = await aS.post('discord_oauth?req=update_email_customer', { email, customer, discord_id, key }, headers);
    return res;
  },
  underConstruction: async ({ status }) => {
    let token = readCookie('admin-token');
    let headers = {
      'Admin-Token': token,
    };
    let url = 'discord_oauth?req=under_construction';
    if (status != null) {
      url += '&on=' + status;
    }
    let res = await aS.get(url, headers);
    return res;
  },
  web_status: async () => {
    let url = 'discord_oauth?req=web_status';
    let res = await aS.get(url, null);
    return res;
  },
  authDiscord: async () => {
    var urlParams = new URLSearchParams(window.location.search);
    var code = urlParams.get('code');
    if (code) {
      /** Erase Token Login */
      eraseCookie('discord-token');
      let body = {
        code,
      };
      swal.fire({
        title: 'Please Wait !',
        icon: 'info',
        html: 'Verifying Discord Login', // add html attribute if you want or remove
        allowOutsideClick: false,
        onBeforeOpen: () => {
          swal.showLoading();
        },
      });
      let { access_token, error, error_description } = await aS.post('discord_oauth?req=auth', body, null);
      createCookie('discord-token', access_token, 7);
      if (error_description) error = error_description;
      if (error) return { error: error };

      if (access_token) {
        return { success: 'Redirect' };
      }
    } else {
      return false;
    }
  },
};
