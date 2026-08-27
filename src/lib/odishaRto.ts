export const ODISHA_RTO_AUTHORITIES = [
  ["OD-01","Balasore"],["OD-02","Bhubaneswar-I"],["OD-03","Balangir"],["OD-04","Chandikhol"],["OD-05","Cuttack"],["OD-06","Dhenkanal"],["OD-07","Ganjam"],["OD-08","Kalahandi"],["OD-09","Keonjhar"],["OD-10","Koraput"],["OD-11","Mayurbhanj"],["OD-12","Phulbani"],["OD-13","Puri"],["OD-14","Rourkela"],["OD-15","Sambalpur"],["OD-16","Sundergarh"],["OD-17","Bargarh"],["OD-18","Rayagada"],["OD-19","Anugul"],["OD-20","Gajapati"],["OD-21","Jagatsinghpur"],["OD-22","Bhadrak"],["OD-23","Jharsuguda"],["OD-24","Nabarangpur"],["OD-25","Nayagarh"],["OD-26","Nuapada"],["OD-27","Boudh"],["OD-28","Deogarh"],["OD-29","Kendrapara"],["OD-30","Malkangiri"],["OD-31","Sonepur"],["OD-32","Bhanjanagar"],["OD-33","Bhubaneswar-II"],["OD-34","Jajpur"],["OD-35","Talcher"]
] as const;

export const ODISHA_RTO_OPTIONS = ODISHA_RTO_AUTHORITIES.map(([code,name])=>`${code} ${name}`);

export function inferOdishaRto(registrationNumber:string){
  const normalized=registrationNumber.toUpperCase().replace(/\s|-/g,"");
  const match=normalized.match(/^OD(\d{2})/);
  if(!match)return"";
  const code=`OD-${match[1]}`;
  const found=ODISHA_RTO_AUTHORITIES.find(([c])=>c===code);
  return found?`${found[0]} ${found[1]}`:"";
}
