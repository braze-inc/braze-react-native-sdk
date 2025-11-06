package com.braze.reactbridge

import org.json.JSONArray
import org.json.JSONObject

/**
 * Utility class for reading JSON files from test resources in unit tests.
 */
object AssetUtils {

    /**
     * Reads a file from test resources and returns it as a String.
     *
     * @param fileName The name of the file in the test resources directory
     * @return The file contents as a String
     * @throws IllegalArgumentException if the resource cannot be found
     */
    fun readAssetAsString(fileName: String): String {
        return ClassLoader.getSystemResourceAsStream(fileName)?.use { inputStream ->
            inputStream.bufferedReader().use { reader ->
                reader.readText()
            }
        } ?: throw IllegalArgumentException("Resource not found: $fileName")
    }

    /**
     * Reads a JSON file from test resources and returns it as a JSONObject.
     *
     * @param fileName The name of the JSON file in the test resources directory
     * @return The parsed JSONObject
     * @throws IllegalArgumentException if the resource cannot be found
     * @throws org.json.JSONException if the file is not valid JSON
     */
    fun readJsonObjectFromAsset(fileName: String): JSONObject {
        val jsonString = readAssetAsString(fileName)
        return JSONObject(jsonString)
    }

    /**
     * Reads a JSON array file from test resources and returns it as a JSONArray.
     *
     * @param fileName The name of the JSON file in the test resources directory
     * @return The parsed JSONArray
     * @throws IllegalArgumentException if the resource cannot be found
     * @throws org.json.JSONException if the file is not valid JSON
     */
    fun readJsonArrayFromAsset(fileName: String): JSONArray {
        val jsonString = readAssetAsString(fileName)
        return JSONArray(jsonString)
    }
}
