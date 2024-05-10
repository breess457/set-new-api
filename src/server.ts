import express, { Request, Response } from "express";
import axios from "axios";


const app = express();
let ApiData:any = null;

app.use((async (req:Request,res:Response, next:Function)=>{
    try{
        const response = await axios.get('https://dummyjson.com/users')
        ApiData = response.data
        next()
    }catch(err){
        console.error('Error fetching data from API:', err);
        res.status(500).send('Internal Server Error');
    }
}))

function findSex(data:any){
  const genderMap:any = {}
  const ageMap:number[] = []
  const hairMap:any = {}
  const addressUser:any = {}
  
  Object.keys(data).forEach((key:any)=>{

    const {gender,age,hair,firstName,lastName,company} = data[key]
    const fullname = `${firstName} ${lastName}`
    addressUser[fullname] = company.address.postalCode
    
    ageMap.push(age)

    if(hairMap[hair.color]){
      hairMap[hair.color]++
    }else{
      hairMap[hair.color] = 1
    }

    if(genderMap[gender]){
      genderMap[gender]++
    }else{
      genderMap[gender] = 1
    }
  })

   const result = {
      male : genderMap.male ? genderMap.male : 0,
      female : genderMap.female ? genderMap.female : 0,
      ageRange : `${Math.min(...ageMap)} - ${Math.max(...ageMap)}`,
      hair : hairMap,
      addressUser : addressUser
    }
    return result

}

app.get("/", (req:Request, res:Response) => {
  if(req.method === "GET" && req.path === "/"){
    const setDepartment:any = {}
    ApiData.users.forEach((user:any) => {
          const departments = user.company.department
          if(!setDepartment[departments]){
              setDepartment[departments] = []
          }
          setDepartment[departments].push(user)
    });

    const sortedDepartment = Object.keys(setDepartment).sort()
    
    const resultSucc = sortedDepartment.reduce((acc:any, department:string)=>{
      
      const getResult:any =  findSex(setDepartment[department])
      acc[department] = getResult
      return acc
    },{})
    res.json(resultSucc);
  }
});

app.listen(8082, () => console.log("Server is running..."));