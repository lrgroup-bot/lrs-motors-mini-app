package com.lrsmotors.app

import android.Manifest
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import kotlin.math.max
import kotlin.math.min

private val Navy = Color(0xFF07111F)
private val Navy2 = Color(0xFF0C1C31)
private val Card = Color(0xFF12243A)
private val Gold = Color(0xFFD6B35A)
private val Green = Color(0xFF27C977)
private val Red = Color(0xFFFF5364)
private val Muted = Color(0xFFA8B4C5)

class MainActivity : ComponentActivity() {
    private var phonePermissionReady by mutableStateOf(false)
    private val perms = registerForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) {
        phonePermissionReady = ContextCompat.checkSelfPermission(this, Manifest.permission.READ_PHONE_STATE) == PackageManager.PERMISSION_GRANTED
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        phonePermissionReady = ContextCompat.checkSelfPermission(this, Manifest.permission.READ_PHONE_STATE) == PackageManager.PERMISSION_GRANTED
        if (!phonePermissionReady) requestAppPermissions()
        val phone = intent.getStringExtra("action_phone") ?: intent.getStringExtra("after_call_phone")
        setContent { LeadsApp(this, phone, phonePermissionReady, ::requestAppPermissions) }
    }

    private fun requestAppPermissions() {
        val required = mutableListOf(Manifest.permission.READ_PHONE_STATE, Manifest.permission.READ_CALL_LOG, Manifest.permission.READ_PHONE_NUMBERS, Manifest.permission.CALL_PHONE)
        if (android.os.Build.VERSION.SDK_INT >= 33) required += Manifest.permission.POST_NOTIFICATIONS
        perms.launch(required.toTypedArray())
    }
}

@Composable
private fun LeadsApp(c: Context, initial: String?, permissionReady: Boolean, requestPermissions: () -> Unit) {
    val store = remember { LeadStore(c) }
    var page by remember { mutableStateOf("loading") }
    var addPhone by remember { mutableStateOf(initial.orEmpty()) }
    var refresh by remember { mutableIntStateOf(0) }
    LaunchedEffect(permissionReady, initial) {
        page = when {
            !permissionReady -> "permission"
            SimCallResolver.selected(c) == null -> "setup"
            !initial.isNullOrBlank() -> "add"
            else -> "dash"
        }
    }
    MaterialTheme(colorScheme = darkColorScheme(background = Navy, surface = Card, primary = Gold, onPrimary = Navy)) {
        when (page) {
            "permission" -> PermissionScreen(requestPermissions)
            "setup" -> SimSetup(c) { page = "dash" }
            "add" -> AddLead(c, store, addPhone) { refresh++; addPhone = ""; page = "dash" }
            "dash" -> Dashboard(c, store, refresh, { addPhone = ""; page = "add" }, { page = "setup" }) { refresh++ }
            else -> Box(Modifier.fillMaxSize().background(Navy), contentAlignment = Alignment.Center) { CircularProgressIndicator(color = Gold) }
        }
    }
}

@Composable
private fun Logo(size: Int = 112) {
    Image(
        painter = painterResource(R.drawable.lrs_app_logo),
        contentDescription = "LRS Motors",
        contentScale = ContentScale.Fit,
        modifier = Modifier.size(size.dp).clip(RoundedCornerShape(26.dp)).shadow(18.dp, RoundedCornerShape(26.dp))
    )
}

@Composable
private fun PermissionScreen(requestPermissions: () -> Unit) {
    Box(Modifier.fillMaxSize().background(Brush.verticalGradient(listOf(Navy, Navy2))), contentAlignment = Alignment.Center) {
        Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.padding(28.dp)) {
            Logo(132); Spacer(Modifier.height(22.dp)); Text("Leads/Reminder", fontSize = 28.sp, fontWeight = FontWeight.Black)
            Spacer(Modifier.height(8.dp)); Text("Phone permission is required to show SIM 1 / SIM 2 and read customer calls.", color = Muted, textAlign = TextAlign.Center)
            Spacer(Modifier.height(22.dp)); Button(onClick = requestPermissions, colors = ButtonDefaults.buttonColors(containerColor = Gold, contentColor = Navy), modifier = Modifier.fillMaxWidth().height(54.dp)) { Text("ALLOW PHONE ACCESS", fontWeight = FontWeight.Black) }
        }
    }
}

@Composable
private fun SimSetup(c: Context, done: () -> Unit) {
    var reload by remember { mutableIntStateOf(0) }
    val sims = remember(reload) { SimCallResolver.sims(c) }
    val selected = SimCallResolver.selected(c)
    Box(Modifier.fillMaxSize().background(Brush.verticalGradient(listOf(Navy, Navy2)))) {
        Column(Modifier.fillMaxSize().padding(24.dp), horizontalAlignment = Alignment.CenterHorizontally) {
            Spacer(Modifier.height(24.dp)); Logo(120); Spacer(Modifier.height(22.dp))
            Text("Choose Business SIM", fontSize = 25.sp, fontWeight = FontWeight.Bold)
            Text("Select the SIM used for LRS Motors customer calls.", color = Muted, textAlign = TextAlign.Center)
            Spacer(Modifier.height(22.dp))
            if (sims.isEmpty()) {
                Surface(color = Card, shape = RoundedCornerShape(22.dp), modifier = Modifier.fillMaxWidth()) {
                    Column(Modifier.padding(22.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("No active SIM found", fontWeight = FontWeight.Bold, fontSize = 18.sp)
                        Spacer(Modifier.height(8.dp)); Text("Check Phone permission and verify both SIMs are enabled in Samsung Settings.", color = Muted, textAlign = TextAlign.Center)
                        Spacer(Modifier.height(16.dp)); Button(onClick = { reload++ }, colors = ButtonDefaults.buttonColors(containerColor = Gold, contentColor = Navy)) { Text("SCAN AGAIN") }
                    }
                }
            } else sims.forEach { sim ->
                val active = selected == sim.subscriptionId
                Surface(
                    modifier = Modifier.fillMaxWidth().padding(vertical = 7.dp).shadow(10.dp, RoundedCornerShape(20.dp))
                        .border(if (active) 2.dp else 1.dp, if (active) Gold else Color(0xFF29425E), RoundedCornerShape(20.dp))
                        .clickable {
                            if (SimCallResolver.saveSelected(c, sim)) {
                                Toast.makeText(c, "${sim.label} selected", Toast.LENGTH_SHORT).show(); done()
                            } else Toast.makeText(c, "SIM selection could not be saved", Toast.LENGTH_LONG).show()
                        },
                    color = Card, shape = RoundedCornerShape(20.dp)
                ) {
                    Row(Modifier.padding(18.dp), verticalAlignment = Alignment.CenterVertically) {
                        Box(Modifier.size(48.dp).clip(CircleShape).background(if (active) Gold else Color(0xFF203A57)), contentAlignment = Alignment.Center) { Text("${sim.slotIndex + 1}", color = if (active) Navy else Color.White, fontWeight = FontWeight.Black) }
                        Spacer(Modifier.width(14.dp)); Column(Modifier.weight(1f)) {
                            Text("SIM ${sim.slotIndex + 1}", fontWeight = FontWeight.Bold, fontSize = 18.sp)
                            Text(sim.carrier, color = Muted)
                            Text("ID ${sim.subscriptionId}${sim.phoneAccountId?.let { " • account $it" } ?: ""}", color = Muted, fontSize = 10.sp)
                        }
                        Text(if (active) "SELECTED" else "SELECT", color = Gold, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                    }
                }
            }
        }
    }
}

@Composable
private fun Dashboard(c: Context, store: LeadStore, key: Int, onAdd: () -> Unit, onChangeSim: () -> Unit, refresh: () -> Unit) {
    val leads = remember(key) { store.all() }
    Box(Modifier.fillMaxSize().background(Brush.verticalGradient(listOf(Navy, Navy2)))) {
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(18.dp, 20.dp, 18.dp, 110.dp), verticalArrangement = Arrangement.spacedBy(13.dp)) {
            item {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Logo(62); Spacer(Modifier.width(12.dp))
                    Column(Modifier.weight(1f)) { Text("Leads/Reminder", fontSize = 25.sp, fontWeight = FontWeight.Black); Text(SimCallResolver.selectedLabel(c), color = Gold, fontSize = 12.sp) }
                    IconButton(onClick = onChangeSim, modifier = Modifier.clip(CircleShape).background(Card)) { Icon(Icons.Default.Settings, "Change SIM", tint = Gold) }
                }
                Spacer(Modifier.height(13.dp))
                Surface(color = Card, shape = RoundedCornerShape(22.dp), modifier = Modifier.fillMaxWidth().shadow(10.dp, RoundedCornerShape(22.dp))) {
                    Row(Modifier.padding(20.dp), verticalAlignment = Alignment.CenterVertically) {
                        Column(Modifier.weight(1f)) { Text("Customer Leads", color = Muted); Text(leads.size.toString(), fontSize = 34.sp, fontWeight = FontWeight.Black, color = Gold) }
                        Text("Calls → Leads → Follow-up", color = Muted, fontSize = 12.sp)
                    }
                }
            }
            items(leads, key = { it.id }) { l ->
                var del by remember { mutableStateOf(false) }
                val now = System.currentTimeMillis(); val dueAt = l.actionDueAt ?: l.updatedAt + 86400000L
                val progress = min(1f, max(0f, (now - (dueAt - 86400000L)).toFloat() / 86400000f)); val done = l.actionState == "DONE"; val due = !done && now >= dueAt
                Surface(color = Card, shape = RoundedCornerShape(22.dp), modifier = Modifier.fillMaxWidth().shadow(8.dp, RoundedCornerShape(22.dp)).border(if (due) 1.dp else 0.dp, if (due) Red else Color.Transparent, RoundedCornerShape(22.dp))) {
                    Column(Modifier.padding(17.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Row { Column(Modifier.weight(1f)) { Text(l.name.ifBlank { "Customer" }, fontSize = 20.sp, fontWeight = FontWeight.Bold); Text(l.phone, color = Muted); Text("${l.type} · ${l.vehicle}", color = Gold) }; IconButton(onClick = { del = true }) { Icon(Icons.Default.Delete, "Delete", tint = Red) } }
                        Text(if (done) "Follow-up completed" else if (due) "Follow-up due now" else "Follow-up in ${max(1L, (dueAt - now + 3599999) / 3600000)}h", color = if (done) Green else if (due) Red else Muted, fontSize = 12.sp)
                        LinearProgressIndicator(progress = { if (done) 1f else progress }, modifier = Modifier.fillMaxWidth().height(7.dp).clip(CircleShape), color = if (done) Green else if (due) Red else Gold, trackColor = Color(0xFF263A50))
                        if (due) Row(horizontalArrangement = Arrangement.spacedBy(9.dp)) {
                            Button(onClick = { openWhatsApp(c, l.phone, l.name, l.vehicle) }, modifier = Modifier.weight(1f), colors = ButtonDefaults.buttonColors(containerColor = Green)) { Text("WhatsApp") }
                            Button(onClick = { startLeadCall(c, l.phone) }, modifier = Modifier.weight(1f), colors = ButtonDefaults.buttonColors(containerColor = Gold, contentColor = Navy)) { Icon(Icons.Default.Phone, null); Text(" Call") }
                        }
                    }
                }
                if (del) AlertDialog(onDismissRequest = { del = false }, title = { Text("Delete this lead?") }, text = { Text("This will permanently remove ${l.phone}.") }, confirmButton = { TextButton(onClick = { store.delete(l.phone); del = false; refresh() }) { Text("DELETE", color = Red) } }, dismissButton = { TextButton(onClick = { del = false }) { Text("CANCEL") } })
            }
            if (leads.isEmpty()) item { Column(Modifier.fillMaxWidth().padding(top = 70.dp), horizontalAlignment = Alignment.CenterHorizontally) { Text("No leads yet", fontSize = 21.sp, fontWeight = FontWeight.Bold); Text("Add a customer requirement after a call.", color = Muted) } }
        }
        ExtendedFloatingActionButton(onClick = onAdd, icon = { Icon(Icons.Default.Add, null) }, text = { Text("ADD LEAD", fontWeight = FontWeight.Bold) }, containerColor = Gold, contentColor = Navy, modifier = Modifier.align(Alignment.BottomEnd).padding(22.dp))
    }
}

@Composable
private fun AddLead(c: Context, store: LeadStore, seed: String, done: () -> Unit) {
    var phone by remember { mutableStateOf(LeadStore.normalize(seed)) }; var name by remember { mutableStateOf("") }; var type by remember { mutableStateOf("Car") }; var vehicle by remember { mutableStateOf("") }; var notes by remember { mutableStateOf("") }; var missing by remember { mutableStateOf<List<String>?>(null) }
    LazyColumn(Modifier.fillMaxSize().background(Brush.verticalGradient(listOf(Navy, Navy2))).padding(horizontal = 20.dp), contentPadding = PaddingValues(top = 24.dp, bottom = 30.dp), verticalArrangement = Arrangement.spacedBy(13.dp)) {
        item { Row(verticalAlignment = Alignment.CenterVertically) { Logo(58); Spacer(Modifier.width(12.dp)); Column { Text("Add Lead", fontSize = 28.sp, fontWeight = FontWeight.Black); Text("Save the requirement in seconds.", color = Muted) } } }
        item { Surface(color = Card, shape = RoundedCornerShape(24.dp), modifier = Modifier.fillMaxWidth()) { Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
            OutlinedTextField(phone, { phone = LeadStore.normalize(it) }, label = { Text("Phone Number *") }, modifier = Modifier.fillMaxWidth(), singleLine = true)
            OutlinedTextField(name, { name = it }, label = { Text("Customer Name (optional)") }, modifier = Modifier.fillMaxWidth(), singleLine = true)
            Text("Vehicle Type *", fontWeight = FontWeight.Bold); Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) { FilterChip(type == "Car", { type = "Car" }, { Text("CAR") }); FilterChip(type == "Bike", { type = "Bike" }, { Text("BIKE") }) }
            OutlinedTextField(vehicle, { vehicle = it }, label = { Text("Vehicle / Requirement *") }, modifier = Modifier.fillMaxWidth(), singleLine = true)
            OutlinedTextField(notes, { notes = it }, label = { Text("Notes (optional)") }, modifier = Modifier.fillMaxWidth().height(110.dp))
            Button(onClick = { missing = buildList { if (phone.isBlank()) add("Phone Number"); if (vehicle.isBlank()) add("Vehicle / Requirement") } }, modifier = Modifier.fillMaxWidth().height(58.dp), colors = ButtonDefaults.buttonColors(containerColor = Gold, contentColor = Navy)) { Text("SAVE LEAD", fontWeight = FontWeight.Black) }
        } } }
    }
    missing?.let { m -> AlertDialog(onDismissRequest = { missing = null }, title = { Text(if (m.isEmpty()) "Save Lead?" else "Complete required fields") }, text = { Text(if (m.isEmpty()) "${name.ifBlank { "Customer" }}\n$phone\n$type · $vehicle" else "Please complete:\n• ${m.joinToString("\n• ")}") }, confirmButton = { if (m.isEmpty()) TextButton(onClick = { val now = System.currentTimeMillis(); store.save(phone, name, type, vehicle, "", "New", notes, now + 86400000L); Toast.makeText(c, "Lead saved", Toast.LENGTH_SHORT).show(); missing = null; done() }) { Text("SAVE") } else TextButton(onClick = { missing = null }) { Text("OK") } }, dismissButton = { if (m.isEmpty()) TextButton(onClick = { missing = null }) { Text("BACK") } }) }
}

private fun openWhatsApp(c: Context, p: String, n: String, v: String) {
    val text = "Hello ${n.ifBlank { "Sir/Madam" }}, this is LRS Motors. You contacted us regarding ${v.ifBlank { "a vehicle" }}. We are following up to assist you. Please let us know if you would like more details or a test drive. Thank you — LRS Motors."
    c.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("https://wa.me/91${LeadStore.normalize(p)}?text=${Uri.encode(text)}")))
}

private fun startLeadCall(c: Context, p: String) {
    val u = Uri.parse("tel:$p")
    c.startActivity(Intent(if (ContextCompat.checkSelfPermission(c, Manifest.permission.CALL_PHONE) == PackageManager.PERMISSION_GRANTED) Intent.ACTION_CALL else Intent.ACTION_DIAL, u))
}
