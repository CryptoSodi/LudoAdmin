using SharedCode.Constants;

namespace LudoAdmin.Service
{
    public class PlayerState
    {
        public PlayerInfo? Player { get; private set; }

        public event Action? OnChange;

        public void SetPlayer(PlayerInfo? player)
        {
            Player = player;
            NotifyStateChanged();
        }

        private void NotifyStateChanged() => OnChange?.Invoke();
    }
}
