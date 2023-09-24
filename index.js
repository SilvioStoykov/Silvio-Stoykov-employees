/*
    1. Read the CSV file selected by the user via the file dialog
        1.0 Reading the CSV file using the csv-parse node module
        1.1 The CSV file has the format of: EmpID, ProjectID, DateFrom, DateTo
        1.2 Sample data: 143, 12, 2013-11-01, 2014-01-05
                         218, 10, 2012-05-16, NULL(today)
                         143, 10, 2009-01-01, 2011-04-27
    
    2. The output must be displayed in the following form:
        EmployeeID#1, EmployeeID#2, ProjectID, DaysWorked
        2.1. The program must display the pair of employees that have spent most time on one project
        2.2  Look-up for repeating ProjectIDs and compare their EmpID. If they are different, put them into an array.     
*/



/*Importing the PapaParse node module*/
const pp = document.createElement("script"); 
pp.src = "node_modules/papaparse.js"; 

const momentPackage = document.createElement("script")
momentPackage.src = "node_modules/moment/moment.js"

const inputFileFromSystem = document.querySelector('#fileInput')
const uploadFile = document.querySelector('#fileUpload')
const selectDateFormat = document.querySelector('#date-formats')

uploadFile.addEventListener('click', daysWorkedCalculation) //findPairs
/*The CSV file is being read and parsed to JSON using the 
PapaParse.js module*/
function readCSV(){
    const workAssignments = []
    const employees = []
    /*Papa.parse returns its results asyncronously and Promise is needed
    so the results array can be passed to other functions*/
    return new Promise((resolve, reject)=>{
        Papa.parse(inputFileFromSystem.files[0], //As there is only one file input, there is no possibility of getting more than one file                                                 from the file system and thus we are getting the only file that is being returned*/
            {
                download: true,
                header: true, //specifying that the file contains a header
                skipEmptyLines: true,
                complete: (results)=>{
                    resolve(results)
                },
                error: (error)=>{
                    reject(error)
                }
            })
    })
}

async function findPairs(){
    let pair = []
    const data = await readCSV()
    const employeesArray = await data.data

    for(let i = 0; i < employeesArray.length-1; i++){
        for(let j = i+1; j < employeesArray.length; j++){
            if(parseInt(employeesArray[i]["ProjectID"]) === parseInt(employeesArray[j]["ProjectID"]) && parseInt(employeesArray[i].EmpID) !== parseInt(employeesArray[j].EmpID)){
                pair.push(new Object({empID1: employeesArray[i].EmpID, dateStartID1: employeesArray[i][" DateFrom"], dateEndID1: employeesArray[i][" DateTo"], empID2: employeesArray[j].EmpID, dateStartID2: employeesArray[j][" DateFrom"], dateEndID2: employeesArray[j][" DateTo"], daysWorked: null, projectID: employeesArray[i]["ProjectID"]}))
            }
        }
    }
    return pair
}

async function daysWorkedCalculation(){
    
    const pair = await findPairs()
    const pairsWorking = []
 
    for(let i = 0; i < pair.length; i++){
        const startDateID1 = pair[i].dateStartID1 && pair[i].dateStartID1 !== ' NULL'? new Date(pair[i].dateStartID1): new Date(Date.now)
        const startDateID2 = pair[i].dateStartID2 && pair[i].dateStartID2 != ' NULL'? new Date(pair[i].dateStartID2):Date()
        const endDateID1 = pair[i].dateEndID1 && pair[i].dateEndID1 != ' NULL'? new Date(pair[i].dateEndID1):new Date()
        console.log(endDateID1)
        const endDateID2 = pair[i].dateEndID2 && pair[i].dateEndID2 != ' NULL'? new Date(pair[i].dateEndID2):new Date()
        console.log(endDateID2)

        const overlapStart = Math.max(startDateID1.getTime(), startDateID2.getTime()) 
        const overlapEnd = Math.min(endDateID1.getTime(), endDateID2.getTime())
        
        if(overlapStart <= overlapEnd){
            let overlapDays = Math.floor((overlapEnd - overlapStart)/ (24 * 60 * 60 * 1000) + 1)
            pair[i].daysWorked += overlapDays
            pairsWorking.push(new Object({empID1: Number(pair[i].empID1), empID2: Number(pair[i].empID2), projectID: Number(pair[i].projectID), daysWorked: pair[i].daysWorked}))
        }
        else{
            pair[i].daysWorked = null
        }
    }
    
    pairsWorking.sort((a,b)=>b.daysWorked-a.daysWorked)
    console.log(pairsWorking)
    console.log(pair)
    return pairsWorking
}