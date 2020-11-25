async function passwordMain() {
  const cookieDiscord = readCookie('discord-token');
  if (cookieDiscord) {
    let userInfo = await dServer.getUserInfo();
    const { error, username, error_description } = userInfo;
    if (error_description) error = error_description;
    if (error) {
      eraseCookie('discord-token');
      eraseCookie('admin-token');
      Alert.error('Token Expired, please login again');
      if (cPath.name == 'dashboard') {
        Alert.error('Auth Failed');
      }
    } else {
      const htmlLink = $('#adminLogin');
      htmlLink.attr('href', dashBoard.value);
    }
  } else {
    /** Verify Code in URL PARAM */

    dServer.authDiscord();

    const { link, error } = await dServer.getLink();
    if (error) Alert.error(error);

    const htmlLink = $('#adminLogin');
    htmlLink.attr('href', link);
  }
}

passwordMain();
