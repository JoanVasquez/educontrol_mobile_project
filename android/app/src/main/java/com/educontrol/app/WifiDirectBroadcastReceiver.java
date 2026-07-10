package com.educontrol.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.net.wifi.p2p.WifiP2pManager;

public class WifiDirectBroadcastReceiver extends BroadcastReceiver {
    private final WifiP2pManager manager;
    private final WifiP2pManager.Channel channel;
    private final WifiDirectPlugin plugin;

    public WifiDirectBroadcastReceiver(WifiP2pManager manager, WifiP2pManager.Channel channel, WifiDirectPlugin plugin) {
        this.manager = manager;
        this.channel = channel;
        this.plugin = plugin;
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        String action = intent.getAction();

        if (WifiP2pManager.WIFI_P2P_PEERS_CHANGED_ACTION.equals(action)) {
            if (manager != null && channel != null && plugin.getPeerListListener() != null) {
                manager.requestPeers(channel, plugin.getPeerListListener());
            }
        }
    }
}
