package com.lrsmotors.app

import android.Manifest
import android.content.Context
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

class MainActivity:ComponentActivity(){
 private val permissions=registerForActivityResult(ActivityResultContracts.RequestMultiplePermissions()){}
 override fun onCreate(savedInstanceState:Bundle?){super.onCreate(savedInstanceState);permissions.launch(arrayOf(Manifest.permission.READ_PHONE_STATE,Manifest.permission.READ_CALL_LOG,Manifest.permission.POST_NOTIFICATIONS));setContent{LeadApp(this,intent.getStringExtra("after_call_phone"))}}
}

@Composable fun LeadApp(context:Context,initialPhone:String?){
 val store=remember{LeadStore(context)};var screen by remember{mutableStateOf(if(initialPhone.isNullOrBlank())"home" else "edit")};var selected by remember{mutableStateOf(initialPhone.orEmpty())};var refresh by remember{mutableIntStateOf(0)}
 MaterialTheme{Scaffold(bottomBar={NavigationBar{NavigationBarItem(screen=="home",{screen="home"},{},{Text("Dashboard")});NavigationBarItem(screen=="leads",{screen="leads"},{},{Text("Leads")})}}){pad->Box(Modifier.padding(pad)){when(screen){
  "leads"->LeadsScreen(store,refresh,{selected=it;screen="edit"})
  "edit"->LeadEditor(store,selected,{refresh++;screen="leads"})
  else->Dashboard(store,refresh,{selected=it;screen="edit"},{screen="leads"})
 }}}}
}

@Composable fun Dashboard(store:LeadStore,refresh:Int,onOpen:(String)->Unit,onLeads:()->Unit){val all=remember(refresh){store.all()};LazyColumn(Modifier.fillMaxSize().padding(18.dp),verticalArrangement=Arrangement.spacedBy(12.dp)){item{Text("LRS Motors",style=MaterialTheme.typography.headlineMedium);Text("Call Lead Manager")};item{Row(Modifier.fillMaxWidth(),horizontalArrangement=Arrangement.spacedBy(8.dp)){Metric("Leads",all.size.toString(),Modifier.weight(1f));Metric("Hot",all.count{it.status=="Hot"}.toString(),Modifier.weight(1f));Metric("Sold",all.count{it.status=="Purchased"}.toString(),Modifier.weight(1f))}};item{Button(onLeads,Modifier.fillMaxWidth()){Text("View All Leads")};Text("Recent callers",style=MaterialTheme.typography.titleLarge)};items(all.take(10)){LeadCard(it,onOpen)}}}
@Composable fun Metric(t:String,v:String,m:Modifier){Card(m){Column(Modifier.padding(12.dp)){Text(v,style=MaterialTheme.typography.headlineSmall);Text(t)}}}

@Composable fun LeadsScreen(store:LeadStore,refresh:Int,onOpen:(String)->Unit){var q by remember{mutableStateOf("")};var local by remember{mutableIntStateOf(0)};val leads=remember(q,refresh,local){store.all(q)};Column(Modifier.fillMaxSize().padding(18.dp)){Text("Leads",style=MaterialTheme.typography.headlineMedium);Text("All customers captured from your calls");OutlinedTextField(q,{q=it},label={Text("Search number, name or vehicle")},modifier=Modifier.fillMaxWidth());Spacer(Modifier.height(8.dp));LazyColumn(verticalArrangement=Arrangement.spacedBy(8.dp)){items(leads,key={it.id}){l->Card(Modifier.fillMaxWidth()){Column(Modifier.padding(14.dp)){Column(Modifier.fillMaxWidth().clickable{onOpen(l.phone)}){Text(if(l.name.isBlank())l.phone else l.name,style=MaterialTheme.typography.titleMedium);Text(l.phone);Text("${l.type} · ${l.vehicle.ifBlank{"Vehicle not entered"}} · ${l.status}");if(l.budget.isNotBlank())Text("Budget: ${l.budget}")};TextButton(onClick={store.delete(l.phone);local++}){Text("Delete Lead")}}}}}}}
@Composable fun LeadCard(l:Lead,onOpen:(String)->Unit){Card(Modifier.fillMaxWidth().clickable{onOpen(l.phone)}){Column(Modifier.padding(14.dp)){Text(if(l.name.isBlank())l.phone else l.name,style=MaterialTheme.typography.titleMedium);Text(l.phone);Text("${l.type} · ${l.vehicle.ifBlank{"Select requirement"}}")}}}

@Composable fun LeadEditor(store:LeadStore,phoneSeed:String,onDone:()->Unit){
 val phone=LeadStore.normalize(phoneSeed);val old=remember(phone){store.find(phone)};var name by remember{mutableStateOf(old?.name.orEmpty())};var type by remember{mutableStateOf(old?.type?:"Car")};var vehicle by remember{mutableStateOf(old?.vehicle.orEmpty())};var budget by remember{mutableStateOf(old?.budget.orEmpty())};var status by remember{mutableStateOf(old?.status?:"New")};var notes by remember{mutableStateOf(old?.notes.orEmpty())}
 LazyColumn(Modifier.fillMaxSize().padding(18.dp),verticalArrangement=Arrangement.spacedBy(10.dp)){item{Text(if(old==null)"Call received" else "Lead details",style=MaterialTheme.typography.headlineMedium);Text("Caller: $phone");Text("Number captured automatically from call details")};item{F("Customer name (optional)",name){name=it}};item{Row(horizontalArrangement=Arrangement.spacedBy(8.dp)){FilterChip(type=="Car",{type="Car"},{Text("Car")});FilterChip(type=="Bike",{type="Bike"},{Text("Bike")})}};item{F("Which car / bike?",vehicle){vehicle=it}};item{F("Budget (optional)",budget){budget=it}};item{F("Notes (optional)",notes){notes=it}};item{Row(horizontalArrangement=Arrangement.spacedBy(5.dp)){listOf("New","Hot","Warm","Purchased","Lost").forEach{FilterChip(status==it,{status=it},{Text(it)})}}};item{Button(onClick={if(phone.isNotBlank()){store.save(phone,name,type,vehicle,budget,status,notes);onDone()}},enabled=phone.isNotBlank()&&vehicle.isNotBlank(),modifier=Modifier.fillMaxWidth()){Text("Save Lead")}};if(phone.isBlank())item{Text("No call number was received. Make or receive a phone call first, then return to LRS Lead AI.",color=MaterialTheme.colorScheme.error)}}
}
@Composable fun F(label:String,value:String,set:(String)->Unit){OutlinedTextField(value,set,label={Text(label)},modifier=Modifier.fillMaxWidth(),singleLine=true)}