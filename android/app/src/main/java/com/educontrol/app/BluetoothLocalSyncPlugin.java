package com.educontrol.app;

import android.Manifest;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothManager;
import android.bluetooth.BluetoothSocket;
import android.content.Context;
import android.content.pm.PackageManager;
import android.os.Build;

import androidx.core.content.ContextCompat;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.Set;
import java.util.UUID;

@CapacitorPlugin(
    name = "BluetoothLocalSync",
    permissions = {
        @Permission(strings = {
            Manifest.permission.BLUETOOTH_CONNECT,
            Manifest.permission.BLUETOOTH_SCAN
        }, alias = "bluetooth")
    }
)
public class BluetoothLocalSyncPlugin extends Plugin {
    private static final UUID SERIAL_PORT_PROFILE_UUID =
        UUID.fromString("00001101-0000-1000-8000-00805F9B34FB");

    private BluetoothAdapter bluetoothAdapter;

    @Override
    public void load() {
        Context context = getContext();
        if (context == null) return;

        BluetoothManager manager = (BluetoothManager) context.getSystemService(Context.BLUETOOTH_SERVICE);
        bluetoothAdapter = manager != null ? manager.getAdapter() : BluetoothAdapter.getDefaultAdapter();
    }

    @PluginMethod
    public void requestPermissions(PluginCall call) {
        if (hasBluetoothPermissions()) {
            call.resolve();
            return;
        }

        requestPermissionForAlias("bluetooth", call, "bluetoothPermissionCallback");
    }

    @PermissionCallback
    private void bluetoothPermissionCallback(PluginCall call) {
        if (hasBluetoothPermissions()) {
            call.resolve();
        } else {
            call.reject("Permiso Bluetooth denegado.");
        }
    }

    @PluginMethod
    public void isAvailable(PluginCall call) {
        JSObject result = new JSObject();
        result.put("available", bluetoothAdapter != null && bluetoothAdapter.isEnabled() && hasBluetoothPermissions());
        call.resolve(result);
    }

    @PluginMethod
    public void discoverDevices(PluginCall call) {
        if (!ensureReady(call)) return;

        Set<BluetoothDevice> bondedDevices = bluetoothAdapter.getBondedDevices();
        JSArray devices = new JSArray();

        for (BluetoothDevice device : bondedDevices) {
            JSObject item = new JSObject();
            item.put("id", device.getAddress());
            item.put("name", device.getName() != null ? device.getName() : "Dispositivo Bluetooth");
            devices.put(item);
        }

        JSObject result = new JSObject();
        result.put("devices", devices);

        if (bondedDevices.isEmpty()) {
            result.put("message", "No hay dispositivos Bluetooth emparejados. Empareja otro equipo desde Ajustes de Android.");
        }

        call.resolve(result);
    }

    @PluginMethod
    public void connect(PluginCall call) {
        if (!ensureReady(call)) return;

        String deviceId = call.getString("deviceId");
        if (deviceId == null || deviceId.trim().isEmpty()) {
            call.reject("Selecciona un dispositivo Bluetooth.");
            return;
        }

        try {
            bluetoothAdapter.getRemoteDevice(deviceId);
            call.resolve(success("Dispositivo Bluetooth seleccionado."));
        } catch (IllegalArgumentException error) {
            call.reject("Dispositivo Bluetooth inválido.");
        }
    }

    @PluginMethod
    public void sendMessage(PluginCall call) {
        if (!ensureReady(call)) return;

        String deviceId = call.getString("deviceId");
        String message = call.getString("message");

        if (deviceId == null || deviceId.trim().isEmpty()) {
            call.reject("Selecciona un dispositivo Bluetooth.");
            return;
        }

        if (message == null || message.trim().isEmpty()) {
            call.reject("No hay datos para enviar.");
            return;
        }

        BluetoothSocket socket = null;

        try {
            BluetoothDevice device = bluetoothAdapter.getRemoteDevice(deviceId);
            bluetoothAdapter.cancelDiscovery();
            socket = device.createRfcommSocketToServiceRecord(SERIAL_PORT_PROFILE_UUID);
            socket.connect();

            OutputStream outputStream = socket.getOutputStream();
            outputStream.write(message.getBytes(StandardCharsets.UTF_8));
            outputStream.flush();

            call.resolve(success("Registros enviados por Bluetooth."));
        } catch (IOException | IllegalArgumentException error) {
            call.reject("No se pudo enviar por Bluetooth. Verifica que el otro dispositivo esté emparejado y aceptando conexión.");
        } finally {
            if (socket != null) {
                try {
                    socket.close();
                } catch (IOException ignored) {
                }
            }
        }
    }

    private boolean ensureReady(PluginCall call) {
        if (bluetoothAdapter == null) {
            call.reject("Este dispositivo no tiene Bluetooth disponible.");
            return false;
        }

        if (!bluetoothAdapter.isEnabled()) {
            call.reject("Activa Bluetooth en Android antes de sincronizar.");
            return false;
        }

        if (!hasBluetoothPermissions()) {
            call.reject("Permiso Bluetooth denegado.");
            return false;
        }

        return true;
    }

    private boolean hasBluetoothPermissions() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) {
            return true;
        }

        return ContextCompat.checkSelfPermission(getContext(), Manifest.permission.BLUETOOTH_CONNECT) == PackageManager.PERMISSION_GRANTED &&
            ContextCompat.checkSelfPermission(getContext(), Manifest.permission.BLUETOOTH_SCAN) == PackageManager.PERMISSION_GRANTED;
    }

    private JSObject success(String message) {
        JSObject result = new JSObject();
        result.put("success", true);
        result.put("message", message);
        return result;
    }
}
