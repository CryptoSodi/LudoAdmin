namespace LudoAdmin.Service
{
    using Microsoft.JSInterop;
    using SharedCode.Constants;
    using System.Text.Json;
    using System.Threading.Tasks;

    public class AuthService
    {
        private readonly IJSRuntime _js;
        private const string Key = "player_info";

        public AuthService(IJSRuntime js)
        {
            _js = js;
        }

        // Save the PlayerInfo object to localStorage
        public async Task SetPlayerInfoAsync(PlayerInfo playerInfo)
        {
            var options = new JsonSerializerOptions { WriteIndented = true };
            // Optionally add for enum as string:
            options.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());

            // Serialize the whole player info object
            string playerJson = JsonSerializer.Serialize(playerInfo, options);

            await _js.InvokeVoidAsync("localStorage.setItem", Key, playerJson);
        }

        public async Task<PlayerInfo> GetPlayerInfoAsync()
        {
            var json = await _js.InvokeAsync<string>("localStorage.getItem", Key);
            if (string.IsNullOrWhiteSpace(json))
                return null;

            return JsonSerializer.Deserialize<PlayerInfo>(json);
        }

        public async Task RemoveAccessTokenAsync()
        {
            await _js.InvokeVoidAsync("localStorage.removeItem", Key);
        }

        public async Task<bool> IsLoggedInAsync()
        {
            var playerInfo = await GetPlayerInfoAsync();
            return playerInfo != null;
        }
    }
}
