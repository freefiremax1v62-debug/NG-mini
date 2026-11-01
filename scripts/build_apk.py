import zipfile
import os

def build_apk():
    apk_paths = ['public/ng-chat-ai-tutor.apk', 'ng-chat-ai-tutor.apk']

    manifest_xml = b'''<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="org.ngchat.aitutor"
    android:versionCode="1"
    android:versionName="1.0.0">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="NG Chat"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@android:style/Theme.NoTitleBar.Fullscreen">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:screenOrientation="portrait">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
'''

    # Minimal Android dex bytecode placeholder header
    dex_header = bytearray(b'dex\n035\x00') + bytearray(104)

    for apk_path in apk_paths:
        with zipfile.ZipFile(apk_path, 'w', zipfile.ZIP_DEFLATED) as zf:
            zf.writestr('AndroidManifest.xml', manifest_xml)
            zf.writestr('classes.dex', dex_header)
            
            # Include icons
            if os.path.exists('public/pwa-192x192.png'):
                with open('public/pwa-192x192.png', 'rb') as f:
                    icon_data = f.read()
                    zf.writestr('res/mipmap-xxhdpi/ic_launcher.png', icon_data)
                    zf.writestr('res/mipmap-xxhdpi/ic_launcher_round.png', icon_data)
            
            # Include manifest JSON
            zf.writestr('assets/app.json', b'{"name": "NG Chat", "version": "1.0.0", "type": "Android WebAPK"}')
            zf.writestr('META-INF/MANIFEST.MF', b'Manifest-Version: 1.0\nCreated-By: NG Chat Build Engine\n')
            
        print(f"Successfully generated APK file at {apk_path} (size: {os.path.getsize(apk_path)} bytes)")

build_apk()
