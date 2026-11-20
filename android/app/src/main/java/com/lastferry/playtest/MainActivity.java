package com.lastferry.playtest;

import android.app.Activity;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageInfo;
import android.graphics.Color;
import android.graphics.Bitmap;
import android.graphics.Insets;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.os.SystemClock;
import android.view.DisplayCutout;
import android.view.Gravity;
import android.view.View;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.webkit.RenderProcessGoneDetail;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import android.window.OnBackInvokedDispatcher;

import androidx.webkit.WebViewAssetLoader;

import java.util.Collections;

public final class MainActivity extends Activity {
    private static final String ORIGIN = "https://" + WebViewAssetLoader.DEFAULT_DOMAIN;
    private static final int HARBOR_COLOR = Color.rgb(22, 61, 71);
    private FrameLayout harbor;
    private WebView game;
    private View fullscreenView;
    private WebChromeClient.CustomViewCallback fullscreenCallback;
    private boolean backPending;
    private final Handler startup = new Handler(Looper.getMainLooper());
    private final Runnable probe = this::checkReady;
    private final Runnable timedOut = this::showRecovery;
    private long remainingStartup;
    private long startupDeadline;
    private int navigation;
    private boolean foreground;
    private boolean pageLoaded;

    @Override
    public void onCreate(Bundle saved) {
        super.onCreate(saved);
        harbor = new FrameLayout(this);
        harbor.setBackgroundColor(HARBOR_COLOR);
        if (Build.VERSION.SDK_INT >= 30) {
            getWindow().setDecorFitsSystemWindows(false);
        } else {
            getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_LAYOUT_STABLE | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                    | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION);
        }
        harbor.setOnApplyWindowInsetsListener((view, insets) -> {
            Insets safe;
            if (Build.VERSION.SDK_INT >= 30) {
                safe = insets.getInsets(WindowInsets.Type.systemBars() | WindowInsets.Type.displayCutout()
                    | WindowInsets.Type.mandatorySystemGestures() | WindowInsets.Type.ime());
            } else {
                safe = Insets.max(insets.getSystemWindowInsets(), insets.getMandatorySystemGestureInsets());
                DisplayCutout cutout = insets.getDisplayCutout();
                if (cutout != null) {
                    safe = Insets.max(safe, Insets.of(cutout.getSafeInsetLeft(), cutout.getSafeInsetTop(),
                        cutout.getSafeInsetRight(), cutout.getSafeInsetBottom()));
                }
            }
            view.setPadding(safe.left, safe.top, safe.right, safe.bottom);
            return Build.VERSION.SDK_INT >= 30 ? WindowInsets.CONSUMED
                : insets.consumeDisplayCutout().consumeSystemWindowInsets().consumeStableInsets();
        });
        setContentView(harbor);
        if (Build.VERSION.SDK_INT >= 33) {
            getOnBackInvokedDispatcher().registerOnBackInvokedCallback(
                OnBackInvokedDispatcher.PRIORITY_DEFAULT, this::back);
        }
        openGame();
    }

    private void openGame() {
        harbor.removeAllViews();
        try {
            PackageInfo provider = WebView.getCurrentWebViewPackage();
            if (provider == null || Integer.parseInt(provider.versionName.split("\\.")[0]) < 111) {
                showRecovery();
                return;
            }
            WebView.setWebContentsDebuggingEnabled(
                (getApplicationInfo().flags & ApplicationInfo.FLAG_DEBUGGABLE) != 0);
            game = new WebView(this);
            game.setBackgroundColor(HARBOR_COLOR);
            WebSettings settings = game.getSettings();
            settings.setJavaScriptEnabled(true);
            settings.setDomStorageEnabled(true);
            settings.setAllowFileAccess(false);
            settings.setAllowContentAccess(false);
            settings.setMediaPlaybackRequiresUserGesture(true);
            settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
            WebViewAssetLoader loader = new WebViewAssetLoader.Builder()
                .addPathHandler("/", new WebViewAssetLoader.AssetsPathHandler(this))
                .build();
            game.setWebViewClient(new WebViewClient() {
                @Override
                public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                    return !isLocal(request.getUrl());
                }

                @Override
                public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                    if (isLocal(request.getUrl()) && "GET".equals(request.getMethod())) {
                        WebResourceResponse resource = loader.shouldInterceptRequest(request.getUrl());
                        if (resource != null) return resource;
                    }
                    return new WebResourceResponse("text/plain", "UTF-8", 404, "Not Found",
                        Collections.emptyMap(), null);
                }

                @Override
                public void onPageStarted(WebView view, String url, Bitmap favicon) {
                    if (game != view || !isLocal(Uri.parse(url))) return;
                    pauseStartupCheck();
                    navigation++;
                    pageLoaded = false;
                    remainingStartup = 20000;
                    resumeStartupCheck();
                }

                @Override
                public void onPageFinished(WebView view, String url) {
                    if (game != view || !isLocal(Uri.parse(url))) return;
                    pageLoaded = true;
                    publishVisibility();
                    checkReady();
                }

                @Override
                public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                    if (game == view && request.isForMainFrame()) showRecovery();
                }

                @Override
                public boolean onRenderProcessGone(WebView view, RenderProcessGoneDetail detail) {
                    if (game == view) showRecovery();
                    return true;
                }
            });
            game.setWebChromeClient(new WebChromeClient() {
                @Override
                public void onShowCustomView(View view, CustomViewCallback callback) {
                    if (fullscreenView != null) {
                        callback.onCustomViewHidden();
                        return;
                    }
                    fullscreenView = view;
                    fullscreenCallback = callback;
                    harbor.addView(view);
                    setFullscreenBars(true);
                }

                @Override
                public void onHideCustomView() {
                    leaveFullscreen();
                }
            });
            harbor.addView(game);
            game.loadUrl(ORIGIN + "/index.html");
        } catch (RuntimeException unavailable) {
            showRecovery();
        }
    }

    private boolean isLocal(Uri uri) {
        return "https".equals(uri.getScheme()) && WebViewAssetLoader.DEFAULT_DOMAIN.equals(uri.getEncodedAuthority());
    }

    private void publishVisibility() {
        if (game == null) return;
        game.evaluateJavascript("window.lastFerryAndroidBackground = " + !foreground
            + "; window.lastFerryAndroidVisibility?.(window.lastFerryAndroidBackground)", null);
    }

    private void checkReady() {
        if (game == null || !foreground || !pageLoaded || startupDeadline == 0) return;
        int current = navigation;
        WebView view = game;
        view.evaluateJavascript("document.documentElement.dataset.lastFerryReady === 'true'", ready -> {
            if (game != view || current != navigation || !foreground || startupDeadline == 0) return;
            if ("true".equals(ready)) {
                pauseStartupCheck();
                remainingStartup = 0;
            } else {
                startup.removeCallbacks(probe);
                startup.postDelayed(probe, 250);
            }
        });
    }

    private void resumeStartupCheck() {
        if (!foreground || remainingStartup == 0 || startupDeadline != 0) return;
        startupDeadline = SystemClock.uptimeMillis() + remainingStartup;
        startup.postDelayed(timedOut, remainingStartup);
        checkReady();
    }

    private void pauseStartupCheck() {
        startup.removeCallbacks(timedOut);
        startup.removeCallbacks(probe);
        if (startupDeadline != 0) remainingStartup = Math.max(1, startupDeadline - SystemClock.uptimeMillis());
        startupDeadline = 0;
    }

    private void setFullscreenBars(boolean active) {
        if (Build.VERSION.SDK_INT >= 30) {
            WindowInsetsController bars = getWindow().getInsetsController();
            if (bars == null) return;
            if (active) {
                bars.setSystemBarsBehavior(WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
                bars.hide(WindowInsets.Type.systemBars());
            } else {
                bars.show(WindowInsets.Type.systemBars());
            }
        } else {
            int layout = View.SYSTEM_UI_FLAG_LAYOUT_STABLE | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION;
            getWindow().getDecorView().setSystemUiVisibility(active ? layout | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                | View.SYSTEM_UI_FLAG_FULLSCREEN | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION : layout);
        }
        harbor.requestApplyInsets();
    }

    private void leaveFullscreen() {
        if (fullscreenView == null) return;
        harbor.removeView(fullscreenView);
        fullscreenView = null;
        WebChromeClient.CustomViewCallback callback = fullscreenCallback;
        fullscreenCallback = null;
        callback.onCustomViewHidden();
        setFullscreenBars(false);
    }

    @Override
    public void onBackPressed() {
        back();
    }

    private void back() {
        if (fullscreenView != null) {
            leaveFullscreen();
            return;
        }
        if (game == null) {
            finish();
            return;
        }
        if (backPending) return;
        backPending = true;
        WebView current = game;
        current.evaluateJavascript("typeof window.lastFerryAndroidBack === 'function' && window.lastFerryAndroidBack()",
            handled -> {
                backPending = false;
                if (game == current && !"true".equals(handled)) moveTaskToBack(true);
            });
    }

    private void releaseGame() {
        pauseStartupCheck();
        remainingStartup = 0;
        leaveFullscreen();
        backPending = false;
        if (game == null) return;
        WebView old = game;
        game = null;
        harbor.removeView(old);
        old.destroy();
    }

    private void showRecovery() {
        releaseGame();
        harbor.removeAllViews();
        ScrollView scroll = new ScrollView(this);
        scroll.setFillViewport(true);
        LinearLayout message = new LinearLayout(this);
        int space = Math.round(24 * getResources().getDisplayMetrics().density);
        message.setPadding(space, space, space, space);
        message.setGravity(Gravity.CENTER_VERTICAL);
        message.setOrientation(LinearLayout.VERTICAL);
        TextView title = new TextView(this);
        title.setText(R.string.recovery_title);
        title.setTextSize(25);
        title.setAccessibilityHeading(true);
        TextView help = new TextView(this);
        help.setText(R.string.recovery_help);
        help.setTextSize(17);
        help.setPadding(0, space / 2, 0, space);
        Button retry = new Button(this);
        retry.setText(R.string.retry);
        retry.setOnClickListener(clicked -> openGame());
        Button close = new Button(this);
        close.setText(R.string.close);
        close.setOnClickListener(clicked -> finish());
        message.addView(title);
        message.addView(help);
        message.addView(retry);
        message.addView(close);
        scroll.addView(message);
        harbor.addView(scroll);
    }

    @Override
    public void onPause() {
        foreground = false;
        publishVisibility();
        pauseStartupCheck();
        if (game != null) game.onPause();
        super.onPause();
    }

    @Override
    public void onResume() {
        super.onResume();
        foreground = true;
        if (game != null) game.onResume();
        publishVisibility();
        resumeStartupCheck();
    }

    @Override
    public void onDestroy() {
        releaseGame();
        super.onDestroy();
    }
}
