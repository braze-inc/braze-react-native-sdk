package com.brazeproject

import android.content.Intent
import android.os.Bundle
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import org.json.JSONArray
import org.json.JSONObject

/**
 * Sample activity for **manual deep link testing** in BrazeProject (not shown in the app launcher).
 *
 * **Purpose:** Verify that a custom URL opens a dedicated screen. The UI shows a **title** and a
 * **pretty-printed JSON** representation of the incoming intent (action, data, flags, categories,
 * URI query parameters, and **extras as string values** only, read with `Bundle.getString(String)` per
 * key—non-string extra values are not represented faithfully and may appear as null). The JSON block is
 * **vertically centered** in the space below the title when the text is shorter than that area; long
 * payloads still scroll. JSON lines are **start-aligned** (left in LTR).
 *
 * **Deep link pattern** (must match the `<intent-filter>` on this activity in `AndroidManifest.xml`):
 * ```
 * helloreact://example.com/path?label=<any-string>
 * ```
 * - Scheme: `helloreact`
 * - Host: `example.com`
 * - Path: must start with `/path` (e.g. `/path` or `/path/extra`)
 * - Query: optional `label` (and any other params); they appear in the JSON
 *
 * **Example:**
 * - `helloreact://example.com/path/foo?label=hello` → matches `pathPrefix`; JSON reflects the URI
 *
 * **Test from a connected device (package `com.brazeproject`):**
 * ```
 * adb shell am start -a android.intent.action.VIEW \
 *   -d 'helloreact://example.com/path?label=your_test_value' com.brazeproject
 * ```
 */
class DeepLinkLabelActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_deep_link_label)

        val scroll = findViewById<ScrollView>(R.id.json_scroll)
        val scrollContent = findViewById<LinearLayout>(R.id.json_scroll_content)
        scroll.post {
            scrollContent.minimumHeight = scroll.height
        }

        findViewById<TextView>(R.id.label_text).text = intentToJson(intent)
    }

    private fun intentToJson(intent: Intent): String {
        return try {
            val root = JSONObject()
            root.put("action", intent.action)
            root.put("dataString", intent.dataString)
            root.put("type", intent.type)
            root.put("package", intent.`package`)
            root.put("component", intent.component?.flattenToShortString())
            root.put("flags", intent.flags)

            val categories = intent.categories
            if (categories != null && categories.isNotEmpty()) {
                root.put("categories", JSONArray(categories.sorted()))
            } else {
                root.put("categories", JSONObject.NULL)
            }

            val uri = intent.data
            if (uri != null) {
                root.put("dataUri", uri.toString())
                val queryParameters = JSONObject()
                uri.queryParameterNames.sorted().forEach { name ->
                    queryParameters.put(name, uri.getQueryParameter(name))
                }
                root.put("queryParameters", queryParameters)
            } else {
                root.put("dataUri", JSONObject.NULL)
                root.put("queryParameters", JSONObject.NULL)
            }

            val extras = intent.extras
            if (extras != null && !extras.isEmpty) {
                root.put("extras", bundleToJson(extras))
            } else {
                root.put("extras", JSONObject.NULL)
            }

            root.toString(JSON_INDENT)
        } catch (e: Exception) {
            JSONObject().apply {
                put("error", "Failed to serialize intent to JSON")
                put("message", e.message)
            }.toString(JSON_INDENT)
        }
    }

    private fun bundleToJson(bundle: Bundle): JSONObject {
        val jsonObject = JSONObject()
        for (key in bundle.keySet().sorted()) {
            val value = bundle.getString(key)
            jsonObject.put(key, value ?: JSONObject.NULL)
        }
        return jsonObject
    }

    companion object {
        private const val JSON_INDENT = 2
    }
}
