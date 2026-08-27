export type VehicleCategory="car"|"bike"|"auto"|"cv"|"fe"|"ce";
export const VEHICLE_CATEGORIES=[
{key:"car",label:"Add a Car",icon:"🚗",description:"Passenger cars & SUVs"},
{key:"bike",label:"Add a Bike",icon:"🏍️",description:"Motorcycles & scooters"},
{key:"auto",label:"Add an Auto",icon:"🛺",description:"Passenger & cargo three-wheelers"},
{key:"cv",label:"Add a CV",icon:"🚚",description:"Commercial vehicles"},
{key:"fe",label:"Add an FE",icon:"🚜",description:"Farm equipment & tractors"},
{key:"ce",label:"Add a CE",icon:"🚧",description:"Construction equipment"},
] as const;
export const CATEGORY_CATALOG:Record<VehicleCategory,Record<string,string[]>>={
car:{"Maruti Suzuki":["Alto K10","S-Presso","Celerio","Wagon R","Swift","Dzire","Baleno","Fronx","Brezza","Ertiga","XL6","Grand Vitara","Jimny","Invicto"],Hyundai:["Grand i10 Nios","i20","Aura","Exter","Venue","Creta","Verna","Alcazar","Tucson"],Tata:["Tiago","Tigor","Altroz","Punch","Nexon","Curvv","Harrier","Safari"],Mahindra:["XUV 3XO","Thar","Thar Roxx","Scorpio Classic","Scorpio-N","XUV700","Bolero","Bolero Neo"],Toyota:["Glanza","Taisor","Rumion","Urban Cruiser Hyryder","Innova Crysta","Innova Hycross","Fortuner","Camry","Vellfire"],Honda:["Amaze","City","Elevate"],Kia:["Sonet","Syros","Seltos","Carens","Carnival","EV6","EV9"],Skoda:["Kylaq","Kushaq","Slavia","Kodiaq"],Volkswagen:["Virtus","Taigun","Tiguan"],MG:["Comet EV","Windsor EV","Astor","Hector","Hector Plus","Gloster","ZS EV"],Renault:["Kwid","Kiger","Triber"],Nissan:["Magnite","X-Trail"],Jeep:["Compass","Meridian","Wrangler","Grand Cherokee"],BMW:[],"Mercedes-Benz":[],Audi:[]},
bike:{"India Yamaha Motor Pvt Ltd":["FZ-FI","FZ-S FI","FZ-X","MT-15","R15","Aerox 155","RayZR 125","Fascino 125"],"Hero MotoCorp":["Splendor Plus","HF Deluxe","Passion Plus","Glamour","Xtreme 125R","Xtreme 160R","Karizma XMR","Xpulse 200","Destini 125","Pleasure Plus","Vida V1"],"Honda Motorcycle & Scooter India":["Activa","Activa 125","Dio","Shine 100","Shine 125","SP125","Unicorn","Hornet 2.0","CB350"],"Bajaj Auto":["Pulsar 125","Pulsar 150","Pulsar N150","Pulsar N160","Pulsar NS160","Pulsar NS200","Pulsar N250","Pulsar RS200","Pulsar NS400Z","Dominar 250","Dominar 400","Avenger 220","Platina 100","Platina 110","CT 110X","Freedom 125","Chetak"],"TVS Motor":["Apache RTR 160","Apache RTR 160 4V","Apache RTR 180","Apache RTR 200 4V","Apache RR 310","Apache RTR 310","Raider","Ronin","Radeon","Sport","Star City+","Jupiter","Ntorq","iQube"],"Royal Enfield":["Bullet 350","Classic 350","Hunter 350","Meteor 350","Himalayan 450","Guerrilla 450","Scram 440","Interceptor 650","Continental GT 650","Super Meteor 650","Shotgun 650","Classic 650","Bear 650"]},
auto:{"Bajaj Auto":["RE","Maxima Z","Maxima X Wide","Maxima C","Qute","WEGO P50","WEGO P70","WEGO P9018","WEGO C90","Riki P4005","Riki C4005","GoGo P50","GoGo P70"],Piaggio:["Ape Auto Classic","Ape NXT+","Ape Metro","Ape Auto Bada","Ape Auto DXL","Ape Auto+","Ape City","Ape City+","Ape Xtra","Ape E-City","Ape E-Xtra"],Mahindra:["Treo","Treo Plus","Treo Yaari","Zor Grand","Alfa","e-Alfa"]},
cv:{"Tata Motors":[],"Ashok Leyland":[],"VE Commercial Vehicles (Eicher)":[],"Mahindra":[],"Force Motors":[],"SML Isuzu":[],"BharatBenz":[]},
fe:{"Mahindra Tractors":[],Swaraj:[],"TAFE / Massey Ferguson":[],Sonalika:[],"John Deere":[],"New Holland":[],Kubota:[],Deutz-Fahr:[]},
ce:{JCB:[],"Tata Hitachi":[],"CASE Construction":[],Caterpillar:[],Komatsu:[],"Volvo Construction Equipment":[],"Mahindra Construction Equipment":[],"SANY":[]}
};
export function categoryMakes(category:VehicleCategory){return Object.keys(CATEGORY_CATALOG[category])}
export function categoryModels(category:VehicleCategory,make:string){return CATEGORY_CATALOG[category][make]||[]}
