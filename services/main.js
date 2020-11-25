$(document).ready(function () {
  let webConstruction;
  const body = $('body');

  function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  const dateForDateTimeInputValue = (date) => {
    return new Date(date.getTime() + new Date().getTimezoneOffset() * -60 * 1000).toISOString().slice(0, 19);
  };

  function addItemRowPass(id, type, stock, used, coupon, expiration_date) {
    if (expiration_date) {
      expiration_date = dateForDateTimeInputValue(new Date(expiration_date));
    }
    console.log('EXPIRATION DATE::', expiration_date);
    if (!coupon) coupon = '';
    let add = `<tr propId="${id}" id="password_${id}">
              <td class="text-center">
                  <span class="type-text">${type}</span>
                  <input style="display:none" class="type-input" value="${type}">
                  <button type="button" rel="tooltip"
                      class="btn-edit-pass btn btn-default btn-sm btn-icon" title="Edit Password">
                      <i class="tim-icons icon-pencil"></i>
                  </button>
              </td>
              <td>${used}/<input type="number" value="${stock}" class="stock-row"></td>
              <td><input type="text" placeholder="Coupon" value="${coupon}" class="coupon-row"></td>
              <td><input type="datetime-local" placeholder="Expiration" value="${expiration_date}" class="expiration-row"></td>
              <td class="td-actions">
                  <button type="button" rel="tooltip"
                      class="add-stock-type btn btn-default btn-sm btn-icon" title="Add Stock">
                      <i class="tim-icons icon-simple-add"></i>
                  </button>
                  <button type="button" rel="tooltip"
                      class="remove-stock-type btn btn-danger btn-sm btn-icon" title="Remove Stock">
                      <i class="tim-icons icon-simple-delete"></i>
                  </button>
                  <button type="button" rel="tooltip"
                      class="save-row btn btn-success btn-sm btn-icon" title="Save Changes">
                      <i class="tim-icons icon-check-2"></i>
                  </button>
                  <button type="button" rel="tooltip"
                      class="delete-row btn btn-danger btn-sm btn-icon" title="Delete">
                      <i class="tim-icons icon-trash"></i>
                  </button>
                  
              </td>
          </tr>`;
    $('#tbody-pass').append(add);
  }

  async function passwordHandler({ resPass, total, live }) {
    let publicPass = resPass[0];
    console.log('TOTAL::', total);
    const totalKeys = $('#total-keys');
    const keysAlive = $('#keys-alive');
    const publicKeys = $('#public-stock');
    const publicStockUsed = $('#public-stock-used');
    const saveBtnPublic = $('#saveBtn');

    totalKeys.text(total[0].stock);
    publicStockUsed.text(publicPass.used);
    keysAlive.text(live[0].stock);
    publicKeys.val(publicPass.stock);

    const addPublic = $('#add-public');
    const subtractPublic = $('#subtract-public');

    subtractPublic.on('click', function (e) {
      let getText = parseInt(publicKeys.val());
      if (getText > 0) getText--;

      publicKeys.val(getText);
    });

    addPublic.on('click', function (e) {
      let getText = parseInt(publicKeys.val());
      getText++;
      publicKeys.val(getText);
    });

    saveBtnPublic.on('click', async function (e) {
      let stock = parseInt(publicKeys.val());
      let id = 1;
      let res = await dServer.saveStock({ id, stock });
      if (res.success) Alert.success(res.success);
      if (res.error) Alert.error(res.error);
    });

    resPass.forEach(({ type, stock, status, id, used, coupon, expiration_date }, index) => {
      if (index > 0) {
        addItemRowPass(id, type, stock, used, coupon, expiration_date);
      }
    });

    $(document).on('click', '.btn-edit-pass', function (e) {
      var tr = $(this).closest('tr');
      var text = tr.find('.type-text');
      var input = tr.find('.type-input');
      if (input.is(':visible')) {
        input.hide();
        text.text(input.val());
        text.show();
      } else {
        input.show();
        text.hide();
      }
    });

    $(document).on('click', '.add-stock-type', function (e) {
      var tr = $(this).closest('tr');
      var stock = parseInt(tr.find('.stock-row').val());
      stock++;
      tr.find('.stock-row').val(stock);
    });

    $(document).on('click', '.remove-stock-type', function (e) {
      var tr = $(this).closest('tr');
      var stock = parseInt(tr.find('.stock-row').val());
      if (stock > 0) stock--;
      tr.find('.stock-row').val(stock);
    });

    $(document).on('click', '.delete-row', async function (e) {
      var isDeleted = $('#toggle-password').prop('checked');
      if (isDeleted == false) {
        swal
          .fire({
            title: 'Are you sure?',
            text: 'This will restore the current password with the current stock!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, restore it!',
          })
          .then(async (result) => {
            if (result.isConfirmed) {
              Swal.fire({
                title: 'Loading...',
              });
              Swal.showLoading();
              var tr = $(this).closest('tr');
              var id = tr.attr('propId');

              if (!id) return Alert.error('Id capture fail');
              let res = await dServer.restorePass({ id });
              if (res.success) {
                tr.remove();
                Swal.fire('Restored!', 'Your password was restored.', 'success');
              }
              if (res.error) Alert.error(res.error);
            }
          });
      } else {
        swal
          .fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!',
          })
          .then(async (result) => {
            if (result.isConfirmed) {
              Swal.fire({
                title: 'Loading...',
              });
              Swal.showLoading();
              var tr = $(this).closest('tr');
              var id = tr.attr('propId');

              if (!id) return Alert.error('Id capture fail');
              let res = await dServer.deletePass({ id });
              if (res.success) {
                tr.remove();
                Swal.fire('Deleted!', 'Your password has been deleted.', 'success');
              }
              if (res.error) Alert.error(res.error);
            }
          });
      }
    });

    $(document).on('click', '.save-row', async function (e) {
      var tr = $(this).closest('tr');
      var stock = parseInt(tr.find('.stock-row').val());
      var coupon = tr.find('.coupon-row').val();
      var expiration_date = tr.find('.expiration-row').val();
      if (!coupon) coupon = null;
      var type = tr.find('.type-text').text();
      var id = tr.attr('propId');

      if (!id) return Alert.error('Id capture fail');

      let res = await dServer.saveStock({ id, type, stock, coupon, expiration_date });
      if (res.success) Alert.success(res.success);
      if (res.error) Alert.error(res.error);
    });

    const addPass = $('#add-pass-btn');
    addPass.on('click', async function (e) {
      swal
        .fire({
          title: 'Multiple inputs',
          html:
            '<input id="swal-input1" placeholder="Password" class="swal2-input">' +
            '<input id="swal-input2" placeholder="Stock" class="swal2-input">' +
            '<input type="text" id="swal-input3" placeholder="Coupon" class="input3-input">' +
            '<input type="datetime-local" id="swal-input4" placeholder="Expiration Date" class="input4-input">',
          preConfirm: function () {
            return new Promise(function (resolve) {
              resolve([
                $('#swal-input1').val(),
                $('#swal-input2').val(),
                $('#swal-input3').val(),
                $('#swal-input4').val(),
              ]);
            });
          },
          onOpen: function () {
            $('#swal-input1').focus();
          },
        })
        .then(async function (result) {
          let items = result.value;
          let password = items[0];
          let stock = items[1];
          let coupon = items[2];
          let expiration_date = items[3];
          if (!password) return Alert.error('No password');
          if (!stock) return Alert.error('No stock');
          if (isNaN(stock)) return Alert.error('Stock is not a number');

          swal.showLoading();

          let res = await dServer.saveStock({ id: null, type: password, stock, coupon, expiration_date });
          if (res.success) Alert.success(res.success);
          if (res.error) return Alert.error(res.error);

          addItemRowPass(res.id, res.type, res.stock, 0);
        })
        .catch(swal.noop);
    });
  }

  function dashboardInstance({
    avatar,
    discriminator,
    email,
    customer_email,
    phone,
    flags,
    id,
    locale,
    mfa_enabled,
    public_flags,
    username,
    verified,
    key,
    type,
    isAdmin,
    stripe_sub,
    card_info,
    autoCheckoutLink,
  }) {
    if (isAdmin) {
      document.location.href = adminBoard.value;
    } else {
      if (!webConstruction || webConstruction.error || webConstruction.status == true) {
        return window.location.replace('./under-construction.html');
      }
    }
    if (!key) dServer.submitKey();

    let freeCustomer = false;
    if (stripe_sub == 'no_stripe') {
      freeCustomer = true;
    }

    if (avatar) {
      const discordProfileLink = `https://cdn.discordapp.com/avatars/${id}/${avatar}.jpg`;
      $('#discord-profile-img').attr('src', discordProfileLink);
    }

    const logoutBtn = $('#logout');
    logoutBtn.on('click', () => {
      eraseCookie('discord-token');
      eraseCookie('admin-token');
      Alert.redirection(indexPath.value, 'Closing session', 'Redirecting to Home in <b></b> milliseconds.');
    });
    $('#discord-username').text(`${username}#${discriminator}`);
    $('#user-email').text(email);
    $('#user-email-input').val(email);
    $('#license-key').text(key);
    $('#membership-type').text(type);
    $('#strip-id').text(stripe_sub);
    if (card_info) {
      $('#sub-status').text(card_info.currentStatus);
    } else if (freeCustomer) {
      $('#sub-status').text('FREE');
      $('#edit-card').attr('disabled', true);
    }

    $('#phone-number').text(phone);
    $('#phone-number-input').val(phone);

    if (card_info) {
      let { last4, exp_month, exp_year } = card_info;
      $('#cc-number').val(`**** **** **** ${last4}`);
      $('#cc-expiry').val(`${exp_month}/${exp_year}`);
      $('#cc-cvv').val('***');
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

    const editBtn = $('.edit-btn');
    editBtn.on('click', function (event) {
      const t = $(this);
      console.log(`#${t.attr('target1')}`);
      const text = $(`#${t.attr('target1')}`);
      const input = $(`#${t.attr('target2')}`);
      const saveBtn = $(`#${t.attr('saveBtn')}`);
      if (text.is(':visible')) {
        text.hide();
        input.show();
        saveBtn.prop('disabled', false);
        s = false;
      } else {
        saveBtn.prop('disabled', true);
        text.show();
        input.hide();
        s = true;
      }
      event.preventDefault();
    });

    const editCard = $('#edit-card');
    const inputDisableCard = $('.input-card-disabled');
    const cardElement = $('#card-element');
    const saveBtnCard = $('#saveBtnC');
    editCard.on('click', function (e) {
      console.log('EDIT CARD');
      e.preventDefault();
      const t = $(this);
      if (inputDisableCard.is(':visible')) {
        inputDisableCard.hide();
        cardElement.show();
        saveBtnCard.prop('disabled', false);
      } else {
        cardElement.hide();
        inputDisableCard.show();
        saveBtnCard.prop('disabled', true);
      }
    });

    const downloadFile = $('.download-links.download-file');
    downloadFile.on('click', function (e) {
      const el = $(this).attr('id');
      if (el == 'store-link') return;
      e.preventDefault();
      swal.fire({
        title: 'Downloading file..',
        text: 'Do not close this window',
        allowEscapeKey: false,
        closeOnClickOutside: false,
      });
      swal.showLoading();
      dServer.downloadFile(el).then((res) => {
        console.log('RESPONSE::', res);
        if (res.error)
          return Alert.errorHTML(
            'There is currently not a download available, #' + el + ' will update as soon as possible'
          );
        try {
          const url = window.URL.createObjectURL(new Blob([res.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', res.headers['file-name']);
          document.body.appendChild(link);
          link.click();
          swal.close();
        } catch (e) {
          Alert.error(e.message);
        }
      });
    });

    /** Join Discord Button */
    const joinDiscordBtn = $('#join-discord');
    joinDiscordBtn.on('click', function (e) {
      console.log('JOIN DISCORD');
      e.preventDefault();
      const t = $(this);
      swal.fire({
        title: 'Joining server..',
        text: 'Do not close this window',
        allowEscapeKey: false,
        closeOnClickOutside: false,
      });
      swal.showLoading();
      dServer.getUserInfo().then((res) => {
        if (res.error) Alert.error(res.error);
        let { join, addRole } = res;
        if (!join && !addRole) {
          return Alert.success('You are already part of the server and have the role');
        }
        if (join && join.error) {
          Alert.error(join.error);
        } else if (addRole && addRole.error) {
          Alert.error(addRole.error);
        } else {
          let msg = [];
          if (join && join.success) {
            msg.push('You joined the server and role was added');
          } else if (addRole && addRole.success) {
            msg.push('The role was given to your user');
          }
          if (msg.length) {
            Alert.success(msg.join('\n'));
          } else {
            Alert.success('You are already part of the server and have the role');
          }
        }
      });
    });

    const saveMailForm = $('#save-email-form');
    saveMailForm.submit(function (event) {
      event.preventDefault();
      const email = $('#user-email-input').val();
      if (!email) return Alert.error('No email input');
      if (!validateEmail(email)) return Alert.error('Email invalid');

      dServer.updateEmail({ email }).then((res) => {
        if (res.success) {
          $('#user-email').text(email);
        }
      });
      $('#user-email').show();
      $('#user-email-input').hide();
      $('#save-email').prop('disabled', true);
    });

    $('#user-email-input').keypress(function (event) {
      if (event.keyCode == 13 && !event.shiftKey) {
        event.preventDefault();
        saveMailForm.submit();
        return false;
      }
    });

    const savePhoneForm = $('#save-phone-form');
    savePhoneForm.submit(function (event) {
      event.preventDefault();
      const phone = $('#phone-number-input').val();
      if (!phone) return Alert.error('No phone input');

      dServer.updatePhone({ phone }).then((res) => {
        if (res.success) {
          $('#phone-number').text(phone);
        }
      });
      $('#phone-number').show();
      $('#phone-number-input').hide();
      $('#save-phone').prop('disabled', true);
    });

    $('#phone-number-input').keypress(function (event) {
      if (event.keyCode == 13 && !event.shiftKey) {
        event.preventDefault();
        savePhoneForm.submit();
        return false;
      }
    });
  }

  function generateRow({ id, discordMember, email, type, reedem_key, status }, index) {
    let disabledString = email == 'No email';
    let disabled = '';
    if (disabledString) {
      disabled = 'disabled';
    }

    let html = `<tr id="adminTable-${id}">
            <td style="display:none" class="id-row" class="text-center">${id}</td>
            <td class="text-center">${index + 1}</td>
            <td>${discordMember}</td>
            <td><span class="email-span" >${email}</span>
                <input class="input-mail" style="display:none" value="${email}" required>
            </td>
            <td>${type}</td>
            <td class="key-row" >${reedem_key}</td>
            <td>${status}</td>`;
    html += `<td class="td-actions text-right">
                <button type="button" rel="tooltip"
                    class="edit-btn-admin btn btn-default btn-sm btn-icon" title="Edit">
                    <i class="tim-icons icon-pencil"></i>
                </button>
                <button disabled type="button" rel="tooltip"
                    class="saveBtn btn btn-success btn-sm btn-icon" title="Save Changes">
                    <i class="tim-icons icon-check-2"></i>
                </button>
                <button type="button" rel="tooltip"
                    class="disable-row btn btn-danger btn-sm btn-icon" title="Cancel Membership">
                    <i class="tim-icons icon-simple-remove"></i>
                </button>
                <button type="button" rel="tooltip" ${disabled}
                    class="send-key btn btn-success btn-sm btn-icon" title="Send Key To User">
                    <i class="tim-icons icon-send"></i>
                </button>
            </td>
        </tr>`;
    return $(html)[0];
  }

  async function loadTable() {
    swal.fire({
      title: 'Loading Admin Panel..',
      text: 'Will close once finished',
      allowEscapeKey: false,
      closeOnClickOutside: false,
    });
    swal.showLoading();

    let adminTable = await dServer.getAdminTable();
    if (adminTable.error) return Alert.error(adminTable.error);

    const table = $('#admin-table').DataTable();
    swal.close();
    return { table, adminTable };
  }

  async function adminInstance({
    avatar,
    discriminator,
    email,
    phone,
    flags,
    id,
    locale,
    mfa_enabled,
    public_flags,
    username,
    verified,
    key,
    type,
    isAdmin,
    adminToken,
  }) {
    console.log('ADMIN INSTANCE');
    if (!isAdmin) document.location.href = dashBoard.value;
    console.log('IS ADMIN::', isAdmin);
    eraseCookie('admin-token');
    createCookie('admin-token', adminToken, 7);

    let { table, adminTable } = await loadTable();

    console.log('Get password');
    dServer.getPasswords().then((res) => {
      passwordHandler(res);
    });

    $('#toggle-event').change(async function () {
      const checked = $(this).prop('checked');
      console.log('CHANGED::', checked);
      if (checked != null) {
        let res = await dServer.underConstruction({ status: checked });
        if (res.error) Alert.error(res.error);
      }
    });

    $('#toggle-password').change(async function () {
      $('#tbody-pass').empty();
      const checked = $(this).prop('checked');
      if (checked != null) {
        let resPass;
        if (checked == true) {
          resPass = (await dServer.getPasswords()).resPass;
        } else {
          resPass = (await dServer.getDeletedPasswords()).resPass;
        }
        resPass.forEach(({ type, stock, status, id, used, coupon, expiration_date }, index) => {
          if (index > 0) {
            addItemRowPass(id, type, stock, used, coupon, expiration_date);
          }
        });
      }
    });

    async function toggleStatus() {
      let { status, error } = await dServer.underConstruction({ status: null });
      console.log('STATUS TOGGLE::', status, error);
      if (!status && error) {
        return Alert.error(error);
      }
      let turn = status ? 'on' : 'off';
      $('#toggle-event').bootstrapToggle(turn);
    }

    toggleStatus();

    const logout = $('#logout');
    logout.on('click', function (e) {
      eraseCookie('discord-token');
      location.reload();
    });

    //for (let index = 0; index < adminTable.length; index++) {
    //const el = adminTable[index];

    const keyGen = $('#keyGenBtn');
    const selectKey = $('#key-type');
    keyGen.on('click', function (e) {
      let selectedOption = selectKey.val();
      let nameOption = $('#key-type option:selected').text();
      swal
        .fire({
          title: `You are about to generate a ${nameOption} key`,
          text: `This key will be of the type ${nameOption}`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes, generate it!',
        })
        .then(async (result) => {
          if (result.value) {
            swal.showLoading();
            let res = await dServer.generateKey(selectedOption);
            if (res.error) return Alert.error(res.error);

            $('.keygen-field').val(res.key);

            let item = {
              id: res.id,
              discordMember: 'No Discord',
              email: 'No email',
              type: res.type,
              reedem_key: res.key,
              status: 'FREE',
            };
            adminTable.push(item);
            let index = adminTable.length - 1;
            table.row.add(generateRow(item, index)).draw();

            console.log(res);
          }
        });
    });

    adminTable.forEach(({ id, discord_id, discordMember, reedem_key, stripe_sub, type, status, email }, index) => {
      if (!discordMember) discordMember = discord_id;
      if (!discord_id) discordMember = 'No Discord';
      if (!email) email = 'No email';
      table.row.add(generateRow({ id, discordMember, email, type, reedem_key, status }, index)).draw();
    });
    //}

    /** Disable Row */

    $(document).on('click', '.disable-row', function (e) {
      $(this).off('click');
      var tr = $(this).closest('tr');
      var id = tr.find('.id-row');
      var idString = id.text();
      const item = adminTable.find((el) => {
        return el.id == idString;
      });
      const key = item.reedem_key;
      const id_user = item.discord_id;
      const sub = item.stripe_sub;
      swal
        .fire({
          title: `You are about to delete the key from Row ${idString}`,
          text: `This action is permanent!`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes, delete it!',
        })
        .then(async (result) => {
          if (result.value) {
            swal.showLoading();
            let res = await dServer.disableKey(key, sub, id_user);
            if (res.error) return Alert.error(res.error);

            if (res.success) Alert.success(res.success);
            $('#admin-table').dataTable().api().row(tr).remove().draw();
            //table.row(1).delete();
            //let res =  await dServer.deleteKey(idString);
            //if(res.error) return Alert.error(res.error);
          }
        });
    });

    $(document).on('click', '.edit-btn-admin', function (e) {
      var tr = $(this).closest('tr');
      var saveBtn = tr.find('.saveBtn');
      var emailSpan = tr.find('.email-span');
      const idString = tr.find('.id-row').text();
      var inputEmail = tr.find('.input-mail');
      let sendKey = tr.find('.send-key');
      if (saveBtn.is(':disabled')) {
        emailSpan.hide();
        inputEmail.show();
        saveBtn.prop('disabled', false);

        saveBtn.on('click', async function (e) {
          const valEmailNew = inputEmail.val();

          emailSpan.text(valEmailNew);
          emailSpan.show();
          inputEmail.hide();

          if (!valEmailNew) return Alert.error('No email');
          if (!validateEmail(valEmailNew)) return Alert.error('Invalid email');

          swal.fire({
            title: 'Changing email..',
            text: 'Do not close this window',
            allowEscapeKey: false,
            closeOnClickOutside: false,
          });
          swal.showLoading();

          const item = adminTable.find((el) => {
            return el.id == idString;
          });

          console.log(item);

          let customer = item.customer;
          let email = valEmailNew;
          let discord_id = item.discord_id;
          let key = item.reedem_key;

          dServer.updateCustomer({ email, customer, discord_id, key }).then((resUp) => {
            if (resUp.error) return Alert.error(resUp.error);
            if (resUp.success) {
              sendKey.prop('disabled', false);
              return Alert.success(resUp.success);
            }
          });
        });
      } else {
        saveBtn.prop('disabled', true);
        emailSpan.show();
        inputEmail.hide();
        saveBtn.off('click');
      }
    });

    $(document).on('click', '.send-key', function (e) {
      $(this).off('click');
      var tr = $(this).closest('tr');
      var email = tr.find('.email-span').text();
      const key = tr.find('.key-row').text();
      //const idString = tr.find(".id-row").text();
      //var inputEmail =  tr.find(".input-mail");

      swal
        .fire({
          title: `You are about send a key`,
          html: `Email: ${email}<br>Key: ${key}`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes, mail it!',
        })
        .then(async (result) => {
          if (result.value) {
            swal.fire({
              title: 'Sending email with key..',
              text: 'Do not close this window',
              allowEscapeKey: false,
              closeOnClickOutside: false,
            });
            swal.showLoading();
            let result = await dServer.sendEmail(email, key);
            if (result.error) return Alert.error(result.error);

            return Alert.success(result.success);
          }
        });
    });
  }

  function disableBtn(btn) {
    btn.attr('disabled', true);
    btn.text('Out of Stock');
    btn.addClass('out-of-stock');
  }

  function enableBtn(btn, textEnabled) {
    btn.text(textEnabled);
    btn.attr('disabled', false);
  }

  function processStatus(status, amount, btn, secondBtn) {
    if (!status) {
      disableBtn(btn);
      disableBtn(secondBtn);
    } else {
      enableBtn(btn, `Purchase $${amount} Monthly`);
      enableBtn(secondBtn, `Purchase`);
    }
  }

  function isLoaded() {
    console.log('LOADING FINISHED');
    body.addClass('loaded');
  }

  function formEvent() {
    const idForm = '#contact-form';
    $(idForm).submit(async function (event) {
      event.preventDefault();
      const $inputs = $('#contact-form :input');
      var values = {};
      let errors = [];
      $inputs.each(function () {
        const val = $(this).val();
        values[this.name] = val;
        if (this.name != 'submit') {
          if (val == '' || val.trim() == '') {
            errors.push(`Missing field ${this.name}`);
          }
          if (val && this.name == 'email') {
            const isValid = validateEmail(val);
            if (!isValid) errors.push(`Email is not valid`);
          }
        }
      });
      if (errors.length) {
        Alert.errorHTML(errors.join('<br>'));
        return;
      }
      $('#contact-form [name="submit"]').prop('disabled', true);
      console.log('VALUES::', values);
      const send = await dServer.contactEmail(values);
      if (send.error)
        Alert.errorHTML(
          'Your email has failed to send, please manually send your message to support@elixirlabs.xyz, we apologize for the inconvenience'
        );
      if (send.success) {
        Alert.success(
          'Your message has successfully reached our team. We aim to respond as soon as we can! Thank you for your continued support.'
        );
        $inputs.each(function () {
          $(this).val('');
        });
      }
      $('#contact-form [name="submit"]').prop('disabled', false);
      return;
    });
  }

  let globalPass = '';

  function getPasswordFromUrl() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const password = urlParams.get('password');
    return password;
  }

  function getCurrentPass() {
    return $('#pass').val();
  }

  async function indexInstance(userInfo) {
    formEvent();
    if (!userInfo || !userInfo.isAdmin) {
      if (!webConstruction || webConstruction.error || webConstruction.status == true) {
        return window.location.replace('./under-construction.html');
      }
    }
    var socket = io.connect(api);
    console.log('INDEX INSTANCE');
    let password = getPasswordFromUrl();
    if (password) {
      $('.pass-block').show();
      $('#pass').val(password);
    }
    let priceStripe = await dServer.stripeSub(password);
    let { amount, status, passwordRequired } = priceStripe;
    console.log('RESPONSE::', amount);
    if (amount) {
      var btn = $('#stripeModal #btn-paid');
      var secondBtn = $('[data-target="#stripeModal"]');
      processStatus(status, amount, btn, secondBtn);
      /*socket.on('stock', function (data) {
        status = data.stock;
        processStatus(status, amount, btn, secondBtn);
      });*/
      socket.on('underConstruction', function (data) {
        if (data == true) {
          Alert.redirection('/under-construction.html', 'We are starting maintenance', 'Redirecting...');
        }
      });
      secondBtn.on('click', (e) => {
        if (passwordRequired) {
          //Alert.warning('Password will be required to purchase');
        }
      });
      isLoaded();
    }

    const errColor = 'rgb(253, 93, 147)';
    const successColor = 'rgb(0, 242, 195)';
    const elErr = $('#errCoupon');
    $("[name='coupon']").on('change paste keyup', function () {
      const value = $(this).val();
      elErr.removeAttr('style');
      if (!value) {
        elErr.hide();
        return;
      }
      var el = $(this);
      elErr.show();
      elErr.attr('class', '');
      elErr.text('Verifying coupon');
      dServer.stripeCoupon({ id: value, password: getCurrentPass() }).then((res) => {
        elErr.show();
        if (res.error) {
          elErr.text('Coupon is not valid');
          elErr.attr('class', 'text-danger');
          $(this).css({ color: errColor });
          if (!el.hasClass('error')) {
            $(this).addClass('error');
          }
          $(this).removeClass('success');
        } else {
          elErr.text(`${res.percent_off}% OFF Coupon`);
          elErr.attr('class', 'text-success');
          $(this).css({ color: successColor });
          if (!el.hasClass('success')) {
            $(this).addClass('success');
          }
          $(this).removeClass('error');
        }
        console.log(res);
      });
    });
  }
  async function start() {
    webConstruction = await dServer.web_status();

    function isIndexF(path) {
      let toReturn = false;
      const find = home.find((el) => {
        return el.value == path;
      });
      if (find) toReturn = true;
      return toReturn;
    }
    /** Discord Server */
    const path = window.location.pathname;
    console.log('Path::', path);

    const isIndex = isIndexF(path);

    let cPath = paths.find((el) => {
      return el.value == path;
    });
    // if(cPath == undefined) {
    //     cPath = indexPath;
    // }
    const cookieDiscord = readCookie('discord-token');
    console.log('COOKIE::', cookieDiscord);
    if (!cookieDiscord && userPaths.includes(cPath.name)) {
      document.location.href = indexPath.value;
    } else if (cookieDiscord) {
      console.log('COOKIE DISCORD');
      let userInfo = await dServer.getUserInfo();
      let { error, username, error_description } = userInfo;
      if (error_description) error = error_description;
      if (error) {
        eraseCookie('discord-token');
        eraseCookie('admin-token');
        Alert.error('Token Expired, please login again');
        if (cPath.name == 'dashboard') {
          Alert.redirection(indexPath.value, 'Auth Failed!', 'Redirecting to Home in <b></br> milliseconds.');
        }
      }
      if (isIndex) {
        /*  Define Dashboard link **/
        const htmlLink = $('#dashboard-link');
        htmlLink.attr('href', dashBoard.value);
        indexInstance(userInfo);
      } else if (cPath.name == 'dashboard') {
        dashboardInstance(userInfo);
        isLoaded();
      } else if (cPath.name == 'admin') {
        console.log('ADMIN');
        adminInstance(userInfo);
        isLoaded();
      }
    } else {
      /** Verify Code in URL PARAM */
      const resAuth = await dServer.authDiscord();
      if (resAuth) {
        if (resAuth.error) Alert.error(resAuth.error);

        if (resAuth.success)
          Alert.redirection('./dashboard.html', 'Auth Success!', 'Redirecting to Dashboard in <b></b> milliseconds.');
      } else {
        const { link, error } = await dServer.getLink();
        if (error) Alert.error(error);

        const htmlLink = $('#dashboard-link');
        htmlLink.attr('href', link);
        indexInstance();
      }
    }
  }

  start();
});
