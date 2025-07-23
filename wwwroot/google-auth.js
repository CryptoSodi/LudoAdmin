// wwwroot/google-auth.js

window.openGoogleLoginPopup = function (url, callbackUrl) {
    const width = 500;
    const height = 600;
    const left = (screen.width / 2) - (width / 2);
    const top = (screen.height / 2) - (height / 2);

    const popup = window.open(
        url,
        "GoogleLogin",
        `width=${width},height=${height},top=${top},left=${left}`
    );

    // Listen for messages from the popup
    window.addEventListener("message", function handler(event) {
        // Security: Make sure it's from our origin
        if (event.origin === window.location.origin && event.data.type === "GoogleAuthToken") {
            // Pass the token data to Blazor
            if (window.dotNetGoogleAuthCallback) {
                window.dotNetGoogleAuthCallback.invokeMethodAsync('OnGoogleAuthSuccess', event.data.token);
            }
            window.removeEventListener("message", handler);
        }
    });
};
// Make this available as soon as the script is loaded!
window.registerGoogleAuthCallback = function (dotNetObj) {
    window.dotNetGoogleAuthCallback = dotNetObj;
};
