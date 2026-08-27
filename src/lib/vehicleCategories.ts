export type VehicleCategory="car"|"bike"|"auto"|"cv"|"fe"|"ce";
export const VEHICLE_CATEGORIES=[{key:"car",label:"Add a Car",icon:"🚗",description:"Passenger cars & SUVs"},{key:"bike",label:"Add a Bike",icon:"🏍️",description:"Motorcycles & scooters"},{key:"auto",label:"Add an Auto",icon:"🛺",description:"Passenger & cargo three-wheelers"},{key:"cv",label:"Add a CV",icon:"🚚",description:"Commercial vehicles"},{key:"fe",label:"Add an FE",icon:"🚜",description:"Farm equipment & tractors"},{key:"ce",label:"Add a CE",icon:"🚧",description:"Construction equipment"}] as const;
export const CATEGORY_CATALOG:Record<VehicleCategory,Record<string,string[]>>={
car:{
"Maruti Suzuki":["800","Alto","Alto 800","Alto K10","A-Star","Celerio","Celerio X","Zen","Zen Estilo","Wagon R","Ritz","Swift","Swift Dzire","Dzire","Baleno","Fronx","Ignis","S-Presso","Brezza","Vitara Brezza","Ertiga","XL6","Grand Vitara","Jimny","Invicto","Ciaz","SX4","Esteem","Omni","Eeco","Gypsy"],
"Hyundai":["Santro","Santro Xing","Eon","Getz","i10","Grand i10","Grand i10 Nios","i20","Elite i20","i20 Active","i20 N Line","Accent","Xcent","Aura","Verna","Elantra","Exter","Venue","Venue N Line","Creta","Creta N Line","Creta Electric","Alcazar","Tucson","Santa Fe","Kona Electric","IONIQ 5"],
"Tata Motors":["Nano","Indica","Indica Vista","Indigo","Indigo eCS","Manza","Bolt","Zest","Tiago","Tigor","Altroz","Punch","Nexon","Nexon EV","Curvv","Curvv EV","Harrier","Safari","Hexa","Aria","Sumo","Sumo Grande"],
"Mahindra":["Bolero","Bolero Neo","Bolero Neo Plus","Scorpio","Scorpio Classic","Scorpio-N","Thar","Thar Roxx","XUV300","XUV 3XO","XUV500","XUV700","XUV400 EV","KUV100","TUV300","Quanto","NuvoSport","Marazzo","Xylo","Verito","Renault Logan/Mahindra Verito"],
"Toyota":["Etios","Etios Liva","Glanza","Taisor","Rumion","Urban Cruiser","Urban Cruiser Hyryder","Corolla","Corolla Altis","Camry","Innova","Innova Crysta","Innova Hycross","Fortuner","Hilux","Yaris","Qualis","Vellfire","Land Cruiser"],
"Honda":["Brio","Jazz","Amaze","City","Civic","Accord","Mobilio","BR-V","WR-V","Elevate","CR-V"],
"Kia":["Sonet","Syros","Seltos","Carens","Carens Clavis","Carnival","EV6","EV9"],
"Skoda":["Fabia","Rapid","Slavia","Kushaq","Kylaq","Octavia","Superb","Yeti","Kodiaq"],
"Volkswagen":["Polo","Vento","Ameo","Virtus","Taigun","Tiguan","Jetta","Passat"],
"MG Motor":["Comet EV","Windsor EV","Astor","Hector","Hector Plus","Gloster","ZS EV"],
"Renault":["Kwid","Triber","Kiger","Duster","Lodgy","Scala","Pulse","Fluence","Koleos","Captur"],
"Nissan":["Micra","Sunny","Terrano","Kicks","Magnite","X-Trail","Evalia","Teana"],
"Ford":["Figo","Aspire","Fiesta","Classic","Ikon","EcoSport","Freestyle","Endeavour","Fusion"],
"Jeep":["Compass","Meridian","Wrangler","Grand Cherokee"],
"Fiat":["Palio","Punto","Grande Punto","Linea","Avventura","Urban Cross"],
"Chevrolet":["Spark","Beat","Sail","Aveo","Optra","Cruze","Tavera","Enjoy","Captiva","Trailblazer"],
"Datsun":["GO","GO+","redi-GO"],"BMW":[],"Mercedes-Benz":[],"Audi":[],"Volvo":[],"Land Rover":[]},
bike:{
"India Yamaha Motor Pvt Ltd":["RX100","RX135","RX-Z","Crux","Libero","Gladiator","SZ","SZ-RR","Saluto","Saluto RX","FZ16","FZ-FI","FZ-S","FZ-S FI","FZ-S FI V2","FZ-S FI V3","FZ-S FI V4","FZ-X","Fazer","Fazer 25","FZ25","MT-15","MT-15 V2","R15","R15 V2","R15 V3","R15 V4","R15S","R15M","Aerox 155","Ray","Ray Z","RayZR 125","Fascino","Fascino 125"],
"Hero MotoCorp":["CD100","CD Dawn","CD Deluxe","Splendor","Splendor Plus","Splendor+ XTEC","Splendor iSmart","Super Splendor","Super Splendor XTEC","HF Dawn","HF Deluxe","HF 100","Passion","Passion Plus","Passion Pro","Glamour","Glamour XTEC","Glamour X","Achiever","Hunk","Xtreme","Xtreme Sports","Xtreme 125R","Xtreme 160R","Xtreme 160R 4V","Xtreme 250R","Xpulse 200","Xpulse 200 4V","Xpulse 210","Xpulse 200T","Karizma","Karizma ZMR","Karizma XMR","Mavrick 440","Pleasure","Pleasure Plus","Maestro","Maestro Edge","Destini 125","Destini 110","Xoom 110","Xoom 125","Xoom 160","Vida V1","Vida V2"],
"Honda Motorcycle & Scooter India":["Activa","Activa 3G","Activa 4G","Activa 5G","Activa 6G","Activa110","Activa125","Dio","Dio 110","Dio125","Aviator","Grazia","Eterno","Shine","Shine100","Shine125","Livo","Dream Neo","Dream Yuga","CD 110 Dream","SP125","SP160","Unicorn","CB Unicorn 160","Hornet 160R","Hornet2.0","CB125 Hornet","CB Trigger","CB Twister","CBF Stunner","X-Blade","NX200","CB200X","CB300F","CB300R","H'ness CB350","CB350","CB350RS","CB350C","NX500","XL750 Transalp","CB750 Hornet","CB1000 Hornet SP","Gold Wing Tour"],
"Bajaj Auto":["Boxer","Caliber","CT100","CT110","CT 110X","Discover 100","Discover 110","Discover 125","Discover 135","Platina 100","Platina 110","Pulsar 125","Pulsar 135 LS","Pulsar 150","Pulsar 180","Pulsar 200 DTS-i","Pulsar 220F","Pulsar NS125","Pulsar NS160","Pulsar NS200","Pulsar NS400Z","Pulsar N125","Pulsar N150","Pulsar N160","Pulsar N250","Pulsar RS200","Avenger 150","Avenger 160 Street","Avenger 180","Avenger 220 Street","Avenger 220 Cruise","Dominar 250","Dominar 400","V15","V12","Freedom 125","Chetak"],
"TVS Motor":["XL Super","XL100","Sport","Star","Star City","Star City+","Victor","Centra","Flame","Jive","Radeon","Raider","Ronin","Apache RTR 160","Apache RTR 160 4V","Apache RTR 180","Apache RTR 200 4V","Apache RTR 310","Apache RR 310","Apache RTX","Scooty","Scooty Pep+","Scooty Zest 110","Wego","Jupiter","Jupiter 125","Ntorq 125","iQube"],
"Royal Enfield":["Bullet 350","Bullet 500","Electra","Thunderbird 350","Thunderbird 500","Thunderbird X 350","Thunderbird X 500","Classic 350","Classic 500","Hunter 350","Meteor 350","Himalayan","Himalayan 450","Scram 411","Scram 440","Guerrilla 450","Interceptor 650","Continental GT 535","Continental GT 650","Super Meteor 650","Shotgun 650","Classic 650","Bear 650"],
"Suzuki Motorcycle India":["Access 125","Burgman Street","Avenis","Swish 125","Let's","Hayate","Slingshot","Gixxer","Gixxer SF","Gixxer 250","Gixxer SF 250","V-Strom SX","V-Strom 800DE","Katana","Hayabusa"],
"KTM India":["125 Duke","200 Duke","250 Duke","390 Duke","RC 125","RC 200","RC 390","250 Adventure","390 Adventure","390 Adventure X","390 Enduro R"],
"Jawa":["Jawa","Jawa 42","42 FJ","42 Bobber","Perak","350"],"Yezdi":["Roadster","Scrambler","Adventure"],
"Kawasaki":["Ninja 300","Ninja 400","Ninja 500","Ninja 650","Ninja ZX-4R","Ninja ZX-6R","Ninja ZX-10R","Z650","Z900","Versys 650","Versys 1100","Eliminator"],
"Triumph":["Speed 400","Scrambler 400 X","Speed T4","Trident 660","Tiger Sport 660","Tiger 900","Street Triple","Bonneville T100","Bonneville T120"],
"BMW Motorrad":["G 310 R","G 310 GS","G 310 RR","F 900 GS","F 900 XR","S 1000 RR","R 1300 GS"],
"Aprilia":["SR 125","SR 150","SR 160","SXR 125","SXR 160","RS 457","Tuono 457"],"Vespa":["VXL 125","VXL 150","SXL 125","SXL 150","ZX 125","Elegante","Racing Sixties"],
"Ather Energy":["450","450X","450S","Rizta"],"Ola Electric":["S1","S1 Pro","S1 Air","S1 X"],"Revolt Motors":["RV400","RV1"],"Harley-Davidson":["X440","X440 T"]},
auto:{"Bajaj Auto":["RE","Maxima Z","Maxima X Wide","Maxima C","Qute","WEGO P50","WEGO P70","WEGO P9018","WEGO C90","Riki P4005","Riki C4005","GoGo P50","GoGo P70"],"Piaggio":["Ape Auto Classic","Ape NXT+","Ape Metro","Ape Auto Bada","Ape Auto DXL","Ape Auto+","Ape City","Ape City+","Ape Xtra","Ape E-City","Ape E-Xtra"],"Mahindra":["Treo","Treo Plus","Treo Yaari","Zor Grand","Alfa","e-Alfa"]},
cv:{
"Tata Motors":["Ace","Ace Gold","Ace EV","Intra V10","Intra V20","Intra V30","Intra V50","Yodha","Yodha 2.0","Winger","Magic Express","407 Gold SFC","510 SFC TT","610 SFC","709 SFC","710 SFC","712 SFC","912 LPK","912 SFC","1012 LPT","1109g LPT","1212 LPT","1412 LPT","1512 LPT","1612g LPT","1916 LPT","Ultra T.7","Ultra T.9","Ultra T.11","Ultra T.12","Ultra T.16","Signa 1923.K","Signa 2823.K","Signa 3525.K","Prima 3530.K","Prima 5530.S"],
"Ashok Leyland":["Dost","Dost+","Bada Dost i2","Bada Dost i3","Bada Dost i4","Partner","MiTR","Saathi","Boss 1115","Boss 1315","Boss 1415","Ecomet 1015","Ecomet 1215","Ecomet 1415","Ecomet 1615","Ecomet 1915","AVTR 1920","AVTR 2820","AVTR 3520","AVTR 4220","AVTR 4825","AVTR 5525"],
"Eicher":["Pro 2049","Pro 2050","Pro 2055","Pro 2059","Pro 2065","Pro 2075","Pro 2080XP","Pro 2090","Pro 2095XP","Pro 2110","Pro 2114XP","Pro 3015","Pro 3019","Pro 3020","Pro 3016","Pro 6019XPT","Pro 6028T","Pro 6035T","Pro 6048XP","Pro 6055XP"],
"Mahindra":["Jeeto","Supro Profit Truck","Bolero Maxx Pik-Up","Bolero Pik-Up","Bolero Camper","Veero","Furio 7","Furio 11","Furio 12","Furio 14","Furio 16","Blazo X 28","Blazo X 35","Blazo X 42","Blazo X 48","Blazo X 55"],
"BharatBenz":["1015R","1215R","1415R","1617R","1917R","2823R","3528C","3532CM","4228R","4828R","5532T"],
"Force Motors":["Traveller","Urbania","Trax Cruiser","Trax Toofan","Trump 40","Shaktiman 400"],"SML Isuzu":["Supreme GS","Sartaj GS","Samrat GS","Prestige GS","Hiroi School Bus","Executive LX Coach"]},
fe:{
"Mahindra Tractors":["Yuvraj 215 NXT","Jivo 225 DI","Jivo 245 DI","Jivo 305 DI","OJA 2121","OJA 2124","OJA 2127","OJA 2130","OJA 3132","OJA 3136","OJA 3140","OJA 3140 4WD","265 DI","275 DI TU","475 DI","575 DI","575 DI MS","585 DI","Arjun 555 DI","Arjun 605 DI","Arjun 605 DI-i","Novo 605 DI","Novo 655 DI","Novo 755 DI","YUVO TECH+ 405","YUVO TECH+ 415","YUVO TECH+ 475","YUVO TECH+ 575","SP PLUS 275","SP PLUS 475","SP PLUS 575","XP PLUS 265","XP PLUS 275","XP PLUS 475","XP PLUS 575"],
"Swaraj":["717","724 XM","724 XM Orchard","735 FE","735 XT","742 XT","744 FE","744 XT","855 FE","963 FE"],
"Massey Ferguson":["1035 DI","1035 DI Dost","241 DI","241 DI Maha Shakti","244 DI Dynatrack","245 DI","246 DI Dynatrack","9500","9500 Smart","9500 E","9563 Smart","2635 4WD","6028 MaxPro","7235 DI"],
"TAFE":["30 DI Orchard Plus","30 DI Super Plus","5900 DI","6515","7515","8515"],
"Eicher Tractors":["188","242","280","333","368","380","485","551","557","5660","650","650 Prima G3"],
"Sonalika":["DI-730 II HDM FE","DI-35 HDM PP","DI-42 HDM PP","DI-42 HDM+","DI-47 RX","DI-47 HDM+","DI-50 HDM+","DI-55 HDM","DI-60 HDM Torque Plus","DI-75 4WD CRDS S1","DI-740 III HDM","DI-745 III HDM+","DI-745 III Power Plus"],
"John Deere":["3028EN","3036EN","3036E","5036D","5039D PowerPro","5042D PowerPro","5042D GearPro PowerPro","5045D PowerPro","5045D GearPro","5050D","5050D GearPro","5105","5105 GearPro","5210 GearPro","5310 PowerTech","5405 PowerTech","5075E PowerTech","5130M"],
"New Holland":["Simba 20","3032 NX","3037 TX","3230 TX","3630 TX","3600-2 TX","4710","5620 TX","5630 TX","Excel 4710","Excel 5510","Excel 6010","Excel 8010"],
"Kubota":["NeoStar A211N","NeoStar B2441","MU4501","MU5501","MU5502","M7040","M7172"],"Deutz-Fahr":["Agrolux 45","Agrolux 50","Agromaxx 4045 E","Agromaxx 4050 E","Agromaxx 4055 E","Agromaxx 4060 E","Agromaxx 55","Agromaxx 60","Agromaxx 65","Agromaxx 70"]},
ce:{"JCB":[],"Tata Hitachi":[],"CASE Construction":[],"Caterpillar":[],"Komatsu":[],"Volvo Construction Equipment":[],"Mahindra Construction Equipment":[],"SANY":[]}
};
export function categoryMakes(category:VehicleCategory){return Object.keys(CATEGORY_CATALOG[category])}
export function categoryModels(category:VehicleCategory,make:string){return CATEGORY_CATALOG[category][make]||[]}
