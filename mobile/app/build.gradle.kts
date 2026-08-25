plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.compose")
}

android { namespace = "com.lrsmotors.app"; compileSdk = 35
    defaultConfig { applicationId = "com.lrsmotors.app"; minSdk = 26; targetSdk = 35; versionCode = 1; versionName = "1.0.0" }
    buildFeatures { compose = true }
}

dependencies {
    implementation(platform("androidx.compose:compose-bom:2025.02.00"))
    implementation("androidx.activity:activity-compose:1.10.1")
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.lifecycle:lifecycle-runtime-compose:2.8.7")
    implementation("androidx.navigation:navigation-compose:2.8.7")
    implementation("com.google.mlkit:text-recognition:16.0.1")
    implementation("androidx.camera:camera-camera2:1.4.1")
    implementation("androidx.camera:camera-lifecycle:1.4.1")
    implementation("androidx.camera:camera-view:1.4.1")
    implementation("io.github.jan-tennert.supabase:postgrest-kt:3.1.4")
    implementation("io.github.jan-tennert.supabase:auth-kt:3.1.4")
    implementation("io.ktor:ktor-client-android:3.0.3")
    debugImplementation("androidx.compose.ui:ui-tooling")
}
