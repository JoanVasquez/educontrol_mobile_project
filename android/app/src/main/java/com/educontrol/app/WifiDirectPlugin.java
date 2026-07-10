package com.educontrol.app;

import android.Manifest;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.net.wifi.p2p.WifiP2pConfig;
import android.net.wifi.p2p.WifiP2pDevice;
import android.net.wifi.p2p.WifiP2pDeviceList;
import android.net.wifi.p2p.WifiP2pManager;
import android.util.Base64;

import androidx.core.content.ContextCompat;
import androidx.core.content.FileProvider;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@CapacitorPlugin(
    name = "WifiDirect",
    permissions = {
        @Permission(strings = {
            Manifest.permission.ACCESS_FINE_LOCATION,
            Manifest.permission.ACCESS_WIFI_STATE,
            Manifest.permission.CHANGE_WIFI_STATE,
            Manifest.permission.INTERNET
        }, alias = "wifi")
    }
)
public class WifiDirectPlugin extends Plugin {
    private WifiP2pManager manager;
    private WifiP2pManager.Channel channel;
    private WifiDirectBroadcastReceiver receiver;
    private WifiP2pManager.PeerListListener peerListListener;
    private final List<WifiP2pDevice> peers = new ArrayList<>();
    private PluginCall pendingPeerCall;

    @Override
    public void load() {
        Context context = getContext();
        if (context != null) {
            manager = (WifiP2pManager) context.getSystemService(Context.WIFI_P2P_SERVICE);
            if (manager != null) {
                channel = manager.initialize(context, context.getMainLooper(), null);
                peerListListener = new WifiP2pManager.PeerListListener() {
                    @Override
                    public void onPeersAvailable(WifiP2pDeviceList peerList) {
                        peers.clear();
                        Collection<WifiP2pDevice> list = peerList.getDeviceList();
                        if (list != null) {
                            peers.addAll(list);
                        }

                        JSObject result = new JSObject();
                        result.put("devices", devicesToJsonArray(peers));

                        if (pendingPeerCall != null) {
                            pendingPeerCall.resolve(result);
                            pendingPeerCall = null;
                        }
                        notifyListeners("peerUpdate", result, true);
                    }
                };
                receiver = new WifiDirectBroadcastReceiver(manager, channel, this);
            }
        }
    }

    @Override
    public void handleOnStart() {
        super.handleOnStart();
        if (receiver != null && getContext() != null) {
            IntentFilter filter = new IntentFilter();
            filter.addAction(WifiP2pManager.WIFI_P2P_STATE_CHANGED_ACTION);
            filter.addAction(WifiP2pManager.WIFI_P2P_PEERS_CHANGED_ACTION);
            filter.addAction(WifiP2pManager.WIFI_P2P_CONNECTION_CHANGED_ACTION);
            filter.addAction(WifiP2pManager.WIFI_P2P_THIS_DEVICE_CHANGED_ACTION);
            getContext().registerReceiver(receiver, filter);
        }
    }

    @Override
    public void handleOnStop() {
        super.handleOnStop();
        if (receiver != null && getContext() != null) {
            try {
                getContext().unregisterReceiver(receiver);
            } catch (IllegalArgumentException ignored) {
            }
        }
    }

    @PluginMethod
    public void requestPermissions(PluginCall call) {
        if (hasWifiPermissions()) {
            call.resolve();
            return;
        }
        requestPermissionForAlias("wifi", call, "permissionCallback");
    }

    @PermissionCallback
    private void permissionCallback(PluginCall call) {
        if (hasWifiPermissions()) {
            call.resolve();
        } else {
            call.reject("Permission denied");
        }
    }

    @PluginMethod
    public void discoverPeers(PluginCall call) {
        if (!hasWifiPermissions()) {
            call.reject("permissions denied");
            return;
        }

        if (manager == null || channel == null) {
            call.reject("Wi-Fi Direct unsupported or unavailable");
            return;
        }

        pendingPeerCall = call;
        manager.discoverPeers(channel, new WifiP2pManager.ActionListener() {
            @Override
            public void onSuccess() {
                requestPeerList();
            }

            @Override
            public void onFailure(int reason) {
                if (pendingPeerCall != null) {
                    pendingPeerCall.reject("Discovery failed: " + reason);
                    pendingPeerCall = null;
                }
            }
        });
    }

    @PluginMethod
    public void getPeers(PluginCall call) {
        JSObject result = new JSObject();
        result.put("devices", devicesToJsonArray(peers));
        call.resolve(result);
    }

    @PluginMethod
    public void connect(PluginCall call) {
        if (!hasWifiPermissions()) {
            call.reject("permissions denied");
            return;
        }

        String deviceAddress = call.getString("deviceAddress");
        if (deviceAddress == null) {
            call.reject("deviceAddress required");
            return;
        }

        WifiP2pDevice targetDevice = null;
        for (WifiP2pDevice peer : peers) {
            if (deviceAddress.equals(peer.deviceAddress)) {
                targetDevice = peer;
                break;
            }
        }

        if (targetDevice == null) {
            call.reject("Device not found");
            return;
        }

        final String deviceName = targetDevice.deviceName;
        WifiP2pConfig config = new WifiP2pConfig();
        config.deviceAddress = targetDevice.deviceAddress;
        manager.connect(channel, config, new WifiP2pManager.ActionListener() {
            @Override
            public void onSuccess() {
                JSObject result = new JSObject();
                result.put("success", true);
                result.put("message", "Connecting to " + deviceName);
                call.resolve(result);
            }

            @Override
            public void onFailure(int reason) {
                call.reject("Connect failed: " + reason);
            }
        });
    }

    @PluginMethod
    public void sendPhoto(PluginCall call) {
        String base64 = call.getString("base64");
        String filename = call.getString("filename");

        if (base64 == null || filename == null) {
            call.reject("base64 and filename required");
            return;
        }

        try {
            File imageFile = saveBase64Image(base64, filename);
            Context context = getContext();
            if (context == null) {
                call.reject("Android context unavailable");
                return;
            }

            Uri contentUri = FileProvider.getUriForFile(context, context.getPackageName() + ".fileprovider", imageFile);
            Intent shareIntent = new Intent(Intent.ACTION_SEND);
            shareIntent.setType("image/*");
            shareIntent.putExtra(Intent.EXTRA_STREAM, contentUri);
            shareIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);

            Intent chooser = Intent.createChooser(shareIntent, "Compartir foto");
            chooser.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            context.startActivity(chooser);

            JSObject result = new JSObject();
            result.put("success", true);
            result.put("message", "Share intent launched");
            call.resolve(result);
        } catch (Exception e) {
            call.reject("Photo share failed: " + e.getMessage());
        }
    }

    public WifiP2pManager.PeerListListener getPeerListListener() {
        return peerListListener;
    }

    private void requestPeerList() {
        if (manager != null && channel != null && peerListListener != null) {
            manager.requestPeers(channel, peerListListener);
        }
    }

    private boolean hasWifiPermissions() {
        Context context = getContext();
        if (context == null) {
            return false;
        }
        return ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED;
    }

    private JSArray devicesToJsonArray(List<WifiP2pDevice> devices) {
        JSArray array = new JSArray();
        for (WifiP2pDevice device : devices) {
            JSObject object = new JSObject();
            object.put("deviceName", device.deviceName);
            object.put("deviceAddress", device.deviceAddress);
            array.put(object);
        }
        return array;
    }

    private File saveBase64Image(String base64, String filename) throws IOException {
        byte[] bytes = Base64.decode(base64, Base64.DEFAULT);
        File cacheDir = new File(getContext().getCacheDir(), "wifi_direct_share");
        if (!cacheDir.exists()) {
            cacheDir.mkdirs();
        }
        File file = new File(cacheDir, filename);
        try (FileOutputStream fos = new FileOutputStream(file)) {
            fos.write(bytes);
        }
        return file;
    }
}
