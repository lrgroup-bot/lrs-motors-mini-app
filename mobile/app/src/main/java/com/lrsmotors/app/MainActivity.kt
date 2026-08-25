package com.lrsmotors.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { LrsMotorsApp() }
    }
}

@Composable
fun LrsMotorsApp() {
    var screen by remember { mutableStateOf("home") }
    MaterialTheme {
        Scaffold(
            bottomBar = {
                NavigationBar {
                    NavigationBarItem(selected = screen == "home", onClick = { screen = "home" }, icon = {}, label = { Text("Home") })
                    NavigationBarItem(selected = screen == "vehicle", onClick = { screen = "vehicle" }, icon = {}, label = { Text("Add Vehicle") })
                    NavigationBarItem(selected = screen == "inventory", onClick = { screen = "inventory" }, icon = {}, label = { Text("Inventory") })
                }
            }
        ) { padding ->
            when (screen) {
                "vehicle" -> VehicleDataScreen(Modifier.padding(padding))
                "inventory" -> InventoryScreen(Modifier.padding(padding))
                else -> DashboardScreen(Modifier.padding(padding), onAdd = { screen = "vehicle" })
            }
        }
    }
}

@Composable
fun DashboardScreen(modifier: Modifier = Modifier, onAdd: () -> Unit) {
    Column(modifier.fillMaxSize().padding(20.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
        Text("LRS Motors", style = MaterialTheme.typography.headlineMedium)
        Text("Dealership Management", style = MaterialTheme.typography.bodyLarge)
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            StatCard("Available", "0")
            StatCard("Sold", "0")
            StatCard("Reserved", "0")
        }
        Button(onClick = onAdd, modifier = Modifier.fillMaxWidth()) { Text("+ Add Vehicle") }
        OutlinedButton(onClick = onAdd, modifier = Modifier.fillMaxWidth()) { Text("Upload RC / Scan RC") }
    }
}

@Composable
fun StatCard(title: String, value: String) {
    Card(modifier = Modifier.weight(1f)) { Column(Modifier.padding(14.dp)) { Text(value, style = MaterialTheme.typography.headlineSmall); Text(title) } }
}

@Composable
fun VehicleDataScreen(modifier: Modifier = Modifier) {
    var registration by remember { mutableStateOf("") }
    var owner by remember { mutableStateOf("") }
    var brand by remember { mutableStateOf("") }
    var model by remember { mutableStateOf("") }
    var variant by remember { mutableStateOf("") }
    var year by remember { mutableStateOf("2026") }
    var fuel by remember { mutableStateOf("Petrol") }
    var km by remember { mutableStateOf("") }
    var engine by remember { mutableStateOf("") }
    var chassis by remember { mutableStateOf("") }

    LazyColumn(modifier.fillMaxSize().padding(20.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        item { Text("Vehicle Data", style = MaterialTheme.typography.headlineMedium) }
        item { Text("Upload an RC PDF or scan the RC, then verify every field before saving.") }
        item { Button(onClick = { /* next: PDF picker + OCR */ }, modifier = Modifier.fillMaxWidth()) { Text("Upload RC PDF") } }
        item { OutlinedButton(onClick = { /* next: CameraX + ML Kit */ }, modifier = Modifier.fillMaxWidth()) { Text("Scan RC with Camera") } }
        item { Field("Registration Number", registration) { registration = it } }
        item { Field("Owner Name", owner) { owner = it } }
        item { Field("Brand", brand) { brand = it } }
        item { Field("Model", model) { model = it } }
        item { Field("Variant", variant) { variant = it } }
        item { Field("Year", year) { year = it } }
        item { Field("Fuel Type", fuel) { fuel = it } }
        item { Field("Kilometers", km) { km = it } }
        item { Field("Engine Number", engine) { engine = it } }
        item { Field("Chassis Number", chassis) { chassis = it } }
        item { Button(onClick = { /* next: Supabase insert */ }, modifier = Modifier.fillMaxWidth()) { Text("Verify & Save Vehicle") } }
    }
}

@Composable
fun Field(label: String, value: String, onValueChange: (String) -> Unit) {
    OutlinedTextField(value = value, onValueChange = onValueChange, label = { Text(label) }, modifier = Modifier.fillMaxWidth(), singleLine = true)
}

@Composable
fun InventoryScreen(modifier: Modifier = Modifier) {
    Column(modifier.fillMaxSize().padding(20.dp)) {
        Text("Inventory", style = MaterialTheme.typography.headlineMedium)
        Spacer(Modifier.height(12.dp))
        Text("Vehicles saved from the Android app will appear here and sync with the LRS Motors backend.")
    }
}
