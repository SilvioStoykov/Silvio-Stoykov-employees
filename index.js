/*Importing the needed modules and libraries*/
const pp = document.createElement("script"); //importing PapaParse
pp.src = "node_modules/papaparse.js"; 
const momentPackage = document.createElement("script") //importing momentjs
momentPackage.src = "node_modules/moment/moment.js"


const inputFileFromSystem = document.querySelector('#fileInput')
const uploadFile = document.querySelector('#fileUpload')
const selectDateFormat = document.querySelector('#date-formats')

/*Runner function*/
function start(){
    uploadFile.addEventListener('click', displayPairs)
}

start()

/*ReadCSV() reads the file from the file system and parses it to JSON using the PapaParse library
As the parsing function is asyncronous, ReadCSV() uses a Promise. */
function readCSV(){
    return new Promise((resolve, reject)=>{
        Papa.parse(inputFileFromSystem.files[0], //As there is only one file input, there is no possibility of getting more than one file                                                 from the file system and thus we are getting the only file that is being returned*/
            {
                download: true, //downloading the file content
                header: true, //specifying that the file contains a header row
                skipEmptyLines: true, 
                complete: (results)=>{
                    resolve(results) //passing the content of the file if the promise is resolved
                },
                error: (error)=>{
                    reject(error)
                }
            })
    })
}

/*The findPairs() function receives the JSON-ified data from the file
and appends all of the pairs of employees that have worked together on the
same projects to an array that is being returned.*/
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

/*The daysWorkedCalculation() function calculates the number of days that a pair has worked on the same project
and afterwards sort the pairs in descending order by the number of days.
The function uses moment.js library to unify the date formats based on the preffered user date format.*/
async function daysWorkedCalculation(){
    
    const pair = await findPairs()
    const pairsWorking = []
    
    /*The actual date formatting happens here, making use of the ternary operator to determine
    if the passed date is an actual one or a NULL (which means today).*/
    for(let i = 0; i < pair.length; i++){
        const startDateID1 = pair[i].dateStartID1 && pair[i].dateStartID1 !== ' NULL' || pair[i].dateStartID1 !== null ? 
        moment(pair[i].dateStartID1).format(selectDateFormat.value): moment().format(selectDateFormat.value)
        const startDateID2 = pair[i].dateStartID2 && pair[i].dateStartID2 != ' NULL' || pair[i].dateStartID1 !== null? moment(pair[i].dateStartID2).format(selectDateFormat.value):moment().format(selectDateFormat.value.toString())
        const endDateID1 = pair[i].dateEndID1 && pair[i].dateEndID1 != ' NULL' || pair[i].dateStartID1 != null ?  moment(pair[i].dateEndID1).format(selectDateFormat.value):moment().format(selectDateFormat.value.toString())
        const endDateID2 = pair[i].dateEndID2 && pair[i].dateEndID2 != ' NULL' || pair[i].dateStartID1 != null? moment(pair[i].dateEndID2).format(selectDateFormat.value):moment().format(selectDateFormat.value.toString)


        /*The formula for calculating the difference between overlapping time intervals 
        is implemented here.*/
        const overlapStart = parseInt(Math.max(moment(startDateID1).valueOf(), moment(startDateID2).valueOf())) 
        const overlapEnd = parseInt(Math.min(moment(endDateID1).valueOf(), moment(endDateID2).valueOf()))
        if(overlapStart <= overlapEnd){
            let overlapDays = Math.floor((overlapEnd - overlapStart)/ (24 * 60 * 60 * 1000) + 1)
            pair[i].daysWorked += overlapDays
            pairsWorking.push(new Object({empID1: Number(pair[i].empID1), empID2: Number(pair[i].empID2), projectID: Number(pair[i].projectID), daysWorked: pair[i].daysWorked}))
        }
        else{
            pair[i].daysWorked = null
        }
    }
    
    /*Sorting the pairs by the days they have worked 
    together on the same project in ascending order.*/
    pairsWorking.sort((a,b)=>b.daysWorked-a.daysWorked)
    return pairsWorking
}

/*The displayPairs() function displays the sorted pairs in a tabular form.*/
async function displayPairs(){
    const data = await daysWorkedCalculation()
    const table = document.querySelector('#data-grid')

    data.forEach(element => {
        const row = document.createElement('tr')
        row.innerHTML =`<td>${element.empID1}</td>
                        <td>${element.empID2}</td>
                        <td>${element.projectID}</td>
                        <td>${element.daysWorked}</td>`
        table.appendChild(row)
    });
}