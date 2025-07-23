namespace LudoAdmin.Service
{
    using SharedCode;
    using Microsoft.AspNetCore.SignalR.Client;
    using SharedCode.Constants;

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
                .WithUrl(GlobalConstants.HubUrl + "LudoHub")
                .WithAutomaticReconnect()
                .Build();

            await _hubConnection.StartAsync();
            // Connected!
        }
        public async Task<PlayerInfo> SendUserLoggedInEvent(string authToken)
        {
            if(_hubConnection == null || _hubConnection.State != HubConnectionState.Connected)
                throw new InvalidOperationException("Hub connection is not established.");
            PlayerInfo player = await _hubConnection.InvokeAsync<PlayerInfo>("GoogleAuthentication", authToken, "", "").ConfigureAwait(false);
            return player;
        }
        public async ValueTask DisposeAsync()
        {
            if (_hubConnection != null)
                await _hubConnection.DisposeAsync();
        }
    }
}