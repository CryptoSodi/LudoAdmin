namespace LudoAdmin.Service
{
    using Microsoft.AspNetCore.SignalR.Client;
    using SharedCode;
    using SharedCode.Constants;
    using System.Net.Sockets;
    using static LudoAdmin.Pages.Games;

    public class HubService : IAsyncDisposable
    {
        private HubConnection? _hubConnection;
        public bool IsConnected => _hubConnection?.State == HubConnectionState.Connected;

        public async Task StartAsync()
        {
            if (_hubConnection != null &&
            (_hubConnection.State == HubConnectionState.Connected ||
             _hubConnection.State == HubConnectionState.Connecting))
            {
                return; // already connecting or connected
            }

            _hubConnection = new HubConnectionBuilder()
                .WithUrl(GlobalConstants.HubUrl + "AdminHub")
                .WithAutomaticReconnect()
                .Build();

            await _hubConnection.StartAsync();
            // Connected!
        }
        public async Task<PlayerInfo> SendUserLoggedInEvent(string authToken)
        {
        retry:
            if (_hubConnection == null || _hubConnection.State != HubConnectionState.Connected)
            {
               await Task.Delay(100);
                goto retry;
            }   
            PlayerInfo player = await _hubConnection.InvokeAsync<PlayerInfo>("GoogleAuthentication", authToken, "", "").ConfigureAwait(false);
            return player;
        }
        public async Task<PlayerInfo> UserConnectedSetID(string authToken)
        {
            if (_hubConnection == null || _hubConnection.State != HubConnectionState.Connected)
                throw new InvalidOperationException("Hub connection is not established.");
            PlayerInfo player = await _hubConnection.InvokeAsync<PlayerInfo>("UserConnectedSetID", authToken).ConfigureAwait(false);
            return player;
        }
        public async Task<List<LudoClient.Models.Game>> GetGame(string authToken)
        {
            List<LudoClient.Models.Game> games = await _hubConnection.InvokeAsync<List<LudoClient.Models.Game>>("GetGame", authToken, false).ConfigureAwait(false);
            return games?.Where(g => g.State == "Completed").ToList() ?? new List<LudoClient.Models.Game>();
        }
        public async ValueTask DisposeAsync()
        {
            if (_hubConnection != null)
                await _hubConnection.DisposeAsync();
        }
    }
}