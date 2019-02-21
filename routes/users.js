const express = require("express");
const router = express.Router();

// Log a user out
router.get("/logout", (req, res) => {
  if (req.userContext) {
    const idToken = req.userContext.tokens.id_token
    const to = encodeURI(process.env.HOST_URL)
    const params = `id_token_hint=${idToken}&post_logout_redirect_uri=${to}`
    req.logout()
    res.redirect(`${process.env.OKTA_ORG_URL}/oauth2/default/v1/logout?${params}`)
  } else {
    res.redirect('/')
  }
});


module.exports = router;
