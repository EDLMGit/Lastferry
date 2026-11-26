package com.lastferry.playtest;

import android.util.AtomicFile;
import android.webkit.JavascriptInterface;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;

/** Synchronous receipts for accepted game records. WebView can defer localStorage disk writes. */
public final class AcceptedSaves {
    private final File directory;

    AcceptedSaves(File directory) {
        this.directory = directory;
    }

    private AtomicFile record(String key) {
        if ("last-ferry.journey.v1".equals(key) || "last-ferry.mastery.v1".equals(key)
                || "last-ferry.harbor-log.v1".equals(key)) {
            return new AtomicFile(new File(directory, key));
        }
        return null;
    }

    @JavascriptInterface
    public synchronized String read(String key) {
        AtomicFile file = record(key);
        if (file == null) return null;
        try {
            return new String(file.readFully(), StandardCharsets.UTF_8);
        } catch (FileNotFoundException missing) {
            if (!file.getBaseFile().exists()) return null;
            throw new IllegalStateException("Could not read the saved game record.", missing);
        } catch (IOException unreadable) {
            throw new IllegalStateException("Could not read the saved game record.", unreadable);
        }
    }

    @JavascriptInterface
    public synchronized boolean write(String key, String value) {
        AtomicFile file = record(key);
        if (file == null || value == null || value.length() > 32768) return false;
        byte[] bytes = value.getBytes(StandardCharsets.UTF_8);
        FileOutputStream stream = null;
        try {
            stream = file.startWrite();
            stream.write(bytes);
            stream.getFD().sync();
            file.finishWrite(stream);
            stream = null;
            return Arrays.equals(bytes, file.readFully());
        } catch (IOException failed) {
            if (stream != null) file.failWrite(stream);
            return false;
        }
    }
}
