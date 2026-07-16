package com.educontrol.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(WifiDirectPlugin.class);
        registerPlugin(BluetoothLocalSyncPlugin.class);
        super.onCreate(savedInstanceState);
    }
}

