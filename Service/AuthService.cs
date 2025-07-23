namespace LudoAdmin.Service
{
    using Microsoft.JSInterop;
    using System.Threading.Tasks;

    public class AuthService
    {
        private readonly IJSRuntime _js;

        public AuthService(IJSRuntime js)
        {
            _js = js;
        }

        public async Task SetAccessTokenAsync(string token)
        {
            await _js.InvokeVoidAsync("localStorage.setItem", "access_token", token);
        }

        public async Task<string> GetAccessTokenAsync()
        {
            return await _js.InvokeAsync<string>("localStorage.getItem", "access_token");
        }

        public async Task RemoveAccessTokenAsync()
        {
            await _js.InvokeVoidAsync("localStorage.removeItem", "access_token");
        }

        public async Task<bool> IsLoggedInAsync()
        {
            var token = await GetAccessTokenAsync();
            return !string.IsNullOrWhiteSpace(token);
        }
    }

}
