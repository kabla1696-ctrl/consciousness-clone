package com.consciousness.clone;

import android.os.Bundle;
import android.webkit.WebView;
import android.webkit.WebSettings;
import android.view.MotionEvent;
import android.view.View;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        try {
            WebView webView = getBridge().getWebView();
            if (webView != null) {
                // Enable scroll
                webView.setOverScrollMode(View.OVER_SCROLL_ALWAYS);
                webView.setVerticalScrollBarEnabled(true);
                webView.setHorizontalScrollBarEnabled(false);
                webView.setScrollbarFadingEnabled(true);

                // WebView settings
                WebSettings settings = webView.getSettings();
                settings.setDomStorageEnabled(true);
                settings.setDatabaseEnabled(true);
                settings.setAllowFileAccess(true);
                settings.setAllowContentAccess(true);
                settings.setSupportZoom(false);
                settings.setBuiltInZoomControls(false);
                settings.setDisplayZoomControls(false);
                settings.setLoadWithOverviewMode(true);
                settings.setUseWideViewPort(true);
                settings.setCacheMode(WebSettings.LOAD_DEFAULT);

                // CRITICAL: Ensure touch events propagate for scrolling
                webView.setOnTouchListener(new View.OnTouchListener() {
                    @Override
                    public boolean onTouch(View v, MotionEvent event) {
                        // Let the WebView handle all touch events including scroll
                        v.performClick();
                        return false; // Return false to NOT consume the event
                    }
                });

                // Force request focus for touch events
                webView.requestFocus();
                webView.requestFocusFromTouch();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
