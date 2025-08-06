using System;
using System.Buffers.Text;

namespace LudoAdmin.Service
{
    internal class GlobalConstants
    {
        public static readonly bool Debug = true;
        static GlobalConstants()
        {
            Url = Debug ? "https://localhost" : "https://13.202.76.246";
            HubUrl = Url + ":8085/";
        }
        public static string HubUrl { get; internal set; }
        public static string Url { get; private set; }
    }
}