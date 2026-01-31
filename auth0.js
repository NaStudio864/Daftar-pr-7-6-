<script src="https://cdn.auth0.com/js/auth0-spa-js/2.0/auth0-spa-js.production.js"></script>
<script>
let auth0Client;

async function initAuth0(){
  auth0Client = await createAuth0Client({
    domain: "dev-e8naf0muxd0jp7mt.us.auth0.com",
    clientId: "YagaSYc4voTkKG2Mry1qGtYXTvly1fX5",
    authorizationParams: {
      redirect_uri: window.location.origin
    }
  });

  if (location.search.includes("code=")) {
    await auth0Client.handleRedirectCallback();
    history.replaceState({}, "", "/");
  }
}

async function loginAuth0(){
  await auth0Client.loginWithRedirect();
}

async function logoutAuth0(){
  auth0Client.logout({
    logoutParams: { returnTo: window.location.origin }
  });
}

async function getToken(){
  return await auth0Client.getTokenSilently();
}
</script>