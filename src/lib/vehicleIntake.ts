export const REQUIRED_PHOTOS=[
 {type:"front",label:"Front"},{type:"left_side",label:"Left Side"},{type:"right_side",label:"Right Side"},{type:"rear",label:"Rear"},{type:"roof",label:"Roof / Upper"},{type:"engine",label:"Engine Bay"},{type:"odometer",label:"Odometer / Meter Reading"},{type:"front_interior",label:"Front Interior"},{type:"rear_interior",label:"Rear Interior"},{type:"front_left_tyre",label:"Front Left Tyre",tyre:true},{type:"front_right_tyre",label:"Front Right Tyre",tyre:true},{type:"rear_left_tyre",label:"Rear Left Tyre",tyre:true},{type:"rear_right_tyre",label:"Rear Right Tyre",tyre:true}
] as const;
export const REQUIRED_DOCUMENTS=["rc","insurance","pucc","vehicle_release"] as const;
export const WORKFLOW={DRAFT:"draft",MANAGEMENT_REVIEW:"management_review",CORRECTION_REQUIRED:"correction_required",APPROVED:"approved"} as const;
export function tyrePercentValid(value:number|null|undefined){return typeof value==="number"&&value>=0&&value<=100}
export function managementCanEdit(role?:string){return role==="director"||role==="ceo"||role==="admin"}
