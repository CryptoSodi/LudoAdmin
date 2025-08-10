using System;
using System.Buffers.Text;

namespace LudoAdmin.Service
{
    internal class GlobalConstants
    {
        public static readonly bool Debug = false;
        static GlobalConstants()
        {
            Url = Debug ? "https://localhost" : "https://www.ludocities.com";
            HubUrl = Debug ? "https://localhost:8085/" : "https://www.ludocities.com/";
        }
        public static string HubUrl { get; internal set; }
        public static string Url { get; private set; }
    }
}