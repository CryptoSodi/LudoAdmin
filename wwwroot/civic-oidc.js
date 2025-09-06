// ...existing imports + constants...
const OAUTH_LIB = "https://cdn.jsdelivr.net/npm/oauth4webapi@2.10.3/+esm";
const ISSUER = "https://auth.civic.com/oauth/"; // trailing slash

let oauth;

async function discover() {
    if (!oauth) oauth = await import(OAUTH_LIB);
    const issuerUrl = new URL(ISSUER);
    const res = await oauth.discoveryRequest(issuerUrl, { algorithm: "oidc" });
    return await oauth.processDiscoveryResponse(issuerUrl, res);
}

function client(clientId) {
    return { client_id: clientId, token_endpoint_auth_method: "none" };
}

export async function beginCivicLogin(clientId, redirectUri, scope = "openid email profile") {
    const as = await discover();
    const code_verifier = oauth.generateRandomCodeVerifier();
    sessionStorage.setItem("civic_code_verifier", code_verifier);
    const code_challenge = await oauth.calculatePKCECodeChallenge(code_verifier);

    const state = crypto.randomUUID?.() ?? String(Math.random());
    sessionStorage.setItem("civic_state", state);

    const authz = new URL(as.authorization_endpoint);
    authz.searchParams.set("response_type", "code");
    authz.searchParams.set("client_id", clientId);
    authz.searchParams.set("redirect_uri", redirectUri);
    authz.searchParams.set("scope", scope);
    authz.searchParams.set("code_challenge", code_challenge);
    authz.searchParams.set("code_challenge_method", "S256");
    authz.searchParams.set("state", state);

    location.assign(authz.toString());
}

export async function completeCivicLogin(clientId, redirectUri) {
    const as = await discover();
    const currentUrl = new URL(location.href);
    const state = sessionStorage.getItem("civic_state") || null;

    const params = oauth.validateAuthResponse(as, client(clientId), currentUrl, state);
    sessionStorage.removeItem("civic_state");
    if (oauth.isOAuth2Error(params)) throw new Error(params.error_description ?? params.error ?? "OAuth error");

    const code_verifier = sessionStorage.getItem("civic_code_verifier") || "";
    sessionStorage.removeItem("civic_code_verifier");

    const tokenResp = await oauth.authorizationCodeGrantRequest(as, client(clientId), params, redirectUri, code_verifier);
    const result = await oauth.processAuthorizationCodeOpenIDResponse(as, client(clientId), tokenResp);

    // NEW: stash the id_token for end-session logout
    if (result?.id_token) sessionStorage.setItem("civic_last_id_token", result.id_token);

    return {
        idToken: result.id_token,
        claims: oauth.getValidatedIdTokenClaims(result),
    };
}

// NEW: RP-initiated logout (ends Civic session then redirects back)
export async function logout(postLogoutRedirectUri) {
    const as = await discover();
    const end = as.end_session_endpoint; // if the OP publishes it
    const idToken = sessionStorage.getItem("civic_last_id_token");
    sessionStorage.removeItem("civic_last_id_token");

    if (end) {
        const url = new URL(end);
        if (idToken) url.searchParams.set("id_token_hint", idToken);
        if (postLogoutRedirectUri) url.searchParams.set("post_logout_redirect_uri", postLogoutRedirectUri);
        location.assign(url.toString());
    } else {
        // Fallback: no OP logout—just return to homepage
        if (postLogoutRedirectUri) location.assign(postLogoutRedirectUri);
    }
}

window.civicAuth = { begin: beginCivicLogin, complete: completeCivicLogin, logout };
